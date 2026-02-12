import express from 'express';
import sql from 'mssql';
import { getPool } from '../configure.js';

const router = express.Router();

// POST /api/orders - 새 주문 생성
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    
    // 입력 검증
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '주문 아이템이 필요합니다.'
        }
      });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '주문 금액이 올바르지 않습니다.'
        }
      });
    }
    
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // 주문 생성
      const orderRequest = new sql.Request(transaction);
      const orderResult = await orderRequest
        .input('totalAmount', sql.Decimal(10, 2), totalAmount)
        .query(`
          INSERT INTO orders (order_date, total_amount, status)
          OUTPUT INSERTED.id, INSERTED.order_date, INSERTED.status, INSERTED.total_amount
          VALUES (GETDATE(), @totalAmount, N'대기')
        `);
      
      const order = orderResult.recordset[0];
      
      // 주문 아이템 및 옵션 저장
      for (const item of items) {
        const { productId, productName, quantity, price, options = [] } = item;
        
        // 제품 정보 조회
        const productRequest = new sql.Request(transaction);
        const productResult = await productRequest
          .input('productId', sql.Int, productId)
          .query('SELECT name, price FROM products WHERE id = @productId');
        
        if (productResult.recordset.length === 0) {
          throw new Error(`제품을 찾을 수 없습니다: productId=${productId}`);
        }
        
        const basePrice = productResult.recordset[0].price || price / quantity;
        
        // 주문 아이템 저장
        const itemRequest = new sql.Request(transaction);
        const itemResult = await itemRequest
          .input('orderId', sql.Int, order.id)
          .input('productId', sql.Int, productId)
          .input('productName', sql.NVarChar(100), productName || productResult.recordset[0].name)
          .input('quantity', sql.Int, quantity)
          .input('basePrice', sql.Decimal(10, 2), basePrice)
          .input('itemTotalPrice', sql.Decimal(10, 2), price)
          .query(`
            INSERT INTO order_items (order_id, product_id, product_name, quantity, base_price, item_total_price)
            OUTPUT INSERTED.id
            VALUES (@orderId, @productId, @productName, @quantity, @basePrice, @itemTotalPrice)
          `);
        
        const orderItemId = itemResult.recordset[0].id;
        
        // 주문 아이템 옵션 저장
        for (const option of options) {
          const optionId = typeof option === 'object' ? (option.optionId || null) : (option || null);
          const optionName = typeof option === 'object' ? option.optionName : null;
          const optionPrice = typeof option === 'object' ? (option.optionPrice || 0) : 0;
          
          // 옵션 이름과 가격 조회
          let finalOptionName = optionName;
          let finalOptionPrice = optionPrice;
          
          // optionId가 있고, 옵션 이름이나 가격이 없으면 DB에서 조회
          if (optionId && (!finalOptionName || finalOptionPrice === undefined)) {
            const optionRequest = new sql.Request(transaction);
            const optionResult = await optionRequest
              .input('optionId', sql.Int, optionId)
              .query('SELECT name, price FROM product_options WHERE id = @optionId');
            
            if (optionResult.recordset.length > 0) {
              finalOptionName = finalOptionName || optionResult.recordset[0].name;
              finalOptionPrice = finalOptionPrice !== undefined ? finalOptionPrice : optionResult.recordset[0].price;
            }
          }
          
          // 옵션 이름이 없으면 저장하지 않음
          if (!finalOptionName) {
            console.warn('옵션 이름이 없어서 저장하지 않습니다:', option);
            continue;
          }
          
          const optionInsertRequest = new sql.Request(transaction);
          await optionInsertRequest
            .input('orderItemId', sql.Int, orderItemId)
            .input('optionId', sql.Int, optionId)
            .input('optionName', sql.NVarChar(100), finalOptionName)
            .input('optionPrice', sql.Decimal(10, 2), finalOptionPrice)
            .query(`
              INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
              VALUES (@orderItemId, @optionId, @optionName, @optionPrice)
            `);
        }
      }
      
      await transaction.commit();
      
      // 생성된 주문 정보 조회
      const orderDetail = await getOrderDetail(pool, order.id);
      
      res.status(201).json({
        success: true,
        data: orderDetail
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('주문 생성 오류:', error);
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 생성 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
});

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status, excludeCompleted } = req.query;
    const pool = await getPool();
    
    let query = `
      SELECT id, order_date as orderDate, total_amount as totalAmount, status
      FROM orders
      WHERE 1=1
    `;
    
    if (status) {
      query += ` AND status = N'${status}'`;
    }
    
    if (excludeCompleted === 'true') {
      query += ` AND status != N'제조완료'`;
    }
    
    query += ` ORDER BY order_date DESC`;
    
    const result = await pool.request().query(query);
    
    // 각 주문의 상세 정보 조회
    const orders = await Promise.all(
      result.recordset.map(order => getOrderDetail(pool, order.id))
    );
    
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('주문 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 목록을 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/orders/:id - 특정 주문 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    const order = await getOrderDetail(pool, parseInt(id));
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '주문을 찾을 수 없습니다.'
        }
      });
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문을 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

// PATCH /api/orders/:id/status - 주문 상태 변경
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // 상태 검증
    const validStatuses = ['대기', '주문접수', '제조중', '제조완료'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '올바르지 않은 주문 상태입니다.'
        }
      });
    }
    
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // 주문 상태 업데이트
      const updateRequest = new sql.Request(transaction);
      await updateRequest
        .input('id', sql.Int, parseInt(id))
        .input('status', sql.NVarChar(20), status)
        .query(`
          UPDATE orders
          SET status = @status, updated_at = GETDATE()
          WHERE id = @id
        `);
      
      // 제조완료로 변경 시 재고 차감
      if (status === '제조완료') {
        // 주문 아이템 조회
        const itemsRequest = new sql.Request(transaction);
        const itemsResult = await itemsRequest
          .input('orderId', sql.Int, parseInt(id))
          .query(`
            SELECT product_id, quantity
            FROM order_items
            WHERE order_id = @orderId
          `);
        
        // 각 아이템의 재고 차감
        for (const item of itemsResult.recordset) {
          const stockRequest = new sql.Request(transaction);
          await stockRequest
            .input('productId', sql.Int, item.product_id)
            .input('quantity', sql.Int, item.quantity)
            .query(`
              UPDATE inventory
              SET stock = CASE 
                WHEN stock >= @quantity THEN stock - @quantity
                ELSE 0
              END,
              updated_at = GETDATE()
              WHERE product_id = @productId
            `);
        }
      }
      
      await transaction.commit();
      
      // 업데이트된 주문 정보 조회
      const order = await getOrderDetail(pool, parseInt(id));
      
      res.json({
        success: true,
        data: order
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('주문 상태 변경 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '주문 상태 변경 중 오류가 발생했습니다.'
      }
    });
  }
});

// 주문 상세 정보 조회 헬퍼 함수 (admin 부분 갱신 API에서도 사용)
export async function getOrderDetail(pool, orderId) {
  try {
    // 주문 기본 정보
    const orderResult = await pool.request()
      .input('orderId', orderId)
      .query(`
        SELECT id, order_date as orderDate, total_amount as totalAmount, status
        FROM orders
        WHERE id = @orderId
      `);
    
    if (orderResult.recordset.length === 0) {
      return null;
    }
    
    const order = orderResult.recordset[0];
    
    // 주문 아이템 조회
    const itemsResult = await pool.request()
      .input('orderId', orderId)
      .query(`
        SELECT id, product_id as productId, product_name as productName, 
               quantity, base_price as basePrice, item_total_price as itemTotalPrice
        FROM order_items
        WHERE order_id = @orderId
      `);
    
    // 각 아이템의 옵션 조회
    const items = await Promise.all(
      itemsResult.recordset.map(async (item) => {
        const optionsResult = await pool.request()
          .input('orderItemId', item.id)
          .query(`
            SELECT option_id as optionId, option_name as optionName, option_price as optionPrice
            FROM order_item_options
            WHERE order_item_id = @orderItemId
          `);
        
        return {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.itemTotalPrice,
          options: optionsResult.recordset.map(opt => ({
            optionId: opt.optionId,
            optionName: opt.optionName,
            optionPrice: opt.optionPrice
          }))
        };
      })
    );
    
    return {
      id: order.id,
      orderId: order.id, // 프론트엔드 호환성
      orderDate: order.orderDate,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount),
      items: items.map(item => ({
        ...item,
        // options를 selectedOptions로도 제공 (프론트엔드 호환성)
        selectedOptions: item.options || []
      }))
    };
  } catch (error) {
    console.error('주문 상세 조회 오류:', error);
    throw error;
  }
}

export default router;

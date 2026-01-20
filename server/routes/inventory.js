import express from 'express';
import { getPool } from '../configure.js';

const router = express.Router();

// GET /api/inventory - 모든 재고 정보 조회
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    
    const result = await pool.request().query(`
      SELECT 
        i.product_id as productId,
        p.name as productName,
        i.stock
      FROM inventory i
      INNER JOIN products p ON i.product_id = p.id
      ORDER BY i.product_id
    `);
    
    res.json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('재고 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '재고 정보를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

// PATCH /api/inventory/:id - 재고 수량 변경
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { change } = req.body;
    
    // 입력 검증
    if (change === undefined || change === null) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '변경할 재고 수량(change)이 필요합니다.'
        }
      });
    }
    
    const pool = await getPool();
    
    // 현재 재고 조회
    const currentResult = await pool.request()
      .input('productId', parseInt(id))
      .query(`
        SELECT stock
        FROM inventory
        WHERE product_id = @productId
      `);
    
    if (currentResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '재고 정보를 찾을 수 없습니다.'
        }
      });
    }
    
    const currentStock = currentResult.recordset[0].stock;
    const newStock = Math.max(0, currentStock + change);
    
    // 재고 업데이트
    await pool.request()
      .input('productId', parseInt(id))
      .input('newStock', newStock)
      .query(`
        UPDATE inventory
        SET stock = @newStock, updated_at = GETDATE()
        WHERE product_id = @productId
      `);
    
    // 제품 이름 조회
    const productResult = await pool.request()
      .input('productId', parseInt(id))
      .query(`
        SELECT name
        FROM products
        WHERE id = @productId
      `);
    
    res.json({
      success: true,
      data: {
        productId: parseInt(id),
        productName: productResult.recordset[0].name,
        stock: newStock
      }
    });
  } catch (error) {
    console.error('재고 수정 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '재고 수정 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;

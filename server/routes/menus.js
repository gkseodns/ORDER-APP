import express from 'express';
import { getPool } from '../configure.js';

const router = express.Router();

// GET /api/menus - 모든 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    
    // 제품 조회
    const productsResult = await pool.request().query(`
      SELECT id, name, price, description, image_url as imageUrl
      FROM products
      ORDER BY id
    `);
    
    // 각 제품의 옵션 조회
    const products = await Promise.all(
      productsResult.recordset.map(async (product) => {
        const optionsResult = await pool.request()
          .input('productId', product.id)
          .query(`
            SELECT id, name, price
            FROM product_options
            WHERE product_id = @productId
            ORDER BY id
          `);
        
        return {
          ...product,
          options: optionsResult.recordset
        };
      })
    );
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('메뉴 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '메뉴 목록을 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

// GET /api/menus/:id - 특정 메뉴 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    
    // 제품 조회
    const productResult = await pool.request()
      .input('id', parseInt(id))
      .query(`
        SELECT id, name, price, description, image_url as imageUrl
        FROM products
        WHERE id = @id
      `);
    
    if (productResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '메뉴를 찾을 수 없습니다.'
        }
      });
    }
    
    const product = productResult.recordset[0];
    
    // 옵션 조회
    const optionsResult = await pool.request()
      .input('productId', product.id)
      .query(`
        SELECT id, name, price
        FROM product_options
        WHERE product_id = @productId
        ORDER BY id
      `);
    
    product.options = optionsResult.recordset;
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '메뉴를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;

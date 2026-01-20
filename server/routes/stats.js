import express from 'express';
import { getPool } from '../configure.js';

const router = express.Router();

// GET /api/stats/dashboard - 대시보드 통계
router.get('/dashboard', async (req, res) => {
  try {
    const pool = await getPool();
    
    // 제조완료되지 않은 주문의 총 수량
    const totalResult = await pool.request().query(`
      SELECT SUM(oi.quantity) as totalQuantity
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status != N'제조완료'
    `);
    
    // 주문 접수 상태인 주문 건수
    const receivedResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE status = N'주문접수'
    `);
    
    // 제조 중 상태인 주문 건수
    const inProgressResult = await pool.request().query(`
      SELECT COUNT(*) as count
      FROM orders
      WHERE status = N'제조중'
    `);
    
    // 제조완료된 주문의 커피 수량 및 주문 건수
    const completedResult = await pool.request().query(`
      SELECT 
        COUNT(DISTINCT o.id) as orderCount,
        SUM(oi.quantity) as quantity
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = N'제조완료'
    `);
    
    const totalOrders = totalResult.recordset[0]?.totalQuantity || 0;
    const receivedOrders = receivedResult.recordset[0]?.count || 0;
    const inProgressOrders = inProgressResult.recordset[0]?.count || 0;
    const completedQuantity = completedResult.recordset[0]?.quantity || 0;
    const completedOrderCount = completedResult.recordset[0]?.orderCount || 0;
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalOrders),
        receivedOrders: parseInt(receivedOrders),
        inProgressOrders: parseInt(inProgressOrders),
        completedOrders: `${completedQuantity} / ${completedOrderCount}`
      }
    });
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '대시보드 통계를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;

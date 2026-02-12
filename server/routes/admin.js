import express from 'express';
import { getPool } from '../configure.js';
import { getOrderDetail } from './orders.js';

const router = express.Router();

/**
 * GET /api/admin/partial
 * 관리자 대시보드 부분 갱신용: 전체현황(stats), 재고현황(inventory), 주문현황(orders)만 한 번에 반환.
 * 페이지 전체 새로고침 없이 숫자/목록만 갱신할 때 사용.
 */
router.get('/partial', async (req, res) => {
  try {
    const pool = await getPool();

    // 1. 대시보드 통계 (전체현황)
    const totalResult = await pool.request().query(`
      SELECT SUM(oi.quantity) as totalQuantity
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status != N'제조완료'
    `);
    const receivedResult = await pool.request().query(`
      SELECT COUNT(*) as count FROM orders WHERE status = N'주문접수'
    `);
    const inProgressResult = await pool.request().query(`
      SELECT COUNT(*) as count FROM orders WHERE status = N'제조중'
    `);
    const completedResult = await pool.request().query(`
      SELECT COUNT(DISTINCT o.id) as orderCount, SUM(oi.quantity) as quantity
      FROM orders o
      INNER JOIN order_items oi ON o.id = oi.order_id
      WHERE o.status = N'제조완료'
    `);

    const stats = {
      totalOrders: parseInt(totalResult.recordset[0]?.totalQuantity || 0),
      receivedOrders: parseInt(receivedResult.recordset[0]?.count || 0),
      inProgressOrders: parseInt(inProgressResult.recordset[0]?.count || 0),
      completedOrders: `${completedResult.recordset[0]?.quantity || 0} / ${completedResult.recordset[0]?.orderCount || 0}`
    };

    // 2. 재고현황
    const invResult = await pool.request().query(`
      SELECT i.product_id as productId, p.name as productName, i.stock
      FROM inventory i
      INNER JOIN products p ON i.product_id = p.id
      ORDER BY i.product_id
    `);
    const inventory = invResult.recordset;

    // 3. 주문현황 (제조완료 제외)
    const ordersResult = await pool.request().query(`
      SELECT id FROM orders WHERE status != N'제조완료' ORDER BY order_date DESC
    `);
    const orders = await Promise.all(
      ordersResult.recordset.map((row) => getOrderDetail(pool, row.id))
    );
    const ordersFiltered = orders.filter(Boolean);

    res.json({
      success: true,
      data: {
        stats,
        inventory,
        orders: ordersFiltered
      }
    });
  } catch (error) {
    console.error('관리자 부분 갱신 API 오류:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '관리자 데이터를 가져오는 중 오류가 발생했습니다.'
      }
    });
  }
});

export default router;

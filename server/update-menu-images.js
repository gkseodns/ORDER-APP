/**
 * 메뉴 이미지 경로 업데이트 스크립트
 * - 아메리카노(ICE) → /americano-ice.jpg
 * - 아메리카노(HOT) → /americano-hot.jpg
 * - 카페라떼 → /caffe-latte.jpg
 */
import { getPool, initializePool, closePool } from './configure.js';

const updates = [
  { name: '아메리카노(ICE)', imageUrl: '/americano-ice.jpg' },
  { name: '아메리카노(HOT)', imageUrl: '/americano-hot.jpg' },
  { name: '카페라떼', imageUrl: '/caffe-latte.jpg' },
];

async function run() {
  console.log('DB 연결 중...');
  try {
    await initializePool();
    const pool = await getPool();
    console.log('연결됨. 이미지 경로 업데이트 실행 중...\n');

    for (const { name, imageUrl } of updates) {
      const result = await pool
        .request()
        .input('name', name)
        .input('imageUrl', imageUrl)
        .query(`
          UPDATE products
          SET image_url = @imageUrl, updated_at = GETDATE()
          WHERE name = @name
        `);
      const affected = result.rowsAffected[0];
      console.log(affected ? `✅ ${name} → ${imageUrl}` : `⚠️ ${name} (해당 행 없음)`);
    }

    console.log('\n메뉴 이미지 경로 업데이트 완료.');
  } catch (err) {
    console.error('오류:', err.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

run();

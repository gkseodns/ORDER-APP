/**
 * SQL 파일 실행 스크립트
 * 사용법: node run-sql-file.js <파일명>
 * 예: node run-sql-file.js update-menu-images.sql
 */
import { initializePool, getPool, closePool } from './configure.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readSQLFile(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, filePath);
  const sqlContent = fs.readFileSync(fullPath, 'utf8');
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => {
      const cleaned = stmt.replace(/--.*$/gm, '').trim();
      return cleaned.length > 0;
    });
  return statements;
}

async function run() {
  const fileName = process.argv[2] || 'update-menu-images.sql';
  try {
    await initializePool();
    const pool = await getPool();
    const statements = readSQLFile(fileName);
    console.log(`실행: ${fileName} (${statements.length}개 문장)\n`);
    for (let i = 0; i < statements.length; i++) {
      await pool.request().query(statements[i]);
      console.log(`✅ ${i + 1}/${statements.length} 실행됨`);
    }
    console.log('\nDB 반영 완료.');
  } catch (err) {
    console.error('오류:', err.message);
    process.exit(1);
  } finally {
    await closePool();
  }
}

run();

import { initializePool, closePool } from './configure.js';
import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SQL 파일 읽기 함수
function readSQLFile(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    const sqlContent = fs.readFileSync(fullPath, 'utf8');
    
    // SQL 파일을 세미콜론으로 구분된 개별 명령어로 분리
    // 주석과 빈 줄을 제거하고 각 명령어를 배열로 반환
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => {
        // 빈 문자열이나 주석만 있는 경우 제외
        const cleaned = stmt.replace(/--.*$/gm, '').trim();
        return cleaned.length > 0;
      });
    
    return statements;
  } catch (error) {
    console.error('SQL 파일 읽기 오류:', error.message);
    throw error;
  }
}

// SQL 명령어 실행 함수
async function executeSQLStatement(pool, statement) {
  try {
    await pool.request().query(statement);
    return true;
  } catch (error) {
    // 일부 오류는 무시 (이미 존재하는 객체)
    const ignoreMessages = [
      'There is already an object named',
      'already exists',
      'Violation of PRIMARY KEY constraint',
      'Violation of UNIQUE KEY constraint'
    ];
    
    const shouldIgnore = ignoreMessages.some(msg => 
      error.message.includes(msg)
    );
    
    if (shouldIgnore) {
      return false; // 건너뛰기
    }
    throw error;
  }
}

// 메인 함수
async function setupDatabase() {
  console.log('데이터베이스 스키마 설정을 시작합니다...\n');
  
  let pool = null;
  
  try {
    // 데이터베이스 연결
    pool = await initializePool();
    console.log('');
    
    // SQL 파일 읽기
    console.log('SQL 스키마 파일을 읽는 중...');
    const statements = readSQLFile('schema.sql');
    console.log(`총 ${statements.length}개의 SQL 명령어를 찾았습니다.\n`);
    
    // 각 명령어 실행
    console.log('테이블 및 인덱스 생성 중...\n');
    let successCount = 0;
    let skipCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 매우 긴 INSERT 문은 특별 처리
      if (statement.includes('INSERT INTO products') && statement.includes('VALUES')) {
        try {
          await pool.request().query(statement);
          successCount++;
          if (statement.includes('INSERT INTO products')) {
            console.log('✅ 제품 데이터 삽입 완료');
          }
        } catch (error) {
          const ignoreMessages = [
            'There is already an object named',
            'already exists',
            'Violation of PRIMARY KEY constraint',
            'Violation of UNIQUE KEY constraint'
          ];
          
          const shouldIgnore = ignoreMessages.some(msg => 
            error.message.includes(msg)
          );
          
          if (shouldIgnore) {
            skipCount++;
            if (statement.includes('INSERT INTO products')) {
              console.log('⚠️  제품 데이터가 이미 존재합니다.');
            }
          } else {
            console.error(`❌ 명령어 ${i + 1} 실행 실패:`, error.message);
            throw error;
          }
        }
      } else {
        try {
          const executed = await executeSQLStatement(pool, statement);
          if (executed) {
            successCount++;
            
            // 특정 명령어에 대한 피드백
            if (statement.toUpperCase().includes('CREATE TABLE')) {
              const tableName = statement.match(/CREATE TABLE\s+(\w+)/i)?.[1];
              if (tableName) {
                console.log(`✅ 테이블 생성: ${tableName}`);
              }
            } else if (statement.toUpperCase().includes('CREATE INDEX')) {
              const indexName = statement.match(/CREATE INDEX\s+(\w+)/i)?.[1];
              if (indexName) {
                console.log(`✅ 인덱스 생성: ${indexName}`);
              }
            } else if (statement.toUpperCase().includes('INSERT INTO')) {
              const tableName = statement.match(/INSERT INTO\s+(\w+)/i)?.[1];
              if (tableName && !tableName.toLowerCase().includes('products')) {
                console.log(`✅ ${tableName} 데이터 삽입 완료`);
              }
            }
          } else {
            skipCount++;
          }
        } catch (error) {
          const ignoreMessages = [
            'There is already an object named',
            'already exists',
            'Violation of PRIMARY KEY constraint',
            'Violation of UNIQUE KEY constraint'
          ];
          
          const shouldIgnore = ignoreMessages.some(msg => 
            error.message.includes(msg)
          );
          
          if (shouldIgnore) {
            skipCount++;
          } else {
            console.error(`❌ 명령어 ${i + 1} 실행 실패:`, error.message);
            console.error('실패한 SQL:', statement.substring(0, 100) + '...');
            throw error;
          }
        }
      }
    }
    
    console.log('\n========================================');
    console.log('✅ 데이터베이스 스키마 설정 완료!');
    console.log(`   성공: ${successCount}개`);
    if (skipCount > 0) {
      console.log(`   건너뜀: ${skipCount}개 (이미 존재)`);
    }
    console.log('========================================\n');
    
    // 데이터 확인
    console.log('생성된 데이터 확인 중...\n');
    const productResult = await pool.request().query('SELECT COUNT(*) as count FROM products');
    const orderResult = await pool.request().query('SELECT COUNT(*) as count FROM orders');
    const inventoryResult = await pool.request().query('SELECT COUNT(*) as count FROM inventory');
    const optionResult = await pool.request().query('SELECT COUNT(*) as count FROM product_options');
    
    console.log(`제품 수: ${productResult.recordset[0].count}개`);
    console.log(`제품 옵션 수: ${optionResult.recordset[0].count}개`);
    console.log(`재고 항목 수: ${inventoryResult.recordset[0].count}개`);
    console.log(`주문 수: ${orderResult.recordset[0].count}개`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ 데이터베이스 스키마 설정 실패:', error.message);
    console.error('');
    console.error('💡 해결 방법:');
    console.error('   1. 데이터베이스 연결 정보를 확인하세요.');
    console.error('   2. .env 파일의 설정이 올바른지 확인하세요.');
    console.error('   3. 데이터베이스에 충분한 권한이 있는지 확인하세요.');
    console.error('');
    process.exit(1);
  } finally {
    // 연결 종료
    if (pool) {
      await closePool();
    }
  }
}

// 스크립트 실행
setupDatabase();

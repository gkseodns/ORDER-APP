import dotenv from 'dotenv';
import sql from 'mssql';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수 로드 (.env 파일 명시적 지정)
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

if (envResult.error) {
  console.warn('⚠️ .env 파일을 찾을 수 없습니다:', envResult.error.message);
} else {
  console.log('✅ .env 파일이 로드되었습니다.');
}

// MSSQL 데이터베이스 연결 설정
// Named Instance 사용 시: DB_HOST에 "localhost\SQLEXPRESS" 형식으로 입력
// 특정 포트 사용 시: DB_HOST와 DB_PORT를 모두 설정
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined;
const dbName = process.env.DB_NAME || 'order_app';

// Named Instance를 포함한 서버 주소인 경우 포트는 사용하지 않음
const isNamedInstance = dbHost.includes('\\') || dbHost.includes('/');

const dbConfig = {
  server: dbHost,
  port: isNamedInstance ? undefined : (dbPort || 1433), // Named Instance인 경우 포트 사용 안 함
  database: dbName,
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Azure SQL의 경우 true로 설정
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false', // 기본값 true (개발 환경용)
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE || undefined, // Named Instance 이름 (선택사항)
  },
  pool: {
    max: 20, // 최대 연결 수
    min: 0, // 최소 연결 수
    idleTimeoutMillis: 30000, // 유휴 연결 타임아웃 (30초)
  },
  connectionTimeout: 30000, // 연결 타임아웃 (30초)
  requestTimeout: 30000, // 요청 타임아웃 (30초)
};

// MSSQL 연결 풀 생성
let pool = null;

// 연결 풀 초기화 함수
export const initializePool = async () => {
  try {
    if (!pool) {
      console.log('데이터베이스 연결 시도 중...');
      console.log(`서버: ${dbConfig.server}${dbConfig.port ? ':' + dbConfig.port : ''}`);
      console.log(`데이터베이스: ${dbConfig.database}`);
      console.log(`사용자: ${dbConfig.user}`);
      
      pool = await sql.connect(dbConfig);
      console.log('✅ MSSQL 데이터베이스에 연결되었습니다.');
      
      // 연결 풀 오류 핸들러
      pool.on('error', (err) => {
        console.error('예상치 못한 데이터베이스 오류:', err);
      });
    }
    return pool;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    console.error('');
    console.error('🔍 연결 정보 확인:');
    console.error(`   서버: ${dbConfig.server}${dbConfig.port ? ':' + dbConfig.port : ''}`);
    console.error(`   데이터베이스: ${dbConfig.database}`);
    console.error(`   사용자: ${dbConfig.user}`);
    console.error('');
    console.error('💡 해결 방법:');
    console.error('   1. MSSQL 서버가 실행 중인지 확인하세요.');
    console.error('   2. Named Instance 사용 시: DB_HOST를 "localhost\\SQLEXPRESS" 형식으로 설정하세요.');
    console.error('   3. TCP/IP 프로토콜이 활성화되어 있는지 확인하세요.');
    console.error('   4. SQL Server Configuration Manager에서 포트 설정을 확인하세요.');
    console.error('   5. 방화벽에서 MSSQL 포트(기본 1433)가 허용되어 있는지 확인하세요.');
    console.error('   6. .env 파일의 연결 정보가 올바른지 확인하세요.');
    console.error('');
    console.error('📝 .env 파일 예시:');
    console.error('   # Default Instance');
    console.error('   DB_HOST=localhost');
    console.error('   DB_PORT=1433');
    console.error('');
    console.error('   # Named Instance (예: SQLEXPRESS)');
    console.error('   DB_HOST=localhost\\SQLEXPRESS');
    console.error('   # 또는');
    console.error('   DB_HOST=localhost/SQLEXPRESS');
    throw error;
  }
};

// 연결 풀 가져오기 (없으면 초기화)
export const getPool = async () => {
  if (!pool) {
    await initializePool();
  }
  return pool;
};

// 데이터베이스 연결 테스트 함수
export const testConnection = async () => {
  try {
    const poolConnection = await getPool();
    const result = await poolConnection.request().query('SELECT GETDATE() AS CurrentTime');
    console.log('데이터베이스 연결 테스트 성공:', result.recordset[0]);
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 테스트 실패:', error.message);
    return false;
  }
};

// 연결 풀 종료 함수
export const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('데이터베이스 연결 풀이 종료되었습니다.');
    }
  } catch (error) {
    console.error('데이터베이스 연결 풀 종료 중 오류:', error);
  }
};

// SQL 요청 실행 헬퍼 함수
export const executeQuery = async (query, params = {}) => {
  try {
    const poolConnection = await getPool();
    const request = poolConnection.request();
    
    // 파라미터 바인딩
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('쿼리 실행 오류:', error.message);
    throw error;
  }
};

// 연결 풀과 설정 내보내기
export { dbConfig };

// 서버 설정
export const serverConfig = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
};

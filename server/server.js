import express from 'express';
import cors from 'cors';
import { initializePool, serverConfig, testConnection } from './configure.js';

const app = express();
const PORT = serverConfig.port;

// 미들웨어 설정
app.use(cors()); // CORS 활성화 (프론트엔드와 통신하기 위해)
app.use(express.json()); // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })); // URL 인코딩된 요청 본문 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '커피 주문 앱 API 서버가 실행 중입니다.',
    version: '1.0.0'
  });
});

// 헬스 체크 엔드포인트
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    success: true,
    message: '서버가 정상적으로 동작 중입니다.',
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다.'
    }
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('에러 발생:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || '서버 내부 오류가 발생했습니다.'
    }
  });
});

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
  console.log('');
  
  // 데이터베이스 연결 초기화
  try {
    await initializePool();
    console.log('✅ 데이터베이스 연결이 완료되었습니다.\n');
  } catch (error) {
    console.error('❌ 데이터베이스 연결 초기화 실패:', error.message);
    console.error('');
    console.error('💡 해결 방법:');
    console.error('   1. .env 파일이 server 폴더에 있는지 확인하세요.');
    console.error('   2. MSSQL 서버가 실행 중인지 확인하세요.');
    console.error('   3. 데이터베이스 연결 정보가 올바른지 확인하세요.');
    console.error('');
    console.error('   .env 파일 예시는 .env.example 파일을 참고하세요.');
    console.error('');
  }
});

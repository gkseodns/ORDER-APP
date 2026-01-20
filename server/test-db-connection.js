import { initializePool, testConnection, closePool } from './configure.js';

// 데이터베이스 연결 테스트 실행
async function testDBConnection() {
  console.log('데이터베이스 연결 테스트를 시작합니다...\n');
  
  try {
    // 연결 풀 초기화
    await initializePool();
    
    // 연결 테스트
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('\n✅ 데이터베이스 연결이 성공했습니다!');
      process.exit(0);
    } else {
      console.log('\n❌ 데이터베이스 연결에 실패했습니다.');
      process.exit(1);
    }
  } catch (error) {
    console.error('');
    if (error.code === 'ECONNREFUSED' || error.message.includes('Could not connect')) {
      console.error('❌ 연결이 거부되었습니다. MSSQL 서버가 실행 중인지 확인하세요.');
    } else if (error.code === 'ELOGIN') {
      console.error('❌ 로그인 실패. 사용자 이름 또는 비밀번호를 확인하세요.');
    } else if (error.code === 'ETIMEOUT') {
      console.error('❌ 연결 시간 초과. 서버 주소와 포트를 확인하세요.');
    } else {
      console.error('❌ 데이터베이스 연결 오류:', error.message);
    }
    process.exit(1);
  } finally {
    // 연결 풀 종료
    await closePool();
  }
}

testDBConnection();

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env 파일 로드
const envResult = dotenv.config({ path: path.join(__dirname, '.env') });

console.log('=== .env 파일 로드 결과 ===');
if (envResult.error) {
  console.error('❌ .env 파일을 찾을 수 없습니다:', envResult.error.message);
  console.log('현재 디렉토리:', __dirname);
} else {
  console.log('✅ .env 파일이 로드되었습니다.');
}

console.log('\n=== 환경 변수 확인 ===');
console.log('DB_HOST:', process.env.DB_HOST || '(없음)');
console.log('DB_PORT:', process.env.DB_PORT || '(없음)');
console.log('DB_NAME:', process.env.DB_NAME || '(없음)');
console.log('DB_USER:', process.env.DB_USER || '(없음)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***설정됨***' : '(없음)');
console.log('DB_ENCRYPT:', process.env.DB_ENCRYPT || '(없음)');
console.log('DB_TRUST_CERT:', process.env.DB_TRUST_CERT || '(없음)');
console.log('PORT:', process.env.PORT || '(없음)');
console.log('NODE_ENV:', process.env.NODE_ENV || '(없음)');

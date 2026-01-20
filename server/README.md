# 커피 주문 앱 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 설치

```bash
npm install
```

## 환경 변수 설정

`server` 폴더에 `.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
# 서버 포트 (기본값: 3000)
PORT=3000

# MSSQL 데이터베이스 설정
DB_HOST=localhost
DB_PORT=1433
DB_NAME=order_app
DB_USER=sa
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_CERT=true

# 환경 (development, production)
NODE_ENV=development
```

**주의**: 
- `DB_PASSWORD`에는 실제 MSSQL 비밀번호를 입력하세요.
- `DB_ENCRYPT=true`는 Azure SQL Database 사용 시 설정하세요.
- `DB_TRUST_CERT=true`는 개발 환경에서 SSL 인증서 검증을 건너뛸 때 사용합니다.

## 실행

### 개발 모드 (자동 재시작)
```bash
npm run dev
```

### 프로덕션 모드
```bash
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## API 엔드포인트

### 기본
- `GET /` - 서버 상태 확인
- `GET /api/health` - 헬스 체크

### 메뉴
- `GET /api/menus` - 메뉴 목록 조회
- `GET /api/menus/:id` - 특정 메뉴 조회

### 주문
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:id` - 특정 주문 조회
- `PATCH /api/orders/:id/status` - 주문 상태 변경

### 재고
- `GET /api/inventory` - 재고 목록 조회
- `PATCH /api/inventory/:id` - 재고 수량 변경

### 통계
- `GET /api/stats/dashboard` - 대시보드 통계

## 기술 스택

- Node.js
- Express.js
- Microsoft SQL Server (mssql)
- CORS
- dotenv

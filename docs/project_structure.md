# 프로젝트 구조 (Project Structure)

커피 주문 앱(order-app)의 폴더 및 주요 파일 구성을 정리한 문서입니다.

---

## 폴더/파일 트리 (상세)

```
order-app/
├── .gitignore                    # Git 제외 대상 (node_modules, .env, 빌드 결과물 등)
├── docs/                          # 문서 폴더
│   ├── DEPLOY-FRONTEND-RENDER.md  # 프론트엔드 Render Static Site 배포 가이드
│   ├── DEPLOY-RENDER.md           # 백엔드·프론트·DB Render 배포 순서 및 설정
│   ├── PRD.md                     # 제품 요구사항 정의, API 설계
│   └── project_structure.md       # 이 문서. 프로젝트 구조 및 역할 설명
├── server/                        # 백엔드 (Express + MSSQL)
│   ├── .gitignore                 # 서버 쪽 Git 제외
│   ├── check-env.js               # .env 로드·환경 변수 확인 스크립트
│   ├── configure.js               # DB 연결 설정, 풀, getPool, testConnection
│   ├── index.js                   # Render 등에서 node index.js 시 server.js 실행
│   ├── package.json               # 의존성(express, cors, dotenv, mssql), start/dev 스크립트
│   ├── README.md                  # 서버 실행 방법 설명
│   ├── routes/                    # API 라우트
│   │   ├── admin.js               # GET /api/admin/partial (관리자 부분 갱신)
│   │   ├── inventory.js           # 재고 조회·수량 변경 API
│   │   ├── menus.js               # 메뉴 목록·상세 API
│   │   ├── orders.js              # 주문 생성·목록·상태 변경 API
│   │   └── stats.js               # GET /api/stats/dashboard (대시보드 통계)
│   ├── run-sql-file.js            # 지정 SQL 파일 실행 스크립트
│   ├── schema.sql                 # DB 테이블·초기 데이터 DDL
│   ├── server.js                  # Express 앱 진입점, CORS, 라우트, 포트 리스닝
│   ├── setup-database.js          # schema.sql 적용 스크립트
│   ├── test-db-connection.js      # DB 연결 테스트 스크립트
│   ├── update-menu-images.js      # 메뉴 이미지 경로 DB 업데이트 스크립트
│   └── update-menu-images.sql     # 메뉴 이미지 경로 UPDATE 문
└── ui/                            # 프론트엔드 (React + Vite)
    ├── .env.example               # VITE_API_BASE_URL 예시 (배포용)
    ├── .gitignore                 # UI 쪽 Git 제외
    ├── eslint.config.js           # ESLint 설정
    ├── index.html                 # HTML 진입점, root div, main.jsx 로드
    ├── package.json               # 의존성(react, react-dom), dev/build 스크립트
    ├── public/                    # 정적 파일 (빌드 시 루트로 제공)
    │   ├── americano-hot.jpg      # 아메리카노(HOT) 메뉴 이미지
    │   ├── americano-ice.jpg      # 아메리카노(ICE) 메뉴 이미지
    │   ├── caffe-latte.jpg        # 카페라떼 메뉴 이미지
    │   ├── Cappuccino.jpg         # 카푸치노 메뉴 이미지
    │   └── vite.svg               # Vite 아이콘
    ├── README.md                  # 프론트엔드 실행 방법 설명
    ├── src/                       # 소스
    │   ├── api/
    │   │   └── client.js          # API 클라이언트, menus/orders/inventory/stats/admin API
    │   ├── App.css                # App 컴포넌트 스타일
    │   ├── App.jsx                # 최상위 컴포넌트, 페이지·장바구니·주문·재고·갱신 로직
    │   ├── assets/
    │   │   └── react.svg          # React 로고
    │   ├── components/            # UI 컴포넌트
    │   │   ├── AdminDashboard.css # 전체현황 스타일
    │   │   ├── AdminDashboard.jsx # 전체현황 (총수량, 접수, 제조중, 제조완료)
    │   │   ├── InventoryStatus.css# 재고현황 스타일
    │   │   ├── InventoryStatus.jsx# 재고현황, 상품별 재고 +/- 조정
    │   │   ├── Navigation.css     # 네비 스타일
    │   │   ├── Navigation.jsx     # 상단 네비 (주문하기/관리자 전환)
    │   │   ├── OrderStatus.css    # 주문현황 스타일
    │   │   ├── OrderStatus.jsx    # 주문 목록, 상태 버튼(대기→접수→제조중→완료)
    │   │   ├── ProductCard.css    # 메뉴 카드 스타일
    │   │   ├── ProductCard.jsx    # 메뉴 카드 (이미지, 옵션, 담기, 품절 표시)
    │   │   ├── ShoppingCart.css  # 장바구니 스타일
    │   │   └── ShoppingCart.jsx   # 장바구니, 주문하기 버튼
    │   ├── index.css              # 전역 스타일
    │   └── main.jsx               # React 앱 마운트 (createRoot, App)
    └── vite.config.js             # Vite 설정 (React 플러그인, dev 서버 5173)
```

---

## docs/ — 문서

| 파일 | 역할 |
|------|------|
| **PRD.md** | 제품 요구사항 정의. 기능, 기술 스택, 백엔드 API 설계 등 |
| **DEPLOY-RENDER.md** | Render.com 배포 가이드 (백엔드·프론트엔드·DB 순서 및 설정) |
| **DEPLOY-FRONTEND-RENDER.md** | 프론트엔드(ui)만 Render Static Site로 배포하는 방법 |
| **project_structure.md** | 이 문서. 프로젝트 폴더/파일 구조 및 역할 설명 |

---

## server/ — 백엔드

Express.js + MSSQL 기반 API 서버.

### 루트 파일

| 파일 | 역할 |
|------|------|
| **server.js** | Express 앱 진입점. CORS, JSON 파싱, 라우트 등록, 포트 리스닝 |
| **index.js** | `node index.js` 실행 시 server.js를 불러서 실행 (Render 등 환경 대응) |
| **configure.js** | DB 연결 설정 및 풀 관리. .env 기반 MSSQL 연결, getPool, initializePool, testConnection 등 |
| **package.json** | 의존성(express, cors, dotenv, mssql) 및 스크립트(start, dev) |
| **.env** | DB 접속 정보 등 환경 변수 (저장소에 올리지 않음) |
| **.env.example** | .env 예시 및 변수 설명 |
| **check-env.js** | .env 로드 및 환경 변수 확인용 스크립트 |
| **README.md** | 서버 실행 방법 등 설명 |
| **schema.sql** | DB 테이블 생성 및 초기 데이터 DDL |
| **setup-database.js** | schema.sql을 읽어 DB에 적용하는 스크립트 |
| **test-db-connection.js** | DB 연결 테스트용 스크립트 |
| **run-sql-file.js** | 지정한 SQL 파일 실행 (예: update-menu-images.sql) |
| **update-menu-images.js** | 메뉴 이미지 경로 DB 업데이트 (americano-ice.jpg 등) |
| **update-menu-images.sql** | 메뉴 이미지 경로 UPDATE 문 (직접 실행용) |

### server/routes/ — API 라우트

| 파일 | 역할 |
|------|------|
| **menus.js** | 메뉴 API. GET /api/menus (목록), GET /api/menus/:id (상세) |
| **orders.js** | 주문 API. POST /api/orders (생성), GET /api/orders (목록), GET /api/orders/:id, PATCH /api/orders/:id/status |
| **inventory.js** | 재고 API. GET /api/inventory (목록), PATCH /api/inventory/:id (수량 변경) |
| **stats.js** | 통계 API. GET /api/stats/dashboard (총수량, 접수건수, 제조중, 제조완료 등) |
| **admin.js** | 관리자 부분 갱신 API. GET /api/admin/partial (stats + inventory + orders 한 번에 반환) |

---

## ui/ — 프론트엔드

React + Vite 기반 단일 페이지 앱.

### 루트 파일

| 파일 | 역할 |
|------|------|
| **index.html** | HTML 진입점. root div, main.jsx 로드 |
| **package.json** | 의존성(react, react-dom) 및 스크립트(dev, build) |
| **vite.config.js** | Vite 설정. React 플러그인, dev 서버(port 5173, host: true) |
| **.env.example** | 배포 시 VITE_API_BASE_URL 예시 (Render 백엔드 주소 등) |
| **eslint.config.js** | ESLint 설정 |
| **README.md** | 프론트엔드 실행 방법 등 설명 |
| **public/** | 정적 파일. 메뉴 이미지(americano-ice.jpg 등), vite.svg. 빌드 시 루트 경로로 제공 |

### ui/src/ — 소스

| 파일 | 역할 |
|------|------|
| **main.jsx** | React 앱 마운트 (createRoot, App) |
| **index.css** | 전역 스타일 |
| **App.jsx** | 최상위 컴포넌트. 페이지(주문/관리자) 상태, loadData, refreshAdminData, 장바구니·주문·재고·주문상태 핸들러 |
| **App.css** | App 관련 스타일 |

### ui/src/api/

| 파일 | 역할 |
|------|------|
| **client.js** | API 클라이언트. BASE_URL(VITE_API_BASE_URL 또는 기본값), menusAPI, ordersAPI, inventoryAPI, statsAPI, adminAPI.getPartial |

### ui/src/components/ — UI 컴포넌트

| 파일 | 역할 |
|------|------|
| **Navigation.jsx / .css** | 상단 네비게이션. 주문하기 / 관리자 전환 |
| **ProductCard.jsx / .css** | 메뉴 카드. 이미지, 이름, 가격, 옵션, 담기 버튼, 품절 표시 |
| **ShoppingCart.jsx / .css** | 장바구니. 목록, 수량, 합계, 주문하기 버튼 |
| **AdminDashboard.jsx / .css** | 관리자 전체현황. 총수량, 접수, 제조중, 제조완료 수치 표시 |
| **InventoryStatus.jsx / .css** | 재고현황. 상품별 재고 수량, +/- 조정 |
| **OrderStatus.jsx / .css** | 주문현황. 주문 목록, 상태 버튼(대기→주문접수→제조중→제조완료) |

---

## 데이터 흐름 요약

- **주문 화면**: 메뉴(menus API) + 재고(inventory) + 주문 진행 중 수량으로 주문 가능 수량 계산 → 담기/주문하기(orders API).
- **관리자 화면**: 전체 현황·재고·주문은 admin/partial API로 부분 갱신. 재고 변경은 inventory PATCH, 주문 상태 변경은 orders PATCH 후 partial로 숫자만 갱신.

이 문서는 프로젝트 구조가 변경되면 함께 수정하는 것을 권장합니다.

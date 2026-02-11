# Render.com 배포 가이드

## 배포 순서 (반드시 이 순서로)

1. **데이터베이스 준비** → 2. **백엔드 배포** → 3. **프론트엔드 배포**

---

## 0. 사전 준비

- 이 프로젝트를 **Git 저장소**에 올려두고, Render가 해당 저장소에 접근할 수 있어야 합니다 (GitHub/GitLab 연결).
- **MSSQL**은 Render에서 제공하지 않으므로, 지금처럼 외부 DB(예: 220.117.140.31)를 그대로 사용합니다.  
  Render 서버에서 해당 DB로 접속 가능한지(방화벽/보안 그룹에서 Render IP 허용 등) 미리 확인하세요.

---

## 1. 데이터베이스 준비

- MSSQL은 이미 사용 중인 서버(예: 220.117.140.31)를 그대로 씁니다.
- **할 일**
  - 스키마/테이블이 적용되어 있는지 확인 (`schema.sql` 또는 `setup-database.js` 실행).
  - Render **백엔드**가 이 DB에 접속할 수 있도록, DB 서버 방화벽에서 **Render 아웃바운드 IP** 또는 “모든 IP” 접속 허용이 필요할 수 있습니다.  
    (Render는 고정 IP가 없을 수 있어, “0.0.0.0” 등으로 외부 접속을 허용해 두는 경우가 많습니다.)
- 이 단계에서 **DB 연결 정보**(호스트, 포트, DB명, 사용자, 비밀번호)를 정리해 두고, 다음 단계에서 백엔드 환경 변수로 넣습니다.

---

## 2. 백엔드 배포 (먼저)

1. **Render 대시보드** → **New** → **Web Service**
2. 저장소 연결 후, 아래처럼 설정합니다.

| 항목 | 값 |
|------|-----|
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install` (또는 비워두기) |
| **Start Command** | `npm start` 또는 `node server.js` |

3. **Environment** 탭에서 다음 변수를 추가합니다.

- `DB_HOST` = MSSQL 서버 주소 (예: `220.117.140.31`)
- `DB_PORT` = 포트 (예: `5892`)
- `DB_NAME` = DB 이름 (예: `Wyfurs_Net_N`)
- `DB_USER` = DB 사용자
- `DB_PASSWORD` = DB 비밀번호
- `PORT` = 비워두기 (Render가 자동으로 `process.env.PORT` 지정)

4. **Create Web Service**로 배포합니다.
5. 배포가 끝나면 **백엔드 URL**을 확인합니다.  
   예: `https://order-app-backend-1c7a.onrender.com`  
   이 URL을 다음 단계에서 프론트엔드 API 주소로 사용합니다.

---

## 3. 프론트엔드 배포 (백엔드 다음)

1. **Render 대시보드** → **New** → **Static Site**
2. 같은 저장소 선택 후, 아래처럼 설정합니다.

| 항목 | 값 |
|------|-----|
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

3. **Environment** 탭에서 빌드 시 사용할 변수를 추가합니다.

- `VITE_API_BASE_URL` = 백엔드 URL + `/api`  
  예: `https://order-app-backend-1c7a.onrender.com/api`

   (프론트는 이 값을 빌드 시점에 `client.js`의 `API_BASE_URL`로 사용합니다.)

4. **Create Static Site**로 배포합니다.
5. 배포가 끝나면 **프론트엔드 URL**을 확인합니다.  
   예: `https://order-app.onrender.com`

---

## 4. 배포 후 확인

- **백엔드**: 브라우저에서 `https://[백엔드-URL]/api/health` 접속 → `database: "connected"` 등 정상 응답 확인.
- **프론트엔드**: `https://[프론트-URL]` 접속 후 메뉴 조회·주문·관리자 기능이 정상 동작하는지 확인.

---

## 5. CORS (필요 시)

백엔드 `server.js`에서 이미 `app.use(cors())`로 모든 오리진을 허용하고 있으므로, 별도 설정 없이 동작합니다.  
나중에 특정 도메인만 허용하려면 `cors({ origin: 'https://order-app.onrender.com' })` 형태로 수정하면 됩니다.

---

## 요약 순서

1. **DB** – MSSQL 접속 가능 여부·스키마 확인, 연결 정보 정리  
2. **백엔드** – Render Web Service, Root: `server`, DB 관련 env 설정 후 배포 → 백엔드 URL 확보  
3. **프론트엔드** – Render Static Site, Root: `ui`, `VITE_API_BASE_URL`에 백엔드 URL 넣고 배포  

이 순서대로 하면, “DB → 백엔드 → 프론트엔드”가 맞게 연결된 상태로 Render에 배포됩니다.

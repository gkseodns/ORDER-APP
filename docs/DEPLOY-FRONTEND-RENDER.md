# 프론트엔드(ui) Render 배포 가이드

## 1. 코드에서 수정할 부분

### 1.1 이미 반영된 부분 (수정 불필요)

- **API 주소**: `ui/src/api/client.js` 에서 `VITE_API_BASE_URL` 환경 변수를 이미 사용하고 있습니다.
  - 배포 시 Render에서 이 값을 설정하면, **빌드 시점**에 해당 API 주소가 코드에 들어갑니다.
- **빌드 스크립트**: `package.json` 의 `"build": "vite build"` 로 빌드하면 `dist` 폴더에 결과물이 생성됩니다.

### 1.2 배포 전에 확인할 것

| 항목 | 위치 | 설명 |
|------|------|------|
| 백엔드 URL 확보 | - | Render에 백엔드를 먼저 배포한 뒤, 부여된 URL(예: `https://order-app-backend-1c7a.onrender.com`)을 확인합니다. |
| 환경 변수 이름 | `client.js` | `VITE_API_BASE_URL` — 반드시 **VITE_** 로 시작해야 Vite 빌드에 포함됩니다. |

### 1.3 (선택) 로컬에서 배포용 빌드 테스트

배포 전에 API 주소만 바꿔서 로컬에서 빌드가 되는지 확인하려면:

```bash
cd ui
# Windows PowerShell
$env:VITE_API_BASE_URL="https://order-app-backend-1c7a.onrender.com/api"; npm run build
```

- `dist` 폴더가 생성되고, `dist/index.html` 이 있으면 정상입니다.
- 실제 동작은 배포된 백엔드가 있어야 확인할 수 있습니다.

---

## 2. Render 배포 과정

### 2.1 사전 준비

- GitHub 등에 이 프로젝트가 올라가 있고, Render가 해당 저장소에 접근할 수 있어야 합니다.
- **백엔드**가 이미 Render에 배포되어 있고, 백엔드 URL을 알고 있어야 합니다.  
  예: `https://order-app-backend-1c7a.onrender.com`

---

### 2.2 Render에서 Static Site 생성

1. **Render 대시보드** (https://dashboard.render.com) 로그인 후 **New +** → **Static Site** 선택.
2. 저장소 연결  
   - **Connect a repository** 에서 사용 중인 저장소(GitHub 등) 선택.  
   - 권한 요청이 나오면 허용.

---

### 2.3 서비스 설정

| 설정 항목 | 입력 값 |
|-----------|----------|
| **Name** | 원하는 서비스 이름 (예: `order-app-frontend`) |
| **Branch** | `main` (또는 사용하는 기본 브랜치) |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

- **Root Directory** 를 `ui` 로 두면, Render는 저장소 루트가 아니라 `ui` 폴더를 기준으로 `npm install` / `npm run build` 를 실행합니다.
- 빌드 결과는 `ui/dist` 에 생성되므로 **Publish Directory** 는 `dist` 로 두면 됩니다 (Root가 `ui` 이므로 경로는 자동으로 `ui/dist` 로 해석됨).

---

### 2.4 환경 변수 설정 (필수)

1. **Environment** 탭으로 이동.
2. **Add Environment Variable** 선택.
3. 다음 변수를 추가합니다.

| Key | Value |
|-----|--------|
| `VITE_API_BASE_URL` | `https://[여기에-백엔드-URL]/api` |

예시 (백엔드 URL이 `https://order-app-backend-1c7a.onrender.com` 인 경우):

- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://order-app-backend-1c7a.onrender.com/api`  
  (끝에 `/api` 포함, 프로토콜 `https` 로 통일 권장)

- 이 값은 **빌드 시**에만 사용됩니다. 값을 바꾸면 **다시 빌드(재배포)** 해야 적용됩니다.

---

### 2.5 배포 실행

1. **Create Static Site** (또는 **Save**) 클릭.
2. 자동으로 첫 빌드/배포가 시작됩니다.
3. **Logs** 탭에서 빌드 로그 확인.
   - `npm install` → `npm run build` → `dist` 업로드 순서로 진행되면 정상입니다.
4. 배포가 끝나면 상단에 **사이트 URL**이 표시됩니다.  
   예: `https://order-app-frontend.onrender.com`

---

### 2.6 배포 후 확인

1. 브라우저에서 위 **사이트 URL** 로 접속.
2. 메뉴가 보이고, 주문하기·관리자 화면이 열리면 정상입니다.
3. **F12 → Network** 탭에서 API 요청이 `https://[백엔드-URL]/api/...` 로 나가는지 확인하면 좋습니다.

---

## 3. 요약 체크리스트

- [ ] 백엔드가 Render에 배포되어 있고 URL 확보
- [ ] Render에서 **New → Static Site** 로 서비스 생성
- [ ] **Root Directory**: `ui`
- [ ] **Build Command**: `npm install && npm run build`
- [ ] **Publish Directory**: `dist`
- [ ] **Environment** 에 `VITE_API_BASE_URL` = `https://[백엔드URL]/api` 추가
- [ ] 배포 후 접속해서 메뉴/주문/관리자 동작 확인

---

## 4. 문제 발생 시

| 증상 | 확인할 것 |
|------|------------|
| 화면은 나오는데 메뉴/주문 안 됨 | Network 탭에서 API 요청 URL이 배포된 백엔드 주소인지 확인. `VITE_API_BASE_URL` 재설정 후 **재배포(재빌드)**. |
| 빌드 실패 | Render **Logs** 에서 에러 라인 확인. 보통 `npm install` 또는 `npm run build` 실패. Node 버전 이슈면 Render에서 Node 버전 지정 가능. |
| 404 / 빈 화면 | Publish Directory 가 `dist` 인지, Root가 `ui` 인지 다시 확인. |

이 순서대로 하면 `ui` 폴더의 프론트엔드 코드를 Render에 배포할 수 있습니다.

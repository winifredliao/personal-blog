# Personal Blog

使用 **React + FastAPI + SQLite** 打造的個人 Blog 網站，內建需要管理員登入才能操作的文章管理功能。

## 技術架構

| 層面 | 技術 |
|------|------|
| 前端 | React 18 + Vite + React Router v6 |
| 後端 | Python FastAPI + Uvicorn |
| 資料庫 | SQLite（透過 SQLAlchemy ORM） |
| 身份驗證 | JWT（PyJWT）+ bcrypt 密碼雜湊，單一管理員帳號 |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| 容器化 | Docker + Docker Compose（前端由 nginx 建置並反向代理 `/api` 到後端） |

## 功能

- 文章列表，可依分類篩選、全文搜尋
- Markdown 文章內容，支援程式碼高亮
- 響應式導覽列：桌面版為頂部橫向選單，行動裝置收合為側邊抽屜選單
- 管理員登入後才能新增／編輯／刪除文章，以及編輯關於我頁面內容
- 關於我頁面，未登入時僅顯示唯讀內容
- 啟動時自動插入示範資料

---

## 快速啟動

### 方式一：Docker Compose（推薦）

```bash
docker compose up -d --build
```

- 前端：http://localhost
- 後端 API 文件：http://localhost:8000/docs

文章資料庫存在 named volume（`backend_data`）裡，重建 container 不會遺失資料。

### 方式二：本機開發

#### 1. 後端（FastAPI）

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API 文件：http://localhost:8000/docs
```

#### 2. 前端（React）

```bash
cd frontend
npm install
npm run dev
# 瀏覽器開啟：http://localhost:5173
```

> Vite 已設定 proxy，所有 `/api/*` 請求自動轉發到 `http://127.0.0.1:8000`。

---

## 專案結構

```
personal-blog/
├── docker-compose.yml
├── .env.example
├── backend/
│   ├── main.py           # FastAPI 路由與 API
│   ├── auth.py           # 管理員登入與 JWT 驗證
│   ├── models.py         # SQLAlchemy 資料模型
│   ├── schemas.py        # Pydantic 驗證結構
│   ├── database.py       # DB 連線設定
│   ├── requirements.txt
│   ├── Dockerfile
│   └── blog.db            # SQLite 資料庫（自動建立，未進版控）
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # 登入狀態管理
│   │   ├── pages/
│   │   │   ├── Home.jsx            # 文章列表
│   │   │   ├── PostDetail.jsx      # 文章詳情
│   │   │   ├── PostEditor.jsx      # 新增／編輯文章（需登入）
│   │   │   ├── About.jsx           # 關於我
│   │   │   └── Login.jsx           # 管理員登入
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # 導覽列（桌面橫向／行動抽屜）
│   │   │   ├── Navbar.jsx          # 行動版頂部列（漢堡選單按鈕）
│   │   │   ├── ProtectedRoute.jsx  # 需登入才能進入的路由保護
│   │   │   └── Footer.jsx
│   │   └── styles/index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf          # 靜態檔案服務 + /api 反向代理
│   └── package.json
└── README.md
```

## API 端點

| 方法 | 路徑 | 說明 | 需登入 |
|------|------|------|:---:|
| GET | `/api/posts` | 取得文章列表（支援 search、category 參數） | |
| GET | `/api/posts/{slug}` | 取得單篇文章 | |
| POST | `/api/posts` | 新增文章 | 是 |
| PUT | `/api/posts/{slug}` | 更新文章 | 是 |
| DELETE | `/api/posts/{slug}` | 刪除文章 | 是 |
| GET | `/api/categories` | 取得所有分類 | |
| GET | `/api/about` | 取得關於我資訊 | |
| PUT | `/api/about` | 更新關於我資訊 | 是 |
| POST | `/api/auth/login` | 管理員登入，取得 JWT | |
| GET | `/api/auth/me` | 驗證目前 token 是否有效 | 是 |
| GET | `/api/health` | 健康檢查 | |

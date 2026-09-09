# 📝 Personal Blog

使用 **React + FastAPI + SQLite** 打造的個人 Blog 網站。

## 技術架構

| 層面 | 技術 |
|------|------|
| 前端 | React 18 + Vite + React Router v6 |
| 後端 | Python FastAPI + Uvicorn |
| 資料庫 | SQLite（透過 SQLAlchemy ORM） |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |

## 功能

- ✅ 文章列表（卡片式）
- ✅ 依分類篩選 / 全文搜尋
- ✅ Markdown 文章內容（支援程式碼高亮）
- ✅ 新增 / 編輯 / 刪除文章
- ✅ 關於我頁面（可線上編輯）
- ✅ 深色主題 UI
- ✅ 啟動時自動插入示範資料

---

## 快速啟動

### 1. 後端（FastAPI）

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API 文件：http://localhost:8000/docs
```

### 2. 前端（React）

```bash
cd frontend
npm install
npm run dev
# 瀏覽器開啟：http://localhost:5173
```

> Vite 已設定 proxy，所有 `/api/*` 請求自動轉發到 `http://localhost:8000`。

---

## 專案結構

```
personal-blog/
├── backend/
│   ├── main.py          # FastAPI 路由與 API
│   ├── models.py        # SQLAlchemy 資料模型
│   ├── schemas.py       # Pydantic 驗證結構
│   ├── database.py      # DB 連線設定
│   ├── blog.db          # SQLite 資料庫（自動建立）
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx        # 文章列表
│   │   │   ├── PostDetail.jsx  # 文章詳情
│   │   │   ├── PostEditor.jsx  # 新增/編輯文章
│   │   │   └── About.jsx       # 關於我
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── styles/index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | `/api/posts` | 取得文章列表（支援 search、category 參數） |
| GET | `/api/posts/{slug}` | 取得單篇文章 |
| POST | `/api/posts` | 新增文章 |
| PUT | `/api/posts/{slug}` | 更新文章 |
| DELETE | `/api/posts/{slug}` | 刪除文章 |
| GET | `/api/categories` | 取得所有分類 |
| GET | `/api/about` | 取得關於我資訊 |
| PUT | `/api/about` | 更新關於我資訊 |
| GET | `/api/health` | 健康檢查 |

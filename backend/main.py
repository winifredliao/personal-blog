from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import models, schemas
import auth
from database import engine, get_db, Base

# ── 初始化資料庫 ───────────────────────────────────────────
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Personal Blog API", version="1.0.0")

# ── CORS（允許 React dev server）───────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 啟動時寫入預設範例資料 ─────────────────────────────────
@app.on_event("startup")
def seed_data():
    db = next(get_db())
    if db.query(models.Post).count() == 0:
        sample_posts = [
            models.Post(
                title="歡迎來到我的 Blog！",
                slug="welcome",
                summary="這是我的第一篇文章，介紹這個 Blog 的用途。",
                content="""## 你好，世界！

歡迎來到我的個人 Blog。這裡會記錄我在程式開發、技術學習以及生活上的點點滴滴。

### 這個 Blog 使用的技術

- **後端**：Python + FastAPI
- **前端**：React + Vite
- **資料庫**：SQLite

希望你會喜歡這裡的內容，歡迎留言交流！""",
                category="公告",
                tags="歡迎,介紹",
            ),
            models.Post(
                title="FastAPI 入門教學",
                slug="fastapi-intro",
                summary="快速了解 FastAPI 的核心概念，打造高效能的 REST API。",
                content="""## FastAPI 是什麼？

FastAPI 是一個現代、快速的 Python Web 框架，專門用於建構 API。

### 特色

1. **高效能** — 媲美 Node.js 和 Go
2. **自動文件** — 自動產生 OpenAPI 文件
3. **型別提示** — 利用 Python type hints 驗證資料

### 快速開始

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}
```

執行：`uvicorn main:app --reload`，然後打開 `http://localhost:8000/docs` 查看互動文件！""",
                category="技術",
                tags="Python,FastAPI,教學",
            ),
            models.Post(
                title="React + Vite 開發體驗",
                slug="react-vite",
                summary="為什麼 Vite 讓 React 開發變得如此愉快？",
                content="""## Vite 改變了前端開發

傳統的 Create React App 啟動速度慢、HMR 不穩定。Vite 用 ESM 原生模組解決了這些痛點。

### 核心優勢

- ⚡ **極速冷啟動** — 不需要打包整個專案
- 🔥 **即時 HMR** — 模組替換毫秒級
- 📦 **生產打包** — 使用 Rollup 優化輸出

### 建立專案

```bash
npm create vite@latest my-blog -- --template react
cd my-blog
npm install
npm run dev
```

搭配 FastAPI 後端，就是一套完整的全端方案！""",
                category="技術",
                tags="React,Vite,前端",
            ),
        ]
        db.add_all(sample_posts)

        about = models.About(
            name="Blog 作者",
            bio="熱愛程式開發與技術分享的工程師，專注於 Python 與 React 全端開發。",
            avatar_url="https://api.dicebear.com/7.x/avataaars/svg?seed=blog",
            github="https://github.com",
            email="blog@example.com",
        )
        db.add(about)
        db.commit()
    db.close()


# ══════════════════════════════════════════════════════════
#  Posts 路由
# ══════════════════════════════════════════════════════════

@app.get("/api/posts", response_model=List[schemas.PostOut])
def list_posts(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(models.Post).filter(models.Post.published == True)
    if category:
        q = q.filter(models.Post.category == category)
    if search:
        q = q.filter(
            or_(
                models.Post.title.contains(search),
                models.Post.content.contains(search),
                models.Post.summary.contains(search),
            )
        )
    return q.order_by(models.Post.created_at.desc()).offset(skip).limit(limit).all()


@app.get("/api/posts/{slug}", response_model=schemas.PostOut)
def get_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    return post


@app.post("/api/posts", response_model=schemas.PostOut, status_code=201)
def create_post(post: schemas.PostCreate, db: Session = Depends(get_db), _admin: str = Depends(auth.get_current_admin)):
    existing = db.query(models.Post).filter(models.Post.slug == post.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug 已被使用")
    db_post = models.Post(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post


@app.put("/api/posts/{slug}", response_model=schemas.PostOut)
def update_post(slug: str, post_update: schemas.PostUpdate, db: Session = Depends(get_db), _admin: str = Depends(auth.get_current_admin)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    for field, value in post_update.model_dump(exclude_none=True).items():
        setattr(post, field, value)
    db.commit()
    db.refresh(post)
    return post


@app.delete("/api/posts/{slug}", status_code=204)
def delete_post(slug: str, db: Session = Depends(get_db), _admin: str = Depends(auth.get_current_admin)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=404, detail="文章不存在")
    db.delete(post)
    db.commit()


@app.get("/api/categories", response_model=List[str])
def list_categories(db: Session = Depends(get_db)):
    rows = db.query(models.Post.category).filter(models.Post.published == True).distinct().all()
    return [r[0] for r in rows if r[0]]


# ══════════════════════════════════════════════════════════
#  About 路由
# ══════════════════════════════════════════════════════════

@app.get("/api/about", response_model=schemas.AboutOut)
def get_about(db: Session = Depends(get_db)):
    about = db.query(models.About).first()
    if not about:
        raise HTTPException(status_code=404, detail="尚未設定 About 資訊")
    return about


@app.put("/api/about", response_model=schemas.AboutOut)
def update_about(about_data: schemas.AboutCreate, db: Session = Depends(get_db), _admin: str = Depends(auth.get_current_admin)):
    about = db.query(models.About).first()
    if about:
        for field, value in about_data.model_dump().items():
            setattr(about, field, value)
    else:
        about = models.About(**about_data.model_dump())
        db.add(about)
    db.commit()
    db.refresh(about)
    return about


# ══════════════════════════════════════════════════════════
#  Auth 路由
# ══════════════════════════════════════════════════════════

@app.post("/api/auth/login", response_model=schemas.TokenOut)
def login(credentials: schemas.LoginRequest):
    if not auth.verify_password(credentials.password):
        raise HTTPException(status_code=401, detail="密碼錯誤")
    return schemas.TokenOut(access_token=auth.create_access_token())


@app.get("/api/auth/me")
def read_current_admin(admin: str = Depends(auth.get_current_admin)):
    return {"username": admin}


# ── 健康檢查 ───────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok"}

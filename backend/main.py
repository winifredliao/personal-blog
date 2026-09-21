from fastapi import FastAPI, Depends, HTTPException, Query, Response
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
    expose_headers=["X-Total-Count"],
)

# ══════════════════════════════════════════════════════════
#  Posts 路由
# ══════════════════════════════════════════════════════════

@app.get("/api/posts", response_model=List[schemas.PostOut])
def list_posts(
    response: Response,
    skip: int = 0,
    limit: int = 15,
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
    response.headers["X-Total-Count"] = str(q.count())
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

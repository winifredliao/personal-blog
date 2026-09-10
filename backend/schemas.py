from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Post Schemas ──────────────────────────────────────────
class PostBase(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    content: str
    category: str = "General"
    tags: str = ""
    cover_image: Optional[str] = None
    published: bool = True


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[str] = None
    cover_image: Optional[str] = None
    published: Optional[bool] = None


class PostOut(PostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── About Schemas ─────────────────────────────────────────
class AboutBase(BaseModel):
    name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    github: Optional[str] = None
    twitter: Optional[str] = None
    email: Optional[str] = None


class AboutCreate(AboutBase):
    pass


class AboutOut(AboutBase):
    id: int

    class Config:
        from_attributes = True


# ── Auth Schemas ──────────────────────────────────────────
class LoginRequest(BaseModel):
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

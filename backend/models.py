from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    summary = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="General")
    tags = Column(String(300), default="")          # 逗號分隔
    cover_image = Column(String(500), nullable=True)
    published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class About(Base):
    __tablename__ = "about"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    github = Column(String(200), nullable=True)
    twitter = Column(String(200), nullable=True)
    email = Column(String(200), nullable=True)

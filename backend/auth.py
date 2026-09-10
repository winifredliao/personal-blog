import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
ADMIN_SUBJECT = "admin"

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = secrets.token_hex(32)
    print("WARNING: SECRET_KEY not set — using a random key generated at startup. "
          "All existing login sessions will be invalidated on every restart. "
          "Set SECRET_KEY in production.")

ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")
if not ADMIN_PASSWORD_HASH:
    ADMIN_PASSWORD_HASH = bcrypt.hashpw(b"admin123", bcrypt.gensalt()).decode()
    print("WARNING: ADMIN_PASSWORD_HASH not set — using the default password "
          "'admin123'. Set ADMIN_PASSWORD_HASH in production (see README).")

security = HTTPBearer()


def verify_password(plain_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), ADMIN_PASSWORD_HASH.encode())


def create_access_token() -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": ADMIN_SUBJECT, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登入已過期，請重新登入")
    if payload.get("sub") != ADMIN_SUBJECT:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="登入已過期，請重新登入")
    return payload["sub"]

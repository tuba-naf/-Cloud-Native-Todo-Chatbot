from datetime import datetime, timedelta, timezone
from uuid import UUID
from jose import JWTError, jwt
from app.config import get_settings


def create_access_token(user_id: UUID, email: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.jwt_expire_days)
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.better_auth_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        payload = jwt.decode(
            token, settings.better_auth_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None

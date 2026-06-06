from datetime import datetime, timedelta

import bcrypt
from jose import jwt, JWTError

from app.config import settings

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = "HS256"
TOKEN_SURE_DK = settings.TOKEN_EXPIRE_MINUTES

_BCRYPT_MAX_BYTES = 72


def _sifre_bytes(sifre: str) -> bytes:
    """bcrypt'in 72 byte sınırına uygun UTF-8 bayt dizisi."""
    return sifre.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def sifreyi_hashle(sifre: str) -> str:
    return bcrypt.hashpw(_sifre_bytes(sifre), bcrypt.gensalt()).decode("utf-8")


def sifre_dogru_mu(sifre: str, hash_: str) -> bool:
    return bcrypt.checkpw(_sifre_bytes(sifre), hash_.encode("utf-8"))


def token_olustur(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_SURE_DK)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def token_coz(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

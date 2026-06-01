from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from jose import jwt
from passlib.context import CryptContext

from app.database import get_db
from app.models.kullanici import Kullanici

router = APIRouter(prefix="/auth", tags=["Auth"])

# ─── Güvenlik ────────────────────────────────────────────────────────────────
SECRET_KEY = "smartstock-jwt-secret-2026-gizli"
ALGORITHM  = "HS256"
TOKEN_SURE = 60 * 24  # 24 saat (dakika)

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

def sifreyi_hashle(sifre: str) -> str:
    return pwd_ctx.hash(sifre)

def sifre_dogru_mu(sifre: str, hash_: str) -> bool:
    return pwd_ctx.verify(sifre, hash_)

def token_olustur(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=TOKEN_SURE)
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ─── Şemalar ─────────────────────────────────────────────────────────────────
class LoginIstegi(BaseModel):
    email: str
    sifre: str

class KullaniciOlusturIstegi(BaseModel):
    email: str
    ad:    str
    sifre: str
    rol:   str = "görüntüleyici"   # "yönetici" | "görüntüleyici"


# ─── Endpoint'ler ─────────────────────────────────────────────────────────────

@router.post("/login")
def login(istek: LoginIstegi, db: Session = Depends(get_db)):
    kullanici = db.query(Kullanici).filter(
        Kullanici.email == istek.email.strip().lower(),
        Kullanici.aktif == True
    ).first()

    if not kullanici or not sifre_dogru_mu(istek.sifre, kullanici.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta adresi veya şifre hatalı."
        )

    token = token_olustur({
        "sub":  kullanici.email,
        "ad":   kullanici.ad,
        "rol":  kullanici.rol,
        "id":   kullanici.kullanici_id,
    })

    return {
        "token":      token,
        "token_tipi": "bearer",
        "kullanici": {
            "id":       kullanici.kullanici_id,
            "email":    kullanici.email,
            "ad":       kullanici.ad,
            "rol":      kullanici.rol,
            "initials": "".join(p[0].upper() for p in kullanici.ad.split()[:2]),
        }
    }


@router.post("/kullanici-olustur", status_code=201)
def kullanici_olustur(istek: KullaniciOlusturIstegi, db: Session = Depends(get_db)):
    mevcut = db.query(Kullanici).filter(
        Kullanici.email == istek.email.strip().lower()
    ).first()
    if mevcut:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten kayıtlı."
        )

    yeni = Kullanici(
        email           = istek.email.strip().lower(),
        ad              = istek.ad.strip(),
        hashed_password = sifreyi_hashle(istek.sifre),
        rol             = istek.rol,
        aktif           = True,
    )
    db.add(yeni)
    db.commit()
    db.refresh(yeni)

    return {
        "mesaj": "Kullanıcı oluşturuldu.",
        "kullanici": {
            "id":    yeni.kullanici_id,
            "email": yeni.email,
            "ad":    yeni.ad,
            "rol":   yeni.rol,
        }
    }

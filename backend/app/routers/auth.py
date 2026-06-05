from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.kullanici import Kullanici
from app.core.security import sifreyi_hashle, sifre_dogru_mu, token_olustur

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginIstegi(BaseModel):
    email: str
    sifre: str


class KullaniciOlusturIstegi(BaseModel):
    email: str
    ad:    str
    sifre: str

    model_config = {"extra": "ignore"}  # istemciden gelen rol vb. yok sayılır


@router.post("/login")
def login(istek: LoginIstegi, db: Session = Depends(get_db)):
    kullanici = db.query(Kullanici).filter(
        Kullanici.email == istek.email.strip().lower(),
        Kullanici.aktif == True,
    ).first()

    if not kullanici or not sifre_dogru_mu(istek.sifre, kullanici.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-posta adresi veya şifre hatalı.",
        )

    token = token_olustur({
        "sub": kullanici.email,
        "ad":  kullanici.ad,
        "rol": kullanici.rol,
        "id":  kullanici.kullanici_id,
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
        },
    }


@router.post("/kullanici-olustur", status_code=201)
def kullanici_olustur(istek: KullaniciOlusturIstegi, db: Session = Depends(get_db)):
    mevcut = db.query(Kullanici).filter(
        Kullanici.email == istek.email.strip().lower(),
    ).first()
    if mevcut:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu e-posta adresi zaten kayıtlı.",
        )

    yeni = Kullanici(
        email           = istek.email.strip().lower(),
        ad              = istek.ad.strip(),
        hashed_password = sifreyi_hashle(istek.sifre),
        rol             = "görüntüleyici",
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
        },
    }

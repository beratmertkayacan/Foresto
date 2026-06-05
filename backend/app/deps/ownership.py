from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.kullanici import Kullanici
from app.models.urun import Urun
from app.models.tedarikci import Tedarikci
from app.models.stok_hareketi import StokHareketi


def urun_kullaniciya_ait(db: Session, urun_id: int, kullanici: Kullanici) -> Urun:
    urun = db.query(Urun).filter(
        Urun.urun_id == urun_id,
        Urun.kullanici_id == kullanici.kullanici_id,
    ).first()
    if not urun:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ürün bulunamadı")
    return urun


def tedarikci_kullaniciya_ait(db: Session, tedarikci_id: int, kullanici: Kullanici) -> Tedarikci:
    t = db.query(Tedarikci).filter(
        Tedarikci.tedarikci_id == tedarikci_id,
        Tedarikci.kullanici_id == kullanici.kullanici_id,
    ).first()
    if not t:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tedarikçi bulunamadı")
    return t


def hareket_kullaniciya_ait(db: Session, hareket_id: int, kullanici: Kullanici) -> StokHareketi:
    h = (
        db.query(StokHareketi)
        .join(Urun, StokHareketi.urun_id == Urun.urun_id)
        .filter(
            StokHareketi.hareket_id == hareket_id,
            Urun.kullanici_id == kullanici.kullanici_id,
        )
        .first()
    )
    if not h:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hareket bulunamadı")
    return h

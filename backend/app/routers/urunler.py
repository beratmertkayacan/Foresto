from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List

from app.database import get_db
from app.models.urun import Urun
from app.models.stok_hareketi import StokHareketi
from app.models.kullanici import Kullanici
from app.schemas.urun import UrunCreate, UrunUpdate, UrunResponse
from app.deps.auth import get_current_user
from app.deps.ownership import urun_kullaniciya_ait, tedarikci_kullaniciya_ait

router = APIRouter(prefix="/urunler", tags=["Ürünler"])


def _urunler_query(db: Session, kullanici: Kullanici):
    return db.query(Urun).filter(Urun.kullanici_id == kullanici.kullanici_id)


@router.get("/", response_model=List[UrunResponse])
def urun_listesi(
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    return _urunler_query(db, kullanici).order_by(Urun.urun_adi).all()


@router.get("/kritik", response_model=List[UrunResponse])
def kritik_stok(
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    return _urunler_query(db, kullanici).filter(
        and_(
            Urun.min_stok_seviyesi.isnot(None),
            Urun.mevcut_stok.isnot(None),
            Urun.mevcut_stok <= Urun.min_stok_seviyesi,
        )
    ).all()


@router.post("/", status_code=201)
def urun_ekle(
    urun: UrunCreate,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    data = urun.model_dump()
    data.pop("urun_id", None)
    if data.get("tedarikci_id"):
        tedarikci_kullaniciya_ait(db, data["tedarikci_id"], kullanici)
    yeni = Urun(**data, kullanici_id=kullanici.kullanici_id)
    db.add(yeni)
    db.commit()
    db.refresh(yeni)
    return {
        "urun_id":                    yeni.urun_id,
        "urun_adi":                   yeni.urun_adi,
        "kategori":                   yeni.kategori,
        "birim":                      yeni.birim,
        "maliyet_fiyati":             yeni.maliyet_fiyati,
        "satis_fiyati":               yeni.satis_fiyati,
        "min_stok_seviyesi":          yeni.min_stok_seviyesi,
        "max_stok_seviyesi":          yeni.max_stok_seviyesi,
        "mevcut_stok":                yeni.mevcut_stok,
        "tedarikci_id":               yeni.tedarikci_id,
        "sezon_paterni":              getattr(yeni, "sezon_paterni", None),
        "siparis_maliyeti_tl":        getattr(yeni, "siparis_maliyeti_tl", None),
        "yillik_tutma_maliyeti_oran": getattr(yeni, "yillik_tutma_maliyeti_oran", None),
    }


@router.put("/{urun_id}", response_model=UrunResponse)
def urun_guncelle(
    urun_id: int,
    guncel: UrunUpdate,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    urun = urun_kullaniciya_ait(db, urun_id, kullanici)
    data = guncel.model_dump(exclude_unset=True)
    if data.get("tedarikci_id"):
        tedarikci_kullaniciya_ait(db, data["tedarikci_id"], kullanici)
    for key, value in data.items():
        setattr(urun, key, value)
    db.commit()
    db.refresh(urun)
    return urun


@router.delete("/{urun_id}")
def urun_sil(
    urun_id: int,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    urun = urun_kullaniciya_ait(db, urun_id, kullanici)
    hareket_sayisi = (
        db.query(StokHareketi)
        .filter(StokHareketi.urun_id == urun_id)
        .count()
    )
    if hareket_sayisi > 0:
        raise HTTPException(
            status_code=400,
            detail="Bu ürüne ait stok hareketleri var. Önce hareketleri silin.",
        )
    db.delete(urun)
    db.commit()
    return {"ok": True}


@router.get("/{urun_id}", response_model=UrunResponse)
def urun_detay(
    urun_id: int,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    return urun_kullaniciya_ait(db, urun_id, kullanici)

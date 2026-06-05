import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.database import get_db
from app.models.stok_hareketi import StokHareketi
from app.models.urun import Urun
from app.models.kullanici import Kullanici
from app.deps.auth import get_current_user
from app.deps.ownership import urun_kullaniciya_ait, hareket_kullaniciya_ait
from pydantic import BaseModel
from datetime import date
from typing import Optional

router = APIRouter(prefix="/hareketler", tags=["Stok Hareketleri"])

_GECERLI_TIPLER = frozenset({"giris", "cikis"})


def _tip_dogrula(tip: str) -> None:
    if tip not in _GECERLI_TIPLER:
        raise HTTPException(
            status_code=400,
            detail="Geçersiz hareket tipi. 'giris' veya 'cikis' olmalı.",
        )


def _miktar_dogrula(miktar: float) -> None:
    if miktar is None or miktar <= 0:
        raise HTTPException(status_code=400, detail="Miktar sıfırdan büyük olmalı.")


class HareketiOlustur(BaseModel):
    urun_id: int
    hareket_tipi: str
    miktar: float
    birim_fiyat: Optional[float] = None
    tarih: Optional[str] = None
    fatura_no: Optional[str] = ""
    tedarikci_musteri: Optional[str] = ""
    aciklama: Optional[str] = ""


class HareketiGuncelle(BaseModel):
    hareket_tipi: Optional[str] = None
    miktar: Optional[float] = None
    birim_fiyat: Optional[float] = None
    tarih: Optional[str] = None
    fatura_no: Optional[str] = None
    tedarikci_musteri: Optional[str] = None
    aciklama: Optional[str] = None


def meta_encode(fatura_no: str, tedarikci_musteri: str, aciklama: str) -> str:
    return json.dumps({
        "fatura_no": fatura_no or "",
        "tedarikci_musteri": tedarikci_musteri or "",
        "aciklama": aciklama or "",
    }, ensure_ascii=False)


def meta_decode(aciklama_str: str) -> dict:
    try:
        d = json.loads(aciklama_str or "{}")
        return {
            "fatura_no": d.get("fatura_no", ""),
            "tedarikci_musteri": d.get("tedarikci_musteri", ""),
            "aciklama": d.get("aciklama", ""),
        }
    except Exception:
        return {"fatura_no": "", "tedarikci_musteri": "", "aciklama": ""}


def hareket_to_dict(h: StokHareketi) -> dict:
    meta = meta_decode(h.aciklama)
    return {
        "hareket_id": h.hareket_id,
        "urun_id": h.urun_id,
        "urun_adi": h.urun.urun_adi if h.urun else "",
        "kategori": h.urun.kategori if h.urun else "",
        "birim": h.urun.birim if h.urun else "",
        "tarih": str(h.tarih),
        "hareket_tipi": h.hareket_tipi,
        "miktar": h.miktar,
        "birim_fiyat": h.birim_fiyat,
        "fatura_no": meta["fatura_no"],
        "tedarikci_musteri": meta["tedarikci_musteri"],
        "aciklama": meta["aciklama"],
    }


def _hareket_base(db: Session, kullanici: Kullanici):
    return (
        db.query(StokHareketi)
        .join(Urun, StokHareketi.urun_id == Urun.urun_id)
        .filter(Urun.kullanici_id == kullanici.kullanici_id)
    )


@router.get("/toplam")
def hareket_toplam(
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    base = _hareket_base(db, kullanici)
    toplam = base.with_entities(func.count(StokHareketi.hareket_id)).scalar() or 0
    giris_s = base.filter(StokHareketi.hareket_tipi == "giris").with_entities(
        func.count(StokHareketi.hareket_id)
    ).scalar() or 0
    cikis_s = base.filter(StokHareketi.hareket_tipi == "cikis").with_entities(
        func.count(StokHareketi.hareket_id)
    ).scalar() or 0
    giris_m = base.filter(StokHareketi.hareket_tipi == "giris").with_entities(
        func.sum(StokHareketi.miktar)
    ).scalar() or 0
    cikis_m = base.filter(StokHareketi.hareket_tipi == "cikis").with_entities(
        func.sum(StokHareketi.miktar)
    ).scalar() or 0
    return {
        "toplam": toplam,
        "giris_sayisi": giris_s,
        "cikis_sayisi": cikis_s,
        "giris_miktar": float(giris_m),
        "cikis_miktar": float(cikis_m),
    }


@router.get("/")
def hareket_listesi(
    limit: int = 30000,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    hareketler = (
        _hareket_base(db, kullanici)
        .options(joinedload(StokHareketi.urun))
        .order_by(StokHareketi.tarih.desc(), StokHareketi.hareket_id.desc())
        .limit(limit)
        .all()
    )
    return [hareket_to_dict(h) for h in hareketler]


@router.post("/")
def hareket_ekle(
    hareket: HareketiOlustur,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    urun = urun_kullaniciya_ait(db, hareket.urun_id, kullanici)
    _tip_dogrula(hareket.hareket_tipi)
    _miktar_dogrula(hareket.miktar)

    if hareket.hareket_tipi == "cikis" and (urun.mevcut_stok or 0) < hareket.miktar:
        raise HTTPException(status_code=400, detail="Yetersiz stok")

    if hareket.hareket_tipi == "giris":
        urun.mevcut_stok = (urun.mevcut_stok or 0) + hareket.miktar
    elif hareket.hareket_tipi == "cikis":
        urun.mevcut_stok = (urun.mevcut_stok or 0) - hareket.miktar

    tarih_obj = date.fromisoformat(hareket.tarih) if hareket.tarih else date.today()
    birim_fiyat = hareket.birim_fiyat if hareket.birim_fiyat is not None else (
        urun.satis_fiyati if hareket.hareket_tipi == "cikis" else urun.maliyet_fiyati
    )

    yeni = StokHareketi(
        urun_id=hareket.urun_id,
        tarih=tarih_obj,
        hareket_tipi=hareket.hareket_tipi,
        miktar=hareket.miktar,
        birim_fiyat=birim_fiyat,
        aciklama=meta_encode(hareket.fatura_no, hareket.tedarikci_musteri, hareket.aciklama),
    )
    db.add(yeni)
    db.commit()
    db.refresh(yeni)
    return {"durum": "başarılı", "yeni_stok": urun.mevcut_stok, "hareket_id": yeni.hareket_id}


@router.put("/{hareket_id}")
def hareket_guncelle(
    hareket_id: int,
    guncelleme: HareketiGuncelle,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    h = hareket_kullaniciya_ait(db, hareket_id, kullanici)
    urun = urun_kullaniciya_ait(db, h.urun_id, kullanici)

    yeni_tip = guncelleme.hareket_tipi if guncelleme.hareket_tipi is not None else h.hareket_tipi
    yeni_miktar = guncelleme.miktar if guncelleme.miktar is not None else h.miktar
    _tip_dogrula(yeni_tip)
    _miktar_dogrula(yeni_miktar)

    if h.hareket_tipi == "giris":
        urun.mevcut_stok = (urun.mevcut_stok or 0) - h.miktar
    else:
        urun.mevcut_stok = (urun.mevcut_stok or 0) + h.miktar

    if guncelleme.hareket_tipi is not None:
        h.hareket_tipi = guncelleme.hareket_tipi
    if guncelleme.miktar is not None:
        h.miktar = guncelleme.miktar
    if guncelleme.birim_fiyat is not None:
        h.birim_fiyat = guncelleme.birim_fiyat
    if guncelleme.tarih is not None:
        h.tarih = date.fromisoformat(guncelleme.tarih)

    meta = meta_decode(h.aciklama)
    if guncelleme.fatura_no is not None:
        meta["fatura_no"] = guncelleme.fatura_no
    if guncelleme.tedarikci_musteri is not None:
        meta["tedarikci_musteri"] = guncelleme.tedarikci_musteri
    if guncelleme.aciklama is not None:
        meta["aciklama"] = guncelleme.aciklama
    h.aciklama = json.dumps(meta, ensure_ascii=False)

    if h.hareket_tipi == "giris":
        urun.mevcut_stok = (urun.mevcut_stok or 0) + h.miktar
    else:
        if (urun.mevcut_stok or 0) < h.miktar:
            raise HTTPException(status_code=400, detail="Yetersiz stok")
        urun.mevcut_stok = (urun.mevcut_stok or 0) - h.miktar

    db.commit()
    return {"durum": "güncellendi", "yeni_stok": urun.mevcut_stok}


@router.delete("/{hareket_id}")
def hareket_sil(
    hareket_id: int,
    db: Session = Depends(get_db),
    kullanici: Kullanici = Depends(get_current_user),
):
    h = hareket_kullaniciya_ait(db, hareket_id, kullanici)
    urun = db.query(Urun).filter(Urun.urun_id == h.urun_id).first()
    if urun:
        if h.hareket_tipi == "giris":
            urun.mevcut_stok = (urun.mevcut_stok or 0) - h.miktar
        else:
            urun.mevcut_stok = (urun.mevcut_stok or 0) + h.miktar

    db.delete(h)
    db.commit()
    return {"durum": "silindi"}

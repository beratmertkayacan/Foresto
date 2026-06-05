"""Geliştirme amaçlı: tüm uygulama verisini siler, sequence'leri sıfırlar.

Tablo şemasına (kolon, PK, FK) dokunmaz. Production'da otomatik çalışmaz.

Kullanım (backend dizininden):
  python -m scripts.reset_app_data --onay-evet-sil
"""
import argparse
import sys
from pathlib import Path

backend = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend))

from dotenv import load_dotenv

load_dotenv(backend / ".env")

from sqlalchemy import create_engine, text, inspect
from app.config import settings

ONAY_METNI = "EVET-SIL"
TABLOLAR = [
    "stok_hareketleri",
    "siparisler",
    "urunler",
    "tedarikciler",
    "kullanicilar",
]
SEQUENCES = [
    "stok_hareketleri_hareket_id_seq",
    "siparisler_siparis_id_seq",
    "urunler_urun_id_seq",
    "tedarikciler_tedarikci_id_seq",
    "kullanicilar_kullanici_id_seq",
]


def _sayimlar(conn) -> dict[str, int]:
    return {
        t: conn.execute(text(f"SELECT COUNT(*) FROM {t}")).scalar() or 0
        for t in TABLOLAR
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Tüm uygulama verisini siler (geliştirme).")
    parser.add_argument(
        "--onay-evet-sil",
        action="store_true",
        help=f"Onay bayrağı — aksi halde işlem yapılmaz.",
    )
    args = parser.parse_args()

    db_hedef = settings.DATABASE_URL.split("@")[-1] if settings.DATABASE_URL else "?"
    print("=" * 60)
    print("UYARI: Bu işlem GERİ ALINAMAZ.")
    print(f"Hedef veritabanı: {db_hedef}")
    print("Silinecek tablo içerikleri (şema korunur):")
    for t in TABLOLAR:
        print(f"  - {t}")
    print("Sıfırlanacak sequence'ler:")
    for s in SEQUENCES:
        print(f"  - {s} → 1")
    print("=" * 60)

    if not args.onay_evet_sil:
        print(f"\nİşlem iptal edildi. Çalıştırmak için bayrak ekleyin:")
        print(f"  python -m scripts.reset_app_data --onay-evet-sil")
        return 1

    onay = input(f"\nOnaylamak için '{ONAY_METNI}' yazın: ").strip()
    if onay != ONAY_METNI:
        print("Onay metni eşleşmedi. İşlem iptal edildi.")
        return 1

    engine = create_engine(settings.DATABASE_URL)
    insp = inspect(engine)
    mevcut = [t for t in TABLOLAR if t in insp.get_table_names()]
    if not mevcut:
        print("HATA: Silinecek tablo bulunamadı.")
        return 1

    with engine.begin() as conn:
        onceki = _sayimlar(conn)
        print("\nMevcut satır sayıları:")
        for t in TABLOLAR:
            print(f"  {t}: {onceki.get(t, 0)}")

        conn.execute(
            text(f"TRUNCATE TABLE {', '.join(mevcut)} RESTART IDENTITY CASCADE")
        )

        for seq in SEQUENCES:
            conn.execute(text(f"ALTER SEQUENCE IF EXISTS {seq} RESTART WITH 1"))

        sonraki = _sayimlar(conn)
        print("\nTemizlik tamamlandı. Yeni satır sayıları:")
        for t in TABLOLAR:
            print(f"  {t}: {sonraki.get(t, 0)}")

    print("\nUygulama artık boş başlayabilir (kullanıcı kaydı gerekir).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

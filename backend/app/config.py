"""Merkezi uygulama ayarları — .env dosyasından okunur."""
import os
from dotenv import load_dotenv

load_dotenv()


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


class Settings:
    DATABASE_URL: str = _env(
        "DATABASE_URL",
        "postgresql://postgres:sifre@localhost:5432/yapi_stok",
    )
    TOKEN_EXPIRE_MINUTES: int = int(
        _env("TOKEN_SURE_DK", _env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    )
    CORS_ORIGINS: str = _env(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )

    def __init__(self) -> None:
        self.SECRET_KEY = _env("SECRET_KEY", "").strip()
        if not self.SECRET_KEY:
            raise RuntimeError(
                "SECRET_KEY ortam değişkeni zorunludur. "
                "backend/.env dosyasına güçlü bir anahtar ekleyin "
                "(ör. openssl rand -hex 32)."
            )

    @property
    def cors_origins_list(self) -> list[str]:
        raw = self.CORS_ORIGINS.strip()
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


settings = Settings()

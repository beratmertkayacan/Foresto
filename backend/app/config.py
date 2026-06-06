"""Merkezi uygulama ayarları — .env dosyasından okunur."""
import os
from dotenv import load_dotenv

load_dotenv()


def _env(key: str, default: str = "") -> str:
    return os.getenv(key, default)


def _parse_cors_origins(raw: str) -> list[str]:
    """Virgüllü/tek origin, tırnak ve sondaki slash farklarını normalize eder."""
    value = raw.strip()
    if not value:
        return []
    if (value.startswith('"') and value.endswith('"')) or (
        value.startswith("'") and value.endswith("'")
    ):
        value = value[1:-1].strip()
    if value == "*":
        return ["*"]
    origins: list[str] = []
    for part in value.split(","):
        origin = part.strip().strip('"').strip("'")
        if not origin:
            continue
        origins.append(origin.rstrip("/"))
    return origins


class Settings:
    DATABASE_URL: str = _env(
        "DATABASE_URL",
        "postgresql://postgres:sifre@localhost:5432/yapi_stok",
    )
    TOKEN_EXPIRE_MINUTES: int = int(
        _env("TOKEN_SURE_DK", _env("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    )

    def __init__(self) -> None:
        self.SECRET_KEY = _env("SECRET_KEY", "").strip()
        if not self.SECRET_KEY:
            raise RuntimeError(
                "SECRET_KEY ortam değişkeni zorunludur. "
                "backend/.env dosyasına güçlü bir anahtar ekleyin "
                "(ör. openssl rand -hex 32)."
            )
        self.CORS_ORIGINS = _env(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        )

    @property
    def cors_origins_list(self) -> list[str]:
        return _parse_cors_origins(self.CORS_ORIGINS)


settings = Settings()

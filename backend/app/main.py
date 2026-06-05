import logging
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.routers import urunler, hareketler, analitik, auth
from app.models import (  # noqa: F401 — create_all tüm tabloları görmeli
    kullanici,
    urun,
    stok_hareketi,
    tedarikci,
    siparis,
)

logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Foresto API",
    description="Foresto — ML destekli akıllı envanter yönetimi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        "Beklenmeyen hata: %s %s\n%s",
        request.method,
        request.url,
        traceback.format_exc(),
    )
    return JSONResponse(
        status_code=500,
        content={"hata": "Beklenmeyen bir hata oluştu."},
    )


app.include_router(auth.router)
app.include_router(urunler.router)
app.include_router(hareketler.router)
app.include_router(analitik.router)


@app.get("/")
def root():
    return {"durum": "çalışıyor", "versiyon": "1.0.0"}

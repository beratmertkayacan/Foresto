from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Kullanici(Base):
    __tablename__ = "kullanicilar"

    kullanici_id    = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email           = Column(String, unique=True, nullable=False, index=True)
    ad              = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    rol             = Column(String, default="görüntüleyici")   # "yönetici" | "görüntüleyici"
    aktif           = Column(Boolean, default=True)

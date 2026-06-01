# SmartStock

**Full-stack inventory management system with ML-powered demand forecasting and EOQ optimization**

---

## Screenshots

### Login & Landing
![Login](screenshots/genelbakış1.png)

### Dashboard
![Dashboard](screenshots/genelbakış2.png)

### Stok Hareketleri
| Genel Görünüm | Filtrelenmiş |
|---|---|
| ![Hareketler 1](screenshots/hareketler1.png) | ![Hareketler 2](screenshots/hareketler2.png) |

### Ürünler
![Ürünler](screenshots/ürünler1.png)

### Talep Tahmini (Ridge Regression)
| 30 Gün | 90 Gün |
|---|---|
| ![Tahmin 30](screenshots/analitik-tahmin30gün.png) | ![Tahmin 90](screenshots/analitik-tahmin90gün.png) |

![Kritik Stok](screenshots/analitik-tahmin-kritikstok.png)

### EOQ Analizi
| Hesaplama | Grafik |
|---|---|
| ![EOQ 1](screenshots/analitik-EOQ1.png) | ![EOQ 2](screenshots/analitik-EOQ2.png) |

### Stok Raporları & ABC Analizi
| Rapor | ABC Sınıflandırma |
|---|---|
| ![Rapor 1](screenshots/analitik-stokrapor-rapor1.png) | ![ABC 1](screenshots/analitik-stokraporABC1.png) |

---

## Features

**Stok Yönetimi**
- Ürün kataloğu — kategori, birim, maliyet/satış fiyatı
- Gerçek zamanlı stok takibi, kritik stok uyarıları
- Stok hareket kaydı (giriş/çıkış) — tedarikçi, müşteri, fatura no
- Dönem bazlı KPI kartları ve Alım/Satış/Net Kâr grafiği

**Analitik & ML**
- **Talep Tahmini** — Ridge Regression; 7/30 günlük hareketli ortalama, haftanın günü özellikleri. 30/60/90 günlük tahmin + güven bandı.
- **EOQ Optimizasyonu** — Wilson formülü ile optimal sipariş miktarı; tutma ve sipariş maliyeti dengesi.
- **ABC Analizi** — Stok değerine göre A/B/C sınıflandırması.
- **Dashboard** — 30 günlük grafik, toplam ürün/kritik stok/stok değeri/ortalama kâr marjı.

---



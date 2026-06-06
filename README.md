# Foresto

**Akıllı Envanter Yönetimi** — Makine öğrenmesi destekli talep tahmini ve sipariş optimizasyonuyla stok yönetimi platformu.



## Genel Bakış

Foresto, işletmelerin envanterini, stok durumlarını geleneksel yöntemlerden uzaklaşarak veriyle yönetmesini sağlayan tam yığın bir web uygulamasıdır. Geçmiş stok hareketlerinden talebi tahmin eder, maliyet-optimal sipariş miktarını hesaplar, ürünleri ciro katkısına göre önceliklendirir ve kritik stok seviyelerinde uyarı verir.


## Foresto Özellikleri

| Özellik | Açıklama |
|---|---|
| **Talep Tahmini** | Ridge Regression ile geçmiş satış verisinden ileriye dönük talep öngörüsü |
| **Sipariş Önerisi** | EOQ (Economic Order Quantity) modeliyle sipariş ve tutma maliyetini dengeleyen optimal sipariş miktarı |
| **Ürün Önceliklendirme** | ABC analizi ile ürünleri ciro katkısına göre A/B/C sınıflarına ayırma (Pareto prensibi) |
| **Stok Hareketleri** | Giriş/çıkış kayıtları, otomatik stok güncelleme, yetersiz stok kontrolü |
| **Genel Bakış Paneli** | Toplam ürün, kritik stok adedi, toplam stok değeri ve ortalama kâr marjı gibi anlık analizler |
| **Kritik Stok Uyarıları** | Yeniden sipariş eşiğinin altına düşen ürünlerin otomatik tespiti |

## Ekran Görüntüleri

<table>
  <tr>
    <td width="50%"><b>Genel Bakış</b><br><img src="screenshots/genelbakıs1.png" alt="Genel Bakış"></td>
    <td width="50%"><b>Talep Tahmini</b><br><img src="screenshots/regression1.png" alt="Talep Tahmini"></td>
  </tr>
  <tr>
    <td width="50%"><b>Sipariş Önerisi (EOQ)</b><br><img src="screenshots/eoq1.png" alt="Sipariş Önerisi"></td>
    <td width="50%"><b>Ürün Önceliklendirme (ABC)</b><br><img src="screenshots/abcAnaliz.png" alt="Ürün Önceliklendirme"></td>
  </tr>
  <tr>
    <td width="50%"><b>Stok Hareketleri</b><br><img src="screenshots/hareketler1.png" alt="Stok Hareketleri"></td>
    <td width="50%"><b>Ürün Kataloğu</b><br><img src="screenshots/ürünler1.png" alt="Ürün Kataloğu"></td>
  </tr>
</table>

## Kurulum (lokal)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # SECRET_KEY, DATABASE_URL düzenleyin
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend (ayrı terminal)
cd frontend
npm install
npm run dev   # VITE_API_URL tanımsız → /api proxy → localhost:8000
```

## Production deploy (Render + Vercel)

### Backend — Render (Web Service)

- **Root directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
  (veya `bash scripts/start.sh` — `--reload` kullanmayın)
- **Python:** `runtime.txt` → 3.11.9
- PostgreSQL: Render PostgreSQL eklentisi → `DATABASE_URL` otomatik bağlanır

### Frontend — Vercel

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output:** `dist`

### Ortam değişkenleri

| Nerede | Değişken | Açıklama |
|--------|----------|----------|
| Render | `SECRET_KEY` | Zorunlu (`openssl rand -hex 32`) |
| Render | `DATABASE_URL` | PostgreSQL bağlantı dizesi |
| Render | `CORS_ORIGINS` | Vercel URL(leri), örn. `https://foresto.vercel.app` |
| Render | `TOKEN_SURE_DK` | Oturum süresi (dakika), örn. `1440` |
| Render | `PORT` | Render tarafından atanır (start komutunda kullanılır) |
| Vercel | `VITE_API_URL` | Render backend URL, örn. `https://foresto-api.onrender.com` |

Gizli bilgiler yalnızca panel ortam değişkenlerinde; repoya gömülmez.


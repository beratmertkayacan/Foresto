import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import useScrollTrigger from "../../hooks/useScrollTrigger"
import { API_BASE, STORAGE_KEYS } from "../../config/constants"
import { useAuth } from "../../context/AuthContext.jsx"
import Logo from "../../components/common/Logo.jsx"

// ─── THEME ────────────────────────────────────────────────────────────────
const T = {
  bg:      "#050c1d",
  primary: "#38bdf8",
  indigo:  "#6366f1",
  amber:   "#f59e0b",
  pink:    "#ec4899",
  orange:  "#f97316",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.42)",
  border:  "rgba(125,211,252,0.12)",
}

const GLACIER = {
  ice: "#7dd3fc",
  glow: "rgba(56,189,248,0.18)",
  deep: "#0b1730",
}

// ─── API (yalnızca giriş formu — auth public endpoint) ───────────────────

const SPARK_ORNEK = [12,14,13,16,15,18,17,20,19,22,21,24,23,26,25,28,27,30,29,32,31,34,33,36,35,38,37,40,39,42]

function sparklinePoints(values, w = 280, h = 30) {
  if (!values?.length) return `0,${h - 4} ${w},${h - 4}`
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  return values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
}

function MiniSparkline({ values, color, w = 280, h = 30 }) {
  const pts = sparklinePoints(values, w, h)
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={color} opacity="0.07" />
    </svg>
  )
}

// ─── API yardımcıları (public auth endpoint) ───────────────────────────────
const API_TIMEOUT_MS = 20_000

function formatApiDetail(detail, fallback = "İşlem tamamlanamadı.") {
  if (!detail) return fallback
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => (typeof d === "object" && d?.msg ? d.msg : String(d)))
      .filter(Boolean)
      .join(" · ") || fallback
  }
  return String(detail)
}

async function apiJsonPost(path, body) {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    const raw = await res.text()
    let veri = null
    if (raw) {
      try {
        veri = JSON.parse(raw)
      } catch {
        throw new Error("INVALID_JSON")
      }
    }
    return { res, veri }
  } finally {
    window.clearTimeout(timer)
  }
}

// ─── SPINNER ─────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <span style={{
      width:16, height:16,
      border:"2px solid rgba(255,255,255,0.35)", borderTopColor:"#fff",
      borderRadius:"50%", display:"inline-block",
      animation:"spin 0.7s linear infinite"
    }}/>
  )
}

// ─── LOGIN FORMU ─────────────────────────────────────────────────────────
function LoginForm({ compact = false }) {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [mod,        setMod]        = useState("giris")   // "giris" | "olustur"
  // Giriş
  const [email,      setEmail]      = useState("")
  const [sifre,      setSifre]      = useState("")
  const [goster,     setGoster]     = useState(false)
  const [hata,       setHata]       = useState("")
  const [yukleniyor, setYukleniyor] = useState(false)
  const [focusE,     setFocusE]     = useState(false)
  const [focusS,     setFocusS]     = useState(false)
  // Kullanıcı oluştur
  const [yAd,        setYAd]        = useState("")
  const [yEmail,     setYEmail]     = useState("")
  const [ySifre,     setYSifre]     = useState("")
  const [yHata,      setYHata]      = useState("")
  const [yYuk,       setYYuk]       = useState(false)
  const [kayitMesaji, setKayitMesaji] = useState("")

  async function girisYap(e) {
    e.preventDefault()
    if (!email.trim() || !sifre) { setHata("Lütfen tüm alanları doldurunuz."); return }
    setYukleniyor(true)
    setHata("")
    try {
      const { res, veri } = await apiJsonPost("/auth/login", { email: email.trim(), sifre })
      if (!res.ok) {
        setHata(formatApiDetail(veri?.detail, "Giriş başarısız."))
        return
      }
      if (!veri?.token || !veri?.kullanici) {
        setHata("Sunucudan geçersiz yanıt alındı.")
        return
      }
      localStorage.setItem(STORAGE_KEYS.token, veri.token)
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(veri.kullanici))
      setKayitMesaji("")
      signIn()
      navigate("/")
    } catch (err) {
      if (err?.name === "AbortError") {
        setHata("İstek zaman aşımına uğradı. Sunucunun çalıştığından emin olun.")
      } else if (err?.message === "INVALID_JSON") {
        setHata("Sunucudan beklenmeyen yanıt alındı. API bağlantısını kontrol edin.")
      } else {
        setHata("Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setYukleniyor(false)
    }
  }

  async function kullaniciOlustur(e) {
    e.preventDefault()
    if (!yAd.trim() || !yEmail.trim() || !ySifre) {
      setYHata("Tüm alanları doldurunuz.")
      return
    }
    const kayitEmail = yEmail.trim()
    const kayitAd = yAd.trim()
    setYYuk(true)
    setYHata("")
    setKayitMesaji("")
    try {
      const { res, veri } = await apiJsonPost("/auth/kullanici-olustur", {
        email: kayitEmail,
        ad: kayitAd,
        sifre: ySifre,
      })
      if (!res.ok) {
        setYHata(formatApiDetail(veri?.detail, "Kullanıcı oluşturulamadı."))
        return
      }
      const olusturulanAd = veri?.kullanici?.ad || kayitAd
      setYAd("")
      setYEmail("")
      setYSifre("")
      setEmail(kayitEmail)
      setKayitMesaji(`"${olusturulanAd}" oluşturuldu. Şimdi giriş yapabilirsiniz.`)
      setMod("giris")
    } catch (err) {
      if (err?.name === "AbortError") {
        setYHata("İstek zaman aşımına uğradı. Sunucunun çalıştığından emin olun.")
      } else if (err?.message === "INVALID_JSON") {
        setYHata("Sunucudan beklenmeyen yanıt alındı. API bağlantısını kontrol edin.")
      } else {
        setYHata("Sunucuya ulaşılamadı. Lütfen daha sonra tekrar deneyin.")
      }
    } finally {
      setYYuk(false)
    }
  }

  const inputBase = {
    width:"100%", background:"rgba(255,255,255,0.06)",
    border:"1px solid rgba(255,255,255,0.1)", borderRadius:12,
    padding:"12px 16px", color:"#fff", fontSize:14,
    outline:"none", boxSizing:"border-box", transition:"border-color 0.2s",
  }
  const labelSt = { fontSize:12, color:"rgba(255,255,255,0.55)", display:"block", marginBottom:6 }

  const TabBtn = ({ id, label }) => (
    <button type="button" onClick={() => { setMod(id); setHata(""); setYHata(""); if (id === "olustur") setKayitMesaji("") }}
      style={{
        flex:1, padding:"9px 0", background: mod===id ? "rgba(56,189,248,0.14)" : "transparent",
        border:"none", borderBottom: mod===id ? "2px solid #38bdf8" : "2px solid transparent",
        color: mod===id ? "#7dd3fc" : "rgba(255,255,255,0.4)",
        fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
        whiteSpace:"nowrap",
      }}
    >{label}</button>
  )

  return (
    <div>
      <div style={{ display:"flex", marginBottom:20, borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <TabBtn id="giris"   label="Giriş Yap" />
        <TabBtn id="olustur" label="Kullanıcı Oluştur" />
      </div>

      {mod === "giris" && (
        <form onSubmit={girisYap} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={labelSt}>E-posta</label>
            <input type="email" value={email} placeholder="ad@sirket.com" autoComplete="email"
              onChange={e => { setEmail(e.target.value); setHata(""); setKayitMesaji("") }}
              onFocus={() => setFocusE(true)} onBlur={() => setFocusE(false)}
            style={{ ...inputBase, borderColor: hata ? "#ef4444" : focusE ? "rgba(56,189,248,0.55)" : "rgba(255,255,255,0.1)" }}
            />
          </div>
          <div>
            <label style={labelSt}>Şifre</label>
            <div style={{ position:"relative" }}>
              <input type={goster ? "text" : "password"} value={sifre} placeholder="••••••••" autoComplete="current-password"
                onChange={e => { setSifre(e.target.value); setHata("") }}
                onFocus={() => setFocusS(true)} onBlur={() => setFocusS(false)}
                style={{ ...inputBase, paddingRight:48, borderColor: hata ? "#ef4444" : focusS ? "rgba(56,189,248,0.55)" : "rgba(255,255,255,0.1)" }}
              />
              <button type="button" onClick={() => setGoster(v => !v)} style={{
                position:"absolute", right:14, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:14, padding:0
              }}>{goster ? "🙈" : "👁️"}</button>
            </div>
          </div>
          {kayitMesaji && (
            <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(56,189,248,0.14)", border:"1px solid rgba(56,189,248,0.28)", color:"#7dd3fc", fontSize:13 }}>
              ✓ {kayitMesaji}
            </div>
          )}
          {hata && (
            <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", fontSize:13 }}>
              {hata}
            </div>
          )}
          <button type="submit" disabled={yukleniyor} style={{
            width:"100%", padding:"14px", background:"linear-gradient(90deg,#0ea5e9,#38bdf8)", border:"none", borderRadius:12,
            color:"#fff", fontWeight:700, fontSize:15,
            cursor: yukleniyor ? "not-allowed" : "pointer", opacity: yukleniyor ? 0.7 : 1,
            boxShadow:"0 8px 28px rgba(14,165,233,0.4)", transition:"opacity 0.2s",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8
          }}>
            {yukleniyor ? <><Spinner/> Giriş yapılıyor...</> : "Giriş Yap →"}
          </button>
        </form>
      )}

      {mod === "olustur" && (
        <form onSubmit={kullaniciOlustur} style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div>
            <label style={labelSt}>Ad Soyad</label>
            <input type="text" value={yAd} placeholder="Ahmet Yılmaz"
              onChange={e => { setYAd(e.target.value); setYHata("") }}
              style={{ ...inputBase }}
            />
          </div>
          <div>
            <label style={labelSt}>E-posta</label>
            <input type="email" value={yEmail} placeholder="ad@sirket.com"
              onChange={e => { setYEmail(e.target.value); setYHata("") }}
              style={{ ...inputBase }}
            />
          </div>
          <div>
            <label style={labelSt}>Şifre</label>
            <input type="password" value={ySifre} placeholder="En az 6 karakter"
              onChange={e => { setYSifre(e.target.value); setYHata("") }}
              style={{ ...inputBase }}
            />
          </div>
          {yHata && (
            <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", fontSize:13 }}>
              {yHata}
            </div>
          )}
          <button type="submit" disabled={yYuk} style={{
            width:"100%", padding:"13px", background:"rgba(56,189,248,0.16)",
            border:"1px solid rgba(56,189,248,0.38)", borderRadius:12,
            color:"#7dd3fc", fontWeight:700, fontSize:14,
            cursor: yYuk ? "not-allowed" : "pointer", opacity: yYuk ? 0.7 : 1,
            transition:"all 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8
          }}>
            {yYuk ? <><Spinner/> Oluşturuluyor...</> : "Kullanıcı Oluştur"}
          </button>
        </form>
      )}
    </div>
  )
}
// ─── Özellik şeridi (sabit, kaymayan) ─────────────────────────────────────
const MARQUEE_ITEMS = [
  "📦 Stok Yönetimi", "📐 Sipariş Önerisi", "📊 Ürün Önceliklendirme",
  "⚠️ Kritik Stok Uyarısı", "📈 Talep Tahmini", "🔄 Giriş / Çıkış Takibi",
  "📅 30/60/90 Gün Öngörü", "🏭 Tedarikçi Takibi", "💰 Maliyet Kontrolü",
  "🔔 Otomatik Uyarılar", "📋 Sipariş Planlama", "🧮 Kâr Marjı Takibi",
]

function FeatureStrip() {
  return (
    <section className="login-section feature-strip-section">
      <div className="feature-strip">
        {MARQUEE_ITEMS.map((item) => (
          <span key={item} className="feature-strip__chip">{item}</span>
        ))}
      </div>
    </section>
  )
}

// ─── Scroll bölümü — tanıtım kartları ────────────────────────────────────
function ScrollMockPanel({ type, color }) {
  const cell = { background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"8px 10px" }
  const lbl  = { fontSize:9, color:"rgba(255,255,255,0.38)", marginTop:2 }
  const val  = (c, sz = 14) => ({ fontSize:sz, fontWeight:700, color:c || "#fff", lineHeight:1.2 })
  const row  = { display:"flex", justifyContent:"space-between", alignItems:"center",
    padding:"5px 0", borderBottom:"1px solid rgba(255,255,255,0.06)", fontSize:10, color:"rgba(255,255,255,0.6)" }

  if (type === "tahmin") {
    return (
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", marginBottom:2 }}>Ahşap Desenli Vinil 4mm</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:5 }}>
          {[{ g:"30", v:"1.248" }, { g:"60", v:"2.410" }, { g:"90", v:"3.685" }].map(x => (
            <div key={x.g} style={cell}>
              <div style={val(color, 12)}>{x.v}</div>
              <div style={lbl}>{x.g} gün</div>
            </div>
          ))}
        </div>
        <MiniSparkline values={SPARK_ORNEK} color={color} w={228} h={44} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
          <div style={cell}><div style={val(color)}>Yüksek</div><div style={lbl}>Tahmin güvenilirliği</div></div>
          <div style={cell}><div style={val("#fff")}>30 gün</div><div style={lbl}>Öngörü süresi</div></div>
        </div>
      </div>
    )
  }

  if (type === "eoq") {
    return (
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{ textAlign:"center", padding:"4px 0" }}>
          <div style={{ fontSize:32, fontWeight:900, color, letterSpacing:"-1px" }}>342</div>
          <div style={lbl}>optimal sipariş miktarı</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
          <div style={cell}><div style={val("#fff", 12)}>4.200</div><div style={lbl}>Yıllık talep</div></div>
          <div style={cell}><div style={val("#fff", 12)}>₺85</div><div style={lbl}>Sipariş maliyeti</div></div>
          <div style={cell}><div style={val("#fff", 12)}>%18</div><div style={lbl}>Tutma oranı</div></div>
          <div style={cell}><div style={val(color, 12)}>₺1.240</div><div style={lbl}>Yıllık tasarruf</div></div>
        </div>
        <div style={{ ...cell, textAlign:"center" }}>
          <div style={val("#fbbf24", 11)}>Yeniden sipariş: 128 adet</div>
        </div>
      </div>
    )
  }

  if (type === "hareketler") {
    return (
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:2 }}>
        {[
          { urun:"Seramik Karo 60×60", tip:"Giriş", m:"+500", c:"#7dd3fc" },
          { urun:"Ahşap Laminat 8mm", tip:"Çıkış", m:"−120", c:"#ef4444" },
          { urun:"Vinil Döşeme 4mm", tip:"Çıkış", m:"−85", c:"#ef4444" },
          { urun:"Granit Tezgah", tip:"Giriş", m:"+200", c:"#7dd3fc" },
        ].map(h => (
          <div key={h.urun} style={row}>
            <div>
              <div style={{ color:"rgba(255,255,255,0.85)", fontWeight:500 }}>{h.urun}</div>
              <span style={{ fontSize:8, color:h.c, background:`${h.c}18`, padding:"1px 5px", borderRadius:4 }}>{h.tip}</span>
            </div>
            <span style={{ fontWeight:700, color:h.c }}>{h.m}</span>
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginTop:8 }}>
          <div style={cell}><div style={val(color, 12)}>145.820</div><div style={lbl}>Toplam hareket</div></div>
          <div style={cell}><div style={val("#fff", 12)}>₺2.1M</div><div style={lbl}>Hacim (30g)</div></div>
        </div>
      </div>
    )
  }

  if (type === "abc") {
    return (
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
        {[
          { s:"A", pct:78, adet:42, c:"#38bdf8" },
          { s:"B", pct:15, adet:68, c:"#f59e0b" },
          { s:"C", pct:7, adet:174, c:"rgba(148,163,184,0.6)" },
        ].map(x => (
          <div key={x.s}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, fontSize:10 }}>
              <span style={{ fontWeight:700, color:x.c }}>Sınıf {x.s}</span>
              <span style={{ color:"rgba(255,255,255,0.45)" }}>{x.adet} ürün · %{x.pct}</span>
            </div>
            <div style={{ height:5, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
              <div style={{ width:`${x.pct}%`, height:"100%", background:x.c, borderRadius:3 }} />
            </div>
          </div>
        ))}
        <div style={cell}>
          <div style={val(color, 12)}>₺1.86M</div>
          <div style={lbl}>A sınıfı stok değeri</div>
        </div>
      </div>
    )
  }

  if (type === "kritik") {
    return (
      <div style={{ padding:16, display:"flex", flexDirection:"column", gap:8 }}>
        <div style={{
          padding:"10px 12px", borderRadius:10,
          background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)",
          display:"flex", alignItems:"center", gap:8,
        }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"#fca5a5" }}>12 ürün kritik</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Min. seviye altında</div>
          </div>
        </div>
        {[
          { ad:"Vinil Döşeme 4mm", stok:"42", min:"100" },
          { ad:"Granit Tezgah 2cm", stok:"8", min:"50" },
          { ad:"Epoksi Zemin Boya", stok:"15", min:"80" },
        ].map(u => (
          <div key={u.ad} style={row}>
            <span>{u.ad}</span>
            <span style={{ fontWeight:700, color:"#ef4444" }}>{u.stok}/{u.min}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ─── SCROLLYTELLING — tek section bileşeni ────────────────────────────────
function ScrollSection({ s, index }) {
  const [ref, inView] = useScrollTrigger()
  const isEven = index % 2 === 0

  return (
    <div ref={ref} style={{
      display:"flex",
      flexDirection: isEven ? "row" : "row-reverse",
      alignItems:"center", gap:60,
      opacity: inView ? 1 : 0,
      transform: inView ? "none" : "translateY(32px)",
      transition:"opacity 0.75s ease, transform 0.75s ease",
    }}>
      {/* Metin */}
      <div style={{ flex:1 }}>
        <span style={{
          fontSize:10, fontWeight:700, letterSpacing:"0.1em",
          color:s.chipColor, textTransform:"uppercase",
          padding:"4px 12px", borderRadius:20,
          background:`${s.chipColor}15`, border:`1px solid ${s.chipColor}30`,
          display:"inline-block", marginBottom:16
        }}>{s.chip}</span>
        <h3 style={{
          fontSize:"clamp(22px,2.5vw,34px)", fontWeight:900,
          letterSpacing:"-0.5px", marginBottom:20, lineHeight:1.2
        }}>{s.title}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {s.bullets.map((b, bi) => (
            <div key={bi} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{
                width:22, height:22, borderRadius:"50%",
                background:`${s.chipColor}15`, border:`1px solid ${s.chipColor}30`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:10, fontWeight:700, color:s.chipColor, flexShrink:0, marginTop:1
              }}>{bi + 1}</span>
              <span style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.6 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Görsel */}
      <div style={{
        flexShrink:0,
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(16px)",
        transition:"opacity 0.9s ease, transform 0.9s ease",
      }}>
        <div style={{
          background:"rgba(7,17,35,0.92)",
          border:`1px solid ${s.mockColor}35`,
          borderRadius:18, overflow:"hidden",
          boxShadow:`0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${s.mockColor}15`,
          width:280,
        }}>
          <div style={{
            padding:"9px 14px", display:"flex", alignItems:"center", gap:8,
            borderBottom:"1px solid rgba(255,255,255,0.06)"
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:s.mockColor, flexShrink:0 }} />
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", color:"rgba(255,255,255,0.5)", textTransform:"uppercase" }}>
              {s.mockTitle}
            </span>
          </div>
          <ScrollMockPanel type={s.mockType} color={s.mockColor} />
        </div>
      </div>
    </div>
  )
}

const SCROLL_SECTIONS = [
  {
    chip:"TALEP TAHMİNİ", chipColor:T.indigo,
    title:"Satış geçmişine göre geleceği planlayın",
    bullets:[
      "30, 60 ve 90 günlük talep görünümü",
      "Kritik stok riskini erken fark edin",
      "Tek ekranda net öngörü",
    ],
    mockColor:T.indigo, mockTitle:"TALEP TAHMİNİ", mockType:"tahmin",
  },
  {
    chip:"SİPARİŞ ÖNERİSİ", chipColor:T.pink,
    title:"Ne kadar sipariş vereceğinizi bilin",
    bullets:[
      "Maliyeti düşüren sipariş miktarı",
      "Yeniden sipariş zamanı hatırlatması",
      "Ürün bazında ayrı hesap",
    ],
    mockColor:T.pink, mockTitle:"SİPARİŞ ÖNERİSİ", mockType:"eoq",
  },
  {
    chip:"STOK TAKİP", chipColor:T.orange,
    title:"Giriş ve çıkışları anında kaydedin",
    bullets:[
      "Tedarikçi ve müşteri bilgisi",
      "Fatura ile izlenebilir kayıt",
      "Stok seviyesi otomatik güncellenir",
    ],
    mockColor:T.orange, mockTitle:"STOK HAREKETLERİ", mockType:"hareketler",
  },
  {
    chip:"ÜRÜN ÖNCELİĞİ", chipColor:T.amber,
    title:"Hangi ürüne önce odaklanacağınızı görün",
    bullets:[
      "Stok değerine göre A / B / C grupları",
      "Yüksek değerli ürünler öne çıkar",
      "Kategori dağılımı tek bakışta",
    ],
    mockColor:T.amber, mockTitle:"ÜRÜN ÖNCELİĞİ", mockType:"abc",
  },
  {
    chip:"UYARI", chipColor:"#ef4444",
    title:"Kritik stokta kalın, satış kaçırmayın",
    bullets:[
      "Minimum seviye altı ürünler işaretlenir",
      "Genel bakışta anlık liste",
      "Sipariş önerisiyle birlikte aksiyon",
    ],
    mockColor:"#ef4444", mockTitle:"KRİTİK STOK", mockType:"kritik",
  },
]

// ─── Kaydırmalı uygulama ekran görüntüleri (public/screenshots — README ile aynı kaynak) ─
const APP_SCREENSHOTS = [
  { src: "/screenshots/login.png",              title: "Giriş Ekranı",             module: "Foresto" },
  { src: "/screenshots/genelbakıs1.png",         title: "Genel Bakış",              module: "Ana Sayfa" },
  { src: "/screenshots/ürünler1.png",            title: "Ürün Kataloğu",            module: "Ürünler" },
  { src: "/screenshots/kritikÜrünler.png",      title: "Kritik Stok",              module: "Ürünler" },
  { src: "/screenshots/hareketler1.png",        title: "Dönem Özeti",              module: "Stok Hareketleri" },
  { src: "/screenshots/hareketler2.png",        title: "Hareket Kayıtları",        module: "Stok Hareketleri" },
  { src: "/screenshots/regression1.png",        title: "30 Gün Tahmini",           module: "Talep Tahmini" },
  { src: "/screenshots/regression2.png",        title: "60 Gün Tahmini",           module: "Talep Tahmini" },
  { src: "/screenshots/eoq1.png",               title: "Sipariş Önerisi",          module: "Sipariş Önerisi" },
  { src: "/screenshots/eoq2.png",               title: "Stok Seviyesi Simülasyonu", module: "Sipariş Önerisi" },
  { src: "/screenshots/abcAnaliz.png",          title: "Ürün Önceliklendirme",     module: "Stok Raporları" },
]

const SHOTS_ROW_A = APP_SCREENSHOTS
const SHOTS_ROW_B = [...APP_SCREENSHOTS].reverse()

function ScreenshotCard({ shot, compact = false }) {
  const [hover, setHover] = useState(false)
  const cardW = compact ? 248 : 300
  const imgH  = compact ? 152 : 188
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={`shot-card ${compact ? "shot-card--compact" : ""}`}
      style={{
        flexShrink: 0,
        width: cardW,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${hover ? "rgba(125,211,252,0.35)" : "rgba(255,255,255,0.1)"}`,
        background: "rgba(7,17,35,0.85)",
        boxShadow: hover
          ? "0 24px 60px rgba(0,0,0,0.45), 0 0 30px rgba(56,189,248,0.15)"
          : "0 16px 40px rgba(0,0,0,0.35)",
        transform: hover ? "translateY(-6px) scale(1.02)" : "none",
        transition: "transform 0.25s ease, border-color 0.25s, box-shadow 0.25s",
      }}
    >
      <div style={{ position: "relative", height: imgH, overflow: "hidden", background: "#0f172a" }}>
        <span style={{
          position: "absolute", top: 12, right: 14, zIndex: 2,
          fontSize: 28, lineHeight: 1, color: "rgba(255,255,255,0.22)", fontFamily: "Georgia, serif",
        }}>"</span>
        <img
          src={shot.src}
          alt={shot.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center",
            filter: hover ? "saturate(1.05)" : "saturate(0.95)",
            transition: "filter 0.25s",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, transparent 55%, rgba(5,12,29,0.85) 100%)",
        }} />
      </div>
      <div style={{ padding: compact ? "12px 14px 14px" : "14px 16px 16px" }}>
        <div style={{ fontSize: compact ? 14 : 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{shot.title}</div>
        <div style={{ fontSize: compact ? 11 : 12, color: "rgba(255,255,255,0.45)" }}>{shot.module}</div>
      </div>
    </div>
  )
}

function ScreenshotMarqueeRow({ items, reverse = false, compact = false }) {
  const loop = [...items, ...items]
  return (
    <div className={`shots-marquee ${compact ? "shots-marquee--hero" : ""}`}>
      <div className={`shots-track ${reverse ? "shots-track--reverse" : ""} ${compact ? "shots-track--hero" : ""}`}>
        {loop.map((shot, i) => (
          <ScreenshotCard key={`${shot.title}-${i}`} shot={shot} compact={compact} />
        ))}
      </div>
    </div>
  )
}

function ScreenshotShowcase() {
  return (
    <div className="hero-showcase">
      <div className="hero-showcase__head">
        <h2 style={{
          fontSize: "clamp(22px,2.8vw,36px)",
          fontWeight: 900, letterSpacing: "-1px", lineHeight: 1.15,
        }}>
          Uygulamanın her köşesi
        </h2>
        <p style={{
          fontSize: 13, color: T.muted, marginTop: 10, lineHeight: 1.55, maxWidth: 560,
        }}>
          Genel bakıştan sipariş önerisine, talep tahmininden stok raporlarına{" "}
          <span style={{ whiteSpace: "nowrap" }}>— hepsi tek platformda.</span>
        </p>
      </div>
      <div className="hero-showcase__rows">
        <ScreenshotMarqueeRow items={SHOTS_ROW_A} compact />
        <div style={{ height: 12 }} />
        <ScreenshotMarqueeRow items={SHOTS_ROW_B} reverse compact />
      </div>
    </div>
  )
}

function HeroLoginPanel() {
  const taglineSt = {
    margin: 0,
    marginTop: 12,
    fontSize: 18,
    fontWeight: 500,
    letterSpacing: "0.06em",
    color: "#9fb0cc",
    textAlign: "center",
    lineHeight: 1.3,
    maxWidth: "100%",
  }

  return (
    <>
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          paddingTop: 12,
          marginBottom: 40,
        }}
      >
        <Logo variant="lockup" size="5xl" theme="dark" />
        <p style={taglineSt}>Akıllı Envanter Yönetim Sistemi</p>
      </header>

      <section style={{ textAlign: "center", width: "100%", marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 8 }}>
          Hoş geldiniz 👋
        </h1>
        <p style={{
          fontSize: 12,
          color: T.muted,
          lineHeight: 1.5,
          margin: "0 auto",
          whiteSpace: "nowrap",
        }}>
          Envanterinizi tek yerden yönetmek için giriş yapın.
        </p>
      </section>

      <div style={{ width: "100%" }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
          marginBottom: 24,
        }}>
          {[
            { e: "📈", t: "Talep tahmini" },
            { e: "📐", t: "Sipariş önerisi" },
            { e: "⚠️", t: "Kritik stok" },
          ].map(f => (
            <div key={f.t} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.primary}20`,
              flexShrink: 0,
            }}>
              <span style={{
                width: 24, height: 24, borderRadius: 7,
                background: `${T.primary}15`, border: `1px solid ${T.primary}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, flexShrink: 0,
              }}>{f.e}</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>{f.t}</span>
            </div>
          ))}
        </div>

        <LoginForm />

        <p style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.28)",
          textAlign: "center",
          marginTop: 24,
          letterSpacing: "0.02em",
        }}>
          © 2026 Foresto. Tüm hakları saklıdır.
        </p>
      </div>
    </>
  )
}

// ─── ANA COMPONENT ────────────────────────────────────────────────────────
export default function Login() {
  return (
    <div className="login-page" style={{ color:T.text, fontFamily:"system-ui,-apple-system,sans-serif", overflowX:"hidden" }}>
      <style>{`
        @keyframes shotsScrollL { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes shotsScrollR { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(8px) rotate(1.5deg)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes auroraA {
          0%,100%{ transform:translate(0,0) scale(1); opacity:0.55 }
          50%{ transform:translate(40px,-30px) scale(1.08); opacity:0.75 }
        }
        @keyframes auroraB {
          0%,100%{ transform:translate(0,0) scale(1); opacity:0.45 }
          50%{ transform:translate(-35px,25px) scale(1.06); opacity:0.65 }
        }
        @keyframes auroraC {
          0%,100%{ transform:translate(-50%,-50%) scale(1); opacity:0.35 }
          50%{ transform:translate(calc(-50% + 20px),calc(-50% - 15px)) scale(1.1); opacity:0.5 }
        }
        *{box-sizing:border-box; margin:0; padding:0}
        .login-page{position:relative;min-height:100vh;background:transparent}
        .login-page > section,.login-page > .hero-shell{position:relative;z-index:1}
        .hero-shell{display:flex;height:100vh;min-height:640px}
        .hero-left{
          flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column;
          justify-content:center;background:transparent;min-width:0;
        }
        .hero-showcase{
          display:flex;flex-direction:column;justify-content:center;
          width:100%;height:100%;padding:24px 0 28px;gap:20px;
        }
        .hero-showcase__head{padding:0 clamp(20px,3vw,40px)}
        .hero-showcase__rows{
          flex:1;display:flex;flex-direction:column;justify-content:center;
          gap:12px;min-height:0;
        }
        .shots-marquee--hero .shots-track{gap:14px;animation-duration:42s}
        .shots-track--hero.shots-track--reverse{animation-duration:46s}
        .hero-right{
          width:clamp(380px,32vw,520px);flex-shrink:0;
          background:var(--panel);
          backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
          border-left:1px solid var(--panel-line);
          display:flex;flex-direction:column;justify-content:center;padding:48px 40px;overflow-y:auto;
          box-shadow:var(--shadow-panel);
        }
        .login-section{border-color:rgba(125,211,252,0.12);background:transparent}
        .feature-strip-section{
          border-top:1px solid rgba(125,211,252,0.12);
          border-bottom:1px solid rgba(125,211,252,0.12);
          padding:20px clamp(16px,4vw,48px);
          background:linear-gradient(180deg,rgba(6,15,31,0.6) 0%,rgba(5,12,29,0.85) 100%);
        }
        .feature-strip{
          display:flex;flex-wrap:wrap;justify-content:center;align-items:center;
          gap:10px 12px;max-width:1280px;margin:0 auto;
        }
        .feature-strip__chip{
          padding:6px 16px;border-radius:20px;font-size:12px;font-weight:500;
          color:rgba(255,255,255,0.65);white-space:nowrap;flex-shrink:0;
          background:rgba(255,255,255,0.05);border:1px solid rgba(125,211,252,0.12);
        }
        .shots-marquee{
          overflow:hidden;width:100%;
          mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
          -webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);
        }
        .shots-track{display:flex;gap:20px;width:max-content;padding:4px 0;animation:shotsScrollL 52s linear infinite}
        .shots-track--reverse{animation-name:shotsScrollR}
        .shots-marquee:hover .shots-track{animation-play-state:paused}
        @media (max-width: 1200px){
          .hero-right{width:clamp(350px,38vw,460px);padding:38px 30px}
        }
        @media (max-width: 980px){
          .hero-shell{flex-direction:column;height:auto;min-height:70vh}
          .hero-left{min-height:68vh}
          .hero-right{width:100%;border-left:none;border-top:1px solid rgba(125,211,252,0.22)}
        }
      `}</style>

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="hero-shell">

        {/* SOL — kayan ekran görüntüleri */}
        <div className="hero-left">
          <div style={{ position:"relative", zIndex:2, padding:"20px clamp(20px,3vw,40px) 0" }}>
            <span style={{
              fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              color:GLACIER.ice, textTransform:"uppercase",
              padding:"5px 12px", border:`1px solid ${GLACIER.ice}50`,
              borderRadius:20, background:"rgba(125,211,252,0.12)"
            }}>Uygulama İçi Görünüm</span>
          </div>
          <ScreenshotShowcase />
        </div>

        {/* SAĞ — giriş (tek form örneği — id ile alt CTA'dan erişim) */}
        <div className="hero-right" id="giris-formu">
          <HeroLoginPanel />
        </div>
      </section>

      <FeatureStrip />

      {/* ── 3. SCROLLYTELLING ────────────────────────────────────────── */}
      <section className="login-section" style={{ padding:"100px 80px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px" }}>
            Tek platformda tam kontrol
          </h2>
          <p style={{ fontSize:15, color:T.muted, marginTop:12 }}>
            Talep tahmini, sipariş önerisi ve raporlar — işletmeniz için tek panel.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:80 }}>
          {SCROLL_SECTIONS.map((s,i) => (
            <ScrollSection key={i} s={s} index={i} />
          ))}
        </div>
      </section>

      {/* ── 4. FINAL CTA ─────────────────────────────────────────────── */}
      <section className="login-section" style={{
        borderTop:`1px solid ${T.border}`,
        padding:"80px 64px", textAlign:"center"
      }}>
        <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px", marginBottom:12 }}>
          Hemen başlayın
        </h2>
        <p style={{ fontSize:14, color:T.muted, marginBottom:40 }}>
          Dakikalar içinde giriş yapıp tüm özellikleri deneyimleyin.
        </p>
        <button
          type="button"
          onClick={() => document.getElementById("giris-formu")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          style={{
            padding:"14px 28px",
            background:"linear-gradient(90deg,#0ea5e9,#38bdf8)",
            border:"none", borderRadius:12, color:"#fff",
            fontWeight:700, fontSize:15, cursor:"pointer",
            boxShadow:"0 8px 28px rgba(14,165,233,0.4)",
          }}
        >
          Giriş formuna git →
        </button>
        <p style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.28)",
          marginTop: 40,
          letterSpacing: "0.02em",
        }}>
          © 2026 Foresto. Tüm hakları saklıdır.
        </p>
      </section>
    </div>
  )
}

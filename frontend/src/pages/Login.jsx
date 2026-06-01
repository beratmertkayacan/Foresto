import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

// ─── THEME ────────────────────────────────────────────────────────────────
const T = {
  bg:      "#070d08",
  primary: "#38bdf8",
  indigo:  "#6366f1",
  amber:   "#f59e0b",
  pink:    "#ec4899",
  orange:  "#f97316",
  text:    "#ffffff",
  muted:   "rgba(255,255,255,0.42)",
  border:  "rgba(255,255,255,0.07)",
}

const GLACIER = {
  ice: "#7dd3fc",
  glow: "rgba(56,189,248,0.18)",
  deep: "#0b1730",
}

// ─── HOOK: scroll trigger ────────────────────────────────────────────────
function useScrollTrigger(threshold = 0.15) {
  const ref    = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ─── FRAME (mockup kartı) ────────────────────────────────────────────────
function Frame({ title, color = "#10b981", children, style = {} }) {
  return (
    <div style={{
      background:   "rgba(6,12,7,0.97)",
      border:       "1px solid rgba(255,255,255,0.09)",
      borderRadius: 18,
      overflow:     "hidden",
      boxShadow:    "0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
      width:        260,
      ...style,
    }}>
      <div style={{
        padding:       "9px 14px",
        display:       "flex",
        alignItems:    "center",
        gap:           8,
        borderBottom:  "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:"0.08em", color:"rgba(255,255,255,0.5)", textTransform:"uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  )
}

// ─── HERO KART İÇERİKLERİ ────────────────────────────────────────────────
function CardDashboard() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
        {[
          { l:"Toplam Ürün",   v:"284",   c:"#10b981" },
          { l:"Kritik Stok",  v:"12",    c:"#ef4444" },
          { l:"Stok Değeri",  v:"₺2.4M", c:"#f59e0b" },
          { l:"Ort. Marj",    v:"%38.2", c:"#6366f1" },
        ].map(k => (
          <div key={k.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"8px 10px" }}>
            <div style={{ fontSize:15, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)", marginTop:2 }}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardTahmin() {
  return (
    <div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:8 }}>Ahşap Desenli Vinil 4mm</div>
      <svg width="100%" height="55" viewBox="0 0 230 55" style={{ overflow:"visible" }}>
        <polyline points="0,42 35,36 70,40 105,25 140,29 175,17 210,20 230,14"
          fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        <polyline points="140,29 175,17 210,20 230,14"
          fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4 3" opacity="0.55"/>
        <polygon points="140,23 175,11 210,14 230,8 230,20 210,26 175,23 140,35"
          fill="#6366f1" opacity="0.09"/>
      </svg>
      <div style={{ display:"flex", gap:10, marginTop:4 }}>
        <span style={{ fontSize:9, color:"#6366f1" }}>● Gerçek</span>
        <span style={{ fontSize:9, color:"rgba(99,102,241,0.5)" }}>--- Tahmin</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginTop:8 }}>
        {[
          { v:"133.2", l:"30 Gün Tahmini", c:"#6366f1" },
          { v:"%90.9", l:"Model Doğruluğu", c:"#fff" },
        ].map(k => (
          <div key={k.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"6px 8px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardHareketler() {
  const rows = [
    { urun:"Seramik Karo 60x60", tip:"Giriş",  m:"+500", c:"#10b981" },
    { urun:"Ahşap Laminat 8mm",  tip:"Çıkış",  m:"-120", c:"#ef4444" },
    { urun:"Vinil Döşeme 4mm",   tip:"Çıkış",  m:"-85",  c:"#ef4444" },
    { urun:"Granit Tezgah",      tip:"Giriş",  m:"+200", c:"#10b981" },
  ]
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {rows.map(h => (
        <div key={h.urun} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"7px 0", borderBottom:"1px solid rgba(255,255,255,0.05)"
        }}>
          <div>
            <div style={{ fontSize:10, color:"#fff", fontWeight:500 }}>{h.urun}</div>
            <span style={{
              fontSize:8, color:h.c,
              background:`${h.c}18`, borderRadius:4,
              padding:"1px 5px", marginTop:2, display:"inline-block"
            }}>{h.tip}</span>
          </div>
          <div style={{ fontSize:12, fontWeight:700, color:h.c }}>{h.m}</div>
        </div>
      ))}
    </div>
  )
}

function CardUrunler() {
  const rows = [
    { ad:"Seramik Karo 60x60",  stok:1240, k:false },
    { ad:"Ahşap Laminat 8mm",   stok:890,  k:false },
    { ad:"Vinil Döşeme 4mm",    stok:42,   k:true  },
    { ad:"Granit Tezgah 2cm",   stok:8,    k:true  },
  ]
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
      {rows.map(u => (
        <div key={u.ad} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,0.05)"
        }}>
          <span style={{ fontSize:10, color:"#fff" }}>{u.ad}</span>
          <span style={{
            fontSize:9, fontWeight:600,
            color:u.k ? "#ef4444" : "#10b981",
            background:u.k ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            borderRadius:4, padding:"2px 7px"
          }}>{u.stok}</span>
        </div>
      ))}
    </div>
  )
}

function CardEOQ() {
  return (
    <div>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginBottom:6 }}>Seramik Karo 60x60</div>
      <div style={{ textAlign:"center", padding:"8px 0" }}>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Optimal Sipariş Miktarı</div>
        <div style={{ fontSize:30, fontWeight:900, color:"#ec4899", letterSpacing:"-1px", lineHeight:1.1 }}>342</div>
        <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>adet / sipariş</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginTop:6 }}>
        {[
          { l:"Yıllık Talep",     v:"4,200"  },
          { l:"Sipariş Maliyeti", v:"₺85"    },
          { l:"Tutma Oranı",      v:"%18"    },
          { l:"Yıllık Tasarruf",  v:"₺1,240" },
        ].map(k => (
          <div key={k.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:7, padding:"6px 8px" }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#fff" }}>{k.v}</div>
            <div style={{ fontSize:8, color:"rgba(255,255,255,0.35)" }}>{k.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CardKritik() {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        padding:"8px 10px", borderRadius:10,
        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)"
      }}>
        <span style={{ fontSize:14 }}>⚠️</span>
        <div>
          <div style={{ fontSize:10, fontWeight:600, color:"#ef4444" }}>3 Ürün Kritik Seviyede</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>Hemen sipariş ver</div>
        </div>
      </div>
      {[
        { ad:"Vinil Döşeme 4mm",  stok:42, min:100 },
        { ad:"Granit Tezgah 2cm", stok:8,  min:50  },
        { ad:"Epoksi Zemin Boya", stok:15, min:80  },
      ].map(u => (
        <div key={u.ad} style={{
          display:"flex", justifyContent:"space-between", alignItems:"center",
          padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.05)"
        }}>
          <span style={{ fontSize:9, color:"#fff" }}>{u.ad}</span>
          <span style={{ fontSize:9, color:"#ef4444", fontWeight:700 }}>{u.stok}/{u.min}</span>
        </div>
      ))}
    </div>
  )
}

function CardABC() {
  return (
    <div>
      {[
        { s:"A", oran:"78%", adet:"42 ürün",  color:"#10b981", bar:78 },
        { s:"B", oran:"15%", adet:"68 ürün",  color:"#f59e0b", bar:15 },
        { s:"C", oran:"7%",  adet:"174 ürün", color:"#6b7280", bar:7  },
      ].map(s => (
        <div key={s.s} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{
                width:18, height:18, borderRadius:5,
                background:`${s.color}20`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:9, fontWeight:700, color:s.color
              }}>{s.s}</span>
              <span style={{ fontSize:9, color:"rgba(255,255,255,0.4)" }}>{s.adet}</span>
            </div>
            <span style={{ fontSize:9, fontWeight:700, color:s.color }}>{s.oran}</span>
          </div>
          <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${s.bar}%`, background:s.color, borderRadius:2 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── HERO KART TANIMI ────────────────────────────────────────────────────
const HERO_KART = [
  { title:"Dashboard",       color:"#38bdf8", x:-425, y:-225, rotate:-9,  w:290, h:176 },
  { title:"Talep Tahmin",    color:"#6366f1", x:-160, y:-245, rotate:-4,  w:278, h:188 },
  { title:"Stok Hareketleri", color:"#f97316", x:130, y:-232, rotate:4, w:280, h:178 },
  { title:"ABC Analizi",     color:"#f59e0b", x:420, y:-208, rotate:8,  w:285, h:176 },
  { title:"Kritik Uyarılar", color:"#ef4444", x:-315, y:42,  rotate:-6, w:270, h:170 },
  { title:"Urun Dagilimi",   color:"#0ea5e9", x:-15,  y:74,  rotate:2,  w:286, h:182 },
  { title:"Raporlar",        color:"#22d3ee", x:330,  y:46,  rotate:6,  w:276, h:170 },
]

// ─── BİREYSEL HERO KART ──────────────────────────────────────────────────
function HeroKart({ kart, index }) {
  const [hovered, setHovered] = useState(false)
  const isTop    = index < 4
  const floatKey = isTop
    ? (index % 2 === 0 ? "floatA 4s ease-in-out infinite" : "floatB 5s ease-in-out infinite")
    : (index % 2 === 0 ? "floatB 4.5s ease-in-out infinite" : "floatA 3.5s ease-in-out infinite")

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:   "absolute",
        left:       "50%",
        top:        "50%",
        transform:  hovered
          ? `translate(calc(-50% + ${kart.x}px), calc(-50% + ${kart.y}px)) rotate(0deg) scale(1.04) translateZ(30px)`
          : `translate(calc(-50% + ${kart.x}px), calc(-50% + ${kart.y}px)) rotate(${kart.rotate}deg)`,
        transition:  "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), outline-color 0.2s",
        animation:   hovered ? "none" : floatKey,
        cursor:      "pointer",
        zIndex:      hovered ? 10 : index,
        outline:     hovered ? `2px solid rgba(56,189,248,0.62)` : "2px solid transparent",
        outlineOffset: 4,
        borderRadius: 18,
      }}
    >
      <div style={{
        width:kart.w,
        height:kart.h,
        borderRadius:18,
        overflow:"hidden",
        border:"1px solid rgba(125,211,252,0.3)",
        boxShadow:"0 22px 90px rgba(0,0,0,0.48), 0 0 34px rgba(56,189,248,0.2)",
        position:"relative",
        background:"#0b1730",
      }}>
        <img src={kart.image} alt={kart.title} style={{ width:"100%", height:"100%", objectFit:"cover", filter:"saturate(1.08) contrast(1.03)" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(15,23,42,0.05), rgba(2,6,23,0.42))" }} />
        <div style={{
          position:"absolute", left:10, top:10,
          padding:"4px 9px", borderRadius:999,
          fontSize:10, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase",
          color:"rgba(224,242,254,0.94)", background:"rgba(15,23,42,0.55)", border:"1px solid rgba(125,211,252,0.35)",
        }}>
          {kart.title}
        </div>
      </div>
    </div>
  )
}

function HeroCards() {
  return (
    <div style={{ position:"relative", width:"100%", height:"100%", perspective:1200 }}>
      {HERO_KART.map((kart, i) => (
        <HeroKart key={i} kart={kart} index={i} />
      ))}
    </div>
  )
}

// ─── API URL ──────────────────────────────────────────────────────────────
const API = "/api"

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
  const [yRol,       setYRol]       = useState("görüntüleyici")
  const [yHata,      setYHata]      = useState("")
  const [yBasari,    setYBasari]    = useState("")
  const [yYuk,       setYYuk]       = useState(false)

  async function girisYap(e) {
    e.preventDefault()
    if (!email.trim() || !sifre) { setHata("Lütfen tüm alanları doldurunuz."); return }
    setYukleniyor(true); setHata("")
    try {
      const res  = await fetch(`${API}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim(), sifre }),
      })
      const veri = await res.json()
      if (!res.ok) { setHata(veri.detail || "Giriş başarısız."); return }
      localStorage.setItem("smartstock_token", veri.token)
      localStorage.setItem("smartstock_user",  JSON.stringify(veri.kullanici))
      navigate("/")
    } catch {
      setHata("Sunucuya ulaşılamadı. Backend çalışıyor mu?")
    } finally {
      setYukleniyor(false)
    }
  }

  async function kullaniciOlustur(e) {
    e.preventDefault()
    if (!yAd.trim() || !yEmail.trim() || !ySifre) { setYHata("Tüm alanları doldurunuz."); return }
    setYYuk(true); setYHata(""); setYBasari("")
    try {
      const res  = await fetch(`${API}/auth/kullanici-olustur`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: yEmail.trim(), ad: yAd.trim(), sifre: ySifre, rol: yRol }),
      })
      const veri = await res.json()
      if (!res.ok) { setYHata(veri.detail || "Oluşturulamadı."); return }
      setYBasari(`"${veri.kullanici.ad}" oluşturuldu. Şimdi giriş yapabilirsiniz.`)
      setYAd(""); setYEmail(""); setYSifre(""); setYRol("görüntüleyici")
      setTimeout(() => setMod("giris"), 1800)
    } catch {
      setYHata("Sunucuya ulaşılamadı.")
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
    <button type="button" onClick={() => { setMod(id); setHata(""); setYHata(""); setYBasari("") }}
      style={{
        flex:1, padding:"9px 0", background: mod===id ? "rgba(56,189,248,0.14)" : "transparent",
        border:"none", borderBottom: mod===id ? "2px solid #38bdf8" : "2px solid transparent",
        color: mod===id ? "#7dd3fc" : "rgba(255,255,255,0.4)",
        fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s",
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
              onChange={e => { setEmail(e.target.value); setHata("") }}
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
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.2)", textAlign:"center", marginTop:4 }}>
            Erişim yalnızca yetkili kullanıcılara açıktır.
          </p>
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
          <div>
            <label style={labelSt}>Rol</label>
            <select value={yRol} onChange={e => setYRol(e.target.value)}
              style={{ ...inputBase, cursor:"pointer" }}>
              <option value="görüntüleyici">Görüntüleyici</option>
              <option value="yönetici">Yönetici</option>
            </select>
          </div>
          {yHata && (
            <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", fontSize:13 }}>
              {yHata}
            </div>
          )}
          {yBasari && (
            <div style={{ padding:"10px 14px", borderRadius:9, background:"rgba(56,189,248,0.14)", border:"1px solid rgba(56,189,248,0.28)", color:"#7dd3fc", fontSize:13 }}>
              ✓ {yBasari}
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
// ─── APP BENTO (uygulama içi görünüm) ────────────────────────────────────
function BentoCard({ children, color, title, style = {} }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"rgba(255,255,255,0.03)",
        border: hovered ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius:14, overflow:"hidden",
        transform: hovered ? "translateY(-4px) scale(1.025)" : "none",
        transition:"all 0.22s ease",
        cursor:"default",
        ...style,
      }}
    >
      <div style={{
        padding:"7px 11px", borderBottom:"1px solid rgba(255,255,255,0.06)",
        display:"flex", alignItems:"center", gap:7,
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0 }}/>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.1em", color:"rgba(255,255,255,0.45)", textTransform:"uppercase" }}>
          {title}
        </span>
      </div>
      <div style={{ padding:"9px 11px" }}>{children}</div>
    </div>
  )
}

function AppBento() {
  const miniKpi = { background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"5px 7px" }
  const kpiVal  = (c) => ({ fontSize:13, fontWeight:700, color:c })
  const kpiLbl  = { fontSize:9, color:"rgba(255,255,255,0.38)", marginTop:1 }
  const row     = { display:"flex", justifyContent:"space-between", alignItems:"center",
                    padding:"4px 0", borderBottom:"1px solid rgba(255,255,255,0.05)",
                    fontSize:10, color:"rgba(255,255,255,0.55)" }
  const badge   = (c,bg) => ({ fontSize:9, padding:"1px 6px", borderRadius:5, fontWeight:600, color:c, background:bg })

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(6,1fr)",
      gridTemplateRows:"auto auto",
      gap:8,
      padding:"16px 24px",
      width:"100%",
    }}>

      {/* Dashboard — geniş */}
      <BentoCard title="Dashboard" color="#38bdf8" style={{ gridColumn:"span 4" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5, marginBottom:7 }}>
          {[
            { v:"284", l:"Ürün",       c:"#38bdf8" },
            { v:"12",  l:"Kritik",     c:"#ef4444" },
            { v:"₺2.4M",l:"Stok Değ.", c:"#f59e0b" },
            { v:"%38", l:"Ort. Marj",  c:"#10b981" },
          ].map(k => (
            <div key={k.l} style={miniKpi}>
              <div style={kpiVal(k.c)}>{k.v}</div>
              <div style={kpiLbl}>{k.l}</div>
            </div>
          ))}
        </div>
        <svg width="100%" height="30" viewBox="0 0 280 30" preserveAspectRatio="none">
          <polyline points="0,26 40,20 80,23 120,13 160,16 200,8 240,11 280,6"
            fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round"/>
          <polygon points="0,26 40,20 80,23 120,13 160,16 200,8 240,11 280,6 280,30 0,30"
            fill="#38bdf8" opacity="0.07"/>
        </svg>
      </BentoCard>

      {/* Talep Tahmini */}
      <BentoCard title="Talep Tahmini" color="#6366f1" style={{ gridColumn:"span 2" }}>
        <svg width="100%" height="34" viewBox="0 0 110 34" preserveAspectRatio="none">
          <polyline points="0,28 28,22 55,25 78,16 90,18"
            fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
          <polyline points="90,18 100,12 110,8"
            fill="none" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
        </svg>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginTop:5 }}>
          <div style={miniKpi}><div style={kpiVal("#6366f1")}>133</div><div style={kpiLbl}>30g Tahmin</div></div>
          <div style={miniKpi}><div style={kpiVal("#fff")}>%90.9</div><div style={kpiLbl}>Doğruluk</div></div>
        </div>
      </BentoCard>

      {/* Hareketler */}
      <BentoCard title="Hareketler" color="#10b981" style={{ gridColumn:"span 2" }}>
        {[
          { ad:"Seramik Karo",   m:"+500", g:true  },
          { ad:"Ahşap Laminat",  m:"-120", g:false },
          { ad:"Vinil Döşeme",   m:"-85",  g:false },
          { ad:"Granit Tezgah",  m:"+200", g:true  },
        ].map(h => (
          <div key={h.ad} style={row}>
            <span>{h.ad}</span>
            <span style={badge(h.g?"#10b981":"#ef4444", h.g?"rgba(16,185,129,0.12)":"rgba(239,68,68,0.12)")}>{h.m}</span>
          </div>
        ))}
      </BentoCard>

      {/* EOQ */}
      <BentoCard title="EOQ Analizi" color="#ec4899" style={{ gridColumn:"span 2" }}>
        <div style={{ textAlign:"center", padding:"4px 0 6px" }}>
          <div style={{ fontSize:24, fontWeight:900, color:"#ec4899", letterSpacing:"-1px", lineHeight:1 }}>342</div>
          <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)", marginTop:2 }}>optimal sipariş / adet</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          <div style={miniKpi}><div style={kpiVal("#fff")}>4,200</div><div style={kpiLbl}>Yıllık talep</div></div>
          <div style={miniKpi}><div style={kpiVal("#fff")}>₺85</div><div style={kpiLbl}>Sipariş mlt.</div></div>
        </div>
      </BentoCard>

      {/* Ürün Yönetimi */}
      <BentoCard title="Ürün Yönetimi" color="#f59e0b" style={{ gridColumn:"span 2" }}>
        {[
          { ad:"Seramik Karo",  stok:"1,240", kritik:false },
          { ad:"Ahşap Laminat", stok:"890",   kritik:false },
          { ad:"Vinil Döşeme",  stok:"42",    kritik:true  },
          { ad:"Granit Tezgah", stok:"8",     kritik:true  },
        ].map(u => (
          <div key={u.ad} style={row}>
            <span>{u.ad}</span>
            <span style={{ fontSize:10, fontWeight:700, color: u.kritik ? "#ef4444" : "rgba(255,255,255,0.7)" }}>
              {u.stok}{u.kritik ? " ⚠" : ""}
            </span>
          </div>
        ))}
      </BentoCard>

      {/* ABC */}
      <BentoCard title="ABC Raporu" color="#22c55e" style={{ gridColumn:"span 2" }}>
        {[
          { sınıf:"A", pct:70, c:"#22c55e" },
          { sınıf:"B", pct:20, c:"#f59e0b" },
          { sınıf:"C", pct:10, c:"rgba(255,255,255,0.3)" },
        ].map(s => (
          <div key={s.sınıf} style={{ display:"flex", alignItems:"center", gap:7, padding:"3px 0" }}>
            <span style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.7)", width:10 }}>{s.sınıf}</span>
            <div style={{ flex:1, height:4, borderRadius:3, background:"rgba(255,255,255,0.08)", overflow:"hidden" }}>
              <div style={{ width:`${s.pct}%`, height:"100%", borderRadius:3, background:s.c }}/>
            </div>
            <span style={{ fontSize:9, color:"rgba(255,255,255,0.45)", width:24 }}>%{s.pct}</span>
          </div>
        ))}
        <div style={{ marginTop:6 }}>
          <span style={{ fontSize:9, padding:"2px 7px", borderRadius:5, background:"rgba(34,197,94,0.12)", color:"#22c55e", fontWeight:600 }}>
            34 A-sınıfı ürün
          </span>
        </div>
      </BentoCard>

    </div>
  )
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────
const MARQUEE_ITEMS = [
  "📦 Stok Yönetimi", "📐 EOQ Hesaplama", "📊 ABC Analizi",
  "⚠️ Kritik Stok Uyarısı", "📈 Talep Tahmini", "🔄 Giriş / Çıkış Takibi",
  "🎯 %90+ Model Doğruluğu", "📅 30/60/90 Gün Tahmin",
  "🏭 Tedarikçi Takibi", "💰 Maliyet Optimizasyonu", "📉 Pareto Analizi",
  "🔔 Otomatik Uyarılar", "📋 Sipariş Yönetimi", "🧮 Kâr Marjı Takibi",
]

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
          background:"rgba(6,12,7,0.97)",
          border:`1px solid ${s.mockColor}30`,
          borderRadius:18, overflow:"hidden",
          boxShadow:`0 24px 80px rgba(0,0,0,0.5), 0 0 40px ${s.mockColor}12`,
          width:260,
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
          <div style={{ padding:20, display:"flex", flexDirection:"column", gap:8 }}>
            {[60,28,40].map((w,ii) => (
              <div key={ii} style={{
                height: ii===0 ? 36 : 22, borderRadius:8,
                background: ii===0 ? `${s.mockColor}18` : "rgba(255,255,255,0.04)",
                border: ii===0 ? `1px solid ${s.mockColor}30` : "none",
                width:`${w+40}%`
              }}/>
            ))}
            <div style={{ height:4, borderRadius:2, background:s.mockColor, width:"60%", opacity:0.6, marginTop:4 }}/>
          </div>
        </div>
      </div>
    </div>
  )
}

const SCROLL_SECTIONS = [
  {
    chip:"ML TAHMİN", chipColor:T.indigo,
    title:"Ridge Regression ile geleceği öngörün",
    bullets:[
      "Mevsimsellik, haftanın günü ve trend özelliklerini otomatik öğrenir",
      "30, 60 ve 90 günlük tahmin ufukları tek ekranda",
      "Güven bandı ile üst/alt sınır gösterimi",
    ],
    mockColor:T.indigo, mockTitle:"TALEP TAHMİN",
  },
  {
    chip:"EOQ OPTİMİZASYON", chipColor:T.pink,
    title:"Wilson formülüyle optimal sipariş miktarı",
    bullets:[
      "Tutma ve sipariş maliyetlerini otomatik dengeler",
      "Yıllık tasarruf ve yeniden sipariş noktasını gösterir",
      "Her ürün için ayrı parametreler tanımlanabilir",
    ],
    mockColor:T.pink, mockTitle:"EOQ HESAPLAMA",
  },
  {
    chip:"STOK TAKİP", chipColor:T.orange,
    title:"Gerçek zamanlı stok giriş/çıkış takibi",
    bullets:[
      "Tedarikçi ve müşteri bazlı hareket kayıtları",
      "Fatura numarası ile tam iz sürülebilirlik",
      "Otomatik stok seviyesi güncelleme",
    ],
    mockColor:T.orange, mockTitle:"STOK HAREKETLERİ",
  },
  {
    chip:"ABC ANALİZİ", chipColor:T.amber,
    title:"Envanterinizi A/B/C sınıflarına ayırın",
    bullets:[
      "Stok değerine göre otomatik Pareto sınıflandırma",
      "A sınıfı ürünlere öncelikli odaklanma",
      "Kategori bazlı dağılım görselleştirme",
    ],
    mockColor:T.amber, mockTitle:"ABC ANALİZİ",
  },
  {
    chip:"UYARI SİSTEMİ", chipColor:"#ef4444",
    title:"Kritik stok uyarıları ile hiç stockout yaşamayın",
    bullets:[
      "Min. stok seviyesini geçen ürünler otomatik işaretlenir",
      "Dashboard'da anlık kritik ürün listesi",
      "EOQ ile birleşik sipariş önerisi",
    ],
    mockColor:"#ef4444", mockTitle:"KRİTİK STOK",
  },
]

// ─── BENTO KART ───────────────────────────────────────────────────────────
function BentoKart({ item }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        gridColumn: item.span === 2 ? "span 2" : "span 1",
        padding:24, borderRadius:20,
        border:`1px solid ${hover ? item.color+"50" : T.border}`,
        background: hover ? `${item.color}06` : "rgba(255,255,255,0.02)",
        transition:"border-color 0.2s, background 0.2s", cursor:"default"
      }}>
      <div style={{
        width:38, height:38, borderRadius:11,
        background:`${item.color}18`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:18, marginBottom:12
      }}>{item.icon}</div>
      <div style={{ fontSize:14, fontWeight:700, marginBottom:6 }}>{item.title}</div>
      <div style={{ fontSize:12, color:T.muted, lineHeight:1.5 }}>{item.desc}</div>
      {item.mini}
    </div>
  )
}

const BENTO_ITEMS = [
  {
    title:"Ridge Regression", desc:"Mevsimsel özelliklerle 30–90 günlük talep tahmini",
    icon:"🤖", color:T.indigo, span:1,
    mini:(
      <div style={{ marginTop:12 }}>
        <svg width="100%" height="40" viewBox="0 0 200 40">
          <polyline points="0,35 40,28 80,32 120,15 160,18 200,8"
            fill="none" stroke={T.indigo} strokeWidth="2" strokeLinecap="round"/>
          <polyline points="120,15 160,18 200,8"
            fill="none" stroke={T.indigo} strokeWidth="2" strokeDasharray="4 3" opacity="0.5"/>
        </svg>
      </div>
    )
  },
  {
    title:"EOQ Optimizasyon", desc:"Wilson formülü ile minimum maliyetli sipariş miktarı",
    icon:"📐", color:T.pink, span:1,
    mini:(
      <div style={{ textAlign:"center", marginTop:8 }}>
        <div style={{ fontSize:28, fontWeight:900, color:T.pink, letterSpacing:"-1px" }}>342</div>
        <div style={{ fontSize:10, color:"rgba(255,255,255,0.35)" }}>optimal adet</div>
      </div>
    )
  },
  {
    title:"145K+ Stok Hareketi", desc:"Gerçek zamanlı stok giriş/çıkış ve maliyet takibi",
    icon:"🔄", color:T.orange, span:1,
    mini:(
      <div style={{ display:"flex", gap:5, marginTop:10, alignItems:"flex-end" }}>
        {[62,84,51,78,93,67,45].map((h,i) => (
          <div key={i} style={{
            flex:1, height:h*0.55, borderRadius:4,
            background: i%2===0 ? `${T.primary}70` : `${T.orange}70`,
          }}/>
        ))}
      </div>
    )
  },
  {
    title:"ABC Sınıflandırma", desc:"Pareto analizine göre A/B/C ürün kategorileri",
    icon:"📊", color:T.amber, span:2,
    mini:(
      <div style={{ display:"flex", gap:12, marginTop:12 }}>
        {[
          { s:"A", pct:78, color:T.primary  },
          { s:"B", pct:15, color:T.amber    },
          { s:"C", pct:7,  color:"#6b7280"  },
        ].map(s => (
          <div key={s.s} style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:11, fontWeight:700, color:s.color }}>{s.s}</span>
              <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{s.pct}%</span>
            </div>
            <div style={{ height:4, background:"rgba(255,255,255,0.08)", borderRadius:2, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${s.pct}%`, background:s.color, borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
    )
  },
  {
    title:"Kritik Stok Uyarısı", desc:"Min. seviye altındaki ürünler için anlık uyarı sistemi",
    icon:"⚠️", color:"#ef4444", span:1,
    mini:(
      <div style={{
        marginTop:10, padding:"8px 12px", borderRadius:10,
        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
        fontSize:12, color:"#fca5a5", fontWeight:600, textAlign:"center"
      }}>3 ürün kritik seviyede</div>
    )
  },
  {
    title:"Dashboard Analytics", desc:"Stok değeri, marj, giriş/çıkış KPI'ları tek bakışta",
    icon:"📈", color:T.primary, span:1,
    mini:(
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginTop:8 }}>
        {[
          { v:"₺2.4M", l:"Stok Değeri", c:T.primary },
          { v:"%38",   l:"Ort. Marj",   c:T.indigo  },
        ].map(k => (
          <div key={k.l} style={{ background:"rgba(255,255,255,0.04)", borderRadius:8, padding:"7px 8px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:9, color:"rgba(255,255,255,0.35)" }}>{k.l}</div>
          </div>
        ))}
      </div>
    )
  },
]

// ─── ANA COMPONENT ────────────────────────────────────────────────────────
export default function Login() {
  return (
    <div style={{ background:T.bg, color:T.text, fontFamily:"system-ui,-apple-system,sans-serif", overflowX:"hidden" }}>
      <style>{`
        @keyframes marq   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes floatA { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-10px) rotate(-2deg)} }
        @keyframes floatB { 0%,100%{transform:translateY(0) rotate(1.5deg)} 50%{transform:translateY(8px) rotate(1.5deg)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        *{box-sizing:border-box; margin:0; padding:0}
        .hero-shell{display:flex;height:calc(100vh - 74px);min-height:620px}
        .hero-left{flex:1;position:relative;overflow:hidden;display:flex;flex-direction:column}
        .hero-right{
          width:clamp(380px,32vw,520px);flex-shrink:0;
          background:linear-gradient(165deg,rgba(9,18,34,0.98) 0%, rgba(10,24,42,0.98) 65%, rgba(7,14,30,0.98) 100%);
          border-left:1px solid rgba(125,211,252,0.2);
          display:flex;flex-direction:column;justify-content:center;padding:48px 40px;overflow-y:auto;
          box-shadow:inset 0 0 120px rgba(14,165,233,0.08);
        }
        @media (max-width: 1200px){
          .hero-right{width:clamp(350px,38vw,460px);padding:38px 30px}
        }
        @media (max-width: 980px){
          .hero-shell{flex-direction:column;height:auto;min-height:70vh}
          .hero-left{min-height:68vh}
          .hero-right{width:100%;border-left:none;border-top:1px solid rgba(125,211,252,0.2)}
        }
      `}</style>

      {/* ── 1. HERO ──────────────────────────────────────────────────── */}
      <section className="hero-shell">

        {/* SOL */}
        <div className="hero-left" style={{
          background:"linear-gradient(160deg,#071123 0%,#0b1b3a 45%,#050c1d 100%)",
        }}>
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:"linear-gradient(rgba(125,211,252,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(125,211,252,0.06) 1px,transparent 1px)",
            backgroundSize:"48px 48px",
          }}/>
          <div style={{
            position:"absolute", top:"32%", left:"44%",
            width:540, height:540, borderRadius:"50%", pointerEvents:"none",
            background:`radial-gradient(circle,${GLACIER.glow} 0%,transparent 70%)`,
            transform:"translate(-50%,-50%)"
          }}/>
          <div style={{
            position:"absolute", bottom:"16%", left:"22%",
            width:420, height:420, borderRadius:"50%", pointerEvents:"none",
            background:"radial-gradient(circle,rgba(59,130,246,0.16) 0%,transparent 72%)",
            transform:"translate(-50%,50%)"
          }}/>
          <div style={{ position:"relative", zIndex:2, padding:"28px 32px" }}>
            <span style={{
              fontSize:10, fontWeight:700, letterSpacing:"0.12em",
              color:GLACIER.ice, textTransform:"uppercase",
              padding:"5px 12px", border:`1px solid ${GLACIER.ice}50`,
              borderRadius:20, background:"rgba(125,211,252,0.12)"
            }}>Uygulama İçi Görünüm</span>
          </div>
          <div style={{ flex:1, position:"relative", zIndex:2, display:"flex", alignItems:"center" }}>
            <AppBento />
          </div>
        </div>

        {/* SAĞ — Login */}
        <div className="hero-right">
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{
              width:40, height:40, background:`${T.primary}20`,
              border:`1px solid ${T.primary}40`, borderRadius:12,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20
            }}>📦</div>
            <div>
              <div style={{ fontSize:20, fontWeight:900, letterSpacing:"-0.5px" }}>
                Smart<span style={{ color:T.primary }}>Stock</span>
              </div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", marginTop:1 }}>Akıllı Envanter Yönetimi</div>
            </div>
            <span style={{
              marginLeft:8, fontSize:9, fontWeight:700,
              padding:"3px 8px", borderRadius:20,
              background:`${T.primary}20`, color:T.primary,
              border:`1px solid ${T.primary}30`, letterSpacing:"0.06em"
            }}>AI</span>
          </div>

          <div style={{ marginBottom:24, marginTop:20 }}>
            <h1 style={{ fontSize:26, fontWeight:900, letterSpacing:"-1px", marginBottom:6 }}>
              Tekrar hoşgeldiniz 👋
            </h1>
            <p style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>
              ML destekli stok yönetimi için hesabınıza giriş yapın.
            </p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
            {[
              { e:"🤖", t:"Ridge Regression talep tahmini"     },
              { e:"📐", t:"EOQ ile optimal sipariş miktarı"    },
              { e:"⚠️", t:"Otomatik kritik stok uyarıları"     },
            ].map(f => (
              <div key={f.t} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{
                  width:28, height:28, borderRadius:8,
                  background:`${T.primary}15`, border:`1px solid ${T.primary}25`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:13, flexShrink:0
                }}>{f.e}</span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{f.t}</span>
              </div>
            ))}
          </div>

          <LoginForm />

          <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", textAlign:"center", marginTop:24 }}>
            SmartStock
          </p>
        </div>
      </section>

      {/* ── 2. MARQUEE ───────────────────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`,
        background:"rgba(255,255,255,0.02)", padding:"12px 0", overflow:"hidden", minHeight:74
      }}>
        <div style={{ display:"flex", animation:"marq 28s linear infinite", width:"max-content" }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item,i) => (
            <span key={i} style={{
              padding:"6px 16px", margin:"0 6px",
              background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`,
              borderRadius:20, fontSize:12, fontWeight:500,
              color:"rgba(255,255,255,0.65)", whiteSpace:"nowrap", flexShrink:0
            }}>{item}</span>
          ))}
        </div>
      </section>

      {/* ── 3. SCROLLYTELLING ────────────────────────────────────────── */}
      <section style={{ padding:"100px 80px", maxWidth:1200, margin:"0 auto",
        background:"linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.04) 40%, rgba(56,189,248,0.04) 60%, transparent 100%)" }}>
        <div style={{ textAlign:"center", marginBottom:72 }}>
          <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px" }}>
            Tek platformda tam kontrol
          </h2>
          <p style={{ fontSize:15, color:T.muted, marginTop:12 }}>
            Makine öğrenmesinden EOQ optimizasyonuna kadar tüm araçlar bir arada.
          </p>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:80 }}>
          {SCROLL_SECTIONS.map((s,i) => (
            <ScrollSection key={i} s={s} index={i} />
          ))}
        </div>
      </section>

      {/* ── 4. BENTO GRID ────────────────────────────────────────────── */}
      <section style={{
        padding:"80px 80px", maxWidth:1200, margin:"0 auto",
        borderTop:`1px solid ${T.border}`,
        background:"rgba(56,189,248,0.03)"
      }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <h2 style={{ fontSize:"clamp(24px,3vw,38px)", fontWeight:900, letterSpacing:"-1px" }}>
            Her şey dahil
          </h2>
          <p style={{ fontSize:14, color:T.muted, marginTop:10 }}>
            Bir envanter yöneticisinin ihtiyacı olan her özellik.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
          {BENTO_ITEMS.map((item,i) => (
            <BentoKart key={i} item={item} />
          ))}
        </div>
      </section>

      {/* ── 5. FINAL CTA ─────────────────────────────────────────────── */}
      <section style={{
        borderTop:`1px solid ${T.border}`,
        padding:"80px 64px", textAlign:"center"
      }}>
        <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:900, letterSpacing:"-1px", marginBottom:12 }}>
          Hemen başlayın
        </h2>
        <p style={{ fontSize:14, color:T.muted, marginBottom:40 }}>
          Dakikalar içinde giriş yapıp tüm özellikleri deneyimleyin.
        </p>
        <div style={{
          maxWidth:480, margin:"0 auto",
          border:`1px solid ${T.border}`, borderRadius:20,
          padding:32, background:"rgba(255,255,255,0.02)"
        }}>
          <LoginForm compact />
        </div>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", marginTop:40 }}>
          SmartStock
        </p>
      </section>
    </div>
  )
}

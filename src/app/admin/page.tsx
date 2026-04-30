"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, CreditCard, FileText, Phone, Crown,
  RefreshCw, Users, Stamp, Gift, TrendingUp, Download,
  Search, CheckCircle, Plus, Star, Smartphone
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

/* ── Types ── */
interface Stats {
  activeCustomersToday: number; stampsToday: number;
  returningPercentage: number; totalCustomers: number;
  last7Days: { label: string; count: number }[];
  rewardsTotal: number; stampsTotal: number;
}
interface Campaign { requiredStamps: number; isActive: boolean; giftDescription: string; cardColor: string; businessName?: string; logo?: string; }
interface Customer { id: string; stamps: number; lastStampAt: number | null; createdAt: number; phone?: string; }
interface LogEntry  { id: string; customerId: string; timestamp: number; cashierId: string; action: "stamp"|"redeem"; }

type Section = "overview" | "card" | "logs" | "phones" | "stand" | "preview" | "cashier";

const COLORS = ["#6366F1","#8B5CF6","#EC4899","#F59E0B","#10B981","#0EA5E9","#EF4444","#0F172A"];
const GIFTS  = ["1 Bedava Kahve","1 Bedava Tatlı","İndirim Kuponu","Sürpriz Hediye","1 Bedava İçecek","Ücretsiz Menü"];
const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id:"overview", label:"Panel Özeti",         icon:<LayoutDashboard size={18}/> },
  { id:"card",     label:"Sadakat Kartı",        icon:<CreditCard size={18}/> },
  { id:"stand",    label:"Masa QR Standı",       icon:<Smartphone size={18}/> },
  { id:"logs",     label:"Log Kayıtları",        icon:<FileText size={18}/> },
  { id:"phones",   label:"Telefon Numaraları",   icon:<Phone size={18}/> },
  { id:"cashier",  label:"Kasiyer Paneli",       icon:<Star size={18}/> },
];

/* ── Toast ── */
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[onClose]);
  return <div className={`toast ${type}`}>{type==="success"?<CheckCircle size={15}/>:null} {msg}</div>;
}

/* ── Bar Chart ── */
function BarChart({ data }: { data:{label:string;count:number}[] }) {
  const max = Math.max(...data.map(d=>d.count), 1);
  return (
    <div className="bar-chart">
      {data.map((d,i)=>(
        <div key={i} className="bar-chart-col">
          <div className="bar-chart-bar" style={{height:`${(d.count/max)*100}%`}} title={`${d.count} damga`}/>
          <span className="bar-chart-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── 3D Card Preview ── */
function CardPreview({ color, stamps, gift, logo, businessName }: { color:string; stamps:number; gift:string; logo?:string; businessName?:string }) {
  const name = businessName || 'İşletmem';
  const initials = name.slice(0,2).toUpperCase();
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
    setGlare({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div style={{ perspective: "1000px", padding: "1.5rem 1rem", width: "100%", display: "flex", justifyContent: "center" }}>
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: "100%", maxWidth: "340px", aspectRatio: "1.586 / 1",
          borderRadius: "20px", position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale(${isHovered ? 1.02 : 1})`,
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
          background: `linear-gradient(135deg, ${color}, #1A1A24)`,
          boxShadow: isHovered 
            ? "0 30px 60px -12px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.3)"
            : "0 20px 40px -10px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
          overflow: "hidden", cursor: "pointer",
          display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "1.25rem",
          color: "white"
        }}
      >
        {/* Glare Effect */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          transition: isHovered ? "none" : "opacity 0.5s ease"
        }} />

        {/* Noise Texture */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: 0.05,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />

        {/* Content (Z-index ensures it's above glare and noise) */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Brand Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center",
              overflow: "hidden", flexShrink: 0, backdropFilter: "blur(4px)"
            }}>
              {logo
                ? <img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:"0.8rem",fontWeight:800,color:"white"}}>{initials}</span>
              }
            </div>
            <div style={{ transform: "translateZ(10px)" }}>
              <div style={{fontSize:"0.6rem",fontWeight:600,color:"rgba(255,255,255,0.6)",letterSpacing:"0.1em",textTransform:"uppercase"}}>Sadakat Cüzdanı</div>
              <div style={{fontSize:"0.85rem",fontWeight:800,letterSpacing:"-0.02em"}}>{name}</div>
            </div>
          </div>
          
          {/* NFC/Contactless Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
            <path d="M4 8.5C6.5 6 9.5 5 12 5C14.5 5 17.5 6 20 8.5M6 11.5C8 10 10 9 12 9C14 9 16 10 18 11.5M8 14.5C9.5 13.5 10.5 13 12 13C13.5 13 14.5 13.5 16 14.5M10 17.5C10.5 17 11 17 12 17C13 17 13.5 17 14 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Center: Customer Name (Mock) */}
        <div style={{ position: "relative", zIndex: 3, transform: "translateZ(20px)", marginTop: "1rem" }}>
          <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.6)",fontWeight:600,letterSpacing:"0.05em"}}>MÜŞTERİ</div>
          <div style={{fontSize:"1.4rem",fontWeight:800,letterSpacing:"-0.03em",textShadow:"0 2px 4px rgba(0,0,0,0.3)"}}>Örnek İsim</div>
        </div>

        {/* Footer Row */}
        <div style={{ position: "relative", zIndex: 3, display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: "1rem" }}>
          <div style={{ transform: "translateZ(15px)" }}>
            <div style={{fontSize:"0.65rem",color:"rgba(255,255,255,0.6)",fontWeight:600,letterSpacing:"0.05em",marginBottom:"0.2rem"}}>DURUM</div>
            <div style={{display:"flex",alignItems:"baseline",gap:"0.3rem"}}>
              <span style={{fontSize:"1.25rem",fontWeight:800}}>{stamps}</span>
              <span style={{fontSize:"0.8rem",fontWeight:600,color:"rgba(255,255,255,0.8)"}}>/ {stamps} DAMGA</span>
            </div>
          </div>
          
          {/* Mini QR */}
          <div style={{
            background: "rgba(255,255,255,0.9)", padding: "4px", borderRadius: "8px", 
            transform: "translateZ(10px)", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}>
            <QRCodeSVG value="preview" size={40} level="L" fgColor="#1A1A24" bgColor="transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════ MAIN ══════════ */
export default function AdminDashboard() {
  const router = useRouter();
  const [section,    setSection]    = useState<Section>("overview");
  const [stats,      setStats]      = useState<Stats|null>(null);
  const [campaign,   setCampaign]   = useState<Campaign|null>(null);
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [logs,       setLogs]       = useState<LogEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    const ok = localStorage.getItem("admin_auth") === "true" || document.cookie.includes("admin_auth=true");
    if (!ok) router.replace("/login");
  }, [router]);
  const [saving,     setSaving]     = useState(false);
  const [logPeriod,  setLogPeriod]  = useState<"today"|"week"|"all">("all");
  const [phoneSearch,setPhoneSearch]= useState("");
  const [newPhone,   setNewPhone]   = useState({customerId:"",phone:""});
  const [toast,      setToast]      = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [logPage,    setLogPage]    = useState(1);
  const PER_PAGE = 20;

  const showToast = (msg:string, type:"success"|"error"="success") => setToast({msg,type});

  const fetchAll = useCallback(async (quiet=false) => {
    if (!quiet) setRefreshing(true);
    try {
      const [adminRes, logsRes] = await Promise.all([
        fetch("/api/admin"), fetch(`/api/admin/logs?period=${logPeriod}`)
      ]);
      const adminData = await adminRes.json();
      const logsData  = await logsRes.json();
      if (adminData.success) { setStats(adminData.stats); setCampaign(adminData.campaign); setCustomers(adminData.customers); }
      if (logsData.success)  setLogs(logsData.logs);
    } finally { setLoading(false); setRefreshing(false); }
  }, [logPeriod]);

  useEffect(()=>{ setTimeout(() => fetchAll(), 0); }, [fetchAll]);

  /* Refetch logs when period changes */
  useEffect(()=>{
    fetch(`/api/admin/logs?period=${logPeriod}`)
      .then(r=>r.json()).then(d=>{ if(d.success) setLogs(d.logs); });
  },[logPeriod]);

  const saveCampaign = async () => {
    if (!campaign) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/campaign",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(campaign)});
      if (res.ok) showToast("Kart ayarları kaydedildi!");
      else showToast("Hata oluştu","error");
    } finally { setSaving(false); }
  };

  const savePhone = async () => {
    if (!newPhone.customerId || !newPhone.phone) return showToast("ID ve telefon zorunlu","error");
    try {
      const res = await fetch("/api/admin/phones",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newPhone)});
      const d = await res.json();
      if (d.success) { showToast("Telefon kaydedildi!"); setNewPhone({customerId:"",phone:""}); fetchAll(true); }
      else showToast(d.error||"Hata","error");
    } catch { showToast("Hata oluştu","error"); }
  };

  const exportCSV = () => {
    const rows = ["ID,İşlem,Zaman,Kasiyer",...logs.map(l=>`${l.customerId},${l.action},${new Date(l.timestamp).toLocaleString("tr-TR")},${l.cashierId}`)];
    const blob = new Blob([rows.join("\n")],{type:"text/csv"});
    const a = document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="logs.csv"; a.click();
  };

  /* Computed */
  const filteredPhones = customers.filter(c=> c.id.toLowerCase().includes(phoneSearch.toLowerCase()) || (c.phone||"").includes(phoneSearch));
  const pagedLogs      = logs.slice((logPage-1)*PER_PAGE, logPage*PER_PAGE);
  const totalPages     = Math.ceil(logs.length/PER_PAGE);

  const topbar: Record<Section,{title:string;sub:string}> = {
    overview:{ title:"Panel Özeti",         sub:"İşletmenizin anlık performansı" },
    card:    { title:"Sadakat Kartı Oluştur", sub:"Kart tasarımı ve kampanya ayarları" },
    stand:   { title:"Masa QR Standı",        sub:"Müşterilerin kayıt olacağı QR kod" },
    logs:    { title:"Log Kayıtları",         sub:"Tüm damga ve ödül işlemleri" },
    phones:  { title:"Telefon Numaraları",    sub:"Kart sahibi telefon yönetimi" },
    preview: { title:"Müşteri Kartı",         sub:"Müşteri kartı önizlemesi ve QR linki" },
    cashier: { title:"Kasiyer Paneli",        sub:"Kasiyer ekranını incele ve test et" },
  };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"#F1F5F9"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
        <div style={{width:40,height:40,border:"3px solid #E2E8F0",borderTopColor:"#6366F1",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
        <span style={{color:"#94A3B8",fontSize:"0.875rem",fontWeight:600}}>Yükleniyor...</span>
      </div>
    </div>
  );

  return (
    <div className="admin-shell">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="sb-overlay" onClick={()=>setSidebarOpen(false)}/>}

      {/* ── SIDEBAR ── */}
      <aside className={`admin-sidebar${sidebarOpen?" sidebar-open":""}`}>
        <div className="sb-logo">
          <div className="sb-logo-icon">S</div>
          <div className="sb-logo-text">
            <span className="sb-logo-name">SadakatPro</span>
            <span className="sb-logo-sub">Admin Panel</span>
          </div>
        </div>

        <div className="sb-section-label">YÖNETİM</div>
        <nav className="sb-nav">
          {SECTIONS.map(s=>(
            <button key={s.id} className={`sb-item ${section===s.id?"active":""}`} onClick={()=>{setSection(s.id);setSidebarOpen(false);}}>
              <span className="sb-item-icon">{s.icon}</span>
              {s.label}
              {s.id==="logs" && logs.length>0 && <span className="sb-item-badge">{logs.length}</span>}
            </button>
          ))}
        </nav>

        {/* Subscription Footer */}
        <div className="sb-footer">
          <div className="sb-subscription">
            <div className="sb-plan-badge"><Crown size={10}/> Pro Plan</div>
            <div className="sb-plan-name">İşletme Paketi</div>
            <div className="sb-plan-detail">
              {stats?.totalCustomers||0} / 500 müşteri<br/>
              Yenileme: 28 Mayıs 2026
            </div>
            <button className="sb-upgrade-btn">Enterprise&apos;a Yükselt →</button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">
        {/* Topbar */}
        <div className="admin-topbar">
          <div style={{display:"flex",alignItems:"center"}}>
            <button className="admin-hamburger" onClick={()=>setSidebarOpen(o=>!o)} aria-label="Menü">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <div className="admin-topbar-title">{topbar[section].title}</div>
              <div className="admin-topbar-sub">{topbar[section].sub}</div>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <button className={`icon-btn ${refreshing?"spinning":""}`} onClick={()=>fetchAll()} title="Yenile">
              <RefreshCw size={16}/>
            </button>
          </div>
        </div>

        {/* ════ OVERVIEW ════ */}
        {section==="overview" && stats && (
          <div className="admin-page">
            {/* KPI Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-label">Toplam Müşteri
                  <div className="kpi-icon" style={{background:"#EEF2FF"}}><Users size={16} color="#6366F1"/></div>
                </div>
                <div className="kpi-value">{stats.totalCustomers}</div>
                <div className="kpi-meta">Kayıtlı kart sahibi</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Bugün Damga
                  <div className="kpi-icon" style={{background:"#FEF3C7"}}><Stamp size={16} color="#F59E0B"/></div>
                </div>
                <div className="kpi-value">{stats.stampsToday}</div>
                <div className="kpi-meta kpi-trend-up">↑ Aktif gün</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Geri Dönüş
                  <div className="kpi-icon" style={{background:"#ECFDF5"}}><TrendingUp size={16} color="#10B981"/></div>
                </div>
                <div className="kpi-value">{stats.returningPercentage}%</div>
                <div className="kpi-meta">Tekrar gelen müşteri</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-label">Ödül Kullanım
                  <div className="kpi-icon" style={{background:"#FDF2F8"}}><Gift size={16} color="#EC4899"/></div>
                </div>
                <div className="kpi-value">{stats.rewardsTotal}</div>
                <div className="kpi-meta">Toplam hediye</div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="content-grid-3" style={{marginBottom:"1.25rem"}}>
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">Son 7 Gün — Damga Trendi</span>
                  <span style={{fontSize:"0.75rem",color:"#94A3B8"}}>Günlük</span>
                </div>
                <div className="panel-card-body">
                  <BarChart data={stats.last7Days}/>
                </div>
              </div>
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">Genel Özet</span>
                </div>
                <div className="panel-card-body" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                  {[
                    {label:"Toplam Damga", val:stats.stampsTotal, color:"#6366F1"},
                    {label:"Ödül Kullanıldı", val:stats.rewardsTotal, color:"#10B981"},
                    {label:"Bugün Aktif", val:stats.activeCustomersToday, color:"#F59E0B"},
                  ].map(item=>(
                    <div key={item.label}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.78rem",fontWeight:600,marginBottom:"0.375rem"}}>
                        <span style={{color:"#64748B"}}>{item.label}</span>
                        <span style={{color:"#0F172A"}}>{item.val}</span>
                      </div>
                      <div style={{height:6,background:"#F1F5F9",borderRadius:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.min((item.val/(Math.max(stats.stampsTotal,1)))*100,100)}%`,background:item.color,borderRadius:4,transition:"width 0.8s"}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="panel-card">
              <div className="panel-card-header">
                <span className="panel-card-title">Son İşlemler</span>
                <button className="filter-btn" onClick={()=>setSection("logs")}>Tümünü Gör →</button>
              </div>
              {logs.length===0
                ? <div className="empty-state"><FileText size={40}/><p>Henüz işlem yok.</p></div>
                : <div className="activity-list">
                    {logs.slice(0,8).map(l=>(
                      <div key={l.id} className="activity-item">
                        <div className={`activity-dot ${l.action}`}/>
                        <div className="activity-info">
                          <div className="activity-action">{l.action==="stamp"?"Damga Basıldı":"Ödül Kullanıldı"}</div>
                          <div className="activity-sub">{l.customerId.slice(0,8)}...</div>
                        </div>
                        <div className="activity-time">{new Date(l.timestamp).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        {/* ════ CARD CREATOR ════ */}
        {section==="card" && campaign && (
          <div className="admin-page">
            <div className="panel-card">
              <div className="panel-card-header">
                <span className="panel-card-title">Sadakat Kartı Ayarları</span>
                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                  <span style={{fontSize:"0.75rem",color:"#64748B"}}>Kampanya</span>
                  <label style={{position:"relative",display:"inline-flex",alignItems:"center",cursor:"pointer"}}>
                    <input type="checkbox" style={{display:"none"}} checked={campaign.isActive}
                      onChange={e=>setCampaign(c=>c?{...c,isActive:e.target.checked}:null)}/>
                    <div style={{width:40,height:22,borderRadius:999,background:campaign.isActive?"#6366F1":"#CBD5E1",transition:"background 0.2s",position:"relative"}}>
                      <div style={{position:"absolute",top:2,left:campaign.isActive?20:2,width:18,height:18,borderRadius:"50%",background:"white",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
                    </div>
                  </label>
                </div>
              </div>
              <div className="panel-card-body">
                <div className="card-creator-grid">
                  {/* Form */}
                  <div>
                    <div className="form-group">
                      <label className="form-label">İşLETME ADI</label>
                      <input className="form-input" placeholder="Kafe Adı, Salon Adı..." value={campaign.businessName||''}
                        onChange={e=>setCampaign(c=>c?{...c,businessName:e.target.value}:null)}/>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Damga Sayısı — {campaign.requiredStamps}</label>
                      <input type="range" min={3} max={15} value={campaign.requiredStamps} className="stamp-slider"
                        onChange={e=>setCampaign(c=>c?{...c,requiredStamps:Number(e.target.value)}:null)}/>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.65rem",color:"#94A3B8"}}>
                        <span>3</span><span>15</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kampanya Hediyesi</label>
                      <input className="form-input" placeholder="Örn: 1 Bedava Kahve, %10 İndirim..."
                        value={campaign.giftDescription} onChange={e=>setCampaign(c=>c?{...c,giftDescription:e.target.value}:null)}/>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Kart Rengi</label>
                      <div className="color-palette">
                        {COLORS.map(col=>(
                          <div key={col} className={`color-swatch ${campaign.cardColor===col?"selected":""}`}
                            style={{background:col}} onClick={()=>setCampaign(c=>c?{...c,cardColor:col}:null)}/>
                        ))}
                        <input type="color" value={campaign.cardColor} title="Özel renk"
                          style={{width:32,height:32,borderRadius:8,border:"2px solid #E2E8F0",cursor:"pointer",padding:2}}
                          onChange={e=>setCampaign(c=>c?{...c,cardColor:e.target.value}:null)}/>
                      </div>
                    </div>

                    {/* LOGO UPLOAD */}
                    <div className="form-group">
                      <label className="form-label">İşletme Logosu</label>
                      <div style={{display:"flex",alignItems:"center",gap:"0.875rem",background:"#F8FAFC",border:"1.5px dashed #CBD5E1",borderRadius:12,padding:"0.875rem"}}>
                        {/* Preview circle */}
                        <div style={{width:52,height:52,borderRadius:"50%",background:campaign.cardColor,border:"2px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.1)"}}>
                          {campaign.logo
                            ? <img src={campaign.logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            : <span style={{fontSize:"1rem",fontWeight:800,color:"white"}}>{(campaign.businessName||'İ').slice(0,2).toUpperCase()}</span>
                          }
                        </div>
                        <div style={{flex:1}}>
                          <label htmlFor="logo-upload" style={{display:"inline-flex",alignItems:"center",gap:"0.375rem",padding:"0.5rem 1rem",borderRadius:8,background:"#6366F1",color:"white",fontSize:"0.8rem",fontWeight:700,cursor:"pointer"}}>
                            📷 Logo Yükle
                          </label>
                          <input id="logo-upload" type="file" accept="image/*" style={{display:"none"}}
                            onChange={e=>{
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = ev => setCampaign(c=>c?{...c,logo:ev.target?.result as string}:null);
                              reader.readAsDataURL(file);
                            }}/>
                          {campaign.logo && (
                            <button onClick={()=>setCampaign(c=>c?{...c,logo:''}:null)}
                              style={{marginLeft:"0.5rem",padding:"0.5rem 0.75rem",borderRadius:8,border:"1px solid #EF4444",background:"transparent",color:"#EF4444",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>Kaldır</button>
                          )}
                          <div style={{fontSize:"0.7rem",color:"#94A3B8",marginTop:"0.375rem"}}>PNG, JPG, SVG • Maks. 2MB</div>
                        </div>
                      </div>
                    </div>

                    <button className="save-btn" onClick={saveCampaign} disabled={saving}>
                      {saving?"Kaydediliyor...":"💾 Kartı Yayınla"}
                    </button>
                  </div>

                  {/* Preview */}
                  <div>
                    <div className="form-label" style={{marginBottom:"0.75rem"}}>Canlı Önizleme</div>
                    <div className="card-preview-wrapper" style={{background: "transparent", padding: 0}}>
                      <CardPreview color={campaign.cardColor} stamps={campaign.requiredStamps} gift={campaign.giftDescription} logo={campaign.logo} businessName={campaign.businessName}/>
                      <div style={{fontSize:"0.72rem",color:"#94A3B8",textAlign:"center",marginTop:"1rem"}}>
                        {campaign.requiredStamps} damga → {campaign.giftDescription}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ LOGS ════ */}
        {section==="logs" && (
          <div className="admin-page">
            <div className="panel-card">
              <div className="panel-card-header">
                <span className="panel-card-title">İşlem Kayıtları ({logs.length})</span>
                <div style={{display:"flex",gap:"0.5rem",alignItems:"center",flexWrap:"wrap"}}>
                  <div className="log-filters">
                    {(["today","week","all"] as const).map(p=>(
                      <button key={p} className={`filter-btn ${logPeriod===p?"active":""}`} onClick={()=>{setLogPeriod(p);setLogPage(1);}}>
                        {p==="today"?"Bugün":p==="week"?"Bu Hafta":"Tümü"}
                      </button>
                    ))}
                  </div>
                  <button className="export-btn" onClick={exportCSV}><Download size={13}/> CSV İndir</button>
                </div>
              </div>
              {logs.length===0
                ? <div className="empty-state"><FileText size={48}/><p>Henüz işlem kaydı yok.</p></div>
                : <>
                    <div style={{overflowX:"auto"}}>
                      <table className="data-table">
                        <thead><tr>
                          <th>Müşteri ID</th><th>İşlem</th><th>Tarih</th><th>Saat</th><th>Kasiyer</th>
                        </tr></thead>
                        <tbody>
                          {pagedLogs.map(l=>(
                            <tr key={l.id}>
                              <td className="mono">{l.customerId.slice(0,12)}...</td>
                              <td><span className={`badge badge-${l.action}`}>{l.action==="stamp"?"Damga":"Ödül"}</span></td>
                              <td>{new Date(l.timestamp).toLocaleDateString("tr-TR")}</td>
                              <td>{new Date(l.timestamp).toLocaleTimeString("tr-TR")}</td>
                              <td style={{color:"#94A3B8"}}>{l.cashierId}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {totalPages>1 && (
                      <div className="pagination">
                        {Array.from({length:totalPages},(_,i)=>(
                          <button key={i} className={`page-btn ${logPage===i+1?"current":""}`} onClick={()=>setLogPage(i+1)}>{i+1}</button>
                        ))}
                      </div>
                    )}
                  </>
              }
            </div>
          </div>
        )}

        {/* ════ PHONES ════ */}
        {section==="phones" && (
          <div className="admin-page">
            <div className="panel-card">
              <div className="panel-card-header">
                <span className="panel-card-title">Telefon Numaraları</span>
                <span style={{fontSize:"0.75rem",color:"#94A3B8"}}>{customers.length} kart sahibi</span>
              </div>

              {/* Add Phone Form */}
              <div className="phone-form">
                <div>
                  <div className="form-label" style={{marginBottom:"0.35rem"}}>Müşteri ID</div>
                  <input className="form-input" placeholder="UUID veya kısaltılmış ID..."
                    value={newPhone.customerId} onChange={e=>setNewPhone(p=>({...p,customerId:e.target.value}))}/>
                </div>
                <div>
                  <div className="form-label" style={{marginBottom:"0.35rem"}}>Telefon Numarası</div>
                  <input className="form-input" placeholder="05XX XXX XX XX"
                    value={newPhone.phone} onChange={e=>setNewPhone(p=>({...p,phone:e.target.value}))}/>
                </div>
                <button className="add-btn" onClick={savePhone}><Plus size={14} style={{display:"inline",marginRight:4}}/>Ekle</button>
              </div>

              {/* Search */}
              <div style={{padding:"1rem 1.5rem 0"}}>
                <div className="search-bar">
                  <Search size={15} className="search-bar-icon"/>
                  <input placeholder="ID veya telefon ara..." value={phoneSearch} onChange={e=>setPhoneSearch(e.target.value)}/>
                </div>
              </div>

              {filteredPhones.length===0
                ? <div className="empty-state"><Phone size={48}/><p>Kayıt bulunamadı.</p></div>
                : <div style={{overflowX:"auto"}}>
                    <table className="data-table">
                      <thead><tr>
                        <th>#</th><th>Müşteri ID</th><th>Telefon</th><th>Damga</th><th>Kayıt Tarihi</th>
                      </tr></thead>
                      <tbody>
                        {filteredPhones.map((c,i)=>(
                          <tr key={c.id}>
                            <td style={{color:"#94A3B8",fontWeight:600}}>{i+1}</td>
                            <td className="mono">{c.id.slice(0,16)}...</td>
                            <td>
                              {c.phone
                                ? <span style={{color:"#0F172A",fontWeight:600}}>{c.phone}</span>
                                : <span style={{color:"#CBD5E1",fontSize:"0.75rem"}}>— Eklenmemiş</span>
                              }
                            </td>
                            <td>
                              <span style={{fontWeight:700,color:"#6366F1"}}>{c.stamps}</span>
                              <span style={{color:"#94A3B8",fontSize:"0.75rem",marginLeft:4}}>damga</span>
                            </td>
                            <td style={{color:"#94A3B8"}}>{new Date(c.createdAt).toLocaleDateString("tr-TR")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          </div>
        )}

        {/* ════ STAND QR ════ */}
        {section==="stand" && (
          <div className="admin-page">
            <div style={{maxWidth:600,margin:"0 auto"}}>
              <div className="panel-card" style={{textAlign:"center",padding:"3rem 2rem"}}>
                <div style={{width:64,height:64,background:"rgba(99,102,241,0.1)",color:"#6366F1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1.5rem"}}>
                  <Smartphone size={32}/>
                </div>
                <h2 style={{fontSize:"1.5rem",fontWeight:800,marginBottom:"0.5rem",color:"#0F172A"}}>Masa / Kasa QR Standı</h2>
                <p style={{color:"#64748B",fontSize:"0.95rem",lineHeight:1.6,marginBottom:"2rem"}}>
                  Müşterileriniz bu QR kodu telefonlarının kamerasıyla okutarak kendi adlarıyla anında sadakat kartlarını oluşturabilirler. Uygulama indirmelerine gerek yoktur.
                </p>
                
                <div style={{background:"white",padding:"2rem",borderRadius:"24px",border:"2px solid #E2E8F0",display:"inline-block",marginBottom:"2rem",boxShadow:"0 10px 30px rgba(0,0,0,0.05)"}}>
                  <QRCodeSVG 
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/join`}
                    size={200}
                    level="H"
                    fgColor="#0F172A"
                  />
                  <div style={{fontSize:"0.8rem",fontWeight:700,marginTop:"1rem",letterSpacing:"0.15em",color:"#94A3B8"}}>KAMERANIZI YAKLAŞTIRIN</div>
                </div>

                <div>
                  <a href="/join" target="_blank" className="btn btn-primary" style={{width:"100%",marginBottom:"1rem"}}>Müşteri Gözünden Test Et →</a>
                  <p style={{fontSize:"0.75rem",color:"#94A3B8"}}>Bu ekranı çıktı alarak masalarınıza veya kasanıza yerleştirebilirsiniz.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ MÜŞTERİ KARTI ════ */}
        {section==="preview" && (
          <div className="admin-page">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>

              {/* Live Preview iframe */}
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">Canlı Kart Önizlemesi</span>
                  <span style={{fontSize:"0.72rem",color:"#10B981",fontWeight:700,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:"#10B981",display:"inline-block"}}/>
                    Canlı
                  </span>
                </div>
                <div style={{background:"#0A0A0F",borderRadius:"0 0 16px 16px",overflow:"hidden",height:480}}>
                  <iframe
                    src={`/c/demo-preview`}
                    style={{width:"100%",height:"100%",border:"none"}}
                    title="Müşteri Kartı Önizleme"
                  />
                </div>
              </div>

              {/* Info & Links */}
              <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
                <div className="panel-card">
                  <div className="panel-card-header">
                    <span className="panel-card-title">Müşteri Linki</span>
                  </div>
                  <div className="panel-card-body" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                    <p style={{fontSize:"0.8rem",color:"#64748B",lineHeight:1.6}}>
                      Müşteriler bu linke girerek kendi sadakat kartlarını görüntüler. Her müşterinin benzersiz UUID&apos;si vardır.
                    </p>
                    <div style={{background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:10,padding:"0.75rem 1rem"}}>
                      <div style={{fontSize:"0.65rem",fontWeight:700,color:"#94A3B8",letterSpacing:"0.1em",marginBottom:"0.375rem"}}>KART URL FORMATI</div>
                      <code style={{fontSize:"0.78rem",color:"#6366F1",fontFamily:"monospace"}}>
                        /c/{"{"}<span style={{color:"#EC4899"}}>müşteri-uuid</span>{"}"}
                      </code>
                    </div>
                    <a
                      href="/c/demo-preview"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",
                        padding:"0.75rem",borderRadius:10,
                        background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
                        color:"white",fontWeight:700,fontSize:"0.85rem",
                        textDecoration:"none",transition:"opacity 0.2s",
                      }}
                    >
                      <Users size={16}/> Demo Kartı Aç →
                    </a>
                  </div>
                </div>

                <div className="panel-card">
                  <div className="panel-card-header">
                    <span className="panel-card-title">Müşteri Listesi</span>
                    <span style={{fontSize:"0.75rem",color:"#94A3B8"}}>{customers.length} kart</span>
                  </div>
                  <div style={{maxHeight:220,overflowY:"auto"}}>
                    {customers.length===0
                      ? <div className="empty-state" style={{padding:"1.5rem"}}><p>Henüz müşteri yok.</p></div>
                      : customers.slice(0,8).map((c,i)=>(
                          <div key={c.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.625rem 1.25rem",borderBottom:"1px solid #F1F5F9"}}>
                            <div style={{display:"flex",alignItems:"center",gap:"0.625rem"}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.7rem",fontWeight:700,color:"#6366F1"}}>{i+1}</div>
                              <span style={{fontFamily:"monospace",fontSize:"0.72rem",color:"#374151"}}>{c.id.slice(0,14)}...</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                              <span style={{fontWeight:700,color:"#6366F1",fontSize:"0.85rem"}}>{c.stamps}</span>
                              <a href={`/c/${c.id}`} target="_blank" rel="noreferrer"
                                style={{fontSize:"0.65rem",color:"#94A3B8",textDecoration:"none",padding:"0.2rem 0.5rem",border:"1px solid #E2E8F0",borderRadius:6}}>
                                Görüntüle
                              </a>
                            </div>
                          </div>
                        ))
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ KASİYER PANELİ ════ */}
        {section==="cashier" && (
          <div className="admin-page">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>

              {/* Iframe preview */}
              <div className="panel-card">
                <div className="panel-card-header">
                  <span className="panel-card-title">Kasiyer Ekranı</span>
                  <a href="/cashier" target="_blank" rel="noreferrer"
                    style={{fontSize:"0.75rem",color:"#6366F1",fontWeight:700,textDecoration:"none"}}>
                    Tam Ekran Aç ↗
                  </a>
                </div>
                <div style={{background:"#0A0A0F",borderRadius:"0 0 16px 16px",overflow:"hidden",height:480}}>
                  <iframe
                    src="/cashier"
                    style={{width:"100%",height:"100%",border:"none"}}
                    title="Kasiyer Paneli Önizleme"
                  />
                </div>
              </div>

              {/* Info */}
              <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
                <div className="panel-card">
                  <div className="panel-card-header">
                    <span className="panel-card-title">Kasiyer Erişimi</span>
                  </div>
                  <div className="panel-card-body" style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                    <p style={{fontSize:"0.8rem",color:"#64748B",lineHeight:1.6}}>
                      Kasiyer paneline giriş için PIN kodu veya demo girişi kullanılabilir. Kasiyerler bu ekrandan müşteri QR kodlarını okutarak damga basar.
                    </p>

                    {/* PIN info */}
                    <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:10,padding:"0.875rem 1rem"}}>
                      <div style={{fontSize:"0.65rem",fontWeight:700,color:"#C2410C",letterSpacing:"0.08em",marginBottom:"0.375rem"}}>KASİYER PIN</div>
                      <code style={{fontSize:"1.5rem",fontWeight:800,color:"#EA580C",letterSpacing:"0.5em"}}>1234</code>
                      <p style={{fontSize:"0.7rem",color:"#92400E",marginTop:"0.375rem"}}>Gerçek kullanımda değiştirin</p>
                    </div>

                    {/* Flow */}
                    <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
                      {[
                        {n:1, text:"Kasiyer /cashier sayfasını açar"},
                        {n:2, text:"PIN veya Demo ile giriş yapar"},
                        {n:3, text:"\"QR OKUT\" butonuna basar"},
                        {n:4, text:"Müşteri QR'ını kameraya gösterir"},
                        {n:5, text:"Damga otomatik eklenir ✓"},
                      ].map(s=>(
                        <div key={s.n} style={{display:"flex",alignItems:"flex-start",gap:"0.625rem"}}>
                          <div style={{width:20,height:20,borderRadius:"50%",background:"#EEF2FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.6rem",fontWeight:800,color:"#6366F1",flexShrink:0}}>{s.n}</div>
                          <span style={{fontSize:"0.8rem",color:"#374151",paddingTop:2}}>{s.text}</span>
                        </div>
                      ))}
                    </div>

                    <a
                      href="/cashier"
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",
                        padding:"0.75rem",borderRadius:10,
                        background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
                        color:"white",fontWeight:700,fontSize:"0.85rem",
                        textDecoration:"none",
                      }}
                    >
                      <Star size={16}/> Kasiyer Panelini Aç →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login"|"register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const S = {
    shell: { minHeight:"100vh", background:"#F8FAFC", display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", padding:"1rem", fontFamily:"'Inter',-apple-system,sans-serif" },
    logo: { display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"2rem" },
    logoIcon: { width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:800, fontSize:"1rem" },
    card: { width:"100%", maxWidth:400, background:"white", border:"1px solid #E2E8F0", borderRadius:20, padding:"2.5rem 2rem", boxShadow:"0 8px 40px rgba(0,0,0,0.06)" },
    tabs: { display:"flex", background:"#F1F5F9", borderRadius:10, padding:4, marginBottom:"1.75rem" },
    tab: (active:boolean) => ({ flex:1, padding:"0.5rem", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:"0.85rem", fontFamily:"inherit", transition:"all 0.2s", background:active?"white":"transparent", color:active?"#0F172A":"#64748B", boxShadow:active?"0 1px 4px rgba(0,0,0,0.08)":"none" }),
    label: { fontSize:"0.78rem", fontWeight:700, color:"#374151", letterSpacing:"0.04em", display:"block", marginBottom:"0.375rem" },
    input: { width:"100%", padding:"0.75rem 0.875rem", borderRadius:10, border:"1.5px solid #E2E8F0", fontSize:"0.9rem", fontFamily:"inherit", outline:"none", background:"white", boxSizing:"border-box" as const, marginBottom:"1rem" },
    btnPrimary: { width:"100%", padding:"0.875rem", borderRadius:10, border:"none", background:"linear-gradient(135deg,#6366F1,#8B5CF6)", color:"white", fontWeight:700, fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit", marginBottom:"0.75rem" },
    divider: { display:"flex", alignItems:"center", gap:"0.75rem", margin:"1rem 0" },
    divLine: { flex:1, height:1, background:"#E2E8F0" },
    divText: { fontSize:"0.7rem", fontWeight:600, color:"#94A3B8", letterSpacing:"0.08em" },
    btnDemo: { width:"100%", padding:"0.875rem", borderRadius:10, border:"1.5px solid #E2E8F0", background:"white", color:"#6366F1", fontWeight:700, fontSize:"0.95rem", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem" },
    error: { color:"#EF4444", fontSize:"0.78rem", fontWeight:600, textAlign:"center" as const, marginBottom:"0.75rem" },
    back: { marginTop:"1.5rem", fontSize:"0.8rem", color:"#64748B", textAlign:"center" as const },
  };

  const doLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(() => {
      if (password === "admin123" || email.includes("@")) {
        document.cookie = "admin_auth=true; path=/; max-age=86400";
        localStorage.setItem("admin_auth","true");
        router.replace("/admin");
      } else {
        setError("E-posta veya şifre hatalı."); setLoading(false);
      }
    }, 800);
  };

  const doDemo = () => {
    document.cookie = "admin_auth=true; path=/; max-age=86400";
    localStorage.setItem("admin_auth","true");
    router.replace("/admin");
  };

  return (
    <div style={S.shell}>
      <div style={S.logo}>
        <div style={S.logoIcon}>★</div>
        <span style={{fontWeight:800,fontSize:"1.15rem",color:"#0F172A"}}>SadakatPro</span>
      </div>
      <div style={S.card}>
        <div style={S.tabs}>
          <button style={S.tab(tab==="login")} onClick={()=>setTab("login")}>Giriş Yap</button>
          <button style={S.tab(tab==="register")} onClick={()=>setTab("register")}>Kaydol</button>
        </div>

        <form onSubmit={doLogin} style={{display:"flex",flexDirection:"column"}}>
          <label style={S.label}>E-POSTA</label>
          <input style={S.input} type="email" placeholder="ornek@isletme.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
          {tab==="login" && <>
            <label style={S.label}>ŞİFRE</label>
            <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </>}
          {tab==="register" && <>
            <label style={S.label}>İŞLETME ADI</label>
            <input style={S.input} type="text" placeholder="Kafe / Salon adı"/>
            <label style={S.label}>ŞİFRE</label>
            <input style={S.input} type="password" placeholder="En az 8 karakter" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </>}
          {error && <p style={S.error}>{error}</p>}
          <button type="submit" style={S.btnPrimary} disabled={loading}>
            {loading ? "Giriş yapılıyor..." : tab==="login" ? "Giriş Yap" : "Hesap Oluştur"}
          </button>
        </form>

        <div style={S.divider}>
          <div style={S.divLine}/><span style={S.divText}>VEYA</span><div style={S.divLine}/>
        </div>

        <button onClick={doDemo} style={S.btnDemo}>
          ⚡ Şifresiz Demo Girişi
        </button>
        <p style={{fontSize:"0.65rem",color:"#CBD5E1",textAlign:"center",marginTop:"0.5rem"}}>
          Demo modunda kayıt gerekmez — admin paneliyle başlayın
        </p>
      </div>
      <p style={S.back}><Link href="/" style={{color:"#6366F1",textDecoration:"none"}}>← Ana sayfaya dön</Link></p>
    </div>
  );
}

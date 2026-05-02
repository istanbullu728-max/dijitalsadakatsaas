"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, User, CreditCard } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [campaign, setCampaign] = useState<{ 
    businessName?: string; 
    logo?: string; 
    cardColor?: string;
  } | null>(null);

  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/campaign")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCampaign(data.campaign);
        }
      })
      .catch(() => {});
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rX = (y - rect.height / 2) / 10;
    const rY = (rect.width / 2 - x) / 10;
    
    setRotate({ x: rX, y: rY });
    setGlare({ 
      x: (x / rect.width) * 100, 
      y: (y / rect.height) * 100, 
      opacity: 0.4 
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/c/${data.customer.id}`);
        }, 2000);
      } else {
        alert(data.error || "Bir hata oluştu");
        setLoading(false);
      }
    } catch {
      alert("Bağlantı hatası");
      setLoading(false);
    }
  };

  const businessName = campaign?.businessName || "Loyalty Card";
  const cardColor = campaign?.cardColor || "#1e1b4b"; // Default deep indigo/navy

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      fontFamily: "'Inter', sans-serif",
      perspective: "1200px",
      overflow: "hidden"
    }}>
      {/* ── Dynamic Background ── */}
      <div style={{
        position: "fixed", inset: 0,
        background: `radial-gradient(circle at 50% 50%, ${cardColor}33 0%, #000 70%)`,
        zIndex: 0
      }} />

      <div style={{
        width: "100%",
        maxWidth: "400px",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "2.5rem",
        alignItems: "center"
      }}>
        
        {/* ── 3D Card ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: "100%",
            aspectRatio: "1.6 / 1",
            position: "relative",
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
            transition: "transform 0.1s ease-out",
            transformStyle: "preserve-3d",
            cursor: "pointer"
          }}
        >
          {/* Main Card Surface */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(135deg, ${cardColor} 0%, #000 100%)`,
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 50px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "2rem"
          }}>
            {/* Texture Layer */}
            <div style={{
              position: "absolute", inset: 0,
              opacity: 0.05,
              backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
              pointerEvents: "none"
            }} />

            {/* Glare Effect */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 50%)`,
              pointerEvents: "none",
              zIndex: 10
            }} />

            {/* Card Content Top */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", transform: "translateZ(30px)" }}>
              <div>
                <div style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Premium Member</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "white", marginTop: "0.25rem" }}>{businessName}</div>
              </div>
              <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {campaign?.logo 
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={campaign.logo} alt="logo" style={{ width: "80%", height: "80%", objectFit: "contain", margin: "auto" }} />
                  : <CreditCard color="white" size={24} style={{ margin: "auto" }} />
                }
              </div>
            </div>

            {/* Card Content Bottom - Engraved Name */}
            <div style={{ transform: "translateZ(50px)" }}>
              <div style={{ 
                fontSize: "1.25rem", 
                fontWeight: 600, 
                color: name ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                fontFamily: "monospace",
                letterSpacing: "0.1em",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8), -0.5px -0.5px 0px rgba(255,255,255,0.1)",
                textTransform: "uppercase"
              }}>
                {name || "KART SAHİBİ"}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form Section ── */}
        {!success ? (
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <User style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)" }} size={20} />
              <input
                type="text"
                placeholder="İsmini yaz..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "1.25rem 1.25rem 1.25rem 3.5rem",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  color: "white",
                  fontSize: "1.1rem",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.06)";
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                }}
                onBlur={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.03)";
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                width: "100%",
                padding: "1.25rem",
                borderRadius: "20px",
                background: "white",
                color: "black",
                fontSize: "1.1rem",
                fontWeight: 800,
                border: "none",
                cursor: loading || !name.trim() ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                opacity: loading || !name.trim() ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                boxShadow: "0 20px 40px rgba(255,255,255,0.1)"
              }}
            >
              {loading ? (
                "Aktif Ediliyor..."
              ) : (
                <>
                  KARTI AKTİF ET
                  <Sparkles size={20} />
                </>
              )}
            </button>
          </form>
        ) : (
          <div style={{
            textAlign: "center",
            animation: "fadeInUp 0.5s ease-out both"
          }}>
             <div style={{
               width: 80, height: 80, background: "#10B981", borderRadius: "50%",
               display: "flex", alignItems: "center", justifyContent: "center",
               margin: "0 auto 1.5rem", boxShadow: "0 0 40px rgba(16,185,129,0.4)"
             }}>
               <Check color="white" size={40} />
             </div>
             <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Kart Aktif Edildi!</h2>
             <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>Cüzdanınıza yönlendiriliyorsunuz...</p>
          </div>
        )}

        {/* CSS Animations */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          body {
            margin: 0;
            background: #000;
          }
        `}</style>

      </div>
    </div>
  );
}

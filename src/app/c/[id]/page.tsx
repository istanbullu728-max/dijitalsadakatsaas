"use client";

import { useEffect, useState, use, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/* ─── Types ─── */
interface CustomerData {
  stamps: number;
  name?: string;
  campaign: {
    requiredStamps: number;
    giftDescription: string;
    cardColor: string;
    businessName?: string;
    logo?: string;
  };
}

/* ─── Helpers ─── */
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}



function darken(hex: string, amount = 30) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(r - amount, 0)},${Math.max(g - amount, 0)},${Math.max(b - amount, 0)})`;
}

/* ─── Stamp Dot ─── */


/* ─── Main ─── */
export default function CustomerCard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const prevStampsRef = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customer/${id}`);
        const json = await res.json();
        if (json.success) {
          const newStamps = json.customer.stamps;
          if (prevStampsRef.current !== null && newStamps > prevStampsRef.current) {
            setShowAnimation(true);
            setTimeout(() => setShowAnimation(false), 3000);
          }
          prevStampsRef.current = newStamps; // Update ref

          setData({
            stamps: newStamps,
            name: json.customer.name,
            campaign: {
              requiredStamps: json.campaign.requiredStamps,
              giftDescription: json.campaign.giftDescription ?? "1 Bedava Kahve",
              cardColor: json.campaign.cardColor ?? "#6366F1",
              businessName: json.campaign.businessName ?? "",
              logo: json.campaign.logo ?? "",
            },
          });
        }
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
    const interval = setInterval(fetchCustomer, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 50);
  }, []);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={styles.shell}>
        <div style={styles.loadingDot} />
      </div>
    );
  }

  const stamps = data?.stamps ?? 0;
  const required = data?.campaign?.requiredStamps ?? 10;
  const gift = data?.campaign?.giftDescription ?? "1 Bedava Kahve";
  const cardColor = data?.campaign?.cardColor ?? "#6366F1";
  const businessName = data?.campaign?.businessName || "İşletmem";
  const logo = data?.campaign?.logo || "";
  const isReady = stamps >= required;

  const gradientFrom = cardColor;
  const gradientTo = darken(cardColor, 45);
  const shortId = id.split("-")[0].toUpperCase();
  const initials = businessName.slice(0,2).toUpperCase();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.25 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ opacity: 0, x: 50, y: 50 });
  };

  return (
    <div style={styles.shell}>
      {/* ── Celebration Animation Overlay ── */}
      {showAnimation && (
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{animation:"popIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards"}}>
            <div style={{fontSize:"4rem",filter:"drop-shadow(0 10px 20px rgba(0,0,0,0.2))"}}>🎉</div>
          </div>
          {/* Confetti particles */}
          {Array.from({length:12}).map((_,i)=>(
            <div key={i} style={{
              position:"absolute", width:10, height:10, background: ["#FFD700","#FF6B6B","#4ECDC4","#45B7D1"][i%4],
              borderRadius: i%2===0?"50%":"2px", top:"50%", left:"50%",
              animation:`confettiFly${i} ${0.6 + (((i * 13) % 100) / 100)*0.4}s ease-out forwards`,
              transformOrigin:"center",
              transform:`rotate(${(((i * 27) % 100) / 100)*360}deg) translateY(-${100+(((i * 41) % 100) / 100)*150}px)`
            }}/>
          ))}
          <style>{`
            ${Array.from({length:12}).map((_,i) => {
               const r1 = ((i * 17) % 100) / 100;
               const r2 = ((i * 31) % 100) / 100;
               return "@keyframes confettiFly" + i + " { 0% { opacity: 1; transform: translate(0,0) scale(0); } 100% { opacity: 0; transform: translate(" + ((r1-0.5)*300) + "px, " + ((r2-0.5)*300) + "px) scale(1.5) rotate(360deg); } }";
            }).join('\\n')}
            @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
          `}</style>
        </div>
      )}

      {/* ── Background glow ── */}
      <div style={{ ...styles.ambientGlow, background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${cardColor}55 0%, transparent 70%)` }} />

      <div style={{ perspective: "1500px", width: "100%", maxWidth: "380px", margin: "0 auto", zIndex: 10, padding: "0 1rem" }}>
        {/* ── THE CARD (Premium 3D Credit Card Feel) ── */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseLeave}
          style={{
            width: "100%", 
            aspectRatio: "1.6 / 1",
            borderRadius: "20px", position: "relative",
            transformStyle: "preserve-3d",
            transform: mounted 
              ? `translateY(0) scale(1) rotateX(${rotate.x || -6}deg) rotateY(${rotate.y || 4}deg)` 
              : `translateY(40px) scale(0.9)`,
            transition: mounted && rotate.x === 0 ? "transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)" : "transform 0.1s ease-out",
            background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
            boxShadow: rotate.x !== 0 
              ? "0 40px 80px -20px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3)"
              : "0 25px 50px -12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2)",
            overflow: "hidden", display: "flex", flexDirection: "column",
            padding: "1.25rem", color: "white",
            marginBottom: "2.5rem",
            border: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          {/* Glare & Texture */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,${glare.opacity}), transparent 60%)`,
          }} />
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, opacity: 0.04, mixBlendMode: "overlay",
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }} />

          {/* Header */}
          <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", transform: "translateZ(20px)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: "8px", background: "rgba(255,255,255,0.1)", 
                border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", backdropFilter: "blur(4px)" 
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {logo ? <img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:"0.7rem",fontWeight:900}}>{initials}</span>}
              </div>
              <div style={{fontSize:"0.9rem",fontWeight:800,letterSpacing:"-0.01em"}}>{businessName}</div>
            </div>
            <div style={{fontSize:"0.5rem",fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.15em",textTransform:"uppercase"}}>PLATINUM CARD</div>
          </div>

          {/* User Info */}
          <div style={{ position: "relative", zIndex: 3, transform: "translateZ(30px)", marginBottom: "1rem" }}>
            <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.4)",fontWeight:600,letterSpacing:"0.05em",marginBottom:"0.1rem"}}>CARD HOLDER</div>
            <div style={{fontSize:"1.2rem",fontWeight:900,letterSpacing:"-0.02em",fontFamily:"monospace"}}>{data?.name?.toUpperCase() || shortId}</div>
          </div>

          {/* Stamps Grid - Optimized for Credit Card Shape */}
          <div style={{ position: "relative", zIndex: 3, transform: "translateZ(40px)", marginBottom: "0.75rem" }}>
             <div style={{ 
               display: "grid", 
               gridTemplateColumns: "repeat(5, 1fr)", 
               gap: "8px",
               maxWidth: "100%"
             }}>
               {Array.from({length: Math.min(required, 10)}).map((_,i)=>(
                 <div key={i} style={{
                   aspectRatio: "1", 
                   borderRadius: "50%",
                   background: i < stamps ? "white" : "rgba(255,255,255,0.06)",
                   border: i < stamps ? "none" : "1px solid rgba(255,255,255,0.1)",
                   display: "flex", alignItems: "center", justifyContent: "center",
                   transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                 }}>
                   {i < stamps && (
                     <div style={{ width: "50%", height: "50%", background: cardColor, borderRadius: "50%", boxShadow: "0 0 8px rgba(0,0,0,0.2)" }} />
                   )}
                 </div>
               ))}
             </div>
          </div>

          {/* Reward Info */}
          <div style={{ 
            position: "relative", zIndex: 3, transform: "translateZ(25px)", 
            marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end"
          }}>
            <div>
              <div style={{fontSize:"0.5rem",color:"rgba(255,255,255,0.4)",fontWeight:600,letterSpacing:"0.05em"}}>STATUS</div>
              <div style={{fontSize:"0.75rem",fontWeight:800,color:isReady ? "#4ADE80" : "white"}}>
                {isReady ? "🎁 REWARD READY" : gift.toUpperCase()}
              </div>
            </div>
            <div style={{fontSize:"0.6rem",fontWeight:700,opacity:0.4,fontFamily:"monospace"}}>VALID THRU 12/29</div>
          </div>
        </div>

        {/* ── QR CODE AREA (Minimalist Glassmorphism) ── */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          position: "relative",
          zIndex: 20
        }}>
          <div style={{fontSize:"0.65rem",fontWeight:800,color:"rgba(255,255,255,0.4)",letterSpacing:"0.15em",textTransform:"uppercase"}}>SCAN FOR STAMP</div>
          <div style={{
            background: "white", 
            padding: "0.75rem", 
            borderRadius: "12px", 
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            {id && <QRCodeSVG value={id} size={140} level="H" fgColor="#000000" bgColor="#FFFFFF" includeMargin={false} />}
          </div>
          <div style={{fontSize:"0.6rem",color:"rgba(255,255,255,0.3)",fontWeight:600}}>Unique Member ID: {shortId}</div>
        </div>
      </div>

      {/* ── Bottom hint ── */}
      <div
        style={{
          ...styles.bottomHint,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.8s ease 0.6s",
        }}
      >
        <div style={styles.hintDot} />
        Live Sync Active
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   STYLES
══════════════════════════════════ */
const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    background: "radial-gradient(circle at 50% 0%, #1a1a2e 0%, #0a0a0f 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "3rem 1rem",
    position: "relative",
    overflowY: "auto",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  ambientGlow: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    zIndex: 0,
  },

  loadingDot: {
    width: 40,
    height: 40,
    border: "2.5px solid rgba(255,255,255,0.1)",
    borderTopColor: "rgba(255,255,255,0.6)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  card: {
    position: "relative",
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    overflow: "hidden",
    boxShadow:
      "0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
    transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)",
    zIndex: 1,
  },

  gloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
    pointerEvents: "none",
    zIndex: 2,
    borderRadius: "28px 28px 0 0",
  },

  noise: {
    position: "absolute",
    inset: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    backgroundSize: "200px 200px",
    pointerEvents: "none",
    zIndex: 2,
  },

  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "1.75rem 1.75rem 1rem",
    position: "relative",
    zIndex: 3,
  },

  brandLabel: {
    fontSize: "0.55rem",
    fontWeight: 700,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "0.2rem",
  },

  brandName: {
    fontSize: "1.35rem",
    fontWeight: 800,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "-0.02em",
  },

  chipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.15)",
  },

  giftLabel: {
    padding: "0 1.75rem 1.25rem",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: "0.04em",
    position: "relative",
    zIndex: 3,
  },

  rewardReady: {
    margin: "0 1.75rem 1.25rem",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 999,
    padding: "0.35rem 0.875rem",
    fontSize: "0.62rem",
    fontWeight: 800,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "0.12em",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    animation: "pulse 2s ease infinite",
    position: "relative",
    zIndex: 3,
  },

  rewardReadyDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4ADE80",
    boxShadow: "0 0 8px #4ADE80",
  },

  stampsGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    padding: "0 1.75rem 1.25rem",
    position: "relative",
    zIndex: 3,
  },

  progressTrack: {
    margin: "0 1.75rem",
    height: 3,
    borderRadius: 999,
    background: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    position: "relative",
    zIndex: 3,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
  },

  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 1.75rem",
    position: "relative",
    zIndex: 3,
  },

  cardFooterLeft: { display: "flex", flexDirection: "column", gap: 2 },
  cardFooterRight: { display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-end" },

  footerLabel: {
    fontSize: "0.52rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    color: "rgba(255,255,255,0.4)",
  },

  footerValue: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: "0.02em",
  },

  /* Perforation */
  perforation: {
    display: "flex",
    alignItems: "center",
    padding: "0",
    position: "relative",
    zIndex: 3,
  },

  perforationCircleLeft: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#0A0A0F",
    marginLeft: -10,
    flexShrink: 0,
  },

  perforationCircleRight: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#0A0A0F",
    marginRight: -10,
    flexShrink: 0,
  },

  perforationLine: {
    flex: 1,
    height: 1,
    borderTop: "1.5px dashed rgba(255,255,255,0.15)",
  },

  /* QR Section */
  qrSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1.5rem 1.75rem 2rem",
    background: "rgba(255,255,255,0.97)",
    position: "relative",
    zIndex: 3,
  },

  qrLabel: {
    fontSize: "0.58rem",
    fontWeight: 800,
    letterSpacing: "0.2em",
    color: "#94A3B8",
  },

  qrBox: {
    padding: "1rem",
    background: "white",
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  qrSubLabel: {
    fontSize: "0.6rem",
    color: "#CBD5E1",
    fontWeight: 500,
    letterSpacing: "0.02em",
  },

  bottomHint: {
    marginTop: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.7rem",
    color: "rgba(255,255,255,0.3)",
    fontWeight: 500,
    zIndex: 1,
  },

  hintDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#4ADE80",
    boxShadow: "0 0 6px #4ADE80",
    animation: "pulse 2s ease infinite",
  },
};

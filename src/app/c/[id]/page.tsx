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

function isDark(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function lighten(hex: string, amount = 40) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.min(r + amount, 255)},${Math.min(g + amount, 255)},${Math.min(b + amount, 255)})`;
}

function darken(hex: string, amount = 30) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${Math.max(r - amount, 0)},${Math.max(g - amount, 0)},${Math.max(b - amount, 0)})`;
}

/* ─── Stamp Dot ─── */
function StampDot({
  filled,
  isGift,
  color,
  index,
  delay,
}: {
  filled: boolean;
  isGift: boolean;
  color: string;
  index: number;
  delay: number;
}) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: filled
          ? "none"
          : `2px solid rgba(255,255,255,${isGift ? 0.6 : 0.25})`,
        background: filled
          ? "rgba(255,255,255,0.95)"
          : isGift
          ? "rgba(255,255,255,0.08)"
          : "rgba(255,255,255,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        transitionDelay: `${delay}ms`,
        transform: filled ? "scale(1)" : "scale(0.92)",
        boxShadow: filled
          ? `0 0 0 3px rgba(255,255,255,0.15), 0 4px 12px rgba(0,0,0,0.2)`
          : "none",
        flexShrink: 0,
      }}
    >
      {filled && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {!filled && isGift && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

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

  useEffect(() => {
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
  const progress = Math.min(stamps / required, 1);

  const gradientFrom = cardColor;
  const gradientTo = darken(cardColor, 45);
  const accent = lighten(cardColor, 60);
  const shortId = id.split("-")[0].toUpperCase();
  const initials = businessName.slice(0,2).toUpperCase();

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
              animation:`confettiFly ${0.6 + Math.random()*0.4}s ease-out forwards`,
              transformOrigin:"center",
              transform:`rotate(${Math.random()*360}deg) translateY(-${100+Math.random()*150}px)`
            }}/>
          ))}
          <style>{`
            @keyframes confettiFly { 0% { opacity: 1; transform: translate(0,0) scale(0); } 100% { opacity: 0; transform: translate(${(Math.random()-0.5)*300}px, ${(Math.random()-0.5)*300}px) scale(1.5) rotate(360deg); } }
            @keyframes popIn { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
          `}</style>
        </div>
      )}

      {/* ── Ambient background glow ── */}
      <div
        style={{
          ...styles.ambientGlow,
          background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${cardColor}55 0%, transparent 70%)`,
        }}
      />

      {/* ══════════════════════════════════
          CARD
      ══════════════════════════════════ */}
      <div
        style={{
          ...styles.card,
          background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0) scale(1)" : "translateY(32px) scale(0.96)",
        }}
      >
        {/* Glossy overlay */}
        <div style={styles.gloss} />

        {/* Noise texture overlay */}
        <div style={styles.noise} />

        {/* ── Card Header ── */}
        <div style={styles.cardHeader}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
            {/* Logo circle */}
            <div style={{width:44,height:44,borderRadius:"50%",background:"rgba(255,255,255,0.18)",border:"2px solid rgba(255,255,255,0.35)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0,boxShadow:"0 2px 12px rgba(0,0,0,0.18)"}}>
              {logo
                ? <img src={logo} alt="logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <span style={{fontSize:"0.85rem",fontWeight:800,color:"white",letterSpacing:"-0.02em"}}>{initials}</span>
              }
            </div>
            <div>
              <div style={styles.brandLabel}>SADAKAT KARTI</div>
              <div style={styles.brandName}>{businessName}</div>
            </div>
          </div>
          <div
            style={{
              ...styles.chipIcon,
              background: `rgba(255,255,255,0.15)`,
              backdropFilter: "blur(8px)",
            }}
          >
            {/* NFC / chip icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="5" width="14" height="14" rx="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5"/>
              <line x1="9" y1="5" x2="9" y2="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="5" x2="15" y2="2" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="9" y1="19" x2="9" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="15" y1="19" x2="15" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="19" y1="9" x2="22" y2="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="19" y1="15" x2="22" y2="15" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="5" y1="9" x2="2" y2="9" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="5" y1="15" x2="2" y2="15" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* ── Reward status ── */}
        {isReady ? (
          <div style={styles.rewardReady}>
            <span style={styles.rewardReadyDot} />
            HEDİYE HAZIR — {gift.toUpperCase()}
          </div>
        ) : (
          <div style={styles.giftLabel}>{gift}</div>
        )}

        {/* ── Stamps ── */}
        <div style={styles.stampsGrid}>
          {Array.from({ length: required }).map((_, i) => (
            <StampDot
              key={i}
              filled={i < stamps}
              isGift={i === required - 1}
              color={cardColor}
              index={i}
              delay={i * 30}
            />
          ))}
        </div>

        {/* ── Progress bar ── */}
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progress * 100}%`,
              background: "rgba(255,255,255,0.9)",
              boxShadow: progress > 0 ? `0 0 12px rgba(255,255,255,0.5)` : "none",
            }}
          />
        </div>

        {/* ── Card Footer ── */}
        <div style={styles.cardFooter}>
          <div style={styles.cardFooterLeft}>
            <div style={styles.footerLabel}>DAMGA</div>
            <div style={styles.footerValue}>{stamps} / {required}</div>
          </div>
          <div style={styles.cardFooterRight} style={{textAlign: "right"}}>
            <div style={styles.footerLabel}>{data?.name ? "MÜŞTERİ" : "MÜŞTERİ NO"}</div>
            <div style={styles.footerValue} style={{textTransform: "uppercase"}}>{data?.name || shortId}</div>
          </div>
        </div>

        {/* ── Dashed divider (perforation style) ── */}
        <div style={styles.perforation}>
          <div style={styles.perforationCircleLeft} />
          <div style={styles.perforationLine} />
          <div style={styles.perforationCircleRight} />
        </div>

        {/* ── QR Section (inside card, bottom half) ── */}
        <div style={styles.qrSection}>
          <div style={styles.qrLabel}>KASADA OKUTUN</div>
          <div style={styles.qrBox}>
            <QRCodeSVG
              value={id}
              size={148}
              bgColor={"transparent"}
              fgColor={"#0F172A"}
              level={"H"}
              includeMargin={false}
            />
          </div>
          <div style={styles.qrSubLabel}>Her 3 saniyede otomatik yenilenir</div>
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
        Canlı güncelleniyor
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
    background: "#0A0A0F",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    position: "relative",
    overflow: "hidden",
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

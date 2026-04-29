"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaign] = useState<{ businessName?: string; logo?: string; cardColor?: string } | null>(null);

  useEffect(() => {
    fetch("/api/campaign")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCampaign(data.campaign);
        }
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      
      if (data.success) {
        router.push(`/c/${data.customer.id}`);
      } else {
        alert(data.error || "Bir hata oluştu");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası");
      setLoading(false);
    }
  };

  const businessName = campaign?.businessName || "İşletmem";
  const initials = businessName.slice(0, 2).toUpperCase();
  const cardColor = campaign?.cardColor || "#6366F1";

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.25rem",
      background: "#F8FAFC",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "white",
        borderRadius: "24px",
        padding: "3rem 2rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}>
        {/* Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: cardColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden", marginBottom: "1.5rem", boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          border: "3px solid white"
        }}>
          {campaign?.logo
            ? <img src={campaign.logo} alt="logo" style={{width: "100%", height: "100%", objectFit: "cover"}} />
            : <span style={{fontSize: "2rem", fontWeight: 800, color: "white"}}>{initials}</span>
          }
        </div>

        <h1 style={{fontSize: "1.5rem", fontWeight: 800, color: "#0F172A", marginBottom: "0.5rem"}}>
          {businessName}
        </h1>
        <p style={{fontSize: "0.9rem", color: "#64748B", marginBottom: "2rem", lineHeight: 1.5}}>
          Sadakat programımıza hoş geldiniz! Hemen kartınızı oluşturun, damgaları toplayın.
        </p>

        <form onSubmit={handleSubmit} style={{width: "100%", display: "flex", flexDirection: "column", gap: "1rem"}}>
          <input
            type="text"
            placeholder="Adınız Soyadınız"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            style={{
              width: "100%", padding: "1rem", borderRadius: "14px",
              border: "1.5px solid #E2E8F0", background: "#F8FAFC",
              fontSize: "1rem", color: "#0F172A", outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = cardColor}
            onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            style={{
              width: "100%", padding: "1rem", borderRadius: "14px",
              background: loading ? "#94A3B8" : cardColor, color: "white",
              fontSize: "1rem", fontWeight: 700, border: "none",
              cursor: loading || !name.trim() ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              boxShadow: `0 8px 20px ${cardColor}40`
            }}
          >
            {loading ? "Oluşturuluyor..." : "Kartımı Oluştur"}
          </button>
        </form>
      </div>
    </div>
  );
}

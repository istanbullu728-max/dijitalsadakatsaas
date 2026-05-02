"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CardRedirect() {
  const router = useRouter();

  useEffect(() => {
    let customerId = localStorage.getItem("digital_loyalty_card_id");
    if (!customerId) {
      customerId = crypto.randomUUID();
      localStorage.setItem("digital_loyalty_card_id", customerId);
    }
    router.push(`/c/${customerId}`);
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#6366F1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has a card ID in this browser
    let customerId = localStorage.getItem("digital_loyalty_card_id");
    
    if (!customerId) {
      // Create a unique random ID (UUID-like)
      customerId = crypto.randomUUID();
      localStorage.setItem("digital_loyalty_card_id", customerId);
    }
    
    // Redirect to the customer card page
    router.push(`/c/${customerId}`);
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh", 
      background: "#0a0a0f", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{textAlign: "center", color: "white"}}>
        <div style={{
          width: 40, height: 40, 
          border: "3px solid rgba(255,255,255,0.1)", 
          borderTopColor: "#6366F1", 
          borderRadius: "50%", 
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem"
        }} />
        <p style={{fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", fontWeight: 500}}>Kartınız yükleniyor...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

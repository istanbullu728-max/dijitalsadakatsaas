"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if customer already has an ID in localStorage.
    // If not, generate a native UUID and save it, then redirect to their card.
    let customerId = localStorage.getItem("loyalty_customer_id");

    if (!customerId) {
      customerId = crypto.randomUUID();
      localStorage.setItem("loyalty_customer_id", customerId);
    }

    router.replace(`/c/${customerId}`);
  }, [router]);

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "#0A0A0F"
    }}>
      <div style={{
        width: 36, height: 36,
        border: "3px solid rgba(99,102,241,0.2)",
        borderTopColor: "#6366F1",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }}/>
    </div>
  );
}

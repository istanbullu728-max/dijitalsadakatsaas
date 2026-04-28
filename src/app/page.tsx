"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // For MVP demonstration, if someone hits the root URL:
    // We check if they have an ID in localStorage.
    // If not, generate a UUID, save it, and redirect to their card.
    let customerId = localStorage.getItem("loyalty_customer_id");
    
    if (!customerId) {
      customerId = uuidv4();
      localStorage.setItem("loyalty_customer_id", customerId);
    }
    
    router.replace(`/c/${customerId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

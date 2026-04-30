"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { CheckCircle, Lock, QrCode } from "lucide-react";

export default function CashierPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [successData, setSuccessData] = useState<{ stamps: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingCustomer, setPendingCustomer] = useState<any>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Check auth cookie on mount (simplified for MVP)
  useEffect(() => {
    if (document.cookie.includes("cashier_auth=authenticated")) {
      setTimeout(() => setIsAuthenticated(true), 0);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        const data = await res.json();
        setError(data.error || "Geçersiz PIN");
      }
    } catch {
      setError("Sunucu hatası");
    } finally {
      setIsProcessing(false);
    }
  };

  const startScanner = async () => {
    setIsScanning(true);
    setError(null);
    
    // Give UI a moment to render the container
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;
        
        await html5QrCode.start(
          { facingMode: "environment" },
          { 
            fps: 30, 
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const qrboxSize = Math.floor(minEdge * 0.85); // Larger scanning area
              return { width: qrboxSize, height: qrboxSize };
            },
            aspectRatio: 1.0,
            experimentalFeatures: {
              useBarCodeDetectorIfSupported: true
            }
          },
          async (decodedText) => {
            if (isProcessing) return; // Prevent double processing
            
            // Stop scanning immediately to prevent multiple hits
            if (scannerRef.current) {
              try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
              } catch(e) { console.error(e); }
              scannerRef.current = null;
            }
            setIsScanning(false);
            processScan(decodedText);
          },
          () => {
            // Ignore scan errors (background noise)
          }
        );
      } catch {
        setError("Kamera açılamadı. İzinleri kontrol edin.");
        setIsScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error(e);
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const processScan = async (customerId: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch(`/api/customer/${customerId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPendingCustomer({
          id: customerId,
          name: data.customer.name,
          stamps: data.customer.stamps,
          total: data.campaign.requiredStamps
        });
      } else {
        setError(data.error || "Müşteri bulunamadı");
      }
    } catch {
      setError("Sunucu hatası");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmStamp = async () => {
    if (!pendingCustomer || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: pendingCustomer.id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessData({
          stamps: data.customer.stamps,
          total: data.campaign.requiredStamps
        });
        setPendingCustomer(null);
        
        // Auto hide success overlay after 2.5 seconds
        setTimeout(() => {
          setSuccessData(null);
        }, 2500);
      } else {
        setError(data.error || "Damga eklenemedi");
      }
    } catch {
      setError("Sunucu hatası");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",fontFamily:"'Inter',sans-serif"}}>
        <div style={{width:"100%",maxWidth:360,background:"#111827",border:"1px solid rgba(255,255,255,0.08)",borderRadius:24,padding:"2.5rem 2rem",boxShadow:"0 40px 80px rgba(0,0,0,0.6)"}}>
          {/* Icon */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem",marginBottom:"2rem"}}>
            <div style={{width:60,height:60,borderRadius:16,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 24px rgba(99,102,241,0.4)"}}>
              <Lock size={26} color="white"/>
            </div>
            <div style={{textAlign:"center"}}>
              <h1 style={{color:"#F1F5F9",fontSize:"1.4rem",fontWeight:800,letterSpacing:"-0.02em",margin:0}}>Kasiyer Girişi</h1>
              <p style={{color:"#64748B",fontSize:"0.8rem",marginTop:"0.375rem",margin:"0.375rem 0 0"}}>4 haneli PIN ile giriş yapın</p>
            </div>
          </div>

          <form onSubmit={handleLogin} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{
                width:"100%",padding:"0.875rem",borderRadius:12,
                border:"1.5px solid rgba(255,255,255,0.1)",
                background:"rgba(255,255,255,0.05)",
                color:"#F1F5F9",fontSize:"1.75rem",textAlign:"center",
                letterSpacing:"0.5em",fontWeight:700,
                outline:"none",fontFamily:"inherit",boxSizing:"border-box",
              }}
              placeholder="••••"
              required
            />
            {error && (
              <p style={{color:"#EF4444",textAlign:"center",fontSize:"0.8rem",fontWeight:600,margin:0}}>{error}</p>
            )}
            <button
              type="submit"
              disabled={isProcessing}
              style={{
                padding:"0.875rem",borderRadius:12,border:"none",
                background:"linear-gradient(135deg,#6366F1,#8B5CF6)",
                color:"white",fontSize:"0.9rem",fontWeight:700,cursor:"pointer",
                fontFamily:"inherit",opacity:isProcessing?0.6:1,transition:"opacity 0.2s",
              }}
            >
              {isProcessing ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {/* Divider */}
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem",margin:"1.25rem 0"}}>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
            <span style={{color:"#475569",fontSize:"0.7rem",fontWeight:600,letterSpacing:"0.08em"}}>VEYA</span>
            <div style={{flex:1,height:1,background:"rgba(255,255,255,0.07)"}}/>
          </div>

          {/* Demo Login */}
          <button
            onClick={() => {
              document.cookie = "cashier_auth=authenticated; path=/; max-age=86400";
              setIsAuthenticated(true);
            }}
            style={{
              width:"100%",padding:"0.875rem",borderRadius:12,
              border:"1.5px solid rgba(99,102,241,0.3)",
              background:"rgba(99,102,241,0.08)",
              color:"#818CF8",fontSize:"0.875rem",fontWeight:700,
              cursor:"pointer",fontFamily:"inherit",
              transition:"all 0.2s",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"0.5rem",
            }}
            onMouseOver={e=>(e.currentTarget.style.background="rgba(99,102,241,0.15)")}
            onMouseOut={e=>(e.currentTarget.style.background="rgba(99,102,241,0.08)")}
          >
            ⚡ Demo Girişi — Kodsuz Dene
          </button>
          <p style={{color:"#334155",fontSize:"0.65rem",textAlign:"center",marginTop:"0.75rem"}}>
            Demo modunda gerçek PIN gerekmez
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b bg-card flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <QrCode className="w-5 h-5 text-primary" />
          Kasiyer Paneli
        </h1>
        <div className="w-2 h-2 rounded-full bg-success"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full">
        
        {isScanning ? (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-full relative overflow-hidden bg-black rounded-[1rem] aspect-square">
               <div id="qr-reader" className="w-full h-full"></div>
            </div>
            <button onClick={stopScanner} className="btn w-full bg-muted text-foreground">
              İptal Et
            </button>
          </div>
        ) : pendingCustomer ? (
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
            <div className="w-full bg-card border border-border p-8 rounded-3xl shadow-2xl text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-muted-foreground uppercase letter-spacing-wide mb-1">Müşteri Bulundu</h2>
              <h3 className="text-3xl font-black text-foreground mb-4">{pendingCustomer.name}</h3>
              
              <div className="flex justify-center gap-2 mb-8">
                {Array.from({length: pendingCustomer.total}).map((_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < pendingCustomer.stamps ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmStamp} 
                  disabled={isProcessing}
                  className="btn btn-primary btn-massive w-full py-6 text-xl shadow-xl shadow-primary/20"
                >
                  {isProcessing ? "İşleniyor..." : "DAMGA EKLE"}
                </button>
                <button 
                  onClick={() => setPendingCustomer(null)} 
                  className="text-muted-foreground font-semibold hover:text-foreground transition-colors py-2"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-6">
            <div className="w-48 h-48 bg-muted rounded-full flex items-center justify-center border-4 border-dashed border-border mb-4">
              <QrCode className="w-20 h-20 text-muted-foreground opacity-50" />
            </div>
            
            <button 
              onClick={startScanner} 
              disabled={isProcessing}
              className="btn btn-primary btn-massive flex items-center justify-center gap-3"
            >
              <QrCode className="w-8 h-8" />
              {isProcessing ? "İşleniyor..." : "QR OKUT"}
            </button>
            
            {error && (
              <div className="bg-danger/10 text-danger p-4 rounded-xl border border-danger/20 text-center w-full mt-4">
                <p className="font-bold">{error}</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Success Overlay */}
      {successData && (
        <div className="success-overlay">
          <CheckCircle className="w-24 h-24 mb-6" />
          <h2 className="text-4xl font-bold mb-2">Damga Eklendi!</h2>
          <p className="text-xl opacity-90">
            Mevcut Damga: <span className="font-bold">{successData.stamps} / {successData.total}</span>
          </p>
          {successData.stamps >= successData.total && (
            <div className="mt-8 bg-white/20 px-6 py-3 rounded-xl border border-white/30 backdrop-blur-sm animate-bounce">
              <p className="font-bold text-2xl">Hediye Kahve Hak Kazandı!</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

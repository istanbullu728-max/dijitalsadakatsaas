"use client";
// Build trigger: Restore Landing Page
import { useState, useEffect } from "react";

const I="#6366F1",P="#8B5CF6",D="#0F172A",G="#64748B",B="#E2E8F0";

function PhoneMockup({stamps}:{stamps:number}){
  return(
    <div style={{position:"relative",display:"flex",justifyContent:"center"}}>
      <div style={{position:"absolute",inset:-60,background:"radial-gradient(ellipse 70% 70% at 50% 50%,rgba(99,102,241,0.12) 0%,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{width:220,background:"#1E1B4B",borderRadius:38,padding:"10px 7px 7px",boxShadow:"0 40px 80px rgba(99,102,241,0.3),0 0 0 8px rgba(255,255,255,0.05)",position:"relative",zIndex:1}}>
        <div style={{background:"linear-gradient(145deg,#6366F1,#4338CA)",borderRadius:26,overflow:"hidden"}}>
          <div style={{padding:"1rem 0.875rem 0.625rem"}}>
            <div style={{fontSize:"0.42rem",fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.15em"}}>SADAKAT KARTI</div>
            <div style={{fontSize:"0.9rem",fontWeight:800,color:"white"}}>Coffee Co.</div>
            <div style={{fontSize:"0.45rem",color:"rgba(255,255,255,0.55)",marginTop:2}}>7 Kahve = 1 Bedava</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:"0.625rem"}}>
              {Array.from({length:7}).map((_,i)=>(
                <div key={i} style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid rgba(255,255,255,${i<stamps?0:0.25})`,background:i<stamps?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.05)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.4s"}}>
                  {i<stamps&&<svg width="9" height="9" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="#6366F1" strokeWidth="3" strokeLinecap="round" fill="none"/></svg>}
                </div>
              ))}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:"0.625rem",paddingBottom:"0.4rem"}}>
              <div><div style={{fontSize:"0.38rem",fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:"0.1em"}}>DAMGA</div><div style={{fontSize:"0.65rem",fontWeight:700,color:"white"}}>{stamps}/7</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:"0.38rem",fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:"0.1em"}}>PROMO</div><div style={{fontSize:"0.65rem",fontWeight:700,color:"white"}}>A3F9</div></div>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.97)",padding:"0.625rem",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{fontSize:"0.38rem",fontWeight:700,color:"#94A3B8",letterSpacing:"0.15em"}}>KASADA OKUTUN</div>
            <div style={{background:"white",borderRadius:7,padding:5}}>
              <svg width="54" height="54" viewBox="0 0 60 60">
                {[[0,0],[10,0],[20,0],[0,10],[20,10],[0,20],[10,20],[20,20],[35,0],[45,0],[40,10],[35,20],[45,20],[0,35],[10,35],[20,35],[5,40],[15,40],[0,45],[20,45],[35,35],[50,35],[40,40],[50,40],[35,50],[45,50]].map(([x,y],i)=>(
                  <rect key={i} x={x} y={y} width="8" height="8" fill="#0F172A" rx="1"/>
                ))}
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const faqData=[
  {q:"Kurulum zor mu?",a:"Hayır. 5 dakikada kurulur. QR standı yerleştirirsiniz, sistem hazır."},
  {q:"Uygulama indirmek gerekiyor mu?",a:"Hayır. Müşteri hiçbir uygulama indirmez. Tarayıcıda açılır."},
  {q:"SMS sistemi yasal mı?",a:"Evet. Sadece izin veren müşterilere gönderilir. KVKK tam uyumlu."},
  {q:"5.000 TL'ye ne dahil?",a:"1 yıl tam erişim, kurulum, QR stand, panel, kampanya, SMS ve destek."},
  {q:"Deneme yapabilir miyim?",a:"Evet. 7 gün boyunca ücretsiz. Kart gerekmez."},
];

export default function LandingPage(){
  const [scrolled,setScrolled]=useState(false);
  const [stamps,setStamps]=useState(0);
  const [openFaq,setOpenFaq]=useState<number|null>(null);

  useEffect(()=>{
    const fn=()=>setScrolled(window.scrollY>20);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  useEffect(()=>{
    const t=setInterval(()=>setStamps(p=>p>=7?0:p+1),900);
    return()=>clearInterval(t);
  },[]);

  const NAV:React.CSSProperties={position:"fixed",top:0,left:0,right:0,zIndex:100,background:scrolled?"rgba(255,255,255,0.92)":"transparent",backdropFilter:scrolled?"blur(12px)":"none",borderBottom:scrolled?`1px solid ${B}`:"1px solid transparent",transition:"all 0.3s"};

  return(
    <div style={{fontFamily:"'Inter',-apple-system,sans-serif",color:D,background:"white",overflowX:"hidden"}}>

      {/* NAV */}
      <nav style={NAV}>
        <div className="landing-container-lg" style={{maxWidth:1100,margin:"0 auto",padding:"0 1.25rem",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <div style={{width:30,height:30,background:`linear-gradient(135deg,${I},${P})`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:"0.85rem"}}>★</div>
            <span style={{fontWeight:800,fontSize:"1rem"}}>SadakatPro</span>
          </div>
          <div className="landing-nav-links">
            <a href="#ozellikler" style={{color:G,textDecoration:"none",fontSize:"0.875rem",fontWeight:500}}>Özellikler</a>
            <a href="#fiyat" style={{color:G,textDecoration:"none",fontSize:"0.875rem",fontWeight:500}}>Fiyat</a>
            <a href="/login" style={{color:G,textDecoration:"none",fontSize:"0.875rem",fontWeight:500}}>Giriş</a>
            <a href="/card" style={{padding:"0.45rem 1.1rem",borderRadius:999,background:`linear-gradient(135deg,${I},${P})`,color:"white",textDecoration:"none",fontSize:"0.85rem",fontWeight:700,boxShadow:"0 4px 12px rgba(99,102,241,0.35)"}}>Ücretsiz Dene</a>
          </div>
          {/* Mobile nav CTA only */}
          <a href="/card" className="landing-mobile-btn" style={{display:"none",padding:"0.4rem 1rem",borderRadius:999,background:`linear-gradient(135deg,${I},${P})`,color:"white",textDecoration:"none",fontSize:"0.8rem",fontWeight:700}}>Dene</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{minHeight:"100vh",display:"flex",alignItems:"center",paddingTop:"4rem"}}>
        <div style={{maxWidth:1100,margin:"0 auto",padding:"3.5rem 1.25rem",width:"100%"}}>
          <div className="landing-hero-grid">
            <div>
              <div style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",background:"rgba(99,102,241,0.08)",border:`1px solid rgba(99,102,241,0.2)`,borderRadius:999,padding:"0.3rem 0.8rem",fontSize:"0.75rem",fontWeight:700,color:I,marginBottom:"1.5rem"}}>✦ Dijital Sadakat Sistemi</div>
              <h1 style={{fontSize:"clamp(2rem,4.5vw,3.5rem)",fontWeight:900,lineHeight:1.1,letterSpacing:"-0.03em",margin:"0 0 1.25rem"}}>
                Müşterilerinizi<br/>
                <span style={{background:`linear-gradient(135deg,${I},${P})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>kaybetmeyin.</span><br/>
                Onları geri getirin.
              </h1>
              <p style={{fontSize:"1.05rem",color:G,lineHeight:1.75,margin:"0 0 2rem",maxWidth:460}}>QR tabanlı dijital sadakat sistemi ile tekrar satışlarınızı artırın. Kağıt kart yok. Uygulama yok.</p>
              <div className="landing-ctas" style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1.75rem"}}>
                <a href="/card" style={{padding:"0.875rem 1.75rem",borderRadius:12,background:`linear-gradient(135deg,${I},${P})`,color:"white",textDecoration:"none",fontSize:"0.95rem",fontWeight:700,boxShadow:"0 8px 24px rgba(99,102,241,0.4)"}}>Ücretsiz Demo Dene →</a>
                <a href="#nasil" style={{padding:"0.875rem 1.5rem",borderRadius:12,border:`1.5px solid ${B}`,color:D,textDecoration:"none",fontSize:"0.95rem",fontWeight:600}}>Nasıl Çalışır?</a>
              </div>
              <div className="landing-trust-items" style={{display:"flex",gap:"1.25rem",flexWrap:"wrap"}}>
                {["✓ Kurulum yok","✓ Uygulama yok","✓ 7 gün ücretsiz"].map(t=>(
                  <span key={t} style={{fontSize:"0.78rem",color:G,fontWeight:500}}>{t}</span>
                ))}
              </div>
            </div>
            <div className="landing-phone-hide">
              <PhoneMockup stamps={stamps}/>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{background:"#F8FAFC",borderTop:`1px solid ${B}`,borderBottom:`1px solid ${B}`}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"1.75rem 1.25rem"}}>
          <div className="landing-4col">
            {[{n:"500+",l:"Aktif İşletme"},{n:"10K+",l:"Müşteri Kaydı"},{n:"%28",l:"Daha Fazla Tekrar"},{n:"4.9★",l:"Memnuniyet"}].map(s=>(
              <div key={s.n}><div style={{fontSize:"1.6rem",fontWeight:800,color:I}}>{s.n}</div><div style={{fontSize:"0.78rem",color:G,marginTop:2}}>{s.l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{padding:"5rem 1.25rem"}}>
        <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",fontWeight:700,color:I,letterSpacing:"0.15em",marginBottom:"0.75rem"}}>SORUN</div>
          <h2 style={{fontSize:"clamp(1.5rem,3.5vw,2.25rem)",fontWeight:800,letterSpacing:"-0.02em",margin:"0 0 1rem"}}>Müşterileriniz geliyor...<br/>ama geri gelmiyor mu?</h2>
          <p style={{color:G,fontSize:"1rem",marginBottom:"2.5rem",lineHeight:1.7}}>Tekrar satış, yeni müşteriden 5x daha ucuzdur.</p>
          <div className="landing-3col">
            {[{i:"📋",t:"Kağıt Kartlar Kaybolur",d:"Müşteri kartı kaybeder, sadakat sıfırlanır, gelir fırsatı kaçar."},{i:"👻",t:"Müşteri Takibi Yok",d:"Kim 3 aydır gelmedi? Bilinmiyor. Geri çağırma imkânı yok."},{i:"📉",t:"Tekrar Satış Yok",d:"Sadakat sistemi olmadan her satış sanki ilk satış gibidir."}].map(p=>(
              <div key={p.t} style={{background:"white",border:`1px solid ${B}`,borderRadius:16,padding:"1.25rem",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>{p.i}</div>
                <div style={{fontWeight:700,marginBottom:"0.4rem",fontSize:"0.9rem"}}>{p.t}</div>
                <div style={{color:G,fontSize:"0.82rem",lineHeight:1.6}}>{p.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="nasil" style={{background:"#F8FAFC",borderTop:`1px solid ${B}`,padding:"5rem 1.25rem"}}>
        <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",fontWeight:700,color:I,letterSpacing:"0.15em",marginBottom:"0.75rem"}}>ÇÖZÜM</div>
          <h2 style={{fontSize:"clamp(1.5rem,3.5vw,2.25rem)",fontWeight:800,letterSpacing:"-0.02em",margin:"0 0 2.5rem"}}>Tek QR ile sadakati otomatik hale getirin</h2>
          <div className="landing-how-grid">
            {[{n:"1",i:"📱",t:"QR Okuttu",d:"Kasadaki standa telefonu gösterir."},{n:"2",i:"⭐",t:"Damga Eklendi",d:"Sistem otomatik kaydeder."},{n:"3",i:"📊",t:"İşletme Görür",d:"Panelden anlık takip edersiniz."},{n:"4",i:"🔄",t:"Geri Gelir",d:"Hediyesi için tekrar ziyaret eder."}].map(s=>(
              <div key={s.n} style={{background:"white",border:`1px solid ${B}`,borderRadius:16,padding:"1.25rem"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${I},${P})`,color:"white",fontWeight:800,fontSize:"0.85rem",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 0.75rem"}}>{s.n}</div>
                <div style={{fontSize:"1.25rem",marginBottom:"0.4rem"}}>{s.i}</div>
                <div style={{fontWeight:700,fontSize:"0.85rem",marginBottom:"0.3rem"}}>{s.t}</div>
                <div style={{color:G,fontSize:"0.78rem",lineHeight:1.5}}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="ozellikler" style={{padding:"5rem 1.25rem"}}>
        <div style={{maxWidth:860,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",fontWeight:700,color:I,letterSpacing:"0.15em",marginBottom:"0.75rem"}}>ÖZELLİKLER</div>
          <h2 style={{fontSize:"clamp(1.5rem,3.5vw,2.25rem)",fontWeight:800,letterSpacing:"-0.02em",margin:"0 0 2.5rem"}}>İhtiyacınız olan her şey tek sistemde</h2>
          <div className="landing-3col">
            {[{i:"📱",t:"QR ile Anında Giriş",d:"Saniyeler içinde damga eklenir."},{i:"⭐",t:"Dijital Damga Sistemi",d:"Kağıt kart yok, kayıp yok."},{i:"📊",t:"Anlık Analitik Panel",d:"Günlük müşteri ve damga takibi."},{i:"📲",t:"SMS Geri Çağırma",d:"İzinli, KVKK uyumlu hatırlatma."},{i:"🎁",t:"Kampanya Oluşturma",d:"Sınırsız kampanya tanımlayın."},{i:"🔒",t:"KVKK Uyumlu",d:"Müşteri verileri şifreli saklanır."}].map(f=>(
              <div key={f.t} style={{background:"white",border:`1px solid ${B}`,borderRadius:16,padding:"1.25rem",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:"1.5rem",marginBottom:"0.5rem"}}>{f.i}</div>
                <div style={{fontWeight:700,marginBottom:"0.4rem",fontSize:"0.9rem"}}>{f.t}</div>
                <div style={{color:G,fontSize:"0.82rem",lineHeight:1.6}}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI */}
      <section style={{background:`linear-gradient(135deg,${I},${P})`,padding:"5rem 1.25rem"}}>
        <div style={{maxWidth:760,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",fontWeight:700,color:"rgba(255,255,255,0.6)",letterSpacing:"0.15em",marginBottom:"0.75rem"}}>KÂRLILIK</div>
          <h2 style={{fontSize:"clamp(1.5rem,3.5vw,2.25rem)",fontWeight:800,color:"white",margin:"0 0 1rem",letterSpacing:"-0.02em"}}>Sadakat sistemi size para kazandırır</h2>
          <p style={{color:"rgba(255,255,255,0.75)",fontSize:"1rem",marginBottom:"2.5rem",lineHeight:1.7}}>Tekrar gelen müşteri edinimi yeni müşteriden 5x daha ucuzdur.</p>
          <div className="landing-roi-grid">
            {[{n:"%28",l:"Daha Fazla Tekrar Ziyaret",s:"tahmini ortalama"},{n:"5x",l:"Daha Ucuz Müşteri Tutma",s:"yeni müşteriye göre"},{n:"↑30%",l:"Müşteri Yaşam Boyu Değeri",s:"sadakat sistemli işletmeler"}].map(r=>(
              <div key={r.n} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:16,padding:"1.5rem"}}>
                <div style={{fontSize:"2rem",fontWeight:900,color:"white"}}>{r.n}</div>
                <div style={{fontWeight:700,color:"white",fontSize:"0.85rem",margin:"0.25rem 0"}}>{r.l}</div>
                <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,0.5)"}}>{r.s}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="fiyat" style={{padding:"5rem 1.25rem",background:"#F8FAFC",borderTop:`1px solid ${B}`}}>
        <div style={{maxWidth:480,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:"0.7rem",fontWeight:700,color:I,letterSpacing:"0.15em",marginBottom:"0.75rem"}}>FİYATLANDIRMA</div>
          <h2 style={{fontSize:"clamp(1.5rem,3.5vw,2.25rem)",fontWeight:800,letterSpacing:"-0.02em",margin:"0 0 0.75rem"}}>Basit fiyat, güçlü sistem</h2>
          <p style={{color:G,marginBottom:"2rem",fontSize:"0.95rem"}}>Her şey dahil. Gizli ücret yok.</p>
          <div style={{background:"white",border:`2px solid ${I}`,borderRadius:24,padding:"2.5rem 1.75rem",boxShadow:"0 8px 32px rgba(99,102,241,0.15)"}}>
            <div style={{fontSize:"0.75rem",fontWeight:700,color:I,letterSpacing:"0.12em",marginBottom:"0.5rem"}}>İŞLETME PAKETİ</div>
            <div style={{display:"flex",alignItems:"baseline",justifyContent:"center",gap:"0.25rem",marginBottom:"0.25rem"}}>
              <span style={{fontSize:"3rem",fontWeight:900,color:D}}>5.000</span>
              <span style={{fontWeight:700,color:G}}>TL / yıl</span>
            </div>
            <div style={{fontSize:"0.82rem",color:G,marginBottom:"1.75rem"}}>7 gün ücretsiz demo • Kredi kartı gerekmez</div>
            <div style={{display:"flex",flexDirection:"column",gap:"0.625rem",marginBottom:"2rem",textAlign:"left"}}>
              {["✓ QR tabanlı müşteri sistemi","✓ Sınırsız damga & kampanya","✓ Anlık analitik dashboard","✓ SMS geri çağırma modülü","✓ Fiziksel QR pleksi stand","✓ 1 yıl teknik destek","✓ Kurulum dahil"].map(f=>(
                <div key={f} style={{fontSize:"0.875rem",color:D,fontWeight:500}}>{f}</div>
              ))}
            </div>
            <a href="/card" style={{display:"block",padding:"0.9rem",borderRadius:12,background:`linear-gradient(135deg,${I},${P})`,color:"white",textDecoration:"none",fontWeight:700,fontSize:"0.95rem",boxShadow:"0 8px 20px rgba(99,102,241,0.4)",textAlign:"center"}}>Ücretsiz Başla →</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"5rem 1.25rem"}}>
        <div style={{maxWidth:640,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"2.5rem"}}>
            <div style={{fontSize:"0.7rem",fontWeight:700,color:I,letterSpacing:"0.15em",marginBottom:"0.75rem"}}>SSS</div>
            <h2 style={{fontSize:"clamp(1.4rem,3vw,2rem)",fontWeight:800,letterSpacing:"-0.02em"}}>Sık sorulan sorular</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.625rem"}}>
            {faqData.map((f,i)=>(
              <div key={i} style={{border:`1px solid ${B}`,borderRadius:14,overflow:"hidden"}}>
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{width:"100%",padding:"1rem 1.25rem",background:openFaq===i?"rgba(99,102,241,0.04)":"white",border:"none",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",fontFamily:"inherit",fontWeight:600,fontSize:"0.9rem",color:D,textAlign:"left" as const}}>
                  {f.q}<span style={{fontSize:"1.1rem",color:I,marginLeft:"0.5rem",flexShrink:0}}>{openFaq===i?"−":"+"}</span>
                </button>
                {openFaq===i&&<div style={{padding:"0.125rem 1.25rem 1rem",fontSize:"0.875rem",color:G,lineHeight:1.7}}>{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{padding:"5rem 1.25rem",background:D}}>
        <div style={{maxWidth:600,margin:"0 auto",textAlign:"center"}}>
          <h2 style={{fontSize:"clamp(1.6rem,4vw,2.5rem)",fontWeight:900,color:"white",letterSpacing:"-0.02em",margin:"0 0 1rem"}}>
            Müşterilerinizi geri kazanmaya<br/>
            <span style={{background:`linear-gradient(135deg,${I},${P})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>bugün başlayın.</span>
          </h2>
          <p style={{color:"rgba(255,255,255,0.55)",fontSize:"1rem",marginBottom:"2rem"}}>7 gün boyunca ücretsiz deneyin. Kart gerekmez.</p>
          <a href="/card" style={{display:"inline-block",padding:"1rem 2.5rem",borderRadius:14,background:`linear-gradient(135deg,${I},${P})`,color:"white",textDecoration:"none",fontWeight:700,fontSize:"1.05rem",boxShadow:"0 8px 24px rgba(99,102,241,0.5)"}}>Ücretsiz Başla →</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:D,borderTop:"1px solid rgba(255,255,255,0.07)",padding:"1.5rem 1.25rem"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
            <div style={{width:26,height:26,background:`linear-gradient(135deg,${I},${P})`,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:800,fontSize:"0.75rem"}}>★</div>
            <span style={{fontWeight:700,color:"rgba(255,255,255,0.8)",fontSize:"0.875rem"}}>SadakatPro</span>
          </div>
          <div style={{display:"flex",gap:"1.5rem"}}>
            {["Gizlilik","KVKK","İletişim"].map(l=>(
              <a key={l} href="#" style={{color:"rgba(255,255,255,0.35)",textDecoration:"none",fontSize:"0.78rem"}}>{l}</a>
            ))}
          </div>
          <span style={{color:"rgba(255,255,255,0.25)",fontSize:"0.75rem"}}>© 2025 SadakatPro</span>
        </div>
      </footer>
    </div>
  );
}

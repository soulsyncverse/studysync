import { useState, useEffect, useRef, useCallback } from "react";

const T = {
  dark:  { bg:"#08080f", card:"rgba(255,255,255,0.05)", input:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.09)", text:"#f0f0f0", sub:"#777", muted:"#2a2a3a", nav:"rgba(8,8,15,0.95)", pill:"rgba(255,255,255,0.07)", a1:"#FF6B6B", a2:"#6EE7F7", a3:"#B8FF6B", a4:"#FFB86B", a5:"#C16BFF", sh:"0 8px 32px rgba(0,0,0,0.5)", nb:"rgba(14,14,22,0.99)" },
  light: { bg:"#f7f5f0", card:"#ffffff", input:"#ffffff", border:"rgba(0,0,0,0.09)", text:"#141414", sub:"#777", muted:"#ccc", nav:"rgba(247,245,240,0.96)", pill:"rgba(0,0,0,0.06)", a1:"#FF4757", a2:"#00B8D4", a3:"#36B37E", a4:"#FF8C00", a5:"#8E44AD", sh:"0 4px 20px rgba(0,0,0,0.09)", nb:"rgba(255,255,255,0.99)" },
};

const EXAMS = {
  "UPSC CSE": { icon:"🏛️", color:"#FF6B6B", modes: { "Prelims": { date:"2026-05-24", subjects:[{n:"History",c:"#FF6B6B",i:"📜",w:15},{n:"Geography",c:"#6EE7F7",i:"🗺️",w:15},{n:"Polity",c:"#B8FF6B",i:"⚖️",w:20},{n:"Economy",c:"#FFB86B",i:"📈",w:15},{n:"Environment",c:"#6BFFC1",i:"🌿",w:10},{n:"Science & Tech",c:"#FF8B94",i:"🔬",w:10},{n:"Cur. Affairs",c:"#FFE66D",i:"📰",w:15},{n:"CSAT",c:"#C16BFF",i:"🧠",w:0}], tips:["NCERTs first — build strong foundation","Solve 10 years PYQs daily","Read The Hindu + PIB every morning","CSAT is qualifying (33%) — don't ignore","Revise each topic minimum 3 times"] }, "Mains": { date:"2026-09-20", subjects:[{n:"Essay",c:"#FF6B6B",i:"✍️",w:15},{n:"GS I",c:"#FFB86B",i:"🕌",w:15},{n:"GS II",c:"#B8FF6B",i:"🏛️",w:15},{n:"GS III",c:"#6EE7F7",i:"📈",w:15},{n:"GS IV Ethics",c:"#a78bfa",i:"💎",w:15},{n:"Optional I",c:"#FFE66D",i:"📚",w:12},{n:"Optional II",c:"#6BFFC1",i:"📚",w:13}], tips:["Write 5 answers daily","Use diagrams in answers","Ethics: read ARC reports","Essay: 2 per week","Integrate current affairs"] } } },
  "UPPCS": { icon:"🏔️", color:"#6EE7F7", modes: { "Prelims": { date:"2026-12-15", subjects:[{n:"History",c:"#FF6B6B",i:"📜",w:15},{n:"UP History",c:"#FFB86B",i:"🕌",w:10},{n:"Geography",c:"#6EE7F7",i:"🗺️",w:10},{n:"UP Geography",c:"#B8FF6B",i:"🌄",w:10},{n:"Polity",c:"#C16BFF",i:"⚖️",w:15},{n:"Economy",c:"#FFE66D",i:"📈",w:10},{n:"UP Economy",c:"#6BFFC1",i:"🏭",w:10},{n:"Cur. Affairs",c:"#FF8B94",i:"📰",w:20}], tips:["Focus on UP-specific topics","UP Budget & ODOP scheme","Solve UPPCS PYQs last 10 years","Include UP state news","GS Paper II qualifying — 33%"] }, "Mains": { date:"2027-03-01", subjects:[{n:"General Hindi",c:"#FF6B6B",i:"📝",w:20},{n:"Essay",c:"#FFB86B",i:"✍️",w:15},{n:"GS I",c:"#6EE7F7",i:"📜",w:15},{n:"GS II",c:"#B8FF6B",i:"⚖️",w:15},{n:"GS III",c:"#FFE66D",i:"📈",w:15},{n:"GS IV Ethics",c:"#a78bfa",i:"💎",w:10},{n:"Optional",c:"#6BFFC1",i:"📚",w:10}], tips:["Hindi paper is scoring","UP schemes: ODOP","Answer in Hindi for bonus","Read UP govt portal","Focus on UP Budget"] } } },
  "CAPF": { icon:"🛡️", color:"#B8FF6B", modes: { "Paper I": { date:"2026-08-10", subjects:[{n:"General Ability",c:"#B8FF6B",i:"🧠",w:25},{n:"General Science",c:"#6EE7F7",i:"🔬",w:20},{n:"Current Events",c:"#FFE66D",i:"📰",w:20},{n:"Indian Polity",c:"#FF6B6B",i:"⚖️",w:20},{n:"History & Culture",c:"#FFB86B",i:"📜",w:15}], tips:["Physical test + academics","General Science is key","Know security forces roles","Focus on defence news","Previous year papers"] }, "Paper II": { date:"2026-08-10", subjects:[{n:"Essay",c:"#B8FF6B",i:"✍️",w:40},{n:"Comprehension",c:"#6EE7F7",i:"📖",w:30},{n:"Précis Writing",c:"#FFB86B",i:"✂️",w:30}], tips:["Essay writing daily","Précis: 1/3rd of original","Read passage twice"] } } },
  "NDA/CDS": { icon:"⭐", color:"#FFB86B", modes: { "NDA": { date:"2026-09-14", subjects:[{n:"Mathematics",c:"#FFB86B",i:"🔢",w:50},{n:"General Ability",c:"#6EE7F7",i:"🧠",w:50}], tips:["Maths is scoring — master it","English in GAT is important","Physics/Chemistry: NCERT","Start SSB prep now","Physical fitness matters"] }, "CDS": { date:"2026-11-09", subjects:[{n:"English",c:"#FF8B94",i:"🔤",w:33},{n:"General Knowledge",c:"#6EE7F7",i:"🌍",w:33},{n:"Elementary Maths",c:"#FFB86B",i:"🔢",w:34}], tips:["English grammar is key","GK: defence + current affairs","Maths: Class 10 level","SSB mock interviews","Physical fitness"] } } },
  "Custom": { icon:"🎯", color:"#C16BFF", modes: { "Exam": { date:"", subjects:[{n:"Subject 1",c:"#FF6B6B",i:"📚",w:50},{n:"Subject 2",c:"#6EE7F7",i:"📚",w:50}], tips:["Add your study strategy","Customize subjects"] } } },
};

const PUBLIC_CIRCLE = [
  {id:1,name:"Aarav S.",av:"A",streak:42,city:"Delhi",   studying:true, subj:"Polity"},
  {id:2,name:"Priya M.",av:"P",streak:38,city:"Lucknow", studying:false,subj:null},
  {id:3,name:"Rohit K.",av:"R",streak:31,city:"Kanpur",  studying:true, subj:"History"},
  {id:4,name:"Sneha T.",av:"S",streak:28,city:"Prayagraj",studying:true,subj:"Economy"},
  {id:5,name:"Dev P.",  av:"D",streak:25,city:"Agra",    studying:false,subj:null},
  {id:6,name:"Meera J.",av:"M",streak:22,city:"Varanasi",studying:true, subj:"Geography"},
  {id:7,name:"Karan B.",av:"K",streak:19,city:"Noida",   studying:false,subj:null},
  {id:8,name:"Isha R.", av:"I",streak:15,city:"Meerut",  studying:true, subj:"Ethics"},
];

// Subject-wise study data for report
const SUBJECT_DATA = [
  {subj:"Polity",     c:"#B8FF6B", hours:[1.5,0,2,1,2.5,0,1],   total:8},
  {subj:"History",    c:"#FF6B6B", hours:[2,1,1.5,0,1.5,1,1.5], total:8.5},
  {subj:"Economy",    c:"#FFB86B", hours:[1,1.5,2,2,2,1,1],     total:10.5},
  {subj:"Geography",  c:"#6EE7F7", hours:[1,0.5,1,1,1,0.5,1],   total:6},
  {subj:"Cur. Affairs",c:"#FFE66D",hours:[1,1,1,1,1,1,1.5],    total:7.5},
];
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CHAIN=Array.from({length:35},(_,i)=>({d:i+1,done:i<17||(i>=20&&i<29),today:i===29}));

function pad(n){return String(n).padStart(2,"0");}
function dl(date){if(!date)return null;return Math.max(0,Math.ceil((new Date(date)-new Date())/86400000));}
function avbg(c){return `hsl(${c.charCodeAt(0)*37%360},52%,46%)`;}
function Av({c,sz=36}){return <div style={{width:sz,height:sz,borderRadius:"50%",background:avbg(c),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",fontSize:sz*.38,flexShrink:0}}>{c}</div>;}

// ── MODERN MINIMAL LOGO ───────────────────────────────────────
function Logo({sz=32,dark=true}){
  const fg = dark ? "#ffffff" : "#0a0a14";
  return(
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#34d399"/>
        </linearGradient>
      </defs>
      {/* Rounded square bg */}
      <rect width="40" height="40" rx="11" fill="url(#lg)"/>
      {/* S letterform — two arcs */}
      <path d="M26 13 C26 13 14 13 14 18 C14 23 26 20 26 25 C26 30 14 30 14 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── AI CALL HELPER (works without proxy in demo) ──────────────
async function callAI(prompt, system="You are a helpful UPSC study assistant."){
  try{
    const r = await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json","anthropic-version":"2023-06-01","x-api-key": process.env.REACT_APP_ANTHROPIC_KEY||""},
      body: JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system,messages:[{role:"user",content:prompt}]})
    });
    // Try proxy if direct fails
    if(!r.ok) throw new Error("direct failed");
    const d = await r.json();
    return d.content?.[0]?.text || "Could not generate.";
  } catch {
    try {
      const r2 = await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}],system,max_tokens:500})});
      const d2 = await r2.json();
      return d2.content?.[0]?.text || "Could not generate.";
    } catch {
      return "AI unavailable. Please check your API key in Vercel settings.";
    }
  }
}

// ── PRICING MODAL ─────────────────────────────────────────────
function PricingModal({t,onClose,onUpgrade,isRestore,onRestore}){
  const [sel,setSel]=useState("monthly");
  const [ld,setLd]=useState(false);
  const [ok,setOk]=useState(false);
  const [studyRestore,setStudyRestore]=useState(false);
  const plans={trial:{l:"7-Day Free Trial",p:0,per:"then ₹25/mo",badge:"START FREE",c:"#34d399"},monthly:{l:"1 Month",p:25,orig:50,per:"month",badge:"50% OFF",c:"#a78bfa"},quarter:{l:"3 Months",p:70,orig:150,per:"3 months",badge:"BEST VALUE",c:"#60a5fa"}};
  const feats=[{i:"🤖",l:"AI Assistant"},{i:"📝",l:"Notes & Cards"},{i:"👥",l:"Private Circles"},{i:"📊",l:"Analytics"},{i:"🎯",l:"Exam Plans"},{i:"🚫",l:"No Ads"}];
  const pay=async()=>{setLd(true);await new Promise(r=>setTimeout(r,1200));setLd(false);setOk(true);setTimeout(()=>{if(isRestore)onRestore();else onUpgrade();onClose();},1500);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"26px 26px 0 0",width:"100%",maxWidth:540,maxHeight:"92vh",overflowY:"auto",border:"1px solid rgba(129,140,248,0.2)",borderBottom:"none"}}>
        <div style={{background:"linear-gradient(135deg,rgba(129,140,248,0.18),rgba(52,211,153,0.1))",padding:"18px 18px 14px",borderRadius:"26px 26px 0 0",textAlign:"center"}}>
          <div style={{width:30,height:4,background:"rgba(255,255,255,0.18)",borderRadius:2,margin:"0 auto 12px"}}/>
          <div style={{fontSize:20}}>⚡</div>
          <div style={{fontSize:19,fontWeight:900,background:"linear-gradient(135deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginTop:3}}>{isRestore?"Restore Your Streak 🔥":"StudySync Premium"}</div>
          <div style={{color:"rgba(255,255,255,0.45)",fontSize:11,marginTop:3}}>{isRestore?"Don't let your hard work go to waste":"7-day free trial · Cancel anytime"}</div>
        </div>
        <div style={{padding:"14px 16px 0"}}>
          {isRestore&&(<>
            <div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:15,padding:"13px",marginBottom:11,textAlign:"center"}}>
              <div style={{fontSize:32}}>🔥</div>
              <div style={{color:"#FF6B6B",fontWeight:900,fontSize:20,marginTop:3}}>Streak Broken!</div>
              <div style={{color:t.sub,fontSize:11,marginTop:3}}>Restore for ₹10 (first time) or study 2× today</div>
            </div>
            <div style={{background:t.card,border:"1.5px solid rgba(129,140,248,0.35)",borderRadius:13,padding:"12px",marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{color:t.text,fontWeight:800,fontSize:13}}>💳 Pay to Restore</div><div style={{display:"flex",alignItems:"center",gap:5}}><div style={{color:t.sub,fontSize:11,textDecoration:"line-through"}}>₹20</div><div style={{background:"linear-gradient(135deg,#818cf8,#60a5fa)",color:"#fff",borderRadius:7,padding:"1px 7px",fontSize:10,fontWeight:800}}>₹10</div></div></div>
              <div style={{color:t.sub,fontSize:10,marginBottom:8}}>One-time offer — first restore only</div>
              <button onClick={pay} disabled={ld} style={{width:"100%",background:ld?"rgba(129,140,248,0.3)":"linear-gradient(135deg,#818cf8,#60a5fa)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>{ld?<><div style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",animation:"spin .7s linear infinite"}}/>Restoring…</>:"Pay ₹10 — Restore Now"}</button>
            </div>
            <div style={{background:t.card,border:"1px solid rgba(52,211,153,0.3)",borderRadius:13,padding:"12px",marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><div style={{color:t.text,fontWeight:800,fontSize:13}}>📖 Study to Restore</div><div style={{background:"rgba(52,211,153,0.2)",color:"#34d399",borderRadius:7,padding:"1px 7px",fontSize:10,fontWeight:800}}>FREE</div></div>
              <div style={{color:t.sub,fontSize:10,marginBottom:8}}>Study 2× today (4+ hours) to restore</div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3,overflow:"hidden",marginBottom:8}}><div style={{height:"100%",width:"37%",background:"linear-gradient(90deg,#34d399,#60a5fa)",borderRadius:3}}/></div>
              <button onClick={()=>{setStudyRestore(true);onClose();}} style={{width:"100%",background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.35)",borderRadius:10,padding:"9px",color:"#34d399",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Start Study Restore Challenge</button>
            </div>
          </>)}
          {!isRestore&&(<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:13}}>
              {Object.entries(plans).map(([k,p])=>(
                <button key={k} onClick={()=>setSel(k)} style={{background:sel===k?`${p.c}18`:t.card,border:`2px solid ${sel===k?p.c:t.border}`,borderRadius:13,padding:"10px 5px",cursor:"pointer",fontFamily:"inherit",textAlign:"center",position:"relative",transition:"all .25s"}}>
                  {p.badge&&<div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",background:sel===k?p.c:"rgba(129,140,248,0.75)",color:"#fff",fontSize:7,fontWeight:900,padding:"2px 5px",borderRadius:14,whiteSpace:"nowrap"}}>{p.badge}</div>}
                  <div style={{color:t.sub,fontSize:9,fontWeight:600,marginBottom:2}}>{p.l}</div>
                  {p.p===0?<div style={{color:p.c,fontWeight:900,fontSize:14}}>FREE</div>:<><div style={{color:t.text,fontWeight:900,fontSize:17}}><span style={{fontSize:10}}>₹</span>{p.p}</div>{p.orig&&<div style={{color:t.muted,fontSize:8,textDecoration:"line-through"}}>₹{p.orig}</div>}</>}
                  <div style={{color:p.c,fontSize:8,fontWeight:700,marginTop:1}}>{p.per}</div>
                </button>
              ))}
            </div>
            {!ok?(
              <button onClick={pay} disabled={ld} style={{width:"100%",padding:"12px",borderRadius:13,border:"none",cursor:"pointer",background:ld?"rgba(129,140,248,0.3)":sel==="trial"?"linear-gradient(135deg,#34d399,#10b981)":"linear-gradient(135deg,#818cf8,#60a5fa)",color:"#fff",fontWeight:900,fontSize:13,fontFamily:"inherit",boxShadow:ld?"none":"0 0 24px rgba(129,140,248,0.35)",transition:"all .3s",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:7}}>
                {ld?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",animation:"spin .7s linear infinite"}}/>Processing…</>:sel==="trial"?"🎉 Start 7-Day Free Trial":`💳 Pay ₹${plans[sel].p} with Razorpay`}
              </button>
            ):(
              <div style={{padding:"12px",borderRadius:13,background:"linear-gradient(135deg,#34d399,#10b981)",color:"#fff",fontWeight:900,fontSize:13,textAlign:"center",marginBottom:7}}>✓ {isRestore?"Streak Restored!":"Welcome to Premium! 🎉"}</div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              {feats.map(f=><div key={f.l} style={{background:t.card,border:"1px solid rgba(129,140,248,0.1)",borderRadius:9,padding:"8px 5px",textAlign:"center"}}><div style={{fontSize:16,marginBottom:2}}>{f.i}</div><div style={{color:t.text,fontWeight:700,fontSize:8,lineHeight:1.2}}>{f.l}</div></div>)}
            </div>
            <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:4}}>
              {["🔒 Secure","💳 UPI/Cards","↩️ Cancel anytime"].map(b=><div key={b} style={{color:t.sub,fontSize:9}}>{b}</div>)}
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}

// ── EXAM SETUP ────────────────────────────────────────────────
function ExamSetup({t,es,setEs,onClose}){
  const [ex,setEx]=useState(es.key||"UPSC CSE");
  const [md,setMd]=useState(es.mode||"Prelims");
  const [dt,setDt]=useState(es.date||"");
  const [custSubjs,setCustSubjs]=useState([]);
  const [ns,setNs]=useState("");const [nc,setNc]=useState("#FF6B6B");
  const cfg=EXAMS[ex];const modeData=cfg?.modes[md];
  const modes=Object.keys(cfg?.modes||{});
  const subjs=ex==="Custom"?custSubjs:(modeData?.subjects||[]);
  const COLS=["#FF6B6B","#6EE7F7","#B8FF6B","#FFB86B","#C16BFF","#FFE66D","#6BFFC1","#FF8B94","#818cf8","#34d399"];
  const apply=()=>{setEs({key:ex,mode:md,name:`${ex} ${md}`,date:dt||modeData?.date||"",color:cfg?.color||"#818cf8",icon:cfg?.icon||"🎯",subjects:subjs,tips:modeData?.tips||[]});onClose();};
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:540,maxHeight:"88vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 34px"}}>
        <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 11px"}}/>
        <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:2}}>🎯 Set Your Exam</div>
        <div style={{color:t.sub,fontSize:11,marginBottom:13}}>Choose exam & mode — subjects auto-load</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:13}}>
          {Object.entries(EXAMS).map(([k,v])=>(
            <button key={k} onClick={()=>{setEx(k);setMd(Object.keys(v.modes)[0]);}} style={{display:"flex",alignItems:"center",gap:9,background:ex===k?`${v.color}18`:t.card,border:`1.5px solid ${ex===k?v.color:t.border}`,borderRadius:11,padding:"9px 11px",cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
              <span style={{fontSize:17}}>{v.icon}</span>
              <div style={{flex:1,textAlign:"left"}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{k}</div></div>
              {ex===k&&<div style={{width:6,height:6,borderRadius:"50%",background:v.color,boxShadow:`0 0 4px ${v.color}`}}/>}
            </button>
          ))}
        </div>
        {modes.length>1&&<div style={{marginBottom:11}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Mode</div>
          <div style={{display:"flex",gap:5}}>{modes.map(m=><button key={m} onClick={()=>setMd(m)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${md===m?(cfg?.color||"#818cf8"):t.border}`,background:md===m?`${cfg?.color||"#818cf8"}18`:t.card,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .2s"}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{m}</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>{dl(EXAMS[ex]?.modes[m]?.date)??"-"}d left</div></button>)}</div>
        </div>}
        <div style={{marginBottom:11}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Exam Date {modeData?.date?`(Default: ${modeData.date})`:""}</div>
          <input type="date" value={dt} onChange={e=>setDt(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 10px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light",boxSizing:"border-box"}}/>
        </div>
        {ex!=="Custom"&&subjs.length>0&&<div style={{marginBottom:11}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Subjects ({subjs.length} auto-loaded)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{subjs.map(s=><div key={s.n} style={{background:`${s.c}22`,color:s.c,border:`1px solid ${s.c}44`,borderRadius:14,padding:"2px 7px",fontSize:9,fontWeight:700}}>{s.i} {s.n}</div>)}</div>
        </div>}
        {ex==="Custom"&&<div style={{marginBottom:11}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Add Subjects</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{custSubjs.map((s,i)=><div key={i} style={{background:`${s.c}22`,color:s.c,border:`1px solid ${s.c}44`,borderRadius:14,padding:"2px 7px",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",gap:3}}>{s.n}<span onClick={()=>setCustSubjs(cs=>cs.filter((_,j)=>j!==i))} style={{cursor:"pointer",opacity:.7}}>×</span></div>)}</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:6}}>{COLS.map(c=><div key={c} onClick={()=>setNc(c)} style={{width:17,height:17,borderRadius:"50%",background:c,cursor:"pointer",border:nc===c?"2.5px solid white":"2px solid transparent",transition:"all .2s"}}/>)}</div>
          <div style={{display:"flex",gap:5}}><input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ns.trim()&&(setCustSubjs(s=>[...s,{n:ns.trim(),c:nc,i:"📚",w:0}]),setNs(""))} placeholder="Subject name…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={()=>ns.trim()&&(setCustSubjs(s=>[...s,{n:ns.trim(),c:nc,i:"📚",w:0}]),setNs(""))} style={{background:nc,border:"none",borderRadius:9,padding:"7px 11px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+</button></div>
        </div>}
        {modeData?.tips&&<div style={{marginBottom:13}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Strategy Tips</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>{modeData.tips.map((tip,i)=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 9px",display:"flex",gap:6}}><span style={{color:"#818cf8",fontSize:9,fontWeight:800,flexShrink:0}}>{i+1}.</span><span style={{color:t.text,fontSize:10,lineHeight:1.4}}>{tip}</span></div>)}</div>
        </div>}
        <button onClick={apply} style={{width:"100%",background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 18px rgba(129,140,248,0.3)"}}>
          {cfg?.icon} Set {ex} — {md} ✓
        </button>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login({t,onLogin}){
  const [step,setStep]=useState("main");
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState(["","","","","",""]);
  const [loading,setLoading]=useState(false);
  const refs=useRef([]);
  const go=async(fn)=>{setLoading(true);await new Promise(r=>setTimeout(r,900));setLoading(false);fn();};
  const chOtp=(i,v)=>{if(!/^\d?$/.test(v))return;const n=[...otp];n[i]=v;setOtp(n);if(v&&i<5)refs.current[i+1]?.focus();};
  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:360,height:360,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.08),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:26,animation:"fadeUp .5s ease"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
          <div style={{padding:12,borderRadius:18,background:"rgba(129,140,248,0.08)",border:"1px solid rgba(129,140,248,0.18)",boxShadow:"0 0 28px rgba(129,140,248,0.1)"}}><Logo sz={46} dark={t.bg==="#08080f"}/></div>
        </div>
        <div style={{fontSize:25,fontWeight:900,letterSpacing:-1,background:"linear-gradient(135deg,#818cf8,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>StudySync</div>
        <div style={{color:t.sub,fontSize:12,marginTop:4}}>Your study companion</div>
      </div>
      <div style={{width:"100%",maxWidth:330,background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:18,boxShadow:t.sh,animation:"fadeUp .5s .1s ease both"}}>
        {step==="main"&&(<>
          <div style={{textAlign:"center",marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:t.text}}>Sign in to StudySync</div>
            <div style={{fontSize:10,color:t.sub,marginTop:2}}>Join 50,000+ aspirants 📚</div>
          </div>
          <div style={{background:"rgba(52,211,153,0.08)",border:"1px solid rgba(52,211,153,0.25)",borderRadius:10,padding:"8px 11px",marginBottom:12,display:"flex",gap:7,alignItems:"center"}}>
            <span style={{fontSize:16}}>🎁</span>
            <div><div style={{color:"#34d399",fontWeight:800,fontSize:11}}>7-Day Free Trial</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>Full premium access — no card needed</div></div>
          </div>
          <button onClick={()=>go(()=>onLogin({name:"Kartikeya",email:"k@gmail.com"}))} disabled={loading} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:loading?t.pill:"linear-gradient(135deg,rgba(129,140,248,0.12),rgba(96,165,250,0.12))",border:"1px solid rgba(129,140,248,0.25)",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"inherit",marginBottom:8,transition:"all .25s"}}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.7 0 6.8 5.5 3 13.5l7.9 6.1C12.8 13.4 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/><path fill="#FBBC05" d="M10.9 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .8-4.4L2.4 13.5A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.4-6.2z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.1 0-11.2-4-13.1-9.5l-8 6.2C6.7 42.5 14.7 48 24 48z"/></svg>
            <span style={{color:t.text,fontWeight:700,fontSize:13}}>{loading?"Signing in…":"Continue with Gmail"}</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{flex:1,height:1,background:t.border}}/><div style={{color:t.sub,fontSize:10}}>OR</div><div style={{flex:1,height:1,background:t.border}}/></div>
          <button onClick={()=>setStep("phone")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:t.input,border:`1px solid ${t.border}`,borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:16}}>📱</span><span style={{color:t.text,fontWeight:700,fontSize:13}}>Continue with Phone</span>
          </button>
          <div style={{color:t.muted,fontSize:9,textAlign:"center",marginTop:11,lineHeight:1.6}}>Free for students · No ads · Made for India ❤️</div>
        </>)}
        {step==="phone"&&(<>
          <button onClick={()=>setStep("main")} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0,display:"flex",alignItems:"center",gap:3}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:2}}>Enter your number</div>
          <div style={{fontSize:10,color:t.sub,marginBottom:12}}>We'll send an OTP to verify</div>
          <div style={{display:"flex",marginBottom:8,overflow:"hidden",borderRadius:10,border:`1px solid ${t.border}`}}>
            <div style={{background:t.pill,padding:"10px 8px",color:t.sub,fontSize:11,fontWeight:700,borderRight:`1px solid ${t.border}`,whiteSpace:"nowrap"}}>🇮🇳 +91</div>
            <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit number" style={{flex:1,background:t.input,border:"none",padding:"10px 10px",color:t.text,fontSize:13,fontFamily:"inherit",outline:"none"}} maxLength={10} inputMode="numeric"/>
          </div>
          <button onClick={()=>go(()=>setStep("otp"))} disabled={loading||phone.length<10} style={{width:"100%",background:phone.length===10?"linear-gradient(135deg,#818cf8,#60a5fa)":t.pill,border:"none",borderRadius:11,padding:"10px",color:phone.length===10?"#fff":t.sub,fontWeight:800,fontSize:12,cursor:phone.length===10?"pointer":"not-allowed",fontFamily:"inherit",transition:"all .25s"}}>{loading?"Sending OTP…":"Send OTP →"}</button>
        </>)}
        {step==="otp"&&(<>
          <button onClick={()=>setStep("phone")} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0,display:"flex",alignItems:"center",gap:3}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:2}}>Enter OTP</div>
          <div style={{fontSize:10,color:t.sub,marginBottom:13}}>Sent to +91 {phone} · <span style={{color:"#818cf8",cursor:"pointer"}} onClick={()=>setStep("phone")}>Change</span></div>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:13}}>
            {otp.map((v,i)=><input key={i} ref={el=>refs.current[i]=el} value={v} onChange={e=>chOtp(i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&refs.current[i-1]?.focus()} maxLength={1} inputMode="numeric" style={{width:39,height:46,borderRadius:10,border:`2px solid ${v?"#818cf8":t.border}`,background:t.input,textAlign:"center",fontSize:20,fontWeight:800,color:t.text,fontFamily:"inherit",outline:"none",transition:"all .2s"}}/>)}
          </div>
          <button onClick={()=>go(()=>onLogin({name:"Kartikeya",phone}))} disabled={loading||otp.join("").length<6} style={{width:"100%",background:otp.join("").length===6?"linear-gradient(135deg,#818cf8,#60a5fa)":t.pill,border:"none",borderRadius:11,padding:"10px",color:otp.join("").length===6?"#fff":t.sub,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{loading?"Verifying…":"Verify & Sign In ✓"}</button>
        </>)}
      </div>
    </div>
  );
}

// ── TOASTS ────────────────────────────────────────────────────
function Toasts({notifs,dismiss,t}){
  return(<div style={{position:"fixed",top:64,right:10,zIndex:9999,display:"flex",flexDirection:"column",gap:6,maxWidth:285,pointerEvents:"none"}}>
    {notifs.map(n=><div key={n.id} style={{background:t.nb,border:`1px solid ${n.col||t.a1}44`,borderLeft:`3px solid ${n.col||t.a1}`,borderRadius:11,padding:"9px 10px",boxShadow:"0 8px 26px rgba(0,0,0,0.4)",display:"flex",gap:7,alignItems:"flex-start",pointerEvents:"all",animation:"slideIn .3s ease"}}><div style={{fontSize:16,flexShrink:0}}>{n.icon}</div><div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{n.title}</div><div style={{color:t.sub,fontSize:10,marginTop:1,lineHeight:1.4}}>{n.body}</div></div><button onClick={()=>dismiss(n.id)} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:13,padding:"0 1px",flexShrink:0}}>×</button></div>)}
  </div>);
}

// ── NOTIF CENTER ──────────────────────────────────────────────
function NCenter({t,onClose,history,settings,setSettings,test}){
  const list=[{k:"streakBreak",i:"🔥",l:"Streak Break Warning",d:"Alert if not studied by 9 PM"},{k:"studyReminder",i:"📖",l:"Daily Study Reminder",d:"Morning study nudge"},{k:"pomoDone",i:"⏱",l:"Pomodoro Complete",d:"Notify when session ends"},{k:"friendActivity",i:"👥",l:"Friend Activity",d:"When friends start studying"},{k:"leaderboard",i:"🏆",l:"Leaderboard Updates",d:"Weekly rank changes"}];
  return(<div style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 32px"}}>
      <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 12px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:13,fontWeight:800,color:t.text}}>🔔 Notifications</div>
        <button onClick={test} style={{background:`${t.a2}22`,border:`1px solid ${t.a2}44`,borderRadius:8,padding:"4px 10px",color:t.a2,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Test</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:14}}>
        {list.map(s=><div key={s.k} style={{display:"flex",alignItems:"center",gap:8,background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"9px 11px"}}><div style={{fontSize:16}}>{s.i}</div><div style={{flex:1}}><div style={{color:t.text,fontWeight:600,fontSize:12}}>{s.l}</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>{s.d}</div></div><div onClick={()=>setSettings(p=>({...p,[s.k]:!p[s.k]}))} style={{width:38,height:21,borderRadius:10,cursor:"pointer",background:settings[s.k]?t.a3:t.pill,position:"relative",transition:"all .3s",flexShrink:0}}><div style={{position:"absolute",top:2,left:settings[s.k]?17:2,width:17,height:17,borderRadius:"50%",background:settings[s.k]?"#0a0a0f":"#888",transition:"all .3s"}}/></div></div>)}
      </div>
      <div style={{fontSize:8,color:t.sub,marginBottom:7,textTransform:"uppercase",letterSpacing:1.5}}>Recent</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {history.length===0?<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"11px 0"}}>No notifications yet</div>
        :history.slice(-5).reverse().map(n=><div key={n.id} style={{display:"flex",gap:7,alignItems:"flex-start",background:t.card,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 9px"}}><div style={{fontSize:14}}>{n.icon}</div><div style={{flex:1}}><div style={{color:t.text,fontWeight:600,fontSize:11}}>{n.title}</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>{n.body}</div></div><div style={{color:t.muted,fontSize:8,flexShrink:0}}>{n.time}</div></div>)}
      </div>
    </div>
  </div>);
}

// ── QR MODAL ──────────────────────────────────────────────────
function QRModal({t,user,onClose,setFriends}){
  const [tab,setTab]=useState("myqr");const [inp,setInp]=useState("");const [done,setDone]=useState(false);const [cp,setCp]=useState(false);
  const n=(user?.name||"K").toUpperCase().replace(/\s/g,"-");
  const code=`SYNC-${n.slice(0,6)}-${Math.abs(n.charCodeAt(0)*997)%9000+1000}`;
  const link=`https://studysync-4cvf.vercel.app/join?code=${code}`;
  function QRSvg({sz=165}){const cells=21,cell=sz/cells;const dots=[];for(let r=0;r<cells;r++)for(let c=0;c<cells;c++){const ic=(r<7&&c<7)||(r<7&&c>cells-8)||(r>cells-8&&c<7);if(!ic&&(code.charCodeAt((r*cells+c)%code.length)%(2+r%3))===0)dots.push({r,c});}const corners=[{r:0,c:0},{r:0,c:cells-7},{r:cells-7,c:0}];return(<svg width={sz} height={sz} style={{borderRadius:12,display:"block",margin:"0 auto"}}><rect width={sz} height={sz} fill={t.card} rx={10}/>{dots.map((d,i)=><rect key={i} x={d.c*cell+1} y={d.r*cell+1} width={cell-2} height={cell-2} rx={2} fill="#818cf8" opacity={.8}/>)}{corners.map((c,i)=><g key={i}><rect x={c.c*cell} y={c.r*cell} width={7*cell} height={7*cell} fill="#818cf8" rx={4}/><rect x={c.c*cell+cell} y={c.r*cell+cell} width={5*cell} height={5*cell} fill={t.card} rx={3}/><rect x={c.c*cell+2*cell} y={c.r*cell+2*cell} width={3*cell} height={3*cell} fill="#818cf8" rx={2}/></g>)}<rect x={sz/2-15} y={sz/2-15} width={30} height={30} rx={7} fill={t.card}/><foreignObject x={sz/2-11} y={sz/2-11} width={22} height={22}><Logo sz={22} dark={t.bg==="#08080f"}/></foreignObject></svg>);}
  const add=()=>{if(!inp.trim())return;setDone(true);setTimeout(()=>{setFriends(f=>[...f,{id:Date.now(),name:"New Friend",av:"N",streak:0,on:false,subj:null,brk:false}]);setInp("");setDone(false);},1200);};
  const copy=()=>{navigator.clipboard?.writeText(link).catch(()=>{});setCp(true);setTimeout(()=>setCp(false),2000);};
  return(<div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:12,backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:18,width:"100%",maxWidth:340,padding:15,boxShadow:t.sh}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}><div style={{fontSize:12,fontWeight:800,color:t.text}}>👥 Add to Circle</div><button onClick={onClose} style={{background:t.pill,border:"none",borderRadius:7,width:25,height:25,cursor:"pointer",color:t.sub,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>
      <div style={{display:"flex",gap:3,background:t.pill,borderRadius:10,padding:3,marginBottom:12}}>{[["myqr","My QR"],["scan","Scan"],["link","Share"]].map(([tb,l])=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"5px 3px",borderRadius:7,border:"none",cursor:"pointer",background:tab===tb?t.card:t.pill,color:tab===tb?t.text:t.sub,fontWeight:700,fontSize:9,fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}</div>
      {tab==="myqr"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:9}}><QRSvg/><div style={{textAlign:"center"}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{user?.name||"Kartikeya"}</div><div style={{color:t.sub,fontSize:9,marginTop:2,fontFamily:"monospace",background:t.pill,padding:"2px 8px",borderRadius:6,display:"inline-block"}}>{code}</div></div></div>}
      {tab==="scan"&&<div style={{display:"flex",flexDirection:"column",gap:9}}><div style={{height:130,background:t.pill,borderRadius:12,border:`2px dashed ${t.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}><div style={{fontSize:28}}>📷</div><div style={{color:t.sub,fontSize:10}}>Camera scan (demo)</div></div><div style={{display:"flex",gap:5}}><input value={inp} onChange={e=>setInp(e.target.value)} placeholder="SYNC-XXXX-0000" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:10,fontFamily:"monospace",outline:"none"}}/><button onClick={add} style={{background:done?"#818cf8":"#60a5fa",border:"none",borderRadius:8,padding:"7px 11px",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:10,transition:"all .3s"}}>{done?"✓":"Add"}</button></div></div>}
      {tab==="link"&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{background:t.pill,borderRadius:8,padding:"8px 9px",fontSize:9,color:t.sub,fontFamily:"monospace",wordBreak:"break-all",lineHeight:1.5}}>{link}</div><button onClick={copy} style={{background:cp?"#818cf8":t.card,border:`1px solid ${cp?"#818cf8":t.border}`,borderRadius:10,padding:"9px",color:cp?"#fff":t.text,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .3s"}}>{cp?"✓ Copied!":"📋 Copy Invite Link"}</button><div style={{display:"flex",gap:5}}>{[["📲 WhatsApp","#25D366"],["✈️ Telegram","#229ED9"]].map(([l,c])=><button key={l} style={{flex:1,background:`${c}15`,border:`1px solid ${c}33`,borderRadius:8,padding:"6px 4px",color:c,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div></div>}
    </div>
  </div>);
}

// ── GATE ──────────────────────────────────────────────────────
function Gate({t,name,icon,onPro}){
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,gap:13,textAlign:"center",padding:"0 16px"}}>
    <div style={{position:"relative",width:"100%",maxWidth:270}}><div style={{filter:"blur(4px)",opacity:.25,pointerEvents:"none",display:"flex",flexDirection:"column",gap:5}}>{[1,2,3].map(i=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"11px",height:43}}/>)}</div><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}><div style={{fontSize:38}}>{icon}</div><div style={{background:"linear-gradient(135deg,rgba(129,140,248,0.9),rgba(52,211,153,0.9))",borderRadius:10,padding:"4px 12px"}}><span style={{color:"#fff",fontWeight:800,fontSize:10}}>⚡ Premium Feature</span></div></div></div>
    <div><div style={{fontSize:15,fontWeight:800,color:t.text,marginBottom:3}}>{name}</div><div style={{color:t.sub,fontSize:11,lineHeight:1.6,maxWidth:240}}>Start with <span style={{color:"#34d399",fontWeight:700}}>7-day free trial</span> or get <span style={{color:"#818cf8",fontWeight:700}}>₹25/month</span></div></div>
    <button onClick={onPro} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:12,padding:"10px 26px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 18px rgba(129,140,248,0.35)"}}>⚡ Try Free for 7 Days</button>
  </div>);
}

// ── POMODORO ──────────────────────────────────────────────────
function Pomo({t,subjects,pushN,ns}){
  const [cs,setCs]=useState(subjects[0]?.n||"History");
  const [cf,setCf]=useState(25);const [pf,setPf]=useState(25);
  const [mode,setMode]=useState("focus");const [sec,setSec]=useState(25*60);
  const [run,setRun]=useState(false);const [sess,setSess]=useState(0);
  const [show,setShow]=useState(false);const [sync,setSync]=useState(true);
  const ref=useRef();
  const dur={focus:cf,short:5,long:15};const tot=dur[mode]*60;
  const prog=((tot-sec)/tot)*100;const sc=subjects.find(s=>s.n===cs)?.c||t.a2;
  const circ=2*Math.PI*86;const dash=circ-(prog/100)*circ;
  useEffect(()=>{if(run){ref.current=setInterval(()=>setSec(s=>{if(s<=1){clearInterval(ref.current);setRun(false);if(mode==="focus"){setSess(n=>n+1);if(ns?.pomoDone)pushN({icon:"⏱",title:"Session complete! 🎉",body:`Great work on ${cs}!`,col:sc});}return 0;}return s-1;}),1000);}else clearInterval(ref.current);return()=>clearInterval(ref.current);},[run,mode]);
  const sw=(m,cm)=>{setMode(m);setSec((cm??dur[m])*60);setRun(false);};
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:15}}>
    <div style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3}}>{[["focus","Focus"],["short","Short Brk"],["long","Long Brk"]].map(([m,l])=><button key={m} onClick={()=>sw(m)} style={{padding:"6px 11px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,background:mode===m?sc:t.pill,color:mode===m?"#0a0a0f":t.sub,transition:"all .2s"}}>{l}</button>)}</div>
    <div style={{position:"relative",width:196,height:196}}>
      <svg width={196} height={196} style={{transform:"rotate(-90deg)"}}><circle cx={98} cy={98} r={86} fill="none" stroke={t.border} strokeWidth={9}/><circle cx={98} cy={98} r={86} fill="none" stroke={sc} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/></svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
        <div style={{fontSize:44,fontWeight:900,color:t.text,letterSpacing:-2,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{pad(Math.floor(sec/60))}:{pad(sec%60)}</div>
        <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:2,fontWeight:600}}>{mode==="focus"?"FOCUS":mode==="short"?"SHORT":"LONG"}</div>
        <div style={{fontSize:9,color:sc,fontWeight:700,marginTop:1}}>{cf} min</div>
      </div>
    </div>
    <div style={{background:t.card,border:`1px solid ${show?sc+"44":t.border}`,borderRadius:14,padding:"10px 14px",width:"100%",maxWidth:350,transition:"border .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:show?10:0}}><span style={{color:t.sub,fontSize:11,fontWeight:600}}>⚙️ Custom Focus</span><button onClick={()=>setShow(v=>!v)} style={{background:t.pill,border:"none",borderRadius:14,padding:"3px 8px",color:t.text,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{show?"Done":"Customize"}</button></div>
      {show&&<div style={{display:"flex",flexDirection:"column",gap:7}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:t.sub,fontSize:11}}>Duration</span><span style={{color:sc,fontWeight:900,fontSize:17}}>{pf}m</span></div><input type="range" min={25} max={45} value={pf} onChange={e=>setPf(Number(e.target.value))} style={{width:"100%",accentColor:sc,cursor:"pointer"}}/><div style={{display:"flex",gap:4}}>{[25,30,35,40,45].map(v=><button key={v} onClick={()=>setPf(v)} style={{flex:1,padding:"5px 0",borderRadius:7,border:`1px solid ${pf===v?sc:t.border}`,background:pf===v?`${sc}22`:t.pill,color:pf===v?sc:t.sub,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{v}m</button>)}</div><button onClick={()=>{setCf(pf);sw("focus",pf);setShow(false);}} style={{background:sc,border:"none",borderRadius:8,padding:"7px",color:"#0a0a0f",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Apply & Reset</button></div>}
    </div>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",maxWidth:390}}>{subjects.slice(0,8).map(s=><button key={s.n} onClick={()=>setCs(s.n)} style={{padding:"3px 9px",borderRadius:15,border:`1.5px solid ${cs===s.n?s.c:"transparent"}`,background:cs===s.n?`${s.c}22`:t.pill,color:cs===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{s.i} {s.n}</button>)}</div>
    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <button onClick={()=>{setSec(dur[mode]*60);setRun(false);}} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Reset</button>
      <button onClick={()=>setRun(r=>!r)} style={{background:run?t.card:sc,border:run?`1.5px solid ${t.border}`:"none",color:run?t.text:"#0a0a0f",borderRadius:14,padding:"11px 32px",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit",transition:"all .25s",boxShadow:run?"none":`0 0 20px ${sc}55`}}>{run?"⏸ Pause":"▶ Start"}</button>
      <button onClick={()=>sw(mode==="focus"?"short":"focus")} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Skip</button>
    </div>
    <div style={{display:"flex",gap:17}}>{[{l:"Sessions",v:sess,c:sc},{l:"Focus Time",v:`${Math.floor(sess*cf/60)}h${(sess*cf)%60}m`,c:t.text},{l:sync?"Sync ON":"Sync OFF",v:"🔗",c:sync?t.a2:t.muted,cl:true}].map(s=><div key={s.l} style={{textAlign:"center",cursor:s.cl?"pointer":"default"}} onClick={s.cl?()=>setSync(v=>!v):undefined}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1,marginTop:1}}>{s.l}</div></div>)}</div>
  </div>);
}

// ── STREAK ────────────────────────────────────────────────────
function Streak({t,pushN,ns,onRestore,streak}){
  const [broken,setBroken]=useState(false);
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{background:`${t.a1}10`,border:`1px solid ${t.a1}30`,borderRadius:15,padding:15,textAlign:"center"}}>
      <div style={{fontSize:42}}>🔥</div>
      <div style={{fontSize:48,fontWeight:900,color:t.a1,lineHeight:1}}>{streak}</div>
      <div style={{fontSize:10,color:t.sub,marginTop:2}}>Day Streak</div>
      <div style={{background:`${t.a1}16`,color:t.a1,borderRadius:9,padding:"6px 11px",marginTop:8,fontSize:10,fontWeight:700,display:"inline-block"}}>🔔 Study today — don't break the chain!</div>
    </div>
    {broken&&<div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:12,padding:"11px",display:"flex",gap:9,alignItems:"center"}}><div style={{fontSize:22}}>😢</div><div style={{flex:1}}><div style={{color:t.a1,fontWeight:800,fontSize:12}}>Streak Broken!</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>Restore for ₹10 or study 2× today</div></div><button onClick={onRestore} style={{background:"linear-gradient(135deg,#818cf8,#60a5fa)",border:"none",borderRadius:8,padding:"6px 11px",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Restore</button></div>}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
      <button onClick={()=>ns?.streakBreak&&pushN({icon:"🔥",title:"Streak at risk!",body:`${streak}-day streak on the line! Study now 😬`,col:t.a1})} style={{background:`${t.a1}13`,border:`1px solid ${t.a1}30`,borderRadius:10,padding:"9px",color:t.a1,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>🔥 Test Alert</button>
      <button onClick={()=>setBroken(v=>!v)} style={{background:`${t.a4}13`,border:`1px solid ${t.a4}30`,borderRadius:10,padding:"9px",color:t.a4,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>💔 Simulate Break</button>
    </div>
    <div><div style={{fontSize:8,color:t.sub,marginBottom:7,textTransform:"uppercase",letterSpacing:1.5}}>May 2026 — Don't Break the Chain</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {CHAIN.map(d=><div key={d.d} style={{aspectRatio:"1",borderRadius:5,background:d.today?t.a1:d.done?`${t.a1}28`:t.pill,border:d.today?`2px solid ${t.a1}`:d.done?`1px solid ${t.a1}38`:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:d.today?"#fff":d.done?t.a1:t.muted,fontWeight:d.today?900:500}}>{d.done||d.today?(d.today?"●":"✓"):d.d}</div>)}
      </div>
    </div>
    <div style={{background:`${t.a4}10`,border:`1px solid ${t.a4}28`,borderRadius:10,padding:10,display:"flex",gap:8,alignItems:"center"}}>
      <div style={{fontSize:18}}>⚡</div><div><div style={{color:t.a4,fontWeight:700,fontSize:11}}>Comeback Streak</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>Miss a day? Pay ₹10 (first time) or study 2× to restore.</div></div>
    </div>
  </div>);
}

// ── REPORT (Enhanced — subject-wise + calendar heatmap) ───────
function Report({t,es,subjects}){
  const [rep,setRep]=useState("");const [ld,setLd]=useState(false);
  const [view,setView]=useState("week"); // week | subjects | calendar
  const today=new Date();

  // Calendar heatmap data (last 35 days)
  const calData=Array.from({length:35},(_,i)=>{
    const d=new Date(today);d.setDate(today.getDate()-34+i);
    const hrs=[0,0,2.5,0,3,1.5,4,0,2,3.5,0,1,4.5,2,3,0,5,2.5,0,3.5,4,1,2,3,0,4.5,2,3.5,0,2,4,1.5,3,2.5,0][i%35]||0;
    return{date:d,hrs,label:d.toLocaleDateString("en-IN",{day:"numeric",month:"short"})};
  });

  const heatColor=(h,dark)=>{
    if(h===0)return dark?"rgba(255,255,255,0.05)":"rgba(0,0,0,0.05)";
    if(h<2)return"rgba(129,140,248,0.25)";
    if(h<3.5)return"rgba(129,140,248,0.55)";
    return"rgba(129,140,248,0.9)";
  };

  const totalHrs=SUBJECT_DATA.reduce((a,b)=>a+b.total,0);
  const maxH=Math.max(...SUBJECT_DATA.map(s=>s.total));

  const gen=async()=>{
    setLd(true);setRep("");
    const subjSummary=SUBJECT_DATA.map(s=>`${s.subj}: ${s.total}h`).join(", ");
    const prompt=`You are a warm UPSC coaching mentor. Write a 120-word personalized weekly performance report for a ${es.name||"UPSC"} aspirant.
Subject-wise hours: ${subjSummary}
Total: ${totalHrs}h this week | Streak: 17 days
Exam: ${es.name||"UPSC Prelims"}
Include: 1) brief summary 2) strongest subject 3) weakest subject needs more time 4) one specific actionable tip 5) short motivation. Be direct and coach-like.`;
    const result = await callAI(prompt, "You are a motivating UPSC study coach. Keep responses concise and actionable.");
    setRep(result);
    setLd(false);
  };

  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    {/* View tabs */}
    <div style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3,alignSelf:"flex-start"}}>
      {[["week","Weekly"],["subjects","Subjects"],["calendar","Calendar"]].map(([v,l])=>(
        <button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:19,border:"none",background:view===v?"#818cf8":t.pill,color:view===v?"#fff":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{l}</button>
      ))}
    </div>

    {/* Weekly bar chart */}
    {view==="week"&&(
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
        <div style={{fontSize:8,color:t.sub,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Daily Study Hours — This Week</div>
        <div style={{display:"flex",gap:5,alignItems:"flex-end",height:90}}>
          {SUBJECT_DATA[0].hours.map((_, dayIdx)=>{
            const dayTotal=SUBJECT_DATA.reduce((sum,s)=>sum+s.hours[dayIdx],0);
            const maxDay=Math.max(...SUBJECT_DATA[0].hours.map((_,i)=>SUBJECT_DATA.reduce((s,x)=>s+x.hours[i],0)));
            return(
              <div key={dayIdx} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{fontSize:8,color:t.a2,fontWeight:700}}>{dayTotal}h</div>
                <div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${(dayTotal/maxDay)*82}px`,display:"flex",flexDirection:"column-reverse",overflow:"hidden"}}>
                  {SUBJECT_DATA.map(s=>(
                    <div key={s.subj} style={{width:"100%",height:`${(s.hours[dayIdx]/dayTotal)*100}%`,background:s.c,opacity:.85}}/>
                  ))}
                </div>
                <div style={{fontSize:8,color:t.sub}}>{DAYS[dayIdx]}</div>
              </div>
            );
          })}
        </div>
        {/* Legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:9}}>
          {SUBJECT_DATA.map(s=><div key={s.subj} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:7,height:7,borderRadius:"50%",background:s.c}}/><span style={{color:t.sub,fontSize:8}}>{s.subj}</span></div>)}
        </div>
      </div>
    )}

    {/* Subject-wise breakdown */}
    {view==="subjects"&&(
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:3}}>
          {[{l:"Total Hours",v:`${totalHrs}h`,c:"#818cf8"},{l:"Best Subject",v:SUBJECT_DATA.reduce((a,b)=>a.total>b.total?a:b).subj.split(" ")[0],c:"#34d399"},{l:"Needs Work",v:SUBJECT_DATA.reduce((a,b)=>a.total<b.total?a:b).subj.split(" ")[0],c:t.a1}].map(s=>(
            <div key={s.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:11,padding:"9px 6px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:t.sub,marginTop:2,textTransform:"uppercase",letterSpacing:.8}}>{s.l}</div></div>
          ))}
        </div>
        {SUBJECT_DATA.map(s=>(
          <div key={s.subj} style={{background:t.card,border:`1px solid ${s.c}22`,borderRadius:11,padding:"10px 11px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
              <div style={{color:t.text,fontWeight:700,fontSize:12}}>{s.subj}</div>
              <div style={{color:s.c,fontWeight:900,fontSize:14}}>{s.total}h</div>
            </div>
            {/* Day-wise mini bars */}
            <div style={{display:"flex",gap:3,alignItems:"flex-end",height:28,marginBottom:4}}>
              {s.hours.map((h,i)=>(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                  <div style={{width:"100%",borderRadius:"2px 2px 0 0",height:`${(h/Math.max(...s.hours,0.1))*24}px`,background:h>0?s.c:`${s.c}20`}}/>
                  <div style={{fontSize:6,color:t.muted}}>{DAYS[i][0]}</div>
                </div>
              ))}
            </div>
            <div style={{height:3,background:t.pill,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${(s.total/maxH)*100}%`,background:s.c,borderRadius:2}}/>
            </div>
            <div style={{color:t.muted,fontSize:8,marginTop:3}}>{((s.total/totalHrs)*100).toFixed(0)}% of total study time</div>
          </div>
        ))}
      </div>
    )}

    {/* Calendar heatmap */}
    {view==="calendar"&&(
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
        <div style={{fontSize:8,color:t.sub,marginBottom:10,textTransform:"uppercase",letterSpacing:1.5}}>Study Calendar — Last 5 Weeks</div>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d=><div key={d} style={{flex:1,textAlign:"center",fontSize:7,color:t.muted}}>{d[0]}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {calData.map((d,i)=>(
            <div key={i} title={`${d.label}: ${d.hrs}h`} style={{aspectRatio:"1",borderRadius:4,background:heatColor(d.hrs,t.bg==="#08080f"),border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"default",transition:"all .2s"}}>
              {d.hrs>0&&<div style={{fontSize:7,color:d.hrs>=2?"#fff":t.sub,fontWeight:700,opacity:.8}}>{d.hrs}</div>}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:9,justifyContent:"center"}}>
          <span style={{color:t.muted,fontSize:8}}>Less</span>
          {[0,1,2,3.5,5].map(h=><div key={h} style={{width:12,height:12,borderRadius:3,background:heatColor(h,t.bg==="#08080f"),border:`1px solid ${t.border}`}}/>)}
          <span style={{color:t.muted,fontSize:8}}>More</span>
        </div>
      </div>
    )}

    {/* AI Report */}
    <div style={{background:"rgba(129,140,248,0.08)",border:"1px solid rgba(129,140,248,0.2)",borderRadius:12,padding:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:rep?10:0}}>
        <div style={{color:"#818cf8",fontWeight:700,fontSize:12}}>✨ AI Coaching Report</div>
        <button onClick={gen} disabled={ld} style={{background:ld?t.pill:"#818cf8",border:"none",borderRadius:8,padding:"5px 11px",color:ld?"#818cf8":"#fff",fontWeight:700,fontSize:10,cursor:ld?"not-allowed":"pointer",fontFamily:"inherit"}}>{ld?"Generating…":"Generate"}</button>
      </div>
      {rep?<div style={{color:t.text,fontSize:11,lineHeight:1.85,marginTop:4}}>{rep}</div>:<div style={{color:t.sub,fontSize:10,fontStyle:"italic",marginTop:5}}>Hit Generate for your personalized AI coaching insight.</div>}
    </div>
  </div>);
}

// ── PLANNER ───────────────────────────────────────────────────
function Planner({t,subjects}){
  const [view,setView]=useState("daily");
  const [tasks,setTasks]=useState([
    {id:1,text:"Read Laxmikanth Ch. 8",subj:subjects.find(s=>s.n==="Polity")?.n||subjects[0]?.n||"History",done:false,time:"09:00"},
    {id:2,text:"Newspaper + Editorial",subj:subjects.find(s=>s.n==="Cur. Affairs")?.n||subjects[0]?.n||"History",done:true,time:"07:00"},
    {id:3,text:"Economy Chapter",subj:subjects.find(s=>s.n==="Economy")?.n||subjects[0]?.n||"History",done:false,time:"14:00"},
  ]);
  const [nt,setNt]=useState("");const [ns,setNs]=useState(subjects[0]?.n||"History");
  const today=new Date();const days=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return d;});
  const tog=id=>setTasks(tasks.map(x=>x.id===id?{...x,done:!x.done}:x));
  const add=()=>{if(!nt.trim())return;setTasks([...tasks,{id:Date.now(),text:nt,subj:ns,done:false,time:"12:00"}]);setNt("");};
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:24,padding:3,alignSelf:"flex-start"}}>{["daily","weekly","monthly"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 11px",borderRadius:19,border:"none",background:view===v?t.a4:t.pill,color:view===v?"#0a0a0f":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",textTransform:"capitalize",fontFamily:"inherit"}}>{v}</button>)}</div>
    {view==="weekly"&&<div style={{display:"flex",gap:3}}>{days.map((d,i)=><div key={i} style={{flex:1,background:i===today.getDay()?`${t.a4}16`:t.card,border:`1px solid ${i===today.getDay()?t.a4+"44":t.border}`,borderRadius:8,padding:"6px 3px",textAlign:"center"}}><div style={{fontSize:7,color:t.sub,marginBottom:1}}>{["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()]}</div><div style={{fontSize:13,fontWeight:800,color:i===today.getDay()?t.a4:t.text}}>{d.getDate()}</div></div>)}</div>}
    {view==="monthly"&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:t.sub,fontWeight:700,padding:"2px 0"}}>{d}</div>)}{Array.from({length:31},(_,i)=>i+1).map(d=><div key={d} style={{textAlign:"center",padding:"4px 1px",borderRadius:5,fontSize:9,cursor:"pointer",background:d===today.getDate()?`${t.a4}20`:"transparent",color:d===today.getDate()?t.a4:d<today.getDate()?t.muted:t.sub}}>{d}</div>)}</div></div>}
    <div style={{display:"flex",gap:5}}><input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a task…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/><select value={ns} onChange={e=>setNs(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 5px",color:t.text,fontFamily:"inherit",cursor:"pointer",fontSize:9}}>{subjects.map(s=><option key={s.n}>{s.n}</option>)}</select><button onClick={add} style={{background:t.a3,border:"none",borderRadius:8,padding:"8px 11px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button></div>
    <div style={{display:"flex",flexDirection:"column",gap:5}}>{tasks.map(task=>{const s=subjects.find(s=>s.n===task.subj)||{c:"#818cf8"};return(<div key={task.id} onClick={()=>tog(task.id)} style={{display:"flex",alignItems:"center",gap:9,background:task.done?t.pill:t.card,border:`1px solid ${task.done?t.border:s.c+"33"}`,borderRadius:10,padding:"9px 10px",cursor:"pointer",opacity:task.done?.55:1,transition:"all .2s"}}><div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`2px solid ${task.done?s.c:"rgba(150,150,150,.3)"}`,background:task.done?s.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center"}}>{task.done&&<span style={{color:"#0a0a0f",fontSize:8,fontWeight:900}}>✓</span>}</div><div style={{flex:1,color:task.done?t.sub:t.text,fontSize:11,textDecoration:task.done?"line-through":"none"}}>{task.text}</div><div style={{background:`${s.c}18`,color:s.c,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:13}}>{task.subj}</div><div style={{color:t.muted,fontSize:9}}>{task.time}</div></div>);})}</div>
  </div>);
}

// ── EXAM DASHBOARD ────────────────────────────────────────────
function ExamDash({t,es,onOpen}){
  const days=dl(es.date);const subjs=es.subjects||[];
  const prog={};subjs.forEach((s,i)=>{prog[s.n]=[20,45,60,35,75,50,40,65,30,55][i%10];});
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:`${es.color||"#818cf8"}10`,border:`1px solid ${es.color||"#818cf8"}30`,borderRadius:14,padding:"12px 12px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-10,right:-10,width:70,height:70,borderRadius:"50%",background:`radial-gradient(circle,${es.color||"#818cf8"}18,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:18}}>{es.icon||"🎯"}</div><div style={{color:t.text,fontWeight:900,fontSize:15,marginTop:2}}>{es.key||"UPSC CSE"}</div><div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}><div style={{background:`${es.color||"#818cf8"}20`,color:es.color||"#818cf8",border:`1px solid ${es.color||"#818cf8"}44`,borderRadius:14,padding:"1px 7px",fontSize:8,fontWeight:800}}>{es.mode||"PRELIMS"}</div><div style={{color:t.sub,fontSize:8}}>{es.date}</div></div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:34,fontWeight:900,color:es.color||"#818cf8",lineHeight:1}}>{days}</div><div style={{color:t.sub,fontSize:8,marginTop:1}}>days left</div></div>
      </div>
      <button onClick={onOpen} style={{marginTop:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${t.border}`,borderRadius:7,padding:"3px 9px",color:t.sub,fontSize:8,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✎ Change Exam / Mode</button>
    </div>
    {es.tips?.length>0&&<div><div style={{fontSize:7,color:t.sub,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>Strategy — {es.name}</div><div style={{display:"flex",flexDirection:"column",gap:3}}>{es.tips.map((tip,i)=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 9px",display:"flex",gap:5}}><span style={{color:"#818cf8",fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}.</span><span style={{color:t.text,fontSize:10,lineHeight:1.4}}>{tip}</span></div>)}</div></div>}
    <div><div style={{fontSize:7,color:t.sub,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>Subject Progress</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {subjs.map(s=><div key={s.n} style={{background:t.card,border:`1px solid ${s.c}20`,borderRadius:10,padding:"8px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{s.i}</span><div><div style={{color:t.text,fontWeight:700,fontSize:11}}>{s.n}</div>{s.w>0&&<div style={{color:t.sub,fontSize:8,marginTop:0}}>{s.w}% weightage</div>}</div></div><div style={{color:s.c,fontWeight:800,fontSize:11}}>{prog[s.n]||0}%</div></div>
          <div style={{height:3,background:t.pill,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${prog[s.n]||0}%`,background:s.c,borderRadius:2,transition:"width .5s ease"}}/></div>
        </div>)}
      </div>
    </div>
  </div>);
}

// ── CIRCLE ────────────────────────────────────────────────────
function Circle({t,friends,setFriends,openQR,subjects,isPro,onPro,user,streak}){
  const [tab,setTab]=useState("public");
  const [myGroups,setMyGroups]=useState([{id:1,name:"UPSC Warriors 2026",members:["Arjun","Priya","Kartikeya"],code:"GRP-UWS-4421"}]);
  const [showCreate,setShowCreate]=useState(false);
  const [grpName,setGrpName]=useState("");
  const [chat,setChat]=useState("");
  const [msgs,setMsgs]=useState([{from:"Arjun",text:"Anyone done monetary policy?",time:"10:23 AM"},{from:"Priya",text:"Yes! RBI section is key 📚",time:"10:25 AM"},{from:"You",text:"Starting after this pomodoro 🔥",time:"10:31 AM"}]);
  const [tasks,setTasks]=useState([{id:1,text:"Laxmikanth Ch. 5–7",subj:"Polity",done:false,by:"Priya"},{id:2,text:"Economy Ch3",subj:"Economy",done:true,by:"Arjun"},{id:3,text:"Current Affairs W3",subj:"Cur. Affairs",done:false,by:"You"}]);
  const send=()=>{if(!chat.trim())return;setMsgs([...msgs,{from:"You",text:chat,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}]);setChat("");};
  const createGroup=()=>{if(!grpName.trim())return;const code=`GRP-${grpName.slice(0,3).toUpperCase()}-${Math.floor(1000+Math.random()*9000)}`;setMyGroups([...myGroups,{id:Date.now(),name:grpName,members:[user?.name||"Kartikeya"],code}]);setGrpName("");setShowCreate(false);};
  const LB=[{name:user?.name||"Kartikeya",av:(user?.name||"K")[0],h:38,s:streak,r:3},...[{name:"Sneha T.",av:"S",h:48,s:42,r:1},{name:"Priya M.",av:"P",h:42,s:38,r:2},{name:"Arjun S.",av:"A",h:35,s:31,r:4},{name:"Rohit K.",av:"R",h:28,s:25,r:5}]].sort((a,b)=>a.r-b.r);
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:24,padding:3,overflowX:"auto"}}>
      {[["public","🌍 Public"],["groups","👥 Groups"],["live","👁 Live"],["chat","💬 Chat"],["board","🏆 Board"]].map(([tb,l])=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"5px 8px",borderRadius:19,border:"none",cursor:"pointer",fontFamily:"inherit",background:tab===tb?t.a5:t.pill,color:tab===tb?"#fff":t.sub,fontWeight:700,fontSize:9,whiteSpace:"nowrap"}}>{l}</button>)}
    </div>

    {tab==="public"&&<div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{background:"rgba(110,231,247,0.06)",border:"1px solid rgba(110,231,247,0.18)",borderRadius:10,padding:"8px 10px",display:"flex",gap:7,alignItems:"center"}}>
        <div style={{fontSize:14}}>🌍</div><div><div style={{color:t.a2,fontWeight:700,fontSize:11}}>Public Circle</div><div style={{color:t.sub,fontSize:9,marginTop:0}}>{PUBLIC_CIRCLE.length} aspirants visible · Live streak board</div></div>
      </div>
      <div style={{background:`${t.a4}10`,border:`1.5px solid ${t.a4}40`,borderRadius:10,padding:"9px 10px",display:"flex",alignItems:"center",gap:8}}>
        <Av c={(user?.name||"K")[0].toUpperCase()}/>
        <div style={{flex:1}}><div style={{color:t.text,fontWeight:800,fontSize:12}}>{user?.name||"Kartikeya"} <span style={{color:t.a4,fontSize:8}}>(You)</span></div><div style={{color:t.sub,fontSize:9,marginTop:0}}>📖 Studying Polity</div></div>
        <div style={{textAlign:"right"}}><div style={{color:t.a1,fontWeight:900,fontSize:13}}>🔥 {streak}</div><div style={{color:t.muted,fontSize:8}}>streak</div></div>
      </div>
      {PUBLIC_CIRCLE.map((f,i)=>(
        <div key={f.id} style={{display:"flex",alignItems:"center",gap:8,background:t.card,border:`1px solid ${f.studying?t.a3+"30":t.border}`,borderRadius:10,padding:"8px 10px"}}>
          <div style={{fontSize:10,color:t.muted,width:14,textAlign:"center"}}>{i+1}</div>
          <div style={{position:"relative"}}><Av c={f.av} sz={32}/><div style={{position:"absolute",bottom:1,right:1,width:7,height:7,borderRadius:"50%",background:f.studying?t.a3:t.pill,border:`1.5px solid ${t.bg}`}}/></div>
          <div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}</div><div style={{color:t.sub,fontSize:9,marginTop:0}}>{f.studying?`📖 ${f.subj}`:"Offline"} · {f.city}</div></div>
          <div style={{color:t.a1,fontWeight:800,fontSize:11}}>🔥 {f.streak}</div>
        </div>
      ))}
    </div>}

    {tab==="groups"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      <button onClick={()=>setShowCreate(v=>!v)} style={{background:"linear-gradient(135deg,rgba(129,140,248,0.13),rgba(52,211,153,0.08))",border:"1px solid rgba(129,140,248,0.25)",borderRadius:10,padding:"9px 12px",color:"#818cf8",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>+ Create New Group</button>
      {showCreate&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px"}}>
        <div style={{color:t.text,fontWeight:700,fontSize:11,marginBottom:6}}>New Study Group</div>
        <input value={grpName} onChange={e=>setGrpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createGroup()} placeholder="Group name (e.g. UPSC Warriors 2026)" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:6}}/>
        <div style={{display:"flex",gap:5}}><button onClick={createGroup} style={{flex:1,background:"linear-gradient(135deg,#818cf8,#60a5fa)",border:"none",borderRadius:8,padding:"7px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Create Group</button><button onClick={()=>setShowCreate(false)} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 11px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button></div>
      </div>}
      {myGroups.map(g=>(
        <div key={g.id} style={{background:t.card,border:"1px solid rgba(129,140,248,0.18)",borderRadius:11,padding:"11px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}><div><div style={{color:t.text,fontWeight:800,fontSize:12}}>{g.name}</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>{g.members.length} members</div></div><button onClick={openQR} style={{background:`${t.a3}18`,border:`1px solid ${t.a3}40`,borderRadius:8,padding:"4px 9px",color:t.a3,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>+ Add</button></div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>{g.members.map(m=><div key={m} style={{background:t.pill,borderRadius:13,padding:"2px 7px",fontSize:9,color:t.sub,fontWeight:600}}>{m}</div>)}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,background:t.pill,borderRadius:6,padding:"4px 7px"}}><div style={{color:t.muted,fontSize:9}}>Code:</div><div style={{color:"#818cf8",fontSize:9,fontFamily:"monospace",fontWeight:700,flex:1}}>{g.code}</div><button onClick={()=>navigator.clipboard?.writeText(g.code).catch(()=>{})} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📋</button></div>
        </div>
      ))}
    </div>}

    {tab==="live"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
      <button onClick={openQR} style={{background:`${t.a3}16`,border:`1px solid ${t.a3}30`,borderRadius:9,padding:"7px",color:t.a3,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>+ Add Friend</button>
      {[{id:0,name:user?.name||"Kartikeya",av:(user?.name||"K")[0],on:true,subj:"Polity",brk:false},...friends].map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:8,background:f.on?`${t.a3}08`:t.card,border:`1px solid ${f.on?t.a3+"28":t.border}`,borderRadius:10,padding:"8px 10px"}}><div style={{position:"relative"}}><Av c={f.av} sz={32}/><div style={{position:"absolute",bottom:1,right:1,width:7,height:7,borderRadius:"50%",background:f.on?(f.brk?t.a4:t.a3):t.pill,border:`1.5px solid ${t.bg}`}}/></div><div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}{(f.id===0)&&<span style={{color:t.a4,fontSize:8}}> (You)</span>}</div><div style={{color:t.sub,fontSize:9,marginTop:0}}>{f.on?(f.brk?"☕ On Break":`📖 ${f.subj}`):"Offline"}</div></div>{f.on&&!f.brk&&<div style={{background:`${t.a3}20`,color:t.a3,fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:12}}>LIVE</div>}</div>)}
    </div>}

    {tab==="chat"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:255,overflowY:"auto"}}>{msgs.map((m,i)=><div key={i} style={{display:"flex",flexDirection:m.from==="You"?"row-reverse":"row",gap:5,alignItems:"flex-end"}}>{m.from!=="You"&&<Av c={m.from[0]} sz={22}/>}<div style={{background:m.from==="You"?t.a5:"rgba(128,128,128,.1)",color:m.from==="You"?"#fff":t.text,borderRadius:m.from==="You"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"7px 9px",fontSize:10,maxWidth:"74%"}}>{m.from!=="You"&&<div style={{fontSize:8,fontWeight:700,marginBottom:2,color:t.sub}}>{m.from}</div>}{m.text}<div style={{fontSize:8,color:m.from==="You"?"rgba(255,255,255,.4)":t.muted,marginTop:2,textAlign:"right"}}>{m.time}</div></div></div>)}</div>
      <div style={{display:"flex",gap:5}}><input value={chat} onChange={e=>setChat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Message…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:17,padding:"7px 10px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={send} style={{background:t.a5,border:"none",borderRadius:17,padding:"7px 11px",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>↑</button></div>
    </div>}

    {tab==="board"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
      {LB.map(f=><div key={f.name} style={{display:"flex",alignItems:"center",gap:8,background:f.name===(user?.name||"Kartikeya")?`${t.a4}08`:t.card,border:`1px solid ${f.name===(user?.name||"Kartikeya")?t.a4+"30":t.border}`,borderRadius:10,padding:"9px 10px"}}><div style={{fontSize:14,width:20,textAlign:"center"}}>{f.r===1?"🥇":f.r===2?"🥈":f.r===3?"🥉":<span style={{color:t.muted,fontSize:10}}>#{f.r}</span>}</div><Av c={f.av} sz={32}/><div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}{f.name===(user?.name||"Kartikeya")&&<span style={{color:t.a4,fontSize:8}}> (You)</span>}</div><div style={{color:t.sub,fontSize:9,marginTop:0}}>🔥 {f.s} day streak</div></div><div style={{textAlign:"right"}}><div style={{color:t.a2,fontWeight:900,fontSize:13}}>{f.h}h</div><div style={{color:t.muted,fontSize:8}}>this week</div></div></div>)}
    </div>}
  </div>);
}

// ── AI ASSISTANT ──────────────────────────────────────────────
function AI({t,subjects}){
  const [msgs,setMsgs]=useState([{r:"a",text:"Namaste! 🙏 I'm your AI study assistant. Ask me anything — concepts, PYQs, strategies, or motivation!"}]);
  const [inp,setInp]=useState("");const [ld,setLd]=useState(false);const [subj,setSubj]=useState("General");
  const endRef=useRef();
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const qp=["Explain Article 356","What is fiscal deficit?","UPPCS vs UPSC difference","Key rivers of India","Motivate me!"];
  const send=async(text)=>{
    const q=text||inp.trim();if(!q)return;setInp("");
    const nm=[...msgs,{r:"u",text:q}];setMsgs(nm);setLd(true);
    const result = await callAI(q, `You are a friendly, concise UPSC/UPPCS/NDA/CDS/CAPF study assistant. Subject context: ${subj}. Answer in 3-5 sentences. Give mnemonics/examples where helpful.`);
    setMsgs(m=>[...m,{r:"a",text:result}]);
    setLd(false);
  };
  return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 215px)",minHeight:290}}>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>{["General",...subjects.slice(0,5).map(s=>s.n)].map(s=><button key={s} onClick={()=>setSubj(s)} style={{padding:"2px 7px",borderRadius:12,border:`1.5px solid ${subj===s?"#818cf8":"transparent"}`,background:subj===s?"rgba(129,140,248,0.14)":t.pill,color:subj===s?"#818cf8":t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>)}</div>
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:7,paddingRight:2}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",flexDirection:m.r==="u"?"row-reverse":"row",gap:4,alignItems:"flex-end"}}>{m.r==="a"&&<div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🤖</div>}<div style={{background:m.r==="u"?"linear-gradient(135deg,#818cf8,#60a5fa)":t.card,border:m.r==="a"?"1px solid rgba(129,140,248,0.16)":"none",color:m.r==="u"?"#fff":t.text,borderRadius:m.r==="u"?"13px 13px 4px 13px":"13px 13px 13px 4px",padding:"8px 10px",fontSize:11,maxWidth:"83%",lineHeight:1.6}}>{m.text}</div></div>)}
      {ld&&<div style={{display:"flex",gap:4,alignItems:"flex-end"}}><div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>🤖</div><div style={{background:t.card,border:"1px solid rgba(129,140,248,0.16)",borderRadius:"13px 13px 13px 4px",padding:"8px 11px",display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#818cf8",opacity:.6,animation:`bounce .9s ${i*.15}s infinite`}}/>)}</div></div>}
      <div ref={endRef}/>
    </div>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",margin:"5px 0 4px"}}>{qp.map(q=><button key={q} onClick={()=>send(q)} style={{padding:"2px 7px",borderRadius:12,border:"1px solid rgba(129,140,248,0.2)",background:"rgba(129,140,248,0.06)",color:"#818cf8",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>)}</div>
    <div style={{display:"flex",gap:5}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything…" style={{flex:1,background:t.input,border:"1px solid rgba(129,140,248,0.2)",borderRadius:17,padding:"8px 11px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={()=>send()} disabled={ld||!inp.trim()} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:17,padding:"8px 13px",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,opacity:ld||!inp.trim()?.5:1}}>↑</button></div>
  </div>);
}

// ── NOTES & CARDS ─────────────────────────────────────────────
function Notes({t,subjects}){
  const [view,setView]=useState("notes");const [ns,setNs]=useState(subjects[0]?.n||"History");const [nn,setNn]=useState("");
  const [notes,setNotes]=useState({[subjects[0]?.n||"History"]:["Core concepts — add your first note!"],"Polity":["Article 356 — President's Rule when state machinery fails","73rd Amendment — Panchayati Raj, 3-tier system"]});
  const [cards]=useState([{id:1,q:"What is Article 356?",a:"President's Rule — constitutional machinery fails in a state.",subj:subjects.find(s=>s.n==="Polity")?.n||subjects[0]?.n||"History"},{id:2,q:"Define Fiscal Deficit",a:"Total expenditure minus total receipts excluding borrowings.",subj:subjects.find(s=>s.n==="Economy")?.n||subjects[0]?.n||"History"},{id:3,q:"What is La Niña?",a:"Cooling of Pacific SSTs → above-normal monsoon in India.",subj:subjects.find(s=>s.n==="Geography")?.n||subjects[0]?.n||"History"}]);
  const [ci,setCi]=useState(0);const [sa,setSa]=useState(false);
  const card=cards[ci];const cs=subjects.find(s=>s.n===card?.subj)||{c:"#818cf8"};
  const addN=()=>{if(!nn.trim())return;setNotes(x=>({...x,[ns]:[...(x[ns]||[]),nn.trim()]}));setNn("");};
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:22,padding:3,alignSelf:"flex-start"}}>{[["notes","📝 Notes"],["cards","🃏 Cards"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:18,border:"none",background:view===v?"#818cf8":t.pill,color:view===v?"#fff":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}</div>
    {view==="notes"&&(<><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{subjects.map(s=><button key={s.n} onClick={()=>setNs(s.n)} style={{padding:"2px 7px",borderRadius:12,border:`1.5px solid ${ns===s.n?s.c:"transparent"}`,background:ns===s.n?`${s.c}20`:t.pill,color:ns===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s.i} {s.n}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>{(notes[ns]||[]).map((note,i)=>{const sc=subjects.find(x=>x.n===ns)||{c:"#818cf8"};return<div key={i} style={{background:t.card,border:`1px solid ${sc.c+"1a"}`,borderRadius:8,padding:"7px 10px",display:"flex",gap:6}}><div style={{width:4,height:4,borderRadius:"50%",background:sc.c,flexShrink:0,marginTop:4}}/><div style={{color:t.text,fontSize:11,lineHeight:1.6,flex:1}}>{note}</div></div>;})}
      </div>
      <div style={{display:"flex",gap:4}}><input value={nn} onChange={e=>setNn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addN()} placeholder={`Add note for ${ns}…`} style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={addN} style={{background:"#818cf8",border:"none",borderRadius:8,padding:"7px 11px",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+</button></div>
    </>)}
    {view==="cards"&&card&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{color:t.sub,fontSize:10}}>{ci+1}/{cards.length}</div><div style={{color:cs.c,fontSize:10,fontWeight:700,background:`${cs.c}16`,padding:"1px 7px",borderRadius:12}}>{card.subj}</div></div>
      <div style={{display:"flex",gap:2}}>{cards.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:2,background:i===ci?(cs.c||"#818cf8"):"rgba(255,255,255,0.07)"}}/>)}</div>
      <div onClick={()=>setSa(v=>!v)} style={{background:t.card,border:`2px solid ${sa?(cs.c||"#818cf8")+"50":t.border}`,borderRadius:15,padding:"20px 15px",minHeight:148,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all .3s"}}>
        <div style={{fontSize:8,color:t.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:9}}>{sa?"ANSWER":"QUESTION — tap to reveal"}</div>
        <div style={{color:t.text,fontSize:13,fontWeight:700,lineHeight:1.6}}>{sa?card.a:card.q}</div>
        {!sa&&<div style={{marginTop:10,fontSize:18,opacity:.2}}>👆</div>}
      </div>
      <div style={{display:"flex",gap:6,justifyContent:"center",alignItems:"center"}}>
        <button onClick={()=>{setCi(i=>(i-1+cards.length)%cards.length);setSa(false);}} style={{background:t.pill,border:"none",borderRadius:9,padding:"6px 13px",color:t.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>← Prev</button>
        {sa&&<div style={{display:"flex",gap:4}}>{[["Again","#FF6B6B"],["Hard","#FFB86B"],["Easy","#B8FF6B"]].map(([l,c])=><button key={l} onClick={()=>{setCi(i=>(i+1)%cards.length);setSa(false);}} style={{padding:"6px 9px",borderRadius:8,border:"none",background:`${c}20`,color:c,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div>}
        <button onClick={()=>{setCi(i=>(i+1)%cards.length);setSa(false);}} style={{background:t.pill,border:"none",borderRadius:9,padding:"6px 13px",color:t.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:10}}>Next →</button>
      </div>
    </>)}
  </div>);
}

// ── PROFILE ───────────────────────────────────────────────────
function Profile({t,user,es,isPro,onPro,streak}){
  const days=dl(es.date);
  const badges=[{i:"🔥",l:"17 Day Streak",ok:true},{i:"⏱",l:"100 Pomodoros",ok:true},{i:"📚",l:"50h Month",ok:true},{i:"🏆",l:"Top 3 Week",ok:true},{i:"🌙",l:"Night Owl",ok:false},{i:"⚡",l:"Speed Learner",ok:false}];
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{background:t.card,border:"1px solid rgba(129,140,248,0.16)",borderRadius:15,padding:"15px 13px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:130,height:65,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.1),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",margin:"0 auto 9px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:"#fff",boxShadow:"0 0 18px rgba(129,140,248,0.35)",border:"2px solid rgba(129,140,248,0.28)"}}>{(user?.name||"K")[0].toUpperCase()}</div>
      <div style={{fontSize:17,fontWeight:900,color:t.text}}>{user?.name||"Kartikeya"}</div>
      <div style={{color:t.sub,fontSize:11,marginTop:2}}>{user?.email||user?.phone||"Competitive Exam Aspirant"}</div>
      {isPro?<div style={{display:"inline-flex",alignItems:"center",gap:3,background:"linear-gradient(135deg,rgba(129,140,248,0.15),rgba(52,211,153,0.15))",border:"1px solid rgba(129,140,248,0.28)",borderRadius:13,padding:"3px 10px",marginTop:6}}><span style={{color:"#818cf8",fontWeight:800,fontSize:10}}>⚡ Premium Member</span></div>
      :<button onClick={onPro} style={{display:"inline-flex",alignItems:"center",gap:3,background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:13,padding:"5px 12px",marginTop:6,cursor:"pointer",fontFamily:"inherit"}}><span style={{color:"#fff",fontWeight:800,fontSize:10}}>⚡ Try Free 7 Days</span></button>}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>{[{l:"Streak",v:`${streak}🔥`},{l:"Sessions",v:"142"},{l:"Hours",v:"38h"},{l:"Rank",v:"#3"}].map(s=><div key={s.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 3px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:900,color:t.text}}>{s.v}</div><div style={{fontSize:7,color:t.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:1}}>{s.l}</div></div>)}</div>
    <div style={{background:t.card,border:`1px solid ${es.color||"#818cf8"}30`,borderRadius:12,padding:"10px 11px",display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:34,height:34,borderRadius:9,background:`${es.color||"#818cf8"}20`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{es.icon||"🎯"}</div>
      <div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{es.name||"UPSC CSE Prelims"}</div><div style={{color:es.color||"#818cf8",fontSize:10,fontWeight:700,marginTop:1}}>{days} days remaining</div></div>
      <div style={{color:es.color||"#818cf8",fontSize:22,fontWeight:900}}>{days}</div>
    </div>
    <div><div style={{fontSize:7,color:t.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:1.5}}>Achievements</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:5}}>{badges.map(a=><div key={a.l} style={{background:a.ok?"rgba(129,140,248,0.07)":t.card,border:`1px solid ${a.ok?"rgba(129,140,248,0.2)":t.border}`,borderRadius:10,padding:"9px 5px",textAlign:"center",opacity:a.ok?1:.35}}><div style={{fontSize:18,marginBottom:2,filter:a.ok?"none":"grayscale(1)"}}>{a.i}</div><div style={{color:a.ok?"#818cf8":t.sub,fontSize:8,fontWeight:700,lineHeight:1.3}}>{a.l}</div></div>)}</div>
    </div>
  </div>);
}

// ── ROOT ──────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]=useState(true);
  const [loggedIn,setLoggedIn]=useState(false);
  const [user,setUser]=useState(null);
  const [isPro,setIsPro]=useState(false);
  const [proOpen,setProOpen]=useState(false);
  const [restoreOpen,setRestoreOpen]=useState(false);
  const [tab,setTab]=useState("timer");
  const [nOpen,setNOpen]=useState(false);
  const [qrOpen,setQrOpen]=useState(false);
  const [exOpen,setExOpen]=useState(false);
  const [friends,setFriends]=useState([{id:1,name:"Arjun",av:"A",streak:14,on:true,subj:"History",brk:false},{id:2,name:"Priya",av:"P",streak:21,on:false,subj:null,brk:true}]);
  const [toasts,setToasts]=useState([]);
  const [nHist,setNHist]=useState([]);
  const [ns,setNs]=useState({streakBreak:true,studyReminder:true,pomoDone:true,friendActivity:false,leaderboard:false});
  const [streak,setStreak]=useState(17);
  const [es,setEs]=useState({key:"UPSC CSE",mode:"Prelims",name:"UPSC CSE Prelims",date:"2026-05-24",color:"#FF6B6B",icon:"🏛️",subjects:EXAMS["UPSC CSE"].modes.Prelims.subjects,tips:EXAMS["UPSC CSE"].modes.Prelims.tips});
  const tid=useRef(0);
  const t=dark?T.dark:T.light;
  const days=dl(es.date);

  const push=useCallback((n)=>{const id=++tid.current;const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});const notif={...n,id,time};setToasts(x=>[...x,notif]);setNHist(x=>[...x,notif]);setTimeout(()=>setToasts(x=>x.filter(y=>y.id!==id)),5000);},[]);
  const dismiss=useCallback((id)=>setToasts(x=>x.filter(y=>y.id!==id)),[]);
  const test=()=>push({icon:"🔔",title:"Test notification",body:"Notifications working! 🎉",col:t.a2});

  useEffect(()=>{
    if(!loggedIn)return;
    const t1=setTimeout(()=>{if(ns.studyReminder)push({icon:"📖",title:`Good morning, ${user?.name?.split(" ")[0]||"Aspirant"}!`,body:`${es.name} — ${days} days to go. Start your Pomodoro! 🌅`,col:"#6EE7F7"});},2500);
    const t2=setTimeout(()=>{if(ns.streakBreak)push({icon:"🔥",title:"Streak at risk!",body:`${streak}-day streak on the line! Study now 😬`,col:"#FF6B6B"});},8000);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[loggedIn,ns]);

  // Free tabs
  const FREE=[{id:"timer",icon:"⏱",l:"Timer",c:"#FF6B6B"},{id:"planner",icon:"📅",l:"Planner",c:"#FFB86B"},{id:"streak",icon:"🔥",l:"Streak",c:"#FF6B6B"},{id:"exam",icon:"🎯",l:"Exam",c:es.color||"#818cf8"},{id:"circle",icon:"👥",l:"Circle",c:"#C16BFF"},{id:"report",icon:"📊",l:"Report",c:"#6EE7F7"},{id:"profile",icon:"👤",l:"Me",c:"#818cf8"}];
  // Pro tabs — removed "revise"
  const PRO=[{id:"ai",icon:"🤖",l:"AI",c:"#818cf8"},{id:"notes",icon:"📝",l:"Notes",c:"#34d399"}];
  const proIds=new Set(PRO.map(x=>x.id));
  const go=(id)=>{if(proIds.has(id)&&!isPro){setProOpen(true);return;}setTab(id);};

  if(!loggedIn)return(<div style={{background:t.bg,minHeight:"100vh"}}><style>{`*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style><Login t={t} onLogin={u=>{setUser(u);setLoggedIn(true);push({icon:"🎁",title:"7-Day Free Trial Started!",body:"Full premium access — enjoy StudySync! 🎉",col:"#34d399"});}}/></div>);

  return(<div style={{minHeight:"100vh",background:t.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:t.text,transition:"background .3s"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}select option{background:${t.bg};}@keyframes slideIn{from{opacity:0;transform:translateX(34px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeUp{from{opacity:0;transform:translateY(13px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>

    <Toasts notifs={toasts} dismiss={dismiss} t={t}/>
    {nOpen&&<NCenter t={t} onClose={()=>setNOpen(false)} history={nHist} settings={ns} setSettings={setNs} test={test}/>}
    {qrOpen&&<QRModal t={t} user={user} onClose={()=>setQrOpen(false)} setFriends={setFriends}/>}
    {exOpen&&<ExamSetup t={t} es={es} setEs={setEs} onClose={()=>setExOpen(false)}/>}
    {proOpen&&<PricingModal t={t} onClose={()=>setProOpen(false)} isRestore={false} onUpgrade={()=>{setIsPro(true);push({icon:"⚡",title:"Welcome to Premium! 🎉",body:"All features unlocked!",col:"#818cf8"});}} onRestore={()=>{}}/>}
    {restoreOpen&&<PricingModal t={t} onClose={()=>setRestoreOpen(false)} isRestore={true} onUpgrade={()=>{}} onRestore={()=>{setStreak(s=>s+1);push({icon:"🔥",title:"Streak Restored! 🎉",body:`You're back to ${streak+1} days!`,col:"#FF6B6B"});}}/>}

    {/* Header */}
    <div style={{position:"sticky",top:0,zIndex:100,background:t.nav,backdropFilter:"blur(18px)",borderBottom:`1px solid ${t.border}`,padding:"8px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <Logo sz={26} dark={dark}/>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{fontSize:14,fontWeight:900,letterSpacing:-.3,background:"linear-gradient(135deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>StudySync</div>
              {isPro?<div style={{background:"linear-gradient(135deg,#818cf8,#34d399)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#fff"}}>PRO</div>:<div style={{background:"rgba(52,211,153,0.18)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#34d399"}}>7D FREE</div>}
            </div>
            <button onClick={()=>setExOpen(true)} style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:0,marginTop:1}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:es.color,boxShadow:`0 0 3px ${es.color}`,flexShrink:0}}/>
              <span style={{fontSize:8,color:t.sub,fontWeight:600}}>{es.name}{days!==null&&<span style={{color:es.color,fontWeight:700}}> · {days}d</span>}</span>
              <span style={{fontSize:7,color:t.muted}}>✎</span>
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>setDark(v=>!v)} style={{background:t.pill,border:`1px solid ${t.border}`,borderRadius:14,padding:"4px 7px",cursor:"pointer",fontFamily:"inherit",fontSize:11,color:t.text,fontWeight:600}}>{dark?"☀️":"🌙"}</button>
          <button onClick={()=>setNOpen(true)} style={{position:"relative",background:t.pill,border:`1px solid ${t.border}`,borderRadius:14,padding:"4px 7px",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center"}}>🔔{nHist.length>0&&<div style={{position:"absolute",top:-3,right:-3,background:t.a1,color:"#fff",borderRadius:"50%",width:11,height:11,fontSize:6,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${t.bg}`}}>{Math.min(nHist.length,9)}</div>}</button>
          {!isPro&&<button onClick={()=>setProOpen(true)} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:14,padding:"4px 8px",cursor:"pointer",fontFamily:"inherit",fontSize:8,color:"#fff",fontWeight:800,boxShadow:"0 0 7px rgba(129,140,248,0.28)"}}>⚡ Pro</button>}
          <div onClick={()=>go("profile")} style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:"#fff",cursor:"pointer",border:"1.5px solid rgba(129,140,248,0.28)"}}>{(user?.name||"K")[0].toUpperCase()}</div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div style={{maxWidth:520,margin:"0 auto",padding:"15px 11px 118px"}}>
      {tab==="timer"  &&<Pomo    t={t} subjects={es.subjects} pushN={push} ns={ns}/>}
      {tab==="planner"&&<Planner t={t} subjects={es.subjects}/>}
      {tab==="streak" &&<Streak  t={t} pushN={push} ns={ns} onRestore={()=>setRestoreOpen(true)} streak={streak}/>}
      {tab==="exam"   &&<ExamDash t={t} es={es} onOpen={()=>setExOpen(true)}/>}
      {tab==="circle" &&<Circle  t={t} friends={friends} setFriends={setFriends} openQR={()=>setQrOpen(true)} subjects={es.subjects} isPro={isPro} onPro={()=>setProOpen(true)} user={user} streak={streak}/>}
      {tab==="report" &&<Report  t={t} es={es} subjects={es.subjects}/>}
      {tab==="profile"&&<Profile t={t} user={user} es={es} isPro={isPro} onPro={()=>setProOpen(true)} streak={streak}/>}
      {tab==="ai"     &&(isPro?<AI    t={t} subjects={es.subjects}/>:<Gate t={t} name="AI Study Assistant" icon="🤖" onPro={()=>setProOpen(true)}/>)}
      {tab==="notes"  &&(isPro?<Notes t={t} subjects={es.subjects}/>:<Gate t={t} name="Notes & Flashcards"  icon="📝" onPro={()=>setProOpen(true)}/>)}
    </div>

    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:t.nav,backdropFilter:"blur(20px)",borderTop:`1px solid ${t.border}`,zIndex:100,padding:"5px 0 14px"}}>
      {/* Pro row */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:2,paddingBottom:4,borderBottom:`1px solid ${t.border}`,marginBottom:3}}>
        {PRO.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",alignItems:"center",gap:2,background:active?`${tb.c}18`:"none",border:active?`1px solid ${tb.c}40`:"1px solid transparent",cursor:"pointer",padding:"3px 10px",borderRadius:14,position:"relative"}}>
            <div style={{fontSize:11,filter:active?"none":!isPro?"grayscale(1) opacity(.25)":"opacity(.4)"}}>{tb.icon}</div>
            <div style={{fontSize:8,fontWeight:active?800:600,color:active?tb.c:t.muted,letterSpacing:.3}}>{tb.l}</div>
            {!isPro&&<div style={{position:"absolute",top:-1,right:3,fontSize:6,color:"#818cf8",fontWeight:900}}>⚡</div>}
          </button>
        );})}
        {!isPro&&<button onClick={()=>setProOpen(true)} style={{display:"flex",alignItems:"center",gap:2,background:"linear-gradient(135deg,rgba(129,140,248,0.13),rgba(52,211,153,0.08))",border:"1px solid rgba(129,140,248,0.22)",borderRadius:14,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",marginLeft:3}}>
          <span style={{fontSize:8,color:"#818cf8",fontWeight:800}}>⚡ Try Free</span>
        </button>}
      </div>
      {/* Free row */}
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {FREE.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",cursor:"pointer",color:active?tb.c:t.muted,transition:"all .2s",padding:"2px 4px"}}>
            <div style={{fontSize:15,filter:active?"none":"grayscale(1) opacity(.35)",transform:active?"scale(1.1)":"scale(1)",transition:"all .2s"}}>{tb.icon}</div>
            <div style={{fontSize:7,fontWeight:active?800:500,letterSpacing:.5,textTransform:"uppercase"}}>{tb.l}</div>
            {active&&<div style={{width:3,height:3,borderRadius:"50%",background:tb.c}}/>}
          </button>
        );})}
      </div>
    </div>
  </div>);
}
import { useState, useEffect, useRef, useCallback } from "react";
//added changes
import { signInGoogle } from "./firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
// ── THEME ─────────────────────────────────────────────────────
const T = {
  dark:  { bg:"#08080f", card:"rgba(255,255,255,0.05)", input:"rgba(255,255,255,0.07)", border:"rgba(255,255,255,0.09)", text:"#f0f0f0", sub:"#666", muted:"#2a2a3a", nav:"rgba(8,8,15,0.96)", pill:"rgba(255,255,255,0.07)", a1:"#FF6B6B", a2:"#6EE7F7", a3:"#B8FF6B", a4:"#FFB86B", a5:"#C16BFF", sh:"0 8px 32px rgba(0,0,0,0.5)", nb:"rgba(12,12,20,0.99)" },
  light: { bg:"#f5f5f7", card:"#ffffff",                input:"#ffffff",                border:"rgba(0,0,0,0.08)",        text:"#111",    sub:"#888", muted:"#ddd",    nav:"rgba(245,245,247,0.96)", pill:"rgba(0,0,0,0.05)",          a1:"#FF4757", a2:"#00B8D4", a3:"#36B37E", a4:"#FF8C00", a5:"#8E44AD", sh:"0 4px 20px rgba(0,0,0,0.08)", nb:"rgba(255,255,255,0.99)" },
};

// ── EXAM CONFIG ───────────────────────────────────────────────
const EXAMS = {
  "UPSC CSE": { icon:"🏛️", color:"#FF6B6B", modes: { "Prelims": { date:"2026-05-24", subjects:[{n:"History",c:"#FF6B6B",i:"📜",w:15},{n:"Geography",c:"#6EE7F7",i:"🗺️",w:15},{n:"Polity",c:"#B8FF6B",i:"⚖️",w:20},{n:"Economy",c:"#FFB86B",i:"📈",w:15},{n:"Environment",c:"#6BFFC1",i:"🌿",w:10},{n:"Science & Tech",c:"#FF8B94",i:"🔬",w:10},{n:"Cur. Affairs",c:"#FFE66D",i:"📰",w:15},{n:"CSAT",c:"#C16BFF",i:"🧠",w:0}], tips:["NCERTs first — build strong foundation","Solve 10 years PYQs daily","Read The Hindu + PIB every morning","CSAT is qualifying (33%) — don't ignore","Revise each topic minimum 3 times"] }, "Mains": { date:"2026-09-20", subjects:[{n:"Essay",c:"#FF6B6B",i:"✍️",w:15},{n:"GS I",c:"#FFB86B",i:"🕌",w:15},{n:"GS II",c:"#B8FF6B",i:"🏛️",w:15},{n:"GS III",c:"#6EE7F7",i:"📈",w:15},{n:"GS IV Ethics",c:"#818cf8",i:"💎",w:15},{n:"Optional I",c:"#FFE66D",i:"📚",w:12},{n:"Optional II",c:"#6BFFC1",i:"📚",w:13}], tips:["Write 5 answers daily","Use diagrams in answers","Ethics: read ARC reports","Essay: 2 per week","Integrate current affairs"] } } },
  "UPPCS":    { icon:"🏔️", color:"#6EE7F7", modes: { "Prelims": { date:"2026-12-15", subjects:[{n:"History",c:"#FF6B6B",i:"📜",w:15},{n:"UP History",c:"#FFB86B",i:"🕌",w:10},{n:"Geography",c:"#6EE7F7",i:"🗺️",w:10},{n:"UP Geography",c:"#B8FF6B",i:"🌄",w:10},{n:"Polity",c:"#C16BFF",i:"⚖️",w:15},{n:"Economy",c:"#FFE66D",i:"📈",w:10},{n:"UP Economy",c:"#6BFFC1",i:"🏭",w:10},{n:"Cur. Affairs",c:"#FF8B94",i:"📰",w:20}], tips:["Focus on UP-specific topics","UP Budget & ODOP scheme","Solve UPPCS PYQs last 10 years","Include UP state news","GS Paper II qualifying — 33%"] }, "Mains": { date:"2027-03-01", subjects:[{n:"General Hindi",c:"#FF6B6B",i:"📝",w:20},{n:"Essay",c:"#FFB86B",i:"✍️",w:15},{n:"GS I",c:"#6EE7F7",i:"📜",w:15},{n:"GS II",c:"#B8FF6B",i:"⚖️",w:15},{n:"GS III",c:"#FFE66D",i:"📈",w:15},{n:"GS IV Ethics",c:"#818cf8",i:"💎",w:10},{n:"Optional",c:"#6BFFC1",i:"📚",w:10}], tips:["Hindi paper is scoring","UP schemes: ODOP","Answer in Hindi for bonus","Read UP govt portal","Focus on UP Budget"] } } },
  "CAPF":     { icon:"🛡️", color:"#B8FF6B", modes: { "Paper I": { date:"2026-08-10", subjects:[{n:"General Ability",c:"#B8FF6B",i:"🧠",w:25},{n:"General Science",c:"#6EE7F7",i:"🔬",w:20},{n:"Current Events",c:"#FFE66D",i:"📰",w:20},{n:"Indian Polity",c:"#FF6B6B",i:"⚖️",w:20},{n:"History & Culture",c:"#FFB86B",i:"📜",w:15}], tips:["Physical test + academics","General Science is key","Know security forces roles","Focus on defence news","Previous year papers"] }, "Paper II": { date:"2026-08-10", subjects:[{n:"Essay",c:"#B8FF6B",i:"✍️",w:40},{n:"Comprehension",c:"#6EE7F7",i:"📖",w:30},{n:"Précis Writing",c:"#FFB86B",i:"✂️",w:30}], tips:["Essay writing daily","Précis: 1/3rd of original","Read passage twice"] } } },
  "NDA/CDS":  { icon:"⭐", color:"#FFB86B", modes: { "NDA": { date:"2026-09-14", subjects:[{n:"Mathematics",c:"#FFB86B",i:"🔢",w:50},{n:"General Ability",c:"#6EE7F7",i:"🧠",w:50}], tips:["Maths is scoring — master it","English in GAT important","NCERT Physics/Chemistry","Start SSB prep now","Physical fitness matters"] }, "CDS": { date:"2026-11-09", subjects:[{n:"English",c:"#FF8B94",i:"🔤",w:33},{n:"General Knowledge",c:"#6EE7F7",i:"🌍",w:33},{n:"Elementary Maths",c:"#FFB86B",i:"🔢",w:34}], tips:["English grammar is key","GK: defence + current affairs","Maths: Class 10 level","SSB mock interviews","Physical fitness"] } } },
  "Custom":   { icon:"🎯", color:"#C16BFF", modes: { "Exam": { date:"", subjects:[{n:"Subject 1",c:"#FF6B6B",i:"📚",w:50},{n:"Subject 2",c:"#6EE7F7",i:"📚",w:50}], tips:["Add your study strategy","Customize subjects"] } } },
};

// ── STREAK BADGES ─────────────────────────────────────────────
const BADGES = [
  {min:1,   max:6,   title:"Beginner",          icon:"🌱", msg:"Every expert was once a beginner. Keep going!",     color:"#6EE7F7"},
  {min:7,   max:13,  title:"Consistent Learner", icon:"📖", msg:"7 days strong! Consistency is your superpower.",    color:"#B8FF6B"},
  {min:14,  max:20,  title:"Achiever",           icon:"⚡", msg:"14 days — you're building a habit that lasts!",     color:"#FFB86B"},
  {min:21,  max:29,  title:"Challenger",         icon:"🏆", msg:"21 days! Science says habits are formed. Legend!",  color:"#FF6B6B"},
  {min:30,  max:59,  title:"Conqueror",          icon:"🔥", msg:"30 days — you've conquered consistency. Elite!",    color:"#818cf8"},
  {min:60,  max:999, title:"Legend",             icon:"👑", msg:"60+ days — you are truly in a league of your own.", color:"#FFE66D"},
];
function getBadge(streak){ return BADGES.find(b=>streak>=b.min&&streak<=b.max)||BADGES[0]; }

const PUBLIC_CIRCLE=[
  {id:1,name:"Aarav S.",av:"A",streak:42,city:"Delhi",   studying:true, subj:"Polity"},
  {id:2,name:"Priya M.",av:"P",streak:38,city:"Lucknow", studying:false,subj:null},
  {id:3,name:"Rohit K.",av:"R",streak:31,city:"Kanpur",  studying:true, subj:"History"},
  {id:4,name:"Sneha T.",av:"S",streak:28,city:"Prayagraj",studying:true,subj:"Economy"},
  {id:5,name:"Dev P.",  av:"D",streak:25,city:"Agra",    studying:false,subj:null},
  {id:6,name:"Meera J.",av:"M",streak:22,city:"Varanasi",studying:true, subj:"Geography"},
];

const SUBJECT_DATA=[
  {subj:"Polity",     c:"#B8FF6B",hours:[1.5,0,2,1,2.5,0,1],  total:8},
  {subj:"History",    c:"#FF6B6B",hours:[2,1,1.5,0,1.5,1,1.5],total:8.5},
  {subj:"Economy",    c:"#FFB86B",hours:[1,1.5,2,2,2,1,1],    total:10.5},
  {subj:"Geography",  c:"#6EE7F7",hours:[1,0.5,1,1,1,0.5,1],  total:6},
  {subj:"Cur. Affairs",c:"#FFE66D",hours:[1,1,1,1,1,1,1.5],   total:7.5},
];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const CHAIN=Array.from({length:35},(_,i)=>({d:i+1,done:i<17||(i>=20&&i<29),today:i===29}));
const COLS=["#FF6B6B","#6EE7F7","#B8FF6B","#FFB86B","#C16BFF","#FFE66D","#6BFFC1","#FF8B94","#818cf8","#34d399"];

// ── HELPERS ───────────────────────────────────────────────────
function pad(n){return String(n).padStart(2,"0");}
function dl(date){if(!date)return null;return Math.max(0,Math.ceil((new Date(date)-new Date())/86400000));}
function avbg(c){return `hsl(${c.charCodeAt(0)*37%360},52%,46%)`;}
function Av({c,sz=36}){return <div style={{width:sz,height:sz,borderRadius:"50%",background:avbg(c),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:"#fff",fontSize:sz*.38,flexShrink:0}}>{c}</div>;}

async function callAI(prompt,system="You are a helpful UPSC study assistant."){
  try{
    const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:prompt}],system,max_tokens:500})});
    if(!r.ok)throw new Error();
    const d=await r.json();return d.content?.[0]?.text||"Could not generate.";
  }catch{return "AI is currently unavailable. Please check your API configuration.";}
}

// ── LOGO ──────────────────────────────────────────────────────
function Logo({sz=32}){
  return(
    <svg width={sz} height={sz} viewBox="0 0 40 40" fill="none">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#818cf8"/><stop offset="100%" stopColor="#34d399"/></linearGradient></defs>
      <rect width="40" height="40" rx="11" fill="url(#lg)"/>
      <path d="M26 13 C26 13 14 13 14 18 C14 23 26 20 26 25 C26 30 14 30 14 30" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

// ── TOASTS ────────────────────────────────────────────────────
function Toasts({notifs,dismiss,t}){
  return(<div style={{position:"fixed",top:64,right:10,zIndex:9999,display:"flex",flexDirection:"column",gap:6,maxWidth:290,pointerEvents:"none"}}>
    {notifs.map(n=><div key={n.id} style={{background:t.nb,border:`1px solid ${n.col||t.a1}44`,borderLeft:`3px solid ${n.col||t.a1}`,borderRadius:11,padding:"9px 10px",boxShadow:"0 8px 26px rgba(0,0,0,0.4)",display:"flex",gap:7,alignItems:"flex-start",pointerEvents:"all",animation:"slideIn .3s ease"}}><div style={{fontSize:16,flexShrink:0}}>{n.icon}</div><div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{n.title}</div><div style={{color:t.sub,fontSize:10,marginTop:1,lineHeight:1.4}}>{n.body}</div></div><button onClick={()=>dismiss(n.id)} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:13,padding:"0 1px",flexShrink:0}}>×</button></div>)}
  </div>);
}

// ── GATE ──────────────────────────────────────────────────────
function Gate({t,name,icon,onPro}){
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:280,gap:14,textAlign:"center",padding:"0 18px"}}>
    <div style={{position:"relative",width:"100%",maxWidth:280}}><div style={{filter:"blur(4px)",opacity:.22,pointerEvents:"none",display:"flex",flexDirection:"column",gap:5}}>{[1,2,3].map(i=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"11px",height:44}}/>)}</div><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}><div style={{fontSize:38}}>{icon}</div><div style={{background:"linear-gradient(135deg,rgba(129,140,248,0.9),rgba(52,211,153,0.9))",borderRadius:10,padding:"4px 12px"}}><span style={{color:"#fff",fontWeight:800,fontSize:10}}>⚡ Premium Feature</span></div></div></div>
    <div><div style={{fontSize:15,fontWeight:800,color:t.text,marginBottom:3}}>{name}</div><div style={{color:t.sub,fontSize:11,lineHeight:1.6,maxWidth:240}}>Start with <span style={{color:"#34d399",fontWeight:700}}>7-day free trial</span> or <span style={{color:"#818cf8",fontWeight:700}}>₹25/month</span></div></div>
    <button onClick={onPro} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:12,padding:"10px 26px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 18px rgba(129,140,248,0.35)"}}>⚡ Try Free for 7 Days</button>
  </div>);
}

// ── PRICING MODAL ─────────────────────────────────────────────
function PricingModal({t,onClose,onUpgrade,isRestore,onRestore}){
  const [sel,setSel]=useState("monthly");
  const [ld,setLd]=useState(false);const [ok,setOk]=useState(false);
  const plans={trial:{l:"7-Day Trial",p:0,per:"then ₹25/mo",badge:"START FREE",c:"#34d399"},monthly:{l:"1 Month",p:25,orig:50,per:"month",badge:"50% OFF",c:"#818cf8"},quarter:{l:"3 Months",p:70,orig:150,per:"3 months",badge:"BEST VALUE",c:"#60a5fa"}};
  const feats=[{i:"🤖",l:"AI Assistant"},{i:"📝",l:"Notes & Cards"},{i:"📋",l:"Syllabus"},{i:"👑",l:"Badges"},{i:"📊",l:"Analytics"},{i:"🚫",l:"No Ads"}];
  const pay=async()=>{setLd(true);await new Promise(r=>setTimeout(r,1200));setLd(false);setOk(true);setTimeout(()=>{if(isRestore)onRestore();else onUpgrade();onClose();},1500);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:9500,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"26px 26px 0 0",width:"100%",maxWidth:540,maxHeight:"92vh",overflowY:"auto",border:"1px solid rgba(129,140,248,0.18)",borderBottom:"none"}}>
        <div style={{background:"linear-gradient(135deg,rgba(129,140,248,0.15),rgba(52,211,153,0.08))",padding:"18px 18px 14px",borderRadius:"26px 26px 0 0",textAlign:"center"}}>
          <div style={{width:28,height:4,background:"rgba(255,255,255,0.16)",borderRadius:2,margin:"0 auto 12px"}}/>
          <div style={{fontSize:18}}>⚡</div>
          <div style={{fontSize:19,fontWeight:900,background:"linear-gradient(135deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginTop:3}}>{isRestore?"Restore Your Streak 🔥":"StudySync Premium"}</div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:2}}>{isRestore?"Don't lose your progress":"7-day free trial · Cancel anytime"}</div>
        </div>
        <div style={{padding:"14px 15px 0"}}>
          {isRestore?(
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:12}}>
              <div style={{background:`${t.a1}10`,border:`1px solid ${t.a1}28`,borderRadius:13,padding:"13px",textAlign:"center"}}><div style={{fontSize:30}}>🔥</div><div style={{color:t.a1,fontWeight:900,fontSize:20,marginTop:3}}>Streak Broken!</div><div style={{color:t.sub,fontSize:10,marginTop:3}}>Restore for ₹10 or study 2× today</div></div>
              <div style={{background:t.card,border:"1.5px solid rgba(129,140,248,0.3)",borderRadius:12,padding:"11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:t.text,fontWeight:800,fontSize:13}}>💳 Pay to Restore</span><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{color:t.sub,fontSize:11,textDecoration:"line-through"}}>₹20</span><span style={{background:"#818cf8",color:"#fff",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800}}>₹10</span></div></div>
                <div style={{color:t.sub,fontSize:10,marginBottom:8}}>One-time first-restore offer</div>
                <button onClick={pay} disabled={ld} style={{width:"100%",background:ld?"rgba(129,140,248,0.3)":"linear-gradient(135deg,#818cf8,#60a5fa)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>{ld?<><div style={{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",animation:"spin .7s linear infinite"}}/>Restoring…</>:"Pay ₹10 — Restore Now"}</button>
              </div>
              <div style={{background:t.card,border:"1px solid rgba(52,211,153,0.25)",borderRadius:12,padding:"11px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:t.text,fontWeight:800,fontSize:13}}>📖 Study to Restore</span><span style={{background:"rgba(52,211,153,0.2)",color:"#34d399",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:800}}>FREE</span></div>
                <div style={{color:t.sub,fontSize:10,marginBottom:7}}>Study 4+ hours today (2× normal)</div>
                <div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:"37%",background:"linear-gradient(90deg,#34d399,#60a5fa)",borderRadius:2}}/></div>
                <div style={{color:t.sub,fontSize:9,marginTop:4,textAlign:"center"}}>1.5h / 4h studied today</div>
              </div>
            </div>
          ):(
            <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
                {Object.entries(plans).map(([k,p])=>(
                  <button key={k} onClick={()=>setSel(k)} style={{background:sel===k?`${p.c}15`:t.card,border:`2px solid ${sel===k?p.c:t.border}`,borderRadius:13,padding:"10px 5px",cursor:"pointer",fontFamily:"inherit",textAlign:"center",position:"relative",transition:"all .25s"}}>
                    {p.badge&&<div style={{position:"absolute",top:-7,left:"50%",transform:"translateX(-50%)",background:sel===k?p.c:"rgba(129,140,248,0.7)",color:"#fff",fontSize:7,fontWeight:900,padding:"2px 5px",borderRadius:14,whiteSpace:"nowrap"}}>{p.badge}</div>}
                    <div style={{color:t.sub,fontSize:9,fontWeight:600,marginBottom:2}}>{p.l}</div>
                    {p.p===0?<div style={{color:p.c,fontWeight:900,fontSize:15}}>FREE</div>:<><div style={{color:t.text,fontWeight:900,fontSize:18}}><span style={{fontSize:10}}>₹</span>{p.p}</div>{p.orig&&<div style={{color:t.muted,fontSize:8,textDecoration:"line-through"}}>₹{p.orig}</div>}</>}
                    <div style={{color:p.c,fontSize:8,fontWeight:700,marginTop:1}}>{p.per}</div>
                  </button>
                ))}
              </div>
              {!ok?<button onClick={pay} disabled={ld} style={{width:"100%",padding:"12px",borderRadius:13,border:"none",cursor:"pointer",background:ld?"rgba(129,140,248,0.3)":sel==="trial"?"linear-gradient(135deg,#34d399,#10b981)":"linear-gradient(135deg,#818cf8,#60a5fa)",color:"#fff",fontWeight:900,fontSize:13,fontFamily:"inherit",transition:"all .3s",display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:7}}>
                {ld?<><div style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",animation:"spin .7s linear infinite"}}/>Processing…</>:sel==="trial"?"🎉 Start 7-Day Free Trial":`💳 Pay ₹${plans[sel].p} · Razorpay`}
              </button>:<div style={{padding:"12px",borderRadius:13,background:"linear-gradient(135deg,#34d399,#10b981)",color:"#fff",fontWeight:900,fontSize:13,textAlign:"center",marginBottom:7}}>✓ Welcome to Premium! 🎉</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
                {feats.map(f=><div key={f.l} style={{background:t.card,border:"1px solid rgba(129,140,248,0.08)",borderRadius:9,padding:"7px 5px",textAlign:"center"}}><div style={{fontSize:15,marginBottom:2}}>{f.i}</div><div style={{color:t.text,fontWeight:700,fontSize:8,lineHeight:1.2}}>{f.l}</div></div>)}
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:4}}>{["🔒 Secure","💳 UPI/Cards","↩️ Cancel anytime"].map(b=><div key={b} style={{color:t.sub,fontSize:9}}>{b}</div>)}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── EXAM + CUSTOM SUBJECTS ────────────────────────────────────
function ExamSetup({t,es,setEs,onClose,customSubjects,setCustomSubjects}){
  const [ex,setEx]=useState(es.key||"UPSC CSE");
  const [md,setMd]=useState(es.mode||"Prelims");
  const [dt,setDt]=useState(es.date||"");
  const [ns,setNs]=useState("");const [nc,setNc]=useState("#818cf8");
  const [editIdx,setEditIdx]=useState(null);const [editVal,setEditVal]=useState("");
  const [showCustom,setShowCustom]=useState(false);
  const cfg=EXAMS[ex];const modeData=cfg?.modes[md];
  const modes=Object.keys(cfg?.modes||{});
  const subjs=ex==="Custom"?customSubjects:(modeData?.subjects||[]);
  const apply=()=>{setEs({key:ex,mode:md,name:`${ex} ${md}`,date:dt||modeData?.date||"",color:cfg?.color||"#818cf8",icon:cfg?.icon||"🎯",subjects:[...subjs,...(ex!=="Custom"?customSubjects:[])],tips:modeData?.tips||[]});onClose();};
  const addCustom=()=>{if(!ns.trim())return;setCustomSubjects(p=>[...p,{n:ns.trim(),c:nc,i:"📌",w:0,custom:true}]);setNs("");};
  const delCustom=(i)=>setCustomSubjects(p=>p.filter((_,j)=>j!==i));
  const startEdit=(i,v)=>{setEditIdx(i);setEditVal(v);};
  const saveEdit=(i)=>{setCustomSubjects(p=>p.map((s,j)=>j===i?{...s,n:editVal}:s));setEditIdx(null);};
  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 34px"}}>
        <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 11px"}}/>
        <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:1}}>🎯 Set Your Exam</div>
        <div style={{color:t.sub,fontSize:10,marginBottom:12}}>Choose exam & mode — subjects auto-load</div>

        {/* Exam list */}
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
          {Object.entries(EXAMS).map(([k,v])=>(
            <button key={k} onClick={()=>{setEx(k);setMd(Object.keys(v.modes)[0]);}} style={{display:"flex",alignItems:"center",gap:9,background:ex===k?`${v.color}15`:t.card,border:`1.5px solid ${ex===k?v.color:t.border}`,borderRadius:11,padding:"9px 11px",cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
              <span style={{fontSize:17}}>{v.icon}</span>
              <div style={{flex:1,textAlign:"left"}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{k}</div></div>
              {ex===k&&<div style={{width:6,height:6,borderRadius:"50%",background:v.color,boxShadow:`0 0 4px ${v.color}`}}/>}
            </button>
          ))}
        </div>

        {/* Mode */}
        {modes.length>1&&<div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Mode</div>
          <div style={{display:"flex",gap:5}}>{modes.map(m=><button key={m} onClick={()=>setMd(m)} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${md===m?(cfg?.color||"#818cf8"):t.border}`,background:md===m?`${cfg?.color||"#818cf8"}14`:t.card,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .2s"}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{m}</div><div style={{color:t.sub,fontSize:8,marginTop:1}}>{dl(EXAMS[ex]?.modes[m]?.date)??"-"}d left</div></button>)}</div>
        </div>}

        {/* Date */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Exam Date</div>
          <input type="date" value={dt} onChange={e=>setDt(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 10px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light",boxSizing:"border-box"}}/>
        </div>

        {/* Default subjects */}
        {ex!=="Custom"&&subjs.length>0&&<div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Subjects ({subjs.length} auto-loaded)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{subjs.map(s=><div key={s.n} style={{background:`${s.c}20`,color:s.c,border:`1px solid ${s.c}44`,borderRadius:13,padding:"2px 7px",fontSize:9,fontWeight:700}}>{s.i} {s.n}</div>)}</div>
        </div>}

        {/* Custom subjects section */}
        <div style={{background:t.card,border:`1px solid ${showCustom?"#818cf8":t.border}40`,borderRadius:12,padding:"11px",marginBottom:12,transition:"border .2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showCustom?10:0}}>
            <div><div style={{color:t.text,fontWeight:700,fontSize:12}}>📌 Custom Subjects</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>Add your own subjects to any exam</div></div>
            <button onClick={()=>setShowCustom(v=>!v)} style={{background:showCustom?"#818cf8":t.pill,border:"none",borderRadius:8,padding:"4px 9px",color:showCustom?"#fff":t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{showCustom?"Done":"Manage"}</button>
          </div>
          {showCustom&&(<>
            {/* Existing custom subjects */}
            {customSubjects.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:9}}>
              {customSubjects.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:7,background:t.input,borderRadius:8,padding:"7px 9px",border:`1px solid ${s.c}30`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.c,flexShrink:0}}/>
                  {editIdx===i?(
                    <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(i);if(e.key==="Escape")setEditIdx(null);}} autoFocus style={{flex:1,background:"none",border:"none",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                  ):<div style={{flex:1,color:t.text,fontSize:11,fontWeight:600}}>{s.n}</div>}
                  {editIdx===i?(
                    <button onClick={()=>saveEdit(i)} style={{background:"#34d399",border:"none",borderRadius:6,padding:"3px 7px",color:"#0a0a0f",fontWeight:800,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                  ):(
                    <div style={{display:"flex",gap:4}}>
                      <button onClick={()=>startEdit(i,s.n)} style={{background:t.pill,border:"none",borderRadius:6,padding:"3px 7px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                      <button onClick={()=>delCustom(i)} style={{background:"rgba(255,107,107,0.12)",border:"none",borderRadius:6,padding:"3px 7px",color:t.a1,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>}
            {/* Add new */}
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:7}}>{COLS.map(c=><div key={c} onClick={()=>setNc(c)} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:nc===c?"2.5px solid white":"2px solid transparent",transition:"all .2s"}}/>)}</div>
            <div style={{display:"flex",gap:5}}>
              <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Subject name…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              <button onClick={addCustom} style={{background:nc,border:"none",borderRadius:8,padding:"7px 11px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+</button>
            </div>
            {customSubjects.length===0&&<div style={{color:t.muted,fontSize:9,marginTop:7,textAlign:"center"}}>No custom subjects yet. Add your first one!</div>}
          </>)}
        </div>

        {/* Tips */}
        {modeData?.tips&&<div style={{marginBottom:12}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Strategy</div>
          <div style={{display:"flex",flexDirection:"column",gap:3}}>{modeData.tips.map((tip,i)=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 9px",display:"flex",gap:5}}><span style={{color:"#818cf8",fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}.</span><span style={{color:t.text,fontSize:10,lineHeight:1.4}}>{tip}</span></div>)}</div>
        </div>}

        <button onClick={apply} style={{width:"100%",background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 16px rgba(129,140,248,0.28)"}}>
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
      <div style={{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.07),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><div style={{padding:12,borderRadius:18,background:"rgba(129,140,248,0.08)",border:"1px solid rgba(129,140,248,0.16)",boxShadow:"0 0 26px rgba(129,140,248,0.09)"}}><Logo sz={46}/></div></div>
        <div style={{fontSize:24,fontWeight:900,letterSpacing:-1,background:"linear-gradient(135deg,#818cf8,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>StudySync</div>
        <div style={{color:t.sub,fontSize:12,marginTop:4}}>Your study companion</div>
      </div>
      <div style={{width:"100%",maxWidth:320,background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:18,boxShadow:t.sh}}>
        {step==="main"&&(<>
          <div style={{textAlign:"center",marginBottom:13}}>
            <div style={{fontSize:13,fontWeight:800,color:t.text}}>Sign in to StudySync</div>
            <div style={{fontSize:10,color:t.sub,marginTop:2}}>Join 50,000+ aspirants 📚</div>
          </div>
          <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.22)",borderRadius:10,padding:"8px 10px",marginBottom:11,display:"flex",gap:7,alignItems:"center"}}>
            <span style={{fontSize:16}}>🎁</span>
            <div><div style={{color:"#34d399",fontWeight:800,fontSize:11}}>7-Day Free Trial</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>Full premium access — no card needed</div></div>
          </div>
          <button onClick={async()=>{setLoading(true);const {user,error}=await signInGoogle();if(user)onLogin(user);else{setLoading(false);alert(error||"Login failed");}}} disabled={loading} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:loading?t.pill:"linear-gradient(135deg,rgba(129,140,248,0.11),rgba(96,165,250,0.11))",border:"1px solid rgba(129,140,248,0.22)",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"inherit",marginBottom:8,transition:"all .25s"}}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.7 0 6.8 5.5 3 13.5l7.9 6.1C12.8 13.4 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/><path fill="#FBBC05" d="M10.9 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .8-4.4L2.4 13.5A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.4-6.2z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.1 0-11.2-4-13.1-9.5l-8 6.2C6.7 42.5 14.7 48 24 48z"/></svg>
            <span style={{color:t.text,fontWeight:700,fontSize:12}}>{loading?"Signing in…":"Continue with Gmail"}</span>
          </button>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{flex:1,height:1,background:t.border}}/><div style={{color:t.sub,fontSize:10}}>OR</div><div style={{flex:1,height:1,background:t.border}}/></div>
          <button onClick={()=>setStep("phone")} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:t.input,border:`1px solid ${t.border}`,borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"inherit"}}>
            <span style={{fontSize:15}}>📱</span><span style={{color:t.text,fontWeight:700,fontSize:12}}>Continue with Phone</span>
          </button>
          <div style={{color:t.muted,fontSize:9,textAlign:"center",marginTop:10,lineHeight:1.6}}>Free for students · No ads · Made for India ❤️</div>
        </>)}
        {step==="phone"&&(<>
          <button onClick={()=>setStep("main")} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0,display:"flex",alignItems:"center",gap:3}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:2}}>Enter your number</div>
          <div style={{fontSize:10,color:t.sub,marginBottom:11}}>We'll send an OTP — needs Firebase to be set up</div>
          <div style={{display:"flex",marginBottom:8,overflow:"hidden",borderRadius:10,border:`1px solid ${t.border}`}}>
            <div style={{background:t.pill,padding:"10px 8px",color:t.sub,fontSize:11,fontWeight:700,borderRight:`1px solid ${t.border}`,whiteSpace:"nowrap"}}>🇮🇳 +91</div>
            <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))} placeholder="10-digit number" style={{flex:1,background:t.input,border:"none",padding:"10px 10px",color:t.text,fontSize:13,fontFamily:"inherit",outline:"none"}} maxLength={10} inputMode="numeric"/>
          </div>
          <button onClick={()=>go(()=>setStep("otp"))} disabled={loading||phone.length<10} style={{width:"100%",background:phone.length===10?"linear-gradient(135deg,#818cf8,#60a5fa)":t.pill,border:"none",borderRadius:11,padding:"10px",color:phone.length===10?"#fff":t.sub,fontWeight:800,fontSize:12,cursor:phone.length===10?"pointer":"not-allowed",fontFamily:"inherit",transition:"all .25s"}}>{loading?"Sending OTP…":"Send OTP →"}</button>
        </>)}
        {step==="otp"&&(<>
          <button onClick={()=>setStep("phone")} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:11,fontWeight:600,marginBottom:10,padding:0,display:"flex",alignItems:"center",gap:3}}>← Back</button>
          <div style={{fontSize:13,fontWeight:800,color:t.text,marginBottom:2}}>Enter OTP</div>
          <div style={{fontSize:10,color:t.sub,marginBottom:12}}>Sent to +91 {phone} · <span style={{color:"#818cf8",cursor:"pointer"}} onClick={()=>setStep("phone")}>Change</span></div>
          <div style={{display:"flex",gap:5,justifyContent:"center",marginBottom:12}}>
            {otp.map((v,i)=><input key={i} ref={el=>refs.current[i]=el} value={v} onChange={e=>chOtp(i,e.target.value)} onKeyDown={e=>e.key==="Backspace"&&!v&&i>0&&refs.current[i-1]?.focus()} maxLength={1} inputMode="numeric" style={{width:39,height:46,borderRadius:10,border:`2px solid ${v?"#818cf8":t.border}`,background:t.input,textAlign:"center",fontSize:20,fontWeight:800,color:t.text,fontFamily:"inherit",outline:"none",transition:"all .2s"}}/>)}
          </div>
          <button onClick={()=>go(()=>onLogin({name: phone,phone: phone}))} disabled={loading||otp.join("").length<6} style={{width:"100%",background:otp.join("").length===6?"linear-gradient(135deg,#818cf8,#60a5fa)":t.pill,border:"none",borderRadius:11,padding:"10px",color:otp.join("").length===6?"#fff":t.sub,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>{loading?"Verifying…":"Verify & Sign In ✓"}</button>
        </>)}
      </div>
    </div>
  );
}

// ── POMODORO (Feature 2 — presets 25/45/60, free max 60, pro max 150) ─
function Pomo({t,subjects,customSubjects,pushN,ns,isPro,user,onSessionComplete}){
  const allSubjects=[...subjects,...customSubjects];
  const [cs,setCs]=useState(allSubjects[0]?.n||"History");
  const [mode,setMode]=useState("focus");
  const [cf,setCf]=useState(()=>parseInt(localStorage.getItem("ss_pomo_dur")||"25"));
  const [pf,setPf]=useState(cf);
  const [sec,setSec]=useState(cf*60);
  const [run,setRun]=useState(false);
  const [sess,setSess]=useState(0);
  const [show,setShow]=useState(false);
  const ref=useRef();
  const maxMin=isPro?150:60;
  const PRESETS=[25,45,60,...(isPro?[90,120,150]:[])];
  const dur={focus:cf,short:5,long:15};
  const tot=dur[mode]*60;
  const prog=((tot-sec)/tot)*100;
  const sc=allSubjects.find(s=>s.n===cs)?.c||t.a2;
  const circ=2*Math.PI*86;const dash=circ-(prog/100)*circ;

  const saveSession=async(subject,minutes)=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      const sessionData={subject,minutes,completedAt:Date.now(),date:new Date().toISOString().split("T")[0]};
      // Write session log
      const newRef=mod.ref(mod.db,`users/${user.uid}/sessions/s_${Date.now()}`);
      await mod.set(newRef,sessionData);
      // Update stats aggregation
      const statsRef=mod.ref(mod.db,`users/${user.uid}/stats`);
      const snap=await new Promise(res=>mod.onValue(statsRef,(s)=>{res(s);},{onlyOnce:true}));
      const prev=snap.exists()?snap.val():{totalSessions:0,totalMinutes:0,lastStudyDate:""};
      const today=new Date().toISOString().split("T")[0];
      await mod.set(statsRef,{
        totalSessions:(prev.totalSessions||0)+1,
        totalMinutes:(prev.totalMinutes||0)+minutes,
        lastStudyDate:today,
      });
      if(onSessionComplete) onSessionComplete();
    }catch(e){console.error("saveSession error",e);}
  };

  useEffect(()=>{
    if(run){
      ref.current=setInterval(()=>setSec(s=>{
        if(s<=1){
          clearInterval(ref.current);setRun(false);
          if(mode==="focus"){
            setSess(n=>n+1);
            saveSession(cs,cf);
            if(ns?.pomoDone)pushN({icon:"⏱",title:"Session complete! 🎉",body:`Great work on ${cs}!`,col:sc});
          }
          return 0;
        }
        return s-1;
      }),1000);
    }else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[run,mode]);
  const sw=(m,cm)=>{setMode(m);setSec((cm??dur[m])*60);setRun(false);};
  const applyDur=(v)=>{const val=Math.min(v,maxMin);setCf(val);setPf(val);sw("focus",val);setShow(false);localStorage.setItem("ss_pomo_dur",String(val));};
  const fmtTime=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}`:m+"m";
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:15}}>
    <div style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3}}>{[["focus","Focus"],["short","Short Brk"],["long","Long Brk"]].map(([m,l])=><button key={m} onClick={()=>sw(m)} style={{padding:"6px 11px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,background:mode===m?sc:t.pill,color:mode===m?"#0a0a0f":t.sub,transition:"all .2s"}}>{l}</button>)}</div>
    <div style={{position:"relative",width:196,height:196}}>
      <svg width={196} height={196} style={{transform:"rotate(-90deg)"}}><circle cx={98} cy={98} r={86} fill="none" stroke={t.border} strokeWidth={9}/><circle cx={98} cy={98} r={86} fill="none" stroke={sc} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/></svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
        <div style={{fontSize:44,fontWeight:900,color:t.text,letterSpacing:-2,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{pad(Math.floor(sec/60))}:{pad(sec%60)}</div>
        <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:2,fontWeight:600}}>{mode==="focus"?"FOCUS":mode==="short"?"SHORT":"LONG"}</div>
        <div style={{fontSize:9,color:sc,fontWeight:700,marginTop:1}}>{fmtTime(cf)}</div>
      </div>
    </div>

    {/* Timer settings */}
    <div style={{background:t.card,border:`1px solid ${show?sc+"44":t.border}`,borderRadius:14,padding:"10px 14px",width:"100%",maxWidth:350,transition:"border .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:show?10:0}}>
        <span style={{color:t.sub,fontSize:11,fontWeight:600}}>⚙️ Timer — {fmtTime(cf)}</span>
        <button onClick={()=>setShow(v=>!v)} style={{background:t.pill,border:"none",borderRadius:14,padding:"3px 8px",color:t.text,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{show?"Done":"Customize"}</button>
      </div>
      {show&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
        {/* Presets */}
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1}}>Presets</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {PRESETS.map(v=><button key={v} onClick={()=>applyDur(v)} style={{padding:"6px 11px",borderRadius:9,border:`1.5px solid ${cf===v?sc:t.border}`,background:cf===v?`${sc}20`:t.pill,color:cf===v?sc:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{fmtTime(v)}</button>)}
        </div>
        {/* Custom slider */}
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1}}>Custom — max {fmtTime(maxMin)}{!isPro&&<span style={{color:"#818cf8"}}> · Pro gets 2h30m</span>}</div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:t.sub,fontSize:11}}>Duration</span><span style={{color:sc,fontWeight:900,fontSize:17}}>{fmtTime(pf)}</span></div>
        <input type="range" min={5} max={maxMin} step={5} value={pf} onChange={e=>setPf(Number(e.target.value))} style={{width:"100%",accentColor:sc,cursor:"pointer"}}/>
        <button onClick={()=>applyDur(pf)} style={{background:sc,border:"none",borderRadius:9,padding:"8px",color:"#0a0a0f",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Apply {fmtTime(pf)} Timer</button>
      </div>)}
    </div>

    {/* Subject pills */}
    <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",maxWidth:390}}>
      {allSubjects.slice(0,10).map(s=><button key={s.n} onClick={()=>setCs(s.n)} style={{padding:"3px 9px",borderRadius:15,border:`1.5px solid ${cs===s.n?s.c:"transparent"}`,background:cs===s.n?`${s.c}20`:t.pill,color:cs===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{s.i||"📌"} {s.n}</button>)}
    </div>

    <div style={{display:"flex",gap:8,alignItems:"center"}}>
      <button onClick={()=>{setSec(dur[mode]*60);setRun(false);}} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Reset</button>
      <button onClick={()=>setRun(r=>!r)} style={{background:run?t.card:sc,border:run?`1.5px solid ${t.border}`:"none",color:run?t.text:"#0a0a0f",borderRadius:14,padding:"11px 32px",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit",transition:"all .25s",boxShadow:run?"none":`0 0 20px ${sc}55`}}>{run?"⏸ Pause":"▶ Start"}</button>
      <button onClick={()=>sw(mode==="focus"?"short":"focus")} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Skip</button>
    </div>
    <div style={{display:"flex",gap:17}}>{[{l:"Sessions",v:sess,c:sc},{l:"Focus Time",v:`${Math.floor(sess*cf/60)}h${(sess*cf)%60}m`,c:t.text}].map(s=><div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1,marginTop:1}}>{s.l}</div></div>)}</div>
  </div>);
}

// ── PLANNER (Feature 7 — edit/delete tasks with confirmation) ─
function Planner({t,subjects,customSubjects}){
  const allSubjects=[...subjects,...customSubjects];
  const [view,setView]=useState("daily");
  const [tasks,setTasks]=useState([
    {id:1,text:"Read Laxmikanth Ch. 8",subj:subjects.find(s=>s.n==="Polity")?.n||subjects[0]?.n||"History",done:false,time:"09:00"},
    {id:2,text:"Newspaper + Editorial",subj:subjects.find(s=>s.n==="Cur. Affairs")?.n||subjects[0]?.n||"History",done:true,time:"07:00"},
    {id:3,text:"Economy Chapter",subj:subjects.find(s=>s.n==="Economy")?.n||subjects[0]?.n||"History",done:false,time:"14:00"},
  ]);
  const [nt,setNt]=useState("");const [ns,setNs]=useState(allSubjects[0]?.n||"History");
  const [editId,setEditId]=useState(null);const [editVal,setEditVal]=useState("");
  const [delConfirm,setDelConfirm]=useState(null);
  const today=new Date();
  const days=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return d;});
  const tog=id=>setTasks(tasks.map(x=>x.id===id?{...x,done:!x.done}:x));
  const add=()=>{if(!nt.trim())return;setTasks([...tasks,{id:Date.now(),text:nt,subj:ns,done:false,time:"12:00"}]);setNt("");};
  const startEdit=(task)=>{setEditId(task.id);setEditVal(task.text);};
  const saveEdit=(id)=>{setTasks(tasks.map(x=>x.id===id?{...x,text:editVal}:x));setEditId(null);};
  const confirmDel=(id)=>setDelConfirm(id);
  const doDel=(id)=>{setTasks(tasks.filter(x=>x.id!==id));setDelConfirm(null);};
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {/* Delete confirm dialog */}
    {delConfirm&&(
      <div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
        <div style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:16,padding:20,maxWidth:280,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:24,marginBottom:8}}>🗑️</div>
          <div style={{color:t.text,fontWeight:800,fontSize:14,marginBottom:4}}>Delete Task?</div>
          <div style={{color:t.sub,fontSize:11,marginBottom:16}}>This can't be undone.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDelConfirm(null)} style={{flex:1,background:t.pill,border:"none",borderRadius:10,padding:"9px",color:t.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={()=>doDel(delConfirm)} style={{flex:1,background:"linear-gradient(135deg,#FF6B6B,#FF4757)",border:"none",borderRadius:10,padding:"9px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
          </div>
        </div>
      </div>
    )}
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:24,padding:3,alignSelf:"flex-start"}}>{["daily","weekly","monthly"].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 11px",borderRadius:19,border:"none",background:view===v?t.a4:t.pill,color:view===v?"#0a0a0f":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",textTransform:"capitalize",fontFamily:"inherit"}}>{v}</button>)}</div>
    {view==="weekly"&&<div style={{display:"flex",gap:3}}>{days.map((d,i)=><div key={i} style={{flex:1,background:i===today.getDay()?`${t.a4}15`:t.card,border:`1px solid ${i===today.getDay()?t.a4+"44":t.border}`,borderRadius:8,padding:"6px 3px",textAlign:"center"}}><div style={{fontSize:7,color:t.sub,marginBottom:1}}>{["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()]}</div><div style={{fontSize:13,fontWeight:800,color:i===today.getDay()?t.a4:t.text}}>{d.getDate()}</div></div>)}</div>}
    {view==="monthly"&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:t.sub,fontWeight:700,padding:"2px 0"}}>{d}</div>)}{Array.from({length:31},(_,i)=>i+1).map(d=><div key={d} style={{textAlign:"center",padding:"4px 1px",borderRadius:5,fontSize:9,background:d===today.getDate()?`${t.a4}18`:"transparent",color:d===today.getDate()?t.a4:d<today.getDate()?t.muted:t.sub}}>{d}</div>)}</div></div>}

    {/* Add task */}
    <div style={{display:"flex",gap:5}}>
      <input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a task…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
      <select value={ns} onChange={e=>setNs(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 5px",color:t.text,fontFamily:"inherit",cursor:"pointer",fontSize:9,maxWidth:90}}>{allSubjects.map(s=><option key={s.n}>{s.n}</option>)}</select>
      <button onClick={add} style={{background:t.a3,border:"none",borderRadius:8,padding:"8px 11px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>+</button>
    </div>

    {/* Task list */}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {tasks.map(task=>{
        const s=allSubjects.find(s=>s.n===task.subj)||{c:"#818cf8"};
        return(
          <div key={task.id} style={{background:task.done?t.pill:t.card,border:`1px solid ${task.done?t.border:s.c+"28"}`,borderRadius:10,padding:"9px 10px",transition:"all .2s"}}>
            {editId===task.id?(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(task.id);if(e.key==="Escape")setEditId(null);}} autoFocus style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={()=>saveEdit(task.id)} style={{background:"#34d399",border:"none",borderRadius:7,padding:"6px 10px",color:"#0a0a0f",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                <button onClick={()=>setEditId(null)} style={{background:t.pill,border:"none",borderRadius:7,padding:"6px 8px",color:t.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div onClick={()=>tog(task.id)} style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`2px solid ${task.done?s.c:"rgba(150,150,150,.3)"}`,background:task.done?s.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{task.done&&<span style={{color:"#0a0a0f",fontSize:8,fontWeight:900}}>✓</span>}</div>
                <div onClick={()=>tog(task.id)} style={{flex:1,color:task.done?t.sub:t.text,fontSize:11,textDecoration:task.done?"line-through":"none",cursor:"pointer"}}>{task.text}</div>
                <div style={{background:`${s.c}18`,color:s.c,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:12}}>{task.subj}</div>
                <div style={{display:"flex",gap:3}}>
                  <button onClick={()=>startEdit(task)} style={{background:t.pill,border:"none",borderRadius:6,padding:"3px 6px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                  <button onClick={()=>confirmDel(task.id)} style={{background:"rgba(255,107,107,0.1)",border:"none",borderRadius:6,padding:"3px 6px",color:t.a1,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {tasks.length===0&&<div style={{color:t.sub,fontSize:12,textAlign:"center",padding:"20px 0"}}>No tasks yet. Add your first task above!</div>}
    </div>
  </div>);
}

// ── STREAK (Feature 6 — badges for Pro) ──────────────────────
function Streak({t,pushN,ns,onRestore,streak,isPro,pushN:_}){
  const badge=getBadge(streak);
  const nextBadge=BADGES.find(b=>b.min>streak);
  const [showBadge,setShowBadge]=useState(false);
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    {/* Badge reveal modal */}
    {showBadge&&<div style={{position:"fixed",inset:0,zIndex:9800,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,backdropFilter:"blur(8px)"}} onClick={()=>setShowBadge(false)}>
      <div style={{background:t.bg,border:`1px solid ${badge.color}40`,borderRadius:20,padding:28,maxWidth:280,width:"100%",textAlign:"center",boxShadow:`0 0 40px ${badge.color}25`}}>
        <div style={{fontSize:52,marginBottom:8}}>{badge.icon}</div>
        <div style={{fontSize:11,color:t.sub,textTransform:"uppercase",letterSpacing:2,marginBottom:4}}>Current Badge</div>
        <div style={{fontSize:22,fontWeight:900,color:badge.color,marginBottom:6}}>{badge.title}</div>
        <div style={{color:t.sub,fontSize:12,lineHeight:1.6,marginBottom:16}}>{badge.msg}</div>
        {nextBadge&&<div style={{background:`${nextBadge.color}10`,border:`1px solid ${nextBadge.color}25`,borderRadius:10,padding:"8px 12px"}}><div style={{color:t.sub,fontSize:10}}>Next: <span style={{color:nextBadge.color,fontWeight:700}}>{nextBadge.icon} {nextBadge.title}</span> at {nextBadge.min} days</div></div>}
        <div style={{color:t.muted,fontSize:10,marginTop:14}}>Tap anywhere to close</div>
      </div>
    </div>}

    {/* Streak hero */}
    <div style={{background:`${t.a1}10`,border:`1px solid ${t.a1}28`,borderRadius:15,padding:15,textAlign:"center"}}>
      <div style={{fontSize:40}}>🔥</div>
      <div style={{fontSize:46,fontWeight:900,color:t.a1,lineHeight:1}}>{streak}</div>
      <div style={{fontSize:10,color:t.sub,marginTop:2}}>Day Streak</div>
      <div style={{background:`${t.a1}14`,color:t.a1,borderRadius:9,padding:"5px 10px",marginTop:8,fontSize:10,fontWeight:700,display:"inline-block"}}>🔔 Study today — don't break the chain!</div>
    </div>

    {/* Badge card */}
    <div onClick={()=>setShowBadge(true)} style={{background:`${badge.color}10`,border:`1.5px solid ${badge.color}35`,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:11,cursor:"pointer",transition:"all .2s"}}>
      <div style={{fontSize:32}}>{badge.icon}</div>
      <div style={{flex:1}}>
        <div style={{color:badge.color,fontWeight:900,fontSize:14}}>{badge.title}</div>
        <div style={{color:t.sub,fontSize:10,marginTop:2,lineHeight:1.4}}>{badge.msg}</div>
        {nextBadge&&<div style={{color:t.muted,fontSize:9,marginTop:3}}>{nextBadge.min-streak} more days → {nextBadge.icon} {nextBadge.title}</div>}
      </div>
      <div style={{color:t.muted,fontSize:11}}>›</div>
    </div>

    {/* All badges — pro only */}
    {isPro?(
      <div>
        <div style={{fontSize:8,color:t.sub,marginBottom:8,textTransform:"uppercase",letterSpacing:1.5}}>All Badges</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          {BADGES.map(b=>{const earned=streak>=b.min;return(
            <div key={b.title} style={{background:earned?`${b.color}10`:t.card,border:`1px solid ${earned?b.color+"30":t.border}`,borderRadius:11,padding:"9px 6px",textAlign:"center",opacity:earned?1:.35,transition:"all .3s"}}>
              <div style={{fontSize:20,marginBottom:2,filter:earned?"none":"grayscale(1)"}}>{b.icon}</div>
              <div style={{color:earned?b.color:t.sub,fontSize:8,fontWeight:700,lineHeight:1.2}}>{b.title}</div>
              <div style={{color:t.muted,fontSize:7,marginTop:1}}>{b.min}+ days</div>
            </div>
          );})}
        </div>
      </div>
    ):<div style={{background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.15)",borderRadius:11,padding:"10px 13px",display:"flex",gap:9,alignItems:"center"}}><div style={{fontSize:18}}>👑</div><div><div style={{color:"#818cf8",fontWeight:700,fontSize:11}}>Unlock All Badges with Pro</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>See your streak journey and all milestones</div></div></div>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
      <button onClick={()=>ns?.streakBreak&&pushN({icon:"🔥",title:"Streak at risk!",body:`${streak}-day streak on the line! Study now 😬`,col:t.a1})} style={{background:`${t.a1}12`,border:`1px solid ${t.a1}28`,borderRadius:10,padding:"9px",color:t.a1,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>🔥 Test Alert</button>
      <button onClick={onRestore} style={{background:`${t.a4}12`,border:`1px solid ${t.a4}28`,borderRadius:10,padding:"9px",color:t.a4,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>💔 Restore Streak</button>
    </div>

    <div><div style={{fontSize:8,color:t.sub,marginBottom:7,textTransform:"uppercase",letterSpacing:1.5}}>May 2026 — Don't Break the Chain</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {CHAIN.map(d=><div key={d.d} style={{aspectRatio:"1",borderRadius:5,background:d.today?t.a1:d.done?`${t.a1}26`:t.pill,border:d.today?`2px solid ${t.a1}`:d.done?`1px solid ${t.a1}36`:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:d.today?"#fff":d.done?t.a1:t.muted,fontWeight:d.today?900:500}}>{d.done||d.today?(d.today?"●":"✓"):d.d}</div>)}
      </div>
    </div>
  </div>);
}

// ── EXAM DASHBOARD ────────────────────────────────────────────
function ExamDash({t,es,onOpen,customSubjects}){
  const days=dl(es.date);
  const allSubjs=[...es.subjects,...customSubjects.filter(s=>!es.subjects.find(x=>x.n===s.n))];
  const prog={};allSubjs.forEach((s,i)=>{prog[s.n]=[20,45,60,35,75,50,40,65,30,55][i%10];});
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:`${es.color||"#818cf8"}10`,border:`1px solid ${es.color||"#818cf8"}28`,borderRadius:14,padding:"12px 12px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-8,right:-8,width:65,height:65,borderRadius:"50%",background:`radial-gradient(circle,${es.color||"#818cf8"}16,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:18}}>{es.icon||"🎯"}</div><div style={{color:t.text,fontWeight:900,fontSize:15,marginTop:2}}>{es.key||"UPSC CSE"}</div><div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}><div style={{background:`${es.color||"#818cf8"}18`,color:es.color||"#818cf8",border:`1px solid ${es.color||"#818cf8"}40`,borderRadius:13,padding:"1px 7px",fontSize:8,fontWeight:800}}>{es.mode||"PRELIMS"}</div><div style={{color:t.sub,fontSize:8}}>{es.date}</div></div></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:34,fontWeight:900,color:es.color||"#818cf8",lineHeight:1}}>{days}</div><div style={{color:t.sub,fontSize:8,marginTop:1}}>days left</div></div>
      </div>
      <button onClick={onOpen} style={{marginTop:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${t.border}`,borderRadius:7,padding:"3px 9px",color:t.sub,fontSize:8,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✎ Change Exam / Mode</button>
    </div>
    {es.tips?.length>0&&<div><div style={{fontSize:7,color:t.sub,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>Strategy</div><div style={{display:"flex",flexDirection:"column",gap:3}}>{es.tips.map((tip,i)=><div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 9px",display:"flex",gap:5}}><span style={{color:"#818cf8",fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}.</span><span style={{color:t.text,fontSize:10,lineHeight:1.4}}>{tip}</span></div>)}</div></div>}
    <div><div style={{fontSize:7,color:t.sub,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>Subject Progress {customSubjects.length>0&&`· ${customSubjects.length} custom`}</div>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {allSubjs.map(s=><div key={s.n} style={{background:t.card,border:`1px solid ${s.c}18`,borderRadius:10,padding:"8px 10px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:12}}>{s.i||"📌"}</span><div><div style={{color:t.text,fontWeight:700,fontSize:11}}>{s.n}{s.custom&&<span style={{color:"#818cf8",fontSize:8}}> custom</span>}</div>{s.w>0&&<div style={{color:t.sub,fontSize:8}}>{s.w}% weightage</div>}</div></div><div style={{color:s.c,fontWeight:800,fontSize:11}}>{prog[s.n]||0}%</div></div>
          <div style={{height:3,background:t.pill,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${prog[s.n]||0}%`,background:s.c,borderRadius:2,transition:"width .5s ease"}}/></div>
        </div>)}
      </div>
    </div>
  </div>);
}

// ── SYLLABUS (Feature 3) ──────────────────────────────────────
function Syllabus({t,subjects,customSubjects,user}){
  const allSubjects=[...subjects,...customSubjects];
  const DEFAULT_SYLLABI=[
    {id:"syl_polity",name:"Indian Polity",subj:"Polity",color:"#B8FF6B",topics:[
      {id:"t1",title:"Preamble & Fundamental Rights",status:"completed"},
      {id:"t2",title:"Directive Principles",status:"completed"},
      {id:"t3",title:"Parliament & President",status:"in-progress"},
      {id:"t4",title:"Centre-State Relations",status:"not-started"},
      {id:"t5",title:"Constitutional Bodies",status:"not-started"},
    ]},
    {id:"syl_economy",name:"Indian Economy",subj:"Economy",color:"#FFB86B",topics:[
      {id:"t1",title:"National Income Concepts",status:"completed"},
      {id:"t2",title:"Fiscal & Monetary Policy",status:"in-progress"},
      {id:"t3",title:"Banking & Finance",status:"not-started"},
      {id:"t4",title:"International Trade",status:"not-started"},
    ]},
  ];
  const [syllabi,setSyllabi]=useState(DEFAULT_SYLLABI);
  const [selId,setSelId]=useState(null);
  const [showNew,setShowNew]=useState(false);
  const [newName,setNewName]=useState("");
  const [newSubj,setNewSubj]=useState(allSubjects[0]?.n||"");
  const [newTopic,setNewTopic]=useState("");
  const [editTopicId,setEditTopicId]=useState(null);
  const [editTopicVal,setEditTopicVal]=useState("");
  const [dbReady,setDbReady]=useState(false);

  // ── RTDB sync ──
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbMod=mod;
        dbRef=mod.ref(mod.db,`users/${user.uid}/syllabi`);
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()){
            const val=snap.val();
            // Convert object-of-objects back to array
            const arr=Object.entries(val).map(([id,syl])=>({
              ...syl,id,
              topics:syl.topics?Object.entries(syl.topics).map(([tid,tp])=>({...tp,id:tid})):[]
            }));
            setSyllabi(arr);
          } else {
            // First login: seed defaults
            DEFAULT_SYLLABI.forEach(syl=>{
              const {topics,...sylData}=syl;
              const topicsObj={};
              topics.forEach(tp=>{topicsObj[tp.id]={title:tp.title,status:tp.status};});
              mod.set(mod.ref(mod.db,`users/${user.uid}/syllabi/${syl.id}`),{...sylData,topics:topicsObj});
            });
          }
          setDbReady(true);
        });
      }catch(e){setDbReady(true);}
    })();
    return()=>{ if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener); };
  },[user?.uid]);

  const saveToDb=async(newSyllabi)=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      newSyllabi.forEach(syl=>{
        const {topics,...sylData}=syl;
        const topicsObj={};
        topics.forEach(tp=>{topicsObj[tp.id]={title:tp.title,status:tp.status};});
        mod.set(mod.ref(mod.db,`users/${user.uid}/syllabi/${syl.id}`),{...sylData,topics:topicsObj});
      });
    }catch(e){}
  };

  const STATUS={
    "completed":   {label:"Done",       color:"#34d399", bg:"rgba(52,211,153,0.12)"},
    "in-progress": {label:"In Progress",color:"#FFB86B", bg:"rgba(255,184,107,0.12)"},
    "not-started": {label:"Not Started",color:"#666",    bg:"rgba(255,255,255,0.04)"},
  };
  const CYCLE=["not-started","in-progress","completed"];
  const sel=syllabi.find(s=>s.id===selId);
  const getPct=(syl)=>{const done=syl.topics.filter(t=>t.status==="completed").length;return syl.topics.length>0?Math.round((done/syl.topics.length)*100):0;};

  const addSyllabus=()=>{
    if(!newName.trim())return;
    const sc=allSubjects.find(s=>s.n===newSubj)||allSubjects[0];
    const updated=[...syllabi,{id:`syl_${Date.now()}`,name:newName,subj:newSubj,color:sc?.c||"#818cf8",topics:[]}];
    setSyllabi(updated);saveToDb(updated);setNewName("");setShowNew(false);
  };
  const addTopic=(sylId)=>{
    if(!newTopic.trim())return;
    const updated=syllabi.map(s=>s.id===sylId?{...s,topics:[...s.topics,{id:`t_${Date.now()}`,title:newTopic,status:"not-started"}]}:s);
    setSyllabi(updated);saveToDb(updated);setNewTopic("");
  };
  const cycleStatus=(sylId,topicId)=>{
    const updated=syllabi.map(s=>s.id===sylId?{...s,topics:s.topics.map(tt=>tt.id===topicId?{...tt,status:CYCLE[(CYCLE.indexOf(tt.status)+1)%3]}:tt)}:s);
    setSyllabi(updated);saveToDb(updated);
  };
  const deleteTopic=(sylId,topicId)=>{
    const updated=syllabi.map(s=>s.id===sylId?{...s,topics:s.topics.filter(tt=>tt.id!==topicId)}:s);
    setSyllabi(updated);saveToDb(updated);
  };
  const startEditTopic=(topic)=>{setEditTopicId(topic.id);setEditTopicVal(topic.title);};
  const saveEditTopic=(sylId)=>{
    if(!editTopicVal.trim()){setEditTopicId(null);return;}
    const updated=syllabi.map(s=>s.id===sylId?{...s,topics:s.topics.map(tt=>tt.id===editTopicId?{...tt,title:editTopicVal}:tt)}:s);
    setSyllabi(updated);saveToDb(updated);setEditTopicId(null);
  };
  const deleteSyllabus=async(sylId)=>{
    const updated=syllabi.filter(s=>s.id!==sylId);
    setSyllabi(updated);
    if(selId===sylId)setSelId(null);
    if(user?.uid){
      try{const mod=await import("./firebase");await mod.remove(mod.ref(mod.db,`users/${user.uid}/syllabi/${sylId}`));}catch(e){}
    }
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:12}}>
    {!selId?(
      <>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:14,fontWeight:800,color:t.text}}>📋 Syllabus</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>Track topics across subjects</div></div>
          <button onClick={()=>setShowNew(v=>!v)} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:10,padding:"7px 13px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>+ New</button>
        </div>

        {showNew&&<div style={{background:t.card,border:"1px solid rgba(129,140,248,0.25)",borderRadius:12,padding:"13px"}}>
          <div style={{color:t.text,fontWeight:700,fontSize:12,marginBottom:9}}>Create Syllabus</div>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Syllabus name (e.g. Indian Polity)" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:7}}/>
          <select value={newSubj} onChange={e=>setNewSubj(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontFamily:"inherit",marginBottom:9,fontSize:11}}>
            {allSubjects.map(s=><option key={s.n}>{s.n}</option>)}
          </select>
          <div style={{display:"flex",gap:6}}><button onClick={addSyllabus} style={{flex:1,background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:9,padding:"9px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Create</button><button onClick={()=>setShowNew(false)} style={{background:t.pill,border:"none",borderRadius:9,padding:"9px 13px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button></div>
        </div>}

        {syllabi.map(syl=>{const pct=getPct(syl);return(
          <div key={syl.id} onClick={()=>setSelId(syl.id)} style={{background:t.card,border:`1px solid ${syl.color}28`,borderRadius:13,padding:"13px",cursor:"pointer",transition:"all .2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:9}}>
              <div><div style={{color:t.text,fontWeight:800,fontSize:13}}>{syl.name}</div><div style={{color:t.sub,fontSize:10,marginTop:1}}>{syl.subj} · {syl.topics.length} topics</div></div>
              <div style={{textAlign:"right"}}><div style={{color:syl.color,fontWeight:900,fontSize:20,lineHeight:1}}>{pct}%</div><div style={{color:t.muted,fontSize:8}}>complete</div></div>
            </div>
            <div style={{height:5,background:t.pill,borderRadius:3,overflow:"hidden",marginBottom:7}}>
              <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${syl.color},${syl.color}99)`,borderRadius:3,transition:"width .5s ease"}}/>
            </div>
            <div style={{display:"flex",gap:5}}>
              {["completed","in-progress","not-started"].map(st=>{const cnt=syl.topics.filter(t=>t.status===st).length;const s=STATUS[st];return cnt>0&&<div key={st} style={{background:s.bg,color:s.color,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:12}}>{cnt} {s.label}</div>;})}
            </div>
          </div>
        );})}
        {syllabi.length===0&&<div style={{color:t.sub,fontSize:12,textAlign:"center",padding:"30px 0"}}>No syllabi yet. Create your first one!</div>}
      </>
    ):(
      <>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:2}}>
          <button onClick={()=>setSelId(null)} style={{background:t.pill,border:"none",borderRadius:8,padding:"5px 9px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
          <div style={{flex:1}}><div style={{color:t.text,fontWeight:800,fontSize:14}}>{sel?.name}</div><div style={{color:t.sub,fontSize:10}}>{sel?.subj}</div></div>
          <button onClick={()=>deleteSyllabus(sel.id)} style={{background:"rgba(255,107,107,0.12)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:8,padding:"5px 9px",color:"#FF6B6B",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>🗑 Delete</button>
        </div>

        {/* Overall progress */}
        <div style={{background:`${sel?.color}10`,border:`1px solid ${sel?.color}28`,borderRadius:12,padding:"12px 13px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>Progress</div><div style={{color:sel?.color,fontWeight:900,fontSize:20}}>{getPct(sel)}%</div></div>
          <div style={{height:6,background:"rgba(255,255,255,0.07)",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${getPct(sel)}%`,background:`linear-gradient(90deg,${sel?.color},${sel?.color}88)`,borderRadius:3,transition:"width .5s"}}/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            {["completed","in-progress","not-started"].map(st=>{const cnt=sel?.topics.filter(t=>t.status===st).length||0;const s=STATUS[st];return<div key={st} style={{textAlign:"center"}}><div style={{color:s.color,fontWeight:900,fontSize:14}}>{cnt}</div><div style={{color:t.muted,fontSize:8}}>{s.label}</div></div>;})}
          </div>
        </div>

        {/* Topics list */}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {sel?.topics.map(topic=>{const s=STATUS[topic.status];return(
            <div key={topic.id} style={{display:"flex",alignItems:"center",gap:9,background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 11px",transition:"all .2s"}}>
              <button onClick={()=>cycleStatus(sel.id,topic.id)} style={{width:22,height:22,borderRadius:6,flexShrink:0,border:`2px solid ${s.color}`,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:10,transition:"all .2s"}}>
                {topic.status==="completed"?"✓":topic.status==="in-progress"?"…":""}
              </button>
              {editTopicId===topic.id?(
                <input autoFocus value={editTopicVal} onChange={e=>setEditTopicVal(e.target.value)}
                  onBlur={()=>saveEditTopic(sel.id)}
                  onKeyDown={e=>{if(e.key==="Enter")saveEditTopic(sel.id);if(e.key==="Escape")setEditTopicId(null);}}
                  style={{flex:1,background:t.input,border:`1px solid #818cf8`,borderRadius:6,padding:"3px 7px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              ):(
                <div style={{flex:1,color:t.text,fontSize:11,fontWeight:500,textDecoration:topic.status==="completed"?"line-through":"none",opacity:topic.status==="completed"?.55:1}}>{topic.title}</div>
              )}
              <div style={{background:s.bg,color:s.color,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:10,whiteSpace:"nowrap"}}>{s.label}</div>
              <button onClick={()=>startEditTopic(topic)} title="Edit" style={{background:"none",border:"none",color:t.sub,fontSize:11,cursor:"pointer",padding:"0 2px"}}>✏️</button>
              <button onClick={()=>deleteTopic(sel.id,topic.id)} title="Delete" style={{background:"none",border:"none",color:t.muted,fontSize:11,cursor:"pointer",padding:"0 2px"}}>✕</button>
            </div>
          );})}
          {sel?.topics.length===0&&<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"18px 0"}}>No topics yet. Add your first topic!</div>}
        </div>

        {/* Add topic */}
        <div style={{display:"flex",gap:6}}>
          <input value={newTopic} onChange={e=>setNewTopic(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTopic(sel?.id)} placeholder="Add topic…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={()=>addTopic(sel?.id)} style={{background:"#818cf8",border:"none",borderRadius:8,padding:"8px 12px",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+</button>
        </div>

        {/* Legend */}
        <div style={{display:"flex",gap:7,justifyContent:"center",marginTop:2}}>
          {Object.entries(STATUS).map(([k,s])=><div key={k} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:10,borderRadius:3,background:s.bg,border:`1.5px solid ${s.color}`}}/><span style={{color:t.sub,fontSize:9}}>{s.label}</span></div>)}
        </div>
        <div style={{color:t.muted,fontSize:9,textAlign:"center"}}>Tap the status icon to cycle: Not Started → In Progress → Done</div>
      </>
    )}
  </div>);
}

// ── CIRCLE ────────────────────────────────────────────────────
// QR code generator (uses free API, no npm needed)
function QRCode({value,size=140}){
  const url=`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=4`;
  return <img src={url} alt="QR Code" style={{borderRadius:10,display:"block"}}/>;
}

function Circle({t,friends,setFriends,openQR,subjects,customSubjects,isPro,onPro,user,streak}){
  const [tab,setTab]=useState(()=>{
    const pending=sessionStorage.getItem("ss_pendingGroupCode");
    return pending?"groups":"public";
  });
  const [myGroups,setMyGroups]=useState([]);
  const [showCreate,setShowCreate]=useState(false);
  const [grpName,setGrpName]=useState("");
  const [myFriends,setMyFriends]=useState([]);
  const [showAddFriend,setShowAddFriend]=useState(false);
  const [friendCode,setFriendCode]=useState("");
  const [addStatus,setAddStatus]=useState("");
  const [addMsg,setAddMsg]=useState("");
  const [addMemberGrpId,setAddMemberGrpId]=useState(null);
  const [addMemberSel,setAddMemberSel]=useState("");
  const [addMemberStatus,setAddMemberStatus]=useState("");
  const [grpQrId,setGrpQrId]=useState(null); // group id whose QR is shown
  const [joinCode,setJoinCode]=useState(()=>{
    const pending=sessionStorage.getItem("ss_pendingGroupCode");
    if(pending){sessionStorage.removeItem("ss_pendingGroupCode");return pending;}
    return "";
  });
  const [joinStatus,setJoinStatus]=useState("");
  const [joinMsg,setJoinMsg]=useState("");

  const LB=[{name:user?.name||"You",av:(user?.name||"K")[0],h:38,s:streak,r:3},...[{name:"Sneha T.",av:"S",h:48,s:42,r:1},{name:"Priya M.",av:"P",h:42,s:38,r:2},{name:"Arjun S.",av:"A",h:35,s:31,r:4},{name:"Rohit K.",av:"R",h:28,s:25,r:5}]].sort((a,b)=>a.r-b.r);

  // Friend code is stored in RTDB profile — deterministic from uid for backwards compat
  const myFriendCode=user?.uid?`SYNC-${user.uid.slice(0,8).toUpperCase()}`:"SYNC-XXXXXXXX";
  const myInviteLink=`https://studysync-4cvf.vercel.app/join?code=${myFriendCode}`;

  // ── Register profile + friendCode index on login ──
  useEffect(()=>{
    if(!user?.uid)return;
    (async()=>{
      try{
        const mod=await import("./firebase");
        const profileData={
          name:user.name||"",
          email:user.email||"",
          friendCode:myFriendCode,
          uid:user.uid,
          online:true,
          lastSeen:Date.now(),
        };
        // Write to own profile
        await mod.set(mod.ref(mod.db,`users/${user.uid}/profile`),profileData);
        // Write to global friendCodes index — key=friendCode, val=uid
        // This path must be readable by all auth users per Firebase rules
        await mod.set(mod.ref(mod.db,`friendCodes/${myFriendCode}`),{
          uid:user.uid,
          name:user.name||"",
          email:user.email||"",
        });
      }catch(e){console.error("Profile register error",e);}
    })();
  },[user?.uid]);

  // ── Add friend: reads friendCodes index (public read), writes to both users ──
  const addFriendByCode=async()=>{
    const code=friendCode.trim().toUpperCase();
    if(!code||!user?.uid){setAddStatus("error");setAddMsg("Enter a valid code.");return;}
    if(code===myFriendCode){setAddStatus("error");setAddMsg("That's your own code!");return;}
    const alreadyAdded=myFriends.some(f=>f.friendCode===code||f.uid===code);
    if(alreadyAdded){setAddStatus("error");setAddMsg("Already friends!");return;}
    setAddStatus("loading");setAddMsg("Looking up user…");
    try{
      const mod=await import("./firebase");
      // Look up via global friendCodes index (not scanning all users)
      const codeSnap=await new Promise((res,rej)=>{
        mod.onValue(mod.ref(mod.db,`friendCodes/${code}`),(s)=>{res(s);},{onlyOnce:true});
      });
      if(!codeSnap.exists()){
        setAddStatus("error");setAddMsg("Code not found. Ask your friend to open the app first.");return;
      }
      const targetData=codeSnap.val();
      const targetUid=targetData.uid;
      if(!targetUid){setAddStatus("error");setAddMsg("Invalid code data.");return;}

      const now=Date.now();
      const myEntry={uid:targetUid,name:targetData.name||"Friend",email:targetData.email||"",friendCode:code,streak:0,online:false,addedAt:now};
      const theirEntry={uid:user.uid,name:user.name||"",email:user.email||"",friendCode:myFriendCode,streak:0,online:true,addedAt:now};

      // Write A→B under A's node (own write — always permitted)
      await mod.set(mod.ref(mod.db,`users/${user.uid}/friends/${targetUid}`),myEntry);
      // Write B→A under B's node (cross-user write — requires permissive rule on friends path)
      // If this fails due to rules, fall back to friendRequests queue
      try{
        await mod.set(mod.ref(mod.db,`users/${targetUid}/friends/${user.uid}`),theirEntry);
      }catch(crossWriteErr){
        // Fallback: write a friend request that target reads on next login
        await mod.set(mod.ref(mod.db,`friendRequests/${targetUid}/${user.uid}`),theirEntry);
      }
      setFriendCode("");setAddStatus("done");setAddMsg(`✓ ${targetData.name||"Friend"} added!`);
      setTimeout(()=>{setAddStatus("");setAddMsg("");setShowAddFriend(false);},1800);
    }catch(e){
      console.error("addFriend error",e);
      setAddStatus("error");setAddMsg("Something went wrong. Try again.");
    }
  };

  // ── Process incoming friend requests on load ──
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`friendRequests/${user.uid}`);
        dbMod=mod;
        listener=mod.onValue(dbRef,async(snap)=>{
          if(!snap.exists())return;
          const requests=snap.val();
          for(const [fromUid,data] of Object.entries(requests)){
            // Add to my friends list
            await mod.set(mod.ref(mod.db,`users/${user.uid}/friends/${fromUid}`),data);
            // Delete the request
            await mod.remove(mod.ref(mod.db,`friendRequests/${user.uid}/${fromUid}`));
          }
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // RTDB: groups
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/groups`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()){
            const arr=Object.entries(snap.val()).map(([id,g])=>({...g,id,members:g.members?Object.values(g.members):[]}));
            setMyGroups(arr);
          } else setMyGroups([]);
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // RTDB: friends
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/friends`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()) setMyFriends(Object.entries(snap.val()).map(([id,f])=>({...f,id})));
          else setMyFriends([]);
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // ── Add friend with full validation + mutual write ──

  const removeFriend=async(fId)=>{
    if(!user?.uid)return;
    const friend=myFriends.find(f=>f.id===fId);
    try{
      const mod=await import("./firebase");
      await mod.remove(mod.ref(mod.db,`users/${user.uid}/friends/${fId}`));
      // Remove mutual
      if(friend?.uid) await mod.remove(mod.ref(mod.db,`users/${friend.uid}/friends/${user.uid}`));
    }catch(e){}
  };

  // ── Groups ──
  const createGroup=async()=>{
    if(!grpName.trim())return;
    const gid=`grp_${Date.now()}`;
    const rawCode=`GRP-${grpName.slice(0,3).toUpperCase()}-${Math.floor(1000+Math.random()*9000)}`;
    // Store code uppercase, no ambiguity
    const code=rawCode.toUpperCase();
    const joinLink=`https://studysync-4cvf.vercel.app/?joinGroup=${code}`;
    setGrpName("");setShowCreate(false);
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      const groupData={
        id:gid,name:grpName,code,joinLink,
        creatorUid:user.uid,creatorName:user.name||"",
        createdAt:Date.now(),
        members:{m0:user?.name||"You"}
      };
      // Write to creator's user node
      await mod.set(mod.ref(mod.db,`users/${user.uid}/groups/${gid}`),groupData);
      // Write to global groupCodes index — key=code — readable by all auth users
      await mod.set(mod.ref(mod.db,`groupCodes/${code}`),{
        gid,ownerUid:user.uid,name:grpName,code,joinLink,active:true,createdAt:Date.now()
      });
    }catch(e){console.error("createGroup error",e);}
  };

  const deleteGroup=async(gId,gCode)=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      await mod.remove(mod.ref(mod.db,`users/${user.uid}/groups/${gId}`));
      if(gCode) await mod.remove(mod.ref(mod.db,`groupCodes/${gCode}`));
    }catch(e){}
  };

  // Add member from friends dropdown or any name
  const addMemberToGroup=async(gId)=>{
    const memberName=addMemberSel.trim();
    if(!memberName)return;
    setAddMemberStatus("loading");
    try{
      const mod=await import("./firebase");
      const membersRef=mod.ref(mod.db,`users/${user.uid}/groups/${gId}/members`);
      const snap=await new Promise(res=>mod.onValue(membersRef,(s)=>{res(s);},{onlyOnce:true}));
      const existing=snap.exists()?Object.values(snap.val()):[];
      if(existing.includes(memberName)){setAddMemberStatus("exists");setTimeout(()=>setAddMemberStatus(""),1500);return;}
      await mod.set(mod.ref(mod.db,`users/${user.uid}/groups/${gId}/members/m${Date.now()}`),memberName);
      setAddMemberSel("");setAddMemberStatus("done");
      setTimeout(()=>{setAddMemberStatus("");setAddMemberGrpId(null);},1200);
    }catch(e){setAddMemberStatus("error");setTimeout(()=>setAddMemberStatus(""),1500);}
  };

  // ── Join group by code: reads from global groupCodes index ──
  const joinGroupByCode=async()=>{
    const code=joinCode.trim().toUpperCase();
    if(!code){setJoinStatus("error");setJoinMsg("Enter a group code.");return;}
    setJoinStatus("loading");setJoinMsg("Looking up group…");
    try{
      const mod=await import("./firebase");
      // Check not already a member
      const alreadyIn=myGroups.some(g=>g.code===code||g.code===code.toUpperCase());
      if(alreadyIn){setJoinStatus("error");setJoinMsg("You're already in this group.");return;}
      // Look up via global groupCodes index
      const groupSnap=await new Promise((res,rej)=>{
        mod.onValue(mod.ref(mod.db,`groupCodes/${code}`),(s)=>{res(s);},{onlyOnce:true});
      });
      if(!groupSnap.exists()){
        setJoinStatus("error");setJoinMsg("Group not found. Check the code and try again.");return;
      }
      const groupIndex=groupSnap.val();
      if(!groupIndex.active){setJoinStatus("error");setJoinMsg("This group is no longer active.");return;}
      const {gid,ownerUid,name:groupName}=groupIndex;
      const myName=user?.name||"You";
      const memberKey=`m${Date.now()}`;
      // Add yourself to owner's group members
      await mod.set(mod.ref(mod.db,`users/${ownerUid}/groups/${gid}/members/${memberKey}`),myName);
      // Save a copy in your own groups so you can see it
      const myGid=`grp_joined_${Date.now()}`;
      await mod.set(mod.ref(mod.db,`users/${user.uid}/groups/${myGid}`),{
        id:myGid,name:groupName,code,joinLink:groupIndex.joinLink||"",
        joinedAs:"member",ownerUid,createdAt:groupIndex.createdAt||Date.now(),
        members:{[memberKey]:myName}
      });
      setJoinCode("");setJoinStatus("done");setJoinMsg(`✓ Joined "${groupName}"!`);
      setTimeout(()=>{setJoinStatus("");setJoinMsg("");},2000);
    }catch(e){
      console.error("joinGroup error",e);
      setJoinStatus("error");setJoinMsg("Error joining group. Try again.");
    }
  };

  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    {/* Group QR modal */}
    {grpQrId&&(()=>{const g=myGroups.find(x=>x.id===grpQrId);return g?(
      <div style={{position:"fixed",inset:0,zIndex:9800,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={()=>setGrpQrId(null)}>
        <div onClick={e=>e.stopPropagation()} style={{background:t.bg,border:"1px solid rgba(129,140,248,0.25)",borderRadius:18,padding:20,maxWidth:280,width:"100%",textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:14,color:t.text,marginBottom:3}}>{g.name}</div>
          <div style={{color:t.sub,fontSize:10,marginBottom:12}}>Scan to join this group</div>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <QRCode value={g.joinLink||`https://studysync-4cvf.vercel.app/join-group?code=${g.code}`} size={140}/>
          </div>
          <div style={{background:t.pill,borderRadius:8,padding:"7px 10px",marginBottom:10}}>
            <div style={{color:t.muted,fontSize:8,marginBottom:2}}>Group Code</div>
            <div style={{color:"#818cf8",fontFamily:"monospace",fontWeight:900,fontSize:16,letterSpacing:2}}>{g.code}</div>
          </div>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>navigator.clipboard?.writeText(g.joinLink||g.code).catch(()=>{})} style={{flex:1,background:t.pill,border:`1px solid ${t.border}`,borderRadius:9,padding:"8px",color:t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>📋 Copy Link</button>
            <button onClick={()=>setGrpQrId(null)} style={{flex:1,background:"#818cf8",border:"none",borderRadius:9,padding:"8px",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Done</button>
          </div>
        </div>
      </div>
    ):null;})()}

    {/* Tab bar */}
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:24,padding:3,overflowX:"auto"}}>
      {[["public","🌍 Public"],["friends","👥 Friends"],["groups","🏫 Groups"],["live","👁 Live"],["board","🏆 Board"]].map(([tb,l])=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"5px 8px",borderRadius:19,border:"none",cursor:"pointer",fontFamily:"inherit",background:tab===tb?t.a5:t.pill,color:tab===tb?"#fff":t.sub,fontWeight:700,fontSize:9,whiteSpace:"nowrap"}}>{l}</button>)}
    </div>

    {/* PUBLIC */}
    {tab==="public"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
      <div style={{background:"rgba(110,231,247,0.06)",border:"1px solid rgba(110,231,247,0.15)",borderRadius:10,padding:"8px 10px",display:"flex",gap:7,alignItems:"center"}}><div style={{fontSize:13}}>🌍</div><div><div style={{color:t.a2,fontWeight:700,fontSize:11}}>Public Circle</div><div style={{color:t.sub,fontSize:9}}>{PUBLIC_CIRCLE.length} aspirants · Real-time streak board</div></div></div>
      <div style={{background:`${t.a4}10`,border:`1.5px solid ${t.a4}38`,borderRadius:10,padding:"9px 10px",display:"flex",alignItems:"center",gap:8}}>
        <Av c={(user?.name||"K")[0].toUpperCase()} sz={32}/>
        <div style={{flex:1}}><div style={{color:t.text,fontWeight:800,fontSize:12}}>{user?.name||"You"} <span style={{color:t.a4,fontSize:8}}>(You)</span></div><div style={{color:t.sub,fontSize:9}}>📖 Studying</div></div>
        <div style={{color:t.a1,fontWeight:900,fontSize:13}}>🔥 {streak}</div>
      </div>
      {PUBLIC_CIRCLE.map((f,i)=><div key={f.id} style={{display:"flex",alignItems:"center",gap:8,background:t.card,border:`1px solid ${f.studying?t.a3+"28":t.border}`,borderRadius:10,padding:"8px 10px"}}>
        <div style={{fontSize:9,color:t.muted,width:14,textAlign:"center"}}>{i+1}</div>
        <div style={{position:"relative"}}><Av c={f.av} sz={30}/><div style={{position:"absolute",bottom:1,right:1,width:7,height:7,borderRadius:"50%",background:f.studying?t.a3:t.pill,border:`1.5px solid ${t.bg}`}}/></div>
        <div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}</div><div style={{color:t.sub,fontSize:9}}>{f.studying?`📖 ${f.subj}`:"Offline"} · {f.city}</div></div>
        <div style={{color:t.a1,fontWeight:800,fontSize:11}}>🔥 {f.streak}</div>
      </div>)}
    </div>}

    {/* FRIENDS */}
    {tab==="friends"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      {/* My code */}
      <div style={{background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.2)",borderRadius:12,padding:"11px 12px"}}>
        <div style={{color:t.sub,fontSize:9,marginBottom:4,textTransform:"uppercase",letterSpacing:1}}>Your Friend Code</div>
        <div style={{color:"#818cf8",fontFamily:"monospace",fontWeight:900,fontSize:16,letterSpacing:2,marginBottom:7}}>{myFriendCode}</div>
        <div style={{display:"flex",gap:5}}>
          <button onClick={()=>navigator.clipboard?.writeText(myFriendCode).catch(()=>{})} style={{flex:1,background:t.pill,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px",color:t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>📋 Copy Code</button>
          <button onClick={()=>navigator.clipboard?.writeText(myInviteLink).catch(()=>{})} style={{flex:1,background:"rgba(129,140,248,0.12)",border:"1px solid rgba(129,140,248,0.25)",borderRadius:8,padding:"6px",color:"#818cf8",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>🔗 Share Link</button>
        </div>
      </div>

      {/* Add friend */}
      <button onClick={()=>setShowAddFriend(v=>!v)} style={{background:"linear-gradient(135deg,rgba(52,211,153,0.12),rgba(129,140,248,0.07))",border:"1px solid rgba(52,211,153,0.22)",borderRadius:10,padding:"9px 12px",color:"#34d399",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>+ Add Friend</button>
      {showAddFriend&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:11,padding:"11px"}}>
        <div style={{color:t.text,fontWeight:700,fontSize:11,marginBottom:6}}>Add by Friend Code</div>
        <input value={friendCode} onChange={e=>setFriendCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&addFriendByCode()} placeholder="SYNC-XXXXXXXX" style={{width:"100%",background:t.input,border:`1px solid ${addStatus==="error"?"#FF6B6B":addStatus==="done"?"#34d399":t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"monospace",outline:"none",boxSizing:"border-box",marginBottom:addMsg?4:7,letterSpacing:1}}/>
        {addMsg&&<div style={{fontSize:10,color:addStatus==="error"?"#FF6B6B":"#34d399",marginBottom:7,fontWeight:600}}>{addMsg}</div>}
        <div style={{display:"flex",gap:5}}>
          <button onClick={addFriendByCode} disabled={addStatus==="loading"} style={{flex:1,background:addStatus==="done"?"#34d399":addStatus==="error"?"rgba(255,107,107,0.15)":addStatus==="loading"?t.pill:"linear-gradient(135deg,#34d399,#818cf8)",border:addStatus==="error"?"1px solid rgba(255,107,107,0.3)":"none",borderRadius:8,padding:"7px",color:addStatus==="error"?"#FF6B6B":"#fff",fontWeight:800,fontSize:11,cursor:addStatus==="loading"?"not-allowed":"pointer",fontFamily:"inherit",transition:"all .3s"}}>
            {addStatus==="loading"?"Searching…":addStatus==="done"?"✓ Added!":addStatus==="error"?"✗ Try Again":"Add Friend"}
          </button>
          <button onClick={()=>{setShowAddFriend(false);setFriendCode("");setAddStatus("");setAddMsg("");}} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 11px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
        </div>
        <div style={{color:t.muted,fontSize:9,marginTop:7,textAlign:"center"}}>Share your code above so others can add you too</div>
      </div>}

      {myFriends.length===0&&!showAddFriend&&<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"22px 0"}}>No friends yet. Add someone via their code! 👆</div>}
      {myFriends.map(f=><div key={f.id} style={{display:"flex",alignItems:"center",gap:9,background:t.card,border:`1px solid ${f.online?t.a3+"28":t.border}`,borderRadius:11,padding:"10px 12px"}}>
        <div style={{position:"relative"}}><Av c={(f.name||"?")[0]} sz={34}/><div style={{position:"absolute",bottom:1,right:1,width:8,height:8,borderRadius:"50%",background:f.online?t.a3:t.pill,border:`1.5px solid ${t.bg}`}}/></div>
        <div style={{flex:1}}>
          <div style={{color:t.text,fontWeight:700,fontSize:12}}>{f.name||"Friend"}</div>
          <div style={{display:"flex",gap:5,marginTop:2,alignItems:"center"}}>
            <span style={{color:t.a1,fontSize:10}}>🔥 {f.streak||0}</span>
            <span style={{color:f.online?t.a3:t.sub,fontSize:9}}>{f.online?"● Live":"○ Offline"}</span>
          </div>
        </div>
        <button onClick={()=>removeFriend(f.id)} style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:8,padding:"5px 9px",color:"#FF6B6B",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>
      </div>)}
    </div>}

    {/* GROUPS */}
    {tab==="groups"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      <button onClick={()=>setShowCreate(v=>!v)} style={{background:"linear-gradient(135deg,rgba(129,140,248,0.12),rgba(52,211,153,0.07))",border:"1px solid rgba(129,140,248,0.22)",borderRadius:10,padding:"9px 12px",color:"#818cf8",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>+ Create New Group</button>
      {showCreate&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px"}}>
        <div style={{color:t.text,fontWeight:700,fontSize:11,marginBottom:6}}>New Study Group</div>
        <input value={grpName} onChange={e=>setGrpName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createGroup()} placeholder="Group name…" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:6}}/>
        <div style={{display:"flex",gap:5}}><button onClick={createGroup} style={{flex:1,background:"linear-gradient(135deg,#818cf8,#60a5fa)",border:"none",borderRadius:8,padding:"7px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Create</button><button onClick={()=>setShowCreate(false)} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 11px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button></div>
      </div>}

      {/* Join by code */}
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px"}}>
        <div style={{color:t.text,fontWeight:700,fontSize:11,marginBottom:6}}>Join a Group by Code</div>
        <div style={{display:"flex",gap:5}}>
          <input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==="Enter"&&joinGroupByCode()} placeholder="GRP-XXX-0000" style={{flex:1,background:t.input,border:`1px solid ${joinStatus==="error"?"#FF6B6B":joinStatus==="done"?"#34d399":t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"monospace",outline:"none",letterSpacing:1}}/>
          <button onClick={joinGroupByCode} disabled={joinStatus==="loading"} style={{background:joinStatus==="done"?"#34d399":joinStatus==="error"?"rgba(255,107,107,0.15)":"#818cf8",border:joinStatus==="error"?"1px solid rgba(255,107,107,0.3)":"none",borderRadius:8,padding:"7px 11px",color:joinStatus==="error"?"#FF6B6B":"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .3s"}}>
            {joinStatus==="loading"?"…":joinStatus==="done"?"✓":"Join"}
          </button>
        </div>
        {joinMsg&&<div style={{fontSize:10,color:joinStatus==="error"?"#FF6B6B":"#34d399",marginTop:5,fontWeight:600}}>{joinMsg}</div>}
      </div>

      {myGroups.length===0&&!showCreate&&<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"14px 0"}}>No groups yet. Create one above or join via code!</div>}
      {myGroups.map(g=><div key={g.id} style={{background:t.card,border:"1px solid rgba(129,140,248,0.16)",borderRadius:11,padding:"11px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
          <div><div style={{color:t.text,fontWeight:800,fontSize:12}}>{g.name}</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>{g.members.length} member{g.members.length!==1?"s":""}</div></div>
          <div style={{display:"flex",gap:4}}>
            <button onClick={()=>setGrpQrId(g.id)} title="QR Code" style={{background:"rgba(129,140,248,0.1)",border:"1px solid rgba(129,140,248,0.2)",borderRadius:8,padding:"4px 7px",color:"#818cf8",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>QR</button>
            <button onClick={()=>deleteGroup(g.id,g.code)} style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.2)",borderRadius:8,padding:"4px 7px",color:"#FF6B6B",fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
          </div>
        </div>
        <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{g.members.map((m,i)=><div key={i} style={{background:t.pill,borderRadius:12,padding:"2px 7px",fontSize:9,color:t.sub,fontWeight:600}}>{m}</div>)}</div>
        {/* Add member — friends dropdown + free text */}
        {addMemberGrpId===g.id?(
          <div style={{marginBottom:7}}>
            {myFriends.length>0&&<select value={addMemberSel} onChange={e=>setAddMemberSel(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 8px",color:t.text,fontFamily:"inherit",fontSize:10,marginBottom:5,cursor:"pointer"}}>
              <option value="">— Select a friend or type below —</option>
              {myFriends.filter(f=>!g.members.includes(f.name)).map(f=><option key={f.id} value={f.name}>{f.name}</option>)}
            </select>}
            <div style={{display:"flex",gap:5}}>
              <input value={addMemberSel} onChange={e=>setAddMemberSel(e.target.value)} placeholder="Or type any name…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 8px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
              <button onClick={()=>addMemberToGroup(g.id)} style={{background:addMemberStatus==="done"?"#34d399":addMemberStatus==="error"?"#FF6B6B":"#818cf8",border:"none",borderRadius:8,padding:"6px 10px",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .3s"}}>
                {addMemberStatus==="loading"?"…":addMemberStatus==="done"?"✓":addMemberStatus==="error"?"✗":addMemberStatus==="exists"?"Exists!":"Add"}
              </button>
              <button onClick={()=>{setAddMemberGrpId(null);setAddMemberSel("");setAddMemberStatus("");}} style={{background:t.pill,border:"none",borderRadius:8,padding:"6px 8px",color:t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
            </div>
          </div>
        ):(
          <button onClick={()=>{setAddMemberGrpId(g.id);setAddMemberSel("");setAddMemberStatus("");}} style={{width:"100%",background:`${t.a3}10`,border:`1px solid ${t.a3}28`,borderRadius:8,padding:"5px",color:t.a3,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit",marginBottom:7}}>+ Add Member</button>
        )}
        <div style={{display:"flex",alignItems:"center",gap:5,background:t.pill,borderRadius:6,padding:"4px 7px"}}>
          <div style={{color:t.muted,fontSize:9}}>Code:</div>
          <div style={{color:"#818cf8",fontSize:9,fontFamily:"monospace",fontWeight:700,flex:1}}>{g.code}</div>
          <button onClick={()=>setGrpQrId(g.id)} style={{background:"none",border:"none",color:"#818cf8",cursor:"pointer",fontSize:9,fontFamily:"inherit",fontWeight:700}}>QR 📱</button>
          <button onClick={()=>navigator.clipboard?.writeText(g.code).catch(()=>{})} style={{background:"none",border:"none",color:t.sub,cursor:"pointer",fontSize:10,fontFamily:"inherit"}}>📋</button>
        </div>
      </div>)}
    </div>}

    {/* LIVE */}
    {tab==="live"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
      <div style={{background:"rgba(184,255,107,0.06)",border:"1px solid rgba(184,255,107,0.15)",borderRadius:10,padding:"7px 10px",fontSize:9,color:t.a3,fontWeight:700}}>👁 Live — friends currently studying</div>
      {[{id:"me",name:user?.name||"You",av:(user?.name||"K")[0],online:true,subj:"Polity",streak},...myFriends].map(f=><div key={f.id||f.uid} style={{display:"flex",alignItems:"center",gap:8,background:f.online?`${t.a3}07`:t.card,border:`1px solid ${f.online?t.a3+"26":t.border}`,borderRadius:10,padding:"8px 10px"}}>
        <div style={{position:"relative"}}><Av c={(f.name||"?")[0]} sz={30}/><div style={{position:"absolute",bottom:1,right:1,width:7,height:7,borderRadius:"50%",background:f.online?t.a3:t.pill,border:`1.5px solid ${t.bg}`}}/></div>
        <div style={{flex:1}}>
          <div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}{f.id==="me"&&<span style={{color:t.a4,fontSize:8}}> (You)</span>}</div>
          <div style={{color:t.sub,fontSize:9}}>{f.online?`📖 ${f.subj||"Studying"}`:"Offline"}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <span style={{color:t.a1,fontSize:10}}>🔥 {f.streak||0}</span>
          {f.online&&<div style={{background:`${t.a3}18`,color:t.a3,fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:11}}>LIVE</div>}
        </div>
      </div>)}
      {myFriends.length===0&&<div style={{color:t.muted,fontSize:10,textAlign:"center",padding:"12px 0"}}>Add friends to see them here!</div>}
    </div>}

    {/* BOARD */}
    {tab==="board"&&<div style={{display:"flex",flexDirection:"column",gap:5}}>
      <div style={{background:"rgba(255,230,109,0.06)",border:"1px solid rgba(255,230,109,0.15)",borderRadius:10,padding:"7px 10px",fontSize:9,color:t.a4,fontWeight:700}}>🏆 Weekly leaderboard — hours studied this week</div>
      {LB.map(f=><div key={f.name} style={{display:"flex",alignItems:"center",gap:8,background:f.name===(user?.name||"You")?`${t.a4}07`:t.card,border:`1px solid ${f.name===(user?.name||"You")?t.a4+"28":t.border}`,borderRadius:10,padding:"9px 10px"}}>
        <div style={{fontSize:14,width:20,textAlign:"center"}}>{f.r===1?"🥇":f.r===2?"🥈":f.r===3?"🥉":<span style={{color:t.muted,fontSize:10}}>#{f.r}</span>}</div>
        <Av c={f.av} sz={30}/>
        <div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{f.name}{f.name===(user?.name||"You")&&<span style={{color:t.a4,fontSize:8}}> (You)</span>}</div><div style={{color:t.sub,fontSize:9}}>🔥 {f.s} day streak</div></div>
        <div style={{textAlign:"right"}}><div style={{color:t.a2,fontWeight:900,fontSize:13}}>{f.h}h</div><div style={{color:t.muted,fontSize:8}}>this week</div></div>
      </div>)}
    </div>}
  </div>);
}

// ── REPORT ────────────────────────────────────────────────────
function Report({t,es}){
  const [rep,setRep]=useState("");const [ld,setLd]=useState(false);
  const [view,setView]=useState("week");
  const today=new Date();
  const calData=Array.from({length:35},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-34+i);const hrs=[0,0,2.5,0,3,1.5,4,0,2,3.5,0,1,4.5,2,3,0,5,2.5,0,3.5,4,1,2,3,0,4.5,2,3.5,0,2,4,1.5,3,2.5,0][i%35]||0;return{date:d,hrs,label:d.toLocaleDateString("en-IN",{day:"numeric",month:"short"})};});
  const heatColor=(h)=>{if(h===0)return t.pill;if(h<2)return"rgba(129,140,248,0.22)";if(h<3.5)return"rgba(129,140,248,0.52)";return"rgba(129,140,248,0.88)";};
  const totalHrs=SUBJECT_DATA.reduce((a,b)=>a+b.total,0);
  const maxH=Math.max(...SUBJECT_DATA.map(s=>s.total));
  const gen=async()=>{
    setLd(true);setRep("");
    const prompt=`Warm, direct 110-word weekly study coaching report for a ${es.name||"UPSC"} aspirant. Subject hours: ${SUBJECT_DATA.map(s=>`${s.subj}:${s.total}h`).join(", ")}. Total: ${totalHrs}h, Streak: 17 days. Cover: brief summary, strongest subject, weakest (needs more time), one tip, one motivational line. Coach-like tone.`;
    const result=await callAI(prompt,"You are a motivating UPSC study coach. Be concise and actionable.");
    setRep(result);setLd(false);
  };
  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3,alignSelf:"flex-start"}}>
      {[["week","Weekly"],["subjects","Subjects"],["calendar","Calendar"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:19,border:"none",background:view===v?"#818cf8":t.pill,color:view===v?"#fff":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}
    </div>
    {view==="week"&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
      <div style={{fontSize:8,color:t.sub,marginBottom:9,textTransform:"uppercase",letterSpacing:1.5}}>Daily Study Hours — This Week</div>
      <div style={{display:"flex",gap:5,alignItems:"flex-end",height:88}}>
        {SUBJECT_DATA[0].hours.map((_,dayIdx)=>{
          const dayTotal=SUBJECT_DATA.reduce((sum,s)=>sum+s.hours[dayIdx],0);
          const maxDay=Math.max(...SUBJECT_DATA[0].hours.map((_,i)=>SUBJECT_DATA.reduce((s,x)=>s+x.hours[i],0)));
          return(<div key={dayIdx} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{fontSize:7,color:t.a2,fontWeight:700}}>{dayTotal}h</div>
            <div style={{width:"100%",borderRadius:"4px 4px 0 0",height:`${(dayTotal/maxDay)*80}px`,display:"flex",flexDirection:"column-reverse",overflow:"hidden"}}>
              {SUBJECT_DATA.map(s=><div key={s.subj} style={{width:"100%",height:`${(s.hours[dayIdx]/dayTotal)*100}%`,background:s.c,opacity:.82}}/>)}
            </div>
            <div style={{fontSize:7,color:t.sub}}>{DAYS[dayIdx]}</div>
          </div>);
        })}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:8}}>{SUBJECT_DATA.map(s=><div key={s.subj} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:6,height:6,borderRadius:"50%",background:s.c}}/><span style={{color:t.sub,fontSize:8}}>{s.subj}</span></div>)}</div>
    </div>}
    {view==="subjects"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>{[{l:"Total",v:`${totalHrs}h`,c:"#818cf8"},{l:"Best",v:SUBJECT_DATA.reduce((a,b)=>a.total>b.total?a:b).subj.split(" ")[0],c:"#34d399"},{l:"Focus On",v:SUBJECT_DATA.reduce((a,b)=>a.total<b.total?a:b).subj.split(" ")[0],c:t.a1}].map(s=><div key={s.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:11,padding:"9px 5px",textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:t.sub,marginTop:1,textTransform:"uppercase",letterSpacing:.8}}>{s.l}</div></div>)}</div>
      {SUBJECT_DATA.map(s=><div key={s.subj} style={{background:t.card,border:`1px solid ${s.c}20`,borderRadius:11,padding:"10px 11px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{s.subj}</div><div style={{color:s.c,fontWeight:900,fontSize:14}}>{s.total}h</div></div>
        <div style={{display:"flex",gap:3,alignItems:"flex-end",height:26,marginBottom:4}}>
          {s.hours.map((h,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:1}}><div style={{width:"100%",borderRadius:"2px 2px 0 0",height:`${(h/Math.max(...s.hours,.1))*22}px`,background:h>0?s.c:`${s.c}18`}}/><div style={{fontSize:6,color:t.muted}}>{DAYS[i][0]}</div></div>)}
        </div>
        <div style={{height:3,background:t.pill,borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(s.total/maxH)*100}%`,background:s.c,borderRadius:2}}/></div>
        <div style={{color:t.muted,fontSize:8,marginTop:2}}>{((s.total/totalHrs)*100).toFixed(0)}% of total</div>
      </div>)}
    </div>}
    {view==="calendar"&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
      <div style={{fontSize:8,color:t.sub,marginBottom:9,textTransform:"uppercase",letterSpacing:1.5}}>Study Calendar — Last 5 Weeks</div>
      <div style={{display:"flex",gap:5,marginBottom:7}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:7,color:t.muted}}>{d}</div>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {calData.map((d,i)=><div key={i} title={`${d.label}: ${d.hrs}h`} style={{aspectRatio:"1",borderRadius:4,background:heatColor(d.hrs),border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"default"}}>
          {d.hrs>0&&<div style={{fontSize:7,color:d.hrs>=2?"#fff":t.sub,fontWeight:700}}>{d.hrs}</div>}
        </div>)}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,justifyContent:"center"}}>
        <span style={{color:t.muted,fontSize:8}}>Less</span>
        {[0,1,2,3.5,5].map(h=><div key={h} style={{width:11,height:11,borderRadius:3,background:heatColor(h),border:`1px solid ${t.border}`}}/>)}
        <span style={{color:t.muted,fontSize:8}}>More</span>
      </div>
    </div>}
    <div style={{background:"rgba(129,140,248,0.07)",border:"1px solid rgba(129,140,248,0.18)",borderRadius:12,padding:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:rep?9:0}}>
        <div style={{color:"#818cf8",fontWeight:700,fontSize:12}}>✨ AI Coaching Report</div>
        <button onClick={gen} disabled={ld} style={{background:ld?t.pill:"#818cf8",border:"none",borderRadius:8,padding:"5px 11px",color:ld?"#818cf8":"#fff",fontWeight:700,fontSize:10,cursor:ld?"not-allowed":"pointer",fontFamily:"inherit"}}>{ld?"Generating…":"Generate"}</button>
      </div>
      {rep?<div style={{color:t.text,fontSize:11,lineHeight:1.85,marginTop:4}}>{rep}</div>:<div style={{color:t.sub,fontSize:10,fontStyle:"italic",marginTop:4}}>Hit Generate for your personalized AI coaching insight.</div>}
    </div>
  </div>);
}

// ── AI ASSISTANT ──────────────────────────────────────────────
function AI({t,subjects,customSubjects}){
  const allSubjects=[...subjects,...customSubjects];
  const [msgs,setMsgs]=useState([{r:"a",text:"Namaste! 🙏 I'm your AI study assistant. Ask me anything — concepts, PYQs, strategies, or motivation!"}]);
  const [inp,setInp]=useState("");const [ld,setLd]=useState(false);const [subj,setSubj]=useState("General");
  const endRef=useRef();
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);
  const qp=["Explain Article 356","What is fiscal deficit?","UPPCS vs UPSC","Key rivers of India","Motivate me!"];
  const send=async(text)=>{
    const q=text||inp.trim();if(!q)return;setInp("");
    setMsgs(m=>[...m,{r:"u",text:q}]);setLd(true);
    const result=await callAI(q,`You are a friendly, concise UPSC/UPPCS/NDA/CDS/CAPF study assistant. Subject context: ${subj}. Answer in 3-5 sentences. Give mnemonics/examples where helpful.`);
    setMsgs(m=>[...m,{r:"a",text:result}]);setLd(false);
  };
  return(<div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 210px)",minHeight:285}}>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:7}}>{["General",...allSubjects.slice(0,5).map(s=>s.n)].map(s=><button key={s} onClick={()=>setSubj(s)} style={{padding:"2px 7px",borderRadius:12,border:`1.5px solid ${subj===s?"#818cf8":"transparent"}`,background:subj===s?"rgba(129,140,248,0.13)":t.pill,color:subj===s?"#818cf8":t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s}</button>)}</div>
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:7}}>
      {msgs.map((m,i)=><div key={i} style={{display:"flex",flexDirection:m.r==="u"?"row-reverse":"row",gap:4,alignItems:"flex-end"}}>{m.r==="a"&&<div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🤖</div>}<div style={{background:m.r==="u"?"linear-gradient(135deg,#818cf8,#60a5fa)":t.card,border:m.r==="a"?"1px solid rgba(129,140,248,0.14)":"none",color:m.r==="u"?"#fff":t.text,borderRadius:m.r==="u"?"13px 13px 4px 13px":"13px 13px 13px 4px",padding:"8px 10px",fontSize:11,maxWidth:"83%",lineHeight:1.6}}>{m.text}</div></div>)}
      {ld&&<div style={{display:"flex",gap:4,alignItems:"flex-end"}}><div style={{width:22,height:22,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>🤖</div><div style={{background:t.card,border:"1px solid rgba(129,140,248,0.14)",borderRadius:"13px 13px 13px 4px",padding:"8px 11px",display:"flex",gap:3}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:"#818cf8",opacity:.6,animation:`bounce .9s ${i*.15}s infinite`}}/>)}</div></div>}
      <div ref={endRef}/>
    </div>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",margin:"5px 0 4px"}}>{qp.map(q=><button key={q} onClick={()=>send(q)} style={{padding:"2px 7px",borderRadius:12,border:"1px solid rgba(129,140,248,0.18)",background:"rgba(129,140,248,0.05)",color:"#818cf8",fontSize:9,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{q}</button>)}</div>
    <div style={{display:"flex",gap:5}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything…" style={{flex:1,background:t.input,border:"1px solid rgba(129,140,248,0.18)",borderRadius:17,padding:"8px 11px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={()=>send()} disabled={ld||!inp.trim()} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:17,padding:"8px 13px",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,opacity:ld||!inp.trim()?.5:1}}>↑</button></div>
  </div>);
}

// ── NOTES ─────────────────────────────────────────────────────
function Notes({t,subjects,customSubjects}){
  const allSubjects=[...subjects,...customSubjects];
  const [view,setView]=useState("notes");const [ns,setNs]=useState(allSubjects[0]?.n||"History");const [nn,setNn]=useState("");
  const [notes,setNotes]=useState({[allSubjects[0]?.n||"History"]:["Core concepts — add your first note!"],"Polity":["Article 356 — President's Rule when state machinery fails","73rd Amendment — Panchayati Raj, 3-tier system"]});
  const [cards]=useState([{id:1,q:"What is Article 356?",a:"President's Rule — constitutional machinery fails in a state.",subj:subjects.find(s=>s.n==="Polity")?.n||allSubjects[0]?.n||"History"},{id:2,q:"Define Fiscal Deficit",a:"Total expenditure minus total receipts excluding borrowings.",subj:subjects.find(s=>s.n==="Economy")?.n||allSubjects[0]?.n||"History"},{id:3,q:"What is La Niña?",a:"Cooling of Pacific SSTs → above-normal monsoon in India.",subj:subjects.find(s=>s.n==="Geography")?.n||allSubjects[0]?.n||"History"}]);
  const [ci,setCi]=useState(0);const [sa,setSa]=useState(false);
  const card=cards[ci];const cs=allSubjects.find(s=>s.n===card?.subj)||{c:"#818cf8"};
  const addN=()=>{if(!nn.trim())return;setNotes(x=>({...x,[ns]:[...(x[ns]||[]),nn.trim()]}));setNn("");};
  return(<div style={{display:"flex",flexDirection:"column",gap:11}}>
    <div style={{display:"flex",gap:3,background:t.pill,borderRadius:22,padding:3,alignSelf:"flex-start"}}>{[["notes","📝 Notes"],["cards","🃏 Cards"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:18,border:"none",background:view===v?"#818cf8":t.pill,color:view===v?"#fff":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}</div>
    {view==="notes"&&(<><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{allSubjects.map(s=><button key={s.n} onClick={()=>setNs(s.n)} style={{padding:"2px 7px",borderRadius:12,border:`1.5px solid ${ns===s.n?s.c:"transparent"}`,background:ns===s.n?`${s.c}18`:t.pill,color:ns===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s.i||"📌"} {s.n}</button>)}</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>{(notes[ns]||[]).map((note,i)=>{const sc=allSubjects.find(x=>x.n===ns)||{c:"#818cf8"};return<div key={i} style={{background:t.card,border:`1px solid ${sc.c+"18"}`,borderRadius:8,padding:"7px 10px",display:"flex",gap:6}}><div style={{width:4,height:4,borderRadius:"50%",background:sc.c,flexShrink:0,marginTop:4}}/><div style={{color:t.text,fontSize:11,lineHeight:1.6,flex:1}}>{note}</div></div>;})}
      </div>
      <div style={{display:"flex",gap:4}}><input value={nn} onChange={e=>setNn(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addN()} placeholder={`Add note for ${ns}…`} style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={addN} style={{background:"#818cf8",border:"none",borderRadius:8,padding:"7px 11px",color:"#fff",fontWeight:900,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>+</button></div>
    </>)}
    {view==="cards"&&card&&(<><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{color:t.sub,fontSize:10}}>{ci+1}/{cards.length}</div><div style={{color:cs.c,fontSize:10,fontWeight:700,background:`${cs.c}14`,padding:"1px 7px",borderRadius:12}}>{card.subj}</div></div>
      <div style={{display:"flex",gap:2}}>{cards.map((_,i)=><div key={i} style={{flex:1,height:2,borderRadius:2,background:i===ci?(cs.c||"#818cf8"):"rgba(255,255,255,0.07)"}}/>)}</div>
      <div onClick={()=>setSa(v=>!v)} style={{background:t.card,border:`2px solid ${sa?(cs.c||"#818cf8")+"48":t.border}`,borderRadius:15,padding:"20px 15px",minHeight:145,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all .3s"}}>
        <div style={{fontSize:8,color:t.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:9}}>{sa?"ANSWER":"QUESTION — tap to reveal"}</div>
        <div style={{color:t.text,fontSize:13,fontWeight:700,lineHeight:1.6}}>{sa?card.a:card.q}</div>
        {!sa&&<div style={{marginTop:10,fontSize:17,opacity:.2}}>👆</div>}
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
function Profile({t,user,setUser,es,isPro,onPro,streak,stats,onLogout}){
  const days=dl(es.date);
  const badge=getBadge(streak);
  const totalHours=stats?.totalMinutes?`${Math.round(stats.totalMinutes/60)}h`:"0h";
  const totalSessions=stats?.totalSessions||0;
  const [editingName,setEditingName]=useState(false);
  const [nameVal,setNameVal]=useState(user?.name||"");
  const [nameSaving,setNameSaving]=useState(false);
  const [nameSaved,setNameSaved]=useState(false);
  const [deleteStep,setDeleteStep]=useState(0); // 0=none,1=first confirm,2=second confirm,3=deleting
  const [codeCopied,setCodeCopied]=useState(false);

  const saveName=async()=>{
    if(!nameVal.trim()||!user?.uid){setEditingName(false);return;}
    setNameSaving(true);
    try{
      const mod=await import("./firebase");
      await mod.set(mod.ref(mod.db,`users/${user.uid}/profile/name`),nameVal.trim());
      // Also update friendCode index
      await mod.set(mod.ref(mod.db,`users/${user.uid}/profile/displayName`),nameVal.trim());
      setUser(u=>({...u,name:nameVal.trim()}));
      setNameSaved(true);setTimeout(()=>setNameSaved(false),2000);
    }catch(e){}
    setNameSaving(false);setEditingName(false);
  };

  const doDeleteAccount=async()=>{
    setDeleteStep(3);
    try{
      const mod=await import("./firebase");
      const {getAuth}=await import("firebase/auth");
      const auth=getAuth();
      // Soft-delete: mark account deleted, preserve productivity data
      await mod.set(mod.ref(mod.db,`users/${user.uid}/profile/deleted`),true);
      await mod.set(mod.ref(mod.db,`users/${user.uid}/profile/deletedAt`),Date.now());
      // Remove from friends of others
      const friendsSnap=await new Promise(res=>mod.onValue(mod.ref(mod.db,`users/${user.uid}/friends`),(s)=>{res(s);},{onlyOnce:true}));
      if(friendsSnap.exists()){
        Object.keys(friendsSnap.val()).forEach(async(fUid)=>{
          try{await mod.remove(mod.ref(mod.db,`users/${fUid}/friends/${user.uid}`));}catch{}
        });
      }
      // Sign out Firebase auth
      try{await auth.currentUser?.delete();}catch{}
      onLogout();
    }catch(e){setDeleteStep(0);}
  };

  return(<div style={{display:"flex",flexDirection:"column",gap:13}}>
    {/* Delete confirmation modals */}
    {deleteStep===1&&(
      <div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}}>
        <div style={{background:t.bg,border:"1px solid rgba(255,107,107,0.3)",borderRadius:18,padding:22,maxWidth:290,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
          <div style={{color:t.text,fontWeight:800,fontSize:15,marginBottom:6}}>Delete Account?</div>
          <div style={{color:t.sub,fontSize:11,lineHeight:1.6,marginBottom:18}}>Are you sure you want to delete your account? Your productivity data will be preserved.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDeleteStep(0)} style={{flex:1,background:t.pill,border:"none",borderRadius:10,padding:"10px",color:t.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
            <button onClick={()=>setDeleteStep(2)} style={{flex:1,background:"rgba(255,107,107,0.12)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:10,padding:"10px",color:"#FF6B6B",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Continue</button>
          </div>
        </div>
      </div>
    )}
    {deleteStep===2&&(
      <div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}}>
        <div style={{background:t.bg,border:"2px solid rgba(255,107,107,0.4)",borderRadius:18,padding:22,maxWidth:290,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>🗑️</div>
          <div style={{color:"#FF6B6B",fontWeight:900,fontSize:15,marginBottom:6}}>This cannot be undone</div>
          <div style={{color:t.sub,fontSize:11,lineHeight:1.6,marginBottom:18}}>Your account will be permanently deleted. Study logs and session history are retained separately.</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setDeleteStep(0)} style={{flex:1,background:t.pill,border:"none",borderRadius:10,padding:"10px",color:t.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Go Back</button>
            <button onClick={doDeleteAccount} style={{flex:1,background:"linear-gradient(135deg,#FF6B6B,#FF4757)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete Forever</button>
          </div>
        </div>
      </div>
    )}
    {deleteStep===3&&(
      <div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(5px)"}}>
        <div style={{color:t.text,fontSize:13,fontWeight:700}}>Deleting account…</div>
      </div>
    )}

    {/* Avatar + name */}
    <div style={{background:t.card,border:"1px solid rgba(129,140,248,0.14)",borderRadius:15,padding:"15px 13px",textAlign:"center",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",width:130,height:65,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.09),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{width:58,height:58,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",margin:"0 auto 9px",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:22,color:"#fff",boxShadow:"0 0 16px rgba(129,140,248,0.32)",border:"2px solid rgba(129,140,248,0.25)"}}>{(user?.name||user?.email||"U")[0].toUpperCase()}</div>
      {/* Editable name */}
      {editingName?(
        <div style={{display:"flex",gap:5,alignItems:"center",justifyContent:"center",marginBottom:4}}>
          <input autoFocus value={nameVal} onChange={e=>setNameVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveName();if(e.key==="Escape")setEditingName(false);}} style={{background:t.input,border:"1px solid #818cf8",borderRadius:8,padding:"5px 9px",color:t.text,fontSize:14,fontFamily:"inherit",outline:"none",textAlign:"center",maxWidth:180}}/>
          <button onClick={saveName} disabled={nameSaving} style={{background:"#818cf8",border:"none",borderRadius:8,padding:"5px 9px",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{nameSaving?"…":"Save"}</button>
          <button onClick={()=>setEditingName(false)} style={{background:t.pill,border:"none",borderRadius:8,padding:"5px 7px",color:t.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
        </div>
      ):(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginBottom:2}}>
          <div style={{fontSize:17,fontWeight:900,color:nameSaved?"#34d399":t.text,transition:"color .3s"}}>{user?.name||"User"}{nameSaved&&" ✓"}</div>
          <button onClick={()=>{setNameVal(user?.name||"");setEditingName(true);}} style={{background:t.pill,border:"none",borderRadius:6,padding:"2px 6px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎ Edit</button>
        </div>
      )}
      <div style={{color:t.sub,fontSize:11,marginTop:2}}>{user?.email||user?.phone||"Competitive Exam Aspirant"}</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:5,background:`${badge.color}12`,border:`1px solid ${badge.color}28`,borderRadius:20,padding:"4px 12px",marginTop:7}}>
        <span style={{fontSize:14}}>{badge.icon}</span>
        <span style={{color:badge.color,fontWeight:800,fontSize:11}}>{badge.title}</span>
        <span style={{color:t.muted,fontSize:9}}>· {streak}d streak</span>
      </div>
      {isPro?<div style={{display:"flex",justifyContent:"center",marginTop:6}}><div style={{display:"inline-flex",alignItems:"center",gap:3,background:"linear-gradient(135deg,rgba(129,140,248,0.13),rgba(52,211,153,0.13))",border:"1px solid rgba(129,140,248,0.25)",borderRadius:13,padding:"3px 10px"}}><span style={{color:"#818cf8",fontWeight:800,fontSize:10}}>⚡ Premium Member</span></div></div>
      :<button onClick={onPro} style={{display:"inline-flex",alignItems:"center",gap:3,background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:13,padding:"5px 12px",marginTop:6,cursor:"pointer",fontFamily:"inherit"}}><span style={{color:"#fff",fontWeight:800,fontSize:10}}>⚡ Try Free 7 Days</span></button>}
    </div>

    {/* Stats */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>{[{l:"Streak",v:`${streak}🔥`},{l:"Sessions",v:String(totalSessions)},{l:"Hours",v:totalHours},{l:"Rank",v:"#—"}].map(s=><div key={s.l} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 3px",textAlign:"center"}}><div style={{fontSize:14,fontWeight:900,color:t.text}}>{s.v}</div><div style={{fontSize:7,color:t.sub,textTransform:"uppercase",letterSpacing:.8,marginTop:1}}>{s.l}</div></div>)}</div>

    {/* Exam countdown */}
    <div style={{background:t.card,border:`1px solid ${es.color||"#818cf8"}28`,borderRadius:12,padding:"10px 11px",display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:34,height:34,borderRadius:9,background:`${es.color||"#818cf8"}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{es.icon||"🎯"}</div>
      <div style={{flex:1}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{es.name||"UPSC CSE Prelims"}</div><div style={{color:es.color||"#818cf8",fontSize:10,fontWeight:700,marginTop:1}}>{days} days remaining</div></div>
      <div style={{color:es.color||"#818cf8",fontSize:22,fontWeight:900}}>{days}</div>
    </div>

    {/* Logout */}
    <button onClick={onLogout} style={{background:"rgba(255,107,107,0.08)",border:"1px solid rgba(255,107,107,0.22)",borderRadius:12,padding:"11px",color:"#FF6B6B",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
      🚪 Log Out
    </button>

    {/* Delete account */}
    <button onClick={()=>setDeleteStep(1)} style={{background:"none",border:"none",color:t.muted,fontSize:10,cursor:"pointer",fontFamily:"inherit",textAlign:"center",padding:"4px",textDecoration:"underline"}}>
      Delete Account
    </button>
  </div>);
}

// ── NOTIF CENTER ──────────────────────────────────────────────
function NCenter({t,onClose,history,settings,setSettings,test}){
  const list=[{k:"streakBreak",i:"🔥",l:"Streak Break Warning",d:"Alert if not studied by 9 PM"},{k:"studyReminder",i:"📖",l:"Daily Study Reminder",d:"Morning study nudge"},{k:"pomoDone",i:"⏱",l:"Pomodoro Complete",d:"Notify when session ends"},{k:"friendActivity",i:"👥",l:"Friend Activity",d:"When friends start studying"},{k:"leaderboard",i:"🏆",l:"Leaderboard Updates",d:"Weekly rank changes"}];
  return(<div style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 32px"}}>
      <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 12px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:13,fontWeight:800,color:t.text}}>🔔 Notifications</div><button onClick={test} style={{background:`${t.a2}20`,border:`1px solid ${t.a2}40`,borderRadius:8,padding:"4px 10px",color:t.a2,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Test</button></div>
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
  const copy=()=>{navigator.clipboard?.writeText(link).catch(()=>{});setCp(true);setTimeout(()=>setCp(false),2000);};
  const add=()=>{if(!inp.trim())return;setDone(true);setTimeout(()=>{setFriends(f=>[...f,{id:Date.now(),name:"New Friend",av:"N",streak:0,on:false,subj:null,brk:false}]);setInp("");setDone(false);},1200);};
  return(<div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",padding:12,backdropFilter:"blur(6px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bg,border:`1px solid ${t.border}`,borderRadius:18,width:"100%",maxWidth:330,padding:15,boxShadow:t.sh}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}><div style={{fontSize:12,fontWeight:800,color:t.text}}>👥 Add to Circle</div><button onClick={onClose} style={{background:t.pill,border:"none",borderRadius:7,width:25,height:25,cursor:"pointer",color:t.sub,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div>
      <div style={{display:"flex",gap:3,background:t.pill,borderRadius:10,padding:3,marginBottom:12}}>{[["scan","Scan"],["code","Code"],["link","Share"]].map(([tb,l])=><button key={tb} onClick={()=>setTab(tb)} style={{flex:1,padding:"5px 3px",borderRadius:7,border:"none",cursor:"pointer",background:tab===tb?t.card:t.pill,color:tab===tb?t.text:t.sub,fontWeight:700,fontSize:9,fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}</div>
      {tab==="scan"&&<div style={{display:"flex",flexDirection:"column",gap:9}}><div style={{height:130,background:t.pill,borderRadius:12,border:`2px dashed ${t.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:5}}><div style={{fontSize:28}}>📷</div><div style={{color:t.sub,fontSize:10}}>Camera scan (needs Firebase)</div></div><div style={{display:"flex",gap:5}}><input value={inp} onChange={e=>setInp(e.target.value)} placeholder="SYNC-XXXX-0000" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:10,fontFamily:"monospace",outline:"none"}}/><button onClick={add} style={{background:done?"#818cf8":"#60a5fa",border:"none",borderRadius:8,padding:"7px 11px",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:10,transition:"all .3s"}}>{done?"✓":"Add"}</button></div></div>}
      {tab==="code"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:9}}><div style={{fontSize:11,color:t.sub,textAlign:"center"}}>Share this code with friends</div><div style={{background:t.card,border:"1px solid rgba(129,140,248,0.3)",borderRadius:12,padding:"14px 20px",textAlign:"center"}}><div style={{color:"#818cf8",fontSize:20,fontFamily:"monospace",fontWeight:900,letterSpacing:3}}>{code}</div></div><div style={{color:t.muted,fontSize:9,textAlign:"center"}}>Friend enters this code to join your circle</div></div>}
      {tab==="link"&&<div style={{display:"flex",flexDirection:"column",gap:8}}><div style={{background:t.pill,borderRadius:8,padding:"8px 9px",fontSize:9,color:t.sub,fontFamily:"monospace",wordBreak:"break-all",lineHeight:1.5}}>{link}</div><button onClick={copy} style={{background:cp?"#818cf8":t.card,border:`1px solid ${cp?"#818cf8":t.border}`,borderRadius:10,padding:"9px",color:cp?"#fff":t.text,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .3s"}}>{cp?"✓ Copied!":"📋 Copy Invite Link"}</button><div style={{display:"flex",gap:5}}>{[["📲 WhatsApp","#25D366"],["✈️ Telegram","#229ED9"]].map(([l,c])=><button key={l} style={{flex:1,background:`${c}13`,border:`1px solid ${c}30`,borderRadius:8,padding:"6px 4px",color:c,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>)}</div></div>}
    </div>
  </div>);
}

// ── ROOT ──────────────────────────────────────────────────────
export default function App(){
  const [dark,setDark]=useState(true);
  const [loggedIn,setLoggedIn]=useState(false);
  const [user,setUser]=useState(null);
    //added changes for retaining login session
  const [checkingAuth, setCheckingAuth] = useState(true); 
  useEffect(() => {
  const auth = getAuth();

  const unsub = onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser({
  name: user.displayName,
  email: user.email,
  uid: user.uid,
  photoURL: user.photoURL
});
      setLoggedIn(true);
    } else {
      setUser(null);
      setLoggedIn(false);
    }
    setCheckingAuth(false); // 👈 IMPORTANT
  });
return () => unsub();
}, []);

   // changes end 
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
  const [streak,setStreak]=useState(0);
  const [stats,setStats]=useState({totalSessions:0,totalMinutes:0,lastStudyDate:""});

  // Load streak + stats from Firebase on login
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,streakRef,statsRef,streakListener,statsListener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbMod=mod;
        // Streak
        streakRef=mod.ref(mod.db,`users/${user.uid}/streak`);
        streakListener=mod.onValue(streakRef,(snap)=>{
          if(snap.exists()) setStreak(snap.val());
        });
        // Stats
        statsRef=mod.ref(mod.db,`users/${user.uid}/stats`);
        statsListener=mod.onValue(statsRef,(snap)=>{
          if(snap.exists()) setStats(snap.val());
        });
        // Update streak logic: if last study date was yesterday or today, maintain/increment
        const statsSnap=await new Promise(res=>mod.onValue(statsRef,(s)=>{res(s);},{onlyOnce:true}));
        const today=new Date().toISOString().split("T")[0];
        const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
        const streakSnap=await new Promise(res=>mod.onValue(streakRef,(s)=>{res(s);},{onlyOnce:true}));
        const lastStudy=statsSnap.exists()?statsSnap.val().lastStudyDate:"";
        const currentStreak=streakSnap.exists()?streakSnap.val():0;
        // If last study was not today or yesterday, reset streak
        if(lastStudy&&lastStudy!==today&&lastStudy!==yesterday){
          await mod.set(streakRef,0);
        }
      }catch(e){console.error("stats load error",e);}
    })();
    return()=>{
      if(dbMod){
        if(streakRef&&streakListener)dbMod.off(streakRef,streakListener);
        if(statsRef&&statsListener)dbMod.off(statsRef,statsListener);
      }
    };
  },[user?.uid]);
  const [customSubjects,setCustomSubjects]=useState([]);
  const [es,setEs]=useState({key:"UPSC CSE",mode:"Prelims",name:"UPSC CSE Prelims",date:"2026-05-24",color:"#FF6B6B",icon:"🏛️",subjects:EXAMS["UPSC CSE"].modes.Prelims.subjects,tips:EXAMS["UPSC CSE"].modes.Prelims.tips});
  const tid=useRef(0);
  const t=dark?T.dark:T.light;
  const days=dl(es.date);

  const onSessionComplete=useCallback(async()=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      const today=new Date().toISOString().split("T")[0];
      const statsRef=mod.ref(mod.db,`users/${user.uid}/stats`);
      const statsSnap=await new Promise(res=>mod.onValue(statsRef,(s)=>{res(s);},{onlyOnce:true}));
      const prev=statsSnap.exists()?statsSnap.val():{totalSessions:0,totalMinutes:0,lastStudyDate:""};
      const yesterday=new Date(Date.now()-86400000).toISOString().split("T")[0];
      const streakRef=mod.ref(mod.db,`users/${user.uid}/streak`);
      const streakSnap=await new Promise(res=>mod.onValue(streakRef,(s)=>{res(s);},{onlyOnce:true}));
      let currentStreak=streakSnap.exists()?streakSnap.val():0;
      if(prev.lastStudyDate===today){
        // Already studied today, streak stays
      } else if(prev.lastStudyDate===yesterday){
        currentStreak+=1;
        await mod.set(streakRef,currentStreak);
        setStreak(currentStreak);
      } else {
        currentStreak=1;
        await mod.set(streakRef,1);
        setStreak(1);
      }
    }catch(e){console.error("onSessionComplete error",e);}
  },[user?.uid]);

  const push=useCallback((n)=>{const id=++tid.current;const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});const notif={...n,id,time};setToasts(x=>[...x,notif]);setNHist(x=>[...x,notif]);setTimeout(()=>setToasts(x=>x.filter(y=>y.id!==id)),5000);},[]);
  const dismiss=useCallback((id)=>setToasts(x=>x.filter(y=>y.id!==id)),[]);
  const test=()=>push({icon:"🔔",title:"Test notification",body:"Notifications working! 🎉",col:t.a2});

  // Deep-link: ?joinGroup=GRP-XXX-0000
  const [pendingGroupCode,setPendingGroupCode]=useState(()=>{
    const params=new URLSearchParams(window.location.search);
    const c=params.get("joinGroup");
    return c?c.toUpperCase():null;
  });
  useEffect(()=>{
    if(loggedIn&&pendingGroupCode){
      setTab("circle");
      sessionStorage.setItem("ss_pendingGroupCode",pendingGroupCode);
      setPendingGroupCode(null);
    }
  },[loggedIn,pendingGroupCode]);

  useEffect(()=>{
    if(!loggedIn)return;
    const t1=setTimeout(()=>{if(ns.studyReminder)push({icon:"📖",title:`Hello, ${user?.name?.split(" ")[0]||"Aspirant"}!`,body:`${es.name} — ${days} days to go. Start your Pomodoro! 🌅`,col:"#6EE7F7"});},2500);
    const t2=setTimeout(()=>{if(ns.streakBreak)push({icon:"🔥",title:"Streak at risk!",body:`${streak}-day streak on the line! Study now 😬`,col:"#FF6B6B"});},8000);
    return()=>{clearTimeout(t1);clearTimeout(t2);};
  },[loggedIn,ns]);

  // Nav config — free tabs + pro tabs (no revise)
  const FREE=[{id:"timer",icon:"⏱",l:"Timer",c:"#FF6B6B"},{id:"planner",icon:"📅",l:"Planner",c:"#FFB86B"},{id:"streak",icon:"🔥",l:"Streak",c:"#FF6B6B"},{id:"exam",icon:"🎯",l:"Exam",c:es.color||"#818cf8"},{id:"circle",icon:"👥",l:"Circle",c:"#C16BFF"},{id:"report",icon:"📊",l:"Report",c:"#6EE7F7"},{id:"profile",icon:"👤",l:"Me",c:"#818cf8"}];
  const PRO=[{id:"ai",icon:"🤖",l:"AI",c:"#818cf8"},{id:"syllabus",icon:"📋",l:"Syllabus",c:"#34d399"},{id:"notes",icon:"📝",l:"Notes",c:"#6EE7F7"}];
  const proIds=new Set(PRO.map(x=>x.id));
  const go=(id)=>{if(proIds.has(id)&&!isPro){setProOpen(true);return;}setTab(id);};

  if(!loggedIn)return(<div style={{background:t.bg,minHeight:"100vh"}}><style>{`*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style><Login t={t} onLogin={u=>{setUser(u);setLoggedIn(true);push({icon:"🎁",title:"7-Day Free Trial Started!",body:"Full premium access — enjoy StudySync! 🎉",col:"#34d399"});}}/></div>);

  return(<div style={{minHeight:"100vh",background:t.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:t.text,transition:"background .3s"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}select option{background:${t.bg};}@keyframes slideIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}`}</style>

    <Toasts notifs={toasts} dismiss={dismiss} t={t}/>
    {nOpen&&<NCenter t={t} onClose={()=>setNOpen(false)} history={nHist} settings={ns} setSettings={setNs} test={test}/>}
    {qrOpen&&<QRModal t={t} user={user} onClose={()=>setQrOpen(false)} setFriends={setFriends}/>}
    {exOpen&&<ExamSetup t={t} es={es} setEs={setEs} onClose={()=>setExOpen(false)} customSubjects={customSubjects} setCustomSubjects={setCustomSubjects}/>}
    {proOpen&&<PricingModal t={t} onClose={()=>setProOpen(false)} isRestore={false} onUpgrade={()=>{setIsPro(true);push({icon:"⚡",title:"Welcome to Premium! 🎉",body:"All features unlocked!",col:"#818cf8"});}} onRestore={()=>{}}/>}
    {restoreOpen&&<PricingModal t={t} onClose={()=>setRestoreOpen(false)} isRestore={true} onUpgrade={()=>{}} onRestore={()=>{setStreak(s=>s+1);push({icon:"🔥",title:"Streak Restored! 🎉",body:`You're back to ${streak+1} days!`,col:"#FF6B6B"});}}/>}

    {/* Header */}
    <div style={{position:"sticky",top:0,zIndex:100,background:t.nav,backdropFilter:"blur(18px)",borderBottom:`1px solid ${t.border}`,padding:"7px 11px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <Logo sz={26}/>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{fontSize:13,fontWeight:900,letterSpacing:-.3,background:"linear-gradient(135deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>StudySync</div>
              {isPro?<div style={{background:"linear-gradient(135deg,#818cf8,#34d399)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#fff"}}>PRO</div>:<div style={{background:"rgba(52,211,153,0.16)",border:"1px solid rgba(52,211,153,0.28)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#34d399"}}>7D FREE</div>}
            </div>
            <button onClick={()=>setExOpen(true)} style={{display:"flex",alignItems:"center",gap:3,background:"none",border:"none",cursor:"pointer",padding:0,marginTop:1}}>
              <div style={{width:4,height:4,borderRadius:"50%",background:es.color,boxShadow:`0 0 3px ${es.color}`,flexShrink:0}}/>
              <span style={{fontSize:8,color:t.sub,fontWeight:600}}>{es.name}{days!==null&&<span style={{color:es.color,fontWeight:700}}> · {days}d</span>}</span>
              <span style={{fontSize:7,color:t.muted}}>✎</span>
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          <button onClick={()=>setDark(v=>!v)} style={{background:t.pill,border:`1px solid ${t.border}`,borderRadius:13,padding:"4px 7px",cursor:"pointer",fontFamily:"inherit",fontSize:11,color:t.text}}>{dark?"☀️":"🌙"}</button>
          <button onClick={()=>setNOpen(true)} style={{position:"relative",background:t.pill,border:`1px solid ${t.border}`,borderRadius:13,padding:"4px 7px",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center"}}>🔔{nHist.length>0&&<div style={{position:"absolute",top:-3,right:-3,background:t.a1,color:"#fff",borderRadius:"50%",width:11,height:11,fontSize:6,fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center",border:`1.5px solid ${t.bg}`}}>{Math.min(nHist.length,9)}</div>}</button>
          {!isPro&&<button onClick={()=>setProOpen(true)} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:13,padding:"4px 8px",cursor:"pointer",fontFamily:"inherit",fontSize:8,color:"#fff",fontWeight:800,boxShadow:"0 0 7px rgba(129,140,248,0.25)"}}>⚡ Pro</button>}
          <div onClick={()=>go("profile")} style={{width:27,height:27,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:"#fff",cursor:"pointer",border:"1.5px solid rgba(129,140,248,0.25)"}}>{(user?.name||"K")[0].toUpperCase()}</div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div style={{maxWidth:520,margin:"0 auto",padding:"14px 11px 116px"}}>
      {tab==="timer"   &&<Pomo      t={t} subjects={es.subjects} customSubjects={customSubjects} pushN={push} ns={ns} isPro={isPro} user={user} onSessionComplete={onSessionComplete}/>}
      {tab==="planner" &&<Planner   t={t} subjects={es.subjects} customSubjects={customSubjects}/>}
      {tab==="streak"  &&<Streak    t={t} pushN={push} ns={ns} onRestore={()=>setRestoreOpen(true)} streak={streak} isPro={isPro}/>}
      {tab==="exam"    &&<ExamDash  t={t} es={es} onOpen={()=>setExOpen(true)} customSubjects={customSubjects}/>}
      {tab==="circle"  &&<Circle    t={t} friends={friends} setFriends={setFriends} openQR={()=>setQrOpen(true)} subjects={es.subjects} customSubjects={customSubjects} isPro={isPro} onPro={()=>setProOpen(true)} user={user} streak={streak}/>}
      {tab==="report"  &&<Report    t={t} es={es}/>}
      {tab==="profile" &&<Profile   t={t} user={user} setUser={setUser} es={es} isPro={isPro} onPro={()=>setProOpen(true)} streak={streak} stats={stats} onLogout={()=>{setLoggedIn(false);setUser(null);}}/>}
      {tab==="ai"      &&(isPro?<AI       t={t} subjects={es.subjects} customSubjects={customSubjects}/>:<Gate t={t} name="AI Study Assistant" icon="🤖" onPro={()=>setProOpen(true)}/>)}
      {tab==="syllabus"&&(isPro?<Syllabus t={t} subjects={es.subjects} customSubjects={customSubjects} user={user}/>:<Gate t={t} name="Syllabus Manager"    icon="📋" onPro={()=>setProOpen(true)}/>)}
      {tab==="notes"   &&(isPro?<Notes    t={t} subjects={es.subjects} customSubjects={customSubjects}/>:<Gate t={t} name="Notes & Flashcards"  icon="📝" onPro={()=>setProOpen(true)}/>)}
    </div>

    {/* Nav */}
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:t.nav,backdropFilter:"blur(20px)",borderTop:`1px solid ${t.border}`,zIndex:100,padding:"5px 0 14px"}}>
      {/* Pro row */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:2,paddingBottom:4,borderBottom:`1px solid ${t.border}`,marginBottom:3}}>
        {PRO.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",alignItems:"center",gap:2,background:active?`${tb.c}16`:"none",border:active?`1px solid ${tb.c}38`:"1px solid transparent",cursor:"pointer",padding:"3px 10px",borderRadius:13,position:"relative"}}>
            <div style={{fontSize:11,filter:active?"none":!isPro?"grayscale(1) opacity(.22)":"opacity(.38)"}}>{tb.icon}</div>
            <div style={{fontSize:8,fontWeight:active?800:600,color:active?tb.c:t.muted,letterSpacing:.3}}>{tb.l}</div>
            {!isPro&&<div style={{position:"absolute",top:-1,right:3,fontSize:6,color:"#818cf8",fontWeight:900}}>⚡</div>}
          </button>
        );})}
        {!isPro&&<button onClick={()=>setProOpen(true)} style={{display:"flex",alignItems:"center",gap:2,background:"linear-gradient(135deg,rgba(129,140,248,0.12),rgba(52,211,153,0.07))",border:"1px solid rgba(129,140,248,0.2)",borderRadius:13,padding:"3px 9px",cursor:"pointer",fontFamily:"inherit",marginLeft:3}}>
          <span style={{fontSize:8,color:"#818cf8",fontWeight:800}}>⚡ Try Free</span>
        </button>}
      </div>
      {/* Free row */}
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {FREE.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",cursor:"pointer",color:active?tb.c:t.muted,transition:"all .2s",padding:"2px 4px"}}>
            <div style={{fontSize:15,filter:active?"none":"grayscale(1) opacity(.33)",transform:active?"scale(1.1)":"scale(1)",transition:"all .2s"}}>{tb.icon}</div>
            <div style={{fontSize:7,fontWeight:active?800:500,letterSpacing:.5,textTransform:"uppercase"}}>{tb.l}</div>
            {active&&<div style={{width:3,height:3,borderRadius:"50%",background:tb.c}}/>}
          </button>
        );})}
      </div>
    </div>
  </div>);
}

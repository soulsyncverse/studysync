import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  "UPPCS":    { icon:"🏔️", color:"#6EE7F7", modes: { "Prelims": { date:"2026-12-15", subjects:[{n:"History",c:"#FF6B6B",i:"📜",w:15},{n:"UP History",c:"#FFB86B",i:"🕌",w:10},{n:"Geography",c:"#6EE7F7",i:"🗺️",w:10},{n:"UP Geography",c:"#B8FF6B",i:"🌄",w:10},{n:"Polity",c:"#C16BFF",i:"⚖️",w:15},{n:"Economy",c:"#FFE66D",i:"📈",w:10},{n:"UP Economy",c:"#6BFFC1",i:"🏭",w:10},{n:"Cur. Affairs",c:"#FF8B94",i:"📰",w:20}], tips:["Focus on UP-specific topics","UP Budget & ODOP scheme","Solve UPPCS PYQs last 10 years","Include UP state news","GS Paper II qualifying — 33%"] }, "Mains": { date:"2027-03-01", subjects:[{n:"General Hindi",c:"#FF6B6B",i:"📝",w:20},{n:"Essay",c:"#FFB86B",i:"✍️",w:15},{n:"GS I",c:"#6EE7F7",i:"📜",w:15},{n:"GS II",c:"#B8FF6B",i:"⚖️",w:15},{n:"GS III",c:"#FFE66D",i:"📈",w:15},{n:"GS IV Ethics",c:"#818cf8",i:"💎",w:10},
{n:"GS Paper 5",c:"#6BFFC1",i:"📚",w:10},
{n:"GS Paper 6",c:"#FF8B94",i:"📘",w:10}], tips:["Hindi paper is scoring","UP schemes: ODOP","Answer in Hindi for bonus","Read UP govt portal","Focus on UP Budget"] } } },
  "CAPF":     { icon:"🛡️", color:"#B8FF6B", modes: { "Paper I": { date:"2026-08-10", subjects:[{n:"General Ability",c:"#B8FF6B",i:"🧠",w:25},{n:"General Science",c:"#6EE7F7",i:"🔬",w:20},{n:"Current Events",c:"#FFE66D",i:"📰",w:20},{n:"Indian Polity",c:"#FF6B6B",i:"⚖️",w:20},{n:"History & Culture",c:"#FFB86B",i:"📜",w:15}], tips:["Physical test + academics","General Science is key","Know security forces roles","Focus on defence news","Previous year papers"] }, "Paper II": { date:"2026-08-10", subjects:[{n:"Essay",c:"#B8FF6B",i:"✍️",w:40},{n:"Comprehension",c:"#6EE7F7",i:"📖",w:30},{n:"Précis Writing",c:"#FFB86B",i:"✂️",w:30}], tips:["Essay writing daily","Précis: 1/3rd of original","Read passage twice"] } } },
  "NDA/CDS":  { icon:"⭐", color:"#FFB86B", modes: { "NDA": { date:"2026-09-14", subjects:[{n:"Mathematics",c:"#FFB86B",i:"🔢",w:50},{n:"General Ability",c:"#6EE7F7",i:"🧠",w:50}], tips:["Maths is scoring — master it","English in GAT important","NCERT Physics/Chemistry","Start SSB prep now","Physical fitness matters"] }, "CDS": { date:"2026-11-09", subjects:[{n:"English",c:"#FF8B94",i:"🔤",w:33},{n:"General Knowledge",c:"#6EE7F7",i:"🌍",w:33},{n:"Elementary Maths",c:"#FFB86B",i:"🔢",w:34}], tips:["English grammar is key","GK: defence + current affairs","Maths: Class 10 level","SSB mock interviews","Physical fitness"] } } },
  "SSC CGL":    { icon:"📋", color:"#6BFFC1", modes: { "Tier I": { date:"2026-09-01", subjects:[{n:"General Intelligence",c:"#6BFFC1",i:"🧩",w:25},{n:"General Awareness",c:"#FFE66D",i:"🌍",w:25},{n:"Quantitative Aptitude",c:"#FFB86B",i:"🔢",w:25},{n:"English Comprehension",c:"#FF8B94",i:"🔤",w:25}], tips:["Tier I is qualifying — target 160+","Quant: practice 30 questions daily","English: vocab + reading comprehension","GK: static + current affairs mix","Solve last 5 years PYQs"] }, "Tier II": { date:"2026-12-10", subjects:[{n:"Quant (Paper I)",c:"#FFB86B",i:"🔢",w:30},{n:"English (Paper I)",c:"#FF8B94",i:"🔤",w:30},{n:"Statistics (Paper II)",c:"#6BFFC1",i:"📊",w:20},{n:"Finance & Economics",c:"#6EE7F7",i:"📈",w:20}], tips:["Quant + English are mandatory for all","Statistics only for JSO post","Finance/Economics for AAO post","Focus Paper I — highest weightage","Time management is critical"] } } },
  "RBI Grade B": { icon:"🏦", color:"#818cf8", modes: { "Phase I": { date:"2026-10-15", subjects:[{n:"General Awareness",c:"#FFE66D",i:"🌍",w:40},{n:"Reasoning",c:"#818cf8",i:"🧠",w:30},{n:"Quantitative Aptitude",c:"#FFB86B",i:"🔢",w:15},{n:"English",c:"#FF8B94",i:"🔤",w:15}], tips:["GA carries highest marks — 80 Qs","Focus on RBI circulars & monetary policy","Reasoning: 60 Qs in 45 mins — speed","Last 6 months banking current affairs","Solve RBI Grade B PYQs religiously"] }, "Phase II": { date:"2026-11-20", subjects:[{n:"Economic & Social Issues",c:"#6EE7F7",i:"📊",w:50},{n:"Finance & Management",c:"#818cf8",i:"💰",w:50},{n:"English Writing",c:"#FF8B94",i:"✍️",w:0}], tips:["ESI: Indian economy + social schemes","FM: RBI functions + Basel norms","Write 3 descriptive answers daily","Read RBI Annual Report thoroughly","Economic Survey is must-read"] }, "Interview": { date:"2027-01-15", subjects:[{n:"Current Affairs",c:"#FFE66D",i:"📰",w:30},{n:"Banking Awareness",c:"#818cf8",i:"🏦",w:40},{n:"Subject Knowledge",c:"#6EE7F7",i:"📚",w:30}], tips:["Know RBI's role & functions deeply","Practice mock interviews","Stay updated on monetary policy","Confidence + clarity over speed","Know your graduation subject well"] } } },
  "EPFO EO/AO": { icon:"🏢", color:"#FF8B94", modes: { "Exam": { date:"2026-11-01", subjects:[{n:"General English",c:"#FF8B94",i:"🔤",w:20},{n:"General Awareness",c:"#FFE66D",i:"🌍",w:25},{n:"Quantitative Aptitude",c:"#FFB86B",i:"🔢",w:20},{n:"Reasoning",c:"#6BFFC1",i:"🧩",w:20},{n:"Labour Laws & Social Security",c:"#818cf8",i:"⚖️",w:15}], tips:["Labour Laws: EPF Act, ESI Act, Gratuity Act","Industrial Relations is a key topic","Social Security schemes — memorise","GK: focus on Labour Ministry news","Quant: SSC CGL level difficulty"] } } },
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


const SUBJECT_DATA=[
  {subj:"Polity",     c:"#B8FF6B",hours:[1.5,0,2,1,2.5,0,1],  total:8},
  {subj:"History",    c:"#FF6B6B",hours:[2,1,1.5,0,1.5,1,1.5],total:8.5},
  {subj:"Economy",    c:"#FFB86B",hours:[1,1.5,2,2,2,1,1],    total:10.5},
  {subj:"Geography",  c:"#6EE7F7",hours:[1,0.5,1,1,1,0.5,1],  total:6},
  {subj:"Cur. Affairs",c:"#FFE66D",hours:[1,1,1,1,1,1,1.5],   total:7.5},
];
const DAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
// CHAIN removed — streak calendar now built dynamically from real session data
const COLS=["#FF6B6B","#6EE7F7","#B8FF6B","#FFB86B","#C16BFF","#FFE66D","#6BFFC1","#FF8B94","#818cf8","#34d399"];

// ── HELPERS ───────────────────────────────────────────────────
function pad(n){return String(n).padStart(2,"0");}
function dl(date){
  if(!date)return null;
  // Use IST date for accurate countdown
  const now=new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Kolkata"}));
  const target=new Date(date+"T00:00:00");
  const diff=Math.ceil((target-now)/86400000);
  return Math.max(0,diff);
}
function istDateString(offsetDays=0){
  const d=new Date(Date.now()+offsetDays*86400000);
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(d);
  const get=type=>parts.find(p=>p.type===type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
const DEFAULT_EXAM_KEY="UPSC CSE";
const DEFAULT_EXAM_MODE="Prelims";
function validExamKey(key,customExamIds=[]){if(EXAMS[key])return key;if(customExamIds.includes(key))return key;return DEFAULT_EXAM_KEY;}
function defaultModeFor(key,customExamIds=[]){if(EXAMS[key])return Object.keys(EXAMS[key].modes)[0]||DEFAULT_EXAM_MODE;if(customExamIds.includes(key))return"Exam";return DEFAULT_EXAM_MODE;}
function validExamMode(key,mode,customExamIds=[]){if(EXAMS[key]?.modes?.[mode])return mode;return defaultModeFor(key,customExamIds);}
function buildExamState(key=DEFAULT_EXAM_KEY,mode=DEFAULT_EXAM_MODE,examDates={},examTips={},customExamList=[]){
  const customExamIds=customExamList.map(c=>c.id);
  const isCustom=customExamIds.includes(key);
  if(isCustom){
    const cx=customExamList.find(c=>c.id===key)||{name:key,id:key};
    return{key,mode:"Exam",name:cx.name,date:getExamDate(examDates,key,"Exam"),color:"#C16BFF",icon:"🎯",subjects:[],tips:[]};
  }
  const exam=EXAMS[key]?key:DEFAULT_EXAM_KEY;
  const md=EXAMS[exam]?.modes?.[mode]?mode:(Object.keys(EXAMS[exam]?.modes||{})[0]||DEFAULT_EXAM_MODE);
  const examDef=EXAMS[exam];const modeDef=examDef.modes[md];
  return{key:exam,mode:md,name:`${exam} ${md}`,date:getExamDate(examDates,exam,md),color:examDef.color,icon:examDef.icon,subjects:modeDef.subjects,tips:getExamTips(examTips,exam,md)};
}
function dbKey(key){return String(key).replace(/[.#$\/\[\]]/g,ch=>({".":"%2E","#":"%23","$":"%24","/":"%2F","[":"%5B","]":"%5D"}[ch]));}
function decodeDbKey(key){return String(key).replace(/%2E/g,".").replace(/%23/g,"#").replace(/%24/g,"$").replace(/%2F/g,"/").replace(/%5B/g,"[").replace(/%5D/g,"]");}
function normalizeExamDates(raw){
  const out={};
  Object.entries(raw||{}).forEach(([examKey,modes])=>{
    const key=decodeDbKey(examKey);
    if(!EXAMS[key]||!modes||typeof modes!=="object")return;
    Object.entries(modes).forEach(([modeKey,value])=>{
      const mode=decodeDbKey(modeKey);
      if(!EXAMS[key]?.modes?.[mode])return;
      const date=typeof value==="string"?value:value?.date;
      if(typeof date==="string")out[key]={...(out[key]||{}),[mode]:date};
    });
  });
  return out;
}
function normalizeExamTips(raw){
  const out={};
  Object.entries(raw||{}).forEach(([examKey,modes])=>{
    const key=decodeDbKey(examKey);
    if(!EXAMS[key]||!modes||typeof modes!=="object")return;
    Object.entries(modes).forEach(([modeKey,value])=>{
      const mode=decodeDbKey(modeKey);
      if(!EXAMS[key]?.modes?.[mode])return;
      const tips=Array.isArray(value)?value:value?.tips;
      if(Array.isArray(tips))out[key]={...(out[key]||{}),[mode]:tips};
    });
  });
  return out;
}
function getExamDate(examDates,key,mode){
  const exam=validExamKey(key);
  const md=validExamMode(exam,mode);
  return examDates?.[exam]?.[md]||EXAMS[exam]?.modes?.[md]?.date||"";
}
function getExamTips(examTips,key,mode){
  const exam=validExamKey(key);
  const md=validExamMode(exam,mode);
  return examTips?.[exam]?.[md]||EXAMS[exam]?.modes?.[md]?.tips||[];
}
async function saveExamDateToDb(uid,key,mode,date){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.set(mod.ref(mod.db,`users/${uid}/examDates/${dbKey(key)}/${dbKey(mode)}`),date||"");
}
async function saveExamTipsToDb(uid,key,mode,tips){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.set(mod.ref(mod.db,`users/${uid}/examTips/${dbKey(key)}/${dbKey(mode)}`),tips||[]);
}
async function saveExamSelectionToDb(uid,key,mode){
  if(!uid)return;
  const mod=await import("./firebase");
  // Store key as-is — custom exam IDs (cx_xxx) must not be validated against EXAMS
  await mod.set(mod.ref(mod.db,`users/${uid}/examSelection`),{key:key||DEFAULT_EXAM_KEY,mode:mode||DEFAULT_EXAM_MODE});
}
async function saveCustomSubjectsToDb(uid,subjects){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.set(mod.ref(mod.db,`users/${uid}/customSubjects`),subjects.length?subjects:[]);
}
async function saveExamSubjectsToDb(uid,key,mode,subjects){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.set(mod.ref(mod.db,`users/${uid}/examSubjects/${dbKey(key)}/${dbKey(mode)}`),subjects.length?subjects:[]);
}
async function deleteCustomExamFromDb(uid,examId){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.remove(mod.ref(mod.db,`users/${uid}/customExams/${examId}`));
}
async function saveCustomExamToDb(uid,examId,data){
  if(!uid)return;
  const mod=await import("./firebase");
  await mod.set(mod.ref(mod.db,`users/${uid}/customExams/${examId}`),data);
}
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
function ExamSetup({t,es,setEs,onClose,examSubjects,setExamSubjects,customExams,setCustomExams,examDates,setExamDates,examTips,setExamTips,user}){
  const [ex,setEx]=useState(es.key||DEFAULT_EXAM_KEY);
  const [md,setMd]=useState(es.mode||DEFAULT_EXAM_MODE);
  const [dt,setDt]=useState(()=>getExamDate(examDates,es.key,es.mode));
  const [ns,setNs]=useState("");const [nc,setNc]=useState("#818cf8");
  const [editIdx,setEditIdx]=useState(null);const [editVal,setEditVal]=useState("");
  const [showCustom,setShowCustom]=useState(false);
  // Custom exam management
  const [showNewCustom,setShowNewCustom]=useState(false);
  const [newCustomName,setNewCustomName]=useState("");
  const [editCustomId,setEditCustomId]=useState(null);
  const [editCustomName,setEditCustomName]=useState("");
  const [deleteConfirmId,setDeleteConfirmId]=useState(null);

  const uid=user?.uid||window.__ssUser?.uid;

  // Is currently selected exam a custom one?
  const isCustomExam=customExams.some(c=>c.id===ex);
  const cfg=EXAMS[ex]||(isCustomExam?{icon:"🎯",color:"#C16BFF",modes:{Exam:{date:"",subjects:[],tips:[]}}}:null);
  
  const effectiveMode = isCustomExam ? "Exam" : md;
  const currentCustomSubjs = examSubjects[ex]?.[effectiveMode] || [];
  
  const modeData=isCustomExam?{date:getExamDate(examDates,ex,"Exam"),subjects:currentCustomSubjs,tips:[]}:cfg?.modes[md];
  const modes=isCustomExam?["Exam"]:Object.keys(cfg?.modes||{});
  const subjs=isCustomExam?currentCustomSubjs:(modeData?.subjects||[]);
  const selectedTips=isCustomExam?[]:(getExamTips(examTips,ex,md));
  useEffect(()=>{setDt(getExamDate(examDates,ex,isCustomExam?"Exam":md));},[examDates,ex,md,isCustomExam]);

  const apply=()=>{
    const chosenDate=dt||modeData?.date||"";
    const color=isCustomExam?"#C16BFF":(cfg?.color||"#818cf8");
    const icon=isCustomExam?"🎯":(cfg?.icon||"🎯");
    // es.subjects contains ONLY built-in subjects — custom subjects live in examSubjects state
    // This prevents leakage when switching exams
    const builtInOnly=isCustomExam?[]:(modeData?.subjects||[]);
    const customName=customExams.find(c=>c.id===ex)?.name||ex;
    const newEs={key:ex,mode:effectiveMode,name:isCustomExam?customName:`${ex} ${effectiveMode}`,date:chosenDate,color,icon,subjects:builtInOnly,tips:selectedTips};
    setEs(newEs);
    setExamDates(p=>({...p,[ex]:{...(p?.[ex]||{}),[effectiveMode]:chosenDate}}));
    if(uid){
      Promise.all([
        saveExamDateToDb(uid,ex,effectiveMode,chosenDate),
        saveExamSelectionToDb(uid,ex,effectiveMode),
      ]).catch(()=>{});
    }
    onClose();
  };

 // Custom subjects — isolated to current exam/mode, Firebase-persisted
  const addCustom=()=>{
    const name=ns.trim();
    if(!name)return;
    const isDupe=currentCustomSubjs.some(s=>s.n.toLowerCase()===name.toLowerCase());
    if(isDupe){setNs("");return;}
    const updated=[...currentCustomSubjs,{n:name,c:nc,i:"📚",w:0,custom:true}];
    setExamSubjects(p=>({...p, [ex]: {...(p[ex]||{}), [effectiveMode]: updated}}));
    if(uid)saveExamSubjectsToDb(uid, ex, effectiveMode, updated);
    setNs("");
  };
  const delCustom=(i)=>{
    const updated=currentCustomSubjs.filter((_,j)=>j!==i);
    setExamSubjects(p=>({...p, [ex]: {...(p[ex]||{}), [effectiveMode]: updated}}));
    if(uid)saveExamSubjectsToDb(uid, ex, effectiveMode, updated);
  };
  const startEdit=(i,v)=>{setEditIdx(i);setEditVal(v);};
  const saveEdit=(i)=>{
    const name=editVal.trim();
    if(!name){setEditIdx(null);return;}
    const isDupe=currentCustomSubjs.some((s,j)=>j!==i&&s.n.toLowerCase()===name.toLowerCase());
    if(isDupe){setEditIdx(null);return;}
    const updated=currentCustomSubjs.map((s,j)=>j===i?{...s,n:name}:s);
    setExamSubjects(p=>({...p, [ex]: {...(p[ex]||{}), [effectiveMode]: updated}}));
    if(uid)saveExamSubjectsToDb(uid, ex, effectiveMode, updated);
    setEditIdx(null);
  };

  // Multi custom exams
  const createCustomExam=()=>{
    const name=newCustomName.trim();
    if(!name)return;
    const isDupe=customExams.some(c=>c.name.toLowerCase()===name.toLowerCase());
    if(isDupe){setNewCustomName("");return;}
    const id=`cx_${Date.now()}`;
    const data={id,name,date:"",createdAt:Date.now()};
    const updated=[...customExams,data];
    setCustomExams(updated);
    if(uid)saveCustomExamToDb(uid,id,data);
    setNewCustomName("");setShowNewCustom(false);
    setEx(id);setMd("Exam");setDt("");
  };
  const startEditCustom=(id,name)=>{setEditCustomId(id);setEditCustomName(name);};
  const saveEditCustom=(id)=>{
    const name=editCustomName.trim();
    if(!name){setEditCustomId(null);return;}
    const updated=customExams.map(c=>c.id===id?{...c,name}:c);
    setCustomExams(updated);
    if(uid){
      const exam=updated.find(c=>c.id===id);
      saveCustomExamToDb(uid,id,exam);
    }
    // If currently selected, update es name
    if(ex===id)setEs(p=>({...p,name}));
    setEditCustomId(null);
  };
  const confirmDeleteCustom=(id)=>setDeleteConfirmId(id);
  const doDeleteCustom=(id)=>{
    const updated=customExams.filter(c=>c.id!==id);
    setCustomExams(updated);
    if(uid)deleteCustomExamFromDb(uid,id);
    // Also remove its dates
    setExamDates(p=>{const n={...p};delete n[id];return n;});
    if(ex===id){setEx(DEFAULT_EXAM_KEY);setMd(DEFAULT_EXAM_MODE);}
    setDeleteConfirmId(null);
  };

  return(
    <div style={{position:"fixed",inset:0,zIndex:9000,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:540,maxHeight:"90vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 34px"}}>
        <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 11px"}}/>
        <div style={{fontSize:14,fontWeight:800,color:t.text,marginBottom:1}}>🎯 Set Your Exam</div>
        <div style={{color:t.sub,fontSize:10,marginBottom:12}}>Choose exam & mode — subjects auto-load</div>

        {/* Delete confirmation */}
        {deleteConfirmId&&(
          <div style={{background:"rgba(255,107,107,0.1)",border:"1px solid rgba(255,107,107,0.3)",borderRadius:12,padding:"12px",marginBottom:10,textAlign:"center"}}>
            <div style={{color:t.text,fontWeight:700,fontSize:12,marginBottom:8}}>Delete this custom exam?</div>
            <div style={{display:"flex",gap:7}}>
              <button onClick={()=>setDeleteConfirmId(null)} style={{flex:1,background:t.pill,border:"none",borderRadius:8,padding:"8px",color:t.text,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              <button onClick={()=>doDeleteCustom(deleteConfirmId)} style={{flex:1,background:"linear-gradient(135deg,#FF6B6B,#FF4757)",border:"none",borderRadius:8,padding:"8px",color:"#fff",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
            </div>
          </div>
        )}

        {/* Built-in exams */}
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Built-in Exams</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:12}}>
          {Object.entries(EXAMS).filter(([k])=>k!=="Custom").map(([k,v])=>(
            <button key={k} onClick={()=>{const first=Object.keys(v.modes)[0];setEx(k);setMd(first);setDt(getExamDate(examDates,k,first));}} style={{display:"flex",alignItems:"center",gap:9,background:ex===k?`${v.color}15`:t.card,border:`1.5px solid ${ex===k?v.color:t.border}`,borderRadius:11,padding:"9px 11px",cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
              <span style={{fontSize:17}}>{v.icon}</span>
              <div style={{flex:1,textAlign:"left"}}><div style={{color:t.text,fontWeight:700,fontSize:12}}>{k}</div></div>
              {ex===k&&<div style={{width:6,height:6,borderRadius:"50%",background:v.color,boxShadow:`0 0 4px ${v.color}`}}/>}
            </button>
          ))}
        </div>

        {/* Custom exams section */}
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>My Custom Exams</div>
        <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:8}}>
          {customExams.map(c=>(
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:7,background:ex===c.id?"rgba(193,107,255,0.12)":t.card,border:`1.5px solid ${ex===c.id?"#C16BFF":t.border}`,borderRadius:11,padding:"7px 10px",transition:"all .2s"}}>
              {editCustomId===c.id?(
                <input autoFocus value={editCustomName} onChange={e=>setEditCustomName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEditCustom(c.id);if(e.key==="Escape")setEditCustomId(null);}} style={{flex:1,background:t.input,border:`1px solid #C16BFF`,borderRadius:7,padding:"5px 8px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              ):(
                <button onClick={()=>{setEx(c.id);setMd("Exam");setDt(getExamDate(examDates,c.id,"Exam"));}} style={{flex:1,background:"none",border:"none",textAlign:"left",cursor:"pointer",fontFamily:"inherit"}}>
                  <span style={{fontSize:15}}>🎯</span> <span style={{color:t.text,fontWeight:700,fontSize:12,marginLeft:5}}>{c.name}</span>
                </button>
              )}
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                {editCustomId===c.id?(
                  <button onClick={()=>saveEditCustom(c.id)} style={{background:"#34d399",border:"none",borderRadius:6,padding:"3px 8px",color:"#0a0a0f",fontWeight:800,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                ):(
                  <button onClick={()=>startEditCustom(c.id,c.name)} style={{background:t.pill,border:"none",borderRadius:6,padding:"3px 7px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                )}
                <button onClick={()=>confirmDeleteCustom(c.id)} style={{background:"rgba(255,107,107,0.12)",border:"none",borderRadius:6,padding:"3px 7px",color:"#FF6B6B",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
              </div>
              {ex===c.id&&editCustomId!==c.id&&<div style={{width:6,height:6,borderRadius:"50%",background:"#C16BFF",flexShrink:0}}/>}
            </div>
          ))}
          {/* New custom exam */}
          {showNewCustom?(
            <div style={{display:"flex",gap:5}}>
              <input autoFocus value={newCustomName} onChange={e=>setNewCustomName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")createCustomExam();if(e.key==="Escape")setShowNewCustom(false);}} placeholder="Exam name e.g. SSC JE, Mock Test…" style={{flex:1,background:t.input,border:"1px solid #C16BFF",borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              <button onClick={createCustomExam} style={{background:"#C16BFF",border:"none",borderRadius:8,padding:"7px 11px",color:"#fff",fontWeight:900,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>+</button>
              <button onClick={()=>setShowNewCustom(false)} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 9px",color:t.sub,fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:11}}>✕</button>
            </div>
          ):(
            <button onClick={()=>setShowNewCustom(true)} style={{background:"rgba(193,107,255,0.1)",border:"1.5px dashed rgba(193,107,255,0.4)",borderRadius:11,padding:"8px",color:"#C16BFF",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>+ New Custom Exam</button>
          )}
        </div>

        {/* Mode selector */}
        {modes.length>1&&<div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Mode</div>
          <div style={{display:"flex",gap:5}}>{modes.map(m=><button key={m} onClick={()=>{setMd(m);setDt(getExamDate(examDates,ex,m));}} style={{flex:1,padding:"8px 4px",borderRadius:10,border:`1.5px solid ${md===m?(cfg?.color||"#818cf8"):t.border}`,background:md===m?`${cfg?.color||"#818cf8"}14`:t.card,cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all .2s"}}><div style={{color:t.text,fontWeight:700,fontSize:11}}>{m}</div><div style={{color:t.sub,fontSize:8,marginTop:1}}>{(()=>{const d=dl(getExamDate(examDates,ex,m));return d!=null?d+"d left":"Set date";})()}</div></button>)}</div>
        </div>}

        {/* Date */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:5}}>Exam Date</div>
          <input type="date" value={dt} onChange={e=>setDt(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 10px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light",boxSizing:"border-box"}}/>
        </div>

        {/* Default subjects preview */}
        {!isCustomExam&&subjs.length>0&&<div style={{marginBottom:10}}>
          <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>Subjects ({subjs.length} auto-loaded)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{subjs.map(s=><div key={s.n} style={{background:`${s.c}20`,color:s.c,border:`1px solid ${s.c}44`,borderRadius:13,padding:"2px 7px",fontSize:9,fontWeight:700}}>{s.i} {s.n}</div>)}</div>
        </div>}

        {/* Custom subjects */}
        <div style={{background:t.card,border:`1px solid ${showCustom?"#818cf8":t.border}40`,borderRadius:12,padding:"11px",marginBottom:12,transition:"border .2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:showCustom?10:0}}>
            <div><div style={{color:t.text,fontWeight:700,fontSize:12}}>📌 Custom Subjects</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>Add your own subjects to any exam · {currentCustomSubjs.length} saved</div></div>
            <button onClick={()=>setShowCustom(v=>!v)} style={{background:showCustom?"#818cf8":t.pill,border:"none",borderRadius:8,padding:"4px 9px",color:showCustom?"#fff":t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{showCustom?"Done":"Manage"}</button>
          </div>
          {showCustom&&(<>
            {currentCustomSubjs.length>0&&<div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:9}}>
              {currentCustomSubjs.map((s,i)=>(
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
            <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:7}}>{COLS.map(c=><div key={c} onClick={()=>setNc(c)} style={{width:16,height:16,borderRadius:"50%",background:c,cursor:"pointer",border:nc===c?"2.5px solid white":"2px solid transparent",transition:"all .2s"}}/>)}</div>
            <div style={{display:"flex",gap:5}}>
              <input value={ns} onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Subject name…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              <button onClick={addCustom} style={{background:nc,border:"none",borderRadius:8,padding:"7px 11px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>+</button>
            </div>
            {currentCustomSubjs.length===0&&<div style={{color:t.muted,fontSize:9,marginTop:7,textAlign:"center"}}>No custom subjects yet. Add your first one!</div>}
          </>)}
        </div>

        <button onClick={apply} style={{width:"100%",background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:12,padding:"11px",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer",fontFamily:"inherit",boxShadow:"0 0 16px rgba(129,140,248,0.28)"}}>
          {isCustomExam?"🎯":cfg?.icon} Set {isCustomExam?customExams.find(c=>c.id===ex)?.name:ex} — {isCustomExam?"Exam":md} ✓
        </button>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────
function Login({t,onLogin}){
  const [loading,setLoading]=useState(false);
  return(
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:"-15%",left:"50%",transform:"translateX(-50%)",width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle,rgba(129,140,248,0.07),transparent 70%)",pointerEvents:"none"}}/>
      <div style={{textAlign:"center",marginBottom:26}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:10}}><div style={{padding:12,borderRadius:18,background:"rgba(129,140,248,0.08)",border:"1px solid rgba(129,140,248,0.16)",boxShadow:"0 0 26px rgba(129,140,248,0.09)"}}><Logo sz={46}/></div></div>
        <div style={{fontSize:24,fontWeight:900,letterSpacing:-1,background:"linear-gradient(135deg,#818cf8,#60a5fa,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>StudySync</div>
        <div style={{color:t.sub,fontSize:12,marginTop:4}}>Your study companion</div>
      </div>
      <div style={{width:"100%",maxWidth:320,background:t.card,border:`1px solid ${t.border}`,borderRadius:18,padding:18,boxShadow:t.sh}}>
        <div style={{textAlign:"center",marginBottom:13}}>
          <div style={{fontSize:13,fontWeight:800,color:t.text}}>Sign in to StudySync</div>
          <div style={{fontSize:10,color:t.sub,marginTop:2}}>🇮🇳 Proudly built in India for aspirants who show up every day.</div>
          <div style={{fontSize:9,color:t.muted,marginTop:3}}>Plan better. Study deeper. Stay consistent.</div>
        </div>
        <div style={{background:"rgba(52,211,153,0.07)",border:"1px solid rgba(52,211,153,0.22)",borderRadius:10,padding:"8px 10px",marginBottom:11,display:"flex",gap:7,alignItems:"center"}}>
          <span style={{fontSize:16}}>🎁</span>
          <div><div style={{color:"#34d399",fontWeight:800,fontSize:11}}>7-Day Free Trial</div><div style={{color:t.sub,fontSize:9,marginTop:1}}>Full premium access — no card needed</div></div>
        </div>
        <button onClick={async()=>{setLoading(true);const {user,error}=await signInGoogle();if(user)onLogin(user);else{setLoading(false);alert(error||"Login failed");}}} disabled={loading} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:9,background:loading?t.pill:"linear-gradient(135deg,rgba(129,140,248,0.11),rgba(96,165,250,0.11))",border:"1px solid rgba(129,140,248,0.22)",borderRadius:12,padding:"11px",cursor:"pointer",fontFamily:"inherit",transition:"all .25s"}}>
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.3 30.2 0 24 0 14.7 0 6.8 5.5 3 13.5l7.9 6.1C12.8 13.4 17.9 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/><path fill="#FBBC05" d="M10.9 28.4A14.5 14.5 0 0 1 9.5 24c0-1.5.3-3 .8-4.4L2.4 13.5A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.4-6.2z"/><path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2.1 1.4-4.7 2.3-7.7 2.3-6.1 0-11.2-4-13.1-9.5l-8 6.2C6.7 42.5 14.7 48 24 48z"/></svg>
          <span style={{color:t.text,fontWeight:700,fontSize:12}}>{loading?"Signing in…":"Continue with Google"}</span>
        </button>
        <div style={{color:t.muted,fontSize:9,textAlign:"center",marginTop:10,lineHeight:1.6}}>Free for students · No ads · Made for India ❤️</div>
      </div>
    </div>
  );
}

// ── POMODORO (Feature 2 — presets 25/45/60, free max 60, pro max 150) ─
function Pomo({t,subjects,customSubjects,pushN,ns,isPro,user,onSessionComplete,
  pomoMode,setPomoMode,pomoCf,setPomoCf,pomoSec,setPomoSec,pomoRun,setPomoRun,pomoSess,setPomoSess,pomoCs,setPomoCs}){
  const allSubjects=[...subjects,...customSubjects];
  const [pf,setPf]=useState(pomoCf);
  const [show,setShow]=useState(false);
  const ref=useRef();
  const maxMin=isPro?150:60;
  const PRESETS=[25,45,60,...(isPro?[90,120,150]:[])];
  const dur={focus:pomoCf,short:5,long:15};
  const tot=dur[pomoMode]*60;
  const prog=((tot-pomoSec)/tot)*100;
  const sc=allSubjects.find(s=>s.n===pomoCs)?.c||t.a2;
  const circ=2*Math.PI*86;const dash=circ-(prog/100)*circ;

  // Set default subject on first load
  useEffect(()=>{if(!pomoCs&&allSubjects.length>0)setPomoCs(allSubjects[0].n);},[allSubjects.length]);

  // Sounds handled at App level

  // Session saving handled at App level to avoid stale closure issues

  // Timer interval lives in App-level useEffect (never unmounts on tab switch)
  // Pomo reads/controls state via props only — no interval here

  const sw=(m,cm)=>{setPomoMode(m);setPomoSec((cm??dur[m])*60);setPomoRun(false);};
  const applyDur=(v)=>{const val=Math.min(v,maxMin);setPomoCf(val);setPf(val);sw("focus",val);setShow(false);localStorage.setItem("ss_pomo_dur",String(val));};
  const fmtTime=(m)=>m>=60?`${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}`:m+"m";
  return(<div className="ss-pomo-layout" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:15,width:"100%",maxWidth:620,margin:"0 auto"}}>
    <div className="ss-pomo-modes" style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3}}>{[["focus","Focus"],["short","Short Brk"],["long","Long Brk"]].map(([m,l])=><button key={m} onClick={()=>sw(m)} style={{padding:"6px 11px",borderRadius:20,border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,background:pomoMode===m?sc:t.pill,color:pomoMode===m?"#0a0a0f":t.sub,transition:"all .2s"}}>{l}</button>)}</div>
    <div className="ss-pomo-ring" style={{position:"relative",width:196,height:196}}>
      <svg width={196} height={196} style={{transform:"rotate(-90deg)"}}><circle cx={98} cy={98} r={86} fill="none" stroke={t.border} strokeWidth={9}/><circle cx={98} cy={98} r={86} fill="none" stroke={sc} strokeWidth={9} strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .3s"}}/></svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
        <div style={{fontSize:44,fontWeight:900,color:t.text,letterSpacing:-2,lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{pad(Math.floor(pomoSec/60))}:{pad(pomoSec%60)}</div>
        <div style={{fontSize:9,color:t.sub,textTransform:"uppercase",letterSpacing:2,fontWeight:600}}>{pomoMode==="focus"?"FOCUS":pomoMode==="short"?"SHORT":"LONG"}</div>
        <div style={{fontSize:9,color:sc,fontWeight:700,marginTop:1}}>{fmtTime(pomoCf)}</div>
      </div>
    </div>
    {/* Timer settings */}
    <div className="ss-pomo-settings" style={{background:t.card,border:`1px solid ${show?sc+"44":t.border}`,borderRadius:14,padding:"10px 14px",width:"100%",maxWidth:350,transition:"border .3s"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:show?10:0}}>
        <span style={{color:t.sub,fontSize:11,fontWeight:600}}>⚙️ Timer — {fmtTime(pomoCf)}</span>
        <button onClick={()=>setShow(v=>!v)} style={{background:t.pill,border:"none",borderRadius:14,padding:"3px 8px",color:t.text,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{show?"Done":"Customize"}</button>
      </div>
      {show&&(<div style={{display:"flex",flexDirection:"column",gap:8}}>
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1}}>Presets</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>{PRESETS.map(v=><button key={v} onClick={()=>applyDur(v)} style={{padding:"6px 11px",borderRadius:9,border:`1.5px solid ${pomoCf===v?sc:t.border}`,background:pomoCf===v?`${sc}20`:t.pill,color:pomoCf===v?sc:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{fmtTime(v)}</button>)}</div>
        <div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1}}>Custom — max {fmtTime(maxMin)}{!isPro&&<span style={{color:"#818cf8"}}> · Pro gets 2h30m</span>}</div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:t.sub,fontSize:11}}>Duration</span><span style={{color:sc,fontWeight:900,fontSize:17}}>{fmtTime(pf)}</span></div>
        <input type="range" min={5} max={maxMin} step={5} value={pf} onChange={e=>setPf(Number(e.target.value))} style={{width:"100%",accentColor:sc,cursor:"pointer"}}/>
        <button onClick={()=>applyDur(pf)} style={{background:sc,border:"none",borderRadius:9,padding:"8px",color:"#0a0a0f",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Apply {fmtTime(pf)} Timer</button>
      </div>)}
    </div>

    <div className="ss-pomo-controls" style={{display:"flex",gap:8,alignItems:"center"}}>
      <button onClick={()=>{setPomoSec(dur[pomoMode]*60);setPomoRun(false);}} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Reset</button>
      <button onClick={()=>setPomoRun(r=>!r)} style={{background:pomoRun?t.card:sc,border:pomoRun?`1.5px solid ${t.border}`:"none",color:pomoRun?t.text:"#0a0a0f",borderRadius:14,padding:"11px 32px",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"inherit",transition:"all .25s",boxShadow:pomoRun?"none":`0 0 20px ${sc}55`}}>{pomoRun?"⏸ Pause":"▶ Start"}</button>
      <button onClick={()=>sw(pomoMode==="focus"?"short":"focus")} style={{background:t.pill,border:"none",color:t.sub,borderRadius:9,padding:"7px 11px",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600}}>Skip</button>
    </div>
    <div className="ss-pomo-stats" style={{display:"flex",gap:17}}>{[{l:"Sessions",v:pomoSess,c:sc},{l:"Focus Time",v:`${Math.floor(pomoSess*pomoCf/60)}h${(pomoSess*pomoCf)%60}m`,c:t.text}].map(s=><div key={s.l} style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:8,color:t.sub,textTransform:"uppercase",letterSpacing:1,marginTop:1}}>{s.l}</div></div>)}</div>
    {/* Subject pills */}
    <div className="ss-pomo-subjects" style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"center",maxWidth:390}}>
      {allSubjects.slice(0,10).map(s=><button key={s.n} onClick={()=>setPomoCs(s.n)} style={{padding:"3px 9px",borderRadius:15,border:`1.5px solid ${pomoCs===s.n?s.c:"transparent"}`,background:pomoCs===s.n?`${s.c}20`:t.pill,color:pomoCs===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{s.i||"📌"} {s.n}</button>)}
    </div>
  </div>);
}

function Planner({t,subjects,customSubjects,user}){
  const allSubjects=[...subjects,...customSubjects];
  const [view,setView]=useState("daily");
  const [tasks,setTasks]=useState([]);
  const [nt,setNt]=useState("");const [ns2,setNs2]=useState(allSubjects[0]?.n||"History");
  const [ntStart,setNtStart]=useState("");const [ntEnd,setNtEnd]=useState("");
  const [editId,setEditId]=useState(null);const [editVal,setEditVal]=useState("");
  const [delConfirm,setDelConfirm]=useState(null);
  const today=new Date();
  const todayStr=today.toISOString().split("T")[0];
  const days7=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay()+i);return d;});

  // Load tasks from Firebase
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/planner`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()) setTasks(Object.entries(snap.val()).map(([id,v])=>({...v,id})));
          else setTasks([]);
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  const saveTask=async(task)=>{
    if(!user?.uid)return;
    try{const mod=await import("./firebase");await mod.set(mod.ref(mod.db,`users/${user.uid}/planner/${task.id}`),task);}catch(e){}
  };
  const removeTask=async(id)=>{
    if(!user?.uid)return;
    try{const mod=await import("./firebase");await mod.remove(mod.ref(mod.db,`users/${user.uid}/planner/${id}`));}catch(e){}
  };

  const tog=id=>{const updated=tasks.map(x=>x.id===id?{...x,done:!x.done}:x);setTasks(updated);const task=updated.find(x=>x.id===id);if(task)saveTask(task);};
  const add=()=>{
    if(!nt.trim())return;
    const task={id:`t_${Date.now()}`,text:nt,subj:ns2,done:false,time:"12:00",startDate:ntStart||todayStr,endDate:ntEnd||""};
    setTasks(p=>[...p,task]);saveTask(task);setNt("");setNtStart("");setNtEnd("");
  };
  const startEdit=(task)=>{setEditId(task.id);setEditVal(task.text);};
  const saveEdit=(id)=>{const updated=tasks.map(x=>x.id===id?{...x,text:editVal}:x);setTasks(updated);const task=updated.find(x=>x.id===id);if(task)saveTask(task);setEditId(null);};
  const confirmDel=(id)=>setDelConfirm(id);
  const doDel=(id)=>{setTasks(tasks.filter(x=>x.id!==id));removeTask(id);setDelConfirm(null);};

  const daysLeft=(endDate)=>{if(!endDate)return null;const diff=Math.ceil((new Date(endDate)-new Date(todayStr))/(86400000));return diff;};
  const deadlineStatus=(endDate)=>{if(!endDate)return null;const d=daysLeft(endDate);if(d<0)return{label:"Overdue",color:"#FF6B6B"};if(d===0)return{label:"Due today",color:"#FFB86B"};if(d<=3)return{label:`${d}d left`,color:"#FFB86B"};return{label:`${d}d left`,color:"#34d399"};};

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:11}}>
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
    {view==="weekly"&&<div style={{display:"flex",gap:3}}>{days7.map((d,i)=><div key={i} style={{flex:1,background:i===today.getDay()?`${t.a4}15`:t.card,border:`1px solid ${i===today.getDay()?t.a4+"44":t.border}`,borderRadius:8,padding:"6px 3px",textAlign:"center"}}><div style={{fontSize:7,color:t.sub,marginBottom:1}}>{["Su","Mo","Tu","We","Th","Fr","Sa"][d.getDay()]}</div><div style={{fontSize:13,fontWeight:800,color:i===today.getDay()?t.a4:t.text}}>{d.getDate()}</div></div>)}</div>}
    {view==="monthly"&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:10}}><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:t.sub,fontWeight:700,padding:"2px 0"}}>{d}</div>)}{Array.from({length:31},(_,i)=>i+1).map(d=><div key={d} style={{textAlign:"center",padding:"4px 1px",borderRadius:5,fontSize:9,background:d===today.getDate()?`${t.a4}18`:"transparent",color:d===today.getDate()?t.a4:d<today.getDate()?t.muted:t.sub}}>{d}</div>)}</div></div>}

    {/* Add task with start/end dates */}
    <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:11,padding:10,display:"flex",flexDirection:"column",gap:7}}>
      <div style={{display:"flex",gap:5}}>
        <input value={nt} onChange={e=>setNt(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder="Add a task…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
        <select value={ns2} onChange={e=>setNs2(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 5px",color:t.text,fontFamily:"inherit",cursor:"pointer",fontSize:9,maxWidth:90}}>{allSubjects.map(s=><option key={s.n}>{s.n}</option>)}</select>
      </div>
      <div style={{display:"flex",gap:5,alignItems:"center"}}>
        <div style={{flex:1}}><div style={{color:t.sub,fontSize:9,marginBottom:3,fontWeight:600}}>Start Date</div><input type="date" value={ntStart} onChange={e=>setNtStart(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 7px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light"}}/></div>
        <div style={{flex:1}}><div style={{color:t.sub,fontSize:9,marginBottom:3,fontWeight:600}}>End / Deadline</div><input type="date" value={ntEnd} onChange={e=>setNtEnd(e.target.value)} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 7px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light"}}/></div>
        <button onClick={add} style={{background:t.a3,border:"none",borderRadius:8,padding:"10px 14px",color:"#0a0a0f",fontWeight:900,cursor:"pointer",fontSize:14,fontFamily:"inherit",alignSelf:"flex-end"}}>+</button>
      </div>
    </div>

    {/* Task list */}
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {tasks.map(task=>{
        const s=allSubjects.find(s=>s.n===task.subj)||{c:"#818cf8"};
        const ds=deadlineStatus(task.endDate);
        return(
          <div key={task.id} style={{background:task.done?t.pill:t.card,border:`1px solid ${task.done?t.border:s.c+"28"}`,borderRadius:10,padding:"9px 10px",transition:"all .2s"}}>
            {editId===task.id?(
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <input value={editVal} onChange={e=>setEditVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveEdit(task.id);if(e.key==="Escape")setEditId(null);}} autoFocus style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={()=>saveEdit(task.id)} style={{background:"#34d399",border:"none",borderRadius:7,padding:"6px 10px",color:"#0a0a0f",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                <button onClick={()=>setEditId(null)} style={{background:t.pill,border:"none",borderRadius:7,padding:"6px 8px",color:t.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
              </div>
            ):(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div onClick={()=>tog(task.id)} style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:`2px solid ${task.done?s.c:"rgba(150,150,150,.3)"}`,background:task.done?s.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>{task.done&&<span style={{color:"#0a0a0f",fontSize:8,fontWeight:900}}>✓</span>}</div>
                  <div onClick={()=>tog(task.id)} style={{flex:1,color:task.done?t.sub:t.text,fontSize:11,textDecoration:task.done?"line-through":"none",cursor:"pointer"}}>{task.text}</div>
                  <div style={{background:`${s.c}18`,color:s.c,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:12}}>{task.subj}</div>
                  {ds&&!task.done&&<div style={{background:`${ds.color}15`,color:ds.color,fontSize:8,fontWeight:700,padding:"2px 6px",borderRadius:12,whiteSpace:"nowrap"}}>{ds.label}</div>}
                  <div style={{display:"flex",gap:3}}>
                    <button onClick={()=>startEdit(task)} style={{background:t.pill,border:"none",borderRadius:6,padding:"3px 6px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                    <button onClick={()=>confirmDel(task.id)} style={{background:"rgba(255,107,107,0.1)",border:"none",borderRadius:6,padding:"3px 6px",color:t.a1,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
                  </div>
                </div>
                {(task.startDate||task.endDate)&&<div style={{display:"flex",gap:8,marginTop:4,paddingLeft:25}}>
                  {task.startDate&&<span style={{color:t.sub,fontSize:9,fontWeight:500}}>▶ {task.startDate}</span>}
                  {task.endDate&&<span style={{color:task.done?t.sub:(deadlineStatus(task.endDate)?.color||t.sub),fontSize:9,fontWeight:600}}>⏹ {task.endDate}</span>}
                </div>}
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
function Streak({t,pushN,ns,onRestore,streak,isPro,user}){
  const badge=getBadge(streak);
  const nextBadge=BADGES.find(b=>b.min>streak);
  const [showBadge,setShowBadge]=useState(false);
  // Calendar state — always initialise to current local month/year
  const now=new Date();
  const [calYear,setCalYear]=useState(now.getFullYear());
  const [calMonth,setCalMonth]=useState(now.getMonth()); // 0-indexed
  const [studiedDates,setStudiedDates]=useState(new Set()); // "YYYY-MM-DD" strings

  // Load session dates from Firebase to mark studied days
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/sessions`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()){
            const dates=new Set(Object.values(snap.val()).map(s=>s.date).filter(Boolean));
            setStudiedDates(dates);
          } else setStudiedDates(new Set());
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // Calendar helpers
  const todayStr=istDateString(); // "YYYY-MM-DD"
  const firstDayOfMonth=new Date(calYear,calMonth,1).getDay(); // 0=Sun
  const daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  const MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const prevMonth=()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1);};
  const nextMonth=()=>{
    const n=new Date();
    // Don't navigate past current month
    if(calYear>n.getFullYear()||(calYear===n.getFullYear()&&calMonth>=n.getMonth()))return;
    if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1);
  };
  const isCurrentMonth=calYear===now.getFullYear()&&calMonth===now.getMonth();

  // Build calendar grid
  const calCells=[];
  for(let i=0;i<firstDayOfMonth;i++) calCells.push(null); // empty leading cells
  for(let d=1;d<=daysInMonth;d++) calCells.push(d);

  const dayStr=(d)=>{
    const m=String(calMonth+1).padStart(2,"0");
    const day=String(d).padStart(2,"0");
    return`${calYear}-${m}-${day}`;
  };

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:13}}>
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

    {/* All badges */}
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

    <div style={{display:"grid",gridTemplateColumns:"1fr",gap:7}}>
      <button onClick={onRestore} style={{background:`${t.a4}12`,border:`1px solid ${t.a4}28`,borderRadius:10,padding:"9px",color:t.a4,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>💔 Restore Streak</button>
    </div>

    {/* Dynamic study calendar — real session data, correct month/year */}
    <div>
      {/* Month navigation header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:7}}>
        <button onClick={prevMonth} style={{background:t.pill,border:"none",borderRadius:7,padding:"3px 9px",color:t.sub,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>‹</button>
        <div style={{fontSize:10,color:t.text,fontWeight:800}}>{MONTH_NAMES[calMonth]} {calYear}</div>
        <button onClick={nextMonth} disabled={isCurrentMonth} style={{background:isCurrentMonth?t.pill:t.pill,border:"none",borderRadius:7,padding:"3px 9px",color:isCurrentMonth?t.muted:t.sub,fontWeight:700,fontSize:13,cursor:isCurrentMonth?"default":"pointer",fontFamily:"inherit",opacity:isCurrentMonth?.35:1}}>›</button>
      </div>
      {/* Day headers */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:3}}>
        {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,color:t.sub,fontWeight:700,padding:"2px 0"}}>{d}</div>)}
      </div>
      {/* Day cells */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {calCells.map((d,i)=>{
          if(!d) return <div key={`e${i}`}/>;
          const ds=dayStr(d);
          const isToday=ds===todayStr;
          const studied=studiedDates.has(ds);
          const isFuture=ds>todayStr;
          return(<div key={ds} style={{
            aspectRatio:"1",borderRadius:5,
            background:isToday?t.a1:studied?`${t.a1}26`:t.pill,
            border:isToday?`2px solid ${t.a1}`:studied?`1px solid ${t.a1}36`:`1px solid ${t.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:8,
            color:isToday?"#fff":studied?t.a1:isFuture?t.border:t.muted,
            fontWeight:isToday?900:studied?700:400,
          }}>
            {isToday?"●":studied?"✓":d}
          </div>);
        })}
      </div>
      {studiedDates.size===0&&<div style={{color:t.muted,fontSize:9,textAlign:"center",marginTop:8}}>Complete a Pomodoro session to mark your study days</div>}
    </div>
  </div>);
}

// ── EXAM DASHBOARD ────────────────────────────────────────────
function ExamDash({t,es,setEs,onOpen,customSubjects,user,examDates,setExamDates,examTips,setExamTips}){
  const days=dl(es.date);
  const allSubjs=useMemo(()=>{
    const builtIn=es.subjects||[];
    const builtInNames=new Set(builtIn.map(s=>s.n.toLowerCase()));
    const extras=customSubjects.filter(s=>!builtInNames.has((s.n||"").toLowerCase()));
    return[...builtIn,...extras];
  },[es.subjects,customSubjects]);

  // Real subject progress from Firebase session data — never hardcoded
  const [sessionMinutes,setSessionMinutes]=useState({}); // {subjectName: totalMinutes}
  useEffect(()=>{
    if(!user?.uid){setSessionMinutes({});return;}
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/sessions`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(!snap.exists()){setSessionMinutes({});return;}
          const mins={};
          Object.values(snap.val()).forEach(s=>{
            if(s.subject&&s.minutes>0) mins[s.subject]=(mins[s.subject]||0)+s.minutes;
          });
          setSessionMinutes(mins);
        });
      }catch(e){setSessionMinutes({});}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // Calculate progress percentage per subject (capped at 100%)
  // Formula: (minutes studied / target minutes) * 100
  // Target: 300 minutes (5 hours) = 100% — reasonable for one subject
  const FULL_MINUTES=300;
  const prog=useMemo(()=>{
    const result={};
    allSubjs.forEach(s=>{
      const studied=sessionMinutes[s.n]||0;
      result[s.n]=Math.min(100,Math.round((studied/FULL_MINUTES)*100));
    });
    return result;
  },[allSubjs,sessionMinutes]);
  const [tips,setTips]=useState(es.tips||[]);
  const [editDateMode,setEditDateMode]=useState(false);
  const [dateVal,setDateVal]=useState(es.date||"");
  const [newTip,setNewTip]=useState("");
  const [editTipIdx,setEditTipIdx]=useState(null);
  const [editTipVal,setEditTipVal]=useState("");

  // Sync current exam data from the selected exam/mode.
  useEffect(()=>{setTips(es.tips||[]);setDateVal(es.date||"");setEditDateMode(false);},[es.key,es.mode,es.date]);

  const persistDate=async(date)=>{
    if(!user?.uid)return;
    try{await saveExamDateToDb(user.uid,es.key,es.mode,date);}catch(e){}
  };
  const persistTips=async(updatedTips)=>{
    if(!user?.uid)return;
    try{await saveExamTipsToDb(user.uid,es.key,es.mode,updatedTips);}catch(e){}
  };
  const persistSelection=async()=>{
    if(!user?.uid)return;
    try{await saveExamSelectionToDb(user.uid,es.key,es.mode);}catch(e){}
  };

  const saveDate=()=>{
    if(!dateVal)return;
    const updated={...es,date:dateVal};
    setEs(updated);
    setExamDates(p=>({...p,[updated.key]:{...(p?.[updated.key]||{}),[updated.mode]:dateVal}}));
    persistDate(dateVal);
    persistSelection();
    setEditDateMode(false);
  };

  const addTip=()=>{
    if(!newTip.trim())return;
    const updated=[...tips,newTip.trim()];
    setTips(updated);setNewTip("");
    setEs({...es,tips:updated});
    setExamTips(p=>({...p,[es.key]:{...(p?.[es.key]||{}),[es.mode]:updated}}));
    persistTips(updated);
  };
  const deleteTip=(i)=>{
    const updated=tips.filter((_,idx)=>idx!==i);
    setTips(updated);setEs({...es,tips:updated});
    setExamTips(p=>({...p,[es.key]:{...(p?.[es.key]||{}),[es.mode]:updated}}));
    persistTips(updated);
  };
  const startEditTip=(i)=>{setEditTipIdx(i);setEditTipVal(tips[i]);};
  const saveTip=()=>{
    const updated=tips.map((tp,i)=>i===editTipIdx?editTipVal:tp);
    setTips(updated);setEditTipIdx(null);setEs({...es,tips:updated});
    setExamTips(p=>({...p,[es.key]:{...(p?.[es.key]||{}),[es.mode]:updated}}));
    persistTips(updated);
  };
  const moveTip=(i,dir)=>{
    const updated=[...tips];const j=i+dir;
    if(j<0||j>=updated.length)return;
    [updated[i],updated[j]]=[updated[j],updated[i]];
    setTips(updated);setEs({...es,tips:updated});
    setExamTips(p=>({...p,[es.key]:{...(p?.[es.key]||{}),[es.mode]:updated}}));
    persistTips(updated);
  };

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:12}}>
    <div style={{background:`${es.color||"#818cf8"}10`,border:`1px solid ${es.color||"#818cf8"}28`,borderRadius:14,padding:"12px 12px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:-8,right:-8,width:65,height:65,borderRadius:"50%",background:`radial-gradient(circle,${es.color||"#818cf8"}16,transparent 70%)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div><div style={{fontSize:18}}>{es.icon||"🎯"}</div><div style={{color:t.text,fontWeight:900,fontSize:15,marginTop:2}}>{es.key||"UPSC CSE"}</div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginTop:3}}>
            <div style={{background:`${es.color||"#818cf8"}18`,color:es.color||"#818cf8",border:`1px solid ${es.color||"#818cf8"}40`,borderRadius:13,padding:"1px 7px",fontSize:8,fontWeight:800}}>{es.mode||"PRELIMS"}</div>
            {editDateMode?(
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                <input type="date" value={dateVal} onChange={e=>setDateVal(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 5px",color:t.text,fontSize:9,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={saveDate} style={{background:es.color||"#818cf8",border:"none",borderRadius:6,padding:"2px 7px",color:"#fff",fontSize:9,fontWeight:800,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                <button onClick={()=>setEditDateMode(false)} style={{background:t.pill,border:"none",borderRadius:6,padding:"2px 6px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
              </div>
            ):(
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                <div style={{color:t.sub,fontSize:8}}>{es.date||"No date set"}</div>
                <button onClick={()=>{setDateVal(es.date||"");setEditDateMode(true);}} style={{background:"none",border:"none",color:t.muted,fontSize:9,cursor:"pointer",padding:"0 2px"}}>✎</button>
              </div>
            )}
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:34,fontWeight:900,color:es.color||"#818cf8",lineHeight:1}}>{days??""}</div>
          <div style={{color:t.sub,fontSize:8,marginTop:1}}>{days!=null?"days left":"set date"}</div>
        </div>
      </div>
      <button onClick={onOpen} style={{marginTop:8,background:"rgba(255,255,255,0.04)",border:`1px solid ${t.border}`,borderRadius:7,padding:"3px 9px",color:t.sub,fontSize:8,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✎ Change Exam / Mode</button>
    </div>

    {/* Strategy — full CRUD */}
    <div>
      <div style={{fontSize:7,color:t.sub,marginBottom:6,textTransform:"uppercase",letterSpacing:1.5}}>Strategy Points</div>
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        {tips.map((tip,i)=>(
          <div key={i} style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 9px"}}>
            {editTipIdx===i?(
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <input autoFocus value={editTipVal} onChange={e=>setEditTipVal(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")saveTip();if(e.key==="Escape")setEditTipIdx(null);}} style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 7px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
                <button onClick={saveTip} style={{background:"#34d399",border:"none",borderRadius:6,padding:"4px 8px",color:"#0a0a0f",fontWeight:800,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                <button onClick={()=>setEditTipIdx(null)} style={{background:t.pill,border:"none",borderRadius:6,padding:"4px 6px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
              </div>
            ):(
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <span style={{color:"#818cf8",fontSize:8,fontWeight:800,flexShrink:0}}>{i+1}.</span>
                <span style={{color:t.text,fontSize:10,lineHeight:1.4,flex:1}}>{tip}</span>
                <div style={{display:"flex",gap:2,flexShrink:0}}>
                  <button onClick={()=>moveTip(i,-1)} disabled={i===0} style={{background:"none",border:"none",color:t.muted,cursor:i===0?"default":"pointer",fontSize:9,padding:"0 2px"}}>↑</button>
                  <button onClick={()=>moveTip(i,1)} disabled={i===tips.length-1} style={{background:"none",border:"none",color:t.muted,cursor:i===tips.length-1?"default":"pointer",fontSize:9,padding:"0 2px"}}>↓</button>
                  <button onClick={()=>startEditTip(i)} style={{background:t.pill,border:"none",borderRadius:5,padding:"2px 5px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                  <button onClick={()=>deleteTip(i)} style={{background:"rgba(255,107,107,0.1)",border:"none",borderRadius:5,padding:"2px 5px",color:"#FF6B6B",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
        <div style={{display:"flex",gap:5,marginTop:3}}>
          <input value={newTip} onChange={e=>setNewTip(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTip()} placeholder="Add strategy point…" style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none"}}/>
          <button onClick={addTip} style={{background:"#818cf8",border:"none",borderRadius:7,padding:"6px 11px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+</button>
        </div>
      </div>
    </div>

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
  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:12}}>
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
                <div style={{flex:1,color:t.text,fontSize:11,fontWeight:500,textDecoration:topic.status==="completed"?"line-through":"none",opacity: topic.status === "completed" ? 0.55 : 1}}>{topic.title}</div>
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
  const [publicUsers,setPublicUsers]=useState([]);
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

  const LB=[{name:user?.name||"You",av:(user?.name||"K")[0],h:0,s:streak},...publicUsers.map(p=>({name:p.name,av:p.av,h:p.h||0,s:p.streak||0}))].sort((a,b)=>(b.h||0)-(a.h||0)).map((f,i)=>({...f,r:i+1}));

  // Friend code is stored in RTDB profile — deterministic from uid for backwards compat
  const myFriendCode=user?.uid?`SYNC-${user.uid.slice(0,8).toUpperCase()}`:"SYNC-XXXXXXXX";
  const myInviteLink=`https://studysync-4cvf.vercel.app/join?code=${myFriendCode}`;

  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,usersRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbMod=mod;
        usersRef=mod.ref(mod.db,"users");
        listener=mod.onValue(usersRef,(snap)=>{
          const data=snap.exists()?snap.val():{};
          const list=Object.entries(data).map(([uid,row])=>{
            const profile=row?.profile||{};
            const name=profile.name||profile.displayName||profile.email||"Aspirant";
            return {id:uid,name,av:(name||"A")[0].toUpperCase(),streak:row?.streak||0,h:profile.weekHours||row?.stats?.weekHours||0,city:profile.city||"StudySync",studying:profile.online===true,subj:profile.currentSubject||profile.subj||"Studying"};
          }).filter(p=>p.id!==user.uid&&p.name).sort((a,b)=>(b.streak||0)-(a.streak||0));
          setPublicUsers(list);
        });
      }catch(e){setPublicUsers([]);}
    })();
    return()=>{if(dbMod&&usersRef&&listener)dbMod.off(usersRef,listener);};
  },[user?.uid]);

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

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:11}}>
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
      <div style={{background:"rgba(110,231,247,0.06)",border:"1px solid rgba(110,231,247,0.15)",borderRadius:10,padding:"8px 10px",display:"flex",gap:7,alignItems:"center"}}><div style={{fontSize:13}}>🌍</div><div><div style={{color:t.a2,fontWeight:700,fontSize:11}}>Public Circle</div><div style={{color:t.sub,fontSize:9}}>{publicUsers.length} aspirants · Real-time streak board</div></div></div>
      <div style={{background:`${t.a4}10`,border:`1.5px solid ${t.a4}38`,borderRadius:10,padding:"9px 10px",display:"flex",alignItems:"center",gap:8}}>
        <Av c={(user?.name||"K")[0].toUpperCase()} sz={32}/>
        <div style={{flex:1}}><div style={{color:t.text,fontWeight:800,fontSize:12}}>{user?.name||"You"} <span style={{color:t.a4,fontSize:8}}>(You)</span></div><div style={{color:t.sub,fontSize:9}}>📖 Studying</div></div>
        <div style={{color:t.a1,fontWeight:900,fontSize:13}}>🔥 {streak}</div>
      </div>
      {publicUsers.length===0?<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:10,padding:"14px 10px",color:t.sub,fontSize:11,textAlign:"center"}}>No activity yet</div>:publicUsers.map((f,i)=><div key={f.id} style={{display:"flex",alignItems:"center",gap:8,background:t.card,border:`1px solid ${f.studying?t.a3+"28":t.border}`,borderRadius:10,padding:"8px 10px"}}>
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
function Report({t,es,user,streak}){
  const [rep,setRep]=useState("");const [ld,setLd]=useState(false);
  const [view,setView]=useState("stats");
  const [sessions,setSessions]=useState([]);
  const [selDate,setSelDate]=useState(null);
  const today=new Date();
  const todayStr=today.toISOString().split("T")[0];

  // Load real sessions from Firebase
  useEffect(()=>{
    if(!user?.uid)return;
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,`users/${user.uid}/sessions`);
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()) setSessions(Object.values(snap.val()));
          else setSessions([]);
        });
      }catch(e){}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid]);

  // Compute stats from real sessions
  const totalSessions=sessions.length;
  const totalMinutes=sessions.reduce((a,s)=>a+(s.minutes||0),0);
  const totalHours=Math.floor(totalMinutes/60);
  const todaySessions=sessions.filter(s=>s.date===todayStr);
  const todayMinutes=todaySessions.reduce((a,s)=>a+(s.minutes||0),0);
  const weekStart=new Date(today);weekStart.setDate(today.getDate()-today.getDay());
  const weekStr=weekStart.toISOString().split("T")[0];
  const weekSessions=sessions.filter(s=>s.date>=weekStr);
  const weekMinutes=weekSessions.reduce((a,s)=>a+(s.minutes||0),0);
  const monthStr=todayStr.slice(0,7);
  const monthSessions=sessions.filter(s=>s.date?.startsWith(monthStr));
  const monthMinutes=monthSessions.reduce((a,s)=>a+(s.minutes||0),0);

  // Subject breakdown from real sessions
  const subjMap={};
  sessions.forEach(s=>{if(s.subject)subjMap[s.subject]=(subjMap[s.subject]||0)+(s.minutes||0);});
  const subjArr=Object.entries(subjMap).sort((a,b)=>b[1]-a[1]);

  // Calendar: last 35 days
  const calDays=Array.from({length:35},(_,i)=>{
    const d=new Date(today);d.setDate(today.getDate()-34+i);
    const dStr=d.toISOString().split("T")[0];
    const daySess=sessions.filter(s=>s.date===dStr);
    const mins=daySess.reduce((a,s)=>a+(s.minutes||0),0);
    const hrs=Math.round(mins/60*10)/10;
    return{date:d,dateStr:dStr,mins,hrs,count:daySess.length};
  });
  const heatColor=(h)=>{if(h===0)return t.pill;if(h<1)return"rgba(129,140,248,0.18)";if(h<2)return"rgba(129,140,248,0.40)";if(h<3)return"rgba(129,140,248,0.65)";return"rgba(129,140,248,0.90)";};

  // Selected date detail
  const selSessions=selDate?sessions.filter(s=>s.date===selDate):[];
  const selMins=selSessions.reduce((a,s)=>a+(s.minutes||0),0);

  // Longest streak calc
  const dateSet=new Set(sessions.map(s=>s.date));
  let longest=0,cur=0,chk=new Date(today);
  for(let i=0;i<365;i++){
    const ds=chk.toISOString().split("T")[0];
    if(dateSet.has(ds)){cur++;longest=Math.max(longest,cur);}else cur=0;
    chk.setDate(chk.getDate()-1);
  }

  const gen=async()=>{
    setLd(true);setRep("");
    const subjSummary=subjArr.slice(0,5).map(([s,m])=>`${s}:${Math.round(m/60*10)/10}h`).join(", ");
    const prompt=`Warm, direct 110-word weekly study coaching report for a ${es.name||"UPSC"} aspirant. Total sessions: ${totalSessions}, Total hours: ${totalHours}h, This week: ${Math.round(weekMinutes/60*10)/10}h, Streak: ${streak} days. Subject breakdown: ${subjSummary||"no data yet"}. Cover: brief summary, strongest subject, weakest (needs more time), one tip, one motivational line. Coach-like tone.`;
    const result=await callAI(prompt,"You are a motivating UPSC study coach. Be concise and actionable.");
    setRep(result);setLd(false);
  };

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:13}}>
    <div style={{display:"flex",gap:4,background:t.pill,borderRadius:24,padding:3,alignSelf:"flex-start"}}>
      {[["stats","Stats"],["calendar","Calendar"],["subjects","Subjects"]].map(([v,l])=><button key={v} onClick={()=>setView(v)} style={{padding:"5px 12px",borderRadius:19,border:"none",background:view===v?"#818cf8":t.pill,color:view===v?"#fff":t.sub,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{l}</button>)}
    </div>

    {/* STATS VIEW */}
    {view==="stats"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {[{l:"Total Sessions",v:String(totalSessions),c:"#818cf8",i:"⏱"},{l:"Total Hours",v:`${totalHours}h ${totalMinutes%60}m`,c:"#34d399",i:"🕐"},{l:"Today",v:`${todayMinutes}m`,c:"#FFB86B",i:"📅"},{l:"This Week",v:`${Math.round(weekMinutes/60*10)/10}h`,c:"#6EE7F7",i:"📊"},{l:"This Month",v:`${Math.round(monthMinutes/60*10)/10}h`,c:"#C16BFF",i:"📆"},{l:"Current Streak",v:`${streak}🔥`,c:"#FF6B6B",i:"🔥"},{l:"Longest Streak",v:`${longest}d`,c:"#FFD700",i:"🏆"},{l:"Avg/Day",v:totalSessions>0?`${Math.round(totalMinutes/Math.max(new Set(sessions.map(s=>s.date)).size,1))}m`:"0m",c:"#34d399",i:"📈"}].map(s=><div key={s.l} style={{background:t.card,border:`1px solid ${s.c}22`,borderRadius:12,padding:"11px 10px"}}>
          <div style={{fontSize:18,marginBottom:4}}>{s.i}</div>
          <div style={{fontSize:20,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
          <div style={{fontSize:9,color:t.sub,marginTop:3,textTransform:"uppercase",letterSpacing:.8}}>{s.l}</div>
        </div>)}
      </div>
      {totalSessions===0&&<div style={{background:"rgba(129,140,248,0.06)",border:"1px solid rgba(129,140,248,0.15)",borderRadius:11,padding:"14px",textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:6}}>⏱</div>
        <div style={{color:t.text,fontWeight:700,fontSize:13,marginBottom:4}}>No sessions yet</div>
        <div style={{color:t.sub,fontSize:11}}>Complete a Pomodoro session to see your stats here!</div>
      </div>}
    </div>}

    {/* CALENDAR VIEW */}
    {view==="calendar"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
        <div style={{fontSize:8,color:t.sub,marginBottom:9,textTransform:"uppercase",letterSpacing:1.5}}>Study Calendar — Last 5 Weeks · Tap a day</div>
        <div style={{display:"flex",gap:5,marginBottom:7}}>{["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{flex:1,textAlign:"center",fontSize:7,color:t.muted}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {calDays.map((d,i)=><div key={i} onClick={()=>setSelDate(d.dateStr===selDate?null:d.dateStr)} title={`${d.dateStr}: ${d.hrs}h`} style={{aspectRatio:"1",borderRadius:4,background:selDate===d.dateStr?"#818cf8":heatColor(d.hrs),border:`1.5px solid ${selDate===d.dateStr?"#818cf8":t.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s"}}>
            {d.count>0&&<div style={{fontSize:7,color:selDate===d.dateStr||d.hrs>=1?"#fff":t.sub,fontWeight:700}}>{d.count}</div>}
          </div>)}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:8,justifyContent:"center"}}>
          <span style={{color:t.muted,fontSize:8}}>Less</span>
          {[0,0.5,1,2,3.5].map(h=><div key={h} style={{width:11,height:11,borderRadius:3,background:heatColor(h),border:`1px solid ${t.border}`}}/>)}
          <span style={{color:t.muted,fontSize:8}}>More</span>
        </div>
      </div>
      {/* Selected date detail */}
      {selDate&&<div style={{background:t.card,border:"1px solid rgba(129,140,248,0.2)",borderRadius:12,padding:"12px"}}>
        <div style={{color:"#818cf8",fontWeight:800,fontSize:12,marginBottom:8}}>📅 {selDate}</div>
        {selSessions.length===0?<div style={{color:t.sub,fontSize:11}}>No study sessions on this day.</div>:
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <div style={{display:"flex",gap:10,marginBottom:4}}>
            <div style={{textAlign:"center"}}><div style={{color:t.text,fontWeight:900,fontSize:16}}>{selSessions.length}</div><div style={{color:t.sub,fontSize:8}}>Sessions</div></div>
            <div style={{textAlign:"center"}}><div style={{color:"#34d399",fontWeight:900,fontSize:16}}>{selMins}m</div><div style={{color:t.sub,fontSize:8}}>Focus Time</div></div>
          </div>
          {selSessions.map((s,i)=><div key={i} style={{background:t.pill,borderRadius:8,padding:"6px 9px",display:"flex",justifyContent:"space-between"}}>
            <span style={{color:t.text,fontSize:10,fontWeight:600}}>📖 {s.subject||"General"}</span>
            <span style={{color:t.sub,fontSize:9}}>{s.minutes}m</span>
          </div>)}
        </div>}
      </div>}
    </div>}

    {/* SUBJECTS VIEW */}
    {view==="subjects"&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      {subjArr.length===0?<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"20px 0"}}>Complete sessions to see subject breakdown!</div>:
      subjArr.map(([subj,mins],i)=>{
        const hrs=Math.round(mins/60*10)/10;
        const pct=Math.round((mins/totalMinutes)*100);
        const cols=["#818cf8","#34d399","#FFB86B","#6EE7F7","#FF6B6B","#C16BFF","#FFD700"];
        const c=cols[i%cols.length];
        return(<div key={subj} style={{background:t.card,border:`1px solid ${c}20`,borderRadius:11,padding:"10px 11px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div style={{color:t.text,fontWeight:700,fontSize:12}}>{subj}</div>
            <div style={{color:c,fontWeight:900,fontSize:14}}>{hrs}h</div>
          </div>
          <div style={{height:4,background:t.pill,borderRadius:2,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${pct}%`,background:c,borderRadius:2,transition:"width .5s ease"}}/></div>
          <div style={{color:t.muted,fontSize:8}}>{pct}% of total · {sessions.filter(s=>s.subject===subj).length} sessions</div>
        </div>);
      })}
    </div>}

    {/* AI Report */}
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
    <div style={{display:"flex",gap:5}}><input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask anything…" style={{flex:1,background:t.input,border:"1px solid rgba(129,140,248,0.18)",borderRadius:17,padding:"8px 11px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/><button onClick={()=>send()} disabled={ld||!inp.trim()} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:17,padding:"8px 13px",color:"#fff",fontWeight:800,cursor:"pointer",fontFamily:"inherit",fontSize:12,opacity: ld || !inp.trim() ? 0.5 : 1}}>↑</button></div>
  </div>);
}

// ── NOTES ─────────────────────────────────────────────────────
function Notes({t,subjects,customSubjects,es,user}){
  const allSubjects=[...subjects,...customSubjects];
  const [selSubj,setSelSubj]=useState(allSubjects[0]?.n||"");
  const [cards,setCards]=useState([]);
  const [loading,setLoading]=useState(false);
  const [search,setSearch]=useState("");
  // Create card state
  const [newQ,setNewQ]=useState("");
  const [newA,setNewA]=useState("");
  const [adding,setAdding]=useState(false);
  const [saving,setSaving]=useState(false);
  // Edit state
  const [editId,setEditId]=useState(null);
  const [editQ,setEditQ]=useState("");
  const [editA,setEditA]=useState("");
  // Delete confirm
  const [delId,setDelId]=useState(null);
  // Reveal state — set of card ids that are revealed
  const [revealed,setRevealed]=useState(new Set());
  // Review mode
  const [reviewMode,setReviewMode]=useState(false);
  const [reviewIdx,setReviewIdx]=useState(0);
  const [reviewRevealed,setReviewRevealed]=useState(false);

  const examKey=es?.key||"UPSC CSE";
  const examMode=es?.mode||"Prelims";

  // Firebase path helper
  const cardPath=(id="")=>`users/${user?.uid}/activeRecallCards/${dbKey(examKey)}/${dbKey(examMode)}/${dbKey(selSubj)}${id?"/"+id:""}`;

  // Load cards when exam/mode/subject changes
  useEffect(()=>{
    if(!user?.uid||!selSubj)return;
    setLoading(true);setCards([]);setRevealed(new Set());setReviewMode(false);
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,cardPath());
        dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()){
            const raw=snap.val();
            const arr=Object.entries(raw).map(([id,v])=>({...v,id})).sort((a,b)=>a.createdAt-b.createdAt);
            setCards(arr);
          } else setCards([]);
          setLoading(false);
        });
      }catch(e){setLoading(false);}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid,selSubj,examKey,examMode]);

  // Set default subject when subjects change
  useEffect(()=>{
    if(allSubjects.length>0&&!allSubjects.find(s=>s.n===selSubj)){
      setSelSubj(allSubjects[0].n);
    }
  },[allSubjects.length]);

  const saveCard=async()=>{
    if(!newQ.trim()||!newA.trim()||!user?.uid)return;
    setSaving(true);
    try{
      const mod=await import("./firebase");
      const id=`c_${Date.now()}`;
      await mod.set(mod.ref(mod.db,cardPath(id)),{question:newQ.trim(),answer:newA.trim(),createdAt:Date.now()});
      setNewQ("");setNewA("");setAdding(false);
    }catch(e){}
    setSaving(false);
  };

  const startEdit=(card)=>{setEditId(card.id);setEditQ(card.question);setEditA(card.answer);};
  const saveEdit=async()=>{
    if(!editQ.trim()||!editA.trim()||!user?.uid)return;
    try{
      const mod=await import("./firebase");
      await mod.set(mod.ref(mod.db,cardPath(editId)),{question:editQ.trim(),answer:editA.trim(),createdAt:cards.find(c=>c.id===editId)?.createdAt||Date.now()});
      setEditId(null);
    }catch(e){}
  };

  const deleteCard=async(id)=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      await mod.remove(mod.ref(mod.db,cardPath(id)));
      setDelId(null);
    }catch(e){}
  };

  const toggleReveal=(id)=>{
    setRevealed(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});
  };

  const sc=allSubjects.find(s=>s.n===selSubj)||{c:"#818cf8",i:"📌"};
  const filtered=cards.filter(c=>!search||c.question.toLowerCase().includes(search.toLowerCase())||c.answer.toLowerCase().includes(search.toLowerCase()));
  const reviewCards=filtered.length>0?filtered:cards;
  const reviewCard=reviewCards[reviewIdx]||null;

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:11}}>
    {/* Delete confirmation */}
    {delId&&<div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}}>
      <div style={{background:t.bg,border:"1px solid rgba(255,107,107,0.3)",borderRadius:18,padding:20,maxWidth:280,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>🗑️</div>
        <div style={{color:t.text,fontWeight:800,fontSize:14,marginBottom:4}}>Delete this card?</div>
        <div style={{color:t.sub,fontSize:11,marginBottom:16}}>This cannot be undone.</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setDelId(null)} style={{flex:1,background:t.pill,border:"none",borderRadius:10,padding:"9px",color:t.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>deleteCard(delId)} style={{flex:1,background:"linear-gradient(135deg,#FF6B6B,#FF4757)",border:"none",borderRadius:10,padding:"9px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
        </div>
      </div>
    </div>}

    {/* Header row */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
      <div>
        <div style={{color:t.text,fontWeight:900,fontSize:14}}>🃏 Active Recall</div>
        <div style={{color:t.sub,fontSize:9,marginTop:1}}>{examKey} · {examMode} · {cards.length} card{cards.length!==1?"s":""}</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {cards.length>0&&<button onClick={()=>{setReviewMode(true);setReviewIdx(0);setReviewRevealed(false);}} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:9,padding:"6px 11px",color:"#fff",fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>▶ Review</button>}
        <button onClick={()=>{setAdding(v=>!v);setEditId(null);}} style={{background:adding?"#818cf8":t.pill,border:"none",borderRadius:9,padding:"6px 11px",color:adding?"#fff":t.sub,fontWeight:800,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>+ Card</button>
      </div>
    </div>

    {/* Subject pills */}
    <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
      {allSubjects.map(s=><button key={s.n} onClick={()=>{setSelSubj(s.n);setReviewMode(false);setSearch("");setAdding(false);setEditId(null);}} style={{padding:"3px 8px",borderRadius:13,border:`1.5px solid ${selSubj===s.n?s.c:"transparent"}`,background:selSubj===s.n?`${s.c}18`:t.pill,color:selSubj===s.n?s.c:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>{s.i||"📌"} {s.n}</button>)}
    </div>

    {/* Review mode */}
    {reviewMode&&reviewCard&&<div style={{display:"flex",flexDirection:"column",gap:9}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{color:t.sub,fontSize:10}}>{reviewIdx+1} / {reviewCards.length}</div>
        <button onClick={()=>setReviewMode(false)} style={{background:t.pill,border:"none",borderRadius:8,padding:"4px 9px",color:t.sub,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✕ Exit Review</button>
      </div>
      <div style={{display:"flex",gap:2,marginBottom:2}}>
        {reviewCards.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<reviewIdx?"#34d399":i===reviewIdx?(sc.c||"#818cf8"):t.pill,transition:"background .3s"}}/>)}
      </div>
      <div onClick={()=>setReviewRevealed(v=>!v)} style={{background:t.card,border:`2px solid ${reviewRevealed?(sc.c||"#818cf8")+"55":t.border}`,borderRadius:16,padding:"22px 16px",minHeight:160,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",gap:10,transition:"all .3s",userSelect:"none"}}>
        <div style={{fontSize:8,color:t.muted,textTransform:"uppercase",letterSpacing:1.5}}>{reviewRevealed?"ANSWER":"QUESTION — tap to reveal"}</div>
        <div style={{color:t.text,fontSize:14,fontWeight:700,lineHeight:1.6}}>{reviewRevealed?reviewCard.answer:reviewCard.question}</div>
        {!reviewRevealed&&<div style={{fontSize:20,opacity:.25}}>👆</div>}
      </div>
      {reviewRevealed&&<div style={{display:"flex",gap:6,justifyContent:"center"}}>
        {[["Again","#FF6B6B"],["Hard","#FFB86B"],["Good","#34d399"]].map(([l,c])=>(
          <button key={l} onClick={()=>{
            const next=(reviewIdx+1)%reviewCards.length;
            setReviewIdx(next);setReviewRevealed(false);
          }} style={{flex:1,padding:"8px",borderRadius:10,border:"none",background:`${c}18`,color:c,fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>
        ))}
      </div>}
      {!reviewRevealed&&<div style={{display:"flex",gap:6}}>
        <button onClick={()=>{setReviewIdx(i=>(i-1+reviewCards.length)%reviewCards.length);setReviewRevealed(false);}} style={{flex:1,background:t.pill,border:"none",borderRadius:9,padding:"8px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>← Prev</button>
        <button onClick={()=>{setReviewIdx(i=>(i+1)%reviewCards.length);setReviewRevealed(false);}} style={{flex:1,background:t.pill,border:"none",borderRadius:9,padding:"8px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Next →</button>
      </div>}
    </div>}

    {/* Add card form */}
    {!reviewMode&&adding&&<div style={{background:t.card,border:`1px solid ${sc.c}44`,borderRadius:13,padding:"12px"}}>
      <div style={{color:t.text,fontWeight:700,fontSize:12,marginBottom:9}}>New Card · {selSubj}</div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        <div>
          <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Question</div>
          <input value={newQ} onChange={e=>setNewQ(e.target.value)} placeholder="e.g. What is Article 32?" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 10px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div>
          <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Answer</div>
          <textarea value={newA} onChange={e=>setNewA(e.target.value)} placeholder="e.g. Right to Constitutional Remedies" rows={2} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 10px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={saveCard} disabled={saving||!newQ.trim()||!newA.trim()} style={{flex:1,background:saving||!newQ.trim()||!newA.trim()?t.pill:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:9,padding:"9px",color:saving||!newQ.trim()||!newA.trim()?t.sub:"#fff",fontWeight:800,fontSize:12,cursor:saving||!newQ.trim()||!newA.trim()?"not-allowed":"pointer",fontFamily:"inherit",transition:"all .2s"}}>{saving?"Saving…":"Save Card"}</button>
          <button onClick={()=>{setAdding(false);setNewQ("");setNewA("");}} style={{background:t.pill,border:"none",borderRadius:9,padding:"9px 13px",color:t.sub,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
        </div>
      </div>
    </div>}

    {/* Search */}
    {!reviewMode&&cards.length>2&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search cards…" style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 11px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none",width:"100%",boxSizing:"border-box"}}/>}

    {/* Card list */}
    {!reviewMode&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      {loading&&<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"20px 0"}}>Loading cards…</div>}
      {!loading&&filtered.length===0&&!adding&&(
        <div style={{background:`${sc.c}08`,border:`1px dashed ${sc.c}30`,borderRadius:13,padding:"22px",textAlign:"center"}}>
          <div style={{fontSize:28,marginBottom:8}}>🃏</div>
          <div style={{color:t.text,fontWeight:700,fontSize:13,marginBottom:4}}>{search?"No matching cards":"No cards yet"}</div>
          <div style={{color:t.sub,fontSize:11,marginBottom:12}}>{search?"Try a different search term":`Add your first card for ${selSubj}`}</div>
          {!search&&<button onClick={()=>setAdding(true)} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Create First Card</button>}
        </div>
      )}
      {filtered.map(card=>{
        const isRevealed=revealed.has(card.id);
        const isEditing=editId===card.id;
        return(
          <div key={card.id} style={{background:t.card,border:`1px solid ${isRevealed?sc.c+"40":t.border}`,borderRadius:12,padding:"11px 12px",transition:"border .2s"}}>
            {isEditing?(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1}}>Edit Card</div>
                <input value={editQ} onChange={e=>setEditQ(e.target.value)} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <textarea value={editA} onChange={e=>setEditA(e.target.value)} rows={2} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none",resize:"vertical"}}/>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={saveEdit} style={{flex:1,background:"#34d399",border:"none",borderRadius:8,padding:"7px",color:"#0a0a0f",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                  <button onClick={()=>setEditId(null)} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 10px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            ):(
              <>
                {/* Question row */}
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:isRevealed?8:0}}>
                  <div style={{flex:1}}>
                    <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>Q</div>
                    <div style={{color:t.text,fontSize:12,fontWeight:600,lineHeight:1.5}}>{card.question}</div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0,marginTop:2}}>
                    <button onClick={()=>startEdit(card)} style={{background:t.pill,border:"none",borderRadius:6,padding:"3px 7px",color:t.sub,fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                    <button onClick={()=>setDelId(card.id)} style={{background:"rgba(255,107,107,0.1)",border:"none",borderRadius:6,padding:"3px 7px",color:"#FF6B6B",fontSize:9,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
                  </div>
                </div>
                {/* Answer reveal */}
                {isRevealed?(
                  <div>
                    <div style={{height:1,background:sc.c+"22",marginBottom:8}}/>
                    <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1,marginBottom:3}}>A</div>
                    <div style={{color:sc.c||"#34d399",fontSize:12,fontWeight:600,lineHeight:1.5,marginBottom:8}}>{card.answer}</div>
                    <button onClick={()=>toggleReveal(card.id)} style={{background:`${sc.c}10`,border:`1px solid ${sc.c}28`,borderRadius:8,padding:"5px 12px",color:sc.c,fontWeight:700,fontSize:9,cursor:"pointer",fontFamily:"inherit",width:"100%"}}>Hide Answer</button>
                  </div>
                ):(
                  <button onClick={()=>toggleReveal(card.id)} style={{marginTop:8,width:"100%",background:`${sc.c}10`,border:`1px solid ${sc.c}28`,borderRadius:8,padding:"6px",color:sc.c,fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>Show Answer</button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>}
  </div>);
}

// ── MOCK TEST TRACKER ────────────────────────────────────────
function MockTest({t,es,user}){
  const [mocks,setMocks]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({name:"",date:"",score:"",total:""});
  const [saving,setSaving]=useState(false);
  const [editId,setEditId]=useState(null);
  const [editForm,setEditForm]=useState({name:"",date:"",score:"",total:""});
  const [delId,setDelId]=useState(null);

  const examKey=es?.key||"UPSC CSE";
  const examMode=es?.mode||"Prelims";
  const basePath=`users/${user?.uid}/mockTests/${dbKey(examKey)}/${dbKey(examMode)}`;

  // Load mocks from Firebase
  useEffect(()=>{
    if(!user?.uid)return;
    setLoading(true);setMocks([]);
    let dbMod,dbRef,listener;
    (async()=>{
      try{
        const mod=await import("./firebase");
        dbRef=mod.ref(mod.db,basePath);dbMod=mod;
        listener=mod.onValue(dbRef,(snap)=>{
          if(snap.exists()){
            const arr=Object.entries(snap.val()).map(([id,v])=>({...v,id})).sort((a,b)=>b.createdAt-a.createdAt);
            setMocks(arr);
          } else setMocks([]);
          setLoading(false);
        });
      }catch{setLoading(false);}
    })();
    return()=>{if(dbMod&&dbRef&&listener)dbMod.off(dbRef,listener);};
  },[user?.uid,examKey,examMode]);

  const pct=(score,total)=>total>0?Math.round((score/total)*100):0;

  const saveMock=async()=>{
    const s=Number(form.score),tot=Number(form.total);
    if(!form.name.trim()||!form.date||isNaN(s)||isNaN(tot)||tot<=0||s<0||s>tot)return;
    setSaving(true);
    try{
      const mod=await import("./firebase");
      const id=`m_${Date.now()}`;
      await mod.set(mod.ref(mod.db,`${basePath}/${id}`),{
        name:form.name.trim(),date:form.date,score:s,totalMarks:tot,
        percentage:pct(s,tot),createdAt:Date.now()
      });
      setForm({name:"",date:"",score:"",total:""});setShowAdd(false);
    }catch{}
    setSaving(false);
  };

  const startEdit=(m)=>{setEditId(m.id);setEditForm({name:m.name,date:m.date,score:String(m.score),total:String(m.totalMarks)});};
  const saveEdit=async()=>{
    const s=Number(editForm.score),tot=Number(editForm.total);
    if(!editForm.name.trim()||!editForm.date||isNaN(s)||isNaN(tot)||tot<=0||s<0||s>tot)return;
    try{
      const mod=await import("./firebase");
      const orig=mocks.find(m=>m.id===editId);
      await mod.set(mod.ref(mod.db,`${basePath}/${editId}`),{
        name:editForm.name.trim(),date:editForm.date,score:s,totalMarks:tot,
        percentage:pct(s,tot),createdAt:orig?.createdAt||Date.now()
      });
      setEditId(null);
    }catch{}
  };
  const deleteMock=async(id)=>{
    try{const mod=await import("./firebase");await mod.remove(mod.ref(mod.db,`${basePath}/${id}`));setDelId(null);}catch{}
  };

  // Analytics
  const scores=mocks.map(m=>m.score);
  const pcts=mocks.map(m=>m.percentage);
  const total=mocks.length;
  const avg=total>0?Math.round(scores.reduce((a,b)=>a+b,0)/total*10)/10:0;
  const best=total>0?Math.max(...scores):0;
  const worst=total>0?Math.min(...scores):0;
  const avgPct=total>0?Math.round(pcts.reduce((a,b)=>a+b,0)/total*10)/10:0;
  // Trend: compare last 5 vs prev 5
  const sorted=[...mocks].sort((a,b)=>a.createdAt-b.createdAt);
  const last5=sorted.slice(-5);const prev5=sorted.slice(-10,-5);
  const avgOf=(arr)=>arr.length?Math.round(arr.reduce((a,m)=>a+m.score,0)/arr.length*10)/10:null;
  const l5avg=avgOf(last5);const p5avg=avgOf(prev5);
  const trend=l5avg!=null&&p5avg!=null?l5avg-p5avg:null;

  // Mini trend graph data (chronological, last 10)
  const graphMocks=sorted.slice(-10);
  const graphMax=graphMocks.length?Math.max(...graphMocks.map(m=>m.score)):200;
  const graphMin=graphMocks.length?Math.min(...graphMocks.map(m=>m.score)):0;
  const graphRange=graphMax-graphMin||1;
  const H=80,W_CELL=28;

  const fmtDate=(d)=>{if(!d)return"";const dt=new Date(d+"T00:00:00");return dt.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"2-digit"});};

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:12}}>
    {/* Delete confirm */}
    {delId&&<div style={{position:"fixed",inset:0,zIndex:9900,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(5px)"}}>
      <div style={{background:t.bg,border:"1px solid rgba(255,107,107,0.3)",borderRadius:18,padding:20,maxWidth:280,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:8}}>🗑️</div>
        <div style={{color:t.text,fontWeight:800,fontSize:14,marginBottom:4}}>Delete this mock test?</div>
        <div style={{color:t.sub,fontSize:11,marginBottom:16}}>This cannot be undone.</div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setDelId(null)} style={{flex:1,background:t.pill,border:"none",borderRadius:10,padding:"9px",color:t.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={()=>deleteMock(delId)} style={{flex:1,background:"linear-gradient(135deg,#FF6B6B,#FF4757)",border:"none",borderRadius:10,padding:"9px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
        </div>
      </div>
    </div>}

    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div>
        <div style={{color:t.text,fontWeight:900,fontSize:14}}>📈 Mock Test Tracker</div>
        <div style={{color:t.sub,fontSize:9,marginTop:1}}>{examKey} · {examMode} · {total} test{total!==1?"s":""}</div>
      </div>
      <button onClick={()=>{setShowAdd(v=>!v);setEditId(null);}} style={{background:showAdd?"#818cf8":"linear-gradient(135deg,rgba(129,140,248,0.15),rgba(52,211,153,0.1))",border:"1px solid rgba(129,140,248,0.25)",borderRadius:10,padding:"7px 13px",color:showAdd?"#fff":"#818cf8",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit",transition:"all .2s"}}>
        {showAdd?"✕ Cancel":"+ Add Mock"}
      </button>
    </div>

    {/* Add form */}
    {showAdd&&<div style={{background:t.card,border:"1px solid rgba(129,140,248,0.2)",borderRadius:13,padding:"13px"}}>
      <div style={{color:t.text,fontWeight:700,fontSize:12,marginBottom:10}}>New Mock Test</div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Test name e.g. Vision IAS FLT 12" style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 10px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
        <div style={{display:"flex",gap:7}}>
          <div style={{flex:1}}><div style={{color:t.muted,fontSize:8,marginBottom:3}}>DATE</div><input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light",boxSizing:"border-box"}}/></div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <div style={{flex:1}}><div style={{color:t.muted,fontSize:8,marginBottom:3}}>MARKS SCORED</div><input type="number" min="0" value={form.score} onChange={e=>setForm(f=>({...f,score:e.target.value}))} placeholder="82" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
          <div style={{flex:1}}><div style={{color:t.muted,fontSize:8,marginBottom:3}}>TOTAL MARKS</div><input type="number" min="1" value={form.total} onChange={e=>setForm(f=>({...f,total:e.target.value}))} placeholder="200" style={{width:"100%",background:t.input,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 9px",color:t.text,fontSize:12,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/></div>
          {form.score&&form.total&&Number(form.total)>0&&<div style={{display:"flex",flexDirection:"column",justifyContent:"flex-end",paddingBottom:1}}><div style={{background:"rgba(129,140,248,0.12)",border:"1px solid rgba(129,140,248,0.22)",borderRadius:8,padding:"7px 9px",color:"#818cf8",fontWeight:900,fontSize:13,textAlign:"center",whiteSpace:"nowrap"}}>{pct(Number(form.score),Number(form.total))}%</div></div>}
        </div>
        <button onClick={saveMock} disabled={saving} style={{background:saving?t.pill:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:9,padding:"9px",color:saving?t.sub:"#fff",fontWeight:800,fontSize:12,cursor:saving?"not-allowed":"pointer",fontFamily:"inherit",transition:"all .2s"}}>{saving?"Saving…":"Save Mock Test"}</button>
      </div>
    </div>}

    {/* Analytics cards */}
    {total>0&&<>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
        {[{l:"Mocks Taken",v:String(total),c:"#818cf8",i:"📝"},{l:"Average Score",v:String(avg),c:"#34d399",i:"📊"},{l:"Best Score",v:String(best),c:"#FFB86B",i:"🏆"},{l:"Worst Score",v:String(worst),c:"#FF6B6B",i:"📉"},{l:"Avg Percentage",v:avgPct+"%",c:"#6EE7F7",i:"📈"},{l:"Latest",v:mocks[0]?mocks[0].score+"/"+mocks[0].totalMarks:"—",c:"#C16BFF",i:"✅"}].map(s=>(
          <div key={s.l} style={{background:t.card,border:`1px solid ${s.c}20`,borderRadius:11,padding:"10px 11px"}}>
            <div style={{fontSize:15,marginBottom:3}}>{s.i}</div>
            <div style={{fontSize:18,fontWeight:900,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:8,color:t.sub,marginTop:3,textTransform:"uppercase",letterSpacing:.8}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Trend indicator */}
      {trend!==null&&<div style={{background:trend>=0?"rgba(52,211,153,0.07)":"rgba(255,107,107,0.07)",border:`1px solid ${trend>=0?"rgba(52,211,153,0.22)":"rgba(255,107,107,0.22)"}`,borderRadius:11,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
        <div style={{fontSize:18}}>{trend>=0?"📈":"📉"}</div>
        <div>
          <div style={{color:trend>=0?"#34d399":"#FF6B6B",fontWeight:800,fontSize:12}}>
            {trend>=0?"↑":"↓"} {Math.abs(Math.round(trend*10)/10)} marks {trend>=0?"improvement":"decline"}
          </div>
          <div style={{color:t.sub,fontSize:9,marginTop:1}}>Last 5 avg: {l5avg} · Prev 5 avg: {p5avg}</div>
        </div>
      </div>}

      {/* Mini trend graph */}
      {graphMocks.length>1&&<div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:13,padding:"12px 10px"}}>
        <div style={{color:t.sub,fontSize:8,textTransform:"uppercase",letterSpacing:1.5,marginBottom:10}}>Score Trend — Last {graphMocks.length} Mocks</div>
        <div style={{overflowX:"auto"}}>
          <svg width={Math.max(graphMocks.length*W_CELL+20,200)} height={H+30} style={{display:"block"}}>
            {/* Grid lines */}
            {[0,0.25,0.5,0.75,1].map(f=><line key={f} x1={10} x2={graphMocks.length*W_CELL+10} y1={H-f*H} y2={H-f*H} stroke={t.border} strokeWidth={0.5} strokeDasharray="3,3"/>)}
            {/* Line */}
            <polyline fill="none" stroke="#818cf8" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
              points={graphMocks.map((m,i)=>{
                const x=10+i*W_CELL+(W_CELL/2);
                const y=H-((m.score-graphMin)/graphRange)*H;
                return`${x},${Math.max(4,Math.min(H-2,y))}`;
              }).join(" ")}/>
            {/* Area fill */}
            <polygon fill="rgba(129,140,248,0.08)"
              points={[
                ...graphMocks.map((m,i)=>{
                  const x=10+i*W_CELL+(W_CELL/2);
                  const y=H-((m.score-graphMin)/graphRange)*H;
                  return`${x},${Math.max(4,Math.min(H-2,y))}`;
                }),
                `${10+(graphMocks.length-1)*W_CELL+(W_CELL/2)},${H}`,
                `${10+(W_CELL/2)},${H}`
              ].join(" ")}/>
            {/* Dots + score labels */}
            {graphMocks.map((m,i)=>{
              const x=10+i*W_CELL+(W_CELL/2);
              const y=H-((m.score-graphMin)/graphRange)*H;
              const cy=Math.max(4,Math.min(H-2,y));
              const isLatest=i===graphMocks.length-1;
              return(<g key={m.id}>
                <circle cx={x} cy={cy} r={isLatest?5:3.5} fill={isLatest?"#34d399":"#818cf8"} stroke={t.bg} strokeWidth={1.5}/>
                <text x={x} y={cy-8} textAnchor="middle" fontSize={7} fill={isLatest?"#34d399":t.sub} fontWeight={isLatest?"900":"600"}>{m.score}</text>
                <text x={x} y={H+14} textAnchor="middle" fontSize={6} fill={t.muted}>M{i+1}</text>
              </g>);
            })}
          </svg>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <div style={{color:t.muted,fontSize:8}}>First: {graphMocks[0]?.name?.slice(0,12)||"Mock 1"}</div>
          <div style={{color:"#34d399",fontSize:8,fontWeight:700}}>Latest: {graphMocks[graphMocks.length-1]?.name?.slice(0,12)||"Latest"}</div>
        </div>
      </div>}
    </>}

    {/* Mock history */}
    {loading&&<div style={{color:t.sub,fontSize:11,textAlign:"center",padding:"20px 0"}}>Loading tests…</div>}
    {!loading&&total===0&&!showAdd&&<div style={{background:"rgba(129,140,248,0.05)",border:"1px dashed rgba(129,140,248,0.25)",borderRadius:13,padding:"24px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:8}}>📈</div>
      <div style={{color:t.text,fontWeight:700,fontSize:13,marginBottom:4}}>No mock tests yet</div>
      <div style={{color:t.sub,fontSize:11,marginBottom:14}}>Track your {examKey} {examMode} performance</div>
      <button onClick={()=>setShowAdd(true)} style={{background:"linear-gradient(135deg,#818cf8,#34d399)",border:"none",borderRadius:10,padding:"9px 18px",color:"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Add First Mock</button>
    </div>}
    {!loading&&mocks.length>0&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      <div style={{color:t.sub,fontSize:8,textTransform:"uppercase",letterSpacing:1.5}}>History — {total} test{total!==1?"s":""}</div>
      {mocks.map((m,idx)=>{
        const p=m.percentage;
        const pc=p>=60?"#34d399":p>=40?"#FFB86B":"#FF6B6B";
        const isEdit=editId===m.id;
        return(<div key={m.id} style={{background:t.card,border:`1px solid ${pc}22`,borderRadius:12,padding:"11px 12px",transition:"border .2s"}}>
          {isEdit?(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <div style={{color:t.muted,fontSize:8,textTransform:"uppercase",letterSpacing:1}}>Edit Test</div>
              <input value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} style={{background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 9px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              <div style={{display:"flex",gap:6}}>
                <input type="date" value={editForm.date} onChange={e=>setEditForm(f=>({...f,date:e.target.value}))} style={{flex:1,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:10,fontFamily:"inherit",outline:"none",colorScheme:t.bg==="#08080f"?"dark":"light"}}/>
                <input type="number" value={editForm.score} onChange={e=>setEditForm(f=>({...f,score:e.target.value}))} placeholder="Score" style={{width:60,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
                <input type="number" value={editForm.total} onChange={e=>setEditForm(f=>({...f,total:e.target.value}))} placeholder="Total" style={{width:60,background:t.input,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 8px",color:t.text,fontSize:11,fontFamily:"inherit",outline:"none"}}/>
              </div>
              <div style={{display:"flex",gap:6}}>
                <button onClick={saveEdit} style={{flex:1,background:"#34d399",border:"none",borderRadius:8,padding:"7px",color:"#0a0a0f",fontWeight:800,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                <button onClick={()=>setEditId(null)} style={{background:t.pill,border:"none",borderRadius:8,padding:"7px 11px",color:t.sub,fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              </div>
            </div>
          ):(
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              {/* Rank badge */}
              <div style={{width:30,height:30,borderRadius:9,background:`${pc}15`,border:`1px solid ${pc}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{color:pc,fontWeight:900,fontSize:9}}>#{total-idx}</span>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{color:t.text,fontWeight:700,fontSize:11,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
                <div style={{color:t.sub,fontSize:9,marginTop:1}}>{fmtDate(m.date)}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{color:t.text,fontWeight:800,fontSize:12}}>{m.score}<span style={{color:t.muted,fontSize:9,fontWeight:600}}>/{m.totalMarks}</span></div>
                <div style={{color:pc,fontWeight:900,fontSize:10}}>{p}%</div>
              </div>
              <div style={{display:"flex",gap:4,flexShrink:0}}>
                <button onClick={()=>startEdit(m)} style={{background:t.pill,border:"none",borderRadius:6,padding:"4px 7px",color:t.sub,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>✎</button>
                <button onClick={()=>setDelId(m.id)} style={{background:"rgba(255,107,107,0.1)",border:"none",borderRadius:6,padding:"4px 7px",color:"#FF6B6B",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>🗑</button>
              </div>
            </div>
          )}
        </div>);
      })}
    </div>}
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

  return(<div className="ss-feature-grid" style={{display:"flex",flexDirection:"column",gap:13}}>
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
function NCenter({t,onClose,history,settings,setSettings}){
  const list=[{k:"streakBreak",i:"🔥",l:"Streak Break Warning",d:"Alert if not studied by 9 PM"},{k:"studyReminder",i:"📖",l:"Daily Study Reminder",d:"Morning study nudge"},{k:"pomoDone",i:"⏱",l:"Pomodoro Complete",d:"Notify when session ends"},{k:"friendActivity",i:"👥",l:"Friend Activity",d:"When friends start studying"},{k:"leaderboard",i:"🏆",l:"Leaderboard Updates",d:"Weekly rank changes"},{k:"sound",i:"🔊",l:"Timer Sounds",d:"Play sound on session/break completion"}];
  return(<div style={{position:"fixed",inset:0,zIndex:8000,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(5px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bg,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:520,maxHeight:"80vh",overflowY:"auto",border:`1px solid ${t.border}`,borderBottom:"none",padding:"13px 14px 32px"}}>
      <div style={{width:28,height:4,background:t.border,borderRadius:2,margin:"0 auto 12px"}}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><div style={{fontSize:13,fontWeight:800,color:t.text}}>🔔 Notifications</div></div>
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
  const [dark,setDark]=useState(()=>{
    const saved=localStorage.getItem("ss_theme");
    return saved!==null?saved==="dark":true;
  });
 // Persist theme to localStorage on every change
useEffect(()=>{
  localStorage.setItem("ss_theme",dark?"dark":"light");
},[dark]);

// Sync document background with current theme (iPhone safe area)
useEffect(()=>{
  const theme = dark ? T.dark : T.light;
  document.documentElement.style.background = theme.bg;
  document.body.style.background = theme.bg;
},[dark]);
  const [loggedIn,setLoggedIn]=useState(false);
  const [user,setUser]=useState(null);
    //added changes for retaining login session
  const [checkingAuth, setCheckingAuth] = useState(true); 
  const buildUserProfile=useCallback(async(authUser)=>{
    if(!authUser)return null;
    const fallbackName=authUser.name||authUser.displayName||authUser.email||"Aspirant";
    let savedName="";
    if(authUser.uid){
      try{
        const mod=await import("./firebase");
        const snap=await new Promise(res=>mod.onValue(mod.ref(mod.db,`users/${authUser.uid}/profile/name`),(s)=>{res(s);},{onlyOnce:true}));
        if(snap.exists()&&typeof snap.val()==="string"&&snap.val().trim())savedName=snap.val().trim();
      }catch(e){}
    }
    return {
      name:savedName||fallbackName,
      email:authUser.email||"",
      uid:authUser.uid,
      phone:authUser.phone,
      photoURL:authUser.photoURL
    };
  },[]);
  useEffect(() => {
  const auth = getAuth();
  let active=true;

  const unsub = onAuthStateChanged(auth, async (authUser) => {
    if (authUser) {
      const profile=await buildUserProfile(authUser);
      if(!active)return;
      setUser(profile);
      setLoggedIn(true);
    } else {
      if(!active)return;
      setUser(null);
      setLoggedIn(false);
    }
    setCheckingAuth(false); // 👈 IMPORTANT
  });
return () => {active=false;unsub();};
}, [buildUserProfile]);

   // changes end 
  const [isPro,setIsPro]=useState(false);
  const [proOpen,setProOpen]=useState(false);
  const [restoreOpen,setRestoreOpen]=useState(false);
  const [tab,setTab]=useState("timer");
  const [nOpen,setNOpen]=useState(false);
  const [qrOpen,setQrOpen]=useState(false);
  const [exOpen,setExOpen]=useState(false);
  const [friends,setFriends]=useState([]);
  const [toasts,setToasts]=useState([]);
  const [nHist,setNHist]=useState([]);
  const [ns,setNs]=useState({streakBreak:true,studyReminder:true,pomoDone:true,friendActivity:false,leaderboard:false,sound:true});
  // ── LIFTED POMO STATE — persists across all tab switches ──
  const POMO_LS_KEY="ss_pomo_state";
  const [pomoMode,setPomoMode]=useState(()=>{
    try{const s=JSON.parse(localStorage.getItem(POMO_LS_KEY)||"{}");return s.mode||"focus";}catch{return"focus";}
  });
  const [pomoCf,setPomoCf]=useState(()=>parseInt(localStorage.getItem("ss_pomo_dur")||"25"));
  const [pomoRun,setPomoRun]=useState(false); // never restore as running — calculate elapsed instead
  const [pomoSess,setPomoSess]=useState(0);
  const [pomoCs,setPomoCs]=useState("");
  // Restore remaining seconds accounting for elapsed time while page was closed
  const [pomoSec,setPomoSec]=useState(()=>{
    try{
      const s=JSON.parse(localStorage.getItem(POMO_LS_KEY)||"{}");
      if(s.running&&s.endTime){
        const remaining=Math.round((s.endTime-Date.now())/1000);
        if(remaining>0&&remaining<=s.totalSec){
          // Page was refreshed mid-session — resume with correct time
          return remaining;
        }
      }
      return s.sec||(parseInt(localStorage.getItem("ss_pomo_dur")||"25")*60);
    }catch{return parseInt(localStorage.getItem("ss_pomo_dur")||"25")*60;}
  });
  // Restore running state after we know the time is valid
  const [_pomoRestored]=useState(()=>{
    try{
      const s=JSON.parse(localStorage.getItem(POMO_LS_KEY)||"{}");
      return s.running&&s.endTime&&Math.round((s.endTime-Date.now())/1000)>0;
    }catch{return false;}
  });
  const pomoIntervalRef=useRef(null);

  // Restore running after mount (needs pomoSec to be set first)
  // Also prime the endTime ref so the interval has an accurate endTime immediately
  useEffect(()=>{
    if(_pomoRestored){
      try{
        const saved=JSON.parse(localStorage.getItem(POMO_LS_KEY)||"{}");
        if(saved.endTime&&saved.endTime>Date.now()) pomoEndTimeRef.current=saved.endTime;
      }catch{}
      setPomoRun(true);
    }
  },[]);
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
        // Streak is loaded here only. Study-session completion is the single normal writer/resetter.
      }catch(e){console.error("stats load error",e);}
    })();
    return()=>{
      if(dbMod){
        if(streakRef&&streakListener)dbMod.off(streakRef,streakListener);
        if(statsRef&&statsListener)dbMod.off(statsRef,statsListener);
      }
    };
  },[user?.uid]);
  const [examSubjects,setExamSubjects]=useState({});
  const [customExams,setCustomExams]=useState([]);
  const [examDates,setExamDates]=useState({});
  const [examTips,setExamTips]=useState({});
  const [es,setEs]=useState(()=>buildExamState());
  // Derived: custom subjects scoped to current exam + mode (always after es)
  // Deduplicated case-insensitively at derivation — never leaks between exams
  const customSubjects=useMemo(()=>{
    const raw=examSubjects[es.key]?.[es.mode]||[];
    const seen=new Set();
    return raw.filter(s=>{const k=(s.n||"").toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true;});
  },[examSubjects,es.key,es.mode]);

  // Load independent exam dates/tips + customSubjects + customExams from Firebase on login
  useEffect(()=>{
    if(!user?.uid){setExamDates({});setExamTips({});setEs(buildExamState());setExamSubjects({});setCustomExams([]);return;}
    (async()=>{
      try{
        const mod=await import("./firebase");
        const readOnce=path=>new Promise(res=>mod.onValue(mod.ref(mod.db,path),(s)=>{res(s);},{onlyOnce:true}));
       const [datesSnap,tipsSnap,selectionSnap,legacySnap,customSubjSnap,examSubjectsSnap,customExamsSnap]=await Promise.all([
          readOnce(`users/${user.uid}/examDates`),
          readOnce(`users/${user.uid}/examTips`),
          readOnce(`users/${user.uid}/examSelection`),
          readOnce(`users/${user.uid}/examConfig`),
          readOnce(`users/${user.uid}/customSubjects`),
          readOnce(`users/${user.uid}/examSubjects`),
          readOnce(`users/${user.uid}/customExams`),
        ]);

        // Custom exams — load first so buildExamState can validate custom keys
        let loadedCustomExams=[];
        if(customExamsSnap.exists()){
          const raw=customExamsSnap.val();
          loadedCustomExams=Object.entries(raw).map(([id,v])=>({...v,id}));
          setCustomExams(loadedCustomExams);
        }
        const customExamIds=loadedCustomExams.map(c=>c.id);

        // Resolve selection — allow custom exam IDs through
        const selectionRaw=selectionSnap.exists()?selectionSnap.val():legacySnap.exists()?legacySnap.val():null;
        const rawKey=selectionRaw?.key||"";
        const key=EXAMS[rawKey]?rawKey:(customExamIds.includes(rawKey)?rawKey:DEFAULT_EXAM_KEY);
        const mode=EXAMS[key]?.modes?.[selectionRaw?.mode]?selectionRaw.mode:(customExamIds.includes(key)?"Exam":defaultModeFor(key,customExamIds));

        // Per-exam custom subjects — decode keys, deduplicate each scope
        const dedup=(arr)=>{const seen=new Set();return(Array.isArray(arr)?arr:Object.values(arr||{})).filter(s=>{const k=(s.n||"").toLowerCase().trim();if(!k||seen.has(k))return false;seen.add(k);return true;});};
        if(examSubjectsSnap.exists()){
          const rawObj=examSubjectsSnap.val();
          const parsed={};
          Object.keys(rawObj).forEach(k=>{
            const dk=decodeDbKey(k);
            parsed[dk]={};
            Object.keys(rawObj[k]).forEach(m=>{
              parsed[dk][decodeDbKey(m)]=dedup(rawObj[k][m]);
            });
          });
          setExamSubjects(parsed);
        } else if(customSubjSnap.exists()){
          // Migration: move old global subjects into current exam scope once
          const arr=dedup(customSubjSnap.val());
          if(arr.length>0){
            setExamSubjects({[key]:{[mode]:arr}});
            saveExamSubjectsToDb(user.uid,key,mode,arr);
          }
        }
        let dates=normalizeExamDates(datesSnap.exists()?datesSnap.val():{});
        let savedTips=normalizeExamTips(tipsSnap.exists()?tipsSnap.val():{});
        const legacy=legacySnap.exists()?legacySnap.val():null;
        if(legacy?.key&&legacy?.mode&&EXAMS[legacy.key]?.modes?.[legacy.mode]){
          if(legacy.date&&!dates?.[legacy.key]?.[legacy.mode]){
            dates={...dates,[legacy.key]:{...(dates[legacy.key]||{}),[legacy.mode]:legacy.date}};
            await mod.set(mod.ref(mod.db,`users/${user.uid}/examDates/${dbKey(legacy.key)}/${dbKey(legacy.mode)}`),legacy.date);
          }
          if(Array.isArray(legacy.tips)&&!savedTips?.[legacy.key]?.[legacy.mode]){
            savedTips={...savedTips,[legacy.key]:{...(savedTips[legacy.key]||{}),[legacy.mode]:legacy.tips}};
            await mod.set(mod.ref(mod.db,`users/${user.uid}/examTips/${dbKey(legacy.key)}/${dbKey(legacy.mode)}`),legacy.tips);
          }
        }
        
        setExamDates(dates);
        setExamTips(savedTips);
        setEs(buildExamState(key,mode,dates,savedTips,loadedCustomExams));
      }catch(e){console.error("exam dates load error",e);}
    })();
  },[user?.uid]);
  const tid=useRef(0);
  const t=dark?T.dark:T.light;
  const days=dl(es.date);

  // Live IST date/time
  const [istDate,setIstDate]=useState(()=>new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",weekday:"short",day:"2-digit",month:"short"}));
  useEffect(()=>{
    const tick=()=>setIstDate(new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",weekday:"short",day:"2-digit",month:"short"}));
    const iv=setInterval(tick,60000);
    return()=>clearInterval(iv);
  },[]);

  const onSessionComplete=useCallback(async()=>{
    if(!user?.uid)return;
    try{
      const mod=await import("./firebase");
      const today=istDateString();
      const yesterday=istDateString(-1);
      const statsRef=mod.ref(mod.db,`users/${user.uid}/stats`);
      const streakRef=mod.ref(mod.db,`users/${user.uid}/streak`);
      const [statsSnap,streakSnap]=await Promise.all([
        new Promise(res=>mod.onValue(statsRef,(s)=>{res(s);},{onlyOnce:true})),
        new Promise(res=>mod.onValue(streakRef,(s)=>{res(s);},{onlyOnce:true})),
      ]);
      const prev=statsSnap.exists()?statsSnap.val():{totalSessions:0,totalMinutes:0,lastStudyDate:""};
      let currentStreak=streakSnap.exists()?Number(streakSnap.val())||0:0;
      // Stats: always increment (each session counts)
      await mod.set(statsRef,{
        totalSessions:(prev.totalSessions||0)+1,
        totalMinutes:(prev.totalMinutes||0)+(pomoCfRef.current||25),
        lastStudyDate:today,
      });
      // Streak: only update once per day — guard against same-day double sessions
      if(prev.lastStudyDate!==today){
        if(prev.lastStudyDate===yesterday){
          currentStreak=currentStreak+1; // consecutive day
        } else if(!prev.lastStudyDate){
          currentStreak=1; // very first session ever
        } else {
          currentStreak=1; // missed one or more days — reset to 1
        }
        await mod.set(streakRef,currentStreak);
        setStreak(currentStreak);
      }
      // Same day: streak unchanged, only totalSessions/totalMinutes updated above
    }catch(e){console.error("onSessionComplete error",e);}
  },[user?.uid]);

  // ── APP-LEVEL TIMER — timestamp-based, never stale, survives all navigation ──
  // pomoEndTimeRef is the source of truth. Remaining seconds are derived from it every tick.
  const pomoEndTimeRef=useRef(null);

  // Sync endTime ref when pomoRun starts; reset completion guard ONLY if starting a fresh session (sec > 0)
  useEffect(()=>{
    if(pomoRun){
      // Only reset completion guard if there are seconds remaining — never reset at sec=0
      if(pomoSecRef.current>0){
        completionFiredRef.current=false;
      }
      try{
        const saved=JSON.parse(localStorage.getItem(POMO_LS_KEY)||"{}");
        if(saved.running&&saved.endTime&&saved.endTime>Date.now()){
          pomoEndTimeRef.current=saved.endTime;
        } else {
          pomoEndTimeRef.current=Date.now()+(pomoSecRef.current*1000);
        }
      }catch{pomoEndTimeRef.current=Date.now()+(pomoSecRef.current*1000);}
    } else {
      pomoEndTimeRef.current=null;
    }
  },[pomoRun]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{
    clearInterval(pomoIntervalRef.current);
    if(!pomoRun){
      const dur={focus:pomoCf,short:5,long:15};
      localStorage.setItem(POMO_LS_KEY,JSON.stringify({
        mode:pomoMode,sec:pomoSec,totalSec:dur[pomoMode]*60,
        running:false,cf:pomoCf,cs:pomoCs
      }));
      return;
    }
    const dur={focus:pomoCf,short:5,long:15};
    const totalSec=dur[pomoMode]*60;
    pomoIntervalRef.current=setInterval(()=>{
      if(!pomoEndTimeRef.current)return;
      const remaining=Math.round((pomoEndTimeRef.current-Date.now())/1000);
      if(remaining<=0){
        clearInterval(pomoIntervalRef.current);
        pomoEndTimeRef.current=null;
        setPomoSec(0);
        setPomoRun(false);
        localStorage.setItem(POMO_LS_KEY,JSON.stringify({
          mode:pomoModeRef.current,sec:totalSec,totalSec,
          running:false,cf:pomoCfRef.current,cs:pomoCsRef.current
        }));
        // setPomoSess and onSessionComplete handled exclusively by completion useEffect (guarded by completionFiredRef)
        return;
      }
      setPomoSec(remaining);
      if(remaining%5===0){
        localStorage.setItem(POMO_LS_KEY,JSON.stringify({
          mode:pomoModeRef.current,sec:remaining,totalSec,
          running:true,endTime:pomoEndTimeRef.current,
          cf:pomoCfRef.current,cs:pomoCsRef.current
        }));
      }
    },500);
    localStorage.setItem(POMO_LS_KEY,JSON.stringify({
      mode:pomoMode,sec:pomoSec,totalSec,
      running:true,endTime:pomoEndTimeRef.current,
      cf:pomoCf,cs:pomoCs
    }));
    return()=>clearInterval(pomoIntervalRef.current);
  },[pomoRun,pomoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle session completion side-effects (sound, notification, Firebase) — separate to avoid stale closures
  const pomoRunRef=useRef(pomoRun);
  const pomoModeRef=useRef(pomoMode);
  const pomoSecRef=useRef(pomoSec);
  const pomoSessRef=useRef(pomoSess);
  const pomoCsRef=useRef(pomoCs);
  const pomoCfRef=useRef(pomoCf);
  // Guard: completion effects fire exactly once per session
  const completionFiredRef=useRef(false);

  useEffect(()=>{pomoRunRef.current=pomoRun;},[pomoRun]);
  useEffect(()=>{pomoModeRef.current=pomoMode;},[pomoMode]);
  // Tracks whether sec rose above 0 during this session — prevents false completion at session start or after reset
  const secEverPositiveRef=useRef(false);
  useEffect(()=>{
    if(pomoRun&&pomoSec>0)secEverPositiveRef.current=true;
    if(!pomoRun&&pomoSec>0)secEverPositiveRef.current=false; // paused before zero — not a completion
  },[pomoRun,pomoSec]);

  useEffect(()=>{pomoSecRef.current=pomoSec;
    // Completion fires ONLY when: sec===0, not running, sec was previously >0 this session, guard not yet fired
    if(pomoSec===0&&!pomoRun&&secEverPositiveRef.current){
      if(completionFiredRef.current)return;
      completionFiredRef.current=true;
      secEverPositiveRef.current=false; // consumed — require new session to build up again
      if(pomoModeRef.current==="focus"){
        setPomoSess(n=>n+1); // single authoritative increment — guarded by completionFiredRef above
        try{
          const ctx=new(window.AudioContext||window.webkitAudioContext)();
          const gain=ctx.createGain();gain.connect(ctx.destination);
          [[523,0],[659,0.15],[784,0.3]].forEach(([freq,delay])=>{
            const o=ctx.createOscillator();o.type="sine";o.frequency.value=freq;o.connect(gain);
            gain.gain.setValueAtTime(0,ctx.currentTime+delay);
            gain.gain.linearRampToValueAtTime(ns?.sound?0.18:0,ctx.currentTime+delay+0.05);
            gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+0.55);
            o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+0.6);
          });
        }catch(e){}
        if(ns?.pomoDone)push({icon:"⏱",title:"Session complete! 🎉",body:`Great work on ${pomoCsRef.current}!`,col:"#818cf8"});
        if(user?.uid){
          const subject=pomoCsRef.current;const minutes=pomoCfRef.current;
          import("./firebase").then(mod=>{
            const today=istDateString();
            mod.set(mod.ref(mod.db,`users/${user.uid}/sessions/s_${Date.now()}`),{subject,minutes,completedAt:Date.now(),date:today});
            onSessionComplete();
          }).catch(()=>{});
        }
      } else {
        try{
          const ctx=new(window.AudioContext||window.webkitAudioContext)();
          const gain=ctx.createGain();gain.connect(ctx.destination);
          const o=ctx.createOscillator();o.type="sine";o.frequency.value=440;o.connect(gain);
          gain.gain.setValueAtTime(0,ctx.currentTime);
          gain.gain.linearRampToValueAtTime(ns?.sound?0.12:0,ctx.currentTime+0.05);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.8);
          o.start(ctx.currentTime);o.stop(ctx.currentTime+0.9);
        }catch(e){}
        if(ns?.pomoDone)push({icon:"☕",title:"Break over!",body:"Time to focus again 💪",col:"#34d399"});
      }
    }
  },[pomoSec,pomoRun]);
  useEffect(()=>{pomoCsRef.current=pomoCs;},[pomoCs]);
  useEffect(()=>{pomoCfRef.current=pomoCf;},[pomoCf]);

  const push=useCallback((n)=>{const id=++tid.current;const time=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});const notif={...n,id,time};setToasts(x=>[...x,notif]);setNHist(x=>[...x,notif]);setTimeout(()=>setToasts(x=>x.filter(y=>y.id!==id)),5000);},[]);
  const dismiss=useCallback((id)=>setToasts(x=>x.filter(y=>y.id!==id)),[]);
  // Expose user globally for components that can't receive it via props
  useEffect(()=>{window.__ssUser=user;},[user]);
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
  const FREE=[{id:"timer",icon:"⏱",l:"Timer",c:"#FF6B6B"},{id:"planner",icon:"📅",l:"Planner",c:"#FFB86B"},{id:"streak",icon:"🔥",l:"Streak",c:"#FF6B6B"},{id:"exam",icon:"🎯",l:"Exam",c:es.color||"#818cf8"},{id:"circle",icon:"👥",l:"Circle",c:"#C16BFF"},{id:"report",icon:"📊",l:"Report",c:"#6EE7F7"}];
  const PRO=[{id:"ai",icon:"🤖",l:"AI",c:"#818cf8"},{id:"syllabus",icon:"📋",l:"Syllabus",c:"#34d399"},{id:"notes",icon:"🃏",l:"Recall",c:"#6EE7F7"},{id:"mock",icon:"📈",l:"Mocks",c:"#FFB86B"}];
  const proIds=new Set(PRO.map(x=>x.id));
  const go=(id)=>{if(proIds.has(id)&&!isPro){setProOpen(true);return;}setTab(id);};

  if(!loggedIn)return(<div style={{background:t.bg,minHeight:"100vh"}}><style>{`*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style><Login t={t} onLogin={async u=>{const profile=await buildUserProfile(u);setUser(profile||u);setLoggedIn(true);push({icon:"🎁",title:"7-Day Free Trial Started!",body:"Full premium access — enjoy StudySync! 🎉",col:"#34d399"});}}/></div>);

  return(<div style={{minHeight:"100vh",background:t.bg,fontFamily:"'DM Sans','Segoe UI',sans-serif",color:t.text,transition:"background .3s"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input::placeholder{color:${t.muted};}::-webkit-scrollbar{width:3px;height:3px;}::-webkit-scrollbar-thumb{background:${t.border};border-radius:2px;}select option{background:${t.bg};}@keyframes slideIn{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}.ss-content{width:100%;max-width:520px;margin:0 auto;padding:14px 11px calc(132px + env(safe-area-inset-bottom));}.ss-bottom-nav{box-shadow:0 10px 34px rgba(0,0,0,.42);}@media (min-width:768px){.ss-content{max-width:min(1120px,calc(100vw - 48px));padding-left:18px!important;padding-right:18px!important;padding-bottom:calc(138px + env(safe-area-inset-bottom))!important;}.ss-feature-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:14px!important;align-items:start!important;}.ss-feature-grid>*{min-width:0;}.ss-feature-center{justify-items:center;}.ss-feature-center>*{width:100%;max-width:420px;}}@media (min-width:1200px){.ss-content{max-width:min(1360px,calc(100vw - 72px));padding-left:22px!important;padding-right:22px!important;}.ss-feature-grid{grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px!important;}}@media (min-width:768px){.ss-pomo-layout{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;}.ss-pomo-modes{order:1}.ss-pomo-ring{order:2}.ss-pomo-controls{order:3}.ss-pomo-stats{order:4}.ss-pomo-subjects{order:5}.ss-pomo-settings{order:6}.ss-pomo-subjects{max-width:620px!important;padding-top:2px}.ss-pomo-controls{margin-top:-2px}.ss-pomo-stats{margin-bottom:2px}}`}</style>

    <Toasts notifs={toasts} dismiss={dismiss} t={t}/>
    {nOpen&&<NCenter t={t} onClose={()=>setNOpen(false)} history={nHist} settings={ns} setSettings={setNs}/>}
    {qrOpen&&<QRModal t={t} user={user} onClose={()=>setQrOpen(false)} setFriends={setFriends}/>}
    {exOpen&&<ExamSetup t={t} es={es} setEs={setEs} onClose={()=>setExOpen(false)} examSubjects={examSubjects} setExamSubjects={setExamSubjects} customExams={customExams} setCustomExams={setCustomExams} examDates={examDates} setExamDates={setExamDates} examTips={examTips} setExamTips={setExamTips} user={user}/>}
    {proOpen&&<PricingModal t={t} onClose={()=>setProOpen(false)} isRestore={false} onUpgrade={()=>{setIsPro(true);push({icon:"⚡",title:"Welcome to Premium! 🎉",body:"All features unlocked!",col:"#818cf8"});}} onRestore={()=>{}}/>}
    {restoreOpen&&<PricingModal t={t} onClose={()=>setRestoreOpen(false)} isRestore={true} onUpgrade={()=>{}} onRestore={()=>{setStreak(s=>s+1);push({icon:"🔥",title:"Streak Restored! 🎉",body:`You're back to ${streak+1} days!`,col:"#FF6B6B"});}}/>}

    {/* Header */}
    <div style={{position:"sticky",top:0,zIndex:100,background:t.nav,backdropFilter:"blur(18px)",borderBottom:`1px solid ${t.border}`,paddingTop:"calc(7px + env(safe-area-inset-top, 0px))",paddingLeft:11,paddingRight:11,paddingBottom:7}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <Logo sz={26}/>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <div style={{fontSize:13,fontWeight:900,letterSpacing:-.3,background:"linear-gradient(135deg,#818cf8,#34d399)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1}}>StudySync</div>
              {isPro?<div style={{background:"linear-gradient(135deg,#818cf8,#34d399)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#fff"}}>PRO</div>:<div style={{background:"rgba(52,211,153,0.16)",border:"1px solid rgba(52,211,153,0.28)",borderRadius:5,padding:"1px 5px",fontSize:7,fontWeight:900,color:"#34d399"}}>7D FREE</div>}
              <span style={{fontSize:8,color:t.sub,fontWeight:500,marginLeft:2}}>{istDate}</span>
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
          {pomoRun&&tab!=="timer"&&<button onClick={()=>setTab("timer")} style={{background:"rgba(255,107,107,0.12)",border:"1px solid rgba(255,107,107,0.25)",borderRadius:11,padding:"3px 7px",display:"flex",alignItems:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}}><div style={{width:5,height:5,borderRadius:"50%",background:"#FF6B6B",animation:"pulse 1s infinite"}}/><span style={{color:"#FF6B6B",fontSize:8,fontWeight:800,fontVariantNumeric:"tabular-nums"}}>{pad(Math.floor(pomoSec/60))}:{pad(pomoSec%60)}</span></button>}
          <div onClick={()=>go("profile")} style={{width:27,height:27,borderRadius:"50%",background:"linear-gradient(135deg,#818cf8,#34d399)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:10,color:"#fff",cursor:"pointer",border:"1.5px solid rgba(129,140,248,0.25)"}}>{(user?.name||"K")[0].toUpperCase()}</div>
        </div>
      </div>
    </div>

    {/* Content */}
    <div className="ss-content">
      {tab==="timer"   &&<Pomo      t={t} subjects={es.subjects} customSubjects={customSubjects} pushN={push} ns={ns} isPro={isPro} user={user} onSessionComplete={onSessionComplete} pomoMode={pomoMode} setPomoMode={setPomoMode} pomoCf={pomoCf} setPomoCf={setPomoCf} pomoSec={pomoSec} setPomoSec={setPomoSec} pomoRun={pomoRun} setPomoRun={setPomoRun} pomoSess={pomoSess} setPomoSess={setPomoSess} pomoCs={pomoCs} setPomoCs={setPomoCs}/>}
      {tab==="planner" &&<Planner   t={t} subjects={es.subjects} customSubjects={customSubjects} user={user}/>}
      {tab==="streak"  &&<Streak    t={t} pushN={push} ns={ns} onRestore={()=>setRestoreOpen(true)} streak={streak} isPro={isPro} user={user}/>}
      {tab==="exam"    &&<ExamDash  t={t} es={es} setEs={setEs} onOpen={()=>setExOpen(true)} customSubjects={customSubjects} customExams={customExams} user={user} examDates={examDates} setExamDates={setExamDates} examTips={examTips} setExamTips={setExamTips}/>}
      {tab==="circle"  &&<Circle    t={t} friends={friends} setFriends={setFriends} openQR={()=>setQrOpen(true)} subjects={es.subjects} customSubjects={customSubjects} isPro={isPro} onPro={()=>setProOpen(true)} user={user} streak={streak}/>}
      {tab==="report"  &&<Report    t={t} es={es} user={user} streak={streak}/>}
      {tab==="profile" &&<Profile   t={t} user={user} setUser={setUser} es={es} isPro={isPro} onPro={()=>setProOpen(true)} streak={streak} stats={stats} onLogout={()=>{setLoggedIn(false);setUser(null);}}/>}
      {tab==="ai"      &&(isPro?<AI       t={t} subjects={es.subjects} customSubjects={customSubjects}/>:<Gate t={t} name="AI Study Assistant" icon="🤖" onPro={()=>setProOpen(true)}/>)}
      {tab==="syllabus"&&(isPro?<Syllabus t={t} subjects={es.subjects} customSubjects={customSubjects} user={user}/>:<Gate t={t} name="Syllabus Manager"    icon="📋" onPro={()=>setProOpen(true)}/>)}
      {tab==="notes"   &&(isPro?<Notes    t={t} subjects={es.subjects} customSubjects={customSubjects} es={es} user={user}/>:<Gate t={t} name="Active Recall Cards"  icon="🃏" onPro={()=>setProOpen(true)}/>)}
      {tab==="mock"    &&(isPro?<MockTest t={t} es={es} user={user}/>:<Gate t={t} name="Mock Test Tracker" icon="📈" onPro={()=>setProOpen(true)}/>)}
    </div>

    {/* Nav */}
    <div className="ss-bottom-nav" style={{position:"fixed",bottom:0,left:8,right:8,background:t.nav,backdropFilter:"blur(20px)",border:`1px solid ${t.border}`,borderRadius:18,zIndex:100,padding:"7px 0 10px"}}>
      {/* Pro row */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:2,paddingBottom:4,borderBottom:`1px solid ${t.border}`,marginBottom:3}}>
        {PRO.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",alignItems:"center",gap:2,background:active?`${tb.c}16`:"none",border:active?`1px solid ${tb.c}38`:"1px solid transparent",cursor:"pointer",padding:"6px 12px",minHeight:32,borderRadius:13,position:"relative"}}>
            <div style={{fontSize:11,filter:active?"none":!isPro?"grayscale(1) opacity(.45)":"opacity(.6)"}}>{tb.icon}</div>
            <div style={{fontSize:8,fontWeight:active?800:600,color:active?tb.c:t.sub,letterSpacing:.3}}>{tb.l}</div>
            {!isPro&&<div style={{position:"absolute",top:-1,right:3,fontSize:6,color:"#818cf8",fontWeight:900}}>⚡</div>}
          </button>
        );})}
        {!isPro&&<button onClick={()=>setProOpen(true)} style={{display:"flex",alignItems:"center",gap:2,background:"linear-gradient(135deg,rgba(129,140,248,0.12),rgba(52,211,153,0.07))",border:"1px solid rgba(129,140,248,0.2)",borderRadius:13,padding:"6px 10px",minHeight:32,cursor:"pointer",fontFamily:"inherit",marginLeft:3}}>
          <span style={{fontSize:8,color:"#818cf8",fontWeight:800}}>⚡ Try Free</span>
        </button>}
      </div>
      {/* Free row */}
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {FREE.map(tb=>{const active=tab===tb.id;return(
          <button key={tb.id} onClick={()=>go(tb.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,background:"none",border:"none",cursor:"pointer",color:active?tb.c:t.muted,transition:"all .2s",padding:"6px 4px",minHeight:44,minWidth:42,flex:1}}>
            <div style={{fontSize:15,filter:active?"none":"grayscale(1) opacity(.55)",transform:active?"scale(1.1)":"scale(1)",transition:"all .2s"}}>{tb.icon}</div>
            <div style={{fontSize:7,fontWeight:active?800:500,letterSpacing:.5,textTransform:"uppercase",color:active?tb.c:t.sub}}>{tb.l}</div>
            {active&&<div style={{width:3,height:3,borderRadius:"50%",background:tb.c}}/>}
          </button>
        );})}
      </div>
    </div>
  </div>);
}

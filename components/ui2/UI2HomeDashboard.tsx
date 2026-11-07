"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Editorial = { slug: string; title: string; category: string; read: number } | null;
type Pulse = { streak: number; attempts: number; accuracy: number | null };
type Zone = { id:string; title:string; subtitle:string; tag:string; href:string; tone:string; panX:string; panY:string; zoom:number; object:string; detail:string };
const zones:Zone[]=[
{id:"study",title:"Study Studio",subtitle:"Subjects · Syllabus · Notes",tag:"01 / STUDY",href:"/study",tone:"sage",panX:"15%",panY:"9%",zoom:1.65,object:"books",detail:"Your structured space for subjects, syllabus mapping and focused study."},
{id:"library",title:"Knowledge Library",subtitle:"Books · Resources · Reading",tag:"02 / LIBRARY",href:"/library",tone:"blue",panX:"-17%",panY:"7%",zoom:1.62,object:"library",detail:"Explore curated study resources, notes, documents and reference material."},
{id:"crux",title:"Daily Crux",subtitle:"Editorial · Current affairs",tag:"03 / DAILY CRUX",href:"/todays-glimpses",tone:"coral",panX:"14%",panY:"-15%",zoom:1.72,object:"newspaper",detail:"Read the day's most important issues with context, facts and exam relevance."},
{id:"drill",title:"Daily Drill",subtitle:"Recall · Practice · Accuracy",tag:"04 / DAILY DRILL",href:"/practice/daily",tone:"violet",panX:"-13%",panY:"-12%",zoom:1.72,object:"target",detail:"Strengthen recall with daily questions and track your practice."},
{id:"mains",title:"Mains Atelier",subtitle:"Answer writing · Analysis",tag:"05 / MAINS",href:"/mains-practice",tone:"amber",panX:"0%",panY:"19%",zoom:1.72,object:"notebook",detail:"Turn understanding into structured, analytical mains answers."},
{id:"mock",title:"Examination Hall",subtitle:"Mock tests · Timed practice",tag:"06 / MOCK TESTS",href:"/mock-test",tone:"rose",panX:"-22%",panY:"17%",zoom:1.62,object:"exam",detail:"Attempt full-length tests in a focused examination environment."},
{id:"progress",title:"Progress Observatory",subtitle:"Streak · Accuracy · Growth",tag:"07 / PROGRESS",href:"/progress",tone:"mint",panX:"20%",panY:"14%",zoom:1.62,object:"chart",detail:"Understand your learning rhythm, performance and improvement areas."}
];
function ClayObject({type}:{type:string}){
 if(type==="books")return <div className="clay-object books-object"><i/><i/><i/><b>GS</b></div>;
 if(type==="library")return <div className="clay-object shelf-object"><i/><i/><i/><i/><b/></div>;
 if(type==="newspaper")return <div className="clay-object paper-object"><b>THE DAILY</b><i/><i/><i/></div>;
 if(type==="target")return <div className="clay-object target-object"><i/><i/><b/></div>;
 if(type==="notebook")return <div className="clay-object notebook-object"><b>WRITE</b><i/><i/><i/></div>;
 if(type==="exam")return <div className="clay-object exam-object"><b>TEST</b><i/><i/><i/></div>;
 return <div className="clay-object chart-object"><i/><i/><i/><b/></div>;
}
export default function UI2HomeDashboard(){
 const [name,setName]=useState("Learner");
 const [editorial,setEditorial]=useState<Editorial>(null);
 const [pulse,setPulse]=useState<Pulse>({streak:0,attempts:0,accuracy:null});
 const [signedIn,setSignedIn]=useState(false);
 const [loading,setLoading]=useState(true);
 const [activeZone,setActiveZone]=useState<string|null>(null);
 const [sceneReady,setSceneReady]=useState(false);
 useEffect(()=>{
  let active=true;
  async function load(){
   const supabase=getSupabaseBrowserClient();
   if(!supabase){if(active)setLoading(false);return;}
   const {data:{user}}=await supabase.auth.getUser();
   if(!active)return;
   setSignedIn(Boolean(user));
   if(!user){setLoading(false);return;}
   const [profile,attempts,activity,article]=await Promise.all([
    supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
    supabase.from("assessment_attempts").select("answered_count,correct_count,submitted_at").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",new Date(Date.now()-30*86400000).toISOString()).order("submitted_at",{ascending:false}).limit(300),
    supabase.from("student_activity").select("created_at").eq("student_id",user.id).gte("created_at",new Date(Date.now()-366*86400000).toISOString()),
    supabase.from("editorial_articles").select("slug,title_hi,title_en,category,read_minutes").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle()
   ]);
   if(!active)return;
   const fullName=profile.data?.full_name||user.user_metadata?.full_name;
   if(fullName)setName(String(fullName).trim().split(/\s+/)[0]);
   const rows=attempts.data||[];
   const answered=rows.reduce((n,row)=>n+(Number(row.answered_count)||0),0);
   const correct=rows.reduce((n,row)=>n+(Number(row.correct_count)||0),0);
   const dateKey=(date:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(date);
   const activeDays=new Set<string>();
   for(const row of activity.data||[])if(row.created_at)activeDays.add(dateKey(new Date(row.created_at)));
   for(const row of rows)if(row.submitted_at)activeDays.add(dateKey(new Date(row.submitted_at)));
   const today=dateKey(new Date()),yesterday=dateKey(new Date(Date.now()-86400000));
   let cursor=activeDays.has(today)?today:activeDays.has(yesterday)?yesterday:"",streak=0;
   while(cursor&&activeDays.has(cursor)){streak++;const [year,month,day]=cursor.split("-").map(Number);cursor=dateKey(new Date(Date.UTC(year,month-1,day)-86400000));}
   setPulse({streak,attempts:rows.length,accuracy:answered?Math.round(correct/answered*100):null});
   if(article.data)setEditorial({slug:article.data.slug,title:article.data.title_hi||article.data.title_en||"Today's Editorial",category:article.data.category||"Daily Crux",read:Number(article.data.read_minutes)||0});
   setLoading(false);
  }
  void load().catch(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{const timer=window.setTimeout(()=>setSceneReady(true),160);return()=>window.clearTimeout(timer);},[]);
 const hour=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"}).format(new Date()));
 const greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
 const selected=useMemo(()=>zones.find(zone=>zone.id===activeZone)||null,[activeZone]);
 const cameraStyle=selected?({"--camera-x":selected.panX,"--camera-y":selected.panY,"--camera-zoom":selected.zoom} as CSSProperties):undefined;
 const zoneClass=(id:string)=>"campus-zone zone-"+id+(activeZone===id?" is-selected":"");
 return <main className="gk2-app gk2-home gk2-campus" data-gk2-theme="paper">
  <div className="campus-topbar">
   <Link className="campus-brand" href="/"><span className="campus-brand-mark">G</span><span><strong>GYANKUNJ</strong><small>ACADEMY · THE LEARNING CAMPUS</small></span></Link>
   <div className="campus-date"><span className="campus-live-dot"/> YOUR CAMPUS IS OPEN <b>{new Intl.DateTimeFormat("en-IN",{dateStyle:"long",timeZone:"Asia/Kolkata"}).format(new Date())}</b></div>
   <Link className="campus-account" href={signedIn?"/profile":"/login"}>{signedIn?name:"Sign in"} <span>↗</span></Link>
  </div>
  <section className="campus-welcome">
   <div><p className="campus-eyebrow">A PLACE TO THINK, LEARN & GROW</p><h1>{greeting}, <em>{name}.</em></h1><p className="campus-welcome-copy">Welcome to your learning campus. Choose a place to begin.</p></div>
   <div className="campus-weather-note"><span className="campus-sun">✳</span><span><b>YOUR DAILY RHYTHM</b><small>{loading?"Gathering your learning activity…":pulse.streak+" day learning streak · "+pulse.attempts+" recent tests"}</small></span></div>
  </section>
  <section className={"campus-experience"+(sceneReady?" is-ready":"")+(selected?" has-focus":"")} aria-label="Interactive 3D learning campus">
   <div className="campus-scene-heading"><span>EXPLORE YOUR CAMPUS</span><small>{selected?"CAMERA FOCUSED · TAP EXPLORE TO ENTER":"SELECT A PLACE TO TAKE A CLOSER LOOK"}</small></div>
   <div className="campus-viewport"><div className="campus-camera" style={cameraStyle}><div className="campus-world">
    <div className="campus-ground-shadow"/><div className="campus-ground"/><div className="campus-backdrop-shape shape-one"/><div className="campus-backdrop-shape shape-two"/>
    <div className="campus-main-platform"><div className="platform-side platform-front"/><div className="platform-side platform-right"/><div className="campus-path path-one"/><div className="campus-path path-two"/>
     <button className={zoneClass("study")} onClick={()=>setActiveZone(activeZone==="study"?null:"study")} aria-label="Focus Study Studio"><span className="zone-roof roof-sage"/><span className="zone-wall wall-sage"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">01 <b>STUDY STUDIO</b></span><ClayObject type="books"/></button>
     <button className={zoneClass("library")} onClick={()=>setActiveZone(activeZone==="library"?null:"library")} aria-label="Focus Knowledge Library"><span className="zone-roof roof-blue"/><span className="zone-wall wall-blue"><i/><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">02 <b>KNOWLEDGE LIBRARY</b></span><ClayObject type="library"/></button>
     <button className={zoneClass("crux")} onClick={()=>setActiveZone(activeZone==="crux"?null:"crux")} aria-label="Focus Daily Crux"><span className="zone-roof roof-coral"/><span className="zone-wall wall-coral"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">03 <b>DAILY CRUX</b></span><ClayObject type="newspaper"/></button>
     <button className={zoneClass("drill")} onClick={()=>setActiveZone(activeZone==="drill"?null:"drill")} aria-label="Focus Daily Drill"><span className="zone-roof roof-violet"/><span className="zone-wall wall-violet"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">04 <b>DAILY DRILL</b></span><ClayObject type="target"/></button>
     <button className={zoneClass("mains")} onClick={()=>setActiveZone(activeZone==="mains"?null:"mains")} aria-label="Focus Mains Atelier"><span className="zone-roof roof-amber"/><span className="zone-wall wall-amber"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">05 <b>MAINS ATELIER</b></span><ClayObject type="notebook"/></button>
     <button className={zoneClass("mock")} onClick={()=>setActiveZone(activeZone==="mock"?null:"mock")} aria-label="Focus Examination Hall"><span className="zone-roof roof-rose"/><span className="zone-wall wall-rose"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">06 <b>EXAMINATION HALL</b></span><ClayObject type="exam"/></button>
     <button className={zoneClass("progress")} onClick={()=>setActiveZone(activeZone==="progress"?null:"progress")} aria-label="Focus Progress Observatory"><span className="zone-roof roof-mint"/><span className="zone-wall wall-mint"><i/><i/><i/></span><span className="zone-base"/><span className="zone-tag">07 <b>PROGRESS</b></span><ClayObject type="chart"/></button>
     <div className="campus-central-hub"><span className="hub-orbit"/><span className="hub-emblem">G.</span><b>THE KNOWLEDGE HUB</b><small>LEARN WITH INTENT</small></div>
     <div className="campus-steps"><i/><i/><i/><i/></div><div className="campus-tree tree-left"><i/><b/></div><div className="campus-tree tree-right"><i/><b/></div><div className="campus-lamp lamp-left"><i/></div><div className="campus-lamp lamp-right"><i/></div>
    </div>
   </div></div></div>
   <div className="campus-scene-legend"><span><i className="legend-dot"/> INTERACTIVE ZONES</span><span>7 DESTINATIONS · ONE LEARNING WORLD</span><button onClick={()=>setActiveZone(null)} disabled={!selected}>↺ RESET VIEW</button></div>
   {selected&&<div className="campus-focus-card" key={selected.id}><div className={"focus-object focus-"+selected.tone}><ClayObject type={selected.object}/></div><div className="focus-copy"><span>{selected.tag}</span><h2>{selected.title}</h2><p>{selected.detail}</p></div><Link className="campus-enter-button" href={selected.href}>Explore section <span>↗</span></Link><button className="campus-focus-close" onClick={()=>setActiveZone(null)} aria-label="Close focus">×</button></div>}
  </section>
  <section className="campus-lower">
   <div className="campus-editorial"><div className="editorial-illustration"><span className="editorial-sun">✳</span><div className="editorial-paper"><b>THE DAILY</b><i/><i/><i/><small>ISSUE 01</small></div><span className="editorial-pencil"/></div><div className="editorial-copy"><span className="campus-eyebrow">TODAY'S EDITORIAL · {editorial?.read||8} MIN READ</span><h2>{editorial?.title||"A fresh perspective begins here."}</h2><p>{editorial?.category||"Current affairs · Context · Analysis"}</p><Link href={editorial?"/current-affairs/"+editorial.slug:"/current-affairs"}>Read today's analysis ↗</Link></div></div>
   <div className="campus-progress"><div className="campus-progress-heading"><span className="campus-eyebrow">YOUR LEARNING RHYTHM</span><Link href="/progress">Full report ↗</Link></div><div className="campus-metrics"><div><strong>{loading?"—":pulse.streak}</strong><small>DAY STREAK</small></div><div><strong>{loading?"—":pulse.attempts}</strong><small>TESTS</small></div><div><strong>{loading||pulse.accuracy===null?"—":pulse.accuracy+"%"}</strong><small>ACCURACY</small></div></div><div className="campus-progress-note">Small steps, meaningful progress.</div></div>
  </section>
  <footer className="campus-footer"><span>GYANKUNJ ACADEMY</span><span>BUILT FOR CURIOUS MINDS</span><Link href="/profile">YOUR ACCOUNT ↗</Link></footer>
  <nav className="campus-mobile-nav" aria-label="Quick navigation"><Link href="/">Campus</Link><Link href="/study">Study</Link><Link href="/todays-glimpses">Today</Link><Link href="/profile">Account</Link></nav>
 </main>;
}

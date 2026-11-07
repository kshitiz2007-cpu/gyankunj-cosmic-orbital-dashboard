"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import "./home.css";

type Stats={streak:number;quizzes:number;mocks:number;accuracy:number|null;answered:number;loading:boolean};
type Drill={count:number;title:string;href:string};
type Editorial={slug:string;title:string;category:string;read:number}|null;

const navigation=[{label:"Home",href:"/"},{label:"Study",href:"/library"},{label:"Daily Drill",href:"/practice/daily"},{label:"Editorial",href:"/current-affairs"},{label:"Progress",href:"/progress"}];

export default function UI2HomeDashboard(){
 const [name,setName]=useState("Learner");
 const [stats,setStats]=useState<Stats>({streak:0,quizzes:0,mocks:0,accuracy:null,answered:0,loading:true});
 const [drill,setDrill]=useState<Drill>({count:0,title:"Loading today's drill",href:"/practice/daily"});
 const [editorial,setEditorial]=useState<Editorial>(null);
 const [hasUser,setHasUser]=useState(false);

 useEffect(()=>{
  let alive=true;
  async function load(){
   const {getSupabaseBrowserClient}=await import("@/lib/supabase/client");
   const supabase=getSupabaseBrowserClient();
   if(!supabase){if(alive)setStats(s=>({...s,loading:false}));return;}
   const {data:{user}}=await supabase.auth.getUser();
   if(!alive)return;
   setHasUser(!!user);
   if(!user){setStats(s=>({...s,loading:false}));return;}
   const [profile,attempts,activity,assessment,article]=await Promise.all([
    supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
    supabase.from("assessment_attempts").select("id,answered_count,correct_count,submitted_at,assessment_id").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",new Date(Date.now()-30*86400000).toISOString()).order("submitted_at",{ascending:false}).limit(300),
    supabase.from("student_activity").select("created_at").eq("student_id",user.id).gte("created_at",new Date(Date.now()-366*86400000).toISOString()),
    supabase.from("assessments").select("id,title").eq("kind","daily_drill").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("editorial_articles").select("slug,title_hi,title_en,category,read_minutes").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle()
   ]);
   if(!alive)return;
   const fullName=profile.data?.full_name||user.user_metadata?.full_name;
   if(fullName)setName(String(fullName).trim().split(/\\s+/)[0]);
   const rows=attempts.data||[];
   const answered=rows.reduce((n,r)=>n+(Number(r.answered_count)||0),0);
   const correct=rows.reduce((n,r)=>n+(Number(r.correct_count)||0),0);
   const todayKey=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(d);
   const active=new Set<string>();
   for(const row of activity.data||[])if(row.created_at)active.add(todayKey(new Date(row.created_at)));
   for(const row of rows)if(row.submitted_at)active.add(todayKey(new Date(row.submitted_at)));
   const today=todayKey(new Date()),yesterday=todayKey(new Date(Date.now()-86400000));
   let cursor=active.has(today)?today:active.has(yesterday)?yesterday:"",streak=0;
   while(cursor&&active.has(cursor)){streak++;const [y,m,d]=cursor.split("-").map(Number);cursor=todayKey(new Date(Date.UTC(y,m-1,d)-86400000));}
   const mockIds=new Set<string>();for(const row of rows)if(row.assessment_id)mockIds.add(row.assessment_id);
   if(assessment.data){
    const {count}=await supabase.from("assessment_questions").select("question_id",{count:"exact",head:true}).eq("assessment_id",assessment.data.id);
    if(alive)setDrill({count:count||0,title:assessment.data.title||"Daily GS Drill",href:"/practice/daily"});
   }else if(alive)setDrill({count:0,title:"No drill published yet",href:"/practice/daily"});
   if(article.data&&alive)setEditorial({slug:article.data.slug,title:article.data.title_hi||article.data.title_en||"Today's Editorial",category:article.data.category||"Daily Crux",read:Number(article.data.read_minutes)||0});
   if(alive)setStats({streak,quizzes:rows.length,mocks:mockIds.size,accuracy:answered?Math.round(correct/answered*100):null,answered,loading:false});
  }
  void load().catch(()=>{if(alive)setStats(s=>({...s,loading:false}));});
  return()=>{alive=false;};
 },[]);

 const greeting=useMemo(()=>{const h=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"}).format(new Date()));return h<12?"Good morning":h<17?"Good afternoon":"Good evening";},[]);
 const dateLabel=useMemo(()=>new Intl.DateTimeFormat("en-IN",{weekday:"long",day:"numeric",month:"long",timeZone:"Asia/Kolkata"}).format(new Date()),[]);
 const value=(n:number)=>stats.loading?"—":String(n);
 return <main className="gk2-app gk2-home" data-gk2-theme="paper">
  <div className="gk2-home-wrap">
   <header className="gk2-topbar">
    <Link href="/" className="gk2-wordmark"><span className="gk2-wordmark-symbol">G.</span><span><b>GYANKUNJ</b><small>ACADEMY / LEARNING SYSTEM</small></span></Link>
    <nav className="gk2-topnav" aria-label="Main navigation">{navigation.map(item=><Link key={item.href} href={item.href} className={item.href==="/ "?"is-active":""}>{item.label}</Link>)}</nav>
    <Link href={hasUser?"/profile":"/login"} className="gk2-account">{hasUser?name:"Sign in"} <span>↗</span></Link>
   </header>

   <div className="gk2-home-content">
    <div className="gk2-date-line"><span className="gk2-eyebrow">YOUR PREPARATION / COMMAND CENTRE</span><span>{dateLabel}</span></div>
    <section className="gk2-home-hero">
     <div className="gk2-hero-copy"><span className="gk2-eyebrow">{greeting.toUpperCase()} / {name.toUpperCase()}</span><h1>Make knowledge<br/><em>count.</em></h1><p className="gk2-hindi">आज की तैयारी को एक स्पष्ट दिशा दें। पढ़ें, समझें, अभ्यास करें और हर दिन अपनी प्रगति को मापें।</p><div className="gk2-hero-ctas"><Link href="/todays-glimpses" className="gk2-button gk2-button--primary">Open today&apos;s briefing <span>↗</span></Link><Link href="/syllabus" className="gk2-text-link">Explore your syllabus <span>→</span></Link></div></div>
     <aside className="gk2-hero-note"><div className="gk2-note-top"><span>FIELD NOTE</span><span>NO. 001 / DAILY</span></div><div className="gk2-note-number">01<span>/04</span></div><div className="gk2-note-rule"/><h2>Read with intent.<br/>Revise with purpose.</h2><p>Small, consistent sessions build durable understanding.</p><Link href="/vault">Visit Memory Vault ↗</Link></aside>
    </section>

    <section className="gk2-home-section gk2-pulse-section">
     <div className="gk2-section-title"><div><span className="gk2-eyebrow">01 / LEARNING PULSE</span><h2>Your progress, in perspective.</h2></div><Link href="/progress" className="gk2-text-link">View report ↗</Link></div>
     <div className="gk2-metric-grid">
      <article className="gk2-metric"><span>CONSISTENCY</span><strong>{value(stats.streak)}<i> days</i></strong><small>Current study streak</small></article>
      <article className="gk2-metric"><span>PRACTICE</span><strong>{value(stats.quizzes)}</strong><small>Submitted assessments · 30 days</small></article>
      <article className="gk2-metric"><span>ACCURACY</span><strong>{stats.loading||stats.accuracy===null?"—":stats.accuracy+"%"}</strong><small>{value(stats.answered)} questions answered</small></article>
      <article className="gk2-metric gk2-metric--dark"><span>TEST ACTIVITY</span><strong>{value(stats.mocks)}</strong><small>Assessment IDs attempted · 30 days</small></article>
     </div>
    </section>

    <section className="gk2-home-section">
     <div className="gk2-section-title"><div><span className="gk2-eyebrow">02 / TODAY&apos;S WORK</span><h2>Choose your next move.</h2></div><span className="gk2-section-aside">A focused session is a good session.</span></div>
     <div className="gk2-work-grid">
      <Link href={drill.href} className="gk2-work-card gk2-work-card--feature"><div className="gk2-work-meta"><span>01 / PRACTICE</span><span className="gk2-card-arrow">↗</span></div><div className="gk2-work-icon">◎</div><div className="gk2-work-bottom"><h3>Daily Drill</h3><p>{drill.title}</p><span>{drill.count?drill.count+" questions available":"Open daily practice"} <b>→</b></span></div></Link>
      <Link href={editorial?"/current-affairs/"+editorial.slug:"/current-affairs"} className="gk2-work-card gk2-work-card--editorial"><div className="gk2-work-meta"><span>02 / READ & ANALYSE</span><span className="gk2-card-arrow">↗</span></div><div className="gk2-editorial-mark">“</div><div className="gk2-work-bottom"><h3>Daily Editorial</h3><p>{editorial?.title||"Explore the latest issue"}</p><span>{editorial?editorial.category+" · "+editorial.read+" min read":"Read current affairs"} <b>→</b></span></div></Link>
      <Link href="/library" className="gk2-work-card gk2-work-card--library"><div className="gk2-work-meta"><span>03 / STUDY</span><span className="gk2-card-arrow">↗</span></div><div className="gk2-library-mark">A—Z</div><div className="gk2-work-bottom"><h3>Study Library</h3><p>Structured notes and trusted resources.</p><span>Browse subjects <b>→</b></span></div></Link>
     </div>
    </section>

    <section className="gk2-home-section gk2-glimpses">
     <div><span className="gk2-eyebrow">03 / THE DAILY BRIEFING</span><h2>Everything important,<br/><em>in one place.</em></h2><p className="gk2-hindi">आज का संपादकीय, दैनिक अभ्यास और मुख्य परीक्षा का प्रश्न—एक ही स्थान पर।</p></div>
     <Link href="/todays-glimpses" className="gk2-button gk2-button--secondary">View today&apos;s glimpses ↗</Link>
    </section>
    {!hasUser&&<div className="gk2-signin-strip"><span>Sign in to sync your personal learning activity and progress.</span><Link href="/login">Sign in to Gyankunj ↗</Link></div>}
   </div>
   <nav className="gk2-mobile-nav" aria-label="Mobile navigation">{navigation.slice(0,4).map(item=><Link key={item.href} href={item.href} aria-current={item.href==="/ "?"page":undefined}><span>{item.label==="Home"?"⌂":item.label==="Study"?"▤":item.label==="Daily Drill"?"◎":"✳"}</span><small>{item.label}</small></Link>)}</nav>
   <footer className="gk2-home-footer"><span>GYANKUNJ / ACADEMY</span><span>LEARN · ANALYSE · PRACTICE</span><Link href="/profile">Your account ↗</Link></footer>
  </div>
 </main>;
}

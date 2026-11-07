"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./preview.module.css";
import "../../components/nextgen/design-tokens.css";

const modules = [
  { n:"01", title:"Daily Editorial", detail:"Read · Analyse · Connect", href:"/current-affairs", tone:"rose", tag:"TODAY'S INSIGHT" },
  { n:"02", title:"Daily Drill", detail:"5 questions · Build consistency", href:"/practice/daily", tone:"violet", tag:"PRACTICE NOW" },
  { n:"03", title:"Mains Practice", detail:"Think · Structure · Write", href:"/todays-glimpses#mains", tone:"cyan", tag:"WRITE & REFLECT" },
];
const nav = [{label:"Home",href:"/"},{label:"Study",href:"/library"},{label:"Practice",href:"/practice/daily"},{label:"Editorial",href:"/current-affairs"},{label:"Vault",href:"/vault"},{label:"Progress",href:"/progress"},{label:"Syllabus",href:"/syllabus"}];
export default function NextGenPreviewPage(){
 const [student,setStudent]=useState("Scholar");
 const [metrics,setMetrics]=useState({streak:"—",attempts:"—",topics:"—",answered:0,correct:0});
 const [editorial,setEditorial]=useState<{slug:string;title_hi:string|null;title_en:string|null;summary_hi:string|null;summary_en:string|null;read_minutes:number}|null>(null);
 const [drill,setDrill]=useState<{id:string;title:string;count:number}|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){if(active)setLoading(false);return;}
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){if(active)setLoading(false);return;}
   const since=new Date(Date.now()-30*86400000).toISOString();
   const [profile,attempts,topics,article,assessment,activity]=await Promise.all([
    supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle(),
    supabase.from("assessment_attempts").select("id,answered_count,correct_count,submitted_at").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",since).order("submitted_at",{ascending:false}).limit(500),
    supabase.from("student_topic_progress").select("id",{count:"exact",head:true}).eq("student_id",user.id).eq("exam_key","upsc-cse"),
    supabase.from("editorial_articles").select("slug,title_hi,title_en,summary_hi,summary_en,read_minutes").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("assessments").select("id,title").eq("kind","daily_drill").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("student_activity").select("created_at").eq("student_id",user.id).gte("created_at",new Date(Date.now()-370*86400000).toISOString())
   ]);
   if(!active)return;
   if(profile.data?.full_name)setStudent(profile.data.full_name.split(" ")[0]);
   const rows=attempts.data||[];
   const answered=rows.reduce((n,x)=>n+(Number(x.answered_count)||0),0);
   const correct=rows.reduce((n,x)=>n+(Number(x.correct_count)||0),0);
   const dateKey=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(d);
   const days=new Set<string>([...(activity.data||[]).map(x=>dateKey(new Date(x.created_at))),...rows.map(x=>dateKey(new Date(x.submitted_at)))]);
   let cursor=days.has(dateKey(new Date()))?dateKey(new Date()):dateKey(new Date(Date.now()-86400000));
   let streak=0;
   while(days.has(cursor)&&streak<370){streak++;const [y,m,d]=cursor.split("-").map(Number);cursor=new Date(Date.UTC(y,m-1,d)-86400000).toISOString().slice(0,10);}
   setMetrics({streak:String(streak),attempts:String(rows.length),topics:String(topics.count||0),answered,correct});
   if(article.data)setEditorial(article.data);
   if(assessment.data){
    const {count}=await supabase.from("assessment_questions").select("question_id",{count:"exact",head:true}).eq("assessment_id",assessment.data.id);
    if(active)setDrill({id:assessment.data.id,title:assessment.data.title,count:count||0});
   }
   setLoading(false);
  };
  void load().catch(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 return <main className={styles.app}>
  <aside className={styles.rail}>
   <Link href="/" className={styles.brand}><span className={styles.brandMark}>✳</span><span>GYANKUNJ<small>LEARNING UNIVERSE</small></span></Link>
   <span className={styles.railLabel}>YOUR WORKSPACE</span>
   {nav.map((item,i)=><Link key={item.href} href={item.href} className={i===0?styles.navActive:styles.navItem}><span>{["⌂","▤","◎","▧","✧","◷","⌘"][i]}</span>{item.label}</Link>)}
   <div className={styles.railBottom}><span className={styles.avatar}>GK</span><span>Learning profile<small>UPSC · CSE</small></span></div>
  </aside>
  <section className={styles.main}>
   <header className={styles.topbar}><div><span className={styles.breadcrumb}>GYANKUNJ / OVERVIEW</span><span className={styles.date}>YOUR PERSONAL LEARNING SPACE</span></div><div className={styles.topActions}><button aria-label="Search">⌕</button><button aria-label="Notifications">♧</button><span className={styles.avatar}>GK</span></div></header>
   <div className={styles.content}>
    <section className={styles.hero}>
     <div className={styles.heroCopy}><span className={styles.eyebrow}>YOUR LEARNING, IN MOTION <i/></span><h1>Make today<br/> <em>count.</em></h1><p>{editorial?.title_hi||editorial?.title_en||"A little progress every day becomes extraordinary preparation."}</p><Link href={drill?"/practice/daily":"/library"} className={styles.heroButton}>{drill?"Start daily drill":"Continue learning"} <span>↗</span></Link></div>
     <div className={styles.heroOrb}><div className={`${styles.orbit} ${styles.orbitOne}`}/><div className={`${styles.orbit} ${styles.orbitTwo}`}/><div className={styles.orbCore}><span>GK</span><small>YOUR<br/>UNIVERSE</small></div><span className={styles.orbitDot}/></div>
     <span className={styles.heroIndex}>01 <i/> LEARNING COMMAND CENTRE</span>
    </section>
    <section className={styles.welcomeRow}><div><span className={styles.eyebrow}>DAILY FOCUS · PERSONAL LEARNING</span><h2>Good morning, <em>{student}.</em></h2><p>{drill?`${drill.count} published questions · ${drill.title}`:"Your next milestone starts with one focused session."}</p></div><div className={styles.streak}><span>✦</span><strong>{metrics.streak} day<br/>learning streak</strong><small>DAILY CONSISTENCY</small></div></section>
    <section className={styles.stats}>
     <article className={styles.statCard}><span>LEARNING STREAK</span><strong>{loading?"—":metrics.streak} <small>days</small></strong><i>Keep showing up</i></article>
     <article className={styles.statCard}><span>QUESTIONS ANSWERED</span><strong>{loading?"—":metrics.answered}</strong><i>Across {metrics.attempts} submitted assessments</i></article>
     <article className={styles.statCard}><span>TOPICS MASTERED</span><strong>{loading?"—":metrics.topics}</strong><i>Tracked UPSC topics</i></article>
    </section>
    <section className={styles.sectionHead}><div><span className={styles.eyebrow}>THE DAILY THREE / 01</span><h2>Today&apos;s <em>focus.</em></h2></div><Link href="/todays-glimpses">View daily bundle ↗</Link></section>
    <section className={styles.dailyGrid}>{modules.map((item,i)=><Link href={item.href} key={item.n} className={styles["daily"+item.tone]}><span className={styles.cardTop}><small>{item.n} / {item.tag}</small><b>↗</b></span><span className={styles.cardNumber}>0{i+1}</span><h3>{item.title}</h3><p>{item.detail}</p><span className={styles.cardFoot}>OPEN MODULE <b>↗</b></span></Link>)}</section>
    <section className={styles.lowerGrid}><article className={styles.continue}><span className={styles.eyebrow}>PICK UP WHERE YOU LEFT OFF</span><h2>{editorial?.title_hi||editorial?.title_en||"Continue your"}<br/><em>study journey.</em></h2><p>{editorial?.summary_hi||editorial?.summary_en||"Your saved subjects and resources will appear here."}</p><Link href="/library">Explore study library ↗</Link></article><article className={styles.weekly}><span className={styles.eyebrow}>YOUR WEEKLY PULSE</span><h3>Consistency over intensity.</h3><div className={styles.weekBars}>{[36,58,42,78,50,88,24].map((v,i)=><span key={i} style={{height:v+"%"}}><i/></span>)}</div><small>Activity insights connect to your saved learning history.</small></article></section>
    <footer className={styles.footer}>GYANKUNJ ACADEMY <span>LEARN WITH INTENTION · GROW WITH PURPOSE</span></footer>
   </div>
  </section>
  <nav className={styles.mobileDock} aria-label="Mobile navigation">{nav.slice(0,5).map((item,i)=><Link key={item.href} href={item.href} className={i===0?styles.mobileActive:""}><span>{["⌂","▤","◎","▧","✧"][i]}</span><small>{item.label}</small></Link>)}</nav>
 </main>
}

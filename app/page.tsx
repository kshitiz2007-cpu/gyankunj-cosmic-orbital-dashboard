"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon, Search01Icon, Notification01Icon, UserCircleIcon,
  Notebook01Icon, NewspaperIcon, BookOpen01Icon, Layers01Icon,
  ChartLineData01Icon, UserGroupIcon, Brain01Icon, Compass01Icon,
  ArrowUpRight01Icon, FireIcon, Target01Icon, SparklesIcon,
  GraduationScrollIcon, Atom01Icon, CheckmarkCircle02Icon
} from "@hugeicons/core-free-icons";

type NodeItem = {
  id: string; title: string; subtitle: string; color: string;
  icon: typeof Notebook01Icon; href: string; angle: number;
};
const nodes: NodeItem[] = [
  { id:"drill", title:"DAILY", subtitle:"DRILL", color:"#f7bd66", icon:Notebook01Icon, href:"/practice/daily", angle:-90 },
  { id:"editorial", title:"DAILY", subtitle:"EDITORIAL", color:"#ff817b", icon:NewspaperIcon, href:"/current-affairs", angle:-135 },
  { id:"mock", title:"FULL-LENGTH", subtitle:"MOCK TEST", color:"#70cfff", icon:BookOpen01Icon, href:"/mock-test", angle:-45 },
  { id:"library", title:"STUDY", subtitle:"LIBRARY", color:"#76e2bd", icon:Layers01Icon, href:"/library", angle:180 },
  { id:"progress", title:"MY", subtitle:"PROGRESS", color:"#d48cff", icon:ChartLineData01Icon, href:"/progress", angle:0 },
  { id:"live", title:"LIVE", subtitle:"CLASSES", color:"#63d8f5", icon:UserGroupIcon, href:"/live", angle:135 },
  { id:"ai", title:"AI", subtitle:"COMPANION", color:"#f28fc9", icon:Brain01Icon, href:"/ai", angle:90 },
  { id:"syllabus", title:"EXPLORE", subtitle:"SYLLABUS", color:"#f3c879", icon:Compass01Icon, href:"/syllabus", angle:45 }
];
const subjects = [
  {slug:"polity",name:"Polity",icon:GraduationScrollIcon,color:"#70cfff"},
  {slug:"economy",name:"Economy",icon:ChartLineData01Icon,color:"#76e2bd"},
  {slug:"environment",name:"Environment",icon:Atom01Icon,color:"#9bdda0"},
  {slug:"science-tech",name:"Science & Tech",icon:SparklesIcon,color:"#b89cff"},
  {slug:"history",name:"History",icon:BookOpen01Icon,color:"#f3c879"},
  {slug:"geography",name:"Geography",icon:Layers01Icon,color:"#ff9f9a"},
];
const nav = [
  {name:"Home",icon:Home01Icon,href:"/"},
  {name:"Syllabus",icon:GraduationScrollIcon,href:"/syllabus"},
  {name:"Practice",icon:Notebook01Icon,href:"/practice/daily"},
  {name:"AI",icon:SparklesIcon,href:"/ai"},
  {name:"Live",icon:UserGroupIcon,href:"/live"},
  {name:"Library",icon:Layers01Icon,href:"/library"},
  {name:"Profile",icon:UserCircleIcon,href:"/profile"},
];

function Icon({icon,size=22}: {icon: typeof Home01Icon;size?:number}) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.7} />;
}

function OrbitalNode({item,index,reduceMotion,onSelect}: {item:NodeItem;index:number;reduceMotion:boolean;onSelect:(item:NodeItem)=>void}) {
  const content = <>
    <span className="orb-node__icon"><Icon icon={item.icon} size={31}/></span>
    <span className="orb-node__title">{item.title}<br/>{item.subtitle}</span>
    <span className="orb-node__sub">{item.id==="drill"?"PRACTICE · IMPROVE":item.id==="editorial"?"ANALYSE · CONNECT":item.id==="mock"?"EXAM · EVALUATE":item.id==="library"?"NOTES · PYQ · TESTS":item.id==="progress"?"TRACK · GROW":item.id==="live"?"LEARN · INTERACT":item.id==="ai"?"PLAN · SOLVE · EXPLAIN":"MAP · MASTER"}</span>
    <span className="orb-node__arrow"><Icon icon={ArrowUpRight01Icon} size={17}/></span>
  </>;
  const style={"--node":item.color,"--i":index} as React.CSSProperties;
  const animation={
    initial:reduceMotion?false:{opacity:0,scale:.72,y:18},
    animate:{opacity:1,scale:1,y:0},
    transition:{delay:.16+index*.07,duration:.7,ease:[.2,.8,.2,1] as const},
    whileHover:reduceMotion?undefined:{scale:1.045,y:-4},
    whileTap:{scale:.96}
  };
  if(item.id==="drill" || item.id==="mock" || item.id==="editorial" || item.id==="library" || item.id==="progress" || item.id==="syllabus" || item.id==="live") return <motion.a {...animation} href={item.href} aria-label={"Open "+item.title+" "+item.subtitle} className={"orb-node orb-node--"+item.id} style={style}>{content}</motion.a>;
  return <motion.button {...animation} type="button" aria-label={item.title+" "+item.subtitle} className={"orb-node orb-node--"+item.id} style={style} onClick={()=>onSelect(item)}>{content}</motion.button>;
}

export default function Dashboard() {
  const reduceMotion = useReducedMotion() ?? false;
  const [active,setActive] = useState("Home");
  const [search,setSearch] = useState("");
  const [notice,setNotice] = useState(false);
  const [selected,setSelected] = useState<NodeItem|null>(null);
  const [drillStats,setDrillStats] = useState({total:0,correct:0,subject:"NO DRILL PUBLISHED",loading:true});
  const [streakDays,setStreakDays]=useState(0);
  const [streakLoading,setStreakLoading]=useState(true);
  const [todayLabel,setTodayLabel]=useState("");
  useEffect(()=>{
    let active=true;
    const loadStreak=async()=>{
      const supabase=(await import("@/lib/supabase/client")).getSupabaseBrowserClient();
      if(!supabase){if(active)setStreakLoading(false);return;}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active)setStreakLoading(false);return;}
      const dateFmt=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"});
      const today=dateFmt.format(new Date());
      const dateLabel=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",weekday:"short",day:"2-digit",month:"short",year:"numeric"}).format(new Date()).toUpperCase();
      const [year,month,day]=today.split("-").map(Number);
      const todayUtc=Date.UTC(year,month-1,day);
      const since=new Date(todayUtc-366*86400000).toISOString();
      const [{data:activities,error:activityError},{data:attempts,error:attemptError}]=await Promise.all([
        supabase.from("student_activity").select("created_at").eq("student_id",user.id).gte("created_at",since),
        supabase.from("assessment_attempts").select("submitted_at").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",since)
      ]);
      if(activityError)throw activityError;
      if(attemptError)throw attemptError;
      const activeDates=new Set<string>();
      for(const item of activities||[])if(item.created_at)activeDates.add(dateFmt.format(new Date(item.created_at)));
      for(const item of attempts||[])if(item.submitted_at)activeDates.add(dateFmt.format(new Date(item.submitted_at)));
      const yesterday=new Date(todayUtc-86400000).toISOString().slice(0,10);
      let cursor=activeDates.has(today)?today:activeDates.has(yesterday)?yesterday:"";
      let count=0;
      while(cursor&&activeDates.has(cursor)){
        count++;
        const [y,m,d]=cursor.split("-").map(Number);
        cursor=new Date(Date.UTC(y,m-1,d)-86400000).toISOString().slice(0,10);
      }
      if(active){setStreakDays(count);setTodayLabel(dateLabel);setStreakLoading(false);}
    };
    void loadStreak().catch(()=>{if(active){setStreakDays(0);setStreakLoading(false);}});
    return()=>{active=false;};
  },[]);

  useEffect(()=>{
    let active=true;
    const loadDrill=async()=>{
      const {getSupabaseBrowserClient}=await import("@/lib/supabase/client");
      const supabase=getSupabaseBrowserClient();
      if(!supabase){if(active)setDrillStats({total:0,correct:0,subject:"SUPABASE UNAVAILABLE",loading:false});return;}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active)setDrillStats({total:0,correct:0,subject:"SIGN IN TO PRACTICE",loading:false});return;}
      const {data:assessment,error:assessmentError}=await supabase.from("assessments").select("id,subject_id").eq("kind","daily_drill").eq("is_published",true).order("created_at",{ascending:false}).limit(1).maybeSingle();
      if(assessmentError)throw assessmentError;
      if(!assessment){if(active)setDrillStats({total:0,correct:0,subject:"NO DRILL PUBLISHED",loading:false});return;}
      const [{data:questionRows,error:questionError},{data:attempt,error:attemptError}]=await Promise.all([
        supabase.from("questions").select("id,correct_option").eq("assessment_id",assessment.id),
        supabase.from("assessment_attempts").select("answers,submitted_at").eq("assessment_id",assessment.id).eq("student_id",user.id).order("submitted_at",{ascending:false,nullsFirst:false}).limit(1).maybeSingle()
      ]);
      if(questionError)throw questionError;
      if(attemptError)throw attemptError;
      let subject="GENERAL STUDIES";
      if(assessment.subject_id){
        const {data:subjectRow}=await supabase.from("subjects").select("name_en").eq("id",assessment.subject_id).maybeSingle();
        if(subjectRow?.name_en)subject=subjectRow.name_en.toUpperCase();
      }
      const answers=attempt?.answers && typeof attempt.answers==="object" ? attempt.answers as Record<string,unknown> : {};
      const correct=(questionRows||[]).reduce((sum,q)=>sum+(Object.prototype.hasOwnProperty.call(answers,q.id)&&Number.isInteger(Number(answers[q.id]))&&Number(answers[q.id])===q.correct_option?1:0),0);
      if(active)setDrillStats({total:(questionRows||[]).length,correct,subject,loading:false});
    };
    void loadDrill().catch(()=>{if(active)setDrillStats({total:0,correct:0,subject:"DRILL DATA UNAVAILABLE",loading:false});});
    return()=>{active=false;};
  },[]);
  const filtered = useMemo(()=>subjects.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())),[search]);
  const choose = (item:NodeItem) => setSelected(item);
  return <main id="home" className="app-shell">
    <div className="cosmos-noise" aria-hidden="true"/>
    <header className="topbar">
      <a className="brand" href="#home" aria-label="Gyankunj home">
        <span className="brand-mark">✳</span><span><strong>GYANKUNJ</strong><small>CIVILPREP · LEARN WITHOUT LIMITS</small></span>
      </a>
      <label className="searchbox"><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subjects..."/><Icon icon={SparklesIcon}/></label>
      <div className="top-actions" id="profile">
        <button className="icon-button" aria-label="Notifications" onClick={()=>setNotice(v=>!v)}><Icon icon={Notification01Icon}/><i/></button>
        <Link className="avatar" aria-label="Open student profile" href="/profile">KV</Link>
      </div>
    </header>

    <section className="hero" aria-label="Your knowledge universe">
      <div className="hero-copy hero-copy--left"><span className="eyebrow">{todayLabel || "YOUR LEARNING DASHBOARD"}</span><p>“A little progress<br/>every day builds<br/>a big result.”</p><span className="vertical-index">01<br/>02<br/>03<br/>04<br/>05</span></div>
      <div className="hero-copy hero-copy--right"><div className="streak"><Icon icon={FireIcon} size={28}/><strong>{streakLoading?"—":streakDays}</strong><span>DAY STREAK</span></div><p>“Discipline today,<br/>freedom tomorrow.”</p></div>
      <div className="universe">
        <div className="orbit orbit--one"/><div className="orbit orbit--two"/><div className="orbit orbit--three"/>
        <div className="orbit-dash"/>
        <motion.div className="core" animate={reduceMotion?undefined:{scale:[1,1.018,1]}} transition={{duration:5,repeat:Infinity,ease:"easeInOut"}}>
          <span className="core-star">✧</span><strong>GYANKUNJ</strong><small>YOUR<br/>KNOWLEDGE<br/>UNIVERSE</small>
        </motion.div>
        {nodes.map((item,index)=><OrbitalNode key={item.id} item={item} index={index} reduceMotion={reduceMotion} onSelect={choose}/>)}
        <span className="planet planet--a"/><span className="planet planet--b"/><span className="planet planet--c"/>
      </div>
      <div className="hero-caption">ONE EXAM.<br/>A BRIGHTER<br/>YOU.</div>
    </section>

    <section className="feature-row" id="study">
      <motion.article className="editorial editorial-bento" initial={reduceMotion?false:{opacity:0,y:26}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}} transition={{duration:.7,ease:[.2,.8,.2,1]}}>
        <div className="editorial-bento__top"><span><i/> DAILY CRUX / EDITION 001</span><span>GYANKUNJ EDITORIAL DESK <b>↗</b></span></div>
        <div className="editorial-bento__body">
          <div className="editorial-bento__copy">
            <span className="editorial-bento__eyebrow">TODAY&apos;S EDITORIAL <i>·</i> SCIENCE & TECHNOLOGY</span>
            <h1><motion.span initial={reduceMotion?false:{y:"105%"}} whileInView={{y:0}} viewport={{once:true}} transition={{duration:.8,delay:.12}}>भारत का</motion.span><motion.span initial={reduceMotion?false:{y:"105%"}} whileInView={{y:0}} viewport={{once:true}} transition={{duration:.8,delay:.22}}>सेमीकंडक्टर</motion.span><motion.span className="editorial-bento__accent" initial={reduceMotion?false:{y:"105%"}} whileInView={{y:0}} viewport={{once:true}} transition={{duration:.8,delay:.32}}>मिशन<span>.</span></motion.span></h1>
            <p>आत्मनिर्भरता से रणनीतिक शक्ति तक — भारत की चिप क्षमता, वैश्विक आपूर्ति शृंखला और तकनीकी संप्रभुता का विश्लेषण।</p>
            <div className="editorial-bento__bottom"><span>◷ &nbsp;08 MIN READ</span><span>UPSC · GS III</span><Link href="/current-affairs" className="editorial-bento__cta">READ THE EDITORIAL <b>↗</b></Link></div>
          </div>
          <div className="editorial-bento__visual" aria-hidden="true"><div className="editorial-bento__visual-grid"/><div className="editorial-bento__orbit editorial-bento__orbit--one"/><div className="editorial-bento__orbit editorial-bento__orbit--two"/><div className="editorial-bento__chip"><span>INDIA</span><b>Si</b><small>SEMICONDUCTOR<br/>ECOSYSTEM</small></div><div className="editorial-bento__serial">01 / 12</div><div className="editorial-bento__vertical">KNOWLEDGE IN MOTION</div></div>
        </div>
        <div className="editorial-bento__ticker"><span>READ · REFLECT · REVISE</span><span>DAILY CRUX <b>✳</b> DAILY CRUX <b>✳</b> DAILY CRUX</span></div>
      </motion.article>
      <motion.article className="drill-panel" id="practice" initial={reduceMotion?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}>
        <div className="drill-heading"><span className="target-icon"><Icon icon={Target01Icon} size={27}/></span><span>TODAY&apos;S DRILL</span><Link className="drill-open-link" aria-label="Continue drill" href="/practice/daily"><Icon icon={ArrowUpRight01Icon}/></Link></div>
        <div className="drill-stats"><div><strong>{drillStats.loading?"—":drillStats.correct} <small>/ {drillStats.total}</small></strong><span>Correct answers</span></div><div className="progress-ring" style={{"--progress":drillStats.total?Math.min(100,Math.round(drillStats.correct/drillStats.total*100)):0} as React.CSSProperties}><span>{drillStats.total?Math.min(100,Math.round(drillStats.correct/drillStats.total*100)):0}%</span></div></div>
        <div className="drill-foot"><span><Icon icon={CheckmarkCircle02Icon} size={15}/> {drillStats.total?(drillStats.correct?"DAILY PRACTICE":"READY TO PRACTICE"):drillStats.loading?"LOADING DRILL":"NO ACTIVE DRILL"}</span><span>{drillStats.subject}</span></div>
      </motion.article>
    </section>

    <section className="subject-section" id="library">
      <div className="section-heading"><span>STUDY CORNER / EXPLORE YOUR TERRITORY</span><small>SUBJECTS / 06 · OPEN A SPACE ↗</small></div>
      <div className="subject-strip">{filtered.map(subject=><Link className="subject-pill" key={subject.slug} href={"/library/"+subject.slug} style={{"--subject":subject.color} as React.CSSProperties} aria-label={"Open "+subject.name+" study space"}><Icon icon={subject.icon} size={20}/><span>{subject.name}</span><Icon icon={ArrowUpRight01Icon} size={15}/></Link>)}{filtered.length===0&&<span className="empty-search">No matching subjects</span>}</div>
    </section>

    <nav className="floating-dock" aria-label="Primary navigation">{nav.map((item)=><Link key={item.name} href={item.href} onClick={()=>setActive(item.name)} className={active===item.name?"active":""}><span className={item.name==="AI"?"dock-ai":""}><Icon icon={item.icon} size={21}/></span><small>{item.name}</small></Link>)}</nav>

    <AnimatePresence>{notice&&<motion.div className="notice-pop" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><strong>You&apos;re all caught up.</strong><span>No new notifications right now.</span></motion.div>}</AnimatePresence>
    <AnimatePresence>{selected&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.div className="route-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} initial={{y:20,scale:.96}} animate={{y:0,scale:1}} exit={{y:12,scale:.98}}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">GYANKUNJ / LEARNING SPACE</span><h2>{selected.title} {selected.subtitle}</h2><p>This destination is ready to connect to its dedicated learning module. Route: <code>{selected.href}</code></p><button className="modal-primary" onClick={()=>setSelected(null)}>Continue exploring <Icon icon={ArrowUpRight01Icon}/></button></motion.div></motion.div>}</AnimatePresence>
  </main>;
}

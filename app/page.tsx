"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon, Search01Icon, Notification01Icon,
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
  { id:"editorial", title:"DAILY", subtitle:"EDITORIAL", color:"#5ab7cb", icon:NewspaperIcon, href:"/current-affairs", angle:-135 },
  { id:"mock", title:"FULL-LENGTH", subtitle:"MOCK TEST", color:"#70cfff", icon:BookOpen01Icon, href:"/mock-test", angle:-45 },
  { id:"library", title:"STUDY", subtitle:"LIBRARY", color:"#76e2bd", icon:Layers01Icon, href:"/library", angle:180 },
  { id:"progress", title:"MY", subtitle:"PROGRESS", color:"#72cce0", icon:ChartLineData01Icon, href:"/progress", angle:0 },
  { id:"live", title:"LIVE", subtitle:"CLASSES", color:"#63d8f5", icon:UserGroupIcon, href:"/live", angle:135 },
  { id:"ai", title:"AI", subtitle:"COMPANION", color:"#55c0d0", icon:Brain01Icon, href:"/ai", angle:90 },
  { id:"syllabus", title:"EXPLORE", subtitle:"SYLLABUS", color:"#f3c879", icon:Compass01Icon, href:"/syllabus", angle:45 }
];
const subjectVisuals:Record<string,{icon:typeof GraduationScrollIcon;color:string}> = {
  polity:{icon:GraduationScrollIcon,color:"#70cfff"},economy:{icon:ChartLineData01Icon,color:"#76e2bd"},
  environment:{icon:Atom01Icon,color:"#9bdda0"},"science-tech":{icon:SparklesIcon,color:"#b89cff"},
  history:{icon:BookOpen01Icon,color:"#f3c879"},geography:{icon:Layers01Icon,color:"#76c5d6"}
};


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
  const [search,setSearch] = useState("");
  const [notice,setNotice] = useState(false);
  const [studentInitials,setStudentInitials]=useState("GK");
  const [announcements,setAnnouncements]=useState<Array<{id:string;title:string;body:string;published_at:string|null}>>([]);
  const [selected,setSelected] = useState<NodeItem|null>(null);
  const [drillStats,setDrillStats] = useState({total:0,correct:0,subject:"NO DRILL PUBLISHED",dateLabel:"",loading:true});
  const [streakDays,setStreakDays]=useState(0);
  const [streakLoading,setStreakLoading]=useState(true);
  const [todayLabel,setTodayLabel]=useState("");
  const [subjects,setSubjects]=useState<Array<{slug:string;name:string;icon:typeof GraduationScrollIcon;color:string}>>([]);
  const [featuredEditorial,setFeaturedEditorial]=useState<{slug:string;title_hi:string|null;title_en:string|null;summary_hi:string|null;summary_en:string|null;category:string;read_minutes:number}|null>(null);
  const [dashboardContentLoading,setDashboardContentLoading]=useState(true);
  const [learningSnapshot,setLearningSnapshot]=useState({attempts:0,answered:0,correct:0,topics:0,loading:true});
  const [weeklyActivity,setWeeklyActivity]=useState<number[]>([]);
  const [recentLearning,setRecentLearning]=useState<Array<{id:string;activity_type:string;created_at:string}>>([]);
  const [snapshotError,setSnapshotError]=useState("");
  useEffect(()=>{
    let active=true;
    const loadLearningSnapshot=async()=>{
      const {getSupabaseBrowserClient}=await import("@/lib/supabase/client");
      const supabase=getSupabaseBrowserClient();
      if(!supabase){if(active)setLearningSnapshot(v=>({...v,loading:false}));return;}
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError)throw authError;
      if(!user){if(active)setLearningSnapshot(v=>({...v,loading:false}));return;}
      const since=new Date(Date.now()-30*86400000).toISOString();
      const [attemptResult,topicResult,activityResult]=await Promise.all([
        supabase.from("assessment_attempts").select("id,answered_count,correct_count,submitted_at").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",since).order("submitted_at",{ascending:false}).limit(500),
        supabase.from("student_topic_progress").select("id",{count:"exact",head:true}).eq("student_id",user.id).eq("exam_key","upsc-cse"),
        supabase.from("student_activity").select("id,activity_type,created_at").eq("student_id",user.id).gte("created_at",since).order("created_at",{ascending:false}).limit(100)
      ]);
      if(attemptResult.error)throw attemptResult.error;
      if(topicResult.error)throw topicResult.error;
      if(activityResult.error)throw activityResult.error;
      const attempts=attemptResult.data||[];
      const answered=attempts.reduce((sum,item)=>sum+(Number(item.answered_count)||0),0);
      const correct=attempts.reduce((sum,item)=>sum+(Number(item.correct_count)||0),0);
      const dayKey=(date:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(date);
      const activityByDay=new Map<string,number>();
      for(const item of activityResult.data||[]){
        const key=dayKey(new Date(item.created_at));
        activityByDay.set(key,(activityByDay.get(key)||0)+1);
      }
      const bars=Array.from({length:7},(_,index)=>{
        const date=new Date();date.setDate(date.getDate()-(6-index));
        return activityByDay.get(dayKey(date))||0;
      });
      if(active){
        setLearningSnapshot({attempts:attempts.length,answered,correct,topics:topicResult.count||0,loading:false});
        setWeeklyActivity(bars);
        setRecentLearning((activityResult.data||[]).slice(0,5));
        setSnapshotError("");
      }
    };
    void loadLearningSnapshot().catch(error=>{
      if(active){setSnapshotError(error instanceof Error?error.message:"Learning insights are temporarily unavailable.");setLearningSnapshot(v=>({...v,loading:false}));}
    });
    return()=>{active=false;};
  },[]);

  useEffect(()=>{
    let active=true;
    const loadDashboardContent=async()=>{
      const {getSupabaseBrowserClient}=await import("@/lib/supabase/client");
      const supabase=getSupabaseBrowserClient();
      if(!supabase){if(active)setDashboardContentLoading(false);return;}
      const {data:{user}}=await supabase.auth.getUser();
      const [subjectResult,editorialResult,announcementResult,profileResult]=await Promise.all([
        supabase.from("subjects").select("slug,name_en,name_hi,sort_order").order("sort_order",{ascending:true}),
        supabase.from("editorial_articles").select("slug,title_hi,title_en,summary_hi,summary_en,category,read_minutes,published_at,created_at").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle(),
        supabase.from("announcements").select("id,title,body,published_at").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).limit(5),
        user?supabase.from("profiles").select("full_name").eq("id",user.id).maybeSingle():Promise.resolve({data:null,error:null})
      ]);
      if(!active)return;
      if(!subjectResult.error)setSubjects((subjectResult.data||[]).map(s=>({slug:s.slug,name:s.name_en,icon:subjectVisuals[s.slug]?.icon||BookOpen01Icon,color:subjectVisuals[s.slug]?.color||"#b89cff"})));
      if(!editorialResult.error&&editorialResult.data)setFeaturedEditorial(editorialResult.data);
      if(!announcementResult.error)setAnnouncements(announcementResult.data||[]);
      const fullName=profileResult.data?.full_name||user?.user_metadata?.full_name||"";
      if(fullName)setStudentInitials(fullName.split(" ").filter(Boolean).slice(0,2).map((part:string)=>part[0]?.toUpperCase()).join(""));
      setDashboardContentLoading(false);
    };
    void loadDashboardContent();
    return()=>{active=false;};
  },[]);
  useEffect(()=>{
    let active=true;
    const loadStreak=async()=>{
      const supabase=(await import("@/lib/supabase/client")).getSupabaseBrowserClient();
      if(!supabase){if(active)setStreakLoading(false);return;}
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){if(active)setStreakLoading(false);return;}
      const dateFmt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"});
      const dateKey=(value:Date)=>{const parts=dateFmt.formatToParts(value);const get=(type:string)=>parts.find(part=>part.type===type)?.value||"";return get("year")+"-"+get("month")+"-"+get("day");};
      const today=dateKey(new Date());
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
      for(const item of activities||[])if(item.created_at)activeDates.add(dateKey(new Date(item.created_at)));
      for(const item of attempts||[])if(item.submitted_at)activeDates.add(dateKey(new Date(item.submitted_at)));
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
      if(!supabase){if(active)setDrillStats({total:0,correct:0,subject:"SUPABASE UNAVAILABLE",dateLabel:"",loading:false});return;}
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError)throw authError;
      if(!user){if(active)setDrillStats({total:0,correct:0,subject:"SIGN IN TO PRACTICE",dateLabel:"",loading:false});return;}
      const {data:assessment,error:assessmentError}=await supabase.from("assessments").select("id,subject_id,title,published_at,created_at").eq("kind","daily_drill").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(1).maybeSingle();
      if(assessmentError)throw assessmentError;
      if(!assessment){if(active)setDrillStats({total:0,correct:0,subject:"NO DRILL PUBLISHED",dateLabel:"",loading:false});return;}
      // The secure-scoring migration intentionally revokes SELECT on correct_option.
      // The dashboard only needs question IDs for the total; score comes from the server RPC attempt.
      const [{data:membershipRows,error:membershipError},{data:attempt,error:attemptError}]=await Promise.all([
        supabase.from("assessment_questions").select("question_id").eq("assessment_id",assessment.id),
        supabase.from("assessment_attempts").select("correct_count,submitted_at").eq("assessment_id",assessment.id).eq("student_id",user.id).not("submitted_at","is",null).order("submitted_at",{ascending:false}).limit(1).maybeSingle()
      ]);
      if(membershipError)throw membershipError;
      if(attemptError)throw attemptError;
      let questionTotal=(membershipRows||[]).length;
      if(questionTotal===0){
        const {count,error:questionError}=await supabase.from("questions").select("id",{count:"exact",head:true}).eq("assessment_id",assessment.id);
        if(questionError)throw questionError;
        questionTotal=count||0;
      }
      let subject="GENERAL STUDIES";
      if(assessment.subject_id){
        const {data:subjectRow,error:subjectError}=await supabase.from("subjects").select("name_en").eq("id",assessment.subject_id).maybeSingle();
        if(subjectError)throw subjectError;
        if(subjectRow?.name_en)subject=subjectRow.name_en.toUpperCase();
      }
      const publishedOn=assessment.published_at||assessment.created_at;
      const dateLabel=publishedOn?new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",day:"2-digit",month:"short",year:"numeric"}).format(new Date(publishedOn)).toUpperCase():"";
      const correct=Number(attempt?.correct_count)||0;
      if(active)setDrillStats({total:questionTotal,correct,subject,dateLabel,loading:false});
    };
    void loadDrill().catch(()=>{if(active)setDrillStats({total:0,correct:0,subject:"DRILL DATA UNAVAILABLE",dateLabel:"",loading:false});});
    return()=>{active=false;};
  },[]);
  const filtered = useMemo(()=>subjects.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())),[subjects,search]);
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
        <Link className="avatar" aria-label="Open student profile" href="/profile">{studentInitials}</Link>
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
            <span className="editorial-bento__eyebrow">{dashboardContentLoading?"LOADING EDITORIAL":"TODAY'S EDITORIAL"} <i>·</i> {featuredEditorial?.category||"DAILY CRUX"}</span>
            <h1><motion.span initial={reduceMotion?false:{y:"105%"}} whileInView={{y:0}} viewport={{once:true}} transition={{duration:.8,delay:.12}}>{featuredEditorial?.title_hi?.trim()||featuredEditorial?.title_en?.trim()||"आज का Daily Crux"}</motion.span></h1>
            <p>{featuredEditorial?.summary_hi?.trim()||featuredEditorial?.summary_en?.trim()||"नवीनतम UPSC-केंद्रित संपादकीय यहाँ प्रकाशित होते ही दिखाई देगा।"}</p>
            <div className="editorial-bento__bottom"><span>◷ &nbsp;{featuredEditorial?.read_minutes||"—"} MIN READ</span><span>{featuredEditorial?.category||"UPSC CURRENT AFFAIRS"}</span><Link href={featuredEditorial?"/current-affairs/"+featuredEditorial.slug:"/current-affairs"} className="editorial-bento__cta">READ THE EDITORIAL <b>↗</b></Link></div>
          </div>
          <div className="editorial-bento__visual" aria-hidden="true"><div className="editorial-bento__visual-grid"/><div className="editorial-bento__orbit editorial-bento__orbit--one"/><div className="editorial-bento__orbit editorial-bento__orbit--two"/><div className="editorial-bento__chip"><span>INDIA</span><b>Si</b><small>SEMICONDUCTOR<br/>ECOSYSTEM</small></div><div className="editorial-bento__serial">01 / 12</div><div className="editorial-bento__vertical">KNOWLEDGE IN MOTION</div></div>
        </div>
        <div className="editorial-bento__ticker"><span>READ · REFLECT · REVISE</span><span>DAILY CRUX <b>✳</b> DAILY CRUX <b>✳</b> DAILY CRUX</span></div>
      </motion.article>
      <motion.article className="drill-panel" id="practice" initial={reduceMotion?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}>
        <div className="drill-heading"><span className="target-icon"><Icon icon={Target01Icon} size={27}/></span><span>TODAY&apos;S DRILL</span><Link className="drill-open-link" aria-label="Continue drill" href="/practice/daily"><Icon icon={ArrowUpRight01Icon}/></Link></div>
        <div className="drill-stats"><div><strong>{drillStats.loading?"—":drillStats.correct} <small>/ {drillStats.total}</small></strong><span>Correct answers</span></div><div className="progress-ring" style={{"--progress":drillStats.total?Math.min(100,Math.round(drillStats.correct/drillStats.total*100)):0} as React.CSSProperties}><span>{drillStats.total?Math.min(100,Math.round(drillStats.correct/drillStats.total*100)):0}%</span></div></div>
        <div className="drill-foot"><span><Icon icon={CheckmarkCircle02Icon} size={15}/> {drillStats.loading?"LOADING DRILL":drillStats.total?(drillStats.correct?"DAILY PRACTICE":"READY TO PRACTICE"):"NO ACTIVE DRILL"}</span><span>{drillStats.total?(drillStats.dateLabel?"TODAY’S DRILL · "+drillStats.dateLabel:drillStats.subject):drillStats.subject}</span></div>
      </motion.article>
    </section>

    <section className="learning-intelligence" aria-label="Your learning intelligence">
      <div className="learning-intelligence__heading"><div><span className="eyebrow">PERSONAL LEARNING INTELLIGENCE</span><h2>Your preparation, <em>in focus.</em></h2><p>Real progress from your recent learning activity.</p></div><Link href="/progress">VIEW FULL PROGRESS ↗</Link></div>
      <div className="learning-intelligence__grid">
        <article className="learning-metric"><span>TESTS COMPLETED · 30 DAYS</span><strong>{learningSnapshot.loading?"—":learningSnapshot.attempts}</strong><small>Submitted assessments</small></article>
        <article className="learning-metric"><span>ANSWER ACCURACY</span><strong>{learningSnapshot.loading?"—":learningSnapshot.answered?Math.round(learningSnapshot.correct/learningSnapshot.answered*100)+"%":"—"}</strong><small>{learningSnapshot.correct} correct of {learningSnapshot.answered} answered</small></article>
        <article className="learning-metric"><span>SYLLABUS TOPICS TRACKED</span><strong>{learningSnapshot.loading?"—":learningSnapshot.topics}</strong><small>UPSC CSE topic progress records</small></article>
        <article className="learning-activity"><div className="learning-activity__top"><span>7-DAY ACTIVITY PULSE</span><small>LAST 7 DAYS</small></div><div className="learning-bars">{weeklyActivity.map((value,index)=><span key={index} title={value+" activities"} style={{"--bar":Math.max(8,value?Math.min(100,value*18):8)+"%"} as React.CSSProperties}><i/></span>)}</div><div className="learning-bars__labels"><span>6D AGO</span><span>TODAY</span></div></article>
      </div>
      <div className="learning-intelligence__bottom"><div><span className="eyebrow">RECENT LEARNING SIGNALS</span>{recentLearning.length?recentLearning.slice(0,3).map(item=><div className="learning-signal" key={item.id}><b>{item.activity_type.replace(/_/g," ")}</b><time>{new Date(item.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</time></div>):<p>Complete a drill, test or study activity to start building your learning intelligence.</p>}{snapshotError&&<small role="status">Insights unavailable: {snapshotError}</small>}</div><Link className="learning-next-step" href={learningSnapshot.attempts?"/progress":"/practice/daily"}><span>{learningSnapshot.attempts?"KEEP YOUR MOMENTUM":"YOUR NEXT BEST STEP"}</span><strong>{learningSnapshot.attempts?"Review your progress":"Start today's practice"}</strong><b>↗</b></Link></div>
    </section>

    <section className="subject-section" id="library">
      <div className="section-heading"><span>STUDY CORNER / EXPLORE YOUR TERRITORY</span><small>SUBJECTS / 06 · OPEN A SPACE ↗</small></div>
      <div className="subject-strip">{filtered.map(subject=><Link className="subject-pill" key={subject.slug} href={"/library/"+subject.slug} style={{"--subject":subject.color} as React.CSSProperties} aria-label={"Open "+subject.name+" study space"}><Icon icon={subject.icon} size={20}/><span>{subject.name}</span><Icon icon={ArrowUpRight01Icon} size={15}/></Link>)}{filtered.length===0&&<span className="empty-search">No matching subjects</span>}</div>
    </section>

    

    <AnimatePresence>{notice&&<motion.div className="notice-pop" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>{announcements.length?announcements.map(item=><div key={item.id}><strong>{item.title}</strong><span>{item.body}</span></div>):<div><strong>You&apos;re all caught up.</strong><span>No new notifications right now.</span></div>}</motion.div>}</AnimatePresence>
    <AnimatePresence>{selected&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.div className="route-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} initial={{y:20,scale:.96}} animate={{y:0,scale:1}} exit={{y:12,scale:.98}}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">GYANKUNJ / LEARNING SPACE</span><h2>{selected.title} {selected.subtitle}</h2><p>This destination is ready to connect to its dedicated learning module. Route: <code>{selected.href}</code></p><button className="modal-primary" onClick={()=>setSelected(null)}>Continue exploring <Icon icon={ArrowUpRight01Icon}/></button></motion.div></motion.div>}</AnimatePresence>
  </main>;
}

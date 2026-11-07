"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon, Target01Icon, NewspaperIcon,
  Notebook01Icon, BookOpen01Icon, UserGroupIcon,
  Home01Icon, GraduationScrollIcon, FireIcon,
  CheckmarkCircle02Icon, ArrowUpRight01Icon, Clock01Icon
} from "@hugeicons/core-free-icons";
import "./neo-orbit.css";

type Stats = { streak:number; quizzes:number; mocks:number; accuracy:number|null; answered:number; loading:boolean };
type Drill = { count:number; title:string; href:string };
type Editorial = { slug:string; title:string; category:string; read:number } | null;

function Lotus({large=false}:{large?:boolean}) {
  return <span className={"neo-lotus"+(large?" neo-lotus--large":"")} aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none">
      <path d="M50 10C31 34 37 55 50 69 63 55 69 34 50 10Z" fill="#FFF9FF"/>
      <path d="M47 63C14 35 9 57 22 75c8 11 19 8 25-12Z" fill="#F7B8ED"/>
      <path d="M53 63c33-28 38-6 25 12-8 11-19 8-25-12Z" fill="#F7B8ED"/>
      <path d="M50 62C30 76 37 90 50 94c13-4 20-18 0-32Z" fill="#FFE1A8"/>
      <path d="M25 76c15 13 35 13 50 0" stroke="#FFF7FF" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  </span>;
}
function Icon({icon,size=22}:{icon:typeof Home01Icon;size?:number}) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>;
}

const modules = [
  {label:"Daily Drill",sub:"10 Questions · GS Mix",icon:Target01Icon,href:"/practice/daily",slot:"top"},
  {label:"Editorial",sub:"Today's Analysis",icon:NewspaperIcon,href:"/current-affairs",slot:"left-top"},
  {label:"Notes",sub:"Concise & Crisp",icon:Notebook01Icon,href:"/library",slot:"right-top"},
  {label:"Library",sub:"All Resources",icon:BookOpen01Icon,href:"/library",slot:"left-bottom"},
  {label:"Mocks",sub:"Full Length",icon:GraduationScrollIcon,href:"/mock-test",slot:"right-bottom"},
  {label:"Classes",sub:"Live / Recorded",icon:UserGroupIcon,href:"/live",slot:"bottom"},
] as const;

export default function NeoOrbitDashboard() {
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
      if(fullName)setName(String(fullName).trim().split(/\s+/)[0]);
      const rows=attempts.data||[];
      const answered=rows.reduce((n,r)=>n+(Number(r.answered_count)||0),0);
      const correct=rows.reduce((n,r)=>n+(Number(r.correct_count)||0),0);
      const todayKey=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata"}).format(d);
      const active=new Set<string>();
      for(const row of activity.data||[])if(row.created_at)active.add(todayKey(new Date(row.created_at)));
      for(const row of rows)if(row.submitted_at)active.add(todayKey(new Date(row.submitted_at)));
      const now=new Date(); const today=todayKey(now);
      const yesterday=todayKey(new Date(Date.now()-86400000));
      let cursor=active.has(today)?today:active.has(yesterday)?yesterday:""; let streak=0;
      while(cursor&&active.has(cursor)){streak++;const [y,m,d]=cursor.split("-").map(Number);cursor=todayKey(new Date(Date.UTC(y,m-1,d)-86400000));}
      const mockIds=new Set<string>();
      for(const row of rows){if(row.assessment_id)mockIds.add(row.assessment_id);}
      if(assessment.data){
        const {count}=await supabase.from("assessment_questions").select("question_id",{count:"exact",head:true}).eq("assessment_id",assessment.data.id);
        if(alive)setDrill({count:count||0,title:assessment.data.title||"Daily GS Drill",href:"/practice/daily"});
      } else if(alive)setDrill({count:0,title:"No drill published yet",href:"/practice/daily"});
      if(article.data&&alive)setEditorial({slug:article.data.slug,title:article.data.title_hi||article.data.title_en||"Today's Editorial",category:article.data.category||"Daily Crux",read:Number(article.data.read_minutes)||0});
      if(alive)setStats({streak,quizzes:rows.length,mocks:mockIds.size,accuracy:answered?Math.round(correct/answered*100):null,answered,loading:false});
    }
    void load().catch(()=>{if(alive)setStats(s=>({...s,loading:false}));});
    return()=>{alive=false;};
  },[]);

  const greeting=useMemo(()=>{const h=Number(new Intl.DateTimeFormat("en-US",{timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"}).format(new Date()));return h<12?"Good Morning":h<17?"Good Afternoon":"Good Evening";},[]);
  return <main className="neo-orbit-page">
    <div className="neo-orbit-glow neo-orbit-glow--one"/><div className="neo-orbit-glow neo-orbit-glow--two"/>
    <div className="neo-orbit-shell">
      <header className="neo-header">
        <Link href="/" className="neo-brand"><span className="neo-brand-mark"><Lotus/></span><span><strong>Gyankunj</strong><small>Academy</small></span></Link>
        <div className="neo-header-actions"><Link href="/todays-glimpses" aria-label="Notifications"><Icon icon={Notification01Icon} size={23}/></Link><Link href="/profile" aria-label="Profile"><Icon icon={UserGroupIcon} size={24}/></Link></div>
      </header>

      <section className="neo-greeting"><h1>{greeting}, {name} <span>👋</span></h1><p>Your UPSC Journey, Elevated</p></section>

      <section className="neo-orbit" aria-label="Learning modules">
        <div className="neo-orbit-track neo-orbit-track--outer"/><div className="neo-orbit-track neo-orbit-track--inner"/>
        <div className="neo-orbit-hub"><Lotus large/></div>
        {modules.map((item,index)=><Link key={item.label} href={item.href} className={"neo-module neo-module--"+item.slot} style={{"--module-index":index} as React.CSSProperties}>
          <Icon icon={item.icon} size={34}/><strong>{item.label}</strong><small>{item.sub}</small>
        </Link>)}
      </section>

      <Link href="/todays-glimpses" className="neo-glimpses">
        <span className="neo-glimpses-icon"><Icon icon={Compass01Icon} size={24}/></span>
        <span className="neo-glimpses-copy"><strong>Today&apos;s Glimpses</strong><span><i>▣ Editorial</i><b/> <i>◎ Drill</i><b/> <i>✎ Mains Q.</i></span></span>
        <span className="neo-glimpses-arrow"><Icon icon={ArrowUpRight01Icon} size={22}/></span>
      </Link>

      <section className="neo-progress">
        <div className="neo-progress-left"><span className="neo-section-label">Your Progress</span><div className="neo-progress-ring" style={{"--value":stats.accuracy??0} as React.CSSProperties}><div><strong>{stats.loading?"—":stats.accuracy===null?"—":stats.accuracy+"%"}</strong><small>Accuracy</small></div></div></div>
        <div className="neo-progress-stats">
          <div><Icon icon={FireIcon} size={22}/><strong>{stats.loading?"—":stats.streak} Day Streak</strong></div>
          <div><Icon icon={CheckmarkCircle02Icon} size={21}/><strong>{stats.loading?"—":stats.quizzes} Quizzes</strong></div>
          <div><Icon icon={Clock01Icon} size={21}/><strong>{stats.loading?"—":stats.mocks} Tests</strong></div>
        </div>
      </section>

      <section className="neo-lower-cards">
        <Link href={drill.href} className="neo-lower-card"><span className="neo-lower-kicker">PICK UP WHERE YOU LEFT OFF</span><strong>{drill.title}</strong><small>{drill.count?drill.count+" questions available":"Open daily practice"} <Icon icon={ArrowUpRight01Icon} size={15}/></small></Link>
        <Link href={editorial?"/current-affairs/"+editorial.slug:"/current-affairs"} className="neo-lower-card"><span className="neo-lower-kicker">TODAY&apos;S EDITORIAL</span><strong>{editorial?.title||"Explore current affairs"}</strong><small>{editorial?editorial.category+" · "+editorial.read+" min read":"Read the latest analysis"} <Icon icon={ArrowUpRight01Icon} size={15}/></small></Link>
      </section>

      {!hasUser&&<p className="neo-signin-note">Sign in to see your personal streak and learning progress.</p>}
   </div>
  </main>;
}

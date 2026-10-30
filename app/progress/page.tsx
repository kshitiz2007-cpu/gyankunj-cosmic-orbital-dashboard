"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Target01Icon,FireIcon,Clock01Icon,ChartLineData01Icon,BookOpen01Icon,CheckmarkCircle02Icon,Calendar01Icon,Activity01Icon} from "@hugeicons/core-free-icons";
const subjects=[
 {name:"Polity",done:68,total:100,color:"#70cfff",trend:"+8%"},
 {name:"History",done:52,total:100,color:"#f3c879",trend:"+5%"},
 {name:"Economy",done:43,total:100,color:"#76e2bd",trend:"+12%"},
 {name:"Environment",done:74,total:100,color:"#9bdda0",trend:"+4%"},
 {name:"Science & Tech",done:36,total:100,color:"#b89cff",trend:"+9%"}
];
const activity=[3,5,2,6,4,7,3,6,5,2,7,4,6,8,3,5,7,4,6,2,5,8,4,7,6,3,5,8,4,6,7,5,3,6,8,4,7,5,6,3,8,5,7,4,6,8,3,5,7,6,4,8];
const recent=[{title:"Daily Drill",detail:"Attempted 5 questions",score:"80%",href:"/practice/daily",tag:"PRACTICE"},{title:"Full-Length Mock Test",detail:"Sample assessment",score:"60%",href:"/mock-test/preview",tag:"MOCK TEST"},{title:"Study Library",detail:"Constitutional Development",score:"IN PROGRESS",href:"/library/polity/constitutional-development",tag:"LEARNING"},{title:"Daily Editorial",detail:"Semiconductor Mission",score:"READ",href:"/current-affairs/semiconductor-mission",tag:"EDITORIAL"}];
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
function Ring({value,color,label}:{value:number;color:string;label:string}){return <div className="progress-ring" style={{"--value":value,"--ring":color} as React.CSSProperties}><div><strong>{value}%</strong><span>{label}</span></div></div>}
export default function ProgressPage(){
 const [period,setPeriod]=useState("WEEK");
 const total=useMemo(()=>subjects.reduce((a,s)=>a+s.done,0),[]);
 const avg=Math.round(subjects.reduce((a,s)=>a+s.done,0)/subjects.length);
 return <main className="progress-app"><header className="progress-top"><Link href="/" className="progress-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>STUDENT ANALYTICS / MY PROGRESS</span><span className="progress-status">LEARNING INSIGHTS</span></header><div className="progress-wrap">
  <section className="progress-hero"><div><span className="progress-kicker">YOUR LEARNING INTELLIGENCE / 01</span><h1>Progress, <em>in motion.</em></h1><p>अपनी तैयारी की दिशा, निरंतरता और विषयवार पकड़ को एक ही जगह समझें। छोटे प्रयासों को measurable progress में बदलें।</p><div className="progress-hero-actions"><Link href="/practice/daily">Continue learning <Icon icon={ArrowUpRight01Icon}/></Link><span>DEMO ANALYTICS · LOCAL PREVIEW</span></div></div><div className="progress-hero-ring"><Ring value={avg} color="#d48cff" label="SUBJECT MASTERY"/></div></section>
  <section className="progress-kpis"><article><span><Icon icon={FireIcon}/> LEARNING STREAK</span><strong>07 <small>DAYS</small></strong><p>Consistency is building</p></article><article><span><Icon icon={Target01Icon}/> OVERALL ACCURACY</span><strong>76<small>%</small></strong><p>Across sample practice</p></article><article><span><Icon icon={Clock01Icon}/> STUDY TIME</span><strong>18.5 <small>HRS</small></strong><p>This learning cycle</p></article><article><span><Icon icon={CheckmarkCircle02Icon}/> QUESTIONS SOLVED</span><strong>248</strong><p>Across all practice sets</p></article></section>
  <section className="progress-main-grid"><div className="progress-panel progress-subject-panel"><div className="progress-heading"><div><span className="progress-kicker">MASTERY MAP</span><h2>Subject <em>strength.</em></h2></div><span>01 — 05</span></div>{subjects.map(s=><div className="progress-subject" key={s.name}><div><b>{s.name}</b><span>{s.done}% <i>{s.trend}</i></span></div><div className="progress-bar"><i style={{width:s.done+"%",background:s.color}}/></div></div>)}</div>
   <div className="progress-panel progress-activity-panel"><div className="progress-heading"><div><span className="progress-kicker">CONSISTENCY TRACKER</span><h2>Study <em>activity.</em></h2></div><select value={period} onChange={e=>setPeriod(e.target.value)}><option>WEEK</option><option>MONTH</option></select></div><div className="progress-heatmap">{activity.slice(period==="WEEK"?-14:0).map((v,i)=><i key={i} data-level={v>6?4:v>4?3:v>2?2:1} title={v+" study actions"}/>)}</div><div className="progress-legend"><span>LESS</span>{[1,2,3,4].map(v=><i key={v} data-level={v}/>)}<span>MORE</span></div><div className="progress-activity-foot"><span><Icon icon={Calendar01Icon}/> LAST 52 DAYS</span><b>36 ACTIVE DAYS</b></div></div></section>
  <section className="progress-lower"><div className="progress-panel progress-recent"><div className="progress-heading"><div><span className="progress-kicker">KEEP THE MOMENTUM</span><h2>Recent <em>activity.</em></h2></div><span>VIEW ALL</span></div>{recent.map(r=><Link href={r.href} className="progress-recent-row" key={r.title}><span className="progress-recent-icon"><Icon icon={r.tag==="PRACTICE"?BookOpen01Icon:r.tag==="MOCK TEST"?Target01Icon:Activity01Icon}/></span><span><small>{r.tag}</small><b>{r.title}</b><em>{r.detail}</em></span><strong>{r.score}</strong><Icon icon={ArrowUpRight01Icon}/></Link>)}</div><div className="progress-panel progress-insight"><span className="progress-kicker">YOUR NEXT BEST ACTION</span><div className="progress-insight-icon"><Icon icon={Target01Icon} size={28}/></div><h2>Strengthen your <em>Economy.</em></h2><p>Current sample mastery is 43%. A focused revision session followed by a short quiz can help reinforce key concepts.</p><Link href="/library/economy">Open Economy resources <Icon icon={ArrowUpRight01Icon}/></Link></div></section>
  <footer className="progress-footer">GYANKUNJ · CIVILPREP <span>MEASURE · REFLECT · IMPROVE</span></footer>
 </div></main>;
}

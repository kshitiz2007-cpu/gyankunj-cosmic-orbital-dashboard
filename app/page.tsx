"use client";

import { useMemo, useState } from "react";
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
  {name:"Polity",icon:GraduationScrollIcon,color:"#70cfff"},
  {name:"Economy",icon:ChartLineData01Icon,color:"#76e2bd"},
  {name:"Environment",icon:Atom01Icon,color:"#9bdda0"},
  {name:"Science & Tech",icon:SparklesIcon,color:"#70cfff"},
  {name:"History",icon:BookOpen01Icon,color:"#f3c879"},
];
const nav = [
  {name:"Home",icon:Home01Icon,href:"#home"},
  {name:"Study",icon:BookOpen01Icon,href:"#study"},
  {name:"Practice",icon:Notebook01Icon,href:"#practice"},
  {name:"AI",icon:SparklesIcon,href:"#ai"},
  {name:"Live",icon:UserGroupIcon,href:"#live"},
  {name:"Library",icon:Layers01Icon,href:"#library"},
  {name:"Profile",icon:UserCircleIcon,href:"#profile"},
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
  if(item.id==="drill" || item.id==="mock" || item.id==="editorial" || item.id==="library" || item.id==="progress" || item.id==="syllabus") return <motion.a {...animation} href={item.href} aria-label={"Open "+item.title+" "+item.subtitle} className={"orb-node orb-node--"+item.id} style={style}>{content}</motion.a>;
  return <motion.button {...animation} type="button" aria-label={item.title+" "+item.subtitle} className={"orb-node orb-node--"+item.id} style={style} onClick={()=>onSelect(item)}>{content}</motion.button>;
}

export default function Dashboard() {
  const reduceMotion = useReducedMotion() ?? false;
  const [active,setActive] = useState("Home");
  const [search,setSearch] = useState("");
  const [notice,setNotice] = useState(false);
  const [selected,setSelected] = useState<NodeItem|null>(null);
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
        <button className="avatar" aria-label="Open profile" onClick={()=>setSelected({id:"profile",title:"STUDENT",subtitle:"PROFILE",color:"#f4c879",icon:UserCircleIcon,href:"/profile",angle:0})}>KV</button>
      </div>
    </header>

    <section className="hero" aria-label="Your knowledge universe">
      <div className="hero-copy hero-copy--left"><span className="eyebrow">THU / 30 OCT 2026</span><p>“A little progress<br/>every day builds<br/>a big result.”</p><span className="vertical-index">01<br/>02<br/>03<br/>04<br/>05</span></div>
      <div className="hero-copy hero-copy--right"><div className="streak"><Icon icon={FireIcon} size={28}/><strong>12</strong><span>DAY STREAK</span></div><p>“Discipline today,<br/>freedom tomorrow.”</p></div>
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
      <motion.article className="editorial" initial={reduceMotion?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}>
        <div className="editorial-art"><span className="editorial-kicker"><i/> TODAY&apos;S EDITORIAL</span><div className="editorial-copy"><h1>भारत का<br/>सेमीकंडक्टर मिशन</h1><p>आत्मनिर्भरता, वैश्विक आपूर्ति शृंखला और रणनीतिक क्षमता का विश्लेषण।</p><div className="editorial-meta"><span>◫ &nbsp;08 MIN READ</span><b>SCIENCE & TECHNOLOGY</b></div></div><div className="chip-art"><div className="chip-core"/></div></div>
        <button className="round-action" aria-label="Read today's editorial" onClick={()=>setSelected(nodes[1])}><Icon icon={ArrowUpRight01Icon}/></button>
      </motion.article>
      <motion.article className="drill-panel" id="practice" initial={reduceMotion?false:{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.25}}>
        <div className="drill-heading"><span className="target-icon"><Icon icon={Target01Icon} size={27}/></span><span>TODAY&apos;S DRILL</span><Link className="drill-open-link" aria-label="Continue drill" href="/practice/daily"><Icon icon={ArrowUpRight01Icon}/></Link></div>
        <div className="drill-stats"><div><strong>15 <small>/ 20</small></strong><span>Questions</span></div><div className="progress-ring"><span>75%</span></div></div>
        <div className="drill-foot"><span><Icon icon={CheckmarkCircle02Icon} size={15}/> DAILY PRACTICE</span><span>POLITY</span></div>
      </motion.article>
    </section>

    <section className="subject-section" id="library">
      <div className="section-heading"><span>EXPLORE YOUR TERRITORY</span><small>SUBJECTS / 05</small></div>
      <div className="subject-strip">{filtered.map(subject=><button className="subject-pill" key={subject.name} style={{"--subject":subject.color} as React.CSSProperties} onClick={()=>setSelected({id:subject.name.toLowerCase().replaceAll(" ","-"),title:subject.name.toUpperCase(),subtitle:"STUDY SPACE",color:subject.color,icon:subject.icon,href:"/subjects/"+subject.name.toLowerCase().replaceAll(" ","-"),angle:0})}><Icon icon={subject.icon} size={20}/>{subject.name}</button>)}{filtered.length===0&&<span className="empty-search">No matching subjects</span>}</div>
    </section>

    <nav className="floating-dock" aria-label="Primary navigation">{nav.map((item)=><a key={item.name} href={item.href} onClick={()=>setActive(item.name)} className={active===item.name?"active":""}><span className={item.name==="AI"?"dock-ai":""}><Icon icon={item.icon} size={21}/></span><small>{item.name}</small></a>)}</nav>

    <AnimatePresence>{notice&&<motion.div className="notice-pop" initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}><strong>You&apos;re all caught up.</strong><span>No new notifications right now.</span></motion.div>}</AnimatePresence>
    <AnimatePresence>{selected&&<motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setSelected(null)}><motion.div className="route-modal" role="dialog" aria-modal="true" onClick={e=>e.stopPropagation()} initial={{y:20,scale:.96}} animate={{y:0,scale:1}} exit={{y:12,scale:.98}}><button className="modal-close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">GYANKUNJ / LEARNING SPACE</span><h2>{selected.title} {selected.subtitle}</h2><p>This destination is ready to connect to its dedicated learning module. Route: <code>{selected.href}</code></p><button className="modal-primary" onClick={()=>setSelected(null)}>Continue exploring <Icon icon={ArrowUpRight01Icon}/></button></motion.div></motion.div>}</AnimatePresence>
  </main>;
}

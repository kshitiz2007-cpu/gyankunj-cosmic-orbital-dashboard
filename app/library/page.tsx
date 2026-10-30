"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Search01Icon,BookOpen01Icon,File01Icon,Layers01Icon,Bookmark01Icon,Clock01Icon,GraduationScrollIcon,Atom01Icon,ChartLineData01Icon} from "@hugeicons/core-free-icons";
const subjects=[
 {slug:"polity",name:"Indian Polity",hi:"भारतीय राजव्यवस्था",topics:12,resources:38,color:"#70cfff",icon:GraduationScrollIcon,desc:"संविधान, संस्थाएँ, अधिकार और शासन व्यवस्था"},
 {slug:"history",name:"History & Culture",hi:"इतिहास एवं संस्कृति",topics:14,resources:46,color:"#f3c879",icon:BookOpen01Icon,desc:"प्राचीन, मध्यकालीन, आधुनिक भारत और कला-संस्कृति"},
 {slug:"economy",name:"Indian Economy",hi:"भारतीय अर्थव्यवस्था",topics:10,resources:31,color:"#76e2bd",icon:ChartLineData01Icon,desc:"विकास, बैंकिंग, बजट, वित्त और समावेशन"},
 {slug:"environment",name:"Environment",hi:"पर्यावरण एवं पारिस्थितिकी",topics:9,resources:27,color:"#9bdda0",icon:Atom01Icon,desc:"जैव विविधता, जलवायु परिवर्तन और संरक्षण"},
 {slug:"science-tech",name:"Science & Technology",hi:"विज्ञान एवं प्रौद्योगिकी",topics:11,resources:29,color:"#b89cff",icon:Layers01Icon,desc:"अंतरिक्ष, जैव-प्रौद्योगिकी, AI और रक्षा तकनीक"},
 {slug:"geography",name:"Geography",hi:"भूगोल",topics:13,resources:35,color:"#ff9f9a",icon:Layers01Icon,desc:"भौतिक, भारतीय और विश्व भूगोल"}
];
const resources=[{type:"NOTES",title:"भारतीय संविधान का विकास",sub:"संवैधानिक इतिहास · 18 pages",time:"12 MIN"},{type:"PYQ",title:"Fundamental Rights — PYQ Set",sub:"UPSC Prelims · 2011–2025",time:"25 Qs"},{type:"REVISION",title:"संविधान की प्रमुख विशेषताएँ",sub:"Quick revision sheet",time:"08 MIN"}];
function Icon({icon,size=20}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function LibraryPage(){
 const [search,setSearch]=useState(""),[filter,setFilter]=useState("ALL"),[saved,setSaved]=useState<string[]>([]);
 const visible=useMemo(()=>subjects.filter(s=>(filter==="ALL"||s.slug===filter)&& (s.name+s.hi+s.desc).toLowerCase().includes(search.toLowerCase())),[filter,search]);
 return <main className="library-app">
  <header className="library-top"><Link href="/" className="library-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>LEARNING SPACE / DIGITAL LIBRARY</span><span className="library-top-count">06 SUBJECTS</span></header>
  <div className="library-wrap">
   <section className="library-hero"><div className="library-hero-copy"><span className="library-kicker">THE KNOWLEDGE ARCHIVE / 01</span><h1>Study with<br/><em>structure.</em></h1><p>एक व्यवस्थित डिजिटल लाइब्रेरी—जहाँ हर विषय, टॉपिक और अध्ययन सामग्री एक स्पष्ट learning path में मिले।</p><div className="library-stats"><div><strong>06</strong><span>SUBJECTS</span></div><div><strong>69</strong><span>TOPICS</span></div><div><strong>206</strong><span>RESOURCES</span></div></div></div><div className="library-hero-art"><div className="library-book-stack"><i/><i/><i/><b>GK</b></div><span>LEARN · REVISE · MASTER</span></div></section>
   <section className="library-tools"><label><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subjects, topics and resources..."/></label><span>CURATED FOR UPSC / STATE PCS</span></section>
   <section className="library-subject-section"><div className="library-section-head"><div><span className="library-kicker">EXPLORE THE SYLLABUS</span><h2>Subject <em>Universe.</em></h2></div><small>{visible.length.toString().padStart(2,"0")} / 06</small></div>
    <div className="library-subject-grid">{visible.map((s,i)=><motion.div key={s.slug} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="library-subject-card" style={{"--subject-color":s.color} as React.CSSProperties}>
      <div className="library-subject-card-top"><span className="library-subject-icon"><Icon icon={s.icon} size={25}/></span><span className="library-subject-index">0{i+1} / SUBJECT</span></div><h3>{s.name}</h3><h4>{s.hi}</h4><p>{s.desc}</p><div className="library-subject-meta"><span>{s.topics} TOPICS</span><span>{s.resources} RESOURCES</span></div><Link href={"/library/"+s.slug}>Explore subject <Icon icon={ArrowUpRight01Icon}/></Link>
     </motion.div>)}</div>{visible.length===0&&<div className="library-empty">No matching subjects found.</div>}
   </section>
   <section className="library-recent"><div className="library-section-head"><div><span className="library-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Featured <em>resources.</em></h2></div><span className="library-recent-label">EDITOR&apos;S PICKS</span></div><div className="library-resource-grid">{resources.map((r,i)=><article key={r.title} className="library-resource-card"><span className="library-resource-type">{r.type}</span><div className="library-resource-icon"><Icon icon={i===1?File01Icon:BookOpen01Icon} size={24}/></div><h3>{r.title}</h3><p>{r.sub}</p><div><span>{r.time}</span><button aria-label="Save resource" className={saved.includes(r.title)?"saved":""} onClick={()=>setSaved(v=>v.includes(r.title)?v.filter(x=>x!==r.title):[...v,r.title])}><Icon icon={Bookmark01Icon}/></button></div></article>)}</div></section>
   <footer className="library-footer">GYANKUNJ · CIVILPREP <span>KNOWLEDGE, ORGANISED.</span></footer>
  </div>
 </main>;
}

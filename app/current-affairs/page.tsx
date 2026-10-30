"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,Search01Icon,NewspaperIcon} from "@hugeicons/core-free-icons";
const articles=[
 {slug:"semiconductor-mission",category:"SCIENCE & TECHNOLOGY",time:"08 MIN READ",date:"30 OCT 2026",title:"भारत का सेमीकंडक्टर मिशन",summary:"आत्मनिर्भरता, वैश्विक आपूर्ति शृंखला और रणनीतिक क्षमता का विश्लेषण।",tag:"STRATEGIC TECHNOLOGY"},
 {slug:"fiscal-federalism",category:"POLITY & GOVERNANCE",time:"06 MIN READ",date:"29 OCT 2026",title:"भारत में राजकोषीय संघवाद",summary:"वित्त आयोग, कर-वितरण और केंद्र-राज्य वित्तीय संबंधों की बदलती भूमिका।",tag:"CONSTITUTION"},
 {slug:"green-hydrogen",category:"ENVIRONMENT",time:"07 MIN READ",date:"28 OCT 2026",title:"राष्ट्रीय हरित हाइड्रोजन मिशन",summary:"ऊर्जा संक्रमण, औद्योगिक डीकार्बोनाइजेशन और भारत की निर्यात क्षमता।",tag:"CLIMATE & ENERGY"},
 {slug:"digital-public-infrastructure",category:"ECONOMY",time:"09 MIN READ",date:"27 OCT 2026",title:"डिजिटल पब्लिक इंफ्रास्ट्रक्चर",summary:"आधार, UPI और डिजिटल सेवाओं के माध्यम से समावेशी विकास का मॉडल।",tag:"DIGITAL ECONOMY"}
];
const categories=["ALL","SCIENCE & TECHNOLOGY","POLITY & GOVERNANCE","ENVIRONMENT","ECONOMY"];
function Icon({icon,size=18}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function CurrentAffairsPage(){
 const [category,setCategory]=useState("ALL"),[search,setSearch]=useState("");
 const filtered=useMemo(()=>articles.filter(a=>(category==="ALL"||a.category===category)&&(a.title+a.summary+a.category).toLowerCase().includes(search.toLowerCase())),[category,search]);
 const featured=articles[0];
 return <main className="editorial-app">
  <header className="editorial-top"><Link href="/" className="editorial-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>KNOWLEDGE / DAILY EDITORIAL</span><span className="editorial-date">30 OCT 2026</span></header>
  <div className="editorial-wrap">
   <section className="editorial-hero">
    <div className="editorial-hero-copy"><span className="editorial-kicker"><i/> THE DAILY BRIEF / 01</span><h1>Read beyond<br/>the <em>headlines.</em></h1><p>समसामयिक घटनाओं को संदर्भ, विश्लेषण और परीक्षा-दृष्टि के साथ समझें। हर दिन एक विषय, गहरी तैयारी के लिए।</p>
     <div className="editorial-hero-meta"><span><Icon icon={Clock01Icon}/> 08 MIN READ</span><span>UPSC · STATE PCS · SSC</span></div>
     <Link href={"/current-affairs/"+featured.slug} className="editorial-cta">Read today&apos;s editorial <Icon icon={ArrowUpRight01Icon}/></Link>
    </div>
    <div className="editorial-visual"><div className="editorial-visual-orbit"/><div className="editorial-chip"><span>INDIA</span><strong>01</strong><small>TECHNOLOGY<br/>SOVEREIGNTY</small></div><div className="editorial-visual-index">GK / 2026</div></div>
   </section>
   <section className="editorial-featured">
    <div className="editorial-featured-art"><span>FEATURED ANALYSIS</span><div className="editorial-chip-mini">Si</div><small>SEMICONDUCTOR<br/>ECOSYSTEM</small></div>
    <div className="editorial-featured-copy"><span className="editorial-kicker">TODAY&apos;S EDITORIAL · {featured.date}</span><h2>{featured.title}</h2><p>{featured.summary}</p><div className="editorial-card-foot"><span>{featured.category} · {featured.time}</span><Link href={"/current-affairs/"+featured.slug}>Explore analysis <Icon icon={ArrowUpRight01Icon}/></Link></div></div>
   </section>
   <section className="editorial-library">
    <div className="editorial-section-heading"><div><span className="editorial-kicker">BUILD YOUR CONTEXT</span><h2>Daily <em>Dispatches.</em></h2></div><span>{filtered.length.toString().padStart(2,"0")} ARTICLES</span></div>
    <label className="editorial-search"><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search editorials, topics, themes..."/></label>
    <div className="editorial-filters">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="editorial-list">{filtered.map((a,i)=><motion.article key={a.slug} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="editorial-list-card">
      <div className="editorial-list-number">0{i+1}</div><div className="editorial-list-copy"><span>{a.category} · {a.date}</span><h3>{a.title}</h3><p>{a.summary}</p><small>{a.tag} · {a.time}</small></div><Link href={"/current-affairs/"+a.slug} aria-label={"Read "+a.title}><Icon icon={ArrowUpRight01Icon}/></Link>
     </motion.article>)}{filtered.length===0&&<div className="editorial-empty">No editorials match this search. Try another topic or category.</div>}</div>
   </section>
   <footer className="editorial-footer">GYANKUNJ · CIVILPREP <span>READ · CONNECT · RECALL</span></footer>
  </div>
 </main>;
}

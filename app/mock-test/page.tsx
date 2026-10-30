"use client";
import Link from "next/link";
import {useState} from "react";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Notebook01Icon,CheckmarkCircle02Icon,Target01Icon} from "@hugeicons/core-free-icons";

const tests=[
 {id:"gs1",name:"UPSC CSE · General Studies Paper I",tag:"PRELIMS",questions:100,duration:"2 HOURS",marks:200,negative:"−⅓ mark",status:"Question bank setup"},
 {id:"csat",name:"UPSC CSE · General Studies Paper II",tag:"CSAT",questions:80,duration:"2 HOURS",marks:200,negative:"−⅓ mark",status:"Question bank setup"}
];
function Icon({icon,size=20}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function MockTestPage(){
 const [showInfo,setShowInfo]=useState(false);
 return <main className="mock-app">
  <header className="mock-top"><Link href="/" className="mock-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>ASSESSMENT / MOCK TESTS</span><span className="mock-live">PRELIMS SERIES</span></header>
  <div className="mock-wrap">
   <section className="mock-hero">
    <div className="mock-kicker">EXAM SIMULATION · 2026</div>
    <h1>Full-length <em>Mock Tests.</em></h1>
    <p>Practice under exam-like conditions. Build accuracy, time discipline and confidence before the actual examination.</p>
    <div className="mock-hero-stats"><div><strong>100</strong><span>GS PAPER I QUESTIONS</span></div><div><strong>120</strong><span>MINUTES</span></div><div><strong>−⅓</strong><span>NEGATIVE MARKING</span></div></div>
   </section>
   <div className="mock-section-head"><span>SELECT YOUR EXAM</span><small>UPSC CSE / PRELIMS</small></div>
   <section className="mock-test-grid">{tests.map((t,i)=><motion.article key={t.id} className="mock-test-card" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.1}}>
    <div className="mock-card-top"><span className="mock-tag">{t.tag}</span><span className="mock-index">0{i+1} / 02</span></div>
    <div className="mock-card-icon"><Icon icon={i===0?Notebook01Icon:Target01Icon} size={27}/></div>
    <h2>{t.name}</h2><p>Full syllabus coverage · Exam pattern · Performance report</p>
    <div className="mock-metrics"><div><strong>{t.questions}</strong><span>Questions</span></div><div><strong>{t.duration}</strong><span>Duration</span></div><div><strong>{t.marks}</strong><span>Max marks</span></div></div>
    <div className="mock-card-foot"><span>{t.status}</span><button onClick={()=>setShowInfo(true)}>View format <Icon icon={ArrowUpRight01Icon} size={16}/></button></div>
   </motion.article>)}</section>
   <section className="mock-guidelines"><div className="mock-guideline-icon"><Icon icon={CheckmarkCircle02Icon} size={25}/></div><div><span>TEST ENVIRONMENT</span><h3>Built for serious preparation.</h3><p>Timed sessions, question palette, mark-for-review, negative marking and a detailed result analysis are part of the mock-test workflow.</p></div></section>
   <section className="mock-preview"><div><span className="mock-kicker">INTERACTIVE PREVIEW</span><h2>Try the question interface.</h2><p>Explore navigation, answer selection and review flow using a short sample set. This is a preview, not a scored full-length examination.</p></div><Link href="/mock-test/preview" className="mock-launch">Start sample test <Icon icon={ArrowUpRight01Icon}/></Link></section>
   <footer className="mock-footer">GYANKUNJ · CIVILPREP <span>LEARN WITH INTENT. PERFORM WITH CLARITY.</span></footer>
  </div>
  {showInfo&&<div className="mock-modal-back" onClick={()=>setShowInfo(false)}><div className="mock-modal" onClick={e=>e.stopPropagation()}><button onClick={()=>setShowInfo(false)}>×</button><span className="mock-kicker">EXAM BLUEPRINT</span><h2>Full-length test configuration</h2><p>The exam structure is ready. The verified full-length question bank and attempt history need to be connected before these papers can be launched as official mock tests.</p><div><b>GS Paper I</b><span>100 questions · 120 minutes · 200 marks</span></div><div><b>CSAT Paper II</b><span>80 questions · 120 minutes · 200 marks</span></div></div></div>}
 </main>;
}

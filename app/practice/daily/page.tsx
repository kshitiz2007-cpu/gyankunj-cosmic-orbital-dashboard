"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, CheckmarkCircle02Icon, Clock01Icon, Flag01Icon, Refresh01Icon, Target01Icon } from "@hugeicons/core-free-icons";

type Question = { id:number; subject:string; topic:string; prompt:string; options:string[]; answer:number; explanation:string; };
const questions:Question[] = [
 {id:1,subject:"Polity",topic:"Constitutional Framework",prompt:"भारतीय संविधान में 'कानून के समक्ष समानता' का प्रावधान किस अनुच्छेद में दिया गया है?",options:["अनुच्छेद 12","अनुच्छेद 14","अनुच्छेद 19","अनुच्छेद 21"],answer:1,explanation:"अनुच्छेद 14 राज्य को भारत के राज्यक्षेत्र में किसी व्यक्ति को कानून के समक्ष समानता अथवा कानूनों के समान संरक्षण से वंचित करने से रोकता है।"},
 {id:2,subject:"Polity",topic:"Fundamental Rights",prompt:"निम्नलिखित में से कौन-सा अधिकार केवल भारतीय नागरिकों को उपलब्ध है?",options:["कानून के समक्ष समानता","जीवन और व्यक्तिगत स्वतंत्रता","भाषण एवं अभिव्यक्ति की स्वतंत्रता","धार्मिक स्वतंत्रता"],answer:2,explanation:"अनुच्छेद 19 के अधिकार केवल भारतीय नागरिकों को प्राप्त हैं, जबकि अनुच्छेद 14 और 21 जैसे अधिकार सभी व्यक्तियों को उपलब्ध हैं।"},
 {id:3,subject:"Polity",topic:"Parliament",prompt:"धन विधेयक (Money Bill) होने का अंतिम निर्णय कौन करता है?",options:["राष्ट्रपति","प्रधानमंत्री","लोकसभा अध्यक्ष","राज्यसभा के सभापति"],answer:2,explanation:"अनुच्छेद 110 के अंतर्गत किसी विधेयक के धन विधेयक होने या न होने पर लोकसभा अध्यक्ष का निर्णय अंतिम होता है।"},
 {id:4,subject:"Economy",topic:"National Income",prompt:"भारत में GDP के आकलन के लिए आधार वर्ष वर्तमान में क्या है?",options:["2011–12","2015–16","2020–21","2022–23"],answer:0,explanation:"वर्तमान आधिकारिक राष्ट्रीय लेखा श्रृंखला में GDP का आधार वर्ष 2011–12 है। नई श्रृंखला पर आधिकारिक बदलाव की घोषणा होने पर इसे अपडेट किया जाएगा।"},
 {id:5,subject:"Environment",topic:"Biodiversity",prompt:"'जैव विविधता हॉटस्पॉट' की अवधारणा किस वैज्ञानिक ने प्रस्तुत की?",options:["यूजीन ओडम","नॉर्मन मायर्स","चार्ल्स एल्टन","अलेक्जेंडर वॉन हम्बोल्ट"],answer:1,explanation:"ब्रिटिश पर्यावरण वैज्ञानिक नॉर्मन मायर्स ने 1988 में जैव विविधता हॉटस्पॉट की अवधारणा प्रस्तुत की।"}
];

function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}

export default function DailyDrillPage(){
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<number,number>>({});
 const [marked,setMarked]=useState<number[]>([]);
 const [submitted,setSubmitted]=useState(false);
 const [seconds,setSeconds]=useState(12*60);
 const [showExplanation,setShowExplanation]=useState(false);
 const current=questions[index];
 const attempted=Object.keys(answers).length;
 const score=useMemo(()=>questions.reduce((sum,q)=>sum+(answers[q.id]===q.answer?1:0),0),[answers]);
 const choose=(option:number)=>{if(!submitted){setAnswers(v=>({...v,[current.id]:option}));setShowExplanation(false)}};
 const finish=()=>setSubmitted(true);
 const restart=()=>{setIndex(0);setAnswers({});setMarked([]);setSubmitted(false);setSeconds(12*60);setShowExplanation(false)};
 const toggleMark=()=>setMarked(v=>v.includes(current.id)?v.filter(x=>x!==current.id):[...v,current.id]);
 const mm=String(Math.floor(seconds/60)).padStart(2,"0"), ss=String(seconds%60).padStart(2,"0");
 return <main className="drill-app">
  <header className="drill-topbar">
   <Link href="/" className="drill-back"><Icon icon={ArrowLeft01Icon}/><span>GYANKUNJ</span></Link>
   <div className="drill-session-label"><span className="live-dot"/> DAILY PRACTICE SESSION</div>
   <div className="drill-timer"><Icon icon={Clock01Icon}/><span>{mm}:{ss}</span></div>
  </header>
  <div className="drill-wrap">
   <section className="drill-intro">
    <div><span className="drill-kicker">YOUR DAILY EDGE / 01</span><h1>Daily <em>Drill.</em></h1><p>आज की तैयारी, कल की सफलता। Focus, practice and improve.</p></div>
    <div className="drill-intro-stat"><strong>{attempted.toString().padStart(2,"0")}<small>/{questions.length}</small></strong><span>ATTEMPTED</span></div>
   </section>
   {!submitted?<>
    <section className="drill-progress-card">
     <div className="drill-progress-meta"><span>SESSION PROGRESS</span><strong>{Math.round(attempted/questions.length*100)}%</strong></div>
     <div className="drill-progress-track"><i style={{width:(attempted/questions.length*100)+"%"}}/></div>
     <div className="drill-progress-foot"><span>5 curated questions</span><span>{marked.length} marked for review</span></div>
    </section>
    <div className="drill-layout">
     <section className="question-card">
      <div className="question-card-top"><span className="question-number">QUESTION <b>{String(index+1).padStart(2,"0")}</b><small> / {questions.length}</small></span><span className="question-topic">{current.subject} · {current.topic}</span></div>
      <h2>{current.prompt}</h2>
      <div className="option-list">{current.options.map((option,i)=><button key={option} className={"answer-option "+(answers[current.id]===i?"selected":"")} onClick={()=>choose(i)} disabled={submitted}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span><span className="option-check">{answers[current.id]===i?"✓":""}</span></button>)}</div>
      <div className="question-actions"><button className={"mark-button "+(marked.includes(current.id)?"marked":"")} onClick={toggleMark}><Icon icon={Flag01Icon} size={16}/>{marked.includes(current.id)?"Marked for review":"Mark for review"}</button><div className="question-nav"><button disabled={index===0} onClick={()=>{setIndex(v=>v-1);setShowExplanation(false)}}><Icon icon={ArrowLeft01Icon}/> Prev</button><button className="next-question" disabled={index===questions.length-1} onClick={()=>{setIndex(v=>v+1);setShowExplanation(false)}}>Next <Icon icon={ArrowRight01Icon}/></button></div></div>
      <AnimatePresence>{showExplanation&&<motion.div className="answer-explanation" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><strong>CONCEPT NOTE</strong><p>{current.explanation}</p></motion.div>}</AnimatePresence>
     </section>
     <aside className="question-rail">
      <div className="rail-heading"><span>QUESTION PALETTE</span><small>{attempted}/{questions.length} DONE</small></div>
      <div className="question-grid">{questions.map((q,i)=><button key={q.id} className={(index===i?"current ":"")+(answers[q.id]!==undefined?"answered ":"")+(marked.includes(q.id)?"flagged":"")} onClick={()=>{setIndex(i);setShowExplanation(false)}}>{i+1}</button>)}</div>
      <div className="palette-legend"><span><i className="legend-current"/>Current</span><span><i className="legend-answered"/>Answered</span><span><i className="legend-flagged"/>Review</span></div>
      <div className="rail-tip"><span>✦</span><p>Tip: Mark questions you want to revisit before submitting your drill.</p></div>
      <button className="submit-drill" onClick={finish}>Submit drill <Icon icon={ArrowUpRight01Icon}/></button>
     </aside>
    </div>
   </>:<section className="result-card">
     <div className="result-orbit"><span>YOUR SCORE</span><strong>{score}<small>/{questions.length}</small></strong><em>{Math.round(score/questions.length*100)}% ACCURACY</em></div>
     <div className="result-copy"><span className="drill-kicker">SESSION COMPLETE</span><h2>{score>=4?"Excellent momentum.":score>=3?"Good progress.":"Keep building consistency."}</h2><p>You attempted {attempted} of {questions.length} questions. Review the explanations and strengthen your concepts.</p>
      <div className="result-stats"><div><strong>{score}</strong><span>Correct</span></div><div><strong>{attempted-score}</strong><span>Incorrect</span></div><div><strong>{questions.length-attempted}</strong><span>Skipped</span></div></div>
      <button className="submit-drill" onClick={restart}><Icon icon={Refresh01Icon}/> Try again</button>
     </div>
     <div className="review-list"><h3>ANSWER REVIEW</h3>{questions.map((q,i)=><button key={q.id} onClick={()=>{setIndex(i);setSubmitted(false);setShowExplanation(true)}}><span className={answers[q.id]===q.answer?"review-correct":"review-wrong"}>{answers[q.id]===q.answer?"✓":"×"}</span><span>Q{i+1} · {q.topic}</span><Icon icon={ArrowRight01Icon} size={16}/></button>)}</div>
    </section>}
   <footer className="drill-footer"><span>GYANKUNJ · CIVILPREP</span><span>LEARN WITH INTENT. REVISE WITH PURPOSE.</span></footer>
  </div>
 </main>;
}

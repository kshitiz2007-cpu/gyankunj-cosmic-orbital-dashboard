"use client";

import Link from "next/link";
import {useCallback,useEffect,useMemo,useState} from "react";
import {AnimatePresence,motion} from "motion/react";
import {useRouter} from "next/navigation";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowRight01Icon,ArrowUpRight01Icon,Clock01Icon,Flag01Icon,Refresh01Icon} from "@hugeicons/core-free-icons";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";

type Question={id:string;subject:string;topic:string;prompt:string;options:string[];answer:number;explanation:string};
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}

export default function DailyDrillPage(){
 const router=useRouter();
 const [assessmentId,setAssessmentId]=useState<string|null>(null);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState("");
 const [index,setIndex]=useState(0);
 const [answers,setAnswers]=useState<Record<string,number>>({});
 const [marked,setMarked]=useState<string[]>([]);
 const [submitted,setSubmitted]=useState(false);
 const [saving,setSaving]=useState(false);
 const [saveMessage,setSaveMessage]=useState("");
 const [seconds,setSeconds]=useState(12*60);
 const [showExplanation,setShowExplanation]=useState(false);

 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){setLoadError("Supabase configuration is missing.");setLoading(false);return;}
   const {data:{user}}=await supabase.auth.getUser();
   if(!user){router.replace("/login");return;}
   const {data:assessment,error:assessmentError}=await supabase.from("assessments").select("id,duration_minutes").eq("kind","daily_drill").eq("is_published",true).order("created_at",{ascending:false}).limit(1).maybeSingle();
   if(assessmentError)throw assessmentError;
   if(!assessment){if(active)setLoading(false);return;}
   const {data:rows,error:questionError}=await supabase.from("questions").select("id,subject_id,topic,question_en,question_hi,options_en,options_hi,correct_option,explanation_en,explanation_hi").eq("assessment_id",assessment.id).order("created_at",{ascending:true});
   if(questionError)throw questionError;
   if(!active)return;
   setAssessmentId(assessment.id);
   setSeconds(Math.max(1,Number(assessment.duration_minutes)||12)*60);
   setQuestions((rows||[]).map((q)=>({
    id:q.id,
    subject:"UPSC",
    topic:q.topic||"General Studies",
    prompt:q.question_hi||q.question_en,
    options:Array.isArray(q.options_hi)&&q.options_hi.length===4?q.options_hi:q.options_en,
    answer:q.correct_option,
    explanation:q.explanation_hi||q.explanation_en||""
   })));
   setLoading(false);
  };
  void load().catch(error=>{if(active){setLoadError(error instanceof Error?error.message:"Unable to load today's drill.");setLoading(false);}});
  return()=>{active=false;};
 },[router]);

 const current=questions[index];
 const attempted=Object.keys(answers).length;
 const score=useMemo(()=>questions.reduce((sum,q)=>sum+(answers[q.id]===q.answer?1:0),0),[answers,questions]);
 useEffect(()=>{if(loading||submitted||seconds<=0||questions.length===0)return;const timer=window.setInterval(()=>setSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[loading,submitted,seconds,questions.length]);
 const choose=(option:number)=>{if(!submitted&&current){setAnswers(value=>({...value,[current.id]:option}));setShowExplanation(false);}};
 const finish=useCallback(async()=>{
  if(!assessmentId||submitted||saving)return;
  setSubmitted(true);setSaving(true);setSaveMessage("");
  const supabase=getSupabaseBrowserClient();
  const {data:{user}}=await supabase!.auth.getUser();
  if(!user){router.replace("/login");return;}
  const submittedAt=new Date().toISOString();
  const {data:attempt,error}=await supabase!.from("assessment_attempts").insert({
   assessment_id:assessmentId,
   student_id:user.id,
   answers,
   score,
   submitted_at:submittedAt
  }).select("id").single();
  if(!error&&attempt){
   const {error:activityError}=await supabase!.from("student_activity").insert({student_id:user.id,activity_type:"daily_drill_submitted",reference_id:assessmentId,metadata:{attempt_id:attempt.id,score,question_count:questions.length,answered_count:attempted,accuracy:questions.length?Math.round(score/questions.length*100):0}});
   if(activityError)setSaveMessage("Attempt saved; activity sync warning: "+activityError.message);
  }
  setSaving(false);
  if(!error)setSaveMessage("Your attempt has been saved to your student account.");else setSaveMessage("Your result is visible here, but could not be saved: "+error.message);
 },[assessmentId,submitted,saving,answers,score,router]);
 const restart=()=>{setIndex(0);setAnswers({});setMarked([]);setSubmitted(false);setSeconds(12*60);setShowExplanation(false);setSaveMessage("");};
 const toggleMark=()=>{if(current)setMarked(value=>value.includes(current.id)?value.filter(id=>id!==current.id):[...value,current.id]);};
 const mm=String(Math.floor(seconds/60)).padStart(2,"0"),ss=String(seconds%60).padStart(2,"0");

 if(loading)return <main className="drill-app"><div className="drill-wrap"><p>Loading your published Daily Drill…</p></div></main>;
 if(loadError)return <main className="drill-app"><div className="drill-wrap"><h1>Daily <em>Drill.</em></h1><p role="alert">{loadError}</p><Link href="/login">Sign in</Link></div></main>;
 if(!assessmentId||questions.length===0)return <main className="drill-app"><header className="drill-topbar"><Link href="/" className="drill-back"><Icon icon={ArrowLeft01Icon}/><span>GYANKUNJ</span></Link><div className="drill-session-label">DAILY PRACTICE</div></header><div className="drill-wrap"><section className="drill-intro"><div><span className="drill-kicker">YOUR DAILY EDGE / 01</span><h1>Daily <em>Drill.</em></h1><p>आज की तैयारी, कल की सफलता। Focus, practice and improve.</p></div></section><section className="result-card"><div className="result-copy"><span className="drill-kicker">YOUR NEXT SESSION IS ON ITS WAY</span><h2>No drill published yet.</h2><p>अभी आपके लिए कोई Daily Drill प्रकाशित नहीं की गई है। Faculty/Admin के Question Bank से drill publish होते ही वह यहाँ दिखाई देगी। इस account पर कोई demo questions नहीं दिखाए जा रहे हैं।</p><Link className="submit-drill" href="/library">Explore Study Library <Icon icon={ArrowUpRight01Icon}/></Link></div></section></div></main>;

 return <main className="drill-app">
  <header className="drill-topbar"><Link href="/" className="drill-back"><Icon icon={ArrowLeft01Icon}/><span>GYANKUNJ</span></Link><div className="drill-session-label"><span className="live-dot"/> PUBLISHED DAILY DRILL</div><div className="drill-timer"><Icon icon={Clock01Icon}/><span>{mm}:{ss}</span></div></header>
  <div className="drill-wrap">
   <section className="drill-intro"><div><span className="drill-kicker">YOUR DAILY EDGE / 01</span><h1>Daily <em>Drill.</em></h1><p>आज की तैयारी, कल की सफलता। Focus, practice and improve.</p></div><div className="drill-intro-stat"><strong>{attempted.toString().padStart(2,"0")}<small>/{questions.length}</small></strong><span>ATTEMPTED</span></div></section>
   {!submitted?<><section className="drill-progress-card"><div className="drill-progress-meta"><span>SESSION PROGRESS</span><strong>{Math.round(attempted/questions.length*100)}%</strong></div><div className="drill-progress-track"><i style={{width:(attempted/questions.length*100)+"%"}}/></div><div className="drill-progress-foot"><span>{questions.length} published questions</span><span>{marked.length} marked for review</span></div></section>
    <div className="drill-layout"><section className="question-card"><div className="question-card-top"><span className="question-number">QUESTION <b>{String(index+1).padStart(2,"0")}</b><small> / {questions.length}</small></span><span className="question-topic">{current.subject} · {current.topic}</span></div><h2>{current.prompt}</h2><div className="option-list">{current.options.map((option,i)=><button key={option} className={"answer-option "+(answers[current.id]===i?"selected":"")} onClick={()=>choose(i)}><span className="option-letter">{String.fromCharCode(65+i)}</span><span>{option}</span><span className="option-check">{answers[current.id]===i?"✓":""}</span></button>)}</div><div className="question-actions"><button className={"mark-button "+(marked.includes(current.id)?"marked":"")} onClick={toggleMark}><Icon icon={Flag01Icon} size={16}/>{marked.includes(current.id)?"Marked for review":"Mark for review"}</button><div className="question-nav"><button disabled={index===0} onClick={()=>{setIndex(value=>value-1);setShowExplanation(false)}}><Icon icon={ArrowLeft01Icon}/> Prev</button><button className="next-question" disabled={index===questions.length-1} onClick={()=>{setIndex(value=>value+1);setShowExplanation(false)}}>Next <Icon icon={ArrowRight01Icon}/></button></div></div><AnimatePresence>{showExplanation&&<motion.div className="answer-explanation" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}><strong>CONCEPT NOTE</strong><p>{current.explanation}</p></motion.div>}</AnimatePresence></section>
     <aside className="question-rail"><div className="rail-heading"><span>QUESTION PALETTE</span><small>{attempted}/{questions.length} DONE</small></div><div className="question-grid">{questions.map((q,i)=><button key={q.id} className={(index===i?"current ":"")+(answers[q.id]!==undefined?"answered ":"")+(marked.includes(q.id)?"flagged":"")} onClick={()=>{setIndex(i);setShowExplanation(false)}}>{i+1}</button>)}</div><div className="palette-legend"><span><i className="legend-current"/>Current</span><span><i className="legend-answered"/>Answered</span><span><i className="legend-flagged"/>Review</span></div><div className="rail-tip"><span>✦</span><p>Tip: Mark questions you want to revisit before submitting your drill.</p></div><button className="submit-drill" onClick={finish} disabled={saving}>Submit drill <Icon icon={ArrowUpRight01Icon}/></button></aside>
    </div>
   </>:<section className="result-card"><div className="result-orbit"><span>YOUR SCORE</span><strong>{score}<small>/{questions.length}</small></strong><em>{Math.round(score/questions.length*100)}% ACCURACY</em></div><div className="result-copy"><span className="drill-kicker">SESSION COMPLETE</span><h2>{score/questions.length>=.8?"Excellent momentum.":score/questions.length>=.5?"Good progress.":"Keep building consistency."}</h2><p>You attempted {attempted} of {questions.length} questions. Review the explanations and strengthen your concepts.</p><div className="result-stats"><div><strong>{score}</strong><span>Correct</span></div><div><strong>{attempted-score}</strong><span>Incorrect</span></div><div><strong>{questions.length-attempted}</strong><span>Skipped</span></div></div><p>{saving?"Saving your attempt…":saveMessage}</p><button className="submit-drill" onClick={restart}><Icon icon={Refresh01Icon}/> Try again</button></div><div className="review-list"><h3>ANSWER REVIEW</h3>{questions.map((q,i)=><button key={q.id} onClick={()=>{setIndex(i);setSubmitted(false);setShowExplanation(true)}}><span className={answers[q.id]===q.answer?"review-correct":"review-wrong"}>{answers[q.id]===q.answer?"✓":"×"}</span><span>Q{i+1} · {q.topic}</span><Icon icon={ArrowRight01Icon} size={16}/></button>)}</div></section>}
   <footer className="drill-footer"><span>GYANKUNJ · CIVILPREP</span><span>LEARN WITH INTENT. REVISE WITH PURPOSE.</span></footer>
  </div>
 </main>;
}

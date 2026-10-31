"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Notebook01Icon,CheckmarkCircle02Icon,Target01Icon} from "@hugeicons/core-free-icons";

type MockAssessment={id:string;title:string;duration_minutes:number;negative_mark:number;created_at:string;question_count:number};
function Icon({icon,size=20}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function MockTestPage(){
 const [showInfo,setShowInfo]=useState(false);
 const [tests,setTests]=useState<MockAssessment[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){setError("Assessment service is unavailable.");setLoading(false);return;}
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError||!user){window.location.href="/login";return;}
   const {data:rows,error:queryError}=await supabase.from("assessments").select("id,title,duration_minutes,negative_mark,created_at").eq("kind","mock").eq("is_published",true).order("created_at",{ascending:false});
   if(queryError)throw queryError;
   const ids=(rows||[]).map(row=>row.id);
   const {data:questions,error:questionError}=ids.length?await supabase.from("questions").select("assessment_id").in("assessment_id",ids):{data:[],error:null};
   if(questionError)throw questionError;
   const counts=new Map<string,number>();
   for(const question of questions||[])counts.set(question.assessment_id,(counts.get(question.assessment_id)||0)+1);
   if(active){setTests((rows||[]).map(row=>({...row,question_count:counts.get(row.id)||0})).filter(row=>row.question_count>0));setLoading(false);}
  };
  void load().catch(e=>{if(active){setError(e instanceof Error?e.message:"Unable to load published mock tests.");setLoading(false);}});
  return()=>{active=false;};
 },[]);
 return <main className="mock-app">
  <header className="mock-top"><Link href="/" className="mock-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>ASSESSMENT / MOCK TESTS</span><span className="mock-live">PRELIMS SERIES</span></header>
  <div className="mock-wrap">
   <section className="mock-hero">
    <div className="mock-kicker">EXAM SIMULATION · 2026</div>
    <h1>Full-length <em>Mock Tests.</em></h1>
    <p>Practice under exam-like conditions. Build accuracy, time discipline and confidence before the actual examination.</p>
    <div className="mock-hero-stats"><div><strong>{tests.length}</strong><span>PUBLISHED MOCK TESTS</span></div><div><strong>{tests.reduce((n,t)=>n+t.question_count,0)}</strong><span>AVAILABLE QUESTIONS</span></div><div><strong>LIVE</strong><span>SUPABASE QUESTION BANK</span></div></div>
   </section>
   <div className="mock-section-head"><span>SELECT YOUR EXAM</span><small>UPSC CSE / PRELIMS</small></div>
   {loading?<p className="mock-empty">Loading published mock tests…</p>:error?<p className="mock-empty" role="alert">{error}</p>:<section className="mock-test-grid">{tests.map((t,i)=><motion.article key={t.id} className="mock-test-card" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*.06}}>
    <div className="mock-card-top"><span className="mock-tag">PUBLISHED MOCK</span><span className="mock-index">{String(i+1).padStart(2,"0")} / {String(tests.length).padStart(2,"0")}</span></div>
    <div className="mock-card-icon"><Icon icon={Notebook01Icon} size={27}/></div>
    <h2>{t.title}</h2><p>Published question bank · Timed assessment · Performance report</p>
    <div className="mock-metrics"><div><strong>{t.question_count}</strong><span>Questions</span></div><div><strong>{t.duration_minutes} MIN</strong><span>Duration</span></div><div><strong>{Number(t.negative_mark)||0}</strong><span>Negative mark</span></div></div>
    <div className="mock-card-foot"><span>READY TO ATTEMPT</span><Link href={"/mock-test/preview?id="+t.id}>Start test <Icon icon={ArrowUpRight01Icon} size={16}/></Link></div>
   </motion.article>)}
   {tests.length===0&&<p className="mock-empty">No published mock test is available yet. Once faculty publishes an assessment with questions, it will appear here.</p>}</section>}
   <section className="mock-guidelines"><div className="mock-guideline-icon"><Icon icon={CheckmarkCircle02Icon} size={25}/></div><div><span>TEST ENVIRONMENT</span><h3>Built for serious preparation.</h3><p>Timed sessions, question palette, mark-for-review, negative marking and a detailed result analysis are part of the mock-test workflow.</p></div></section>
   
   <footer className="mock-footer">GYANKUNJ · CIVILPREP <span>LEARN WITH INTENT. PERFORM WITH CLARITY.</span></footer>
  </div>
 </main>;
}

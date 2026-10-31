"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {ArrowLeft01Icon,ArrowRight01Icon,Flag01Icon,Clock01Icon,ArrowUpRight01Icon} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from "@hugeicons/react";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
type Question={id:string;q:string;o:string[];a:number;e:string};
type SubmitResult={attempt_id:string;score:number;correct_count:number;wrong_count:number;answered_count:number;question_count:number;accuracy:number;review:Array<{id:string;correct_option:number;explanation:string}>};
function Icon({icon}:{icon:typeof ArrowLeft01Icon}){return <HugeiconsIcon icon={icon} size={18} strokeWidth={1.8}/>;}
export default function MockPreview(){
 const [assessmentId,setAssessmentId]=useState("");
 const [title,setTitle]=useState("Mock Assessment");
 const [qs,setQs]=useState<Question[]>([]);
 const [loading,setLoading]=useState(true);
 const [loadError,setLoadError]=useState("");
 const [saving,setSaving]=useState(false);
 const [saveMessage,setSaveMessage]=useState("");
 const [result,setResult]=useState<SubmitResult|null>(null);
 const [i,setI]=useState(0),[answers,setAnswers]=useState<Record<string,number>>({});
 const [flags,setFlags]=useState<number[]>([]),[done,setDone]=useState(false),[sec,setSec]=useState(0);
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const id=new URLSearchParams(window.location.search).get("id");
   if(!id){setLoadError("Select a published mock test to begin.");setLoading(false);return;}
   const supabase=getSupabaseBrowserClient();
   if(!supabase){setLoadError("Assessment service is unavailable.");setLoading(false);return;}
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError||!user){window.location.href="/login";return;}
   const {data:assessment,error:assessmentError}=await supabase.from("assessments").select("id,title,duration_minutes,negative_mark").eq("id",id).eq("kind","mock").eq("is_published",true).maybeSingle();
   if(assessmentError)throw assessmentError;
   if(!assessment){setLoadError("This mock test is unavailable or has been unpublished.");setLoading(false);return;}
   const {data:rows,error:questionError}=await supabase.from("questions").select("id,question_en,question_hi,options_en,options_hi,explanation_en,explanation_hi,topic").eq("assessment_id",assessment.id).order("created_at",{ascending:true});
   if(questionError)throw questionError;
   if(!rows?.length){setLoadError("This mock test has no published questions yet.");setLoading(false);return;}
   if(!active)return;
   setAssessmentId(assessment.id);setTitle(assessment.title);
   setSec(Math.max(1,Number(assessment.duration_minutes)||120)*60);
   setQs(rows.map(q=>({id:q.id,q:q.question_hi||q.question_en,o:Array.isArray(q.options_hi)&&q.options_hi.length===4?q.options_hi:q.options_en,a:-1,e:q.explanation_hi||q.explanation_en||""})));
   setLoading(false);
  };
  void load().catch(error=>{if(active){setLoadError(error instanceof Error?error.message:"Unable to load this mock test.");setLoading(false);}});
  return()=>{active=false;};
 },[]);
 useEffect(()=>{if(loading||done||sec<=0||!qs.length)return;const timer=window.setInterval(()=>setSec(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(timer);},[loading,done,sec,qs.length]);
 const attempted=Object.keys(answers).length;
 const q=qs[i];
 const mm=String(Math.floor(sec/60)).padStart(2,"0"),ss=String(sec%60).padStart(2,"0");
 const submit=async()=>{
  if(done||saving||!assessmentId)return;
  setDone(true);setSaving(true);setSaveMessage("");
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setSaving(false);setSaveMessage("Unable to connect to the assessment service.");return;}
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){window.location.href="/login";return;}
  const {data,error}=await supabase.rpc("submit_assessment_attempt",{p_assessment_id:assessmentId,p_answers:answers});
  if(error){setSaveMessage("Result could not be saved: "+error.message);setSaving(false);return;}
  setResult(data as SubmitResult);
  setSaveMessage("Your mock-test result has been securely scored and saved.");
  setSaving(false);
 };
 if(loading)return <main className="mock-preview-app"><div className="preview-wrap"><p>Loading your published mock test…</p></div></main>;
 if(loadError)return <main className="mock-preview-app"><header className="preview-top"><Link href="/mock-test"><Icon icon={ArrowLeft01Icon}/> MOCK TESTS</Link></header><div className="preview-wrap"><section className="preview-result"><span>ASSESSMENT UNAVAILABLE</span><h2>Cannot start test.</h2><p>{loadError}</p><Link href="/mock-test">Back to mock tests</Link></section></div></main>;
 return <main className="mock-preview-app"><header className="preview-top"><Link href="/mock-test"><Icon icon={ArrowLeft01Icon}/> MOCK TESTS</Link><span>{title}</span><b><Icon icon={Clock01Icon}/>{mm}:{ss}</b></header><div className="preview-wrap"><div className="preview-title"><span>GYANKUNJ / EXAM SIMULATION</span><h1>{title.split(" ").slice(0,2).join(" ")} <em>{title.split(" ").slice(2).join(" ")}</em></h1><p>{qs.length} published questions · {Math.ceil(sec/60)} minutes</p></div>{!done?<div className="preview-layout"><section className="preview-question"><div className="preview-qmeta"><b>QUESTION {String(i+1).padStart(2,"0")} / {qs.length}</b><span>MOCK TEST</span></div><h2>{q.q}</h2><div className="preview-options">{q.o.map((option,n)=><button key={option} className={answers[q.id]===n?"chosen":""} onClick={()=>setAnswers(v=>({...v,[q.id]:n}))}><i>{String.fromCharCode(65+n)}</i>{option}<b>{answers[q.id]===n?"✓":""}</b></button>)}</div><div className="preview-controls"><button className={flags.includes(i)?"flagged":""} onClick={()=>setFlags(v=>v.includes(i)?v.filter(x=>x!==i):[...v,i])}><Icon icon={Flag01Icon}/> {flags.includes(i)?"Marked":"Mark for review"}</button><div><button disabled={i===0} onClick={()=>setI(v=>v-1)}><Icon icon={ArrowLeft01Icon}/> Previous</button><button disabled={i===qs.length-1} onClick={()=>setI(v=>v+1)}>Next <Icon icon={ArrowRight01Icon}/></button></div></div></section><aside className="preview-palette"><b>QUESTION PALETTE</b><div>{qs.map((item,n)=><button key={item.id} className={(i===n?"active ":"")+(answers[item.id]!==undefined?"answered ":"")+(flags.includes(n)?"flagged":"")} onClick={()=>setI(n)}>{n+1}</button>)}</div><p>{attempted} of {qs.length} answered</p><button className="preview-submit" onClick={submit} disabled={saving}>Submit mock test <Icon icon={ArrowUpRight01Icon}/></button></aside></div>:<section className="preview-result"><span>MOCK TEST COMPLETE</span><h2>{result?.correct_count??"—"} / {result?.question_count??qs.length}</h2><p>Accuracy · {result?.accuracy??0}% · Score {result?.score??"—"}</p><h3>ANSWER REVIEW</h3>{qs.map((item,n)=>{const review=result?.review.find(x=>x.id===item.id);return <article key={item.id}><b>Q{n+1} · {answers[item.id]===review?.correct_option?"Correct":"Review"}</b><p>{review?.explanation||item.e}</p></article>;})}<p>{saving?"Saving result…":saveMessage}</p><Link href="/progress">View progress analytics ↗</Link></section>}<footer className="mock-footer">GYANKUNJ · CIVILPREP <span>LIVE ASSESSMENT · RESULTS SAVED TO YOUR ACCOUNT</span></footer></div></main>;
}

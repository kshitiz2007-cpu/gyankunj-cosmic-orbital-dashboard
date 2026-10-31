"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useState} from "react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Target01Icon,FireIcon,Clock01Icon,BookOpen01Icon,CheckmarkCircle02Icon,Calendar01Icon,Activity01Icon,Refresh01Icon} from "@hugeicons/core-free-icons";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";

type Attempt={id:string;assessment_id:string;answers:Record<string,number>|null;score:number|null;started_at:string;submitted_at:string|null};
type Assessment={id:string;title:string;kind:string;subject_id:string|null;duration_minutes:number};
type Question={id:string;assessment_id:string|null;subject_id:string|null;correct_option:number;topic:string|null};
type Activity={id:string;activity_type:string;metadata:Record<string,unknown>|null;created_at:string};
type SubjectStat={name:string;done:number;total:number;accuracy:number;color:string};
type Recent={id:string;title:string;detail:string;score:string;href:string;tag:string;at:string};
const palette=["#c05a9b","#b38bd1","#65b89a","#d5a45c","#78a8c8","#c77d83"];
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
function Ring({value,color,label}:{value:number;color:string;label:string}){return <div className="progress-ring" style={{"--value":value,"--ring":color} as React.CSSProperties}><div><strong>{value}%</strong><span>{label}</span></div></div>}
function formatDuration(seconds:number){const mins=Math.max(0,Math.round(seconds/60));return mins>=60?(mins/60).toFixed(1)+" HRS":mins+" MIN";}
function titleCase(value:string){return value.replace(/[_-]/g," ").replace(/\b\w/g,x=>x.toUpperCase());}
export default function ProgressPage(){
 const [period,setPeriod]=useState("WEEK");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [assessments,setAssessments]=useState<Assessment[]>([]);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [activities,setActivities]=useState<Activity[]>([]);
 const [studentName,setStudentName]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setError("Supabase configuration is missing.");setLoading(false);return;}
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError)throw authError;
  if(!user){window.location.href="/login";return;}
  setStudentName(String(user.user_metadata?.full_name||user.email||"Student"));
  const [attemptResult,activityResult]=await Promise.all([
   supabase.from("assessment_attempts").select("id,assessment_id,answers,score,started_at,submitted_at").eq("student_id",user.id).order("started_at",{ascending:false}).limit(100),
   supabase.from("student_activity").select("id,activity_type,metadata,created_at").eq("student_id",user.id).order("created_at",{ascending:false}).limit(250)
  ]);
  if(attemptResult.error)throw attemptResult.error;
  if(activityResult.error)throw activityResult.error;
  const nextAttempts=(attemptResult.data||[]) as Attempt[];
  const ids=[...new Set(nextAttempts.map(a=>a.assessment_id))];
  let nextAssessments:Assessment[]=[];
  let nextQuestions:Question[]=[];
  if(ids.length){
   const [assessmentResult,questionResult]=await Promise.all([
    supabase.from("assessments").select("id,title,kind,subject_id,duration_minutes").in("id",ids),
    supabase.from("questions").select("id,assessment_id,subject_id,correct_option,topic").in("assessment_id",ids)
   ]);
   if(assessmentResult.error)throw assessmentResult.error;
   if(questionResult.error)throw questionResult.error;
   nextAssessments=(assessmentResult.data||[]) as Assessment[];
   nextQuestions=(questionResult.data||[]) as Question[];
  }
  setAttempts(nextAttempts);setAssessments(nextAssessments);setQuestions(nextQuestions);setActivities((activityResult.data||[]) as Activity[]);setLoading(false);
 },[]);
 useEffect(()=>{void load().catch(e=>{setError(e instanceof Error?e.message:"Unable to load learning analytics.");setLoading(false);});},[load]);
 const assessmentMap=useMemo(()=>new Map(assessments.map(a=>[a.id,a])),[assessments]);
 const questionMap=useMemo(()=>new Map(questions.map(q=>[q.id,q])),[questions]);
 const completed=useMemo(()=>attempts.filter(a=>a.submitted_at),[attempts]);
 const metrics=useMemo(()=>{
  let correct=0,answered=0,seconds=0;
  completed.forEach(a=>{
   const answerMap=a.answers||{};
   Object.entries(answerMap).forEach(([qid,choice])=>{const q=questionMap.get(qid);if(q){answered++;if(Number(choice)===q.correct_option)correct++;}});
   if(a.submitted_at)seconds+=Math.max(0,(new Date(a.submitted_at).getTime()-new Date(a.started_at).getTime())/1000);
  });
  return {correct,answered,accuracy:answered?Math.round(correct/answered*100):0,seconds,attemptCount:completed.length};
 },[completed,questionMap]);
 const subjects=useMemo(()=>{
  const buckets=new Map<string,{correct:number;answered:number;name:string}>();
  completed.forEach(a=>{
   const fallback=assessmentMap.get(a.assessment_id)?.subject_id;
   Object.entries(a.answers||{}).forEach(([qid,choice])=>{
    const q=questionMap.get(qid);if(!q)return;
    const subjectId=q.subject_id||fallback||"general";
    const name=q.topic?.split(/[·:/-]/)[0]?.trim()||"General Studies";
    const key=subjectId==="general"?name:subjectId;
    const b=buckets.get(key)||{correct:0,answered:0,name};
    b.answered++;if(Number(choice)===q.correct_option)b.correct++;buckets.set(key,b);
   });
  });
  return [...buckets.values()].map((b,i)=>({name:b.name,done:b.answered?Math.round(b.correct/b.answered*100):0,total:b.answered,accuracy:b.answered?Math.round(b.correct/b.answered*100):0,color:palette[i%palette.length]})).slice(0,6);
 },[completed,assessmentMap,questionMap]);
 const activityDays=useMemo(()=>{
  const counts=new Map<string,number>();
  [...activities,...completed.map(a=>({id:a.id,activity_type:"assessment_attempt",metadata:null,created_at:a.submitted_at||a.started_at}))].forEach(a=>{const key=new Date(a.created_at).toLocaleDateString("en-CA");counts.set(key,(counts.get(key)||0)+1);});
  const days=period==="WEEK"?14:period==="MONTH"?30:52;
  return Array.from({length:days},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(days-1-i));const key=d.toLocaleDateString("en-CA");return {date:key,count:counts.get(key)||0};});
 },[activities,completed,period]);
 const activeDays=useMemo(()=>activityDays.filter(d=>d.count>0).length,[activityDays]);
 const streak=useMemo(()=>{const dates=new Set(activityDays.filter(d=>d.count>0).map(d=>d.date));let n=0;const d=new Date();d.setHours(0,0,0,0);if(!dates.has(d.toLocaleDateString("en-CA")))d.setDate(d.getDate()-1);while(dates.has(d.toLocaleDateString("en-CA"))){n++;d.setDate(d.getDate()-1);}return n;},[activityDays]);
 const recent=useMemo<Recent[]>(()=>{
  const rows:Recent[]=[];
  completed.forEach(a=>{const assessment=assessmentMap.get(a.assessment_id);const answered=Object.keys(a.answers||{}).length;const correct=Object.entries(a.answers||{}).filter(([id,v])=>questionMap.get(id)?.correct_option===Number(v)).length;rows.push({id:a.id,title:assessment?.title||"Assessment",detail:answered+" questions attempted",score:answered?Math.round(correct/answered*100)+"%":"Submitted",href:assessment?.kind==="daily_drill"?"/practice/daily":assessment?.kind==="mock"?"/mock-test":"/practice/daily",tag:titleCase(assessment?.kind||"practice"),at:a.submitted_at||a.started_at});});
  activities.forEach(a=>{const meta=a.metadata||{};const title=String(meta.title||titleCase(a.activity_type));const slug=String(meta.slug||"");rows.push({id:a.id,title,detail:String(meta.detail||"Learning activity"),score:"RECORDED",href:slug?"/current-affairs/"+slug:"/library",tag:titleCase(a.activity_type),at:a.created_at});});
  return rows.sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()).slice(0,5);
 },[completed,assessmentMap,activities,questions,questionMap]);
 const averageSubject=subjects.length?Math.round(subjects.reduce((s,x)=>s+x.done,0)/subjects.length):0;
 if(loading)return <main className="progress-app"><div className="progress-wrap"><p>Loading your learning analytics…</p></div></main>;
 if(error)return <main className="progress-app"><div className="progress-wrap"><h1>Progress, <em>in motion.</em></h1><p role="alert">{error}</p><button className="progress-retry" onClick={()=>void load()}>Retry <Icon icon={Refresh01Icon}/></button></div></main>;
 return <main className="progress-app"><header className="progress-top"><Link href="/" className="progress-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>STUDENT ANALYTICS / MY PROGRESS</span><span className="progress-status">LIVE LEARNING INSIGHTS</span></header><div className="progress-wrap">
  <section className="progress-hero"><div><span className="progress-kicker">YOUR LEARNING INTELLIGENCE / 01</span><h1>Progress, <em>in motion.</em></h1><p>{studentName?("Welcome back, "+studentName.split("@")[0]+". "):""}अपनी तैयारी की दिशा, निरंतरता और विषयवार पकड़ को वास्तविक learning data से समझें।</p><div className="progress-hero-actions"><Link href="/practice/daily">Continue learning <Icon icon={ArrowUpRight01Icon}/></Link><span>LIVE ACCOUNT ANALYTICS</span></div></div><div className="progress-hero-ring"><Ring value={averageSubject} color="#c05a9b" label="SUBJECT MASTERY"/></div></section>
  <section className="progress-kpis"><article><span><Icon icon={FireIcon}/> LEARNING STREAK</span><strong>{String(streak).padStart(2,"0")} <small>DAYS</small></strong><p>{streak?"Consecutive active days":"Start a learning streak today"}</p></article><article><span><Icon icon={Target01Icon}/> OVERALL ACCURACY</span><strong>{metrics.accuracy}<small>%</small></strong><p>{metrics.answered?("From "+metrics.answered+" answered questions"):"No scored answers yet"}</p></article><article><span><Icon icon={Clock01Icon}/> STUDY TIME</span><strong>{formatDuration(metrics.seconds)}</strong><p>Time across submitted assessments</p></article><article><span><Icon icon={CheckmarkCircle02Icon}/> QUESTIONS SOLVED</span><strong>{metrics.answered}</strong><p>{metrics.attemptCount} submitted assessments</p></article></section>
  <section className="progress-main-grid"><div className="progress-panel progress-subject-panel"><div className="progress-heading"><div><span className="progress-kicker">MASTERY MAP</span><h2>Subject <em>strength.</em></h2></div><span>{subjects.length?("01 — "+String(subjects.length).padStart(2,"0")):"NO DATA"}</span></div>{subjects.length?subjects.map(s=><div className="progress-subject" key={s.name}><div><b>{s.name}</b><span>{s.done}% <i>{s.total} ANSWERED</i></span></div><div className="progress-bar"><i style={{width:s.done+"%",background:s.color}}/></div></div>):<div className="progress-empty"><b>Your subject map is waiting.</b><p>Complete a published Daily Drill or Mock Test to see accuracy by topic here.</p><Link href="/practice/daily">Open Daily Drill <Icon icon={ArrowUpRight01Icon}/></Link></div>}</div>
   <div className="progress-panel progress-activity-panel"><div className="progress-heading"><div><span className="progress-kicker">CONSISTENCY TRACKER</span><h2>Study <em>activity.</em></h2></div><select value={period} onChange={e=>setPeriod(e.target.value)}><option value="WEEK">2 WEEKS</option><option value="MONTH">30 DAYS</option><option value="YEAR">52 DAYS</option></select></div><div className="progress-heatmap">{activityDays.map(d=><i key={d.date} data-level={d.count===0?0:d.count===1?1:d.count<=3?2:d.count<=5?3:4} title={d.date+": "+d.count+" activities"}/>)}</div><div className="progress-legend"><span>LESS</span>{[1,2,3,4].map(v=><i key={v} data-level={v}/>)}<span>MORE</span></div><div className="progress-activity-foot"><span><Icon icon={Calendar01Icon}/> LAST {activityDays.length} DAYS</span><b>{activeDays} ACTIVE DAYS</b></div></div></section>
  <section className="progress-lower"><div className="progress-panel progress-recent"><div className="progress-heading"><div><span className="progress-kicker">KEEP THE MOMENTUM</span><h2>Recent <em>activity.</em></h2></div><span>{recent.length} RECORDS</span></div>{recent.length?recent.map(r=><Link href={r.href} className="progress-recent-row" key={r.id}><span className="progress-recent-icon"><Icon icon={r.tag.toLowerCase().includes("drill")?BookOpen01Icon:r.tag.toLowerCase().includes("mock")?Target01Icon:Activity01Icon}/></span><span><small>{r.tag}</small><b>{r.title}</b><em>{r.detail}</em></span><strong>{r.score}</strong><Icon icon={ArrowUpRight01Icon}/></Link>):<div className="progress-empty"><b>Your learning timeline starts here.</b><p>Practice attempts and recorded learning activities will appear here automatically.</p><Link href="/practice/daily">Start a Daily Drill <Icon icon={ArrowUpRight01Icon}/></Link></div>}</div><div className="progress-panel progress-insight"><span className="progress-kicker">YOUR NEXT BEST ACTION</span><div className="progress-insight-icon"><Icon icon={Target01Icon} size={28}/></div><h2>{subjects.length?"Build your next strong subject.":"Build your first learning signal."}</h2><p>{subjects.length?"Use your actual subject-wise accuracy to choose what to revise next.":"Complete a published assessment to generate your first progress insights. No sample scores are used."}</p><Link href="/practice/daily">Open Daily Drill <Icon icon={ArrowUpRight01Icon}/></Link></div></section>
  <footer className="progress-footer">GYANKUNJ · CIVILPREP <span>MEASURE · REFLECT · IMPROVE</span></footer>
 </div></main>;
}

"use client";

import Link from "next/link";
import {useCallback,useEffect,useMemo,useState} from "react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Target01Icon,FireIcon,Clock01Icon,BookOpen01Icon,CheckmarkCircle02Icon,Calendar01Icon,Activity01Icon,Refresh01Icon} from "@hugeicons/core-free-icons";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";

type Attempt={id:string;assessment_id:string;answers:Record<string,number>|null;score:number|null;correct_count:number|null;answered_count:number|null;question_count:number|null;started_at:string;submitted_at:string|null};
type Assessment={id:string;title:string;kind:string;subject_id:string|null;duration_minutes:number};
type Subject={id:string;name_en:string;name_hi:string|null};
type Activity={id:string;activity_type:string;metadata:Record<string,unknown>|null;created_at:string};
type SubjectStat={key:string;name:string;attempts:number;answered:number;correct:number;accuracy:number;color:string};
type Recent={id:string;title:string;detail:string;score:string;href:string;tag:string;at:string};
type Period="7D"|"30D"|"90D";
const palette=["#c05a9b","#b38bd1","#65b89a","#d5a45c","#78a8c8","#c77d83"];
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
function Ring({value,color,label}:{value:number;color:string;label:string}){return <div className="si-mastery-ring" style={{"--value":value,"--ring":color} as React.CSSProperties}><div><strong>{value}%</strong><span>{label}</span></div></div>}
function formatDuration(seconds:number){const mins=Math.max(0,Math.round(seconds/60));return mins>=60?(mins/60).toFixed(1)+" HRS":mins+" MIN";}
function titleCase(value:string){return value.replace(/[_-]/g," ").replace(/\b\w/g,x=>x.toUpperCase());}
function dayKey(value:string|Date){const d=new Date(value);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}
function daysAgo(days:number){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-days);return d;}
export default function ProgressPage(){
 const [period,setPeriod]=useState<Period>("30D");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [assessments,setAssessments]=useState<Assessment[]>([]);
 const [subjectsData,setSubjectsData]=useState<Subject[]>([]);
 const [activities,setActivities]=useState<Activity[]>([]);
 const [studentName,setStudentName]=useState("");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setError("Supabase configuration is missing.");setLoading(false);return;}
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError)throw authError;
  if(!user){window.location.href="/login?next=/progress";return;}
  const [attemptResult,activityResult,subjectResult]=await Promise.all([
   supabase.from("assessment_attempts").select("id,assessment_id,answers,score,correct_count,answered_count,question_count,started_at,submitted_at").eq("student_id",user.id).order("started_at",{ascending:false}).limit(250),
   supabase.from("student_activity").select("id,activity_type,metadata,created_at").eq("student_id",user.id).order("created_at",{ascending:false}).limit(500),
   supabase.from("subjects").select("id,name_en,name_hi").order("sort_order",{ascending:true})
  ]);
  if(attemptResult.error)throw attemptResult.error;
  if(activityResult.error)throw activityResult.error;
  if(subjectResult.error)throw subjectResult.error;
  const nextAttempts=(attemptResult.data||[]) as Attempt[];
  const ids=[...new Set(nextAttempts.map(a=>a.assessment_id))];
  let nextAssessments:Assessment[]=[];
  if(ids.length){
   const {data,error}=await supabase.from("assessments").select("id,title,kind,subject_id,duration_minutes").in("id",ids);
   if(error)throw error;
   nextAssessments=(data||[]) as Assessment[];
  }
  setStudentName(String(user.user_metadata?.full_name||user.email||"Student"));
  setAttempts(nextAttempts);setAssessments(nextAssessments);setSubjectsData((subjectResult.data||[]) as Subject[]);setActivities((activityResult.data||[]) as Activity[]);setLoading(false);
 },[]);
 useEffect(()=>{void load().catch(e=>{setError(e instanceof Error?e.message:"Unable to load learning analytics.");setLoading(false);});},[load]);
 const assessmentMap=useMemo(()=>new Map(assessments.map(a=>[a.id,a])),[assessments]);
 const subjectMap=useMemo(()=>new Map(subjectsData.map(s=>[s.id,s])),[subjectsData]);
 const completed=useMemo(()=>attempts.filter(a=>a.submitted_at),[attempts]);
 const windowDays=period==="7D"?7:period==="30D"?30:90;
 const cutoff=useMemo(()=>daysAgo(windowDays-1),[windowDays]);
 const periodAttempts=useMemo(()=>completed.filter(a=>new Date(a.submitted_at||a.started_at)>=cutoff),[completed,cutoff]);
 const periodActivities=useMemo(()=>activities.filter(a=>new Date(a.created_at)>=cutoff),[activities,cutoff]);
 const metrics=useMemo(()=>{
  let correct=0,answered=0,seconds=0;
  periodAttempts.forEach(a=>{
   const count=Number(a.answered_count)||Object.keys(a.answers||{}).length;
   answered+=count;correct+=Number(a.correct_count)||0;
   if(a.submitted_at)seconds+=Math.max(0,(new Date(a.submitted_at).getTime()-new Date(a.started_at).getTime())/1000);
  });
  return {correct,answered,accuracy:answered?Math.round(correct/answered*100):0,seconds,attemptCount:periodAttempts.length};
 },[periodAttempts]);
 const allTime=useMemo(()=>({attempts:completed.length,answered:completed.reduce((sum,a)=>sum+(Number(a.answered_count)||Object.keys(a.answers||{}).length),0)}),[completed]);
 const subjectStats=useMemo<SubjectStat[]>(()=>{
  const buckets=new Map<string,{correct:number;answered:number;attempts:number;name:string}>();
  periodAttempts.forEach(attempt=>{
   const assessment=assessmentMap.get(attempt.assessment_id);
   const key=assessment?.subject_id||"unmapped";
   const subject=assessment?.subject_id?subjectMap.get(assessment.subject_id):null;
   const name=subject?.name_en||subject?.name_hi||assessment?.title||"General Studies";
   const bucket=buckets.get(key)||{correct:0,answered:0,attempts:0,name};
   bucket.correct+=Number(attempt.correct_count)||0;
   bucket.answered+=Number(attempt.answered_count)||Object.keys(attempt.answers||{}).length;
   bucket.attempts+=1;buckets.set(key,bucket);
  });
  return [...buckets.entries()].map(([key,b],i)=>({key,name:b.name,attempts:b.attempts,answered:b.answered,correct:b.correct,accuracy:b.answered?Math.round(b.correct/b.answered*100):0,color:palette[i%palette.length]})).sort((a,b)=>b.answered-a.answered).slice(0,8);
 },[periodAttempts,assessmentMap,subjectMap]);
 const activityDays=useMemo(()=>{
  const counts=new Map<string,number>();
  [...periodActivities,...periodAttempts.map(a=>({id:a.id,activity_type:"assessment_attempt",metadata:null,created_at:a.submitted_at||a.started_at}))].forEach(a=>{const key=dayKey(a.created_at);counts.set(key,(counts.get(key)||0)+1);});
  return Array.from({length:windowDays},(_,i)=>{const d=daysAgo(windowDays-1-i);const key=dayKey(d);return {date:key,count:counts.get(key)||0};});
 },[periodActivities,periodAttempts,windowDays]);
 const activeDays=useMemo(()=>activityDays.filter(d=>d.count>0).length,[activityDays]);
 const streak=useMemo(()=>{
  const dates=new Set([...activities.filter(a=>new Date(a.created_at)>=daysAgo(400)).map(a=>dayKey(a.created_at)),...completed.map(a=>dayKey(a.submitted_at||a.started_at))]);
  let n=0;const d=new Date();d.setHours(0,0,0,0);if(!dates.has(dayKey(d)))d.setDate(d.getDate()-1);
  while(dates.has(dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;
 },[activities,completed]);
 const trend=useMemo(()=>{
  const buckets=Array.from({length:period==="7D"?7:period==="30D"?6:9},(_,i)=>({label:"",answered:0,correct:0}));
  const step=period==="7D"?1:period==="30D"?5:10;
  periodAttempts.forEach(a=>{
   const date=new Date(a.submitted_at||a.started_at);const offset=Math.floor((date.getTime()-cutoff.getTime())/86400000);const index=Math.max(0,Math.min(buckets.length-1,Math.floor(offset/step)));
   buckets[index].answered+=Number(a.answered_count)||Object.keys(a.answers||{}).length;buckets[index].correct+=Number(a.correct_count)||0;
  });
  buckets.forEach((b,i)=>{b.label=period==="7D"?["S","M","T","W","T","F","S"][new Date(daysAgo(6-i)).getDay()]:String(i+1);});
  return buckets.map(b=>({...b,accuracy:b.answered?Math.round(b.correct/b.answered*100):0}));
 },[period,periodAttempts,cutoff]);
 const recent=useMemo<Recent[]>(()=>{
  const rows:Recent[]=[];
  completed.forEach(a=>{const assessment=assessmentMap.get(a.assessment_id);const answered=Number(a.answered_count)||Object.keys(a.answers||{}).length;const correct=Number(a.correct_count)||0;rows.push({id:a.id,title:assessment?.title||"Assessment",detail:answered+" questions attempted",score:answered?Math.round(correct/answered*100)+"%":"Submitted",href:assessment?.kind==="daily_drill"?"/practice/daily":assessment?.kind==="mock"?"/mock-test":"/practice/daily",tag:titleCase(assessment?.kind||"practice"),at:a.submitted_at||a.started_at});});
  activities.forEach(a=>{const meta=a.metadata||{};const title=String(meta.title||titleCase(a.activity_type));const slug=String(meta.slug||"");rows.push({id:a.id,title,detail:String(meta.detail||"Learning activity"),score:"RECORDED",href:slug?"/current-affairs/"+slug:"/library",tag:titleCase(a.activity_type),at:a.created_at});});
  return rows.sort((a,b)=>new Date(b.at).getTime()-new Date(a.at).getTime()).slice(0,6);
 },[completed,assessmentMap,activities]);
 const bestSubject=useMemo(()=>[...subjectStats].filter(s=>s.answered>=5).sort((a,b)=>b.accuracy-a.accuracy)[0]||null,[subjectStats]);
 const focusSubject=useMemo(()=>[...subjectStats].filter(s=>s.answered>=5).sort((a,b)=>a.accuracy-b.accuracy)[0]||null,[subjectStats]);
 const averageSubject=subjectStats.length?Math.round(subjectStats.reduce((sum,x)=>sum+x.accuracy,0)/subjectStats.length):0;
 const insight=focusSubject?{title:"Give "+focusSubject.name+" a focused revision cycle.",body:"Your current accuracy is "+focusSubject.accuracy+"% across "+focusSubject.answered+" answers. Revisit core concepts, then attempt a short quiz to measure improvement."}:metrics.answered?{title:"Build a reliable subject signal.",body:"Complete at least five answers in a subject to unlock a more dependable strength and revision recommendation."}:{title:"Your learning intelligence starts with one attempt.",body:"Complete a Daily Drill or Mock Test. Your actual answers, accuracy and study rhythm will appear here—no sample scores."};
 if(loading)return <main className="progress-app"><div className="progress-wrap"><p>Loading your learning intelligence…</p></div></main>;
 if(error)return <main className="progress-app"><div className="progress-wrap"><h1>Progress, <em>in motion.</em></h1><p role="alert">{error}</p><button className="progress-retry" onClick={()=>void load()}>Retry <Icon icon={Refresh01Icon}/></button></div></main>;
 return <main className="progress-app"><header className="progress-top"><Link href="/" className="progress-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>STUDENT INTELLIGENCE / ANALYTICS</span><span className="progress-status">LIVE LEARNING INSIGHTS</span></header><div className="progress-wrap">
  <section className="progress-hero"><div><span className="progress-kicker">YOUR LEARNING INTELLIGENCE / 01</span><h1>Progress, <em>in motion.</em></h1><p>{studentName?("Welcome back, "+studentName.split("@")[0]+". "):""}अपनी तैयारी की दिशा, निरंतरता और विषयवार पकड़ को वास्तविक learning data से समझें।</p><div className="progress-hero-actions"><Link href="/practice/daily">Continue learning <Icon icon={ArrowUpRight01Icon}/></Link><span>{allTime.attempts} TOTAL SUBMISSIONS · {allTime.answered} ANSWERS</span></div></div><div className="progress-hero-ring"><Ring value={averageSubject} color="#c05a9b" label="SUBJECT MASTERY"/></div></section>
  <section className="si-toolbar"><div><span className="progress-kicker">PERFORMANCE WINDOW</span><b>Measure your momentum</b></div><div className="si-period" role="group" aria-label="Analytics period">{(["7D","30D","90D"] as Period[]).map(value=><button type="button" key={value} className={period===value?"active":""} onClick={()=>setPeriod(value)}>{value}</button>)}</div></section>
  <section className="progress-kpis"><article><span><Icon icon={FireIcon}/> LEARNING STREAK</span><strong>{String(streak).padStart(2,"0")} <small>DAYS</small></strong><p>{streak?"Consecutive active days":"Start a learning streak today"}</p></article><article><span><Icon icon={Target01Icon}/> PERIOD ACCURACY</span><strong>{metrics.accuracy}<small>%</small></strong><p>{metrics.answered?("From "+metrics.answered+" answered questions"):"No scored answers in this period"}</p></article><article><span><Icon icon={Clock01Icon}/> STUDY TIME</span><strong>{formatDuration(metrics.seconds)}</strong><p>Time across submitted assessments</p></article><article><span><Icon icon={CheckmarkCircle02Icon}/> QUESTIONS SOLVED</span><strong>{metrics.answered}</strong><p>{metrics.attemptCount} submitted assessments</p></article></section>
  <section className="si-insights-grid"><article className="si-insight-card si-insight-card--focus"><span className="progress-kicker"><Icon icon={BookOpen01Icon}/> PERSONAL STUDY SIGNAL</span><h2>{insight.title}</h2><p>{insight.body}</p><Link href="/practice/daily">Practice this next <Icon icon={ArrowUpRight01Icon}/></Link></article><article className="si-insight-card"><span className="progress-kicker"><Icon icon={Activity01Icon}/> CURRENT STRENGTH</span><strong>{bestSubject?bestSubject.name:"Not enough data yet"}</strong><p>{bestSubject?bestSubject.accuracy+"% accuracy · "+bestSubject.answered+" answers":"Answer at least five questions in a subject to identify a reliable strength."}</p></article><article className="si-insight-card"><span className="progress-kicker"><Icon icon={Target01Icon}/> REVISION PRIORITY</span><strong>{focusSubject?focusSubject.name:"Signal pending"}</strong><p>{focusSubject?focusSubject.accuracy+"% accuracy · "+focusSubject.answered+" answers":"Your weakest sufficiently sampled subject will appear here."}</p></article></section>
  <section className="progress-main-grid"><div className="progress-panel progress-subject-panel"><div className="progress-heading"><div><span className="progress-kicker">MASTERY MAP</span><h2>Subject <em>strength.</em></h2></div><span>{subjectStats.length?("01 — "+String(subjectStats.length).padStart(2,"0")):"NO DATA"}</span></div>{subjectStats.length?subjectStats.map(s=><div className="progress-subject" key={s.key}><div><b>{s.name}</b><span>{s.accuracy}% <i>{s.answered} ANSWERED</i></span></div><div className="progress-bar"><i style={{width:s.accuracy+"%",background:s.color}}/></div></div>):<div className="progress-empty"><b>Your subject map is waiting.</b><p>Complete a published Daily Drill or Mock Test to see accuracy by subject here.</p><Link href="/practice/daily">Open Daily Drill <Icon icon={ArrowUpRight01Icon}/></Link></div>}</div>
   <div className="progress-panel progress-activity-panel"><div className="progress-heading"><div><span className="progress-kicker">CONSISTENCY TRACKER</span><h2>Study <em>activity.</em></h2></div><span>{period}</span></div><div className="progress-heatmap">{activityDays.map(d=><i key={d.date} data-level={d.count===0?0:d.count===1?1:d.count<=3?2:d.count<=5?3:4} title={d.date+": "+d.count+" activities"}/>)}</div><div className="progress-legend"><span>LESS</span>{[1,2,3,4].map(v=><i key={v} data-level={v}/>)}<span>MORE</span></div><div className="progress-activity-foot"><span><Icon icon={Calendar01Icon}/> LAST {activityDays.length} DAYS</span><b>{activeDays} ACTIVE DAYS</b></div></div></section>
  <section className="progress-panel si-trend-panel"><div className="progress-heading"><div><span className="progress-kicker">ACCURACY MOMENTUM</span><h2>Performance <em>trend.</em></h2></div><span>{period} VIEW</span></div><div className="si-trend-chart">{trend.map((point,index)=><div className="si-trend-column" key={index}><div className="si-trend-bar-track"><i style={{height:point.answered?Math.max(5,point.accuracy)+"%":"2%"}} title={point.answered?point.accuracy+"% accuracy":"No attempts"}/></div><b>{point.answered?point.accuracy+"%":"—"}</b><small>{point.label}</small></div>)}</div><p className="si-chart-note">Accuracy is calculated from submitted attempts in the selected period. Empty intervals are shown without an assumed score.</p></section>
  <section className="progress-lower"><div className="progress-panel progress-recent"><div className="progress-heading"><div><span className="progress-kicker">KEEP THE MOMENTUM</span><h2>Recent <em>activity.</em></h2></div><span>{recent.length} RECORDS</span></div>{recent.length?recent.map(r=><Link href={r.href} className="progress-recent-row" key={r.id}><span className="progress-recent-icon"><Icon icon={r.tag.toLowerCase().includes("drill")?BookOpen01Icon:r.tag.toLowerCase().includes("mock")?Target01Icon:Activity01Icon}/></span><span><small>{r.tag}</small><b>{r.title}</b><em>{r.detail}</em></span><strong>{r.score}</strong><Icon icon={ArrowUpRight01Icon}/></Link>):<div className="progress-empty"><b>Your learning timeline starts here.</b><p>Practice attempts and recorded learning activities will appear here automatically.</p><Link href="/practice/daily">Start a Daily Drill <Icon icon={ArrowUpRight01Icon}/></Link></div>}</div><div className="progress-panel progress-insight"><span className="progress-kicker">YOUR LEARNING PULSE</span><div className="progress-insight-icon"><Icon icon={Activity01Icon} size={28}/></div><h2>{activeDays} active days in {period}.</h2><p>{metrics.attemptCount} submitted assessments and {metrics.answered} answered questions in this window. Consistency and accuracy are tracked separately.</p><Link href="/practice/daily">Continue preparation <Icon icon={ArrowUpRight01Icon}/></Link></div></section>
  <footer className="progress-footer">GYANKUNJ · CIVILPREP <span>MEASURE · REFLECT · IMPROVE</span></footer>
 </div></main>;
}

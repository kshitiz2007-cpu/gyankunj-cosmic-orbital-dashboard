"use client";
import "./glimpses.css";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,NewspaperIcon,Target01Icon,PenTool01Icon,Calendar01Icon,Refresh01Icon} from "@hugeicons/core-free-icons";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";

type Editorial={id:string;slug:string;category:string;title_hi:string;title_en:string;summary_hi:string;summary_en:string;mains_question:string|null;read_minutes:number;published_at:string|null;created_at:string};
type Assessment={id:string;title:string;duration_minutes:number;created_at:string;published_at:string|null;subject_id:string|null};
type Question={id:string;question_hi:string;question_en:string;topic:string|null};
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
function indiaDayBounds(){const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());const get=(t:string)=>parts.find(p=>p.type===t)?.value||"";const key=get("year")+"-"+get("month")+"-"+get("day");const start=new Date(key+"T00:00:00+05:30");return {key,start:start.toISOString(),end:new Date(start.getTime()+86400000).toISOString()};}
function isTodayIndia(value:string|null|undefined,key:string){if(!value)return false;return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(value))===key;}
export default function TodaysGlimpsesPage(){
 const router=useRouter();
 const [loading,setLoading]=useState(true),[error,setError]=useState("");
 const [editorial,setEditorial]=useState<Editorial|null>(null);
 const [assessment,setAssessment]=useState<Assessment|null>(null);
 const [questions,setQuestions]=useState<Question[]>([]);
 const [dateLabel,setDateLabel]=useState("");
 const [todayKey,setTodayKey]=useState("");
 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){setError("Learning services are unavailable.");setLoading(false);return;}
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError)throw authError;
   if(!user){router.replace("/login");return;}
   const {key,start,end}=indiaDayBounds();
   const label=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
   const [editorialResult,assessmentResult]=await Promise.all([
    supabase.from("editorial_articles").select("id,slug,category,title_hi,title_en,summary_hi,summary_en,mains_question,read_minutes,published_at,created_at").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false}).limit(50),
    supabase.from("assessments").select("id,title,duration_minutes,created_at,published_at,subject_id").eq("kind","daily_drill").eq("is_published",true).order("created_at",{ascending:false}).limit(30)
   ]);
   if(editorialResult.error)throw editorialResult.error;
   if(assessmentResult.error)throw assessmentResult.error;
   const todaysDrill=((assessmentResult.data||[]) as Assessment[]).find(row=>isTodayIndia(row.published_at||row.created_at,key))||null;
   const todaysEditorial=(editorialResult.data||[]).find(row=>isTodayIndia(row.published_at||row.created_at,key)) as Editorial|undefined;
   let nextQuestions:Question[]=[];
   if(todaysDrill){
    const {data,error:qError}=await supabase.from("questions").select("id,question_hi,question_en,topic").eq("assessment_id",todaysDrill.id).order("created_at",{ascending:true});
    if(qError)throw qError;
    nextQuestions=(data||[]) as Question[];
   }
   if(!active)return;
   setTodayKey(key);setDateLabel(label);setEditorial(todaysEditorial||null);setAssessment(nextQuestions.length>0?todaysDrill:null);setQuestions(nextQuestions);setLoading(false);
  };
  void load().catch(e=>{if(active){setError(e instanceof Error?e.message:"Unable to load today's published content.");setLoading(false);}});
  return()=>{active=false;};
 },[router]);
 const mains=editorial?.mains_question?.trim()||"";
 const sections=useMemo(()=>[
  {id:"editorial",label:"DAILY EDITORIAL",available:Boolean(editorial)},
  {id:"drill",label:"DAILY DRILL",available:Boolean(assessment)},
  {id:"mains",label:"MAINS PRACTICE",available:Boolean(mains)}
 ],[editorial,assessment,mains]);
 return <main className="glimpses-app">
  <header className="glimpses-top"><Link href="/" className="glimpses-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>STUDENT SPACE / TODAY&apos;S GLIMPSES</span><span className="glimpses-live"><i/> TODAY ONLY</span></header>
  <div className="glimpses-wrap">
   <section className="glimpses-hero"><div><span className="glimpses-kicker">YOUR DAILY UPSC BRIEF / 01</span><h1>Today&apos;s <em>glimpses.</em></h1><p>एक ही जगह आज का प्रकाशित Editorial, Daily Drill और Mains प्रश्न। केवल आज के लिए प्रकाशित सामग्री—पुराने दिनों की नहीं।</p><div className="glimpses-date"><Icon icon={Calendar01Icon}/><span>{dateLabel||"TODAY'S EDITION"}</span><b>·</b><span>INDIA / IST</span></div></div><div className="glimpses-orbit"><span>GK</span><i/><b/><small>DAILY<br/>RECALL</small></div></section>
   <nav className="glimpses-jump" aria-label="Today's content">{sections.map((s,i)=><a key={s.id} href={"#"+s.id} className={s.available?"available":""}><small>0{i+1}</small><span>{s.label}</span><b>{s.available?"↗":"—"}</b></a>)}</nav>
   {loading&&<div className="glimpses-state">Gathering today&apos;s published learning content…</div>}
   {error&&<div className="glimpses-state glimpses-error" role="alert">{error}<button onClick={()=>window.location.reload()}><Icon icon={Refresh01Icon}/> Retry</button></div>}
   {!loading&&!error&&<>
    <section className="glimpse-card glimpse-editorial" id="editorial"><div className="glimpse-card-head"><span><Icon icon={NewspaperIcon}/> 01 / READ</span><b>{editorial?"PUBLISHED TODAY":"NO EDITION TODAY"}</b></div>{editorial?<><span className="glimpse-category">{editorial.category}</span><h2>{editorial.title_hi||editorial.title_en}</h2><p>{editorial.summary_hi||editorial.summary_en}</p><div className="glimpse-card-foot"><span><Icon icon={Clock01Icon}/> {editorial.read_minutes} MIN READ</span><Link href={"/current-affairs/"+editorial.slug}>Read full editorial <Icon icon={ArrowUpRight01Icon}/></Link></div></>:<div className="glimpse-empty"><strong>आज का Editorial अभी प्रकाशित नहीं हुआ है।</strong><p>प्रकाशित होते ही इसी सेक्शन में दिखाई देगा। पुराने Editorial यहाँ नहीं दिखाए जाएँगे।</p></div>}</section>
    <section className="glimpse-card glimpse-drill" id="drill"><div className="glimpse-card-head"><span><Icon icon={Target01Icon}/> 02 / TEST YOURSELF</span><b>{assessment?"PUBLISHED TODAY":"NO DRILL TODAY"}</b></div>{assessment?<><div className="glimpse-drill-title"><div><span className="glimpse-category">DAILY PRACTICE / MCQ</span><h2>{assessment.title}</h2><p>{questions.length} questions · {assessment.duration_minutes} minutes</p></div><div className="glimpse-drill-mark">Q<span>{String(questions.length).padStart(2,"0")}</span></div></div><ol className="glimpse-question-list">{questions.slice(0,3).map((q,i)=><li key={q.id}><small>QUESTION 0{i+1} {q.topic?"· "+q.topic:""}</small><p>{q.question_hi||q.question_en}</p></li>)}</ol><div className="glimpse-card-foot"><span>ANSWERS HIDDEN UNTIL SUBMISSION</span><Link href={"/practice/daily?assessment="+assessment.id}>Start today&apos;s drill <Icon icon={ArrowUpRight01Icon}/></Link></div></>:<div className="glimpse-empty"><strong>आज का Daily Drill अभी प्रकाशित नहीं हुआ है।</strong><p>केवल आज publish किया गया quiz यहाँ दिखाई देगा।</p></div>}</section>
    <section className="glimpse-card glimpse-mains" id="mains"><div className="glimpse-card-head"><span><Icon icon={PenTool01Icon}/> 03 / WRITE & REFLECT</span><b>{mains?"TODAY'S MAINS PROMPT":"NO MAINS PROMPT"}</b></div>{mains?<><span className="glimpse-category">UPSC MAINS / ANSWER WRITING</span><h2>{mains}</h2><p>प्रश्न के सभी आयामों को संबोधित करते हुए संरचित उत्तर लिखें। भूमिका, मुख्य भाग, उदाहरण और संतुलित निष्कर्ष शामिल करें।</p><div className="glimpse-card-foot"><span>ANSWER WRITING PRACTICE</span><Link href={editorial?"/current-affairs/"+editorial.slug:"/current-affairs"}>Open editorial context <Icon icon={ArrowUpRight01Icon}/></Link></div></>:<div className="glimpse-empty"><strong>आज के Editorial के साथ Mains प्रश्न उपलब्ध नहीं है।</strong><p>Admin द्वारा आज के प्रकाशित Editorial में Mains प्रश्न जोड़ने पर वह यहाँ दिखेगा।</p></div>}</section>
   </>}
   <footer className="glimpses-footer">GYANKUNJ · CIVILPREP <span>{todayKey||"DAILY EDITION"} · READ / PRACTISE / WRITE</span></footer>
  </div>
 </main>;
}

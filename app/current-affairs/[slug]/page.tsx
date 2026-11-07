"use client";
import Link from "next/link";
import {useParams,useRouter} from "next/navigation";
import {useEffect,useState} from "react";
import {AnimatePresence,motion,useReducedMotion} from "motion/react";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,Bookmark01Icon,CheckmarkCircle02Icon} from "@hugeicons/core-free-icons";

type EditorialRecord={id:string;slug:string;category:string;title_en:string;title_hi:string;summary_en:string;summary_hi:string;content_en:string;content_hi:string;mains_question:string|null;read_minutes:number;published_at:string|null;created_at:string};

function EditorialContent({content}:{content:string}) {
 const lines=content.replace(/\r/g,"").split("\n");
 const blocks: {type:"paragraph"|"heading"|"bullet"|"numbered";text:string;level?:number}[]=[];
 let paragraph:string[]=[];
 const flush=()=>{if(paragraph.length){blocks.push({type:"paragraph",text:paragraph.join(" ").trim()});paragraph=[];}};
 for(const raw of lines){
  const line=raw.trim();
  if(!line){flush();continue;}
  const heading=line.match(/^(#{1,4})\s+(.+)$/);
  if(heading){flush();blocks.push({type:"heading",text:heading[2],level:heading[1].length});continue;}
  const bullet=line.match(/^(?:[-*•]|\u2022)\s+(.+)$/);
  if(bullet){flush();blocks.push({type:"bullet",text:bullet[1]});continue;}
  const numbered=line.match(/^\d+[.)]\s+(.+)$/);
  if(numbered){flush();blocks.push({type:"numbered",text:numbered[1]});continue;}
  paragraph.push(line);
 }
 flush();
 return <div className="editorial-content-flow">{blocks.map((block,index)=>{
  if(block.type==="heading"){
   const Heading=block.level===1?"h2":block.level===2?"h3":"h4";
   return <Heading className={"editorial-content-heading editorial-content-heading--"+block.level} key={index}><span>{String(index+1).padStart(2,"0")}</span>{block.text}</Heading>;
  }
  if(block.type==="bullet"||block.type==="numbered")return <div className={"editorial-content-point editorial-content-point--"+block.type} key={index}><i>{block.type==="bullet"?"✳":"↗"}</i><p>{block.text}</p></div>;
  return <p className="editorial-content-paragraph" key={index}>{block.text}</p>;
 })}</div>;
}

export default function EditorialDetail(){
 const [saved,setSaved]=useState(false),[readingProgress,setReadingProgress]=useState(0),[readingComplete,setReadingComplete]=useState(false),[article,setArticle]=useState<EditorialRecord|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const params=useParams<{slug:string}>(),router=useRouter();
 const reducedMotion=useReducedMotion();
 useEffect(()=>{const update=()=>{const articleEl=document.querySelector(".editorial-article");if(!articleEl)return;const rect=articleEl.getBoundingClientRect();const distance=Math.max(1,articleEl.clientHeight-window.innerHeight);const progress=Math.max(0,Math.min(100,Math.round(-rect.top/distance*100)));setReadingProgress(progress);if(progress>=98)setReadingComplete(true);};window.addEventListener("scroll",update,{passive:true});window.addEventListener("resize",update);update();return()=>{window.removeEventListener("scroll",update);window.removeEventListener("resize",update);};},[article]);
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setError("Editorial service is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const {data,error}=await supabase.from("editorial_articles").select("*").eq("slug",params.slug).eq("is_published",true).maybeSingle();if(!active)return;if(error){setError(error.message);setLoading(false);return;}setArticle(data as EditorialRecord|null);setLoading(false);};void load();return()=>{active=false;};},[params.slug,router]);
 if(loading)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><p>Loading published editorial…</p></main>;
 if(error||!article)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><h1>{error?"Unable to load editorial":"Editorial not found"}</h1><p>{error||"This editorial may be unpublished or no longer available."}</p></main>;
 const dateLabel=new Date(article.published_at||article.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
 return <main className="editorial-detail-app editorial-reader-redesign">
  <div className="er-progress" role="progressbar" aria-label="Editorial reading progress" aria-valuenow={readingProgress} aria-valuemin={0} aria-valuemax={100}><motion.i animate={{width:readingProgress+"%"}} transition={reducedMotion?{duration:0}:{duration:.25}}/></div>
  <header className="er-masthead"><Link href="/current-affairs" className="er-back"><HugeiconsIcon icon={ArrowLeft01Icon}/> <span>EDITORIAL JOURNAL</span></Link><Link href="/" className="er-brand"><b>G</b> GYANKUNJ <small>DAILY BRIEF</small></Link><button className={saved?"is-saved":""} onClick={()=>setSaved(v=>!v)}><HugeiconsIcon icon={saved?CheckmarkCircle02Icon:Bookmark01Icon}/>{saved?"SAVED":"SAVE"}</button></header>
  <div className="er-wrap">
   <section className="er-article-hero">
    <div className="er-issue"><span>THE DAILY EDITORIAL</span><i/ ><span>{dateLabel}</span></div>
    <div className="er-category">{article.category}</div>
    <h1>{article.title_hi||article.title_en}</h1>
    <p className="er-deck">{article.summary_hi||article.summary_en}</p>
    <div className="er-meta"><span><HugeiconsIcon icon={Clock01Icon}/>{String(article.read_minutes).padStart(2,"0")} MIN READ</span><span>UPSC · STATE PCS</span><span>EDITORIAL / 01</span></div>
    <div className="er-hero-orbit" aria-hidden="true"><b>GK</b><span>READ WITH PURPOSE</span></div>
   </section>
   <div className="er-reading-grid">
    <aside className="er-reading-aside"><div className="er-progress-card"><span>YOUR READING</span><b>{readingProgress}<small>%</small></b><div><i style={{width:readingProgress+"%"}}/></div><small>READ · REFLECT · RECALL</small></div><div className="er-aside-note"><span>THE BIG IDEA</span><p>समाचार को संदर्भ से जोड़ें और विचार को उत्तर में बदलें।</p></div></aside>
    <article className="er-content-column">
     <section className="er-context-card"><span>01 / THE BIG PICTURE</span><p>{article.summary_hi||article.summary_en}</p></section>
     <div className="er-content-body"><EditorialContent content={article.content_hi||article.content_en}/></div>
     {article.content_hi&&article.content_en&&article.content_hi!==article.content_en&&<details className="er-english"><summary>Read the English version <b>＋</b></summary><EditorialContent content={article.content_en}/></details>}
     {article.mains_question&&<section className="er-mains-card"><div><span>02 / MAINS ANSWER PRACTICE</span><b>GS</b></div><h2>अब विचार को उत्तर में बदलें।</h2><p>{article.mains_question}</p><footer><span>150 WORDS</span><span>ANALYTICAL APPROACH</span></footer></section>}
     <AnimatePresence>{readingComplete&&<motion.div className="er-complete" initial={reducedMotion?false:{opacity:0,y:16}} animate={{opacity:1,y:0}} role="status"><b>✦</b><div><strong>Reading complete.</strong><p>आज के विचार को अभ्यास में बदलें।</p></div></motion.div>}</AnimatePresence>
     <div className="er-next"><Link href="/current-affairs"><HugeiconsIcon icon={ArrowLeft01Icon}/> सभी Editorials</Link><Link href="/practice/daily">आज का Daily Drill <HugeiconsIcon icon={ArrowUpRight01Icon}/></Link></div>
    </article>
   </div>
   <footer className="er-footer"><span>GYANKUNJ · CIVILPREP</span><span>READ DEEPER. THINK CLEARER.</span></footer>
  </div>
 </main>;
}

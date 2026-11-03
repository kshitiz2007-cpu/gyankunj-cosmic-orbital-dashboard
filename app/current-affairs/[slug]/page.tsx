"use client";
import Link from "next/link";
import {useParams,useRouter} from "next/navigation";
import {useEffect,useState} from "react";
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
 const [saved,setSaved]=useState(false),[article,setArticle]=useState<EditorialRecord|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const params=useParams<{slug:string}>(),router=useRouter();
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setError("Editorial service is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const {data,error}=await supabase.from("editorial_articles").select("*").eq("slug",params.slug).eq("is_published",true).maybeSingle();if(!active)return;if(error){setError(error.message);setLoading(false);return;}setArticle(data as EditorialRecord|null);setLoading(false);};void load();return()=>{active=false;};},[params.slug,router]);
 if(loading)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><p>Loading published editorial…</p></main>;
 if(error||!article)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><h1>{error?"Unable to load editorial":"Editorial not found"}</h1><p>{error||"This editorial may be unpublished or no longer available."}</p></main>;
 const dateLabel=new Date(article.published_at||article.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});
 return <main className="editorial-detail-app editorial-detail-app--premium">
  <header className="editorial-top editorial-top--premium"><Link href="/current-affairs" className="editorial-back"><HugeiconsIcon icon={ArrowLeft01Icon}/> ALL EDITORIALS</Link><span className="editorial-top-brand">GYANKUNJ <i>/</i> DAILY BRIEF</span><button className={"editorial-save "+(saved?"saved":"")} onClick={()=>setSaved(v=>!v)}><HugeiconsIcon icon={saved?CheckmarkCircle02Icon:Bookmark01Icon}/>{saved?"SAVED":"SAVE ARTICLE"}</button></header>
  <article className="editorial-article editorial-article--premium">
   <div className="editorial-article-head editorial-article-head--premium">
    <div className="editorial-issue-line"><span>THE DAILY EDITORIAL</span><i/ ><span>{dateLabel}</span></div>
    <span className="editorial-kicker editorial-kicker--premium">{article.category}</span>
    <h1>{article.title_hi||article.title_en}</h1>
    <p className="editorial-deck">{article.summary_hi||article.summary_en}</p>
    <div className="editorial-article-meta editorial-article-meta--premium"><span><HugeiconsIcon icon={Clock01Icon}/> {String(article.read_minutes).padStart(2,"0")} MIN READ</span><span>UPSC · STATE PCS</span><span>EDITORIAL / 01</span></div>
    <div className="editorial-cover-mark" aria-hidden="true"><b>GK</b><span>READ<br/>WITH<br/>PURPOSE</span></div>
   </div>
   <div className="editorial-reading-layout">
    <aside className="editorial-reading-rail"><span>IN THIS BRIEF</span><b>01</b><i/><small>READ<br/>ANALYSE<br/>RECALL</small></aside>
    <div className="editorial-article-body editorial-article-body--premium">
     <div className="editorial-body-intro"><span>THE BIG PICTURE</span><p>{article.summary_hi||article.summary_en}</p></div>
     <EditorialContent content={article.content_hi||article.content_en}/>
     {article.content_hi&&article.content_en&&article.content_hi!==article.content_en&&<details className="editorial-english-version"><summary>Read English version <span>＋</span></summary><div className="editorial-english-copy"><EditorialContent content={article.content_en}/></div></details>}
     {article.mains_question&&<section className="editorial-mains editorial-mains--premium"><span className="editorial-kicker">MAINS ANSWER PRACTICE</span><h2>अब विचार को उत्तर में बदलें।</h2><p>{article.mains_question}</p><div><span>150 WORDS</span><span>ANALYTICAL APPROACH</span></div></section>}
     <div className="editorial-next editorial-next--premium"><Link href="/current-affairs"><HugeiconsIcon icon={ArrowLeft01Icon}/> ALL EDITORIALS</Link><Link href="/practice/daily">PRACTICE TODAY&apos;S DRILL <HugeiconsIcon icon={ArrowUpRight01Icon}/></Link></div>
    </div>
   </div>
  </article>
  <footer className="editorial-detail-footer">GYANKUNJ · CIVILPREP <span>READ DEEPER. THINK CLEARER.</span></footer>
 </main>;
}

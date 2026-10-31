"use client";
import Link from "next/link";
import {useParams} from "next/navigation";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,Bookmark01Icon,CheckmarkCircle02Icon} from "@hugeicons/core-free-icons";
type EditorialRecord={id:string;slug:string;category:string;title_en:string;title_hi:string;summary_en:string;summary_hi:string;content_en:string;content_hi:string;mains_question:string|null;read_minutes:number;published_at:string|null;created_at:string};
export default function EditorialDetail(){
 const [saved,setSaved]=useState(false),[article,setArticle]=useState<EditorialRecord|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const params=useParams<{slug:string}>(),router=useRouter();
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setError("Editorial service is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const {data,error}=await supabase.from("editorial_articles").select("*").eq("slug",params.slug).eq("is_published",true).maybeSingle();if(!active)return;if(error){setError(error.message);setLoading(false);return;}setArticle(data as EditorialRecord|null);setLoading(false);};void load();return()=>{active=false;};},[params.slug,router]);
 if(loading)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><p>Loading published editorial…</p></main>;
 if(error||!article)return <main className="editorial-detail-app"><Link href="/current-affairs">← Back to editorials</Link><h1>{error?"Unable to load editorial":"Editorial not found"}</h1><p>{error||"This editorial may be unpublished or no longer available."}</p></main>;
 return <main className="editorial-detail-app">
  <header className="editorial-top"><Link href="/current-affairs" className="editorial-back"><HugeiconsIcon icon={ArrowLeft01Icon}/> ALL EDITORIALS</Link><span>GYANKUNJ / DAILY BRIEF</span><button className={"editorial-save "+(saved?"saved":"")} onClick={()=>setSaved(v=>!v)}><HugeiconsIcon icon={Bookmark01Icon}/>{saved?"SAVED":"SAVE ARTICLE"}</button></header>
  <article className="editorial-article">
   <div className="editorial-article-head"><span className="editorial-kicker">{article.category} · {new Date(article.published_at||article.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><h1>{article.title_hi||article.title_en}</h1><p className="editorial-deck">{article.summary_hi||article.summary_en}</p><div className="editorial-article-meta"><span><HugeiconsIcon icon={Clock01Icon}/> {String(article.read_minutes).padStart(2,"0")} MIN READ</span><span>UPSC / STATE PCS</span></div></div>
   <div className="editorial-article-body"><p className="editorial-lead" style={{whiteSpace:"pre-wrap"}}>{article.content_hi||article.content_en}</p>{article.content_hi&&article.content_en&&article.content_hi!==article.content_en&&<details><summary>Read English version</summary><p style={{whiteSpace:"pre-wrap"}}>{article.content_en}</p></details>}
    {article.mains_question&&<section className="editorial-mains"><span className="editorial-kicker">MAINS ANSWER PRACTICE</span><h2>Think like an examiner.</h2><p>{article.mains_question}</p><span>150 WORDS · ANALYTICAL APPROACH</span></section>}
    <div className="editorial-next"><Link href="/current-affairs">← Back to Daily Editorials</Link><Link href="/practice/daily">Practice today&apos;s drill <HugeiconsIcon icon={ArrowUpRight01Icon}/></Link></div>
   </div>
  </article>
 </main>;
}

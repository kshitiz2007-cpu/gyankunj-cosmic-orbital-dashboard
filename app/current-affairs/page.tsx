"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,Search01Icon,NewspaperIcon} from "@hugeicons/core-free-icons";
type EditorialCard={id:string;slug:string;category:string;title_en:string;title_hi:string;summary_en:string;summary_hi:string;read_minutes:number;published_at:string|null;created_at:string};
const categories=["ALL","SCIENCE & TECHNOLOGY","POLITY & GOVERNANCE","ENVIRONMENT","ECONOMY"];
function Icon({icon,size=18}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function CurrentAffairsPage(){
 const router=useRouter();
 const [category,setCategory]=useState("ALL"),[search,setSearch]=useState("");
 const [articles,setArticles]=useState<EditorialCard[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setLoadError("Editorial service is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const {data,error}=await supabase.from("editorial_articles").select("id,slug,category,title_en,title_hi,summary_en,summary_hi,read_minutes,published_at,created_at").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false});if(!active)return;if(error){setLoadError(error.message);setLoading(false);return;}setArticles((data||[]) as EditorialCard[]);setLoading(false);};void load();return()=>{active=false;};},[router]);
 const filtered=useMemo(()=>articles.filter(a=>(category==="ALL"||a.category===category)&&(a.title_en+a.title_hi+a.summary_en+a.summary_hi+a.category).toLowerCase().includes(search.toLowerCase())),[articles,category,search]);
 const featured=filtered[0]||articles[0];
 return <main className="editorial-app">
  <header className="editorial-top"><Link href="/" className="editorial-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>KNOWLEDGE / DAILY EDITORIAL</span><span className="editorial-date">LIVE EDITORIALS</span></header>
  <div className="editorial-wrap">
   <section className="editorial-hero">
    <div className="editorial-hero-copy"><span className="editorial-kicker"><i/> THE DAILY BRIEF / 01</span><h1>Read beyond<br/>the <em>headlines.</em></h1><p>समसामयिक घटनाओं को संदर्भ, विश्लेषण और परीक्षा-दृष्टि के साथ समझें। हर दिन एक विषय, गहरी तैयारी के लिए।</p>
     <div className="editorial-hero-meta"><span><Icon icon={Clock01Icon}/> 08 MIN READ</span><span>UPSC · STATE PCS · SSC</span></div>
     {featured?<Link href={"/current-affairs/"+featured.slug} className="editorial-cta">Read latest editorial <Icon icon={ArrowUpRight01Icon}/></Link>:<span className="editorial-cta">New editorials will appear here</span>}
    </div>
    <div className="editorial-visual"><div className="editorial-visual-orbit"/><div className="editorial-chip"><span>INDIA</span><strong>01</strong><small>TECHNOLOGY<br/>SOVEREIGNTY</small></div><div className="editorial-visual-index">GK / 2026</div></div>
   </section>
   {featured&&<section className="editorial-featured">
    <div className="editorial-featured-art"><span>FEATURED ANALYSIS</span><div className="editorial-chip-mini">GK</div><small>DAILY EDITORIAL<br/>EXAM PERSPECTIVE</small></div>
    <div className="editorial-featured-copy"><span className="editorial-kicker">LATEST EDITORIAL · {new Date(featured.published_at||featured.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><h2>{featured.title_hi||featured.title_en}</h2><p>{featured.summary_hi||featured.summary_en}</p><div className="editorial-card-foot"><span>{featured.category} · {String(featured.read_minutes).padStart(2,"0")} MIN READ</span><Link href={"/current-affairs/"+featured.slug}>Explore analysis <Icon icon={ArrowUpRight01Icon}/></Link></div></div>
   </section>}
    <div className="editorial-section-heading"><div><span className="editorial-kicker">BUILD YOUR CONTEXT</span><h2>Daily <em>Dispatches.</em></h2></div><span>{filtered.length.toString().padStart(2,"0")} ARTICLES</span></div>
    <label className="editorial-search"><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search editorials, topics, themes..."/></label>
    <div className="editorial-filters">{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="editorial-list">{filtered.map((a,i)=><motion.article key={a.slug} initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="editorial-list-card">
      <div className="editorial-list-number">0{i+1}</div><div className="editorial-list-copy"><span>{a.category} · {new Date(a.published_at||a.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</span><h3>{a.title_hi||a.title_en}</h3><p>{a.summary_hi||a.summary_en}</p><small>{a.read_minutes} MIN READ · DAILY EDITORIAL</small></div><Link href={"/current-affairs/"+a.slug} aria-label={"Read "+a.title}><Icon icon={ArrowUpRight01Icon}/></Link>
     </motion.article>)}{loading&&<div className="editorial-empty">Loading published editorials…</div>}{loadError&&<div className="editorial-empty">{loadError}. Please try again later.</div>}{!loading&&!loadError&&filtered.length===0&&<div className="editorial-empty">{articles.length===0?"No editorials published yet. Please check back soon.":"No editorials match this search. Try another topic or category."}</div>}</div>
   </section>
   <footer className="editorial-footer">GYANKUNJ · CIVILPREP <span>READ · CONNECT · RECALL</span></footer>
  </div>
 </main>;
}

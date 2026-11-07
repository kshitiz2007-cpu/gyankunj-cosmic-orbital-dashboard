"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Clock01Icon,Search01Icon,NewspaperIcon} from "@hugeicons/core-free-icons";
type EditorialCard={id:string;slug:string;category:string;title_en:string;title_hi:string;summary_en:string;summary_hi:string;read_minutes:number;published_at:string|null;created_at:string};
const categories=["ALL","POLITY & GOVERNANCE","ECONOMY","SCIENCE & TECHNOLOGY","ENVIRONMENT","INTERNATIONAL RELATIONS","DEFENCE & INTERNAL SECURITY","HISTORY & CULTURE","GEOGRAPHY","SOCIAL SECTOR"];
function Icon({icon,size=18}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function CurrentAffairsPage(){
 const router=useRouter();
 const [category,setCategory]=useState("ALL"),[search,setSearch]=useState("");
 const [articles,setArticles]=useState<EditorialCard[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setLoadError("Editorial service is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const {data,error}=await supabase.from("editorial_articles").select("id,slug,category,title_en,title_hi,summary_en,summary_hi,read_minutes,published_at,created_at").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false});if(!active)return;if(error){setLoadError(error.message);setLoading(false);return;}setArticles((data||[]) as EditorialCard[]);setLoading(false);};void load();return()=>{active=false;};},[router]);
 const filtered=useMemo(()=>articles.filter(a=>(category==="ALL"||a.category===category)&&(a.title_en+a.title_hi+a.summary_en+a.summary_hi+a.category).toLowerCase().includes(search.toLowerCase())),[articles,category,search]);
 const featured=filtered[0]||articles[0];
 return <main className="editorial-app editorial-redesign">
  <header className="ed-masthead">
   <Link href="/" className="ed-wordmark"><span className="ed-mark">G</span><span>GYANKUNJ<small>ACADEMY · CIVILPREP</small></span></Link>
   <div className="ed-masthead-center"><span>THE KNOWLEDGE JOURNAL</span><i/> <span>VOL. 2026</span></div>
   <Link href="/todays-glimpses" className="ed-masthead-link">TODAY&apos;S GLIMPSES <Icon icon={ArrowUpRight01Icon}/></Link>
  </header>
  <div className="ed-page-wrap">
   <section className="ed-opening">
    <div className="ed-opening-copy">
     <span className="ed-overline"><i/> DAILY INTELLIGENCE / 01</span>
     <h1>Read the world.<br/><em>Understand</em> India.</h1>
     <p>समाचार से आगे बढ़कर घटनाओं का संदर्भ, संवैधानिक आधार और परीक्षा-दृष्टि समझें। हर दिन एक विचार, बेहतर विश्लेषण के लिए।</p>
     <div className="ed-opening-actions">{featured?<Link href={"/current-affairs/"+featured.slug} className="ed-primary-action">आज का विश्लेषण पढ़ें <Icon icon={ArrowUpRight01Icon}/></Link>:<span className="ed-primary-action">नए विश्लेषण शीघ्र उपलब्ध होंगे</span>}<span className="ed-reading-note"><Icon icon={Clock01Icon}/> 8 MIN · DAILY BRIEF</span></div>
     <div className="ed-opening-index"><b>01</b><span>CONTEXT</span><i/><b>02</b><span>ANALYSIS</span><i/><b>03</b><span>RECALL</span></div>
    </div>
    <div className="ed-cover-stage" aria-label="Gyankunj daily editorial visual">
     <div className="ed-cover-orbit ed-cover-orbit-a"/><div className="ed-cover-orbit ed-cover-orbit-b"/>
     <div className="ed-cover-glow"/>
     <div className="ed-cover-sheet"><span>GYANKUNJ / EDITION 01</span><b>THE<br/>DAILY<br/><em>BRIEF.</em></b><i>READ · REFLECT · RECALL</i><small>UPSC / CIVIL SERVICES</small></div>
     <span className="ed-cover-stamp">GK<br/>2026</span>
     <span className="ed-cover-caption">A CLEARER VIEW OF WHAT MATTERS</span>
    </div>
   </section>
   <section className="ed-editor-note">
    <span className="ed-note-mark">✳</span><div><small>THE EDITOR&apos;S NOTE</small><p>तथ्यों को संदर्भ से जोड़ें, नीतियों को संविधान से और वर्तमान घटनाओं को अपने उत्तरों से।</p></div><span className="ed-note-side">THINK<br/>BEYOND<br/>THE NEWS</span>
   </section>
   {featured&&<section className="ed-feature-section">
    <div className="ed-section-top"><div><span className="ed-overline">EDITOR&apos;S PICK / 01</span><h2>Today&apos;s <em>deep dive.</em></h2></div><span className="ed-section-index">FEATURED ANALYSIS</span></div>
    <Link href={"/current-affairs/"+featured.slug} className="ed-feature-card">
     <div className="ed-feature-art"><span className="ed-art-top">GYANKUNJ JOURNAL <b>№ 01</b></span><div className="ed-art-emblem"><span>GK</span><i/></div><span className="ed-art-bottom">CURRENT AFFAIRS<br/>ANALYSED FOR ASPIRANTS</span></div>
     <div className="ed-feature-copy"><div className="ed-feature-meta"><span>{featured.category}</span><i/><span>{new Date(featured.published_at||featured.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</span></div><h3>{featured.title_hi||featured.title_en}</h3><p>{featured.summary_hi||featured.summary_en}</p><div className="ed-feature-foot"><span><Icon icon={Clock01Icon}/> {featured.read_minutes} MIN READ</span><b>पूरा विश्लेषण पढ़ें <Icon icon={ArrowUpRight01Icon}/></b></div></div>
    </Link>
   </section>}
   <section className="ed-dispatch-section">
    <div className="ed-section-top"><div><span className="ed-overline">THE DAILY ARCHIVE</span><h2>Ideas in <em>focus.</em></h2><p>चुने हुए विषय, एक व्यवस्थित परीक्षा-दृष्टि के साथ।</p></div><span className="ed-section-index">{filtered.length.toString().padStart(2,"0")} DISPATCHES</span></div>
    <div className="ed-tools-row"><label className="ed-search"><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="विषय, मुद्दे या कीवर्ड खोजें..."/></label><span className="ed-tools-hint">FILTER BY GS DOMAIN</span></div>
    <div className="ed-category-rail">{categories.map((cat,i)=><button key={cat} className={category===cat?"is-active":""} onClick={()=>setCategory(cat)}><span>{String(i+1).padStart(2,"0")}</span>{cat==="ALL"?"सभी विषय":cat}</button>)}</div>
    <div className="ed-dispatch-grid">{filtered.map((a,i)=><motion.article key={a.slug} className="ed-dispatch-card" initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:Math.min(i*.045,.25)}}><Link href={"/current-affairs/"+a.slug} className="ed-dispatch-link"><div className="ed-dispatch-card-top"><span>{a.category}</span><b>{String(i+1).padStart(2,"0")}</b></div><h3>{a.title_hi||a.title_en}</h3><p>{a.summary_hi||a.summary_en}</p><div className="ed-dispatch-card-foot"><span>{new Date(a.published_at||a.created_at).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})} · {a.read_minutes} MIN</span><i><Icon icon={ArrowUpRight01Icon}/></i></div></Link></motion.article>)}{loading&&<div className="ed-empty">प्रकाशित विश्लेषण लोड हो रहे हैं…</div>}{loadError&&<div className="ed-empty">{loadError}. Please try again later.</div>}{!loading&&!loadError&&filtered.length===0&&<div className="ed-empty">{articles.length===0?"अभी कोई Editorial प्रकाशित नहीं है।":"इस खोज से संबंधित विषय नहीं मिला।"}</div>}</div>
   </section>
   <footer className="ed-journal-footer"><span>GYANKUNJ <i>✳</i> CIVILPREP</span><span>KNOW MORE. THINK DEEPER.</span><Link href="/">BACK TO YOUR UNIVERSE ↗</Link></footer>
  </div>
 </main>;
}

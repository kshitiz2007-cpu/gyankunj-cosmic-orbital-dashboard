"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import {motion} from "motion/react";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Search01Icon,BookOpen01Icon,File01Icon,Layers01Icon,Bookmark01Icon,Clock01Icon,GraduationScrollIcon,Atom01Icon,ChartLineData01Icon} from "@hugeicons/core-free-icons";
type LibrarySubject={id:string;slug:string;name:string;hi:string;topics:number;resources:number;color:string;icon:typeof GraduationScrollIcon;desc:string};
type LibraryResource={id:string;title:string;sub:string;type:string;time:string;topic:string|null;subject_id:string|null};
const subjectStyle:Record<string,{color:string;icon:typeof GraduationScrollIcon;desc:string}>={
 polity:{color:"#70cfff",icon:GraduationScrollIcon,desc:"संविधान, संस्थाएँ, अधिकार और शासन व्यवस्था"},
 history:{color:"#f3c879",icon:BookOpen01Icon,desc:"प्राचीन, मध्यकालीन, आधुनिक भारत और कला-संस्कृति"},
 economy:{color:"#76e2bd",icon:ChartLineData01Icon,desc:"विकास, बैंकिंग, बजट, वित्त और समावेशन"},
 environment:{color:"#9bdda0",icon:Atom01Icon,desc:"जैव विविधता, जलवायु परिवर्तन और संरक्षण"},
 "science-tech":{color:"#b89cff",icon:Layers01Icon,desc:"अंतरिक्ष, जैव-प्रौद्योगिकी, AI और रक्षा तकनीक"},
 geography:{color:"#ff9f9a",icon:Layers01Icon,desc:"भौतिक, भारतीय और विश्व भूगोल"}
};
function Icon({icon,size=20}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function LibraryPage(){
 const router=useRouter();
 const [search,setSearch]=useState(""),[filter,setFilter]=useState("ALL"),[saved,setSaved]=useState<string[]>([]);
 const [subjects,setSubjects]=useState<LibrarySubject[]>([]),[resources,setResources]=useState<LibraryResource[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState("");
 useEffect(()=>{let active=true;const load=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){setLoadError("Library connection is unavailable.");setLoading(false);return;}const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){router.replace("/login");return;}const [{data:subjectRows,error:subjectError},{data:resourceRows,error:resourceError}]=await Promise.all([supabase.from("subjects").select("id,slug,name_en,name_hi,sort_order").order("sort_order"),supabase.from("study_resources").select("id,subject_id,title_en,title_hi,topic,resource_type,created_at").eq("is_published",true).order("created_at",{ascending:false})]);if(!active)return;if(subjectError||resourceError){setLoadError(subjectError?.message||resourceError?.message||"Unable to load library.");setLoading(false);return;}const rows=resourceRows||[];setSubjects((subjectRows||[]).map(s=>{const own=rows.filter(r=>r.subject_id===s.id);return{id:s.id,slug:s.slug,name:s.name_en,hi:s.name_hi||"",topics:new Set(own.map(r=>r.topic).filter(Boolean)).size,resources:own.length,...(subjectStyle[s.slug]||{color:"#d48cff",icon:Layers01Icon,desc:"Explore published learning resources"})};}));setResources(rows.slice(0,6).map(r=>({id:r.id,title:r.title_hi||r.title_en,sub:r.topic||"Study resource",type:r.resource_type.toUpperCase(),time:r.resource_type==="pdf"?"PDF":r.resource_type==="image"?"IMAGE":"READ",topic:r.topic,subject_id:r.subject_id})));setLoading(false);};void load();return()=>{active=false;};},[router]);
 const visible=useMemo(()=>subjects.filter(s=>(filter==="ALL"||s.slug===filter)&&(s.name+s.hi+s.desc).toLowerCase().includes(search.toLowerCase())),[subjects,filter,search]);
 const topicCount=subjects.reduce((sum,s)=>sum+s.topics,0),resourceCount=subjects.reduce((sum,s)=>sum+s.resources,0);
 return <main className="library-app">
  <header className="library-top"><Link href="/" className="library-back"><Icon icon={ArrowLeft01Icon}/> GYANKUNJ</Link><span>LEARNING SPACE / DIGITAL LIBRARY</span><span className="library-top-count">{String(subjects.length).padStart(2,"0")} SUBJECTS</span></header>
  <div className="library-wrap">
   <section className="library-hero"><div className="library-hero-copy"><span className="library-kicker">THE KNOWLEDGE ARCHIVE / 01</span><h1>Study with<br/><em>structure.</em></h1><p>एक व्यवस्थित डिजिटल लाइब्रेरी—जहाँ हर विषय, टॉपिक और अध्ययन सामग्री एक स्पष्ट learning path में मिले।</p><div className="library-stats"><div><strong>{String(subjects.length).padStart(2,"0")}</strong><span>SUBJECTS</span></div><div><strong>{String(topicCount).padStart(2,"0")}</strong><span>TOPICS</span></div><div><strong>{String(resourceCount).padStart(2,"0")}</strong><span>RESOURCES</span></div></div></div><div className="library-hero-art"><div className="library-book-stack"><i/><i/><i/><b>GK</b></div><span>LEARN · REVISE · MASTER</span></div></section>
   <section className="library-tools"><label><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search subjects, topics and resources..."/></label><span>CURATED FOR UPSC / STATE PCS</span></section>
   <section className="library-subject-section"><div className="library-section-head"><div><span className="library-kicker">EXPLORE THE SYLLABUS</span><h2>Subject <em>Universe.</em></h2></div><small>{visible.length.toString().padStart(2,"0")} / {String(subjects.length).padStart(2,"0")}</small></div>
    {loading&&<div className="library-empty">Loading published subjects and resources…</div>}{loadError&&<div className="library-empty">{loadError}</div>}<div className="library-subject-grid">{visible.map((s,i)=><motion.div key={s.slug} initial={{opacity:0,y:15}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.05}} className="library-subject-card" style={{"--subject-color":s.color} as React.CSSProperties}>
      <div className="library-subject-card-top"><span className="library-subject-icon"><Icon icon={s.icon} size={25}/></span><span className="library-subject-index">0{i+1} / SUBJECT</span></div><h3>{s.name}</h3><h4>{s.hi}</h4><p>{s.desc}</p><div className="library-subject-meta"><span>{s.topics} TOPICS</span><span>{s.resources} RESOURCES</span></div><Link href={"/library/"+s.slug}>Explore subject <Icon icon={ArrowUpRight01Icon}/></Link>
     </motion.div>)}</div>{!loading&&!loadError&&visible.length===0&&<div className="library-empty">No published subjects yet. Published resources will appear here.</div>}
   </section>
   <section className="library-recent"><div className="library-section-head"><div><span className="library-kicker">PICK UP WHERE YOU LEFT OFF</span><h2>Featured <em>resources.</em></h2></div><span className="library-recent-label">EDITOR&apos;S PICKS</span></div><div className="library-resource-grid">{resources.map((r,i)=><article key={r.id} className="library-resource-card"><span className="library-resource-type">{r.type}</span><div className="library-resource-icon"><Icon icon={i===1?File01Icon:BookOpen01Icon} size={24}/></div><h3>{r.title}</h3><p>{r.sub}</p><div><span>{r.time}</span><Link href={r.subject_id?"/library/"+(subjects.find(s=>s.id===r.subject_id)?.slug||""):"/library"} aria-label={"Open "+r.title}><Icon icon={ArrowUpRight01Icon}/></Link><button aria-label="Save resource" className={saved.includes(r.title)?"saved":""} onClick={()=>setSaved(v=>v.includes(r.title)?v.filter(x=>x!==r.title):[...v,r.title])}><Icon icon={Bookmark01Icon}/></button></div></article>)}</div>{!loading&&resources.length===0&&<div className="library-empty">No published resources yet. Check back after the Admin publishes learning material.</div>}</section>
   <footer className="library-footer">GYANKUNJ · CIVILPREP <span>KNOWLEDGE, ORGANISED.</span></footer>
  </div>
 </main>;
}

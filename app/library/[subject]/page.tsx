"use client";
import Link from "next/link";
import {useMemo,useState} from "react";
import {useParams} from "next/navigation";
import {HugeiconsIcon} from "@hugeicons/react";
import {ArrowLeft01Icon,ArrowUpRight01Icon,Search01Icon,BookOpen01Icon,File01Icon,Clock01Icon,Bookmark01Icon} from "@hugeicons/core-free-icons";
const data={
 polity:{name:"Indian Polity",hi:"भारतीय राजव्यवस्था",desc:"भारतीय संविधान, संस्थाओं और शासन व्यवस्था का क्रमबद्ध अध्ययन।",topics:[["constitutional-development","संवैधानिक विकास","1773–1947 · 8 lessons"],["preamble","प्रस्तावना","संविधान की आत्मा · 4 lessons"],["fundamental-rights","मौलिक अधिकार","अनुच्छेद 12–35 · 9 lessons"],["dpsp","राज्य के नीति निदेशक तत्त्व","अनुच्छेद 36–51 · 6 lessons"],["union-executive","संघ कार्यपालिका","राष्ट्रपति, उपराष्ट्रपति, मंत्रिपरिषद"],["parliament","संसद","संरचना, कार्य एवं प्रक्रिया"]]},
 history:{name:"History & Culture",hi:"इतिहास एवं संस्कृति",desc:"भारत के अतीत और सांस्कृतिक विरासत का क्रमबद्ध अध्ययन।",topics:[["ancient-india","प्राचीन भारत","सिंधु से गुप्त काल"],["medieval-india","मध्यकालीन भारत","दिल्ली सल्तनत और मुगल"],["modern-india","आधुनिक भारत","1757–1947"],["art-culture","कला एवं संस्कृति","वास्तुकला, नृत्य, साहित्य"]]},
 economy:{name:"Indian Economy",hi:"भारतीय अर्थव्यवस्था",desc:"भारतीय अर्थव्यवस्था की मूल अवधारणाएँ और समकालीन मुद्दे।",topics:[["national-income","राष्ट्रीय आय","GDP, GVA और मापन"],["banking","बैंकिंग व्यवस्था","RBI, मौद्रिक नीति"],["budget","बजट एवं राजकोषीय नीति","कर, व्यय और घाटा"]]},
 environment:{name:"Environment",hi:"पर्यावरण एवं पारिस्थितिकी",desc:"पारिस्थितिकी, जैव विविधता और पर्यावरणीय शासन।",topics:[["ecology","पारिस्थितिकी","पारिस्थितिक तंत्र"],["biodiversity","जैव विविधता","संरक्षण और हॉटस्पॉट"],["climate-change","जलवायु परिवर्तन","कारण, प्रभाव और समझौते"]]},
 "science-tech":{name:"Science & Technology",hi:"विज्ञान एवं प्रौद्योगिकी",desc:"उभरती तकनीकों और वैज्ञानिक नवाचार की परीक्षा-उपयोगी समझ।",topics:[["space","अंतरिक्ष प्रौद्योगिकी","ISRO और मिशन"],["biotechnology","जैव प्रौद्योगिकी","जीन, वैक्सीन, CRISPR"],["artificial-intelligence","कृत्रिम बुद्धिमत्ता","AI, ML और शासन"]]},
 geography:{name:"Geography",hi:"भूगोल",desc:"भौतिक, भारतीय और विश्व भूगोल का समेकित अध्ययन।",topics:[["physical-geography","भौतिक भूगोल","स्थलरूप और प्रक्रियाएँ"],["indian-geography","भारत का भूगोल","नदियाँ, जलवायु, संसाधन"],["world-geography","विश्व भूगोल","महाद्वीप और महासागर"]]}
};
function Icon({icon,size=19}:{icon:typeof ArrowLeft01Icon;size?:number}){return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8}/>}
export default function SubjectLibraryPage(){
 const params=useParams<{subject:string}>(),slug=params.subject;
 const subject=data[slug as keyof typeof data];const [search,setSearch]=useState(""),[tab,setTab]=useState("ALL");
 const topics=useMemo(()=>subject?.topics.filter(t=>(t[1]+t[2]).toLowerCase().includes(search.toLowerCase())),[subject,search]);
 if(!subject)return <main className="library-app"><Link href="/library">← Back to library</Link><h1>Subject not found</h1></main>;
 return <main className="library-app"><header className="library-top"><Link href="/library" className="library-back"><Icon icon={ArrowLeft01Icon}/> DIGITAL LIBRARY</Link><span>SUBJECT / {slug.toUpperCase()}</span><span className="library-top-count">{subject.topics.length} TOPICS</span></header><div className="library-wrap">
  <section className="library-subject-hero"><span className="library-kicker">GYANKUNJ / SUBJECT LEARNING PATH</span><h1>{subject.name}<br/><em>{subject.hi}</em></h1><p>{subject.desc}</p><div className="library-path"><span>LIBRARY</span><b>→</b><span>{subject.name.toUpperCase()}</span><b>→</b><span>TOPICS</span></div></section>
  <section className="library-tools"><label><Icon icon={Search01Icon}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search topics and subtopics..."/></label><span>STRUCTURED SYLLABUS</span></section>
  <section className="library-topic-section"><div className="library-section-head"><div><span className="library-kicker">LEARNING PATH</span><h2>Topics & <em>modules.</em></h2></div><small>{topics.length.toString().padStart(2,"0")} TOPICS</small></div><div className="library-topic-grid">{topics.map((t,i)=><article className="library-topic-card" key={t[0]}><div className="library-topic-number">0{i+1}</div><div><span>TOPIC / {String(i+1).padStart(2,"0")}</span><h3>{t[1]}</h3><p>{t[2]}</p><div className="library-topic-resources"><span><Icon icon={BookOpen01Icon}/> NOTES</span><span><Icon icon={File01Icon}/> PYQ</span><span><Icon icon={Clock01Icon}/> REVISION</span></div></div><Link href={"/library/"+slug+"/"+t[0]} aria-label={"Open "+t[1]}><Icon icon={ArrowUpRight01Icon}/></Link></article>)}</div>{topics.length===0&&<div className="library-empty">No matching topics.</div>}</section>
 </div></main>;
}

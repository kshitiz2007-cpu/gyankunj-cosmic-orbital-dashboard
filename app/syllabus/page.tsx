"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";

type Topic = { title: string; items: string[] };
type Paper = { id: string; code: string; title: string; marks: string; duration: string; note: string; topics: Topic[] };
const papers: Paper[] = [
 {id:"prelims-gs",code:"PRELIMS · PAPER I",title:"General Studies",marks:"200 MARKS",duration:"2 HOURS",note:"Merit for Prelims cutoff; objective MCQ paper.",topics:[
  {title:"Current events",items:["राष्ट्रीय एवं अंतरराष्ट्रीय महत्त्व की समसामयिक घटनाएँ"]},
  {title:"History of India & Indian National Movement",items:["प्राचीन, मध्यकालीन एवं आधुनिक भारत का इतिहास","भारतीय राष्ट्रीय आंदोलन: 19वीं शताब्दी के पुनरुत्थान से स्वतंत्रता तक","राष्ट्रीय आंदोलन के प्रमुख चरण, धाराएँ एवं योगदान"]},
  {title:"Indian & World Geography",items:["भारत एवं विश्व का भौतिक भूगोल","भारत एवं विश्व का सामाजिक भूगोल","भारत एवं विश्व का आर्थिक भूगोल"]},
  {title:"Indian Polity & Governance",items:["भारतीय संविधान एवं राजनीतिक व्यवस्था","पंचायती राज एवं स्थानीय स्वशासन","लोक नीति, अधिकार संबंधी मुद्दे एवं शासन व्यवस्था"]},
  {title:"Economic & Social Development",items:["सतत विकास, गरीबी एवं समावेशन","जनसांख्यिकी एवं सामाजिक क्षेत्र की पहल","आर्थिक एवं सामाजिक विकास से जुड़े विषय"]},
  {title:"Environment, Ecology & Climate Change",items:["सामान्य पर्यावरणीय पारिस्थितिकी","जैव-विविधता एवं जलवायु परिवर्तन","ऐसे विषय जिनमें विशेषज्ञता-स्तर का ज्ञान आवश्यक नहीं"]},
  {title:"General Science",items:["सामान्य विज्ञान एवं रोज़मर्रा के जीवन में विज्ञान के अनुप्रयोग"]}
 ]},
 {id:"csat",code:"PRELIMS · PAPER II",title:"Civil Services Aptitude Test",marks:"200 MARKS",duration:"2 HOURS",note:"Qualifying paper · न्यूनतम 33% (66.67/200).",topics:[
  {title:"Comprehension",items:["गद्यांश आधारित बोध एवं निष्कर्ष"]},
  {title:"Interpersonal & Communication Skills",items:["अंतरवैयक्तिक कौशल एवं संचार कौशल"]},
  {title:"Logical Reasoning & Analytical Ability",items:["तार्किक विवेचन एवं विश्लेषणात्मक क्षमता"]},
  {title:"Decision Making & Problem Solving",items:["निर्णय-निर्माण एवं समस्या-समाधान"]},
  {title:"General Mental Ability",items:["सामान्य मानसिक योग्यता"]},
  {title:"Basic Numeracy & Data Interpretation",items:["संख्या एवं उनके संबंध, परिमाण का क्रम (कक्षा 10 स्तर)","आँकड़ों की व्याख्या: चार्ट, ग्राफ, तालिका, डेटा पर्याप्तता (कक्षा 10 स्तर)"]}
 ]},
 {id:"gs1",code:"MAINS · PAPER I",title:"भारतीय विरासत एवं संस्कृति, इतिहास एवं भूगोल",marks:"250 MARKS",duration:"3 HOURS",note:"Descriptive · मेरिट में शामिल.",topics:[
  {title:"भारतीय संस्कृति",items:["प्राचीन से आधुनिक काल तक कला-रूप, साहित्य एवं वास्तुकला के प्रमुख पहलू"]},
  {title:"आधुनिक भारतीय इतिहास",items:["18वीं शताब्दी के मध्य से वर्तमान तक की घटनाएँ, व्यक्तित्व एवं मुद्दे","स्वतंत्रता संग्राम: विभिन्न चरण एवं देश के विभिन्न भागों से योगदान","स्वतंत्रता के बाद देश का एकीकरण एवं पुनर्गठन"]},
  {title:"विश्व इतिहास",items:["18वीं शताब्दी के बाद की घटनाएँ: औद्योगिक क्रांति, विश्व युद्ध, राष्ट्रीय सीमाओं का पुनर्निर्धारण","उपनिवेशवाद, उपनिवेश-मुक्ति, राजनीतिक दर्शन एवं विचारधाराएँ"]},
  {title:"भारतीय समाज",items:["भारतीय समाज की मुख्य विशेषताएँ एवं विविधता","महिलाओं की भूमिका, जनसंख्या, गरीबी, विकास संबंधी मुद्दे","शहरीकरण, उसकी समस्याएँ एवं समाधान","वैश्वीकरण का भारतीय समाज पर प्रभाव","सामाजिक सशक्तीकरण, सांप्रदायिकता, क्षेत्रवाद एवं धर्मनिरपेक्षता"]},
  {title:"भूगोल",items:["विश्व के भौतिक भूगोल की प्रमुख विशेषताएँ","विश्व में प्राकृतिक संसाधनों का वितरण एवं उद्योगों के स्थान-निर्धारण के कारक","भूकंप, सुनामी, ज्वालामुखी, चक्रवात आदि भू-भौतिक घटनाएँ","महत्त्वपूर्ण भौगोलिक विशेषताओं एवं वनस्पति-प्राणी जगत में परिवर्तन"]}
 ]},
 {id:"gs2",code:"MAINS · PAPER II",title:"शासन, संविधान, राजव्यवस्था, सामाजिक न्याय एवं अंतरराष्ट्रीय संबंध",marks:"250 MARKS",duration:"3 HOURS",note:"Descriptive · मेरिट में शामिल.",topics:[
  {title:"संविधान एवं राजव्यवस्था",items:["भारतीय संविधान: ऐतिहासिक आधार, विकास, विशेषताएँ, संशोधन, महत्त्वपूर्ण प्रावधान एवं मूल संरचना","संघ एवं राज्यों के कार्य तथा उत्तरदायित्व; संघीय ढाँचे की चुनौतियाँ","शक्तियों का पृथक्करण, विवाद निवारण एवं संस्थागत तंत्र","भारतीय संवैधानिक योजना की अन्य देशों से तुलना","संसद एवं राज्य विधानमंडल: संरचना, कार्य, शक्तियाँ एवं विशेषाधिकार","कार्यपालिका एवं न्यायपालिका; मंत्रालय एवं विभाग","जनप्रतिनिधित्व अधिनियम की प्रमुख विशेषताएँ","संवैधानिक पदों पर नियुक्ति एवं संवैधानिक निकाय"]},
  {title:"शासन एवं सामाजिक न्याय",items:["सरकारी नीतियाँ एवं विकास हेतु हस्तक्षेप; क्रियान्वयन के मुद्दे","NGO, SHG, समूहों, दाताओं एवं संस्थाओं की भूमिका","कमजोर वर्गों के लिए कल्याणकारी योजनाएँ एवं संस्थागत तंत्र","स्वास्थ्य, शिक्षा एवं मानव संसाधन से जुड़े सामाजिक क्षेत्र","गरीबी एवं भूख से संबंधित मुद्दे","पारदर्शिता, जवाबदेही, ई-गवर्नेंस, नागरिक चार्टर एवं लोक सेवा मूल्य"]},
  {title:"अंतरराष्ट्रीय संबंध",items:["भारत एवं पड़ोसी देशों के संबंध","द्विपक्षीय, क्षेत्रीय एवं वैश्विक समूह तथा भारत से जुड़े समझौते","भारत के हितों पर विकसित एवं विकासशील देशों की नीतियों का प्रभाव","प्रवासी भारतीय","महत्त्वपूर्ण अंतरराष्ट्रीय संस्थाएँ, एजेंसियाँ एवं मंच"]}
 ]},
 {id:"gs3",code:"MAINS · PAPER III",title:"प्रौद्योगिकी, आर्थिक विकास, जैव-विविधता, पर्यावरण, सुरक्षा एवं आपदा प्रबंधन",marks:"250 MARKS",duration:"3 HOURS",note:"Descriptive · मेरिट में शामिल.",topics:[
  {title:"अर्थव्यवस्था",items:["भारतीय अर्थव्यवस्था एवं योजना, संसाधनों का जुटाव, वृद्धि, विकास एवं रोजगार","समावेशी विकास एवं उससे उत्पन्न मुद्दे","सरकारी बजट","कृषि: प्रमुख फसलें, सिंचाई, भंडारण, परिवहन एवं विपणन","कृषि सब्सिडी, न्यूनतम समर्थन मूल्य, सार्वजनिक वितरण प्रणाली एवं खाद्य सुरक्षा","प्रसंस्करण उद्योग, भूमि सुधार","उदारीकरण, औद्योगिक नीति एवं औद्योगिक विकास","अवसंरचना: ऊर्जा, बंदरगाह, सड़क, हवाई अड्डे, रेलवे आदि","निवेश मॉडल"]},
  {title:"विज्ञान एवं प्रौद्योगिकी",items:["विज्ञान एवं प्रौद्योगिकी में विकास और उनके अनुप्रयोग","भारतीयों की उपलब्धियाँ; स्वदेशीकरण एवं नई तकनीक का विकास","IT, अंतरिक्ष, कंप्यूटर, रोबोटिक्स, नैनो-टेक्नोलॉजी, जैव-प्रौद्योगिकी एवं IPR"]},
  {title:"पर्यावरण एवं आपदा प्रबंधन",items:["संरक्षण, पर्यावरण प्रदूषण एवं क्षरण, पर्यावरण प्रभाव आकलन","आपदा एवं आपदा प्रबंधन"]},
  {title:"आंतरिक सुरक्षा",items:["विकास एवं उग्रवाद के प्रसार के संबंध","आंतरिक सुरक्षा चुनौतियों में बाहरी राज्य एवं गैर-राज्य अभिकर्ताओं की भूमिका","संचार नेटवर्क, मीडिया एवं सोशल नेटवर्किंग की भूमिका; साइबर सुरक्षा","मनी लॉन्ड्रिंग एवं इसकी रोकथाम","सीमा सुरक्षा, संगठित अपराध एवं आतंकवाद के संबंध","विभिन्न सुरक्षा बल एवं एजेंसियाँ तथा उनका अधिदेश"]}
 ]},
 {id:"gs4",code:"MAINS · PAPER IV",title:"नीतिशास्त्र, सत्यनिष्ठा एवं अभिरुचि",marks:"250 MARKS",duration:"3 HOURS",note:"Descriptive · केस स्टडी सहित.",topics:[
  {title:"Ethics & Human Interface",items:["नीतिशास्त्र एवं मानवीय अंतर्संबंध: सार, निर्धारक एवं परिणाम","नैतिकता के आयाम; निजी एवं सार्वजनिक संबंधों में नैतिकता","मानवीय मूल्य: महान नेताओं, सुधारकों एवं प्रशासकों के जीवन से सीख"]},
  {title:"Attitude & Aptitude",items:["अभिवृत्ति: विषयवस्तु, संरचना, कार्य एवं प्रभाव","नैतिक एवं राजनीतिक अभिवृत्ति; सामाजिक प्रभाव एवं अनुनय","सिविल सेवा के लिए अभिरुचि एवं मूलभूत मूल्य: सत्यनिष्ठा, निष्पक्षता, गैर-पक्षपात, वस्तुनिष्ठता, समर्पण, सहानुभूति, सहिष्णुता एवं करुणा"]},
  {title:"Emotional Intelligence",items:["भावनात्मक बुद्धिमत्ता की अवधारणा एवं प्रशासन/शासन में उपयोग"]},
  {title:"Thinkers, Public Service & Probity",items:["भारत एवं विश्व के नैतिक विचारक एवं दार्शनिकों का योगदान","लोक सेवा मूल्य एवं सिविल सेवा नैतिकता","शासन में सत्यनिष्ठा: सूचना-साझाकरण, पारदर्शिता, आचार संहिता, नागरिक चार्टर","कार्य संस्कृति, सेवा-प्रदाय की गुणवत्ता, सार्वजनिक धन का उपयोग एवं भ्रष्टाचार की चुनौतियाँ"]},
  {title:"Case Studies",items:["उपर्युक्त विषयों पर आधारित परिस्थितिजन्य नैतिक दुविधाएँ एवं निर्णय"]}
 ]},
 {id:"essay",code:"MAINS · PAPER V",title:"Essay",marks:"250 MARKS",duration:"3 HOURS",note:"दो निबंध · निर्धारित खंडों से विषय.",topics:[
  {title:"निबंध लेखन",items:["विभिन्न विषयों पर निबंध; विषय की प्रासंगिकता, विचारों का क्रमबद्ध संगठन एवं संक्षिप्तता","विचारों की स्पष्टता, तार्किक प्रवाह, संतुलित दृष्टिकोण एवं प्रभावी निष्कर्ष"]}
 ]},
 {id:"language",code:"MAINS · PAPER A & B",title:"Qualifying Language Papers",marks:"300 + 300",duration:"3 HOURS EACH",note:"Paper A भारतीय भाषा एवं Paper B English · qualifying.",topics:[
  {title:"Paper A · भारतीय भाषा",items:["दिए गए गद्यांश की समझ","संक्षिप्त लेखन / Precis","प्रयोग एवं शब्दावली","लघु निबंध","अंग्रेज़ी से भारतीय भाषा तथा भारतीय भाषा से अंग्रेज़ी अनुवाद"]},
  {title:"Paper B · English",items:["Comprehension of given passages","Precis writing","Usage and vocabulary","Short essays"]}
 ]},
 {id:"optional",code:"MAINS · PAPER VI & VII",title:"Optional Subject",marks:"250 + 250",duration:"3 HOURS EACH",note:"एक वैकल्पिक विषय चुनें · दो पेपर.",topics:[
  {title:"विषय चयन",items:["विषय का Paper I एवं Paper II syllabus आधिकारिक अधिसूचना में अलग-अलग दिया गया है। नीचे दिए गए विषयों में से एक चुनकर उसका विस्तृत पाठ्यक्रम देखें।"]}
 ]}
];
const optionals=["Agriculture","Animal Husbandry & Veterinary Science","Anthropology","Botany","Chemistry","Civil Engineering","Commerce & Accountancy","Economics","Electrical Engineering","Geography","Geology","History","Law","Management","Mathematics","Mechanical Engineering","Medical Science","Philosophy","Physics","Political Science & International Relations","Psychology","Public Administration","Sociology","Statistics","Zoology","Literature of any one of the languages listed in the notification"];
const totalTopics=papers.reduce((n,p)=>n+p.topics.reduce((m,t)=>m+t.items.length,0),0);
export default function SyllabusPage(){
 const [active,setActive]=useState("prelims-gs"),[query,setQuery]=useState(""),[done,setDone]=useState<string[]>([]),[optional,setOptional]=useState(""),[expanded,setExpanded]=useState<string[]>([]);
 const [syncLoading,setSyncLoading]=useState(true),[syncMessage,setSyncMessage]=useState("");
 useEffect(()=>{
  let alive=true;
  const loadProgress=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){if(alive){setSyncLoading(false);setSyncMessage("Progress sync unavailable: Supabase is not configured.");}return;}
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError)throw authError;
   if(!user){if(alive){setSyncLoading(false);setSyncMessage("Sign in to save syllabus completion across devices.");}return;}
   const {data,error}=await supabase.from("student_topic_progress").select("topic_key").eq("student_id",user.id).eq("exam_key","upsc-cse");
   if(error)throw error;
   if(alive){setDone((data||[]).map(row=>row.topic_key));setSyncLoading(false);setSyncMessage("Progress synced with your account.");}
  };
  void loadProgress().catch(error=>{if(alive){setSyncLoading(false);setSyncMessage(error instanceof Error?error.message:"Unable to sync syllabus progress.");}});
  return()=>{alive=false;};
 },[]);
 const paper=papers.find(p=>p.id===active)??papers[0];
 const filtered=useMemo(()=>paper.topics.map(t=>({...t,items:t.items.filter(x=>(t.title+" "+x).toLowerCase().includes(query.toLowerCase()))})).filter(t=>t.items.length),[paper,query]);
 const makeTopicKey=(paperKey:string,topicTitle:string,itemText:string)=>paperKey+"::"+topicTitle+"::"+itemText;
 const toggle=async(paperKey:string,topicTitle:string,itemText:string)=>{
  const key=makeTopicKey(paperKey,topicTitle,itemText);
  const wasDone=done.includes(key);
  setDone(old=>wasDone?old.filter(x=>x!==key):[...old,key]);
  setSyncMessage("Saving your syllabus progress…");
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setDone(old=>wasDone?[...old,key]:old.filter(x=>x!==key));setSyncMessage("Could not save: Supabase is not configured.");return;}
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError||!user){setDone(old=>wasDone?[...old,key]:old.filter(x=>x!==key));setSyncMessage("Sign in to save syllabus progress.");return;}
  const result=wasDone
   ? await supabase.from("student_topic_progress").delete().eq("student_id",user.id).eq("exam_key","upsc-cse").eq("topic_key",key)
   : await supabase.from("student_topic_progress").upsert({student_id:user.id,exam_key:"upsc-cse",paper_key:paperKey,topic_key:key,topic_title:topicTitle,item_text:itemText,completed_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"student_id,exam_key,topic_key"});
  if(result.error){setDone(old=>wasDone?[...old,key]:old.filter(x=>x!==key));setSyncMessage("Save failed: "+result.error.message);return;}
  if(!wasDone)await supabase.from("student_activity").insert({student_id:user.id,activity_type:"syllabus_topic_completed",metadata:{exam_key:"upsc-cse",paper_key:paperKey,topic_title:topicTitle,topic_key:key}});
  setSyncMessage("Progress synced with your account.");
 };
 return <main className="syllabus-app">
  <header className="syllabus-top"><Link href="/" className="syllabus-brand">← <span>GYANKUNJ / CIVILPREP</span></Link><span>UPSC CSE · OFFICIAL FRAMEWORK</span><a href="https://upsc.gov.in/examinations/Examination-Notifications" target="_blank" rel="noreferrer">UPSC SOURCE ↗</a></header>
  <div className="syllabus-wrap">
   <section className="syllabus-hero"><div><span className="syllabus-kicker">THE EXAM BLUEPRINT · 2026</span><h1>Know the<br/><em>syllabus.</em></h1><p>UPSC Civil Services Examination का stage-wise और paper-wise syllabus — Prelims से Personality Test तक। हर topic को track करें और अपनी तैयारी को syllabus से जोड़ें।</p><div className="syllabus-hero-meta"><span>3 STAGES</span><span>9 MAINS PAPERS</span><span>1,750 + 275 MERIT MARKS</span></div></div><div className="syllabus-orbit"><div className="syllabus-orbit-inner"><b>UPSC</b><small>CSE<br/>2026</small></div><i/><i/><i/></div></section>
   <section className="syllabus-stats"><article><b>400</b><span>PRELIMS MARKS</span></article><article><b>1,750</b><span>MAINS WRITTEN</span></article><article><b>275</b><span>PERSONALITY TEST</span></article><article><b>{done.length}/{totalTopics}</b><span>TOPIC CHECKLIST</span></article></section>
   <section className="syllabus-workspace">
    <aside className="syllabus-sidebar"><span className="syllabus-side-label">EXAM STRUCTURE</span>{[{label:"PRELIMS",ids:["prelims-gs","csat"]},{label:"MAINS · WRITTEN",ids:["essay","language","gs1","gs2","gs3","gs4","optional"]}].map(group=><div className="syllabus-nav-group" key={group.label}><small>{group.label}</small>{group.ids.map(id=>{const p=papers.find(x=>x.id===id)!;return <button key={id} className={active===id?"active":""} onClick={()=>{setActive(id);setQuery("");}}><span>{p.code.split(" · ")[1]??p.code}</span>{p.title}</button>})}</div>)}<div className="syllabus-interview"><small>FINAL STAGE</small><b>Personality Test</b><span>275 marks · Interview</span></div></aside>
    <div className="syllabus-content"><div className="syllabus-paper-head"><div><span>{paper.code}</span><h2>{paper.title}</h2><p>{paper.note}</p></div><div className="syllabus-paper-meta"><b>{paper.marks}</b><small>{paper.duration}</small></div></div>
     <div className="syllabus-tools"><label>⌕ <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="इस paper में topic खोजें..."/></label><span>{filtered.reduce((n,t)=>n+t.items.length,0)} SYLLABUS POINTS</span></div><p className="syllabus-sync-status" role="status">{syncLoading?"SYNCING YOUR PROGRESS…":syncMessage}</p>
     {paper.id==="optional"&&<div className="syllabus-optional"><label htmlFor="optional-subject">अपना Optional Subject चुनें</label><select id="optional-subject" value={optional} onChange={e=>setOptional(e.target.value)}><option value="">Select subject</option>{optionals.map(o=><option key={o}>{o}</option>)}</select><p>Optional चुनने पर Paper I & II के विस्तृत विषयवार sub-topics को आधिकारिक notification से मिलाएँ।</p></div>}
     <div className="syllabus-topic-list">{filtered.map((topic,i)=>{const key=paper.id+"-"+topic.title;const isOpen=expanded.includes(key)||query.length>0;return <article className="syllabus-topic" key={key}><button className="syllabus-topic-head" onClick={()=>setExpanded(old=>old.includes(key)?old.filter(x=>x!==key):[...old,key])}><span className="syllabus-topic-no">{String(i+1).padStart(2,"0")}</span><b>{topic.title}</b><small>{topic.items.filter(item=>done.includes(makeTopicKey(paper.id,topic.title,item))).length}/{topic.items.length} DONE</small><i>{isOpen?"−":"+"}</i></button>{isOpen&&<div className="syllabus-topic-items">{topic.items.map((item,j)=><label key={item} className={done.includes(makeTopicKey(paper.id,topic.title,item))?"checked":""}><input type="checkbox" checked={done.includes(makeTopicKey(paper.id,topic.title,item))} onChange={()=>void toggle(paper.id,topic.title,item)}/><span>{item}</span></label>)}</div>}</article>})}{filtered.length===0&&<p className="syllabus-empty">इस paper में कोई matching topic नहीं मिला।</p>}</div>
     <div className="syllabus-paper-foot"><span>CHECK EACH TOPIC AS YOU COMPLETE IT</span><b>{Math.round((done.length/Math.max(totalTopics,1))*100)}% OVERALL TRACKED</b></div>
    </div>
   </section>
   <section className="syllabus-bottom"><div><span>BEYOND THE WRITTEN EXAM</span><h2>Personality Test <em>/ 275</em></h2><p>अभ्यर्थी का सार्वजनिक सेवा के लिए व्यक्तिगत उपयुक्तता, मानसिक सतर्कता, आलोचनात्मक ग्रहणशीलता, स्पष्ट एवं तार्किक अभिव्यक्ति, संतुलित निर्णय और नेतृत्व क्षमता का आकलन।</p></div><a href="https://upsc.gov.in/" target="_blank" rel="noreferrer">VISIT UPSC WEBSITE ↗</a></section>
   <footer className="syllabus-footer"><span>GYANKUNJ · CIVILPREP</span><span>SYLLABUS REFERENCE: UPSC CSE NOTIFICATION 2026 · APPENDIX I</span><a href="https://upsc.gov.in/exams-related-info/exam-notification/archives" target="_blank" rel="noreferrer">VERIFY LATEST NOTIFICATION ↗</a></footer>
  </div>
 </main>;
}

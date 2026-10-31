"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import "./ai.css";

type Source={type:string;title:string;topic:string};
type Reply={answer:string;sources:Source[]};
const prompts=["अनुच्छेद 32 और अनुच्छेद 226 में अंतर समझाइए।","भारतीय अर्थव्यवस्था में मौद्रिक नीति की भूमिका क्या है?","किसी विषय के लिए UPSC Mains का उत्तर-लेखन framework बनाइए।"];

export default function AICompanionPage(){
 const router=useRouter();
 const [question,setQuestion]=useState("");
 const [reply,setReply]=useState<Reply|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [ready,setReady]=useState(false);
 useEffect(()=>{let active=true;const check=async()=>{const supabase=getSupabaseBrowserClient();if(!supabase){if(active)setError("Supabase configuration is missing.");return;}const {data:{user}}=await supabase.auth.getUser();if(!user){router.replace("/login");return;}if(active)setReady(true);};void check();return()=>{active=false;};},[router]);
 const ask=async(value=question)=>{
  const text=value.trim();if(text.length<3||loading)return;
  setQuestion(text);setLoading(true);setError("");setReply(null);
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setError("Study Companion is unavailable because Supabase is not configured.");setLoading(false);return;}
  const {data:{session},error:sessionError}=await supabase.auth.getSession();
  if(sessionError||!session){router.replace("/login");return;}
  try{
   const response=await fetch("/api/ai/ask",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({question:text})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||"Unable to generate an answer.");
   setReply(data as Reply);
  }catch(e){setError(e instanceof Error?e.message:"Unable to reach the Study Companion.");}
  finally{setLoading(false);}
 };
 return <main className="ai-companion-app">
  <header className="ai-companion-top"><Link href="/">← GYANKUNJ</Link><span>LEARNING SPACE / STUDY COMPANION</span><Link href="/profile">STUDENT SPACE ↗</Link></header>
  <div className="ai-companion-wrap">
   <section className="ai-companion-hero"><span className="ai-companion-kicker"><i/> GYANKUNJ INTELLIGENCE / 01</span><h1>Think clearer.<br/><em>Learn deeper.</em></h1><p>Ask doubts, explore concepts and prepare exam-oriented answers using your published Gyankunj study material as the knowledge base.</p><div className="ai-companion-tags"><span>HINDI + ENGLISH</span><span>UPSC / STATE PCS</span><span>COURSE-GROUNDED</span></div></section>
   <section className="ai-companion-workspace">
    <div className="ai-companion-composer"><label htmlFor="companion-question">WHAT ARE YOU WORKING ON?</label><textarea id="companion-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={2000} placeholder="अपना प्रश्न लिखें… उदाहरण: मौलिक अधिकारों और नीति निदेशक तत्वों के बीच संबंध समझाइए।" rows={5}/><div className="ai-companion-compose-foot"><span>{question.length}/2000 · Your question is processed for this response</span><button onClick={()=>void ask()} disabled={!ready||loading||question.trim().length<3}>{loading?"THINKING…":"ASK COMPANION ↗"}</button></div></div>
    <div className="ai-companion-prompts"><span>TRY A STUDY PROMPT</span>{prompts.map(prompt=><button key={prompt} onClick={()=>void ask(prompt)} disabled={loading}>{prompt} ↗</button>)}</div>
    {error&&<div className="ai-companion-error" role="alert">{error}</div>}
    {loading&&<div className="ai-companion-answer"><span className="ai-companion-kicker">PREPARING YOUR RESPONSE</span><h2>Connecting concepts…</h2><p>Published notes and editorials are being retrieved to ground the explanation.</p></div>}
    {reply&&<article className="ai-companion-answer"><div className="ai-companion-answer-head"><span className="ai-companion-kicker">YOUR STUDY RESPONSE</span><button onClick={()=>{setReply(null);setQuestion("");}}>NEW QUESTION +</button></div><h2>Let&apos;s understand this.</h2><div className="ai-companion-answer-text">{reply.answer}</div>{reply.sources.length>0&&<div className="ai-companion-sources"><span>RETRIEVED GYANKUNJ MATERIAL</span>{reply.sources.map((source,i)=><div key={source.title+i}><b>{source.title}</b><small>{source.type} · {source.topic}</small></div>)}</div>}</article>}
   </section>
   <div className="ai-companion-bottom"><Link href="/library">Explore Study Library ↗</Link><Link href="/practice/daily">Practice Daily Drill ↗</Link><span>AI RESPONSES CAN CONTAIN ERRORS · VERIFY IMPORTANT FACTS</span></div>
  </div>
 </main>;
}

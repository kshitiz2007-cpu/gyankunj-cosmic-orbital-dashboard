"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "./vault.css";

type MemoryCard = {
  id:string; category:string; category_label_en:string; category_label_hi:string;
  prompt_en:string; prompt_hi:string; answer_en:string; answer_hi:string;
  rationale_en:string|null; rationale_hi:string|null; exam_tags:string[]; sort_order:number;
};
type MemoryProgress = {card_id:string;is_mastered:boolean;mastered_at:string|null;review_count:number;last_reviewed_at:string|null};
type Language = "en"|"hi";

export default function MemoryVaultPage(){
  const [cards,setCards]=useState<MemoryCard[]>([]);
  const [progress,setProgress]=useState<Record<string,MemoryProgress>>({});
  const [category,setCategory]=useState("all");
  const [index,setIndex]=useState(0);
  const [flipped,setFlipped]=useState(false);
  const [language,setLanguage]=useState<Language>("en");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    const supabase=getSupabaseBrowserClient();
    if(!supabase){setError("Supabase configuration is unavailable.");setLoading(false);return;}
    const {data:{user},error:authError}=await supabase.auth.getUser();
    if(authError)throw authError;
    if(!user){window.location.href="/login?next=/vault";return;}
    const [cardResult,progressResult]=await Promise.all([
      supabase.from("memory_cards").select("id,category,category_label_en,category_label_hi,prompt_en,prompt_hi,answer_en,answer_hi,rationale_en,rationale_hi,exam_tags,sort_order").eq("is_published",true).order("sort_order",{ascending:true}),
      supabase.from("student_memory_progress").select("card_id,is_mastered,mastered_at,review_count,last_reviewed_at").eq("student_id",user.id)
    ]);
    if(cardResult.error)throw cardResult.error;
    if(progressResult.error)throw progressResult.error;
    setCards((cardResult.data||[]) as MemoryCard[]);
    setProgress(Object.fromEntries(((progressResult.data||[]) as MemoryProgress[]).map(p=>[p.card_id,p])));
    setLoading(false);
  },[]);

  useEffect(()=>{void load().catch(e=>{setError(e instanceof Error?e.message:"Unable to load Memory Vault.");setLoading(false);});},[load]);

  const categories=useMemo(()=>[
    {id:"all",label:"ALL"},
    ...Array.from(new Map(cards.map(c=>[c.category,{id:c.category,label:language==="hi"?c.category_label_hi:c.category_label_en}])).values())
  ],[cards,language]);
  const filtered=useMemo(()=>cards.filter(c=>category==="all"||c.category===category),[cards,category]);
  const card=filtered[index]||null;
  const masteredCount=useMemo(()=>cards.filter(c=>progress[c.id]?.is_mastered).length,[cards,progress]);
  const xp=masteredCount*10;
  const currentProgress=card?progress[card.id]:undefined;

  const move=(next:number)=>{
    if(!filtered.length)return;
    setIndex(Math.max(0,Math.min(filtered.length-1,next)));
    setFlipped(false);setNotice("");
  };
  const selectCategory=(id:string)=>{setCategory(id);setIndex(0);setFlipped(false);setNotice("");};

  const reviewCard=async()=>{
    if(!card)return;
    const supabase=getSupabaseBrowserClient();
    if(!supabase)return;
    setSaving(true);setError("");setNotice("");
    try{
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError||!user)throw new Error("Please sign in again.");
      const previous=progress[card.id];
      const payload={
        student_id:user.id,card_id:card.id,is_mastered:true,
        mastered_at:previous?.is_mastered?previous.mastered_at:new Date().toISOString(),
        review_count:(previous?.review_count||0)+1,last_reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()
      };
      const {data,error:saveError}=await supabase.from("student_memory_progress").upsert(payload,{onConflict:"student_id,card_id"}).select("card_id,is_mastered,mastered_at,review_count,last_reviewed_at").single();
      if(saveError)throw saveError;
      setProgress(p=>({...p,[card.id]:data as MemoryProgress}));
      setNotice(previous?.is_mastered?"Review recorded. Your mastery stays intact.":"Added to mastered cards · +10 Vault XP");
    }catch(e){setError(e instanceof Error?e.message:"Unable to save your progress.");}
    finally{setSaving(false);}
  };

  const undoMastery=async()=>{
    if(!card)return;
    const supabase=getSupabaseBrowserClient();if(!supabase)return;
    setSaving(true);setError("");setNotice("");
    try{
      const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please sign in again.");
      const previous=progress[card.id];
      const payload={student_id:user.id,card_id:card.id,is_mastered:false,mastered_at:null,review_count:previous?.review_count||0,last_reviewed_at:new Date().toISOString(),updated_at:new Date().toISOString()};
      const {data,error:saveError}=await supabase.from("student_memory_progress").upsert(payload,{onConflict:"student_id,card_id"}).select("card_id,is_mastered,mastered_at,review_count,last_reviewed_at").single();
      if(saveError)throw saveError;
      setProgress(p=>({...p,[card.id]:data as MemoryProgress}));setNotice("Card moved back to active review.");
    }catch(e){setError(e instanceof Error?e.message:"Unable to update mastery.");}
    finally{setSaving(false);}
  };

  const text=(en:string,hi:string)=>language==="hi"?hi:en;

  return <main className="vault-app">
    <header className="vault-topbar">
      <Link href="/" className="vault-brand"><span>✳</span><b>GYANKUNJ</b><small>COSMIC UPSC PORTAL</small></Link>
      <div className="vault-language"><button className={language==="hi"?"active":""} onClick={()=>setLanguage("hi")}>हिन्दी</button><button className={language==="en"?"active":""} onClick={()=>setLanguage("en")}>ENG</button></div>
      <span className="vault-top-label">SPACED REPETITION</span>
    </header>
    <div className="vault-wrap">
      <div className="vault-return"><Link href="/">← &nbsp;{text("RETURN TO DASHBOARD","डैशबोर्ड पर वापस जाएँ")}</Link><strong>{masteredCount} {text("of","में से")} {cards.length} {text("Mastered","मास्टर्ड")}</strong></div>
      <section className="vault-hero">
        <span className="vault-eyebrow">SPACED REPETITION ENGINE</span>
        <div className="vault-title-row"><div><h1>{text("Memory","मेमोरी")} <em>{text("Vault","वॉल्ट")}</em></h1><p>{text("Master high-yield Articles, landmark Amendments, and critical data points through active retrieval practice.","महत्त्वपूर्ण अनुच्छेदों, ऐतिहासिक संशोधनों और परीक्षा-उपयोगी तथ्यों को सक्रिय स्मरण अभ्यास से याद रखें।")}</p></div><div className="vault-card-index"><strong>{card?index+1:0}<small>/{filtered.length}</small></strong><span>CARD INDEX</span></div></div>
        <div className="vault-stats"><span>{masteredCount}/{cards.length} MASTERED</span><span>{xp} VAULT XP</span><span>{cards.length-masteredCount} TO REVIEW</span></div>
      </section>
      <nav className="vault-categories" aria-label="Memory card categories">{categories.map(c=><button key={c.id} className={category===c.id?"active":""} onClick={()=>selectCategory(c.id)}>{c.label}</button>)}</nav>
      {loading?<div className="vault-state">Loading your Memory Vault…</div>:error&&!cards.length?<div className="vault-state" role="alert">{error}<button onClick={()=>void load()}>Retry</button></div>:!card?<div className="vault-state">{text("No published memory cards yet. Ask your administrator to publish a card set.","अभी कोई मेमोरी कार्ड प्रकाशित नहीं है। एडमिन से कार्ड प्रकाशित करने को कहें।")}</div>:<>
        <button type="button" className={"vault-flashcard"+(flipped?" is-flipped":"")} onClick={()=>setFlipped(v=>!v)} aria-label={flipped?"Show question":"Reveal answer"}>
          <span className="vault-card-top"><span>{text(card.category_label_en,card.category_label_hi)} · UPSC PRELIMS REPEATED</span><span>✧ {text("TAP TO FLIP","पलटने के लिए टैप करें")}</span></span>
          {!flipped?<span className="vault-card-content"><small>{text("PROMPT / CONCEPT","प्रश्न / अवधारणा")}</small><strong>{text(card.prompt_en,card.prompt_hi)}</strong><em>{text(card.prompt_hi,card.prompt_en)}</em></span>:<span className="vault-card-content vault-answer"><small>{text("RECALL / ANSWER","उत्तर / स्मरण")}</small><strong>{text(card.answer_en,card.answer_hi)}</strong><em>{text(card.answer_hi,card.answer_en)}</em><p>{text(card.rationale_en||"",card.rationale_hi||"")}</p></span>}
          <span className="vault-card-foot"><span>{currentProgress?.is_mastered?"✓ "+text("MASTERED","मास्टर्ड"):text("ACTIVE REVIEW REQUIRED","सक्रिय पुनरावृत्ति आवश्यक")}</span><span>{flipped?text("TAP TO RETURN","वापस जाने के लिए टैप करें"):text("TAP ANYWHERE TO REVEAL ANSWER","उत्तर देखने के लिए कहीं भी टैप करें")}</span></span>
        </button>
        {notice&&<p className="vault-notice" role="status">{notice}</p>}
        {error&&<p className="vault-error" role="alert">{error}</p>}
        <div className="vault-controls"><button onClick={()=>move(index-1)} disabled={index===0}>‹ &nbsp;{text("PREV","पिछला")}</button><div>{currentProgress?.is_mastered?<button className="vault-mastered" onClick={()=>void undoMastery()} disabled={saving}>✓ {text("MASTERED","मास्टर्ड")}<small>{text("Undo","वापस लें")}</small></button>:<button className="vault-mark" onClick={()=>void reviewCard()} disabled={saving||!flipped}>{saving?text("SAVING…","सेव हो रहा है…"):<>✓ {text("MARK AS MASTERED","मास्टर्ड के रूप में चिह्नित")}<small>(+10 XP)</small></>}</button>}</div><button onClick={()=>move(index+1)} disabled={index===filtered.length-1}>{text("NEXT","अगला")} &nbsp;›</button></div>
        <div className="vault-progress-track"><i style={{width:(cards.length?masteredCount/cards.length*100:0)+"%"}}/></div>
      </>}
      <footer className="vault-footer"><span>GYANKUNJ · CIVILPREP</span><span>RECALL · REPEAT · RETAIN</span></footer>
    </div>
    <nav className="vault-bottom-nav" aria-label="Student navigation">
      <Link href="/">◉<small>Universe</small></Link><Link href="/practice/daily">◎<small>Drill</small></Link><Link href="/current-affairs">▤<small>Editorial</small></Link><Link href="/vault" className="active">✧<small>Vault</small></Link><Link href="/library">▥<small>Library</small></Link><Link href="/progress">↗<small>Progress</small></Link><Link href="/syllabus">◉<small>Syllabus</small></Link>
    </nav>
  </main>;
}

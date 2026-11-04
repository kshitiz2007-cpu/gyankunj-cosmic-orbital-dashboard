"use client";

import {useCallback,useEffect,useState} from "react";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import "./memory-vault-manager.css";

type MemoryCard={
 id:string;category:string;category_label_en:string;category_label_hi:string;
 prompt_en:string|null;prompt_hi:string|null;answer_en:string|null;answer_hi:string|null;
 rationale_en:string|null;rationale_hi:string|null;exam_tags:string[];sort_order:number;
 is_published:boolean;image_path:string|null;created_at:string;
};
type FormState={
 category:string;category_label_en:string;category_label_hi:string;
 prompt_en:string;prompt_hi:string;answer_en:string;answer_hi:string;
 rationale_en:string;rationale_hi:string;exam_tags:string;sort_order:string;
};
const emptyForm:FormState={
 category:"important-articles",category_label_en:"Important Constitutional Articles",category_label_hi:"महत्त्वपूर्ण संवैधानिक अनुच्छेद",
 prompt_en:"",prompt_hi:"",answer_en:"",answer_hi:"",rationale_en:"",rationale_hi:"",
 exam_tags:"UPSC Prelims, Polity",sort_order:"0"
};

export default function MemoryVaultManager(){
 const [cards,setCards]=useState<MemoryCard[]>([]);
 const [form,setForm]=useState<FormState>(emptyForm);
 const [editingId,setEditingId]=useState<string|null>(null);
 const [imageFile,setImageFile]=useState<File|null>(null);
 const [imagePreview,setImagePreview]=useState("");
 const [removeImage,setRemoveImage]=useState(false);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [query,setQuery]=useState("");
 const [filter,setFilter]=useState("all");
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");

 const loadCards=useCallback(async()=>{
  setLoading(true);setError("");
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setError("Supabase client is unavailable.");setLoading(false);return;}
  const {data,error:loadError}=await supabase.from("memory_cards").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false});
  if(loadError)setError(loadError.message);else setCards((data||[]) as MemoryCard[]);
  setLoading(false);
 },[]);
 useEffect(()=>{void loadCards();},[loadCards]);

 useEffect(()=>{
  if(!imageFile)return;
  const url=URL.createObjectURL(imageFile);setImagePreview(url);
  return()=>URL.revokeObjectURL(url);
 },[imageFile]);

 const setField=(key:keyof FormState,value:string)=>setForm(p=>({...p,[key]:value}));
 const reset=()=>{setForm(emptyForm);setEditingId(null);setImageFile(null);setImagePreview("");setRemoveImage(false);};
 const edit=(card:MemoryCard)=>{
  setEditingId(card.id);
  setForm({
   category:card.category,category_label_en:card.category_label_en,category_label_hi:card.category_label_hi,
   prompt_en:card.prompt_en||"",prompt_hi:card.prompt_hi||"",answer_en:card.answer_en||"",answer_hi:card.answer_hi||"",
   rationale_en:card.rationale_en||"",rationale_hi:card.rationale_hi||"",
   exam_tags:(card.exam_tags||[]).join(", "),sort_order:String(card.sort_order||0)
  });
  setImageFile(null);setImagePreview("");setRemoveImage(false);
  if(card.image_path){
   const supabase=getSupabaseBrowserClient();
   void supabase?.storage.from("memory-card-images").createSignedUrl(card.image_path,3600).then(({data})=>setImagePreview(data?.signedUrl||""));
  }
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const save=async(publish:boolean)=>{
  const existingImage=Boolean(editingId&&cards.find(c=>c.id===editingId)?.image_path&&!removeImage);
  const hasText=[form.prompt_en,form.prompt_hi,form.answer_en,form.answer_hi,form.rationale_en,form.rationale_hi].some(value=>value.trim().length>0);
  if(!imageFile&&!existingImage&&!hasText){setError("Add an image, question, answer or explanation before saving.");return;}
  if(imageFile&&(!["image/jpeg","image/png","image/webp"].includes(imageFile.type)||imageFile.size>8*1024*1024)){
   setError("Choose JPG, PNG or WEBP up to 8 MB.");return;
  }
  const supabase=getSupabaseBrowserClient();if(!supabase){setError("Supabase client is unavailable.");return;}
  setSaving(true);setError("");setNotice("");
  try{
   const payload={
    category:form.category.trim()||"general",
    category_label_en:form.category_label_en.trim()||"General Revision",
    category_label_hi:form.category_label_hi.trim()||"सामान्य पुनरावृत्ति",
    prompt_en:form.prompt_en.trim()||null,prompt_hi:form.prompt_hi.trim()||null,
    answer_en:form.answer_en.trim()||null,answer_hi:form.answer_hi.trim()||null,
    rationale_en:form.rationale_en.trim()||null,rationale_hi:form.rationale_hi.trim()||null,
    exam_tags:form.exam_tags.split(",").map(x=>x.trim()).filter(Boolean),
    sort_order:Number(form.sort_order)||0,updated_at:new Date().toISOString()
   };
   let cardId=editingId;
   if(cardId){
    const {error:updateError}=await supabase.from("memory_cards").update(payload).eq("id",cardId);
    if(updateError)throw updateError;
   }else{
    const {data,error:insertError}=await supabase.from("memory_cards").insert({...payload,is_published:false}).select("id").single();
    if(insertError)throw insertError;cardId=data.id;
   }
   if(!cardId)throw new Error("Card ID was not returned.");
   let imagePath=cards.find(c=>c.id===cardId)?.image_path||null;
   if(imageFile){
    const ext=imageFile.type==="image/png"?"png":imageFile.type==="image/webp"?"webp":"jpg";
    const nextPath=cardId+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,8)+"."+ext;
    const {error:uploadError}=await supabase.storage.from("memory-card-images").upload(nextPath,imageFile,{contentType:imageFile.type,cacheControl:"3600",upsert:false});
    if(uploadError)throw uploadError;
    imagePath=nextPath;
    const {error:pathError}=await supabase.from("memory_cards").update({image_path:imagePath}).eq("id",cardId);
    if(pathError)throw pathError;
    const previous=cards.find(c=>c.id===cardId)?.image_path;
    if(previous)await supabase.storage.from("memory-card-images").remove([previous]);
   }else if(removeImage){
    const previous=cards.find(c=>c.id===cardId)?.image_path;
    const {error:pathError}=await supabase.from("memory_cards").update({image_path:null}).eq("id",cardId);
    if(pathError)throw pathError;
    imagePath=null;
    if(previous)await supabase.storage.from("memory-card-images").remove([previous]);
   }
   const {error:publishError}=await supabase.from("memory_cards").update({is_published:publish,updated_at:new Date().toISOString()}).eq("id",cardId);
   if(publishError)throw publishError;
   setNotice(publish?"Card published to the student Memory Vault.":"Card saved as draft.");
   reset();await loadCards();
  }catch(e){const detail=e instanceof Error?e.message:"Unknown Supabase error";setError("Card was not published. "+detail+(detail.toLowerCase().includes("bucket")?" — run migration 0012 to create the image bucket.":""));}
  finally{setSaving(false);}
 };

 const togglePublish=async(card:MemoryCard)=>{
  const supabase=getSupabaseBrowserClient();if(!supabase)return;
  const {error:updateError}=await supabase.from("memory_cards").update({is_published:!card.is_published,updated_at:new Date().toISOString()}).eq("id",card.id);
  if(updateError){setError(updateError.message);return;}
  setCards(p=>p.map(c=>c.id===card.id?{...c,is_published:!card.is_published}:c));
  setNotice(card.is_published?"Card unpublished.":"Card published.");
 };
 const deleteCard=async(card:MemoryCard)=>{
  if(!window.confirm("Delete this Memory Vault card and its student progress permanently?"))return;
  const supabase=getSupabaseBrowserClient();if(!supabase)return;
  const {error:deleteError}=await supabase.from("memory_cards").delete().eq("id",card.id);
  if(deleteError){setError(deleteError.message);return;}
  if(card.image_path)await supabase.storage.from("memory-card-images").remove([card.image_path]);
  setCards(p=>p.filter(c=>c.id!==card.id));setNotice("Card deleted.");
 };
 const visible=cards.filter(c=>(filter==="all"||(filter==="published"?c.is_published:!c.is_published))&&(c.prompt_en+" "+c.prompt_hi+" "+c.category).toLowerCase().includes(query.toLowerCase()));

 return <section className="mv-admin">
  <div className="mv-admin-intro"><div><span className="admin-kicker">SPACED REPETITION CONTENT STUDIO</span><h2>Build the <em>Memory Vault.</em></h2><p>Create bilingual flashcards, attach images or diagrams, and publish them instantly to student revision.</p></div><div className="mv-admin-count"><strong>{cards.length}</strong><span>TOTAL CARDS</span><b>{cards.filter(c=>c.is_published).length} PUBLISHED</b></div></div>
  {notice&&<p className="mv-admin-notice" role="status">{notice}</p>}{error&&<p className="mv-admin-error" role="alert">{error}</p>}
  <div className="mv-admin-builder">
   <div className="mv-admin-builder-head"><div><span className="admin-kicker">{editingId?"EDIT MEMORY CARD":"NEW MEMORY CARD"}</span><h3>{editingId?"Update a":"Create a"} <em>recall card.</em></h3></div><span className="admin-draft-chip">ENGLISH + HINDI</span></div>
   <div className="mv-admin-grid">
    <label>CATEGORY SLUG<input value={form.category} onChange={e=>setField("category",e.target.value)} placeholder="important-articles"/></label>
    <label>CATEGORY LABEL (EN)<input value={form.category_label_en} onChange={e=>setField("category_label_en",e.target.value)}/></label>
    <label>CATEGORY LABEL (HI)<input value={form.category_label_hi} onChange={e=>setField("category_label_hi",e.target.value)}/></label>
    <label>EXAM TAGS <input value={form.exam_tags} onChange={e=>setField("exam_tags",e.target.value)} placeholder="UPSC Prelims, Polity"/></label>
    <label className="mv-admin-wide">PROMPT / QUESTION (EN) · OPTIONAL<textarea rows={3} value={form.prompt_en} onChange={e=>setField("prompt_en",e.target.value)} placeholder="Enter the recall question in English…"/></label>
    <label className="mv-admin-wide">प्रश्न / PROMPT (HI) · OPTIONAL<textarea rows={3} value={form.prompt_hi} onChange={e=>setField("prompt_hi",e.target.value)} placeholder="हिन्दी में प्रश्न लिखें…"/></label>
    <label>ANSWER (EN) · OPTIONAL<textarea rows={2} value={form.answer_en} onChange={e=>setField("answer_en",e.target.value)}/></label>
    <label>उत्तर (HI) · OPTIONAL<textarea rows={2} value={form.answer_hi} onChange={e=>setField("answer_hi",e.target.value)}/></label>
    <label>RATIONALE / EXPLANATION (EN)<textarea rows={4} value={form.rationale_en} onChange={e=>setField("rationale_en",e.target.value)} placeholder="Why is this answer correct?"/></label>
    <label>व्याख्या / RATIONALE (HI)<textarea rows={4} value={form.rationale_hi} onChange={e=>setField("rationale_hi",e.target.value)} placeholder="उत्तर का कारण और परीक्षा-संदर्भ…"/></label>
    <label>SORT ORDER<input type="number" value={form.sort_order} onChange={e=>setField("sort_order",e.target.value)}/></label>
   </div>
   <div className="mv-admin-image">
    <div><b>VISUAL MEMORY / IMAGE</b><small>Attach a diagram, map, timeline, constitutional chart or other visual aid.</small></div>
    <label className="mv-image-picker"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{setImageFile(e.target.files?.[0]||null);setRemoveImage(false);}}/>＋ Upload card image</label>
    {imagePreview&&<div className="mv-image-preview"><img src={imagePreview} alt="Memory card preview"/><button type="button" onClick={()=>{setImageFile(null);setImagePreview("");setRemoveImage(true);}}>Remove image</button></div>}
    <small>JPG · PNG · WEBP · Maximum 8 MB. Images are private and shown to signed-in students.</small>
   </div>
   {(error||notice)&&<div className={error?"mv-inline-feedback mv-inline-error":"mv-inline-feedback mv-inline-success"} role={error?"alert":"status"}>{error||notice}</div>}
   <div className="mv-admin-actions"><span>{editingId?"Changes apply to this card":"All text fields are optional. Add an image, question or answer as needed."}</span>{editingId&&<button type="button" className="mv-secondary" onClick={reset}>Cancel</button>}<button type="button" disabled={saving} onClick={()=>void save(false)}>{saving?"Saving…":"Save draft"}</button><button type="button" className="mv-publish" disabled={saving} onClick={()=>void save(true)}>{saving?"Saving…":"Publish to students ↗"}</button></div>
  </div>
  <div className="mv-admin-list-head"><div><span className="admin-kicker">CONTENT LIBRARY</span><h3>Card <em>management.</em></h3></div><div className="mv-admin-filters"><input aria-label="Search memory cards" placeholder="Search cards…" value={query} onChange={e=>setQuery(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All cards</option><option value="published">Published</option><option value="draft">Drafts</option></select></div></div>
  <div className="mv-admin-card-list">{visible.map(card=><article key={card.id} className="mv-admin-card-row">
   {card.image_path?<div className="mv-admin-thumb"><CardThumb path={card.image_path}/></div>:<div className="mv-admin-thumb mv-no-image">✧</div>}
   <div className="mv-admin-card-copy"><span>{card.category_label_en} · {card.category}</span><strong>{card.prompt_en}</strong><small lang="hi">{card.prompt_hi}</small><small>{card.exam_tags?.join(" · ")}</small></div>
   <div className="mv-admin-card-actions"><span className={card.is_published?"mv-status-published":"mv-status-draft"}>{card.is_published?"Published":"Draft"}</span><button onClick={()=>edit(card)}>Edit</button><button onClick={()=>void togglePublish(card)}>{card.is_published?"Unpublish":"Publish"}</button><button onClick={()=>void deleteCard(card)}>Delete</button></div>
  </article>)}{loading&&<p className="admin-empty">Loading Memory Vault cards…</p>}{!loading&&visible.length===0&&<p className="admin-empty">No cards found. Create your first card above.</p>}</div>
 </section>;
}

function CardThumb({path}:{path:string}){
 const [url,setUrl]=useState("");
 useEffect(()=>{let active=true;const supabase=getSupabaseBrowserClient();void supabase?.storage.from("memory-card-images").createSignedUrl(path,3600).then(({data})=>{if(active)setUrl(data?.signedUrl||"");});return()=>{active=false;};},[path]);
 return url?<img src={url} alt="Card visual"/>:<span>IMAGE</span>;
}

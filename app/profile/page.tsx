"use client";

import "./profile.css";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
import type {Profile} from "@/types/database";

type Activity={id:string;activity_type:string;metadata:Record<string,unknown>;created_at:string};
export default function StudentProfile(){
 const router=useRouter();
 const [tab,setTab]=useState("Overview");
 const [profile,setProfile]=useState<Profile|null>(null);
 const [activities,setActivities]=useState<Activity[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [name,setName]=useState("");
 const [exam,setExam]=useState("UPSC CSE");
 const [language,setLanguage]=useState("hi-en");
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [learningStats,setLearningStats]=useState({streak:0,attempts:0,topics:0,accuracy:0});
 const [avatarUrl,setAvatarUrl]=useState("");
 const [uploadingAvatar,setUploadingAvatar]=useState(false);

 useEffect(()=>{
  let active=true;
  const load=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){if(active){setError("Supabase configuration is missing.");setLoading(false);}return;}
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError||!user){router.replace("/login");return;}
   const since=new Date(Date.now()-366*86400000).toISOString();
   const [{data:row,error:profileError},{data:activityRows},{data:attemptRows,error:attemptError},{count:topicCount,error:topicError}]=await Promise.all([
    supabase.from("profiles").select("*").eq("id",user.id).maybeSingle(),
    supabase.from("student_activity").select("id,activity_type,metadata,created_at").eq("student_id",user.id).order("created_at",{ascending:false}).limit(6),
    supabase.from("assessment_attempts").select("assessment_id,answers,submitted_at,correct_count,answered_count").eq("student_id",user.id).not("submitted_at","is",null).gte("submitted_at",since),
    supabase.from("student_topic_progress").select("id",{count:"exact",head:true}).eq("student_id",user.id).eq("exam_key","upsc-cse")
   ]);
   if(attemptError)throw attemptError;
   if(topicError)throw topicError;
   const attempts=attemptRows||[];
   let answered=0,correct=0;
   for(const attempt of attempts){
    answered+=Number(attempt.answered_count)||Object.keys(attempt.answers||{}).length;
    correct+=Number(attempt.correct_count)||0;
   }
   const dateFmt=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"});
   const dateKey=(value:Date)=>{const parts=dateFmt.formatToParts(value);const get=(type:string)=>parts.find(part=>part.type===type)?.value||"";return get("year")+"-"+get("month")+"-"+get("day");};
   const activeDates=new Set<string>();
   for(const activity of activityRows||[])if(activity.created_at)activeDates.add(dateKey(new Date(activity.created_at)));
   const {data:streakActivities,error:streakError}=await supabase.from("student_activity").select("created_at").eq("student_id",user.id).gte("created_at",since);
   if(streakError)throw streakError;
   for(const activity of streakActivities||[])if(activity.created_at)activeDates.add(dateKey(new Date(activity.created_at)));
   for(const attempt of attempts)if(attempt.submitted_at)activeDates.add(dateKey(new Date(attempt.submitted_at)));
   const today=dateKey(new Date()),[yy,mm,dd]=today.split("-").map(Number);
   let cursor=activeDates.has(today)?today:dateKey(new Date(Date.UTC(yy,mm-1,dd)-86400000));
   if(!activeDates.has(cursor))cursor="";
   let streak=0;
   while(cursor&&activeDates.has(cursor)){streak++;const [y,m,d]=cursor.split("-").map(Number);cursor=dateKey(new Date(Date.UTC(y,m-1,d)-86400000));}
   if(active)setLearningStats({streak,attempts:attempts.length,topics:topicCount||0,accuracy:answered?Math.round(correct/answered*100):0});
   if(!active)return;
   if(profileError){setError(profileError.message);setLoading(false);return;}
   const current=(row as Profile|null);
   setProfile(current);
   setName(current?.full_name||user.user_metadata?.full_name||"");
   setExam(current?.exam_target||"UPSC CSE");
   setLanguage(current?.preferred_language||"hi-en");
   setActivities((activityRows||[]) as Activity[]);
   setLoading(false);
  };
  void load();
  const supabase=getSupabaseBrowserClient();
  const {data:{subscription}}=supabase?.auth.onAuthStateChange((_event,session)=>{
   if(!session)router.replace("/login");
  })??{data:{subscription:null}};
  return()=>{active=false;subscription?.unsubscribe();};
 },[router]);

 useEffect(()=>{
  let active=true;
  const loadAvatar=async()=>{
   const path=profile?.avatar_path;
   if(!path){setAvatarUrl("");return;}
   const supabase=getSupabaseBrowserClient();if(!supabase)return;
   const {data,error:avatarError}=await supabase.storage.from("profile-avatars").createSignedUrl(path,60*60*24*7);
   if(active){if(avatarError){setAvatarUrl("");setError(avatarError.message);}else setAvatarUrl(data.signedUrl);}
  };
  void loadAvatar();
  return()=>{active=false;};
 },[profile?.avatar_path]);

 const uploadAvatar=async(file?:File)=>{
  if(!file)return;
  setError("");setNotice("");
  if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Choose a JPG, PNG or WEBP image.");return;}
  if(file.size>5*1024*1024){setError("Profile picture must be 5 MB or smaller.");return;}
  const supabase=getSupabaseBrowserClient();if(!supabase||!profile){setError("Your profile session is not ready. Please refresh and try again.");return;}
  setUploadingAvatar(true);
  try{
   const {data:{user},error:authError}=await supabase.auth.getUser();
   if(authError||!user)throw new Error("Your sign-in session has expired. Please sign in again.");
   const extension=file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const path=user.id+"/"+Date.now()+"-"+Math.random().toString(36).slice(2,8)+"."+extension;
   const {error:uploadError}=await supabase.storage.from("profile-avatars").upload(path,file,{contentType:file.type,cacheControl:"3600",upsert:false});
   if(uploadError)throw uploadError;
   const previousPath=profile.avatar_path||null;
   const {data:updatedProfile,error:updateError}=await supabase.from("profiles").update({avatar_path:path,updated_at:new Date().toISOString()}).eq("id",user.id).select("*").single();
   if(updateError){await supabase.storage.from("profile-avatars").remove([path]);throw updateError;}
   setProfile(updatedProfile as Profile);
   const {data:signed,error:signedError}=await supabase.storage.from("profile-avatars").createSignedUrl(path,60*60*24*7);
   if(signedError)throw signedError;
   setAvatarUrl(signed.signedUrl);
   if(previousPath)await supabase.storage.from("profile-avatars").remove([previousPath]);
   setNotice("Profile picture updated successfully.");
  }catch(uploadError){setError(uploadError instanceof Error?uploadError.message:"Unable to upload profile picture.");}
  finally{setUploadingAvatar(false);}
 };

 const removeAvatar=async()=>{
  const supabase=getSupabaseBrowserClient();if(!supabase||!profile?.avatar_path)return;
  setUploadingAvatar(true);setError("");setNotice("");
  try{
   const path=profile.avatar_path;
   const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error("Please sign in again.");
   const {data:updatedProfile,error:updateError}=await supabase.from("profiles").update({avatar_path:null,updated_at:new Date().toISOString()}).eq("id",user.id).select("*").single();
   if(updateError)throw updateError;
   setProfile(updatedProfile as Profile);setAvatarUrl("");
   const {error:removeError}=await supabase.storage.from("profile-avatars").remove([path]);
   if(removeError)setNotice("Picture removed from your profile; old file cleanup will need a retry.");
   else setNotice("Profile picture removed.");
  }catch(removeError){setError(removeError instanceof Error?removeError.message:"Unable to remove profile picture.");}
  finally{setUploadingAvatar(false);}
 };

 const save=async()=>{
  const supabase=getSupabaseBrowserClient();if(!supabase||!profile)return;
  setSaving(true);setError("");setNotice("");
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){router.replace("/login");return;}
  const {data,error:saveError}=await supabase.from("profiles").update({full_name:name.trim(),exam_target:exam,preferred_language:language,updated_at:new Date().toISOString()}).eq("id",user.id).select("*").single();
  if(saveError)setError(saveError.message);else{setProfile(data as Profile);setNotice("Your profile has been saved.");}
  setSaving(false);
 };
 const signOut=async()=>{const supabase=getSupabaseBrowserClient();await supabase?.auth.signOut();router.replace("/login");router.refresh();};
 if(loading)return <main className="profile-app"><div className="profile-wrap"><p>Loading your secure student profile…</p></div></main>;
 if(error&&!profile)return <main className="profile-app"><div className="profile-wrap"><p role="alert">{error}</p><Link href="/login">Go to sign in</Link></div></main>;

 const displayName=profile?.full_name||name||"Student";
 const initials=displayName.split(" ").filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join("")||"GK";
 return <main className="profile-app"><header className="profile-top"><Link href="/" className="profile-back">← GYANKUNJ</Link><span>STUDENT SPACE / PROFILE</span><button className="profile-state" onClick={signOut}>SIGN OUT ↗</button></header><div className="profile-wrap">
 <section className="profile-hero"><div className="profile-avatar">{avatarUrl?<img src={avatarUrl} alt="Your profile picture" className="profile-avatar-image"/>:initials}<span className="profile-avatar-mark">✳</span><label className="profile-avatar-change" htmlFor="profile-avatar-input">{uploadingAvatar?"Uploading…":"Change photo"}</label><input id="profile-avatar-input" className="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={e=>{const file=e.target.files?.[0];void uploadAvatar(file);e.currentTarget.value="";}}/></div><div className="profile-identity"><span className="profile-kicker">YOUR LEARNING IDENTITY</span><h1>{displayName.split(" ")[0]} <em>{displayName.split(" ").slice(1).join(" ")}</em></h1><p>{profile?.email||"Your registered account"}</p><div className="profile-tags"><span>{profile?.exam_target||"EXAM TARGET NOT SET"}</span><span>{profile?.role==="admin"?"ADMINISTRATOR":profile?.role==="faculty"?"FACULTY":"STUDENT"}</span></div></div><div className="profile-streak"><b>{activities.length}</b><span>RECENT ACTIVITIES</span></div></section>
 <section className="profile-stats"><article><small>LEARNING STREAK</small><b>{learningStats.streak}</b><span>Consecutive active days</span></article><article><small>TESTS SUBMITTED</small><b>{learningStats.attempts}</b><span>Saved assessment attempts</span></article><article><small>SYLLABUS COMPLETED</small><b>{learningStats.topics}</b><span>Topics checked off</span></article><article><small>ACCURACY</small><b>{learningStats.accuracy}%</b><span>Across answered questions</span></article></section>
 <div className="profile-tabs">{["Overview","Personal details","Preferences"].map(t=><button key={t} className={tab===t?"active":""} onClick={()=>{setTab(t);setNotice("");}}>{t}</button>)}</div>
 {tab==="Overview"&&<section className="profile-content-grid"><div className="profile-panel"><span className="profile-kicker">RECENT LEARNING</span><h2>Your activity <em>trail.</em></h2>{activities.length?activities.map((item,i)=><div className="profile-activity" key={item.id}><span>0{i+1}</span><div><b>{item.activity_type.replace(/_/g," ")}</b><small>{new Date(item.created_at).toLocaleString()}</small></div><strong>Recorded</strong></div>):<p>No learning activity yet. Complete a Daily Drill or study a resource to see your real activity here.</p>}</div><div className="profile-panel profile-goals"><span className="profile-kicker">YOUR NORTH STAR</span><h2>Consistency<br/><em>over intensity.</em></h2><p>This profile is now reading your signed-in account from Supabase. Your progress metrics will populate as real activity is connected to the platform.</p><div className="profile-data-note">◈ LIVE ACCOUNT · SUPABASE AUTH · ROLE: {(profile?.role||"student").toUpperCase()}</div>{profile?.role==="admin"&&<Link href="/admin">Open Admin Command Center ↗</Link>}<Link href="/library">Explore study library ↗</Link></div></section>}
 {tab==="Personal details"&&<section className="profile-form-panel"><div><span className="profile-kicker">ACCOUNT / IDENTITY</span><h2>Personal <em>details.</em></h2><p>Your name, exam target and profile picture are stored securely in your Supabase profile.</p><div className="profile-avatar-settings">{avatarUrl?<img src={avatarUrl} alt="Current profile picture"/>:<span>{initials}</span>}<div><label className="profile-avatar-upload-button" htmlFor="profile-avatar-settings-input">{uploadingAvatar?"Uploading…":"Upload new picture"}</label><input id="profile-avatar-settings-input" className="profile-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadingAvatar} onChange={e=>{const file=e.target.files?.[0];void uploadAvatar(file);e.currentTarget.value="";}}/>{profile?.avatar_path&&<button type="button" className="profile-avatar-remove" disabled={uploadingAvatar} onClick={()=>void removeAvatar()}>Remove picture</button>}<small>JPG, PNG or WEBP · maximum 5 MB</small></div></div></div><label>FULL NAME<input value={name} onChange={e=>setName(e.target.value)}/></label><label>EMAIL ADDRESS<input type="email" value={profile?.email||""} disabled/></label><div className="profile-form-actions"><button disabled={saving} onClick={save}>{saving?"Saving…":"Save profile"}</button></div></section>}
 {tab==="Preferences"&&<section className="profile-form-panel"><span className="profile-kicker">LEARNING PREFERENCES</span><h2>Set your <em>rhythm.</em></h2><label>PREPARATION TARGET<select value={exam} onChange={e=>setExam(e.target.value)}><option>UPSC CSE</option><option>State PCS</option><option>SSC</option></select></label><label>CONTENT LANGUAGE<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="hi-en">Hindi + English</option><option value="hi">Hindi</option><option value="en">English</option></select></label><div className="profile-form-actions"><button disabled={saving} onClick={save}>{saving?"Saving…":"Save preferences"}</button></div></section>}
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <footer className="profile-footer"><span>GYANKUNJ · CIVILPREP</span><Link href="/">← BACK TO DASHBOARD</Link><span>CONNECTED STUDENT PROFILE</span></footer></div></main>;
}

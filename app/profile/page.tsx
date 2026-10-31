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
 <section className="profile-hero"><div className="profile-avatar">{initials}<span>✳</span></div><div className="profile-identity"><span className="profile-kicker">YOUR LEARNING IDENTITY</span><h1>{displayName.split(" ")[0]} <em>{displayName.split(" ").slice(1).join(" ")}</em></h1><p>{profile?.email||"Your registered account"}</p><div className="profile-tags"><span>{profile?.exam_target||"EXAM TARGET NOT SET"}</span><span>{profile?.role==="admin"?"ADMINISTRATOR":profile?.role==="faculty"?"FACULTY":"STUDENT"}</span></div></div><div className="profile-streak"><b>{activities.length}</b><span>RECENT ACTIVITIES</span></div></section>
 <section className="profile-stats"><article><small>LEARNING STREAK</small><b>{learningStats.streak}</b><span>Consecutive active days</span></article><article><small>TESTS SUBMITTED</small><b>{learningStats.attempts}</b><span>Saved assessment attempts</span></article><article><small>SYLLABUS COMPLETED</small><b>{learningStats.topics}</b><span>Topics checked off</span></article><article><small>ACCURACY</small><b>{learningStats.accuracy}%</b><span>Across answered questions</span></article></section>
 <div className="profile-tabs">{["Overview","Personal details","Preferences"].map(t=><button key={t} className={tab===t?"active":""} onClick={()=>{setTab(t);setNotice("");}}>{t}</button>)}</div>
 {tab==="Overview"&&<section className="profile-content-grid"><div className="profile-panel"><span className="profile-kicker">RECENT LEARNING</span><h2>Your activity <em>trail.</em></h2>{activities.length?activities.map((item,i)=><div className="profile-activity" key={item.id}><span>0{i+1}</span><div><b>{item.activity_type.replace(/_/g," ")}</b><small>{new Date(item.created_at).toLocaleString()}</small></div><strong>Recorded</strong></div>):<p>No learning activity yet. Complete a Daily Drill or study a resource to see your real activity here.</p>}</div><div className="profile-panel profile-goals"><span className="profile-kicker">YOUR NORTH STAR</span><h2>Consistency<br/><em>over intensity.</em></h2><p>This profile is now reading your signed-in account from Supabase. Your progress metrics will populate as real activity is connected to the platform.</p><div className="profile-data-note">◈ LIVE ACCOUNT · SUPABASE AUTH · ROLE: {(profile?.role||"student").toUpperCase()}</div>{profile?.role==="admin"&&<Link href="/admin">Open Admin Command Center ↗</Link>}<Link href="/library">Explore study library ↗</Link></div></section>}
 {tab==="Personal details"&&<section className="profile-form-panel"><div><span className="profile-kicker">ACCOUNT / IDENTITY</span><h2>Personal <em>details.</em></h2><p>Your name and exam target are stored in your Supabase profile.</p></div><label>FULL NAME<input value={name} onChange={e=>setName(e.target.value)}/></label><label>EMAIL ADDRESS<input type="email" value={profile?.email||""} disabled/></label><div className="profile-form-actions"><button disabled={saving} onClick={save}>{saving?"Saving…":"Save profile"}</button></div></section>}
 {tab==="Preferences"&&<section className="profile-form-panel"><span className="profile-kicker">LEARNING PREFERENCES</span><h2>Set your <em>rhythm.</em></h2><label>PREPARATION TARGET<select value={exam} onChange={e=>setExam(e.target.value)}><option>UPSC CSE</option><option>State PCS</option><option>SSC</option></select></label><label>CONTENT LANGUAGE<select value={language} onChange={e=>setLanguage(e.target.value)}><option value="hi-en">Hindi + English</option><option value="hi">Hindi</option><option value="en">English</option></select></label><div className="profile-form-actions"><button disabled={saving} onClick={save}>{saving?"Saving…":"Save preferences"}</button></div></section>}
 {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
 <footer className="profile-footer"><span>GYANKUNJ · CIVILPREP</span><Link href="/">← BACK TO DASHBOARD</Link><span>CONNECTED STUDENT PROFILE</span></footer></div></main>;
}

"use client";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {getSupabaseBrowserClient} from "@/lib/supabase/client";
export default function AuthCallbackPage(){
 const router=useRouter();
 const [message,setMessage]=useState("Completing secure sign in…");
 useEffect(()=>{
  let active=true;
  const complete=async()=>{
   const supabase=getSupabaseBrowserClient();
   if(!supabase){setMessage("Authentication service is unavailable. Please return to sign in.");return;}
   const params=new URLSearchParams(window.location.search);
   const code=params.get("code");
   if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;}
   const {data,error}=await supabase.auth.getSession();
   if(error)throw error;
   if(!data.session)throw new Error("Google sign-in did not create a session. Please try again.");
   const requested=params.get("next")||"/";
   const next=requested.startsWith("/")&&!requested.startsWith("//")?requested :"/";
   if(active){router.replace(next);router.refresh();}
  };
  void complete().catch(error=>{if(active)setMessage(error instanceof Error?error.message:"Unable to complete Google sign-in.");});
  return()=>{active=false;};
 },[router]);
 return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"linear-gradient(145deg,#fff4fa,#f1dce9)",color:"#421c3a",fontFamily:"sans-serif"}}><section style={{maxWidth:420,textAlign:"center",padding:32,borderRadius:24,background:"#fff9fd",border:"1px solid #e7c9da",boxShadow:"0 18px 50px #52204318"}}><div style={{fontSize:32,color:"#b43e86"}}>✳</div><h1 style={{fontSize:24,margin:"12px 0"}}>GYANKUNJ</h1><p>{message}</p></section></main>;
}

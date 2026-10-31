import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:NextRequest){
 try{
  const authorization=request.headers.get("authorization")||"";
  const token=authorization.startsWith("Bearer ")?authorization.slice(7):"";
  if(!token)return NextResponse.json({error:"Sign in to use the Study Companion."},{status:401});
  const body=await request.json();
  const question=typeof body.question==="string"?body.question.trim():"";
  if(question.length<3||question.length>2000)return NextResponse.json({error:"Enter a question between 3 and 2,000 characters."},{status:400});
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const apiKey=process.env.OPENAI_API_KEY;
  if(!url||!anon)return NextResponse.json({error:"Supabase server configuration is incomplete."},{status:503});
  if(!apiKey)return NextResponse.json({error:"AI service is not configured yet. Add OPENAI_API_KEY to the deployment environment."},{status:503});
  const supabase=createClient(url,anon,{auth:{persistSession:false,autoRefreshToken:false},global:{headers:{Authorization:"Bearer "+token}}});
  const {data:{user},error:authError}=await supabase.auth.getUser(token);
  if(authError||!user)return NextResponse.json({error:"Your session has expired. Please sign in again."},{status:401});

  const words: string[]=question.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter((word: string)=>word.length>2).slice(0,6);
  const filter=words.length?words.map((word: string)=>"title_en.ilike.%"+word+"%,title_hi.ilike.%"+word+"%,topic.ilike.%"+word+"%,content_text.ilike.%"+word+"%").join(","):"";
  let resourceQuery=supabase.from("study_resources").select("id,title_en,title_hi,topic,content_text,content_hi,category").eq("is_published",true).limit(6);
  if(filter)resourceQuery=resourceQuery.or(filter);
  const [resourceResult,editorialResult]=await Promise.all([
   resourceQuery,
   supabase.from("editorial_articles").select("slug,title_en,title_hi,summary_hi,content_hi,content_en,category").eq("is_published",true).order("published_at",{ascending:false,nullsFirst:false}).limit(4)
  ]);
  if(resourceResult.error)throw resourceResult.error;
  if(editorialResult.error)throw editorialResult.error;
  const sources=[
   ...(resourceResult.data||[]).map(item=>({type:"Study Library",title:item.title_hi||item.title_en,topic:item.topic||item.category||"Study notes",content:(item.content_hi||item.content_text||"").slice(0,5000)})),
   ...(editorialResult.data||[]).map(item=>({type:"Daily Editorial",title:item.title_hi||item.title_en,topic:item.category,content:(item.content_hi||item.content_en||item.summary_hi||"").slice(0,5000)}))
  ].filter(source=>source.content);
  if(!sources.length)return NextResponse.json({error:"No published study material was found to ground this answer. Try a topic available in your Study Library."},{status:404});

  const context=sources.map((source,index)=>"SOURCE "+(index+1)+" ["+source.type+"] "+source.title+" / "+source.topic+"\n"+source.content).join("\n\n");
  const aiResponse=await fetch("https://api.openai.com/v1/chat/completions",{
   method:"POST",
   headers:{"Content-Type":"application/json",Authorization:"Bearer "+apiKey},
   body:JSON.stringify({
    model:process.env.OPENAI_MODEL||"gpt-4.1-mini",
    temperature:0.25,
    messages:[
     {role:"system",content:"You are Gyankunj Study Companion for Indian competitive examination learners. Answer in the language of the question (Hindi if Hindi or Hinglish). Explain concepts clearly, structure exam-oriented answers, and distinguish facts from analysis. Use the supplied Gyankunj material as your primary evidence. Never invent a fact or source. If the supplied material does not support a detail, say so explicitly. End with a short 'Study sources' list naming only the supplied source titles. Do not claim to be an official examiner."},
     {role:"user",content:"STUDENT QUESTION:\n"+question+"\n\nPUBLISHED GYANKUNJ STUDY MATERIAL:\n"+context}
    ]
   })
  });
  const result=await aiResponse.json();
  if(!aiResponse.ok)return NextResponse.json({error:result.error?.message||"AI provider request failed."},{status:502});
  const answer=result.choices?.[0]?.message?.content;
  if(typeof answer!=="string"||!answer.trim())return NextResponse.json({error:"The AI service returned an empty response. Please try again."},{status:502});
  return NextResponse.json({answer:answer.trim(),sources:sources.map(({type,title,topic})=>({type,title,topic}))});
 }catch(error){
  return NextResponse.json({error:error instanceof Error?error.message:"Unable to process your question."},{status:500});
 }
}

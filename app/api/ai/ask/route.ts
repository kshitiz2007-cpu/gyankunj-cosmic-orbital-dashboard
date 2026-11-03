import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AI_TIMEOUT_MS = 18_000;
const MAX_CONTEXT_CHARS = 7_000;
const MAX_SOURCE_CHARS = 1_800;

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Sign in to use the Study Companion." }, { status: 401 });

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }
    const question = body && typeof body === "object" && "question" in body && typeof body.question === "string"
      ? body.question.trim()
      : "";
    if (question.length < 3 || question.length > 2000) {
      return NextResponse.json({ error: "Enter a question between 3 and 2,000 characters." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!url || !anon) return NextResponse.json({ error: "Study Companion is temporarily unavailable." }, { status: 503 });
    if (!apiKey) return NextResponse.json({ error: "Study Companion is not configured yet." }, { status: 503 });

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: "Bearer " + token } },
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

    const { data: allowed, error: limitError } = await supabase.rpc("consume_ai_request_quota", {
      p_window_seconds: 600,
      p_max_requests: 10,
    });
    if (limitError) {
      return NextResponse.json({ error: "Study Companion is temporarily unavailable. Please try again shortly." }, { status: 503 });
    }
    if (allowed !== true) {
      return NextResponse.json({ error: "You have reached the Study Companion limit (10 questions per 10 minutes). Please try again later." }, {
        status: 429,
        headers: { "Retry-After": "600" },
      });
    }

    const words = question.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(word => word.length > 2).slice(0, 6);
    const filter = words.length
      ? words.map(word => "title_en.ilike.%" + word + "%,title_hi.ilike.%" + word + "%,topic.ilike.%" + word + "%,content_text.ilike.%" + word + "%").join(",")
      : "";
    let resourceQuery = supabase.from("study_resources")
      .select("id,title_en,title_hi,topic,content_text,content_hi,category")
      .eq("is_published", true).limit(5);
    if (filter) resourceQuery = resourceQuery.or(filter);

    let editorialQuery = supabase.from("editorial_articles")
      .select("slug,title_en,title_hi,summary_hi,content_hi,content_en,category")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false }).limit(3);
    if (words.length) {
      editorialQuery = editorialQuery.or(words.map(word => "title_en.ilike.%" + word + "%,title_hi.ilike.%" + word + "%,summary_hi.ilike.%" + word + "%").join(","));
    }
    const [resourceResult, editorialResult] = await Promise.all([resourceQuery, editorialQuery]);
    if (resourceResult.error) throw new Error("Study resources could not be loaded.");
    if (editorialResult.error) throw new Error("Editorial resources could not be loaded.");

    const sources = [
      ...(resourceResult.data || []).map(item => ({
        type: "Study Library",
        title: item.title_hi || item.title_en,
        topic: item.topic || item.category || "Study notes",
        content: (item.content_hi || item.content_text || "").slice(0, MAX_SOURCE_CHARS),
      })),
      ...(editorialResult.data || []).map(item => ({
        type: "Daily Editorial",
        title: item.title_hi || item.title_en,
        topic: item.category,
        content: (item.content_hi || item.content_en || item.summary_hi || "").slice(0, MAX_SOURCE_CHARS),
      })),
    ].filter(source => source.content);

    if (!sources.length) {
      return NextResponse.json({ error: "No matching published study material was found. Try a topic in your Study Library." }, { status: 404 });
    }

    let remaining = MAX_CONTEXT_CHARS;
    const context = sources.map((source, index) => {
      const excerpt = source.content.slice(0, remaining);
      remaining -= excerpt.length;
      return "SOURCE " + (index + 1) + " [" + source.type + "] " + source.title + " / " + source.topic + "\n" + excerpt;
    }).filter(Boolean).join("\n\n");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
          temperature: 0.25,
          max_tokens: 900,
          messages: [
            { role: "system", content: "You are Gyankunj Study Companion for Indian competitive examination learners. Answer in the language of the question (Hindi if Hindi or Hinglish). Explain concepts clearly, structure exam-oriented answers, and distinguish facts from analysis. Use supplied Gyankunj material as primary evidence. Never invent a fact or source. If supplied material does not support a detail, say so. End with a short Study sources list naming only supplied source titles. Do not claim to be an official examiner." },
            { role: "user", content: "STUDENT QUESTION:\n" + question + "\n\nPUBLISHED GYANKUNJ STUDY MATERIAL:\n" + context },
          ],
        }),
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!aiResponse.ok) {
      return NextResponse.json({ error: aiResponse.status === 429 ? "Study Companion is busy. Please try again shortly." : "Study Companion could not complete this response. Please try again." }, { status: aiResponse.status === 429 ? 429 : 502 });
    }
    const result: unknown = await aiResponse.json();
    const answer = result && typeof result === "object" && "choices" in result
      ? (result.choices as Array<{ message?: { content?: unknown } }> | undefined)?.[0]?.message?.content
      : undefined;
    if (typeof answer !== "string" || !answer.trim()) {
      return NextResponse.json({ error: "Study Companion returned an empty response. Please try again." }, { status: 502 });
    }
    return NextResponse.json({ answer: answer.trim(), sources: sources.map(({ type, title, topic }) => ({ type, title, topic })) });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Study Companion took too long to respond. Please try again." }, { status: 504 });
    }
    return NextResponse.json({ error: "Unable to process your question right now. Please try again." }, { status: 500 });
  }
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Editorial = { slug: string; title: string; category: string; read: number } | null;
type Pulse = { streak: number; attempts: number; accuracy: number | null; answered: number };

const destinations = [
  { number: "01", title: "Daily Drill", detail: "Practice today's questions", href: "/practice/daily", tone: "blue" },
  { number: "02", title: "Editorial", detail: "Ideas, context & analysis", href: "/current-affairs", tone: "red" },
  { number: "03", title: "Study Library", detail: "Notes and learning resources", href: "/library", tone: "green" },
  { number: "04", title: "Today's Glimpses", detail: "Your daily learning brief", href: "/todays-glimpses", tone: "sand" },
];

export default function UI2HomeDashboard() {
  const [name, setName] = useState("Learner");
  const [editorial, setEditorial] = useState<Editorial>(null);
  const [pulse, setPulse] = useState<Pulse>({ streak: 0, attempts: 0, accuracy: null, answered: 0 });
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { if (active) setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setSignedIn(Boolean(user));
      if (!user) { setLoading(false); return; }
      const [profile, attempts, activity, article] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("assessment_attempts").select("answered_count,correct_count,submitted_at,assessment_id").eq("student_id", user.id).not("submitted_at", "is", null).gte("submitted_at", new Date(Date.now() - 30 * 86400000).toISOString()).order("submitted_at", { ascending: false }).limit(300),
        supabase.from("student_activity").select("created_at").eq("student_id", user.id).gte("created_at", new Date(Date.now() - 366 * 86400000).toISOString()),
        supabase.from("editorial_articles").select("slug,title_hi,title_en,category,read_minutes").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(1).maybeSingle()
      ]);
      if (!active) return;
      const fullName = profile.data?.full_name || user.user_metadata?.full_name;
      if (fullName) setName(String(fullName).trim().split(/\s+/)[0]);
      const rows = attempts.data || [];
      const answered = rows.reduce((n, row) => n + (Number(row.answered_count) || 0), 0);
      const correct = rows.reduce((n, row) => n + (Number(row.correct_count) || 0), 0);
      const dateKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
      const activeDays = new Set<string>();
      for (const row of activity.data || []) if (row.created_at) activeDays.add(dateKey(new Date(row.created_at)));
      for (const row of rows) if (row.submitted_at) activeDays.add(dateKey(new Date(row.submitted_at)));
      const today = dateKey(new Date());
      const yesterday = dateKey(new Date(Date.now() - 86400000));
      let cursor = activeDays.has(today) ? today : activeDays.has(yesterday) ? yesterday : "";
      let streak = 0;
      while (cursor && activeDays.has(cursor)) {
        streak++;
        const [year, month, day] = cursor.split("-").map(Number);
        cursor = dateKey(new Date(Date.UTC(year, month - 1, day) - 86400000));
      }
      setPulse({ streak, attempts: rows.length, accuracy: answered ? Math.round(correct / answered * 100) : null, answered });
      if (article.data) setEditorial({ slug: article.data.slug, title: article.data.title_hi || article.data.title_en || "Today's Editorial", category: article.data.category || "Daily Crux", read: Number(article.data.read_minutes) || 0 });
      setLoading(false);
    }
    void load().catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return <main className="gk2-app gk2-home" data-gk2-theme="paper">
    <div className="gk2-wrap">
      <header className="gk2-header">
        <Link className="gk2-brand" href="/"><span className="gk2-brand-mark">G.</span><span><strong>GYANKUNJ</strong><small>ACADEMY · FIELD NOTES FOR THE CURIOUS</small></span></Link>
        <nav aria-label="Primary navigation"><Link href="/study">Study</Link><Link href="/practice/daily">Practice</Link><Link href="/current-affairs">Editorial</Link><Link href="/progress">Progress</Link></nav>
        <Link className="gk2-account" href={signedIn ? "/profile" : "/login"}>{signedIn ? "My account ↗" : "Sign in ↗"}</Link>
      </header>

      <section className="gk2-hero">
        <div className="gk2-hero-copy">
          <p className="gk2-kicker"><span/> YOUR LEARNING, IN FOCUS <span className="gk2-date">{new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date())}</span></p>
          <h1>Make<br/><em>knowledge</em><br/>count.</h1>
          <div className="gk2-hero-bottom"><p>{greeting}, {name}. A clearer space to read deeply, practise deliberately and move forward every day.</p><Link href="/todays-glimpses" className="gk2-primary">Open today’s briefing <span>↗</span></Link></div>
        </div>
        <aside className="gk2-field-note"><div className="gk2-note-top"><span>FIELD NOTE / 001</span><span>GYANKUNJ JOURNAL</span></div><div className="gk2-note-art"><span>ज्ञान</span><i/><b/></div><p className="gk2-note-caption">THE PRACTICE OF UNDERSTANDING</p><h2>Learn with intent.<br/>Think beyond facts.</h2><p className="gk2-note-body">Build the habit of connecting ideas, questioning assumptions and seeing the larger picture.</p><Link href="/study">Explore your syllabus ↗</Link></aside>
      </section>

      <section className="gk2-pulse"><div><span className="gk2-kicker">YOUR LEARNING PULSE</span><h2>Small steps.<br/><em>Real momentum.</em></h2></div><div className="gk2-metric"><strong>{loading ? "—" : pulse.streak}</strong><span>DAY STREAK</span></div><div className="gk2-metric"><strong>{loading ? "—" : pulse.attempts}</strong><span>SUBMITTED · 30 DAYS</span></div><div className="gk2-metric"><strong>{loading || pulse.accuracy === null ? "—" : pulse.accuracy + "%"}</strong><span>ANSWER ACCURACY</span></div></section>

      <section className="gk2-work"><div className="gk2-section-head"><div><span className="gk2-kicker">THE DAILY WORK</span><h2>Choose your next step.</h2></div><span>01 — 04</span></div><div className="gk2-card-grid">{destinations.map(item => <Link href={item.href} className={"gk2-work-card gk2-"+item.tone} key={item.number}><span className="gk2-card-number">{item.number} / WORKSPACE</span><span className="gk2-card-symbol">{item.number === "01" ? "◎" : item.number === "02" ? "¶" : item.number === "03" ? "▤" : "↗"}</span><h3>{item.title}</h3><p>{item.detail}</p><span className="gk2-card-link">OPEN SECTION ↗</span></Link>)}</div></section>

      <section className="gk2-briefing"><div><span className="gk2-kicker">LATEST EDITORIAL</span><h2>{editorial?.title || "Ideas worth spending time with."}</h2><p>{editorial ? editorial.category + " · " + editorial.read + " min read" : "Explore current affairs through context, evidence and analysis."}</p></div><Link href={editorial ? "/current-affairs/" + editorial.slug : "/current-affairs"}>Read the analysis ↗</Link></section>
      <footer className="gk2-footer"><span>GYANKUNJ ACADEMY</span><span>READ · REFLECT · REPEAT</span><Link href="/profile">STUDENT SPACE ↗</Link></footer>
    </div>
    <nav className="gk2-mobile-nav" aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/study">Study</Link><Link href="/todays-glimpses">Today</Link><Link href="/progress">Progress</Link></nav>
  </main>;
}

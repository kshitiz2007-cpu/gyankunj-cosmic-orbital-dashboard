"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Editorial = { slug: string; title: string; category: string; read: number } | null;
type Pulse = { streak: number; attempts: number; accuracy: number | null };

export default function UI2HomeDashboard() {
  const [name, setName] = useState("Learner");
  const [editorial, setEditorial] = useState<Editorial>(null);
  const [pulse, setPulse] = useState<Pulse>({ streak: 0, attempts: 0, accuracy: null });
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
        supabase.from("assessment_attempts").select("answered_count,correct_count,submitted_at").eq("student_id", user.id).not("submitted_at", "is", null).gte("submitted_at", new Date(Date.now() - 30 * 86400000).toISOString()).order("submitted_at", { ascending: false }).limit(300),
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
      setPulse({ streak, attempts: rows.length, accuracy: answered ? Math.round(correct / answered * 100) : null });
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
        <Link className="gk2-brand" href="/"><span className="gk2-brand-mark">G.</span><span><strong>GYANKUNJ</strong><small>ACADEMY · LEARNING, WITH INTENT</small></span></Link>
        <nav aria-label="Primary navigation"><Link href="/study">Syllabus</Link><Link href="/todays-glimpses">Daily brief</Link><Link href="/progress">My progress</Link></nav>
        <Link className="gk2-account" href={signedIn ? "/profile" : "/login"}>{signedIn ? name : "Sign in"} ↗</Link>
      </header>

      <section className="gk2-hero">
        <div className="gk2-hero-copy">
          <p className="gk2-kicker">YOUR STUDY DESK <span className="gk2-date">{new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeZone: "Asia/Kolkata" }).format(new Date())}</span></p>
          <h1>{greeting},<br/><em>{name}.</em></h1>
          <p className="gk2-intro">A focused place for today's preparation. Start with the brief, then follow the subject that needs your attention.</p>
          <Link href="/todays-glimpses" className="gk2-primary">Go to today's brief <span>↗</span></Link>
        </div>
        <aside className="gk2-focus">
          <div className="gk2-focus-head"><span>ON THE DESK TODAY</span><span>01 / DAILY FOCUS</span></div>
          <div className="gk2-focus-feature"><span className="gk2-focus-index">A</span><div><small>EDITORIAL · {editorial?.read || 8} MIN READ</small><h2>{editorial?.title || "Read today's analysis"}</h2><p>{editorial?.category || "Current affairs · Context and perspective"}</p></div><Link href={editorial ? "/current-affairs/" + editorial.slug : "/current-affairs"} aria-label="Open editorial">↗</Link></div>
          <div className="gk2-focus-row"><span>B</span><div><strong>Daily Drill</strong><small>Test recall with today's questions</small></div><Link href="/practice/daily">Start ↗</Link></div>
          <div className="gk2-focus-row"><span>C</span><div><strong>Mains Practice</strong><small>Turn understanding into an answer</small></div><Link href="/mains-practice">Write ↗</Link></div>
        </aside>
      </section>

      <section className="gk2-study">
        <div className="gk2-study-heading"><div><span className="gk2-kicker">PICK UP A SUBJECT</span><h2>What are you working on?</h2></div><Link href="/syllabus">View full syllabus ↗</Link></div>
        <div className="gk2-subject-list">
          <Link href="/syllabus"><span>01</span><strong>Polity & Governance</strong><small>Constitution · Institutions · Rights</small><b>↗</b></Link>
          <Link href="/syllabus"><span>02</span><strong>Economy</strong><small>Growth · Banking · Public finance</small><b>↗</b></Link>
          <Link href="/syllabus"><span>03</span><strong>History & Culture</strong><small>Ancient · Medieval · Modern India</small><b>↗</b></Link>
          <Link href="/syllabus"><span>04</span><strong>Environment & Geography</strong><small>Ecology · Mapping · Climate</small><b>↗</b></Link>
        </div>
      </section>

      <section className="gk2-progress-line"><div><span className="gk2-kicker">YOUR LAST 30 DAYS</span><strong>{loading ? "—" : pulse.streak + " day streak"}</strong></div><div><strong>{loading ? "—" : pulse.attempts}</strong><small>Submitted tests</small></div><div><strong>{loading || pulse.accuracy === null ? "—" : pulse.accuracy + "%"}</strong><small>Answer accuracy</small></div><Link href="/progress">View progress ↗</Link></section>
      <footer className="gk2-footer"><span>GYANKUNJ ACADEMY</span><span>STUDY WITH CLARITY</span><Link href="/library">RESOURCE LIBRARY ↗</Link></footer>
    </div>
    <nav className="gk2-mobile-nav" aria-label="Mobile navigation"><Link href="/">Desk</Link><Link href="/syllabus">Syllabus</Link><Link href="/todays-glimpses">Today</Link><Link href="/profile">Account</Link></nav>
  </main>;
}

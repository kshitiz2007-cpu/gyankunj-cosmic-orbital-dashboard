"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowUpRight01Icon, Calendar01Icon, Clock01Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "../archive.css";

type Drill = {
  id: string;
  title: string;
  duration_minutes: number;
  created_at: string;
  published_at: string | null;
};
type Attempt = {
  id: string;
  assessment_id: string;
  score: number | null;
  correct_count: number | null;
  question_count: number | null;
  submitted_at: string | null;
};
function Icon({ icon, size = 18 }: { icon: typeof ArrowLeft01Icon; size?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.8} />;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric"
  }).format(new Date(value));
}
export default function DailyDrillArchivePage() {
  const router = useRouter();
  const [drills, setDrills] = useState<Drill[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase configuration is missing.");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) { router.replace("/login"); return; }

      const { data, error: drillError } = await supabase
        .from("assessments")
        .select("id,title,duration_minutes,created_at,published_at")
        .eq("kind", "daily_drill")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(500);
      if (drillError) throw drillError;
      const published = (data || []) as Drill[];
      const ids = published.map(item => item.id);

      if (ids.length) {
        const [attemptResult, membershipResult] = await Promise.all([
          supabase.from("assessment_attempts")
            .select("id,assessment_id,score,correct_count,question_count,submitted_at")
            .eq("student_id", user.id)
            .in("assessment_id", ids)
            .not("submitted_at", "is", null)
            .order("submitted_at", { ascending: false }),
          supabase.from("assessment_questions")
            .select("assessment_id")
            .in("assessment_id", ids)
        ]);
        if (attemptResult.error) throw attemptResult.error;
        if (membershipResult.error) throw membershipResult.error;
        const counts: Record<string, number> = {};
        for (const item of membershipResult.data || []) {
          counts[item.assessment_id] = (counts[item.assessment_id] || 0) + 1;
        }
        const legacyIds = ids.filter(id => !counts[id]);
        if (legacyIds.length) {
          const { data: legacyQuestions, error: legacyError } = await supabase.from("questions")
            .select("id,assessment_id")
            .in("assessment_id", legacyIds);
          if (legacyError) throw legacyError;
          for (const question of legacyQuestions || []) {
            counts[question.assessment_id] = (counts[question.assessment_id] || 0) + 1;
          }
        }
        if (active) {
          setAttempts((attemptResult.data || []) as Attempt[]);
          setQuestionCounts(counts);
        }
      }
      if (active) { setDrills(published); setLoading(false); }
    };
    void load().catch(reason => {
      if (active) {
        setError(reason instanceof Error ? reason.message : "Unable to load the Drill Archive.");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [router]);

  const latestAttempt = useMemo(() => {
    const map = new Map<string, Attempt>();
    for (const attempt of attempts) if (!map.has(attempt.assessment_id)) map.set(attempt.assessment_id, attempt);
    return map;
  }, [attempts]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return drills.filter(drill => !term || drill.title.toLowerCase().includes(term) || formatDate(drill.published_at || drill.created_at).toLowerCase().includes(term));
  }, [drills, search]);

  return <main className="drill-app drill-archive-app">
    <header className="drill-topbar">
      <Link href="/practice/daily" className="drill-back"><Icon icon={ArrowLeft01Icon}/> <span>DAILY DRILL</span></Link>
      <div className="drill-session-label">YOUR PRACTICE LIBRARY</div>
      <span className="drill-archive-count">{drills.length} SAVED DRILLS</span>
    </header>
    <div className="drill-wrap drill-archive-wrap">
      <section className="drill-intro drill-archive-intro">
        <div><span className="drill-kicker">REVISE · REATTEMPT · IMPROVE</span><h1>Drill <em>Archive.</em></h1><p>Every published Daily Drill, preserved by date. आज का अभ्यास ही नहीं—पुराने दिनों के drills भी कभी भी दोबारा हल करें।</p></div>
        <div className="drill-archive-total"><strong>{drills.length.toString().padStart(2, "0")}</strong><span>AVAILABLE SESSIONS</span></div>
      </section>

      <div className="drill-archive-toolbar">
        <label><Icon icon={Search01Icon}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by drill title or date…" aria-label="Search archived drills"/></label>
        <span>NEWEST FIRST · IST</span>
      </div>

      {loading && <section className="drill-archive-state">Loading your saved drills…</section>}
      {error && <section className="drill-archive-state drill-archive-error" role="alert">{error}</section>}
      {!loading && !error && filtered.length === 0 && <section className="drill-archive-state"><strong>{drills.length ? "No drills match your search." : "Your archive is waiting."}</strong><p>{drills.length ? "Try another title or date." : "Published Daily Drills will automatically appear here and remain available for future practice."}</p></section>}

      {!loading && !error && filtered.length > 0 && <section className="drill-archive-grid" aria-label="Archived daily drills">
        {filtered.map((drill, index) => {
          const date = drill.published_at || drill.created_at;
          const attempt = latestAttempt.get(drill.id);
          const count = questionCounts[drill.id] || attempt?.question_count || 0;
          return <article className="drill-archive-card" key={drill.id}>
            <div className="drill-archive-card-top"><span>DAILY DRILL / {String(filtered.length - index).padStart(2, "0")}</span><span className="drill-archive-status">{attempt ? "ATTEMPTED" : "READY TO PRACTICE"}</span></div>
            <h2>{drill.title}</h2>
            <div className="drill-archive-meta"><span><Icon icon={Calendar01Icon}/>{formatDate(date)}</span><span><Icon icon={Clock01Icon}/>{drill.duration_minutes} MIN</span><span>{count} QUESTIONS</span></div>
            {attempt && <div className="drill-archive-result"><span>LAST SCORE</span><strong>{attempt.correct_count ?? attempt.score ?? 0}<small> / {attempt.question_count ?? count}</small></strong><time>{attempt.submitted_at ? formatDate(attempt.submitted_at) : ""}</time></div>}
            <Link className="drill-archive-start" href={"/practice/daily?assessment=" + drill.id}>{attempt ? "PRACTISE AGAIN" : "START PRACTICE"} <Icon icon={ArrowUpRight01Icon}/></Link>
          </article>;
        })}
      </section>}
      <footer className="drill-footer"><span>GYANKUNJ · CIVILPREP</span><span>YOUR DAILY PRACTICE, PRESERVED.</span></footer>
    </div>
  </main>;
}

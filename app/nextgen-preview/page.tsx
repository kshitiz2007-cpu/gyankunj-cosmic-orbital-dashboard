"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import styles from "./preview.module.css";
import "../../components/nextgen/design-tokens.css";

type Drill = { id: string; title: string; count: number };
type Editorial = { slug: string; title_hi: string | null; title_en: string | null; summary_hi: string | null; summary_en: string | null; read_minutes: number };

const shortcuts = [
  { title: "Editorial", subtitle: "Read & analyse", href: "/current-affairs", icon: "▤", tone: "rose" },
  { title: "Notes", subtitle: "Your study notes", href: "/library", icon: "▧", tone: "violet" },
  { title: "Mocks", subtitle: "Full-length tests", href: "/mock-test", icon: "▣", tone: "peach" },
  { title: "Library", subtitle: "Explore resources", href: "/library", icon: "▱", tone: "blue" },
  { title: "Classes", subtitle: "Learn live", href: "/live", icon: "♧", tone: "pink" },
  { title: "PYQs", subtitle: "Practice questions", href: "/practice/daily", icon: "⌑", tone: "lavender" },
];

export default function NextGenPreviewPage() {
  const [student, setStudent] = useState("Scholar");
  const [metrics, setMetrics] = useState({ streak: "—", attempts: "—", answered: 0, correct: 0 });
  const [editorial, setEditorial] = useState<Editorial | null>(null);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { if (active) setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) setLoading(false); return; }
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [profile, attempts, article, assessment, activity] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("assessment_attempts").select("id,answered_count,correct_count,submitted_at").eq("student_id", user.id).not("submitted_at", "is", null).gte("submitted_at", since).order("submitted_at", { ascending: false }).limit(500),
        supabase.from("editorial_articles").select("slug,title_hi,title_en,summary_hi,summary_en,read_minutes").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("assessments").select("id,title").eq("kind", "daily_drill").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("student_activity").select("created_at").eq("student_id", user.id).gte("created_at", new Date(Date.now() - 370 * 86400000).toISOString()),
      ]);
      if (!active) return;
      if (profile.data?.full_name) setStudent(profile.data.full_name.split(" ")[0]);
      const rows = attempts.data || [];
      const answered = rows.reduce((n, x) => n + (Number(x.answered_count) || 0), 0);
      const correct = rows.reduce((n, x) => n + (Number(x.correct_count) || 0), 0);
      const dateKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
      const days = new Set<string>([...(activity.data || []).map(x => dateKey(new Date(x.created_at))), ...rows.map(x => dateKey(new Date(x.submitted_at)))]);
      let cursor = days.has(dateKey(new Date())) ? dateKey(new Date()) : dateKey(new Date(Date.now() - 86400000));
      let streak = 0;
      while (days.has(cursor) && streak < 370) {
        streak++;
        const [y, m, d] = cursor.split("-").map(Number);
        cursor = new Date(Date.UTC(y, m - 1, d) - 86400000).toISOString().slice(0, 10);
      }
      setMetrics({ streak: String(streak), attempts: String(rows.length), answered, correct });
      if (article.data) setEditorial(article.data as Editorial);
      if (assessment.data) {
        const { count } = await supabase.from("assessment_questions").select("question_id", { count: "exact", head: true }).eq("assessment_id", assessment.data.id);
        if (active) setDrill({ id: assessment.data.id, title: assessment.data.title, count: count || 0 });
      }
      if (active) setLoading(false);
    };
    void load().catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const accuracy = metrics.answered ? Math.round((metrics.correct / metrics.answered) * 100) : 0;
  const drillHref = drill ? "/practice/daily" : "/practice/daily";

  return (
    <main className={styles.app}>
      <div className={styles.ambient} aria-hidden="true"><i /><i /><i /></div>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>✿</span>
          <span className={styles.brandName}>Gyankunj<small>ACADEMY</small></span>
        </Link>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} aria-label="Notifications">♧<i /></button>
          <Link href="/profile" className={styles.profileButton}>K</Link>
        </div>
      </header>

      <div className={styles.page}>
        <section className={styles.greeting}>
          <div><span className={styles.kicker}>YOUR UPSC JOURNEY, ELEVATED</span><h1>Good evening, {student} <span>✦</span></h1><p>A little progress today. A stronger you tomorrow.</p></div>
          <span className={styles.greetingSpark}>✧</span>
        </section>

        <Link href={drillHref} className={styles.drillHero}>
          <span className={styles.drillGlow} />
          <span className={styles.drillOrb}>✦</span>
          <span className={styles.drillCopy}><small>YOUR DAILY MOMENTUM</small><strong>Daily Drill</strong><em>{drill ? `${drill.count} Questions · ${drill.title}` : "10 Questions · GS Mix"}</em></span>
          <span className={styles.playButton}>▶</span>
        </Link>

        <section className={styles.shortcutGrid} aria-label="Learning shortcuts">
          {shortcuts.map((item) => <Link href={item.href} key={item.title} className={`${styles.shortcut} ${styles[item.tone]}`}>
            <span className={styles.shortcutIcon}>{item.icon}</span><strong>{item.title}</strong><small>{item.subtitle}</small>
          </Link>)}
        </section>

        <Link href="/todays-glimpses" className={styles.glimpses}>
          <span className={styles.glimpseIcon}>✧</span>
          <span className={styles.glimpseCopy}><strong>Today&apos;s Glimpses</strong><small>Editorial <b>·</b> Daily Drill <b>·</b> Mains Q.</small></span>
          <span className={styles.glimpseArrow}>↗</span>
        </Link>

        <section className={styles.progressCard}>
          <div className={styles.progressHead}><div><small>YOUR PROGRESS</small><strong>Keep your momentum.</strong></div><span className={styles.progressPeriod}>LAST 30 DAYS</span></div>
          <div className={styles.progressBody}>
            <div className={styles.ring} style={{ "--progress": `${accuracy}%` } as React.CSSProperties}><div><strong>{loading ? "—" : `${accuracy}%`}</strong><small>ACCURACY</small></div></div>
            <div className={styles.progressStats}>
              <div><span className={styles.statIcon}>♨</span><strong>{loading ? "—" : metrics.streak} Day Streak</strong></div>
              <div><span className={styles.statIcon}>◎</span><strong>{loading ? "—" : metrics.answered} Questions</strong></div>
              <div><span className={styles.statIcon}>▣</span><strong>{loading ? "—" : metrics.attempts} Assessments</strong></div>
            </div>
          </div>
          <div className={styles.progressFoot}>{editorial?.title_hi || editorial?.title_en || "Your learning history will shape your next milestone."}</div>
        </section>
      </div>

      <nav className={styles.mobileDock} aria-label="Main navigation">
        <Link href="/" className={styles.activeNav}><span>⌂</span><small>Home</small></Link>
        <Link href="/library"><span>▤</span><small>Study</small></Link>
        <Link href="/todays-glimpses"><span>✧</span><small>Glimpses</small></Link>
        <Link href="/library"><span>▱</span><small>Library</small></Link>
        <Link href="/profile"><span>♙</span><small>Profile</small></Link>
      </nav>
    </main>
  );
}

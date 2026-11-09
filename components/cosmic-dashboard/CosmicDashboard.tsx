"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon, Target01Icon, NewspaperIcon, Notebook01Icon,
  BookOpen01Icon, UserGroupIcon, Home01Icon, Compass01Icon,
  FireIcon, CheckmarkCircle02Icon,
  ArrowUpRight01Icon, Clock01Icon, Brain01Icon,
  ChartLineData01Icon
} from "@hugeicons/core-free-icons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "./cosmic-dashboard.css";

type IconType = typeof Home01Icon;
type ModuleItem = {
  id: string; label: string; sub: string; href: string;
  icon: IconType; tone: "rose" | "gold" | "cyan" | "green" | "violet" | "blue" | "pink" | "amber";
};
type DashboardStats = { streak: number; attempts: number; answered: number; correct: number };
type Editorial = { slug: string; title: string; summary: string; category: string; read: number } | null;

const modules: ModuleItem[] = [
  { id: "editorial", label: "Daily Editorial", sub: "ANALYSE · CONNECT", href: "/current-affairs", icon: NewspaperIcon, tone: "rose" },
  { id: "drill", label: "Daily Drill", sub: "PRACTICE · IMPROVE", href: "/practice/daily", icon: Notebook01Icon, tone: "gold" },
  { id: "recall", label: "Topper Recall", sub: "REVISE · RETAIN", href: "/vault", icon: BookOpen01Icon, tone: "cyan" },
  { id: "library", label: "Study Library", sub: "NOTES · PYQ · TESTS", href: "/library", icon: BookOpen01Icon, tone: "green" },
  { id: "progress", label: "My Progress", sub: "TRACK · GROW", href: "/progress", icon: ChartLineData01Icon, tone: "violet" },
  { id: "live", label: "Live Classes", sub: "LEARN · INTERACT", href: "/live", icon: UserGroupIcon, tone: "blue" },
  { id: "ai", label: "AI Companion", sub: "PLAN · SOLVE · EXPLAIN", href: "/ai", icon: Brain01Icon, tone: "pink" },
  { id: "syllabus", label: "Explore Syllabus", sub: "MAP · MASTER", href: "/syllabus", icon: Compass01Icon, tone: "amber" },
];

const subjects = [
  { label: "Polity", icon: "▥", tone: "blue" },
  { label: "Economy", icon: "▤", tone: "green" },
  { label: "Environment", icon: "❧", tone: "emerald" },
  { label: "Science & Tech", icon: "⌬", tone: "cyan" },
];

const demoEditorial = {
  slug: "bharat-semiconductor-mission",
  title: "भारत का सेमीकंडक्टर मिशन",
  summary: "आत्मनिर्भरता, वैश्विक आपूर्ति शृंखला और रणनीतिक क्षमता का विश्लेषण।",
  category: "SCIENCE & TECHNOLOGY",
  read: 8,
};

function Icon({ icon, size = 22 }: { icon: IconType; size?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={1.7} />;
}

function Starfield() {
  return <div className="cosmic-stars" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>;
}

function CircularProgress({ value }: { value: number }) {
  return <div className="cosmic-progress-ring" style={{ "--progress": value } as React.CSSProperties}>
    <div><strong>{value}%</strong><small>ACCURACY</small></div>
  </div>;
}

function OrbitalModule({ item, index, focused, onFocus }: {
  item: ModuleItem; index: number; focused: boolean; onFocus: (item: ModuleItem) => void;
}) {
  const orbit = index % 3;
  return <div className={`cosmic-orbit-track cosmic-orbit-track--${orbit}`}
    style={{ "--orbit-duration": "72s", "--orbit-radius": "38%", "--orbit-delay": `${-index * 9}s` } as React.CSSProperties}>
    <button type="button" className={`cosmic-planet cosmic-planet--${item.tone}${focused ? " is-focused" : ""}`}
      onClick={() => onFocus(item)} aria-pressed={focused} aria-label={`Focus ${item.label}`}>
      <span className="cosmic-planet-face">
        <span className="cosmic-planet-halo" />
        <span className="cosmic-planet-icon"><Icon icon={item.icon} size={31} /></span>
        <strong>{item.label}</strong><small>{item.sub}</small>
        <span className="cosmic-planet-arrow"><Icon icon={ArrowUpRight01Icon} size={17} /></span>
      </span>
    </button>
  </div>;
}

function OrbitalUniverse({ onNavigate }: { onNavigate: (href: string) => void }) {
  const [focused, setFocused] = useState<ModuleItem | null>(null);
  const focus = (item: ModuleItem) => setFocused(current => current?.id === item.id ? null : item);
  return <section className={`cosmic-universe${focused ? " has-focus" : ""}`} aria-label="Gyankunj learning universe">
    <div className="cosmic-universe-copy"><span>YOUR LEARNING UNIVERSE</span><small>{focused ? "DESTINATION IN FOCUS" : "SELECT A PLANET TO EXPLORE"}</small></div>
    <div className="cosmic-orbit-stage">
      <div className="cosmic-orbit cosmic-orbit--outer" /><div className="cosmic-orbit cosmic-orbit--middle" /><div className="cosmic-orbit cosmic-orbit--inner" />
      <div className="cosmic-orbit-dots"><i /><i /><i /><i /></div>
      {modules.map((item, index) => <OrbitalModule key={item.id} item={item} index={index} focused={focused?.id === item.id} onFocus={focus} />)}
      <div className="cosmic-center-planet"><span className="cosmic-center-glow" /><span className="cosmic-center-star">✦</span><strong>GYANKUNJ</strong><small>YOUR KNOWLEDGE<br />UNIVERSE</small></div>
      <div className="cosmic-horizon"><span /><i /><b /></div>
    </div>
    {focused && <div className="cosmic-focus-card" key={focused.id}>
      <span className={`cosmic-focus-icon cosmic-focus-icon--${focused.tone}`}><Icon icon={focused.icon} size={25} /></span>
      <div><small>DESTINATION {String(modules.findIndex(item => item.id === focused.id) + 1).padStart(2, "0")}</small><strong>{focused.label}</strong><p>{focused.sub} · Enter your learning space.</p></div>
      <button type="button" onClick={() => onNavigate(focused.href)}>Explore <Icon icon={ArrowUpRight01Icon} size={16} /></button>
      <button className="cosmic-focus-close" type="button" aria-label="Close focus" onClick={() => setFocused(null)}>×</button>
    </div>}
  </section>;
}

function DashboardHeader({ demo }: { demo: boolean }) {
  return <header className="cosmic-header">
    <Link href="/" className="cosmic-brand" aria-label="Gyankunj home">
      <span className="cosmic-brand-mark">✦</span>
      <span><strong>GYANKUNJ</strong><small>CIVILPREP · LEARN WITHOUT LIMITS</small></span>
    </Link>
    <label className="cosmic-search"><span>⌕</span><input aria-label="Search topics, notes and tests" placeholder="Search topics, notes, tests..." /><kbd>⌘ K</kbd></label>
    <div className="cosmic-header-actions">
      {demo && <span className="cosmic-demo-pill">PREVIEW MODE</span>}
      <Link href="/todays-glimpses" aria-label="Notifications" className="cosmic-icon-button"><Icon icon={Notification01Icon} size={23} /><i /></Link>
      <Link href="/profile" aria-label="Profile" className="cosmic-avatar">G</Link>
    </div>
  </header>;
}

function BottomNavigation() {
  const items = [
    { label: "Home", href: "/", icon: Home01Icon },
    { label: "Study", href: "/library", icon: BookOpen01Icon },
    { label: "Practice", href: "/practice/daily", icon: Target01Icon },
    { label: "Live", href: "/live", icon: UserGroupIcon },
    { label: "Library", href: "/library", icon: Notebook01Icon },
    { label: "Profile", href: "/profile", icon: UserGroupIcon },
  ];
  return <nav className="cosmic-bottom-nav" aria-label="Primary navigation">
    {items.slice(0, 3).map(item => <Link href={item.href} key={item.label} className={item.label === "Home" ? "is-active" : ""}><Icon icon={item.icon} size={21} /><small>{item.label}</small></Link>)}
    <Link href="/ai" className="cosmic-nav-core" aria-label="Open AI Companion"><span>✦</span></Link>
    {items.slice(3).map(item => <Link href={item.href} key={item.label}><Icon icon={item.icon} size={21} /><small>{item.label}</small></Link>)}
  </nav>;
}

export default function CosmicDashboard({ demo = false }: { demo?: boolean }) {
  const [name, setName] = useState(demo ? "Scholar" : "Learner");
  const [stats, setStats] = useState<DashboardStats>({ streak: demo ? 12 : 0, attempts: demo ? 18 : 0, answered: demo ? 20 : 0, correct: demo ? 15 : 0 });
  const [editorial, setEditorial] = useState<Editorial>(demo ? demoEditorial : null);
  const [drillCount, setDrillCount] = useState(demo ? 20 : 0);
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    if (demo) return;
    let active = true;
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) { if (active) setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!active || !user) { if (active) setLoading(false); return; }
      const since = new Date(Date.now() - 30 * 86400000).toISOString();
      const [profile, attempts, activity, article, assessment] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
        supabase.from("assessment_attempts").select("id,answered_count,correct_count,submitted_at").eq("student_id", user.id).not("submitted_at", "is", null).gte("submitted_at", since).order("submitted_at", { ascending: false }).limit(500),
        supabase.from("student_activity").select("created_at").eq("student_id", user.id).gte("created_at", new Date(Date.now() - 370 * 86400000).toISOString()),
        supabase.from("editorial_articles").select("slug,title_hi,title_en,summary_hi,summary_en,category,read_minutes").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("assessments").select("id,title").eq("kind", "daily_drill").eq("is_published", true).order("published_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (!active) return;
      const fullName = profile.data?.full_name || user.user_metadata?.full_name;
      if (fullName) setName(String(fullName).trim().split(/\s+/)[0]);
      const rows = attempts.data || [];
      const answered = rows.reduce((total, row) => total + (Number(row.answered_count) || 0), 0);
      const correct = rows.reduce((total, row) => total + (Number(row.correct_count) || 0), 0);
      const dateKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(date);
      const days = new Set<string>([
        ...(activity.data || []).map(row => dateKey(new Date(row.created_at))),
        ...rows.filter(row => row.submitted_at).map(row => dateKey(new Date(row.submitted_at!))),
      ]);
      let cursor = days.has(dateKey(new Date())) ? dateKey(new Date()) : dateKey(new Date(Date.now() - 86400000));
      let streak = 0;
      while (days.has(cursor) && streak < 370) {
        streak++;
        const [year, month, day] = cursor.split("-").map(Number);
        cursor = new Date(Date.UTC(year, month - 1, day) - 86400000).toISOString().slice(0, 10);
      }
      setStats({ streak, attempts: rows.length, answered, correct });
      if (article.data) setEditorial({
        slug: article.data.slug,
        title: article.data.title_hi || article.data.title_en || "Today's Editorial",
        summary: article.data.summary_hi || article.data.summary_en || "Read today's analysis and connect it with the syllabus.",
        category: article.data.category || "CURRENT AFFAIRS",
        read: Number(article.data.read_minutes) || 8,
      });
      if (assessment.data) {
        const { count } = await supabase.from("assessment_questions").select("question_id", { count: "exact", head: true }).eq("assessment_id", assessment.data.id);
        if (active) setDrillCount(count || 0);
      }
      if (active) setLoading(false);
    }
    void load().catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [demo]);

  const accuracy = stats.answered ? Math.round(stats.correct / stats.answered * 100) : 0;
  const today = useMemo(() => new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date()), []);

  return <main className="cosmic-dashboard">
    <Starfield />
    <DashboardHeader demo={demo} />
    <div className="cosmic-content">
      <div className="cosmic-side-note cosmic-side-note--left"><span>THU</span><strong>{today}</strong><p>“A little progress every day builds a big result.”</p></div>
      <div className="cosmic-side-note cosmic-side-note--right"><span className="cosmic-streak"><Icon icon={FireIcon} size={31} /> <b>{loading ? "—" : stats.streak}</b></span><strong>Day Streak</strong><p>“Discipline today, freedom tomorrow.”</p></div>
      <section className="cosmic-welcome"><span>WELCOME TO YOUR LEARNING UNIVERSE</span><h1>Good morning, {name} <em>✦</em></h1><p>One focused step today. A brighter tomorrow.</p></section>
      <OrbitalUniverse onNavigate={(href) => { window.location.href = href; }} />
      {demo && <div className="cosmic-preview-notice">PREVIEW MODE · SAMPLE DATA · NO STUDENT RECORDS CONNECTED</div>}
      <section className="cosmic-feature-row">
        <Link href={editorial ? `/current-affairs/${editorial.slug}` : "/current-affairs"} className="cosmic-editorial-card">
          <div className="cosmic-editorial-art"><span>INDIA</span><b>◈</b><i>SEMICONDUCTOR<br />MISSION</i></div>
          <div className="cosmic-editorial-copy"><span className="cosmic-eyebrow">TODAY&apos;S EDITORIAL</span><h2>{editorial?.title || "आज का संपादकीय"}</h2><p>{editorial?.summary || "आज के महत्वपूर्ण मुद्दों का विश्लेषण पढ़ें।"}</p><small><Icon icon={BookOpen01Icon} size={16} /> {editorial?.read || 8} MIN READ <b /> {editorial?.category || "CURRENT AFFAIRS"}</small></div>
          <span className="cosmic-card-arrow"><Icon icon={ArrowUpRight01Icon} size={20} /></span>
        </Link>
        <Link href="/practice/daily" className="cosmic-drill-card">
          <div className="cosmic-drill-head"><span><Icon icon={Target01Icon} size={24} /> TODAY&apos;S DRILL</span><Icon icon={ArrowUpRight01Icon} size={20} /></div>
          <div className="cosmic-drill-score">{loading ? "—" : stats.correct}<span> / {drillCount || 20}</span></div>
          <div className="cosmic-drill-bottom"><span>Questions</span><CircularProgress value={loading ? 0 : accuracy} /></div>
        </Link>
      </section>
      <section className="cosmic-subjects" aria-label="Explore subjects">
        {subjects.map(subject => <Link href="/library" key={subject.label} className={`cosmic-subject cosmic-subject--${subject.tone}`}><span>{subject.icon}</span>{subject.label}<Icon icon={ArrowUpRight01Icon} size={14} /></Link>)}
      </section>
      <section className="cosmic-metrics">
        <div><Icon icon={FireIcon} size={19} /><strong>{loading ? "—" : stats.streak}</strong><small>DAY STREAK</small></div>
        <div><Icon icon={CheckmarkCircle02Icon} size={19} /><strong>{loading ? "—" : stats.attempts}</strong><small>ASSESSMENTS</small></div>
        <div><Icon icon={ChartLineData01Icon} size={19} /><strong>{loading ? "—" : accuracy + "%"}</strong><small>ACCURACY</small></div>
        <div><Icon icon={Clock01Icon} size={19} /><strong>{loading ? "—" : stats.answered}</strong><small>QUESTIONS</small></div>
      </section>
    </div>
    <BottomNavigation />
  </main>;
}

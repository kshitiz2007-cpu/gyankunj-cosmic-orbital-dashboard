"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "./preview.css";
import { Badge, BentoCard, Button, Divider, EmptyState, ProgressBar, SectionHeading, Skeleton, TextInput } from "@/components/ui";

type Theme = "light" | "dark";

const palette = [
  { name: "Rose 50", hex: "#fff1f7" },
  { name: "Rose 200", hex: "#fbcfe8" },
  { name: "Rose 400", hex: "#f472b6" },
  { name: "Pink 600", hex: "#db2777" },
  { name: "Magenta", hex: "#c02683" },
  { name: "Violet", hex: "#a855f7" },
  { name: "Ink", hex: "#211329" },
  { name: "Muted", hex: "#9d8a9d" },
];

const spacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
const radii = ["8px", "12px", "18px", "24px", "32px", "999px"];

export default function DesignSystemPreviewPage() {
  const router = useRouter();
  const [access, setAccess] = useState<"checking" | "allowed" | "denied">("checking");
  const [theme, setTheme] = useState<Theme>("dark");
  const [density, setDensity] = useState("comfortable");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    const verify = async () => {
      if (!supabase) { setAccess("denied"); router.replace("/login?next=/design-system-preview"); return; }
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) { setAccess("denied"); router.replace("/"); return; }
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
      if (!active) return;
      if (profileError || profile?.role !== "admin" || profile.is_active !== true) {
        setAccess("denied"); router.replace("/"); return;
      }
      setAccess("allowed");
    };
    void verify();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setAccess("denied"); router.replace("/login?next=/design-system-preview"); return; }
      setAccess("checking");
      void verify();
    });
    return () => { active = false; subscription?.unsubscribe(); };
  }, [router]);

  if (access !== "allowed") return <main className="gk-preview"><p className="gk-preview-label">Verifying administrator access…</p></main>;

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      window.setTimeout(() => setCopied(""), 1400);
    } catch {
      setCopied("Clipboard unavailable");
    }
  }

  return (
    <main className="gk-preview" data-theme={theme} data-density={density}>
      <div className="gk-preview-ambient" aria-hidden="true" />
      <header className="gk-preview-topbar">
        <Link className="gk-preview-brand" href="/" aria-label="Gyankunj home">
          <span className="gk-preview-mark">✳</span>
          <span><strong>GYANKUNJ</strong><small>DESIGN SYSTEM LAB</small></span>
        </Link>
        <div className="gk-preview-controls">
          <div className="gk-preview-segment" aria-label="Theme selection">
            <button className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>☼ Light</button>
            <button className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>◐ Dark</button>
          </div>
          <Link className="gk-preview-back" href="/">Back to dashboard ↗</Link>
        </div>
      </header>

      <section className="gk-preview-hero">
        <div className="gk-preview-eyebrow"><span /> EXPERIMENTAL / 01.0 <span className="gk-preview-live">LIVE PREVIEW</span></div>
        <h1>One system.<br /><em>Infinite ways</em> to learn.</h1>
        <p>A Canva-inspired visual language translated into reusable web components, tokens and responsive patterns for the Gyankunj learning universe.</p>
        <div className="gk-preview-hero-actions">
          <button className="gk-preview-primary" onClick={() => copy("var(--gk-gradient-brand)")}>Copy brand gradient ↗</button>
          <span>Rose · Magenta · Violet</span>
        </div>
      </section>

      <section className="gk-preview-section">
        <div className="gk-preview-section-head"><div><span>01 / FOUNDATIONS</span><h2>Color palette & gradients</h2></div><p>Semantic color roles with soft, expressive accents.</p></div>
        <div className="gk-preview-palette">
          {palette.map((color) => <button key={color.name} className="gk-preview-swatch" onClick={() => copy(color.hex)} title={`Copy ${color.hex}`}>
            <span style={{ background: color.hex }} />
            <strong>{color.name}</strong><small>{copied === color.hex ? "Copied!" : color.hex}</small>
          </button>)}
        </div>
        <div className="gk-preview-gradients">
          <button className="gk-preview-gradient gk-preview-gradient-brand" onClick={() => copy("linear-gradient(125deg,#f9a8d4 0%,#ec4899 48%,#a855f7 100%)")}><strong>01 / Brand spectrum</strong><small>Rose → Pink → Violet</small></button>
          <button className="gk-preview-gradient gk-preview-gradient-aurora" onClick={() => copy("radial-gradient(at 15% 10%,#ec4899 0%,transparent 45%),radial-gradient(at 85% 20%,#8b5cf6 0%,transparent 40%),#160d1b")}><strong>02 / Aurora mesh</strong><small>Ambient radial light</small></button>
          <button className="gk-preview-gradient gk-preview-gradient-glass" onClick={() => copy("linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.025))")}><strong>03 / Glass veil</strong><small>Layered translucent surface</small></button>
        </div>
      </section>

      <section className="gk-preview-section">
        <div className="gk-preview-section-head"><div><span>02 / TYPOGRAPHY</span><h2>Editorial meets geometric</h2></div><p>Built for English and Hindi learning content.</p></div>
        <div className="gk-preview-type-grid">
          <article className="gk-preview-card"><span className="gk-preview-label">DISPLAY / SPACE GROTESK</span><div className="gk-type-display">Think<br /><i>beyond.</i></div><p>Clear, confident headlines with a contemporary silhouette.</p></article>
          <article className="gk-preview-card"><span className="gk-preview-label">EDITORIAL / PLAYFAIR DISPLAY</span><div className="gk-type-editorial">The art of<br />understanding.</div><p>Expressive serif accents for essays, editorials and feature stories.</p></article>
          <article className="gk-preview-card"><span className="gk-preview-label">DEVANAGARI / NOTO SANS</span><div className="gk-type-hindi">ज्ञान से<br />सफलता तक।</div><p>Readable Hindi typography for notes, questions and explanations.</p></article>
        </div>
      </section>

      <section className="gk-preview-section">
        <div className="gk-preview-section-head"><div><span>03 / COMPONENTS</span><h2>Surfaces with purpose</h2></div><p>Reusable patterns, not one-off decoration.</p></div>
        <div className="gk-preview-components">
          <article className="gk-preview-card gk-preview-featured">
            <div className="gk-preview-card-top"><span className="gk-preview-label">FEATURED / GLASS BENTO</span><span className="gk-preview-chip">TODAY&apos;S FOCUS</span></div>
            <h3>Build a stronger<br /><em>learning rhythm.</em></h3>
            <p>Small daily actions compound into lasting progress. Keep your focus clear and your momentum steady.</p>
            <div className="gk-preview-card-bottom"><span>DAILY PRACTICE · 15 MIN</span><button className="gk-preview-primary" onClick={() => copy("gk-ds-card--featured")}>Explore component ↗</button></div>
          </article>
          <article className="gk-preview-card gk-preview-stat">
            <span className="gk-preview-label">PROGRESS / STAT CARD</span>
            <div className="gk-preview-stat-number">78<span>%</span></div>
            <p>Weekly learning goal</p>
            <div className="gk-preview-progress"><span /></div>
            <div className="gk-preview-stat-foot"><span>5 of 7 days</span><span>+12% this week</span></div>
          </article>
          <article className="gk-preview-card gk-preview-action-card">
            <span className="gk-preview-label">ACTION / CONTROL SET</span>
            <h3>Ready when you are.</h3>
            <p>Primary, secondary and quiet actions with consistent focus states.</p>
            <div className="gk-preview-action-row"><button className="gk-preview-primary" onClick={() => copy("gk-ds-button")}>Primary action</button><button className="gk-preview-secondary" onClick={() => copy("gk-ds-button-secondary")}>Secondary</button></div>
            <span className="gk-preview-chip">NEW MODULE</span>
          </article>
        </div>
      </section>

      <section className="gk-preview-section">
        <div className="gk-preview-section-head"><div><span>04 / SPACING & SHAPE</span><h2>Rhythm, scale and depth</h2></div><p>Consistent measurements create a calmer interface.</p></div>
        <div className="gk-preview-metrics-grid">
          <article className="gk-preview-card"><span className="gk-preview-label">SPACING SCALE / 4PX BASE</span><div className="gk-preview-spacing">{spacing.map((value) => <button key={value} onClick={() => copy(`${value}px`)}><i style={{ width: value * 1.5 }} /><small>{value}px</small></button>)}</div></article>
          <article className="gk-preview-card"><span className="gk-preview-label">RADIUS SCALE</span><div className="gk-preview-radii">{radii.map((radius) => <button key={radius} onClick={() => copy(radius)}><i style={{ borderRadius: radius }} /><small>{radius}</small></button>)}</div></article>
        </div>
        <article className="gk-preview-card gk-preview-shadow-card"><span className="gk-preview-label">ELEVATION / SHADOW SCALE</span><div className="gk-preview-shadows">{["xs","sm","md","lg","glow"].map((name) => <button key={name} onClick={() => copy(`--gk-shadow-${name}`)}><i className={`shadow-${name}`} /><small>{name.toUpperCase()}</small></button>)}</div></article>
      </section>

      <section className="gk-preview-section">
        <div className="gk-preview-section-head"><div><span>05 / DENSITY TEST</span><h2>Responsive content rhythm</h2></div><p>Preview compact, comfortable or spacious layouts.</p></div>
        <div className="gk-preview-segment gk-preview-density">
          {["compact","comfortable","spacious"].map((value) => <button key={value} className={density === value ? "active" : ""} onClick={() => setDensity(value)}>{value}</button>)}
        </div>
        <div className="gk-preview-density-grid">
          {["Polity & Governance","Economy & Banking","Environment & Ecology"].map((value, index) => <article className="gk-preview-card gk-density-card" key={value}><span className="gk-preview-label">MODULE 0{index+1}</span><h3>{value}</h3><p>Explore key concepts, current affairs connections and practice questions.</p><span className="gk-preview-chip">{12 + index * 4} TOPICS</span></article>)}
        </div>
      </section>

      <footer className="gk-preview-footer"><span>GYANKUNJ / DESIGN SYSTEM EXPERIMENT</span><span>{copied ? copied : "Built for clarity. Designed for momentum."}</span><Link href="/">Return to your learning universe ↑</Link></footer>
    </main>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Style = "cosmic" | "aurora" | "editorial" | "brutal" | "glass" | "minimal";
type Density = "compact" | "comfortable" | "spacious";
type Motion = "minimal" | "dynamic" | "expressive";
type Preferences = { style: Style; theme: Theme; density: Density; motion: Motion };
const STORAGE_KEY = "gyankunj-design-studio-v1";
const DEFAULTS: Preferences = { style: "brutal", theme: "dark", density: "comfortable", motion: "dynamic" };
const STYLES: { id: Style; name: string; description: string; accent: string }[] = [
  { id: "cosmic", name: "Cosmic Orbital", description: "Radial · cinematic · spatial", accent: "#d9b56b" },
  { id: "aurora", name: "Midnight Aurora", description: "Ocean · luminous · glass", accent: "#55c0d0" },
  { id: "editorial", name: "Editorial Swiss", description: "Typographic · precise · calm", accent: "#e0b66c" },
  { id: "brutal", name: "Neo-Brutalist", description: "Bold · graphic · expressive", accent: "#b7f34a" },
  { id: "glass", name: "Soft Glass", description: "Frosted · floating · soft", accent: "#8bc8ff" },
  { id: "minimal", name: "Focus Minimal", description: "Quiet · clean · focused", accent: "#75c8b2" },
];
const valid = <T extends string>(value: unknown, values: readonly T[], fallback: T): T =>
  typeof value === "string" && values.includes(value as T) ? value as T : fallback;
function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && typeof saved === "object") return {
      style: valid(saved.style, ["cosmic","aurora","editorial","brutal","glass","minimal"], DEFAULTS.style),
      theme: valid(saved.theme, ["dark","light"], DEFAULTS.theme),
      density: valid(saved.density, ["compact","comfortable","spacious"], DEFAULTS.density),
      motion: valid(saved.motion, ["minimal","dynamic","expressive"], DEFAULTS.motion),
    };
    const oldTheme = window.localStorage.getItem("gyankunj-theme-v3");
    return { ...DEFAULTS, theme: oldTheme === "light" ? "light" : "dark" };
  } catch { return DEFAULTS; }
}
function applyPreferences(value: Preferences, persist = true) {
  const root = document.documentElement;
  root.dataset.theme = value.theme;
  root.dataset.style = value.style;
  root.dataset.density = value.density;
  root.dataset.motion = value.motion;
  root.style.colorScheme = value.theme;
  if (persist) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* tab remains usable */ }
  }
}
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const initial = readPreferences();
    setPrefs(initial); applyPreferences(initial); setReady(true);
    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const raw = JSON.parse(event.newValue);
        const next: Preferences = {
          style: valid(raw.style, ["cosmic","aurora","editorial","brutal","glass","minimal"], DEFAULTS.style),
          theme: valid(raw.theme, ["dark","light"], DEFAULTS.theme),
          density: valid(raw.density, ["compact","comfortable","spacious"], DEFAULTS.density),
          motion: valid(raw.motion, ["minimal","dynamic","expressive"], DEFAULTS.motion),
        };
        setPrefs(next); applyPreferences(next, false);
      } catch { /* ignore malformed cross-tab values */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const update = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(current => {
      const next = { ...current, [key]: value };
      applyPreferences(next);
      return next;
    });
  }, []);
  const reset = () => { setPrefs(DEFAULTS); applyPreferences(DEFAULTS); };
  return <>
    {children}
    {ready && <>
      <button type="button" className="gk-studio-launcher" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="gk-design-studio">
        <span aria-hidden="true">✳</span><span>DESIGN STUDIO</span>
      </button>
      {open && <div className="gk-studio-backdrop" onClick={() => setOpen(false)}>
        <section id="gk-design-studio" className="gk-studio-panel" role="dialog" aria-modal="true" aria-labelledby="gk-studio-title" onClick={e => e.stopPropagation()}>
          <header className="gk-studio-header">
            <div><span className="gk-studio-kicker">GYANKUNJ / APPEARANCE LAB</span><h2 id="gk-studio-title">Design Studio</h2><p>Make your learning space feel like yours.</p></div>
            <button className="gk-studio-close" onClick={() => setOpen(false)} aria-label="Close design studio">×</button>
          </header>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>01 / VISUAL IDENTITY</span><small>6 DESIGN SYSTEMS</small></div>
            <div className="gk-style-grid">{STYLES.map(style => <button key={style.id} className={`gk-style-option ${prefs.style === style.id ? "is-active" : ""}`} onClick={() => update("style", style.id)} style={{ "--style-accent": style.accent } as React.CSSProperties} aria-pressed={prefs.style === style.id}>
              <span className={`gk-style-swatch gk-style-swatch--${style.id}`}><i/><i/><i/></span><strong>{style.name}</strong><small>{style.description}</small>{prefs.style === style.id && <span className="gk-style-check">✓ ACTIVE</span>}
            </button>)}</div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>02 / APPEARANCE MODE</span></div>
            <div className="gk-studio-segment">{(["dark","light"] as Theme[]).map(v => <button key={v} className={prefs.theme === v ? "is-active" : ""} onClick={() => update("theme",v)} aria-pressed={prefs.theme === v}>{v === "dark" ? "◐  Dark" : "☼  Light"}</button>)}</div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>03 / CONTENT DENSITY</span></div>
            <div className="gk-studio-segment">{(["compact","comfortable","spacious"] as Density[]).map(v => <button key={v} className={prefs.density === v ? "is-active" : ""} onClick={() => update("density",v)} aria-pressed={prefs.density === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>04 / MOTION INTENSITY</span></div>
            <div className="gk-studio-segment">{(["minimal","dynamic","expressive"] as Motion[]).map(v => <button key={v} className={prefs.motion === v ? "is-active" : ""} onClick={() => update("motion",v)} aria-pressed={prefs.motion === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <footer className="gk-studio-footer"><span>Changes apply instantly · saved on this device</span><button onClick={reset}>RESET DEFAULTS ↺</button></footer>
        </section>
      </div>}
    </>}
  </>;
}

"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Density = "compact" | "comfortable" | "spacious";
type Motion = "minimal" | "dynamic" | "expressive";
type Preferences = { style: "cosmic"; theme: "dark"; density: Density; motion: Motion };

const STORAGE_KEY = "gyankunj-design-studio-v1";
const DEFAULTS: Preferences = { style: "cosmic", theme: "dark", density: "comfortable", motion: "dynamic" };

function valid<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === "string" && values.includes(value as T) ? value as T : fallback;
}

function readPreferences(): Preferences {
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return {
      // Cosmic Orbital is the single supported identity. Ignore legacy style values.
      style: "cosmic",
      theme: "dark",
      density: valid(saved?.density, ["compact", "comfortable", "spacious"], DEFAULTS.density),
      motion: valid(saved?.motion, ["minimal", "dynamic", "expressive"], DEFAULTS.motion),
    };
  } catch { return DEFAULTS; }
}

function applyPreferences(value: Preferences, persist = true) {
  const root = document.documentElement;
  root.dataset.theme = "dark";
  root.dataset.style = "cosmic";
  root.dataset.density = value.density;
  root.dataset.motion = value.motion;
  root.style.colorScheme = "dark";
  if (persist) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...value, style: "cosmic", theme: "dark" })); } catch { /* tab remains usable */ }
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const verifyAdmin = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) { setIsAdmin(false); setOpen(false); return; }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role,is_active")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;
      setIsAdmin(!profileError && profile?.role === "admin" && profile.is_active === true);
    };
    void verifyAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setIsAdmin(false); setOpen(false); return; }
      void verifyAdmin();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const initial = readPreferences();
    setPrefs(initial);
    applyPreferences(initial);
    setReady(true);

    const sync = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const raw = JSON.parse(event.newValue);
        const next: Preferences = {
          style: "cosmic",
          theme: "dark",
          density: valid(raw.density, ["compact", "comfortable", "spacious"], DEFAULTS.density),
          motion: valid(raw.motion, ["minimal", "dynamic", "expressive"], DEFAULTS.motion),
        };
        setPrefs(next);
        applyPreferences(next, false);
      } catch { /* ignore malformed cross-tab values */ }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    if (key === "style") return;
    setPrefs(current => {
      const next: Preferences = { ...current, [key]: value, style: "cosmic" };
      applyPreferences(next);
      return next;
    });
  }

  const reset = () => {
    setPrefs(DEFAULTS);
    applyPreferences(DEFAULTS);
  };

  return <>
    {children}
    {ready && isAdmin && <>
      <button type="button" className="gk-studio-launcher" onClick={() => setOpen(v => !v)} aria-expanded={open} aria-controls="gk-design-studio">
        <span aria-hidden="true">✳</span><span>DESIGN STUDIO</span>
      </button>
      {open && <div className="gk-studio-backdrop" onClick={() => setOpen(false)}>
        <section id="gk-design-studio" className="gk-studio-panel" role="dialog" aria-modal="true" aria-labelledby="gk-studio-title" onClick={e => e.stopPropagation()}>
          <header className="gk-studio-header">
            <div><span className="gk-studio-kicker">GYANKUNJ / APPEARANCE LAB</span><h2 id="gk-studio-title">Design Studio</h2><p>One consistent visual identity for the entire learning universe.</p><a className="gk-studio-preview-link" href="/design-system-preview">OPEN FULL DESIGN SYSTEM LAB ↗</a></div>
            <button className="gk-studio-close" onClick={() => setOpen(false)} aria-label="Close design studio">×</button>
          </header>

          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>01 / APP DESIGN</span><small>ONLY DESIGN SYSTEM</small></div>
            <div className="gk-style-grid">
              <div className="gk-style-option is-active" aria-current="true" style={{ "--style-accent": "#d9b56b" } as React.CSSProperties}>
                <span className="gk-style-swatch gk-style-swatch--cosmic"><i/><i/><i/></span>
                <strong>Cosmic Orbital</strong>
                <small>Radial · cinematic · spatial · premium glass</small>
                <span className="gk-style-check">✓ DEFAULT · LOCKED</span>
              </div>
            </div>
          </div>

          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>03 / CONTENT DENSITY</span></div>
            <div className="gk-studio-segment">{(["compact","comfortable","spacious"] as Density[]).map(v => <button key={v} className={prefs.density === v ? "is-active" : ""} onClick={() => update("density",v)} aria-pressed={prefs.density === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>04 / MOTION INTENSITY</span></div>
            <div className="gk-studio-segment">{(["minimal","dynamic","expressive"] as Motion[]).map(v => <button key={v} className={prefs.motion === v ? "is-active" : ""} onClick={() => update("motion",v)} aria-pressed={prefs.motion === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <footer className="gk-studio-footer"><span>Cosmic Orbital · Dark appearance · saved on this device</span><button onClick={reset}>RESET DEFAULTS ↺</button></footer>
        </section>
      </div>}
    </>}
  </>;
}

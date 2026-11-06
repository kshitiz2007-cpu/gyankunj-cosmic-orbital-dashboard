"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Density = "compact" | "comfortable" | "spacious";
type Motion = "minimal" | "dynamic" | "expressive";
type Palette = "lilac" | "nebula" | "rose" | "ocean" | "aurora" | "coral";
type Glass = "frosted" | "clear" | "chromatic" | "liquid";
type Preferences = { style: "cosmic"; theme: "light"; density: Density; motion: Motion; palette: Palette; glass: Glass; glassIntensity: number };

const STORAGE_KEY = "gyankunj-design-studio-v1";
const DEFAULTS: Preferences = { style: "cosmic", theme: "light", density: "comfortable", motion: "dynamic", palette: "lilac", glass: "frosted", glassIntensity: 72 };

function valid<T extends string>(value: unknown, values: readonly T[], fallback: T): T {
  return typeof value === "string" && values.includes(value as T) ? value as T : fallback;
}
function normalize(raw: unknown): Preferences {
  const value = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
  const intensity = value.glassIntensity;
  return {
    style: "cosmic", theme: "light",
    density: valid(value.density, ["compact","comfortable","spacious"], DEFAULTS.density),
    motion: valid(value.motion, ["minimal","dynamic","expressive"], DEFAULTS.motion),
    palette: valid(value.palette, ["lilac","nebula","rose","ocean","aurora","coral"], DEFAULTS.palette),
    glass: valid(value.glass, ["frosted","clear","chromatic","liquid"], DEFAULTS.glass),
    glassIntensity: typeof intensity === "number" && Number.isFinite(intensity)
      ? Math.min(100, Math.max(20, intensity)) : DEFAULTS.glassIntensity,
  };
}
function readLocalPreferences(): Preferences {
  try { return normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null")); }
  catch { return DEFAULTS; }
}
function applyPreferences(value: Preferences, persistLocal = true) {
  const root = document.documentElement;
  root.dataset.theme = "light";
  root.dataset.style = "cosmic";
  root.dataset.density = value.density;
  root.dataset.motion = value.motion;
  root.dataset.palette = value.palette;
  root.dataset.glass = value.glass;
  root.style.setProperty("--gk-glass-intensity", String(value.glassIntensity / 100));
  root.style.colorScheme = "light";
  if (persistLocal) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* server remains source of truth */ }
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
    const apply = (raw: unknown) => {
      const next = normalize(raw);
      if (!active) return;
      setPrefs(next);
      applyPreferences(next);
      setReady(true);
    };

    // Local cache is only a fast first paint. Supabase is the shared source of truth.
    const cached = readLocalPreferences();
    setPrefs(cached);
    applyPreferences(cached);
    setReady(true);

    if (!supabase) return () => { active = false; };

    const loadSharedTheme = async () => {
      const { data, error } = await supabase
        .from("app_theme_settings")
        .select("settings")
        .eq("id", "global")
        .maybeSingle();
      if (active && !error && data?.settings) apply(data.settings);
    };
    void loadSharedTheme();

    const channel = supabase.channel("global-app-theme")
      .on("postgres_changes", { event: "*", schema: "public", table: "app_theme_settings", filter: "id=eq.global" },
        (payload) => {
          const record = payload.new as { settings?: unknown } | undefined;
          if (record?.settings) apply(record.settings);
        })
      .subscribe();

    const verifyAdmin = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !user) { setIsAdmin(false); setOpen(false); return; }
      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("role,is_active").eq("id", user.id).maybeSingle();
      if (!active) return;
      setIsAdmin(!profileError && profile?.role === "admin" && profile.is_active === true);
    };
    void verifyAdmin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setIsAdmin(false); setOpen(false); }
      else void verifyAdmin();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, []);

  async function update<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    if (key === "style" || !isAdmin) return;
    const next = normalize({ ...prefs, [key]: value });
    setPrefs(next);
    applyPreferences(next);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("app_theme_settings").upsert({
      id: "global", settings: next, updated_at: new Date().toISOString(), updated_by: user.id,
    }, { onConflict: "id" });
    if (error) {
      console.error("Unable to publish shared theme settings:", error.message);
      // Restore the last server-published value instead of leaving an admin-only preview.
      const { data } = await supabase.from("app_theme_settings").select("settings").eq("id","global").maybeSingle();
      if (data?.settings) {
        const restored = normalize(data.settings);
        setPrefs(restored);
        applyPreferences(restored);
      }
    }
  }

  const reset = async () => {
    if (!isAdmin) return;
    setPrefs(DEFAULTS);
    applyPreferences(DEFAULTS);
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("app_theme_settings").upsert({
      id: "global", settings: DEFAULTS, updated_at: new Date().toISOString(), updated_by: user.id,
    }, { onConflict: "id" });
    if (error) console.error("Unable to reset shared theme settings:", error.message);
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
            <div><span className="gk-studio-kicker">GYANKUNJ / APPEARANCE LAB</span><h2 id="gk-studio-title">Design Studio</h2><p>One published visual identity for every student and device.</p><a className="gk-studio-preview-link" href="/design-system-preview">OPEN FULL DESIGN SYSTEM LAB ↗</a></div>
            <button className="gk-studio-close" onClick={() => setOpen(false)} aria-label="Close design studio">×</button>
          </header>

          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>01 / APP DESIGN</span><small>ONLY DESIGN SYSTEM</small></div>
            <div className="gk-style-grid"><div className="gk-style-option is-active" aria-current="true" style={{ "--style-accent": "#d9b56b" } as React.CSSProperties}>
              <span className="gk-style-swatch gk-style-swatch--cosmic"><i/><i/><i/></span><strong>Cosmic Orbital</strong><small>Radial · cinematic · spatial · premium glass</small><span className="gk-style-check">✓ DEFAULT · LOCKED</span>
            </div></div>
          </div>

          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>02 / COLOR PALETTES</span><small>LIVE · ALL STUDENTS</small></div>
            <div className="gk-palette-grid">
              {([{id:"lilac",name:"Pastel Lilac",colors:["#BDB0D0","#E6DDF0","#A994C4","#8C76AA"]},{id:"nebula",name:"Nebula",colors:["#0c1020","#8b5cf6","#c084fc","#ec4899"]},{id:"rose",name:"Rose Quartz",colors:["#160d1b","#db2777","#f9a8d4","#a855f7"]},{id:"ocean",name:"Deep Ocean",colors:["#071521","#0e7490","#38bdf8","#818cf8"]},{id:"aurora",name:"Aurora",colors:["#10172b","#14b8a6","#8b5cf6","#a3e635"]},{id:"coral",name:"Coral Waves",colors:["#26152a","#fb7185","#fdba9a","#fbbf24"]}] as const).map(item => <button key={item.id} className={"gk-palette-option "+(prefs.palette===item.id?"is-active":"")} onClick={()=>void update("palette",item.id)} aria-pressed={prefs.palette===item.id}><span className="gk-palette-swatches">{item.colors.map(color=><i key={color} style={{background:color}} />)}</span><strong>{item.name}</strong><small>{prefs.palette===item.id?"PUBLISHED PALETTE":"APPLY TO ALL STUDENTS"}</small></button>)}
            </div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>03 / LIQUID GLASS STYLE</span><small>LIVE MATERIAL PREVIEW</small></div>
            <div className="gk-glass-grid">
              {([{id:"frosted",name:"Frosted panes",desc:"Soft blur · layered depth"},{id:"clear",name:"Clear lenses",desc:"Sharper · transparent"},{id:"chromatic",name:"Chromatic",desc:"Prismatic color edges"},{id:"liquid",name:"Liquid glass",desc:"Lens glow · fluid highlights"}] as const).map(item=><button key={item.id} className={"gk-glass-option "+(prefs.glass===item.id?"is-active":"")} onClick={()=>void update("glass",item.id)} aria-pressed={prefs.glass===item.id}><span className={"gk-glass-demo gk-glass-demo--"+item.id}><i/></span><strong>{item.name}</strong><small>{item.desc}</small></button>)}
            </div>
            <label className="gk-glass-intensity"><span>Glass intensity</span><output>{prefs.glassIntensity}%</output><input type="range" min="20" max="100" step="1" value={prefs.glassIntensity} onChange={e=>void update("glassIntensity",Number(e.target.value))}/></label>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>04 / CONTENT DENSITY</span></div>
            <div className="gk-studio-segment">{(["compact","comfortable","spacious"] as Density[]).map(v => <button key={v} className={prefs.density === v ? "is-active" : ""} onClick={() => void update("density",v)} aria-pressed={prefs.density === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <div className="gk-studio-section">
            <div className="gk-studio-section-title"><span>05 / MOTION INTENSITY</span></div>
            <div className="gk-studio-segment">{(["minimal","dynamic","expressive"] as Motion[]).map(v => <button key={v} className={prefs.motion === v ? "is-active" : ""} onClick={() => void update("motion",v)} aria-pressed={prefs.motion === v}>{v[0].toUpperCase()+v.slice(1)}</button>)}</div>
          </div>
          <footer className="gk-studio-footer"><span>Shared app theme · published to every student session</span><button onClick={() => void reset()}>RESET GLOBAL THEME ↺</button></footer>
        </section>
      </div>}
    </>}
  </>;
}

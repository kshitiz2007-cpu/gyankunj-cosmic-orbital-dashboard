"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "light" | "dark";
const STORAGE_KEY = "gyankunj-theme-v2";

function readTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  root.style.setProperty("color-scheme", theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // The current tab still receives the selected theme.
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = readTheme();
    setTheme(initial);
    applyTheme(initial);
    setReady(true);

    const syncTheme = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const next: Theme = event.newValue === "dark" ? "dark" : "light";
      setTheme(next);
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      const next: Theme = current === "dark" ? "light" : "dark";
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <>
      {children}
      {ready && (
        <button
          type="button"
          className="gyankunj-theme-toggle"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          aria-pressed={theme === "dark"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          <span className="gyankunj-theme-toggle__icon" aria-hidden="true">{theme === "dark" ? "☼" : "☾"}</span>
          <span className="gyankunj-theme-toggle__label">{theme === "dark" ? "LIGHT" : "DARK"}</span>
          <span className="gyankunj-theme-toggle__track" aria-hidden="true"><i /></span>
        </button>
      )}
    </>
  );
}

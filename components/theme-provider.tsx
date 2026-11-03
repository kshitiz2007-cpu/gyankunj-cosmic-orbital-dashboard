"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("gyankunj-theme");
    const preferred: Theme = stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(preferred);
    document.documentElement.dataset.theme = preferred;
    document.documentElement.style.colorScheme = preferred;
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("gyankunj-theme", next);
  };

  return (
    <>
      {children}
      <button
        type="button"
        className="gyankunj-theme-toggle"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        aria-pressed={theme === "dark"}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <span className="gyankunj-theme-toggle__icon" aria-hidden="true">
          {theme === "dark" ? "☼" : "☾"}
        </span>
        <span className="gyankunj-theme-toggle__label">{theme === "dark" ? "LIGHT" : "DARK"}</span>
        <span className="gyankunj-theme-toggle__track" aria-hidden="true"><i /></span>
      </button>
    </>
  );
}

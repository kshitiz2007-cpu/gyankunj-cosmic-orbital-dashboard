"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();
  const [mode,setMode] = useState<"signin"|"signup">("signin");
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true); setMessage(""); setError("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase configuration missing. Please contact the administrator.");
      setBusy(false); return;
    }
    try {
      if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: name.trim() } },
        });
        if (authError) throw authError;
        if (data.session) router.replace("/profile");
        else setMessage("Account created. Check your email for the confirmation link, then sign in.");
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(), password,
        });
        if (authError) throw authError;
        router.replace("/profile");
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-glow auth-glow--one" />
      <div className="auth-glow auth-glow--two" />
      <header className="auth-top">
        <Link href="/" className="auth-brand"><span>✳</span><b>GYANKUNJ</b><small>YOUR KNOWLEDGE UNIVERSE</small></Link>
        <Link href="/" className="auth-back">← Back to dashboard</Link>
      </header>
      <section className="auth-layout">
        <div className="auth-story">
          <span className="auth-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Learn with<br/><em>purpose.</em></h1>
          <p>Your preparation, practice and progress — in one connected learning space.</p>
          <div className="auth-orbit" aria-hidden="true"><i/><i/><i/><span>GK</span></div>
          <div className="auth-footnote">GYANKUNJ · CIVILPREP / STUDENT SPACE</div>
        </div>
        <div className="auth-panel">
          <div className="auth-panel-head">
            <span className="auth-eyebrow">SECURE STUDENT ACCESS</span>
            <h2>{mode === "signin" ? "Welcome back." : "Create your account."}</h2>
            <p>{mode === "signin" ? "Continue your learning journey." : "Join the Gyankunj learning universe."}</p>
          </div>
          <div className="auth-switch">
            <button type="button" className={mode==="signin"?"active":""} onClick={()=>{setMode("signin");setError("");setMessage("");}}>Sign in</button>
            <button type="button" className={mode==="signup"?"active":""} onClick={()=>{setMode("signup");setError("");setMessage("");}}>Create account</button>
          </div>
          <form onSubmit={submit}>
            {mode==="signup" && <label>FULL NAME<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" required minLength={2}/></label>}
            <label>EMAIL ADDRESS<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></label>
            <label>PASSWORD<input type="password" autoComplete={mode==="signin"?"current-password":"new-password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8}/></label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            {message && <p className="auth-message" role="status">{message}</p>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy?"Please wait…":mode==="signin"?"Sign in to Gyankunj ↗":"Create student account ↗"}</button>
          </form>
          <p className="auth-legal">By continuing, you agree to use this learning platform responsibly.</p>
        </div>
      </section>
    </main>
  );
}

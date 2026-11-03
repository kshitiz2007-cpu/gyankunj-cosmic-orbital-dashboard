"use client";
import "./question-bank.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type BankQuestion = {
  id: number;
  question_en: string;
  question_hi: string | null;
  options_en: string[] | null;
  options_hi: string[] | null;
  correct_option: number;
  explanation_en: string | null;
  explanation_hi: string | null;
  topic: string | null;
  difficulty: string | null;
  difficulty_level: string | null;
  question_type: string | null;
  source_name: string | null;
  source_year: number | null;
  source_reference: string | null;
  is_verified: boolean | null;
  assessment_id: string | null;
  created_at: string;
};

const selectFields = "id,question_en,question_hi,options_en,options_hi,correct_option,explanation_en,explanation_hi,topic,difficulty,difficulty_level,question_type,source_name,source_year,source_reference,is_verified,assessment_id,created_at";

export default function QuestionBankWorkspace() {
  const [items, setItems] = useState<BankQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [editing, setEditing] = useState<BankQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    question_en: "", question_hi: "", options_en: ["", "", "", ""], options_hi: ["", "", "", ""],
    correct_option: 0, explanation_en: "", explanation_hi: "", topic: "",
    difficulty_level: "moderate", question_type: "single_choice",
    source_name: "", source_year: "", source_reference: ""
  });

  const load = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError("Supabase client is not configured."); setLoading(false); return; }
    setLoading(true); setError("");
    const { data, error: loadError } = await supabase.from("questions").select(selectFields).order("created_at", { ascending: false }).limit(1000);
    if (loadError) setError(loadError.message);
    else setItems((data || []) as BankQuestion[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => items.filter(q => {
    const haystack = [q.question_en, q.question_hi, q.topic, q.source_name, q.source_reference, String(q.source_year || "")].join(" ").toLowerCase();
    return haystack.includes(search.toLowerCase()) &&
      (!topicFilter || (q.topic || "").toLowerCase().includes(topicFilter.toLowerCase())) &&
      (difficultyFilter === "all" || (q.difficulty_level || q.difficulty || "moderate").toLowerCase() === difficultyFilter) &&
      (verificationFilter === "all" || (verificationFilter === "verified" ? q.is_verified === true : q.is_verified !== true)) &&
      (sourceFilter === "all" || (sourceFilter === "pyq" ? !!q.source_year || !!q.source_name : !q.source_year && !q.source_name));
  }), [items, search, topicFilter, difficultyFilter, verificationFilter, sourceFilter]);

  const reset = () => {
    setEditing(null);
    setForm({ question_en: "", question_hi: "", options_en: ["", "", "", ""], options_hi: ["", "", "", ""], correct_option: 0, explanation_en: "", explanation_hi: "", topic: "", difficulty_level: "moderate", question_type: "single_choice", source_name: "", source_year: "", source_reference: "" });
  };

  const startEdit = (q: BankQuestion) => {
    setEditing(q);
    setForm({
      question_en: q.question_en || "", question_hi: q.question_hi || "",
      options_en: Array.from({ length: 4 }, (_, i) => q.options_en?.[i] || ""),
      options_hi: Array.from({ length: 4 }, (_, i) => q.options_hi?.[i] || ""),
      correct_option: Number(q.correct_option) || 0, explanation_en: q.explanation_en || "",
      explanation_hi: q.explanation_hi || "", topic: q.topic || "",
      difficulty_level: q.difficulty_level || q.difficulty || "moderate",
      question_type: q.question_type || "single_choice", source_name: q.source_name || "",
      source_year: q.source_year ? String(q.source_year) : "", source_reference: q.source_reference || ""
    });
    setNotice("");
  };

  const save = async () => {
    if (!editing) return;
    if (!form.question_en.trim() || !form.question_hi.trim() || form.options_en.some(x => !x.trim()) || form.options_hi.some(x => !x.trim())) {
      setNotice("English/Hindi question and all four bilingual options are required."); return;
    }
    const year = form.source_year.trim() ? Number(form.source_year) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1950 || year > 2100)) { setNotice("Source year must be between 1950 and 2100."); return; }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setNotice("Supabase client is not configured."); return; }
    setSaving(true); setNotice("");
    const payload = {
      question_en: form.question_en.trim(), question_hi: form.question_hi.trim(),
      options_en: form.options_en.map(x => x.trim()), options_hi: form.options_hi.map(x => x.trim()),
      correct_option: form.correct_option, explanation_en: form.explanation_en.trim() || null,
      explanation_hi: form.explanation_hi.trim() || null, topic: form.topic.trim() || null,
      difficulty_level: form.difficulty_level, question_type: form.question_type,
      source_name: form.source_name.trim() || null, source_year: year,
      source_reference: form.source_reference.trim() || null
    };
    const { error: saveError } = await supabase.from("questions").update(payload).eq("id", editing.id);
    if (saveError) setNotice(saveError.message);
    else { setNotice("Question updated successfully."); reset(); await load(); }
    setSaving(false);
  };

  const toggleVerified = async (q: BankQuestion) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const next = q.is_verified !== true;
    const { error: updateError } = await supabase.from("questions").update({ is_verified: next }).eq("id", q.id);
    if (updateError) setNotice(updateError.message);
    else { setItems(prev => prev.map(item => item.id === q.id ? { ...item, is_verified: next } : item)); setNotice(next ? "Question marked as verified." : "Verification removed."); }
  };

  const duplicateCount = useMemo(() => {
    const seen = new Set<string>(); let duplicates = 0;
    items.forEach(q => { const key = (q.question_en || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); if (key && seen.has(key)) duplicates++; else if (key) seen.add(key); });
    return duplicates;
  }, [items]);

  return <div className="qb-workspace">
    <div className="admin-section-label"><span>01 / REUSABLE QUESTION LIBRARY</span><span>{items.length} RECORDS · {duplicateCount} POSSIBLE DUPLICATES</span></div>
    <div className="qb-summary">
      <article><small>TOTAL QUESTIONS</small><strong>{items.length}</strong></article>
      <article><small>VERIFIED</small><strong>{items.filter(q => q.is_verified).length}</strong></article>
      <article><small>PYQ / SOURCED</small><strong>{items.filter(q => q.source_year || q.source_name).length}</strong></article>
      <article><small>UNASSIGNED BANK</small><strong>{items.filter(q => !q.assessment_id).length}</strong></article>
    </div>
    <div className="admin-builder qb-filters">
      <div className="admin-builder-head"><div><span className="admin-kicker">FIND & REVIEW</span><h2>Question <em>library.</em></h2><p className="admin-builder-subtitle">Search bilingual questions, review provenance and verify records before reusing them in practice sets.</p></div><button className="admin-row-action" onClick={() => void load()} disabled={loading}>↻ Refresh</button></div>
      <div className="qb-filter-grid">
        <input aria-label="Search questions" placeholder="Search English, Hindi, topic or source…" value={search} onChange={e => setSearch(e.target.value)} />
        <input aria-label="Filter by topic" placeholder="Filter topic…" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} />
        <select aria-label="Difficulty" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}><option value="all">All difficulty</option><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
        <select aria-label="Verification" value={verificationFilter} onChange={e => setVerificationFilter(e.target.value)}><option value="all">All verification</option><option value="verified">Verified only</option><option value="unverified">Needs review</option></select>
        <select aria-label="Source" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}><option value="all">All sources</option><option value="pyq">PYQ / sourced</option><option value="other">No source metadata</option></select>
      </div>
      <p className="qb-result-count">Showing {filtered.length} of {items.length} questions</p>
    </div>
    {error && <div className="admin-csv-errors" role="alert">{error}<p>Confirm that migration 0007 was applied and refresh the page.</p></div>}
    {notice && <p className="admin-csv-success" role="status">{notice}</p>}
    {editing && <div className="admin-builder qb-editor">
      <div className="admin-builder-head"><div><span className="admin-kicker">BILINGUAL QUESTION EDITOR</span><h2>Review <em>question #{editing.id}.</em></h2></div><button className="admin-row-action" onClick={reset}>Close editor</button></div>
      <div className="admin-form-grid">
        <label>QUESTION (EN)<textarea rows={3} value={form.question_en} onChange={e => setForm(p => ({ ...p, question_en: e.target.value }))} /></label>
        <label>प्रश्न (HI)<textarea rows={3} value={form.question_hi} onChange={e => setForm(p => ({ ...p, question_hi: e.target.value }))} /></label>
        {form.options_en.map((value, i) => <label key={i}>OPTION {String.fromCharCode(65+i)} (EN)<input value={value} onChange={e => setForm(p => ({ ...p, options_en: p.options_en.map((v, j) => j === i ? e.target.value : v) }))} /></label>)}
        {form.options_hi.map((value, i) => <label key={i}>विकल्प {String.fromCharCode(65+i)} (HI)<input value={value} onChange={e => setForm(p => ({ ...p, options_hi: p.options_hi.map((v, j) => j === i ? e.target.value : v) }))} /></label>)}
        <label>CORRECT OPTION<select value={String(form.correct_option)} onChange={e => setForm(p => ({ ...p, correct_option: Number(e.target.value) }))}>{[0,1,2,3].map(i => <option key={i} value={i}>{String.fromCharCode(65+i)}</option>)}</select></label>
        <label>QUESTION TYPE<select value={form.question_type} onChange={e => setForm(p => ({ ...p, question_type: e.target.value }))}><option value="single_choice">Single choice</option><option value="multiple_select">Multiple select</option><option value="true_false">True / False</option></select></label>
        <label>DIFFICULTY<select value={form.difficulty_level} onChange={e => setForm(p => ({ ...p, difficulty_level: e.target.value }))}><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option></select></label>
        <label>TOPIC / SUBTOPIC<input value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} /></label>
        <label>PYQ SOURCE / EXAM<input value={form.source_name} onChange={e => setForm(p => ({ ...p, source_name: e.target.value }))} placeholder="UPSC CSE Prelims" /></label>
        <label>SOURCE YEAR<input type="number" min="1950" max="2100" value={form.source_year} onChange={e => setForm(p => ({ ...p, source_year: e.target.value }))} /></label>
        <label>SOURCE REFERENCE<input value={form.source_reference} onChange={e => setForm(p => ({ ...p, source_reference: e.target.value }))} placeholder="Paper / question number / URL" /></label>
        <label className="admin-wide-field">EXPLANATION (EN)<textarea rows={3} value={form.explanation_en} onChange={e => setForm(p => ({ ...p, explanation_en: e.target.value }))} /></label>
        <label className="admin-wide-field">व्याख्या (HI)<textarea rows={3} value={form.explanation_hi} onChange={e => setForm(p => ({ ...p, explanation_hi: e.target.value }))} /></label>
      </div>
      <div className="admin-form-footer"><span>Changes save directly to the reusable question record.</span><button onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save question changes ↗"}</button></div>
    </div>}
    <div className="admin-section-label"><span>02 / QUESTION RECORDS</span><span>EDIT · VERIFY</span></div>
    <div className="admin-table-wrap"><table><thead><tr><th>QUESTION</th><th>TOPIC / DIFFICULTY</th><th>SOURCE</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>
      {filtered.map(q => <tr key={q.id}><td><strong>{q.question_en}</strong><small lang="hi">{q.question_hi || "Hindi translation missing"}</small><small>{q.options_en?.length || 0} options · ID {q.id}</small></td><td>{q.topic || "Unmapped"}<small>{q.difficulty_level || q.difficulty || "moderate"} · {(q.question_type || "single_choice").replace("_", " ")}</small></td><td>{q.source_name || "—"}<small>{q.source_year || ""}{q.source_reference ? " · " + q.source_reference : ""}</small></td><td><span className="admin-record-status">{q.is_verified ? "Verified" : "Needs review"}</span><small>{q.assessment_id ? "Linked to assessment" : "Reusable bank"}</small></td><td><div className="admin-row-actions"><button onClick={() => startEdit(q)}>Edit</button><button onClick={() => void toggleVerified(q)}>{q.is_verified ? "Unverify" : "Verify"}</button></div></td></tr>)}
    </tbody></table>{loading && <p className="admin-empty">Loading question library…</p>}{!loading && filtered.length === 0 && <p className="admin-empty">No questions match these filters.</p>}</div>
    <p className="admin-table-note">Duplicate indicator is a text-normalization heuristic, not a guaranteed duplicate detector. Existing assessment-linked questions remain linked and are not modified unless you edit that record.</p>
  </div>;
}

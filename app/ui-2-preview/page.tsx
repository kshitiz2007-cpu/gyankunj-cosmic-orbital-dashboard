import Link from "next/link";
import { ActionLink, Panel, SectionHeading, Stat, StoryRow } from "@/components/ui2/primitives";

const stories=[
 {title:"Why heat resilience must become a core urban service",summary:"A policy lens on urban planning, public health and climate adaptation.",meta:"GS III",href:"/current-affairs"},
 {title:"The constitutional architecture of local self-government",summary:"Trace the 73rd and 74th Amendments through implementation outcomes.",meta:"GS II",href:"/library"},
 {title:"India’s semiconductor ecosystem: capability beyond incentives",summary:"Connect industrial policy, strategic autonomy and technology supply chains.",meta:"GS III",href:"/current-affairs"},
];
export default function UI2PreviewPage(){
 return <main className="gk2-app" data-gk2-theme="paper">
  <div className="gk2-preview-shell">
   <header className="gk2-preview-nav"><Link href="/" className="gk2-preview-brand"><span>G.</span><b>GYANKUNJ</b><small>LEARNING / RESEARCH / PRACTICE</small></Link><div className="gk2-preview-navlinks"><span>THE WORKSPACE</span><span>UI 2.0 / FOUNDATION</span></div></header>
   <div className="gk2-page gk2-shell">
    <section className="gk2-preview-hero">
     <div className="gk2-preview-hero-copy"><span className="gk2-eyebrow">A NEW WAY TO PREPARE / 2026</span><h1 className="gk2-display">Think clearly.<br/><em>Prepare deeply.</em></h1><p className="gk2-hindi">समाचार, पाठ्यक्रम और अभ्यास को एक सुव्यवस्थित learning workspace में जोड़ें। तथ्यों से समझ तक—हर कदम उद्देश्यपूर्ण।</p><div className="gk2-preview-actions"><ActionLink href="/current-affairs">Explore today’s brief ↗</ActionLink><ActionLink href="/library" variant="secondary">Open study library</ActionLink></div></div>
     <Panel variant="ink" className="gk2-preview-feature"><span className="gk2-eyebrow">FIELD NOTE / 07 NOV</span><div className="gk2-feature-mark">07<span> / 11</span></div><div className="gk2-feature-rule"/><h2>From information<br/>to understanding.</h2><p>Read the issue. Find the context. Build an answer.</p><span className="gk2-tag">THE DAILY BRIEF</span></Panel>
    </section>
    <section className="gk2-section"><SectionHeading index="01" title="Your learning pulse" action={<Link className="gk2-link" href="/progress">Full report ↗</Link>}/><div className="gk2-grid"><Panel className="gk2-span-3"><Stat label="Study consistency" value="—" detail="Your recent activity"/></Panel><Panel className="gk2-span-3"><Stat label="Practice accuracy" value="—" detail="From submitted attempts"/></Panel><Panel className="gk2-span-3"><Stat label="Topics revised" value="—" detail="Syllabus progress"/></Panel><Panel className="gk2-span-3"><Stat label="Recall strength" value="—" detail="Memory Vault mastery"/></Panel></div></section>
    <section className="gk2-section"><SectionHeading index="02" title="Ideas worth your time" action={<Link className="gk2-link" href="/current-affairs">All editorials ↗</Link>}/><div className="gk2-preview-stories">{stories.map((s,i)=><StoryRow key={s.title} index={String(i+1).padStart(2,"0")} title={s.title} summary={s.summary} meta={s.meta} href={s.href}/>)}</div></section>
    <section className="gk2-section gk2-preview-bottom"><div><span className="gk2-eyebrow">03 / NEXT ACTION</span><h2>Make today count.</h2><p className="gk2-hindi">एक छोटा अभ्यास, एक स्पष्ट विचार और एक बेहतर उत्तर।</p></div><div className="gk2-preview-actions"><ActionLink href="/practice/daily">Start Daily Drill ↗</ActionLink><ActionLink href="/vault" variant="secondary">Revise Memory Vault</ActionLink></div></section>
   </div>
   <footer className="gk2-preview-footer"><span>GYANKUNJ / UI 2.0</span><span>ATLAS — FIELDWORK DESIGN FOUNDATION</span><Link href="/">Return to current app ↗</Link></footer>
  </div>
 </main>;
}

import { ArrowUpRight, Atom, BookOpen, BrainCircuit, Flame, GraduationCap, Orbit, Sparkles, Target, Trophy } from 'lucide-react';

const modules = [
  { icon: BookOpen, title: 'Daily Editorial', subtitle: 'Decode the ideas shaping India', tag: 'READ · 12 MIN', tone: 'peach' },
  { icon: BrainCircuit, title: 'Daily Drill', subtitle: 'Sharpen recall with focused practice', tag: '10 QUESTIONS', tone: 'violet' },
  { icon: Target, title: 'Mains Practice', subtitle: 'Turn knowledge into answer-writing skill', tag: 'GS · DAILY', tone: 'blue' },
  { icon: Atom, title: 'Explore Library', subtitle: 'Build concepts, one topic at a time', tag: 'STUDY SPACE', tone: 'rose' },
];

export default function Home() {
  return (
    <main className="landing-shell">
      <header className="landing-topbar">
        <a className="landing-brand" href="#home"><span className="landing-brand-mark"><Orbit size={22} /></span><span>gyankunj<span className="landing-brand-dot">.</span><small>ACADEMY</small></span></a>
        <nav className="landing-top-links"><a href="#today">Today&apos;s glimpses</a><a href="#modules">Learning space</a><a href="#progress">Your progress</a></nav>
        <button className="landing-profile-button" aria-label="Open profile">K</button>
      </header>

      <section className="landing-hero" id="home">
        <div className="landing-hero-copy">
          <div className="landing-eyebrow"><span className="landing-live-dot" /> YOUR LEARNING UNIVERSE</div>
          <h1>Make every day<br /><em>count.</em></h1>
          <p>A little progress each day adds up to extraordinary results. Your next breakthrough starts here.</p>
          <a className="landing-primary-cta" href="#modules">Enter your orbit <ArrowUpRight size={17} /></a>
        </div>
        <div className="landing-orbit-art" aria-label="Decorative orbital illustration">
          <div className="landing-orbit-ring landing-ring-one" /><div className="landing-orbit-ring landing-ring-two" /><div className="landing-orbit-ring landing-ring-three" />
          <div className="landing-planet-main"><GraduationCap size={42} strokeWidth={1.2} /></div>
          <span className="landing-orbit-node landing-node-one"><Sparkles size={17} /></span><span className="landing-orbit-node landing-node-two"><BookOpen size={16} /></span><span className="landing-orbit-node landing-node-three"><Atom size={17} /></span>
          <span className="landing-orbit-caption">KNOWLEDGE IN MOTION</span>
        </div>
        <div className="landing-hero-foot"><span>01 / YOUR JOURNEY</span><span>DISCOVER · LEARN · EVOLVE</span></div>
      </section>

      <section className="landing-welcome-row" id="today"><div><span className="landing-section-kicker">THURSDAY · YOUR DAILY PULSE</span><h2>Good to see you again.</h2><p>Your goals are closer than they feel. Let&apos;s make today meaningful.</p></div><div className="landing-streak"><Flame size={20} /><div><strong>Keep your rhythm</strong><span>Show up. Learn. Repeat.</span></div></div></section>

      <section className="landing-module-section" id="modules"><div className="landing-section-heading"><div><span className="landing-section-kicker">THE LEARNING CONSTELLATION</span><h2>Choose your next move</h2></div><a href="#progress" className="landing-text-link">Explore all <ArrowUpRight size={16} /></a></div>
        <div className="landing-module-grid">{modules.map((item, index) => { const Icon = item.icon; return <a className={`landing-module-card ${item.tone}`} href="#progress" key={item.title}><div className="landing-module-top"><span className="landing-module-icon"><Icon size={21} /></span><span className="landing-module-index">0{index + 1}</span></div><div><span className="landing-module-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.subtitle}</p></div><span className="landing-module-arrow"><ArrowUpRight size={18} /></span></a>; })}</div>
      </section>

      <section className="landing-progress-panel" id="progress"><div><span className="landing-section-kicker">A JOURNEY, NOT A RACE</span><h2>Consistency creates momentum.</h2><p>Your personal learning dashboard will bring your study streaks, quiz accuracy, saved resources and milestones together.</p></div><div className="landing-progress-orb"><Trophy size={27} /><span>YOUR</span><strong>ORBIT</strong></div></section>
      <footer><a className="landing-brand landing-footer-brand" href="#home"><span className="landing-brand-mark"><Orbit size={18} /></span><span>gyankunj<span className="landing-brand-dot">.</span></span></a><span>LEARN WITH PURPOSE. GROW WITHOUT LIMITS.</span><span>© 2026 GYANKUNJ ACADEMY</span></footer>
    </main>
  );
}

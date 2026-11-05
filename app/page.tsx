import { ArrowUpRight, Atom, BookOpen, BrainCircuit, Flame, GraduationCap, Orbit, Sparkles, Target, Trophy } from 'lucide-react';

const modules = [
  { icon: BookOpen, title: 'Daily Editorial', subtitle: 'Decode the ideas shaping India', tag: 'READ · 12 MIN', tone: 'peach' },
  { icon: BrainCircuit, title: 'Daily Drill', subtitle: 'Sharpen recall with focused practice', tag: '10 QUESTIONS', tone: 'violet' },
  { icon: Target, title: 'Mains Practice', subtitle: 'Turn knowledge into answer-writing skill', tag: 'GS · DAILY', tone: 'blue' },
  { icon: Atom, title: 'Explore Library', subtitle: 'Build concepts, one topic at a time', tag: 'STUDY SPACE', tone: 'rose' },
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#home"><span className="brand-mark"><Orbit size={22} /></span><span>gyankunj<span className="brand-dot">.</span><small>ACADEMY</small></span></a>
        <nav className="top-links"><a href="#today">Today&apos;s glimpses</a><a href="#modules">Learning space</a><a href="#progress">Your progress</a></nav>
        <button className="profile-button" aria-label="Open profile">K</button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="live-dot" /> YOUR LEARNING UNIVERSE</div>
          <h1>Make every day<br /><em>count.</em></h1>
          <p>A little progress each day adds up to extraordinary results. Your next breakthrough starts here.</p>
          <a className="primary-cta" href="#modules">Enter your orbit <ArrowUpRight size={17} /></a>
        </div>
        <div className="orbit-art" aria-label="Decorative orbital illustration">
          <div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-ring ring-three" />
          <div className="planet planet-main"><GraduationCap size={42} strokeWidth={1.2} /></div>
          <span className="orbit-node node-one"><Sparkles size={17} /></span><span className="orbit-node node-two"><BookOpen size={16} /></span><span className="orbit-node node-three"><Atom size={17} /></span>
          <span className="orbit-caption">KNOWLEDGE IN MOTION</span>
        </div>
        <div className="hero-foot"><span>01 / YOUR JOURNEY</span><span>DISCOVER · LEARN · EVOLVE</span></div>
      </section>

      <section className="welcome-row" id="today"><div><span className="section-kicker">THURSDAY · YOUR DAILY PULSE</span><h2>Good to see you again.</h2><p>Your goals are closer than they feel. Let&apos;s make today meaningful.</p></div><div className="streak"><Flame size={20} /><div><strong>Keep your rhythm</strong><span>Show up. Learn. Repeat.</span></div></div></section>

      <section className="module-section" id="modules"><div className="section-heading"><div><span className="section-kicker">THE LEARNING CONSTELLATION</span><h2>Choose your next move</h2></div><a href="#progress" className="text-link">Explore all <ArrowUpRight size={16} /></a></div>
        <div className="module-grid">{modules.map((item, index) => { const Icon = item.icon; return <a className={`module-card ${item.tone}`} href="#progress" key={item.title}><div className="module-top"><span className="module-icon"><Icon size={21} /></span><span className="module-index">0{index + 1}</span></div><div><span className="module-tag">{item.tag}</span><h3>{item.title}</h3><p>{item.subtitle}</p></div><span className="module-arrow"><ArrowUpRight size={18} /></span></a>; })}</div>
      </section>

      <section className="progress-panel" id="progress"><div><span className="section-kicker">A JOURNEY, NOT A RACE</span><h2>Consistency creates momentum.</h2><p>Your personal learning dashboard will bring your study streaks, quiz accuracy, saved resources and milestones together.</p></div><div className="progress-orb"><Trophy size={27} /><span>YOUR</span><strong>ORBIT</strong></div></section>
      <footer><a className="brand footer-brand" href="#home"><span className="brand-mark"><Orbit size={18} /></span><span>gyankunj<span className="brand-dot">.</span></span></a><span>LEARN WITH PURPOSE. GROW WITHOUT LIMITS.</span><span>© 2026 GYANKUNJ ACADEMY</span></footer>
    </main>
  );
}

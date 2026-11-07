import Link from "next/link";
import styles from "./preview.module.css";
import "../../components/nextgen/design-tokens.css";

const modules = [
  { n:"01", title:"Daily Editorial", detail:"Read · Analyse · Connect", href:"/current-affairs", tone:"rose", tag:"TODAY'S INSIGHT" },
  { n:"02", title:"Daily Drill", detail:"5 questions · Build consistency", href:"/practice/daily", tone:"violet", tag:"PRACTICE NOW" },
  { n:"03", title:"Mains Practice", detail:"Think · Structure · Write", href:"/todays-glimpses#mains", tone:"cyan", tag:"WRITE & REFLECT" },
];
const nav = [{label:"Home",href:"/"},{label:"Study",href:"/library"},{label:"Practice",href:"/practice/daily"},{label:"Editorial",href:"/current-affairs"},{label:"Vault",href:"/vault"},{label:"Progress",href:"/progress"},{label:"Syllabus",href:"/syllabus"}];
export default function NextGenPreviewPage(){
 return <main className={styles.app}>
  <aside className={styles.rail}>
   <Link href="/" className={styles.brand}><span className={styles.brandMark}>✳</span><span>GYANKUNJ<small>LEARNING UNIVERSE</small></span></Link>
   <span className={styles.railLabel}>YOUR WORKSPACE</span>
   {nav.map((item,i)=><Link key={item.href} href={item.href} className={i===0?styles.navActive:styles.navItem}><span>{["⌂","▤","◎","▧","✧","◷","⌘"][i]}</span>{item.label}</Link>)}
   <div className={styles.railBottom}><span className={styles.avatar}>GK</span><span>Learning profile<small>UPSC · CSE</small></span></div>
  </aside>
  <section className={styles.main}>
   <header className={styles.topbar}><div><span className={styles.breadcrumb}>GYANKUNJ / OVERVIEW</span><span className={styles.date}>SATURDAY, 07 NOVEMBER 2026</span></div><div className={styles.topActions}><button aria-label="Search">⌕</button><button aria-label="Notifications">♧</button><span className={styles.avatar}>GK</span></div></header>
   <div className={styles.content}>
    <section className={styles.hero}>
     <div className={styles.heroCopy}><span className={styles.eyebrow}>YOUR LEARNING, IN MOTION <i/></span><h1>Make today<br/> <em>count.</em></h1><p>A little progress every day becomes extraordinary preparation.</p><Link href="/library" className={styles.heroButton}>Continue learning <span>↗</span></Link></div>
     <div className={styles.heroOrb}><div className={styles.orbit orbitOne}/><div className={styles.orbit orbitTwo}/><div className={styles.orbCore}><span>GK</span><small>YOUR<br/>UNIVERSE</small></div><span className={styles.orbitDot}/></div>
     <span className={styles.heroIndex}>01 <i/> LEARNING COMMAND CENTRE</span>
    </section>
    <section className={styles.welcomeRow}><div><span className={styles.eyebrow}>SATURDAY · DAILY FOCUS</span><h2>Good morning, <em>scholar.</em></h2><p>Your next milestone starts with one focused session.</p></div><div className={styles.streak}><span>✦</span><strong>Keep your<br/>streak alive</strong><small>DAILY CONSISTENCY</small></div></section>
    <section className={styles.stats}>
     <article className={styles.statCard}><span>LEARNING STREAK</span><strong>— <small>days</small></strong><i>Keep showing up</i></article>
     <article className={styles.statCard}><span>QUESTIONS ANSWERED</span><strong>—</strong><i>Your practice adds up</i></article>
     <article className={styles.statCard}><span>TOPICS MASTERED</span><strong>—</strong><i>One concept at a time</i></article>
    </section>
    <section className={styles.sectionHead}><div><span className={styles.eyebrow}>THE DAILY THREE / 01</span><h2>Today's <em>focus.</em></h2></div><Link href="/todays-glimpses">View daily bundle ↗</Link></section>
    <section className={styles.dailyGrid}>{modules.map((item,i)=><Link href={item.href} key={item.n} className={styles["daily"+item.tone]}><span className={styles.cardTop}><small>{item.n} / {item.tag}</small><b>↗</b></span><span className={styles.cardNumber}>0{i+1}</span><h3>{item.title}</h3><p>{item.detail}</p><span className={styles.cardFoot}>OPEN MODULE <b>↗</b></span></Link>)}</section>
    <section className={styles.lowerGrid}><article className={styles.continue}><span className={styles.eyebrow}>PICK UP WHERE YOU LEFT OFF</span><h2>Continue your<br/><em>study journey.</em></h2><p>Your saved subjects and resources will appear here.</p><Link href="/library">Explore study library ↗</Link></article><article className={styles.weekly}><span className={styles.eyebrow}>YOUR WEEKLY PULSE</span><h3>Consistency over intensity.</h3><div className={styles.weekBars}>{[36,58,42,78,50,88,24].map((v,i)=><span key={i} style={{height:v+"%"}}><i/></span>)}</div><small>Activity insights connect to your saved learning history.</small></article></section>
    <footer className={styles.footer}>GYANKUNJ ACADEMY <span>LEARN WITH INTENTION · GROW WITH PURPOSE</span></footer>
   </div>
  </section>
  <nav className={styles.mobileDock} aria-label="Mobile navigation">{nav.slice(0,5).map((item,i)=><Link key={item.href} href={item.href} className={i===0?styles.mobileActive:""}><span>{["⌂","▤","◎","▧","✧"][i]}</span><small>{item.label}</small></Link>)}</nav>
 </main>
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

export function GlassSurface({children,className="",as="section"}:{children:ReactNode;className?:string;as?:"section"|"article"|"div"}){
 const Tag=as;
 return <Tag className={["gn-glass",className].filter(Boolean).join(" ")}>{children}</Tag>;
}
export function PageHeading({eyebrow,title,accent,description,action}:{eyebrow:string;title:string;accent?:string;description?:string;action?:{label:string;href:string}}){
 return <header className="gn-page-heading">
  <span className="gn-eyebrow">{eyebrow}</span>
  <h1 className="gn-display">{title} {accent&&<em className="gn-gradient-text">{accent}</em>}</h1>
  {description&&<p>{description}</p>}
  {action&&<Link className="gn-action-link" href={action.href}>{action.label} ↗</Link>}
 </header>;
}
export function MetricCard({label,value,detail,accent}:{label:string;value:string|number;detail?:string;accent?:string}){
 return <article className="gn-metric-card"><span>{label}</span><strong style={accent?{"--gn-metric-accent":accent} as CSSProperties:undefined}>{value}</strong>{detail&&<small>{detail}</small>}</article>;
}
const links=[{label:"Home",href:"/",icon:"⌂"},{label:"Study",href:"/library",icon:"▤"},{label:"Practice",href:"/practice/daily",icon:"◎"},{label:"Editorial",href:"/current-affairs",icon:"▧"},{label:"Vault",href:"/vault",icon:"✧"},{label:"Progress",href:"/progress",icon:"◷"},{label:"Syllabus",href:"/syllabus",icon:"⌘"}];
export function AdaptiveNavigation(){
 const pathname=usePathname()||"/";
 const active=(href:string)=>href==="/"?pathname==="/":pathname===href||pathname.startsWith(href+"/");
 return <>
  <aside className="gn-desktop-rail"><Link href="/" className="gn-brand"><span>✳</span>GYANKUNJ</Link><small className="gn-nav-caption">YOUR WORKSPACE</small>{links.map(x=><Link key={x.href} href={x.href} className={active(x.href)?"gn-nav-link is-active":"gn-nav-link"}><i>{x.icon}</i>{x.label}</Link>)}</aside>
  <nav className="gn-mobile-dock" aria-label="Primary navigation">{links.slice(0,5).map(x=><Link key={x.href} href={x.href} className={active(x.href)?"is-active":""}><i>{x.icon}</i><small>{x.label}</small></Link>)}</nav>
 </>;
}

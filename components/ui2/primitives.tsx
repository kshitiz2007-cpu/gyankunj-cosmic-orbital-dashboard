import type { CSSProperties, ReactNode } from "react";

type PanelProps={children:ReactNode;className?:string;variant?:"paper"|"raised"|"ink";as?:"section"|"article"|"div"};
export function Panel({children,className="",variant="paper",as="section"}:PanelProps){
  const Tag=as;
  return <Tag className={["gk2-panel",variant==="raised"?"gk2-panel--raised":"",variant==="ink"?"gk2-panel--ink":"",className].filter(Boolean).join(" ")}>{children}</Tag>;
}
export function PageHeader({eyebrow,title,description,aside}:{eyebrow:string;title:string;description?:string;aside?:ReactNode}){
  return <header className="gk2-page-header"><div><span className="gk2-eyebrow">{eyebrow}</span><h1>{title}</h1>{description&&<p>{description}</p>}</div>{aside&&<div>{aside}</div>}</header>;
}
export function SectionHeading({index,title,action}:{index?:string;title:string;action?:ReactNode}){
  return <div className="gk2-section-head"><div className="gk2-section-head__title">{index&&<span className="gk2-section-index">{index} / </span>}<h2>{title}</h2></div>{action}</div>;
}
export function Stat({label,value,detail,className="",style}:{label:string;value:ReactNode;detail?:string;className?:string;style?:CSSProperties}){
  return <div className={["gk2-stat",className].filter(Boolean).join(" ")} style={style}><strong>{value}</strong><span>{label}</span>{detail&&<small className="gk2-muted">{detail}</small>}</div>;
}
export function ActionLink({href,children,variant="primary"}:{href:string;children:ReactNode;variant?:"primary"|"secondary"|"quiet"}){
  return <a href={href} className={["gk2-button","gk2-button--"+variant].join(" ")}>{children}</a>;
}
export function StoryRow({index,title,summary,meta,href}:{index:string;title:string;summary?:string;meta?:string;href:string}){
  return <a href={href} className="gk2-story-row" style={{color:"inherit",textDecoration:"none"}}><span className="gk2-story-row__index">{index}</span><span><h3>{title}</h3>{summary&&<p>{summary}</p>}</span>{meta&&<span className="gk2-tag">{meta}</span>}</a>;
}

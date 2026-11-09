"use client";

import {useEffect,useRef,useState} from "react";
import {usePathname,useRouter} from "next/navigation";
import {HugeiconsIcon} from "@hugeicons/react";
import {
 Home01Icon,Notebook01Icon,NewspaperIcon,Brain01Icon,Layers01Icon,
 ChartLineData01Icon,Compass01Icon,SparklesIcon,ArrowUpRight01Icon,
 Clock01Icon,PenTool01Icon
} from "@hugeicons/core-free-icons";
import "./student-floating-navigation.css";

type NavItem={id:string;label:string;href:string;icon:typeof Home01Icon;actions:{label:string;href:string;icon:typeof ArrowUpRight01Icon}[]};
const items:NavItem[]=[
 {id:"home",label:"Home",href:"/",icon:Home01Icon,actions:[{label:"Today’s glimpses",href:"/todays-glimpses",icon:NewspaperIcon},{label:"My progress",href:"/progress",icon:ChartLineData01Icon}]},
 {id:"drill",label:"Drill",href:"/practice/daily",icon:Notebook01Icon,actions:[{label:"Daily drill",href:"/practice/daily",icon:Notebook01Icon},{label:"Drill archive",href:"/practice/daily/archive",icon:Clock01Icon}]},
 {id:"editorial",label:"Editorial",href:"/current-affairs",icon:NewspaperIcon,actions:[{label:"Today’s editorial",href:"/todays-glimpses#editorial",icon:NewspaperIcon},{label:"All editorials",href:"/current-affairs",icon:ArrowUpRight01Icon}]},
 {id:"vault",label:"Vault",href:"/vault",icon:Brain01Icon,actions:[{label:"Memory Vault",href:"/vault",icon:Brain01Icon},{label:"Review progress",href:"/progress",icon:ChartLineData01Icon}]},
 {id:"library",label:"Library",href:"/library",icon:Layers01Icon,actions:[{label:"Study library",href:"/library",icon:Layers01Icon},{label:"Explore syllabus",href:"/syllabus",icon:Compass01Icon}]},
 {id:"progress",label:"Progress",href:"/progress",icon:ChartLineData01Icon,actions:[{label:"Learning analytics",href:"/progress",icon:ChartLineData01Icon},{label:"Continue practice",href:"/practice/daily",icon:Notebook01Icon}]},
 {id:"syllabus",label:"Syllabus",href:"/syllabus",icon:Compass01Icon,actions:[{label:"Explore syllabus",href:"/syllabus",icon:Compass01Icon},{label:"Practice questions",href:"/practice/daily",icon:Notebook01Icon}]}
];
const orbActions=[
 {label:"Daily Drill",href:"/practice/daily",icon:Notebook01Icon,sub:"PRACTICE TODAY"},
 {label:"Daily Editorial",href:"/todays-glimpses#editorial",icon:NewspaperIcon,sub:"READ & ANALYSE"},
 {label:"Mains Practice",href:"/todays-glimpses#mains",icon:PenTool01Icon,sub:"WRITE YOUR ANSWER"}
];
function activeFor(path:string,item:NavItem){if(item.id==="editorial"&&path.startsWith("/todays-glimpses"))return true;return item.href==="/"?path==="/":path===item.href||path.startsWith(item.href+"/");}
export default function StudentFloatingNavigation(){
 const pathname=usePathname()||"/";const router=useRouter();
 const [orbOpen,setOrbOpen]=useState(false);const [quickFor,setQuickFor]=useState<string|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const suppressClick=useRef(false);
 const hidden=pathname.startsWith("/admin")||pathname==="/login"||pathname==="/"||pathname==="/dashboard-preview"||pathname.startsWith("/auth/");
 const clearPress=()=>{if(timer.current){clearTimeout(timer.current);timer.current=null;}};
 useEffect(()=>{setOrbOpen(false);setQuickFor(null);},[pathname]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 const beginPress=(id:string)=>{clearPress();timer.current=setTimeout(()=>{suppressClick.current=true;setOrbOpen(false);setQuickFor(id);if(typeof navigator!=="undefined"&&"vibrate" in navigator)navigator.vibrate?.(12);},520);};
 const endPress=()=>clearPress();
 const handleItemClick=(item:NavItem)=>{if(suppressClick.current){suppressClick.current=false;return;}setQuickFor(null);router.push(item.href);};
 if(hidden)return null;
 return <div className="gk-student-nav-root">
  {(orbOpen||quickFor)&&<button className="gk-nav-scrim" aria-label="Close quick navigation" onClick={()=>{setOrbOpen(false);setQuickFor(null);}}/>}
  {quickFor&&<div className="gk-quick-panel" role="menu" aria-label={items.find(x=>x.id===quickFor)?.label+" quick actions"}>
   <span className="gk-quick-kicker">QUICK ACTIONS · {items.find(x=>x.id===quickFor)?.label.toUpperCase()}</span>
   {items.find(x=>x.id===quickFor)?.actions.map(action=><button key={action.href+action.label} role="menuitem" onClick={()=>{setQuickFor(null);router.push(action.href);}}><HugeiconsIcon icon={action.icon} size={17}/><span>{action.label}</span><HugeiconsIcon icon={ArrowUpRight01Icon} size={14}/></button>)}
  </div>}
  {orbOpen&&<div className="gk-orb-panel" role="menu" aria-label="Learning quick launch">
   <span className="gk-quick-kicker">YOUR DAILY LEARNING SHORTCUTS</span>
   {orbActions.map(action=><button key={action.label} role="menuitem" onClick={()=>{setOrbOpen(false);router.push(action.href);}}><span className="gk-orb-action-icon"><HugeiconsIcon icon={action.icon} size={20}/></span><span className="gk-orb-action-copy"><b>{action.label}</b><small>{action.sub}</small></span><HugeiconsIcon icon={ArrowUpRight01Icon} size={16}/></button>)}
  </div>}
  <nav className="gk-student-dock" aria-label="Student navigation">
   {items.slice(0,3).map(item=><button key={item.id} type="button" className={"gk-dock-item"+(activeFor(pathname,item)?" is-active":"")} aria-current={activeFor(pathname,item)?"page":undefined} aria-label={item.label+"; long press for quick actions"} onPointerDown={()=>beginPress(item.id)} onPointerUp={endPress} onPointerLeave={endPress} onPointerCancel={endPress} onContextMenu={e=>{e.preventDefault();clearPress();setQuickFor(item.id);}} onClick={()=>handleItemClick(item)}><span className="gk-dock-icon"><HugeiconsIcon icon={item.icon} size={19}/></span><small>{item.label}</small></button>)}
   <button type="button" className={"gk-dock-orb"+(orbOpen?" is-open":"")} aria-label="Open Daily Drill, Editorial and Mains Practice shortcuts" aria-expanded={orbOpen} onClick={()=>{setQuickFor(null);setOrbOpen(v=>!v);}}><span className="gk-orb-core"><HugeiconsIcon icon={SparklesIcon} size={24}/></span><small>QUICK</small></button>
   {items.slice(3).map(item=><button key={item.id} type="button" className={"gk-dock-item"+(activeFor(pathname,item)?" is-active":"")} aria-current={activeFor(pathname,item)?"page":undefined} aria-label={item.label+"; long press for quick actions"} onPointerDown={()=>beginPress(item.id)} onPointerUp={endPress} onPointerLeave={endPress} onPointerCancel={endPress} onContextMenu={e=>{e.preventDefault();clearPress();setQuickFor(item.id);}} onClick={()=>handleItemClick(item)}><span className="gk-dock-icon"><HugeiconsIcon icon={item.icon} size={19}/></span><small>{item.label}</small></button>)}
  </nav>
 </div>;
}

"use client";

import {AnimatePresence,motion,useReducedMotion} from "motion/react";
import {usePathname} from "next/navigation";
import type {CSSProperties,ReactNode} from "react";

export function PageTransition({children}:{children:ReactNode}){
  const pathname=usePathname();
  const reduceMotion=useReducedMotion();
  return <AnimatePresence mode="wait" initial={false}>
    <motion.div key={pathname} className="gk-page-transition"
      initial={reduceMotion?false:{opacity:0,y:9,filter:"blur(3px)"}}
      animate={{opacity:1,y:0,filter:"blur(0px)"}}
      exit={reduceMotion?{opacity:1}:{opacity:0,y:-5,filter:"blur(2px)"}}
      transition={{duration:reduceMotion?0:.24,ease:[.22,.75,.25,1]}}>
      {children}
    </motion.div>
  </AnimatePresence>;
}

type SkeletonProps={width?:string|number;height?:string|number;radius?:string|number;className?:string;style?:CSSProperties};
export function MotionSkeleton({width="100%",height=16,radius=10,className="",style}:SkeletonProps){
  return <span aria-hidden="true" className={`gk-skeleton ${className}`} style={{width,height,borderRadius:radius,...style}}/>;
}

export function MotionFeedback({kind="info",children,className=""}:{kind?:"success"|"error"|"info";children:ReactNode;className?:string}){
  return <motion.div role={kind==="error"?"alert":"status"} aria-live={kind==="error"?"assertive":"polite"}
    className={`gk-feedback gk-feedback--${kind} ${className}`}
    initial={{opacity:0,y:8,scale:.985}} animate={{opacity:1,y:0,scale:1}}
    transition={{duration:.22,ease:[.2,.8,.2,1]}}>
    {children}
  </motion.div>;
}

"use client";

import { useEffect, useId, useRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
export function Button({ variant = "primary", size = "md", loading = false, fullWidth = false, leadingIcon, trailingIcon, disabled, className = "", children, ...props }: ButtonProps) {
  return <button className={["gk-button", "gk-button--" + variant, "gk-button--" + size, fullWidth ? "gk-button--full" : "", className].filter(Boolean).join(" ")} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
    {loading ? <span className="gk-spinner" aria-hidden="true" /> : leadingIcon}
    <span>{children}</span>{!loading && trailingIcon}
  </button>;
}

export type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
export function Badge({ children, tone = "neutral", dot = false, className = "" }: { children: ReactNode; tone?: BadgeTone; dot?: boolean; className?: string }) {
  return <span className={["gk-badge", "gk-badge--" + tone, className].filter(Boolean).join(" ")}>{dot && <i aria-hidden="true" />}{children}</span>;
}

export interface BentoCardProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  interactive?: boolean;
  accent?: "rose" | "plum" | "neutral";
  as?: "article" | "section" | "div";
}
export function BentoCard({ title, eyebrow, description, action, interactive = false, accent = "neutral", as: Tag = "article", className = "", children, ...props }: BentoCardProps) {
  return <Tag className={["gk-bento-card", "gk-bento-card--" + accent, interactive ? "gk-bento-card--interactive" : "", className].filter(Boolean).join(" ")} {...props}>
    {(eyebrow || title || action) && <header className="gk-bento-card__header"><div>{eyebrow && <span className="gk-eyebrow">{eyebrow}</span>}{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>{action}</header>}
    {children && <div className="gk-bento-card__body">{children}</div>}
  </Tag>;
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  trailingSlot?: ReactNode;
}
export function TextInput({ label, hint, error, leadingIcon, trailingSlot, id, className = "", ...props }: TextInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const hintId = hint ? inputId + "-hint" : undefined;
  const errorId = error ? inputId + "-error" : undefined;
  return <div className="gk-field">
    {label && <label className="gk-field__label" htmlFor={inputId}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>}
    <div className={["gk-input-wrap", error ? "gk-input-wrap--error" : "", leadingIcon ? "gk-input-wrap--leading" : ""].filter(Boolean).join(" ")}>
      {leadingIcon && <span className="gk-input-wrap__leading" aria-hidden="true">{leadingIcon}</span>}
      <input id={inputId} className={["gk-input", className].filter(Boolean).join(" ")} aria-invalid={Boolean(error)} aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined} {...props} />
      {trailingSlot && <span className="gk-input-wrap__trailing">{trailingSlot}</span>}
    </div>
    {hint && <small className="gk-field__hint" id={hintId}>{hint}</small>}
    {error && <small className="gk-field__error" id={errorId} role="alert">{error}</small>}
  </div>;
}

export function Modal({ open, onClose, title, description, children, footer, size = "md", closeOnOverlay = true }: {
  open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg"; closeOnOverlay?: boolean;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const panel = document.querySelector<HTMLElement>("[data-gk-modal-panel]");
        const focusable = panel?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = oldOverflow; document.removeEventListener("keydown", onKeyDown); previous?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="gk-modal-backdrop" role="presentation" onMouseDown={event => { if (closeOnOverlay && event.target === event.currentTarget) onClose(); }}>
    <section className={"gk-modal gk-modal--" + size} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined} data-gk-modal-panel>
      <header className="gk-modal__header"><div><h2 id={titleId}>{title}</h2>{description && <p id={descriptionId}>{description}</p>}</div><button ref={closeRef} type="button" className="gk-modal__close" onClick={onClose} aria-label="Close dialog">×</button></header>
      <div className="gk-modal__content">{children}</div>
      {footer && <footer className="gk-modal__footer">{footer}</footer>}
    </section>
  </div>;
}

export interface NavigationItem { label: string; href: string; icon?: ReactNode; badge?: ReactNode; }
export function Navigation({ items, activeHref, brand, trailing, ariaLabel = "Primary navigation" }: {
  items: NavigationItem[]; activeHref?: string; brand?: ReactNode; trailing?: ReactNode; ariaLabel?: string;
}) {
  return <nav className="gk-navigation" aria-label={ariaLabel}>
    {brand && <div className="gk-navigation__brand">{brand}</div>}
    <div className="gk-navigation__items">{items.map(item => <a key={item.href} href={item.href} className={"gk-navigation__link" + (activeHref === item.href ? " is-active" : "")} aria-current={activeHref === item.href ? "page" : undefined}>
      {item.icon && <span className="gk-navigation__icon">{item.icon}</span>}<span>{item.label}</span>{item.badge && <span className="gk-navigation__badge">{item.badge}</span>}
    </a>)}</div>
    {trailing && <div className="gk-navigation__trailing">{trailing}</div>}
  </nav>;
}


export interface SkeletonProps { className?: string; width?: string | number; height?: string | number; radius?: string | number; }
export function Skeleton({className="",width="100%",height=16,radius=12}:SkeletonProps){
  return <span aria-hidden="true" className={["gk-skeleton",className].filter(Boolean).join(" ")} style={{width,height,borderRadius:radius}}/>;
}

export function SectionHeading({eyebrow,title,description,action,className=""}:{eyebrow?:string;title:ReactNode;description?:ReactNode;action?:ReactNode;className?:string}){
  return <header className={["gk-section-heading",className].filter(Boolean).join(" ")}>
    <div>{eyebrow&&<span className="gk-eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description&&<p>{description}</p>}</div>
    {action&&<div className="gk-section-heading__action">{action}</div>}
  </header>;
}

export function ProgressBar({value,max=100,label,className=""}:{value:number;max?:number;label?:string;className?:string}){
  const safeMax=max>0?max:100;
  const percent=Math.min(100,Math.max(0,(value/safeMax)*100));
  return <div className={["gk-progress",className].filter(Boolean).join(" ")} role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} aria-label={label||"Progress"}>
    <span className="gk-progress__track"><i style={{width:percent+"%"}}/></span>
    {label&&<span className="gk-progress__label">{label}</span>}
  </div>;
}

export function EmptyState({title,description,action,icon,className=""}:{title:string;description?:string;action?:ReactNode;icon?:ReactNode;className?:string}){
  return <section className={["gk-empty-state",className].filter(Boolean).join(" ")}>
    {icon&&<span className="gk-empty-state__icon">{icon}</span>}
    <h3>{title}</h3>{description&&<p>{description}</p>}{action&&<div className="gk-empty-state__action">{action}</div>}
  </section>;
}

export function Divider({className=""}:{className?:string}){
  return <hr className={["gk-divider",className].filter(Boolean).join(" ")}/>;
}

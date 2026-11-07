# Gyankunj UI 2.0 — New Design System

**Identity exploration: Atlas / Fieldwork**  
**Status:** Foundation draft — isolated, not yet applied to production routes.

## 1. Creative direction

Gyankunj becomes a focused academic research and learning workspace: part modern editorial journal, part examination command centre, part structured knowledge archive.

This identity deliberately avoids the previous cosmic/orbital, rose-magenta, lilac glass, lotus hub and neumorphic card language. It is not a recolor of the old dashboard.

### Visual character
- Architectural editorial grids; strong alignment and asymmetry.
- Warm mineral paper surfaces against deep ink surfaces.
- Cobalt as the primary action/navigation signal; vermilion as a sparing editorial marker.
- Large typographic hierarchy, restrained serif contrast, excellent Devanagari legibility.
- Hairline rules, index numbers, section markers and data labels inspired by printed research journals.
- Flat/raised material hierarchy; blur is rare and intentional, not the default card treatment.
- Motion communicates hierarchy, progress and state—not decoration.

## 2. Color system

| Token | Value | Role |
|---|---|---|
| Canvas | `#F2F0E9` | Warm mineral page |
| Surface | `#FBFAF6` | Reading/work surfaces |
| Surface raised | `#FFFFFF` | Menus and focused panels |
| Ink | `#17212B` | Primary text |
| Ink secondary | `#43515C` | Body copy |
| Muted | `#68757D` | Metadata |
| Rule | `#D6D8D2` | Hairlines/dividers |
| Cobalt | `#2457D6` | Primary action and active navigation |
| Cobalt deep | `#173D9B` | Hover/pressed |
| Vermilion | `#D6533C` | Editorial emphasis only |
| Moss | `#39735D` | Success |
| Amber | `#A86B18` | Warning |
| Error | `#B33A42` | Destructive/error |

Dark surfaces use ink/navy rather than pure black; semantic tokens invert text/surface roles without changing component structure.

## 3. Typography

- Display: `Space Grotesk` / system fallback, with restrained editorial serif accents using `DM Serif Display`.
- Hindi body: `Noto Sans Devanagari`; Hindi editorial headings: `Noto Serif Devanagari`.
- Body line height: 1.65–1.85 for Hindi reading; 1.5–1.65 for English.
- Metadata: 10–12px with letter spacing; never use low-opacity white on pale backgrounds.
- Display sizes are fluid via `clamp()`; avoid giant headings that push primary actions below the fold on mobile.

## 4. Layout system

- 4px base spacing scale; 12-column desktop grid; 6-column tablet; 4-column mobile conceptual grid.
- Content max width: 1440px for command surfaces; 760–820px for long-form reading; 1120px for assessment workspace.
- Mobile gutters: 18px minimum, 22px preferred; desktop gutters 32–56px.
- Use editorial split layouts and index rails where useful; use full-width workspaces for assessments.
- Cards are not the default container. Prefer open canvas, section rules, rows and grouped panels; use cards for meaningful independent tasks only.
- Navigation: desktop side rail + contextual topbar; mobile compact bottom navigation with safe-area padding. Only one shell owns navigation.

## 5. Shape, surfaces and depth

- Control radius: 10px.
- Standard panel radius: 16px.
- Feature surface radius: 22px.
- Hairline borders with clear edge contrast.
- Shadows are short and directional; avoid stacked glow/neon shadows.
- Material types: paper, raised-paper, ink-panel, signal-action. Liquid blur is reserved for transient overlays only.

## 6. Motion language

- Micro: 120–180ms; state transition: 180–260ms; page entrance: 320–480ms.
- Easing: `cubic-bezier(.2,.7,.2,1)`.
- Page sections may use subtle stagger (40–60ms) and short vertical movement (8–14px).
- Buttons: 1–2px press response; cards: 2–4px lift only if actionable.
- Progress and chart transitions must be understandable and not delay interaction.
- No perpetual ambient animations, orbital rotations or decorative parallax.
- Respect `prefers-reduced-motion`; disable nonessential transitions and reveal effects.

## 7. Component principles

- AppShell, DesktopRail, MobileNavigation, CommandBar, Breadcrumbs.
- PageHeader, EditorialHeading, SectionIndex, SectionRule.
- Button (primary/secondary/quiet/destructive), IconButton, TextLink.
- PaperPanel, InkPanel, DataPanel, StatBlock, MetricStrip.
- SearchField, FilterBar, SegmentedTabs, Select, Textarea.
- EditorialStory, SourceNote, FactList, MainsAngle.
- AssessmentQuestion, AnswerChoice, QuestionNavigator, Timer, SubmissionSummary.
- SubjectIndex, TopicRow, ResourceListItem, ReaderToolbar.
- RecallCard, MasteryControl, ActivityTimeline, ProgressChart.
- FormField, EmptyState, ErrorState, Skeleton, Toast, Dialog, Sheet.

Each primitive defines semantic variants, keyboard/focus behavior, disabled/loading states, and bilingual content wrapping. Avoid page-specific visual hacks in shared primitives.

## 8. Accessibility and quality
- Normal text contrast target WCAG AA (4.5:1); large text and essential UI components at least 3:1.
- 44×44px minimum touch targets.
- Visible focus ring with sufficient contrast.
- Do not encode status with color alone; pair color with icon/label.
- Hindi line wrapping and mixed Hindi/English numbers tested on 320px screens.
- Support zoom, high contrast and reduced motion.
- Use semantic HTML landmarks and accessible names for icon-only actions.

## 9. Implementation contract
Tokens live in `components/ui2/tokens.css`; primitives are scoped under `.gk2-app`. Do not import this file from the current root layout until the UI 2.0 shell is explicitly enabled. Do not import legacy theme tokens or page CSS into UI 2.0 components. Existing data/service logic remains outside the design system.

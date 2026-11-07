# Gyankunj Next — Product Architecture & Rebuild Blueprint

**Branch:** `feature/gyankunj-nextgen-rebuild`  
**Design decisions:** Aether Liquid Glass · Hybrid Bento · Adaptive Navigation · Contextual Palette · Glass Cards · Kinetic Typography · Hybrid Learning Command Centre  
**Safety rule:** Production, existing deployed branch, and Supabase schema are read-only during the rebuild. No destructive database migration is part of this phase.

## 1. Product direction

Gyankunj Next is a mobile-first, bilingual learning operating system for competitive-exam preparation. The interface is rebuilt from a clean visual and component foundation. Existing working domain logic is treated as a set of services and contracts—not as a visual template.

### Design principles
- Liquid-glass material is reserved for meaningful surfaces, not every container.
- Hybrid layout: editorial bento dashboard on Home; focused, low-distraction workspaces inside study, quiz, reading and writing flows.
- Adaptive navigation: compact bottom dock on phones; persistent collapsible side rail on tablet/desktop.
- Contextual palette: a shared semantic token system supports light lilac, deep violet, editorial cream, and focus-dark surfaces without changing component structure.
- Kinetic typography: expressive display headlines, restrained motion, readable Hindi body typography.
- Accessibility: WCAG-minded contrast, visible focus states, reduced-motion support, touch targets of at least 44px, and no essential information conveyed by color alone.
- Performance: CSS-first motion, lazy-loaded heavy surfaces, server components by default, client components only for interactive islands.

## 2. Application architecture

### Layers
1. **Presentation** — Next.js App Router pages, route layouts, responsive shells, design tokens and reusable UI primitives.
2. **Feature modules** — Home, Study, Practice, Editorial, Library, Vault, Progress, Live, Profile, Admin and Faculty.
3. **Domain services** — typed repositories/use-cases for assessments, attempts, editorial publishing, syllabus progress, resources, profile and activity.
4. **Data access** — existing Supabase browser/server clients, auth middleware, storage and RPC boundaries.
5. **Persistence** — existing Supabase tables, RLS policies, RPCs and migrations. Preserve identifiers and existing data relationships.

### Proposed folder structure
```
app/
  (student)/
    page.tsx
    study/page.tsx
    syllabus/page.tsx
    library/page.tsx
    library/[subject]/page.tsx
    library/[subject]/[topic]/page.tsx
    practice/daily/page.tsx
    practice/archive/page.tsx
    mock-tests/page.tsx
    mock-tests/[id]/page.tsx
    editorial/page.tsx
    editorial/[slug]/page.tsx
    today/page.tsx
    vault/page.tsx
    progress/page.tsx
    live/page.tsx
    profile/page.tsx
  (admin)/
    admin/page.tsx
    admin/content/page.tsx
    admin/questions/page.tsx
    admin/assessments/page.tsx
    admin/students/page.tsx
    admin/batches/page.tsx
    admin/faculty/page.tsx
    admin/analytics/page.tsx
  (auth)/login/page.tsx
components/
  nextgen/
    app-shell.tsx
    adaptive-navigation.tsx
    command-header.tsx
    page-heading.tsx
    glass-surface.tsx
    bento-grid.tsx
    metric-card.tsx
    action-card.tsx
    progress-ring.tsx
    segmented-tabs.tsx
    form-controls.tsx
    empty-state.tsx
    loading-state.tsx
    typography.tsx
features/
  home/ practice/ assessments/ editorial/ library/ syllabus/
  vault/ progress/ live/ profile/ admin/ faculty/
lib/
  domain/ repositories/ services/ validation/
  supabase/ (existing clients retained)
```
This is the target organization, not a forced mass file move. Existing routes remain until parity checks pass.

## 3. Screen map

### Student app
| Screen | Primary job | Main content | Key actions |
|---|---|---|---|
| Home / Command Centre | Decide what to study now | Greeting, daily focus, continue learning, editorial, drill, weekly pulse | Resume, read, practice |
| Today | One-tap daily bundle | Editorial, Daily Drill, Mains prompt | Open each daily item |
| Study | Navigate syllabus | Exam → Paper → Subject → Topic → Subtopic | Explore and resume |
| Library | Find trusted material | Search, filters, subjects, resources | Read, bookmark, download |
| Resource Reader | Consume content | PDF/image/text reader, metadata | Bookmark, progress |
| Daily Drill | Practice published quiz | Timer, question, options, palette, submit | Answer, review |
| Drill Archive | Revisit prior drills | Date/category list | Retry, review |
| Mock Tests | Exam simulation | Published tests, attempts, instructions | Start, resume |
| Test Session | Complete assessment | Timed questions, navigation, submit | Save answer, submit |
| Editorial Feed | Read current affairs | Date/category/GS filters | Open article |
| Editorial Detail | Study an issue | Summary, facts, analysis, mains angle | Bookmark, practice |
| Memory Vault | Active recall | Flashcards, tags, mastery state | Reveal, mark mastered |
| Progress | Understand preparation | Accuracy, attempts, activity, topics | Review weak areas |
| Live Classes | Join learning sessions | Schedule, recordings, links | Join, watch |
| Profile | Manage account | Identity, preferences, activity | Update profile |

### Admin and faculty
- Admin command centre: publication health, learner pulse, pending actions.
- Content CMS: editorials, daily bundle, resources and syllabus taxonomy.
- Question Bank: bilingual question authoring, validation, tags and review.
- Assessment Builder: quiz/mock assembly, scheduling, publication and archive.
- Students & batches: enrollment, status, course and batch assignment.
- Faculty workspace: assigned content, classes and student cohorts.
- Analytics & audit: aggregate engagement, attempts and administrative activity.
- Settings: shared design preferences, access and operational configuration.

## 4. Design system and component inventory

### Foundations
- Semantic color tokens: canvas, surface, elevated surface, text, muted text, border, accent, success, warning, danger, focus.
- Contextual themes: `lilac-light`, `violet-night`, `editorial-ivory`, `focus-dark`.
- Type scale: kinetic display, page title, section title, body, compact metadata; Devanagari fallback stack included.
- Spacing: 4px base scale; consistent content widths and mobile gutters.
- Shape: 14px controls, 20px cards, 28px hero surfaces.
- Motion: 160–260ms micro-interactions; reduced-motion fallback.
- Glass material: controlled blur, translucent fill, thin highlight edge and restrained shadow.

### Shared components
- AppShell, AdaptiveNavigation, MobileDock, DesktopRail
- CommandHeader, PageHeading, KineticTitle, Breadcrumbs
- GlassSurface, BentoGrid, BentoTile, MetricCard, ActionCard
- ProgressRing, ActivityHeatmap, ChartPanel
- SearchField, FilterChips, SegmentedTabs, Select, Textarea
- PrimaryButton, SecondaryButton, IconButton, FloatingAction
- QuestionCard, AnswerOption, QuestionPalette, Timer, ResultSummary
- EditorialCard, ResourceCard, SubjectCard, TopicRow, Flashcard
- Modal, Drawer, Sheet, Toast, Tooltip
- Skeleton, EmptyState, ErrorState, OfflineState

All components must support Hindi/English content, keyboard focus, mobile touch and loading/empty/error states.

## 5. Existing logic and Supabase preservation contract

### Keep and reuse after audit
- `lib/supabase/client.ts` browser client and existing server auth integration.
- `middleware.ts` session verification, safe redirect handling, active-account checks and admin authorization.
- Existing Supabase migrations, RLS and RPC functions.
- Home queries for subjects, published editorials, announcements, profiles, student activity and learning snapshots.
- Assessment publication, secure scoring, attempt persistence and activity logging.
- Student topic progress and syllabus completion.
- Editorial CMS publication and date ordering.
- Resource storage and access rules.
- Memory Vault mastery/recall data.
- Profile and admin role checks.

### Non-negotiable data rules
- No table drops, renames, truncations or destructive migrations.
- No client-side scoring in place of secure server scoring.
- Preserve IDs, foreign keys, RLS and storage bucket names.
- New repository/service functions must return typed results and preserve existing error behavior.
- Before replacing a screen, document its reads, writes, RPCs, storage access and auth assumptions.
- Additive migrations only, and only when a demonstrated feature gap requires one.

## 6. Implementation sequence

### Phase 0 — Inventory & baseline
- Map every route to its data queries, mutations, RPCs and permissions.
- Record current build blockers and environment assumptions.
- Capture current behavior as acceptance criteria.
- Mark visual-only CSS and components separately from domain logic.

### Phase 1 — New design foundation
- Add isolated NextGen token system and typography.
- Build responsive AppShell and adaptive navigation.
- Build core glass, bento, form, feedback and loading primitives.
- Add a preview route; do not replace the existing home yet.

### Phase 2 — Student vertical slices
1. Home + Today bundle.
2. Study + Syllabus + Library + Reader.
3. Daily Drill + Archive + Mock Test.
4. Editorial + Mains Practice.
5. Vault + Progress.
6. Live + Profile.

Each slice must pass desktop/mobile layout, Hindi/English, authenticated data, loading/empty/error and keyboard checks.

### Phase 3 — Admin and faculty
- CMS, question bank, assessment builder, student/batch management, faculty and analytics.
- Preserve role-gated access and admin-only mutations.

### Phase 4 — Parity, QA and cutover
- TypeScript, lint, production build and route smoke tests.
- Supabase integration tests against a non-production/staging project.
- RLS checks for student/admin boundaries.
- Mobile viewport and reduced-motion checks.
- Compare feature parity against the legacy app.
- Deploy a preview environment first. Production cutover only after explicit approval.

## 7. Definition of done
- All listed routes have a coherent responsive design and working navigation.
- Existing authenticated workflows and persisted data remain functional.
- No placeholder replaces a currently working core feature.
- Build, lint, smoke tests and required integration checks pass.
- No destructive production database change.
- User approves preview before any production deployment.

## 8. Current execution boundary
The new work happens only on `feature/gyankunj-nextgen-rebuild`. The deployed branch and production service are not changed. The first implementation milestone is the isolated design foundation and preview; route migrations follow one vertical slice at a time.

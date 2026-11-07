# Gyankunj UI 2.0 — Architecture Audit

**Audit date:** 2026-11-07  
**Repository:** `kshitiz2007-cpu/gyankunj-cosmic-orbital-dashboard`  
**Baseline:** `feature/gyankunj-nextgen-rebuild` at `580b87b4557ef8ccb3db56176231035b0be3e239`  
**Rebuild branch:** `rebuild/gyankunj-ui-2.0`

## Executive summary

The repository is a Next.js 15.5.28 App Router application using React 19, TypeScript, Tailwind CSS 4, Motion 12, Hugeicons and Supabase JS/SSR. The current product already contains substantial domain workflows and must be treated as the functional source of truth. The existing visual layer is not a suitable design reference: page-specific CSS, global CSS, multiple theme files, the ThemeProvider and the global floating navigation overlap.

**Decision:** build a new presentation system in parallel. Preserve current route URLs, page data contracts, Supabase queries/RPCs, authentication, role checks, storage paths, CSV workflows and migrations. Do not mass-delete CSS or move route files until replacement parity is proven.

## 1. Repository map

### Runtime and configuration
- `app/layout.tsx`: root HTML, metadata, theme bootstrap, ThemeProvider and StudentFloatingNavigation.
- `middleware.ts`: Supabase SSR session verification, safe return URL handling, active-account check and admin route authorization.
- `lib/supabase/client.ts`: singleton Supabase browser client using public URL and publishable key.
- `types/database.ts`: shared domain types.
- `app/api/ai/ask/route.ts`: authenticated AI endpoint, quota RPC, published-resource/editorial retrieval and OpenAI request.
- `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`: Next/TypeScript/Tailwind build configuration.

### Route inventory
| Route | Existing responsibility | Preserve |
|---|---|---|
| `/` | Student home / command dashboard | Personalized snapshot, daily actions, progress |
| `/login` | Authentication | Sign-in, redirect, session |
| `/current-affairs` | Editorial feed and CMS-backed listing | Published articles, categories, search/filter |
| `/current-affairs/[slug]` | Editorial reader | Bilingual article, content sections, mains angle |
| `/practice/daily` | Daily Drill player | Published assessment, answers, timer, submit/review |
| `/practice/daily/archive` | Drill archive | Historical published drills and retry/review |
| `/mock-test` | Mock/quiz catalogue | Published assessments and attempts |
| `/mock-test/preview` | Assessment preview/session flow | Question data and assessment actions |
| `/library` | Subject/resource discovery | Search, subject and published resource listing |
| `/library/[subject]` | Subject detail | Topic/resource hierarchy |
| `/library/[subject]/[topic]` | Topic/resource detail | Text/PDF/image resource access |
| `/vault` | Memory Vault | Published recall cards and student mastery |
| `/progress` | Student analytics | Attempts, accuracy, streak/activity, topic progress |
| `/syllabus` | UPSC syllabus tracker | Exam/paper/topic completion |
| `/todays-glimpses` | Daily editorial/drill/mains bundle | Current-day content aggregation |
| `/profile` | Student profile | Profile and preferences |
| `/live` | Live/recorded class destination | Existing class links/availability |
| `/ai` | Study Companion | Authenticated question/answer flow |
| `/admin` | Admin CMS and operational dashboard | Content, editorial, resource, assessment, student/admin workflows |
| `/design-system-preview`, `/nextgen-preview` | Design experiments | Keep isolated; not production references |

## 2. Backend and business contracts

### Authentication and authorization
- Supabase SSR middleware verifies the current user using `auth.getUser()`.
- Profiles provide `role` and `is_active`; disabled users are signed out.
- Admin routes include `/admin` and `/design-system-preview`; non-admin users are redirected.
- Safe redirect validation rejects external origins, protocol-relative paths and backslashes.
- Root layout's current ThemeProvider also reads profile role and shared theme settings. Rebuild must not accidentally remove auth/session behavior.

### Data and persistence
Confirmed from repository types, migrations and endpoint code:
- Identity/roles: `profiles` and Supabase Auth.
- Learning taxonomy: `subjects`, `courses`, `batches`, `enrollments`.
- Study content: `study_resources`, Supabase Storage bucket `study-resources`.
- Editorial CMS: `editorial_articles`.
- Assessment engine: `assessments`, `questions`, `assessment_attempts`.
- Student engagement: `student_activity`, `student_topic_progress`.
- Recall: `memory_cards`, `student_memory_progress`.
- Shared appearance settings: `app_theme_settings` (legacy feature; UI 2.0 should not depend on its old palette model).
- AI quota: RPC `consume_ai_request_quota`.
- Secure assessment submission: RPC `submit_assessment_attempt`; answer keys and scoring stay server-side.

### Security invariants
- Do not move service-role keys or OpenAI secrets into client code.
- Do not calculate authoritative scores in the client or bypass `submit_assessment_attempt`.
- Do not broaden RLS or change publication semantics as part of visual rebuild.
- Keep user ownership filters and admin checks.
- Do not change Storage bucket names/paths without a separate migration and compatibility plan.

## 3. Current presentation-layer findings

The app currently imports multiple overlapping global style systems from `app/layout.tsx`: `globals.css`, `design-system.css`, `study-focus-theme.css`, `student-experience.css` and `gyankunj-foundation.css`. Individual route stylesheets also exist for Admin, AI, Login, Profile, Vault, Daily Drill archive, Today's Glimpses, and previews. Additional component-level styles exist for Neo Orbit, floating navigation and NextGen.

This creates multiple competing sources for:
- global color, typography and background tokens;
- route surface, text and control colors;
- responsive breakpoints and mobile navigation;
- floating dock visibility/positioning;
- theme initialization and admin-editable global settings.

The root layout currently mounts `StudentFloatingNavigation` globally while some pages also render page-level navigation. The theme bootstrap hardcodes the old cosmic/dark preferences and writes the old design-studio localStorage key. The old NextGen tokens/primitives are also present but are tied to a previous visual direction. **None of these should be imported as the UI 2.0 visual foundation.**

## 4. UI 2.0 architecture decisions

1. Keep existing route URLs in place for compatibility. Route files become thin composition boundaries over feature services and new UI components.
2. Add a new isolated presentation namespace under `components/ui2/`; no imports from old `components/neo-orbit`, `components/nextgen` or legacy global page CSS.
3. Use design tokens with semantic roles and theme-independent components.
4. Keep server components by default; client components only for interactive islands (navigation, filters, assessment controls, forms, charts).
5. Use CSS Modules or feature-scoped styles for page composition; avoid adding new global selectors.
6. Create one navigation shell and one route-aware navigation model. Retire duplicate navigation only after all routes have migrated.
7. Separate content density and information architecture by task: reading, recall, testing, analytics and administration must not be forced into one card template.
8. All components must support Hindi/English, long Devanagari wrapping, keyboard use, reduced motion and 44px minimum touch targets.
9. Keep admin UI and student UI on the same primitives but separate information architecture and permissions.
10. No database migration is required for the visual rebuild.

## 5. Migration sequence and acceptance gates

### Gate A — Audit/design system (this phase)
- Route, service, auth and data inventory documented.
- New tokens and primitives isolated from legacy CSS.
- No production route or Supabase behavior changed.

### Gate B — New shell
- New root presentation shell and responsive navigation implemented behind a UI 2.0 route/feature flag.
- Authentication, middleware and all current URLs remain functional.
- No duplicate bottom docks or floating controls.

### Gate C — Feature-by-feature replacement
Recommended order: Home → Today → Editorial feed/reader → Daily Drill/archive → Library/reader → Vault → Progress → Syllabus → Mock Tests → Profile/Live/AI → Admin.
For each feature, verify loading, empty, error, populated, bilingual and permission states.

### Gate D — parity and retirement
- Compare each new route against its existing functional behavior.
- Verify Supabase reads/writes, publication state, uploads, CSV imports, attempt submission, review and progress updates.
- Run lint, typecheck and production build.
- Remove old CSS imports/components only when no route references them.
- Deploy from the rebuild branch only after explicit parity approval.

## 6. Known risks / items requiring deeper code-level verification

- Several route components contain large amounts of inline data-fetching and UI state; extraction into domain services should be incremental, not a speculative rewrite.
- Existing theme settings are globally persisted. UI 2.0 must either map them safely to new semantic tokens or decouple the new shell while retaining the database record for legacy clients.
- The root floating navigation and page-specific navigation can overlap. Establish a single shell owner before migrating routes.
- The current CSS footprint is large and contains many route selectors. Do not delete it globally until route coverage and screenshot/functional parity are complete.
- Supabase schema is defined by ordered migrations, including migrations with repeated numeric prefixes. Treat the checked-in migration history as authoritative and do not reorder/rewrite it.
- Admin CSV import and publishing require real Supabase validation; a successful frontend build alone does not prove content publication.

## 7. Baseline validation

Baseline branch head recorded as `580b87b4557ef8ccb3db56176231035b0be3e239`. This audit does not claim a successful production build or live Supabase integration test. The next phase must run the repository's actual build and lint checks and capture failures before replacing routes.

# Gyankunj UI 2.0 — Route and parity matrix

This matrix is the migration checklist. A route is not complete when it merely renders; it is complete when every existing user action and state has a UI 2.0 equivalent.

| Route | Domain feature | UI 2.0 pattern | Required parity checks |
|---|---|---|---|
| / | Home | Learning command centre | greeting, resume, daily drill, editorial, progress |
| /todays-glimpses | Daily bundle | Daily briefing index | editorial/drill/mains availability and deep links |
| /current-affairs | Editorial feed | Research dispatch list | published filter, categories, search, ordering |
| /current-affairs/[slug] | Editorial reader | Long-form reader | bilingual article, sections, mains question, metadata |
| /practice/daily | Drill player | Focus test workspace | timer, options, mark/review, navigation, secure submit |
| /practice/daily/archive | Drill archive | Archive index | date, attempt, retry/review |
| /mock-test | Assessment catalogue | Exam simulation index | quiz/mock distinction, published availability |
| /mock-test/preview | Assessment session | Full-screen assessment workspace | instructions, timer, answer persistence, submit, review |
| /library | Library home | Subject index | published subjects, search, resources |
| /library/[subject] | Subject | Topic directory | hierarchy and resource navigation |
| /library/[subject]/[topic] | Topic reader | Resource reader | text/PDF/image, access, progress |
| /vault | Memory Vault | Active recall studio | filters, reveal, mastered, review count |
| /progress | Progress | Performance report | accuracy, attempts, activity, topic progress |
| /syllabus | Syllabus | Curriculum tracker | paper/topic tree and completion |
| /profile | Profile | Account workspace | profile read/update, avatar, preferences |
| /live | Live classes | Session schedule | existing join/recording links |
| /ai | Study Companion | AI research assistant | auth token, quota, sources, error handling |
| /login | Authentication | Focused sign-in | auth callback, next redirect, errors |
| /admin | Admin CMS | Admin operations workspace | editorial/resources/assessments/questions/students and CSV |
| /design-system-preview | Legacy experiment | Retain isolated until retirement | no route or admin permission regression |

## Migration sign-off per route
- [ ] Existing data query and filters retained.
- [ ] Loading, empty, error and populated states.
- [ ] Hindi and English content.
- [ ] Mobile 320px, 360px, 390px; tablet; desktop.
- [ ] Keyboard and screen-reader labels.
- [ ] All CTAs, links, file uploads and submit actions.
- [ ] Authenticated student, faculty and admin permissions.
- [ ] No legacy global nav or design studio overlap.
- [ ] Build, lint and type checks.

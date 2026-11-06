# Gyankunj QA Runbook

## Automated checks

The GitHub Actions workflow `.github/workflows/qa.yml` runs:

1. `npm ci`
2. ESLint
3. A Next.js production build
4. Chromium smoke checks against the locally started production server, using desktop and mobile-sized browser projects

The browser smoke tests currently cover homepage response/rendering and horizontal overflow. They do **not** claim that login, quiz submission, editorial persistence, or student data isolation has been verified.

## Supabase RLS verification (staging only)

Do not run authorization tests against production student data. Create a dedicated Supabase staging project or isolated local Supabase stack and prepare:

- Student A
- Student B
- An admin account
- One published and one unpublished assessment/resource
- A test attempt owned by Student A
- A disposable storage object in the relevant bucket

Use only short-lived test credentials stored as GitHub Actions secrets or local environment variables. Never commit keys or paste service-role credentials into issues or chat.

Required assertions:

| Actor | Operation | Expected |
|---|---|---|
| Anonymous | Read unpublished assessments/questions | Denied / no rows |
| Student A | Read own profile and attempts | Allowed |
| Student A | Read or update Student B profile/attempt | Denied / no rows |
| Student A | Update own unsubmitted attempt | Allowed, subject to policy |
| Student A | Update submitted attempt | Denied |
| Student | Insert/update/delete admin-managed assessment or resource | Denied |
| Admin | Manage assessments/resources and user administration | Allowed by intended admin policy |
| Student A | Upload/delete admin-only storage object | Denied |
| Student A | Read another student's private object | Denied if the bucket is intended to be private |

Important: inspect the actual bucket contents and product requirements before changing storage policies. A policy allowing all authenticated users to read a bucket may be intentional for public course imagery, but is inappropriate for private student uploads.

## Manual functional scenarios

### Daily Drill
- Start a drill; verify question count and timer.
- Select/change answers and navigate backward/forward.
- Submit once; verify score and answer review.
- Simulate network failure during save; verify answers remain available and retry does not create duplicate attempts.
- Let the timer expire; verify the documented auto-submit/timeout behavior.
- Reload and verify only persisted results are shown.

### Editorial
- Open an article and scroll through short and long content.
- Verify reading progress at top, middle, and end.
- Bookmark, reload, and verify persistence for the same signed-in account.
- Change routes and return; ensure stale progress is not carried into another article.

### Android device pass
Test real devices or an Android emulator at 360, 390, and 412 CSS-pixel widths:
- Bottom navigation and safe-area insets
- Touch targets and scroll behavior
- On-screen keyboard on forms
- Modal/dialog clipping
- Portrait orientation and reduced-motion preference

## Evidence and sign-off

Record the commit SHA, environment (staging/production), browser/device, test account role, test result, and timestamp. Mark RLS or device testing as **not run** until the corresponding live test evidence exists.

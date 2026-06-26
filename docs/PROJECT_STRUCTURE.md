# HireQuest — Project structure

This document maps the main folders and files in **HireQuest** (Next.js 16 app): what lives where and what it is responsible for.

---

## High-level overview

| Area | Role |
|------|------|
| `src/app/` | Next.js **App Router**: pages, layouts, and **Route Handlers** (`api/…/route.ts`). |
| `src/components/` | **React UI**: landing, authenticated app shell, interview flows, shared UI primitives. |
| `src/lib/` | **Server/client libraries**: auth config, MongoDB/Mongoose, Gemini, interview generation, validation. |
| `src/models/` | **Mongoose schemas** for MongoDB documents. |
| `src/hooks/` | **Reusable React hooks** (sessions, interview runtime, UI helpers). |
| `src/utils/` | **Pure helpers** (labels, dates, dashboard mappings). |
| `src/services/` | **Domain services** (e.g. billing) used from API or UI. |
| `apps/mobile/` | **Capacitor / Android** shell for a native wrapper (separate from the main web app). |
| `scripts/` | **Node CLI scripts** (seed data, create admin user). |
| `docs/` | **Documentation** (this file, UML diagrams under `docs/uml/`). |

---

## Root configuration

| File / folder | Purpose |
|---------------|---------|
| `package.json` | Dependencies, scripts (`dev`, `build`, `lint`, `create:admin`, `seed:interview-config`). |
| `next.config.*` (if present) | Next.js build/runtime options (PWA, etc.). |
| `tailwind.config.js` | Tailwind theme, content paths, plugins. |
| `postcss.config.js` | PostCSS pipeline for Tailwind. |
| `tsconfig.json` | TypeScript compiler options and path aliases (e.g. `@/` → `src/`). |
| `THEME_GUIDE.md` | Notes on theming / design tokens (if maintained). |
| `test-gemini-key.js`, `test-mongo-connection.js` | Local **connectivity / smoke tests**, not part of the Next app bundle. |

---

## `src/app/` — Routes and layouts

### Global app shell

| File | Purpose |
|------|---------|
| `layout.tsx` | Root HTML shell, fonts, global providers, metadata. |
| `globals.css` | Global styles, CSS variables, HireQuest-specific utility classes (e.g. buttons, sidebar). |
| `page.tsx` | **Marketing landing** route (`/`). |
| `auth/page.tsx` | **Sign-in / sign-up** UI route. |
| `pricing/page.tsx` | **Pricing** marketing page. |
| `manifest.ts`, `icon.tsx`, `apple-icon.tsx` | PWA / favicon assets. |

### Authenticated product — `/app/*`

These routes are typically wrapped by `src/app/app/layout.tsx` (session-aware layout, `AppShell`, etc.).

| Route file | Purpose |
|------------|---------|
| `app/layout.tsx` | Layout for everything under `/app` (sidebar, nav). |
| `app/page.tsx` | Default `/app` landing (often redirects or hub). |
| `app/dashboard/page.tsx` | User **dashboard** overview. |
| `app/new-interview/page.tsx` | **Create interview** wizard entry. |
| `app/interviews/page.tsx` | **List** of interview sessions. |
| `app/interviews/[id]/page.tsx` | **Active interview session** (questions, answers, timer). |
| `app/interviews/[id]/results/page.tsx` | **Results** for a completed session. |
| `app/results/page.tsx` | **Results overview** across sessions. |
| `app/analytics/page.tsx` | **Analytics** view. |
| `app/profile/page.tsx` | **Profile** management. |
| `app/settings/page.tsx` | **App / account settings** modules. |
| `app/account-settings/page.tsx` | **Account** settings (may mirror or extend dashboard account area). |
| `app/billing/page.tsx` | **Billing** hub. |
| `app/invoices/page.tsx` | **Invoices** list/detail. |
| `app/subscription/page.tsx` | **Subscription plans** UI. |

### Admin / legacy dashboard — `/dashboard/*`

| Route file | Purpose |
|------------|---------|
| `dashboard/page.tsx` | Admin-style **dashboard** (may differ from `/app/dashboard`). |
| `dashboard/account-settings/page.tsx` | Account settings under `/dashboard`. |
| `dashboard/track-config/page.tsx` | **Interview config** admin UI (`TrackConfigManager`). |

---

## `src/app/api/` — Backend Route Handlers

| Path | Purpose |
|------|---------|
| `api/auth/[...nextauth]/route.ts` | **NextAuth** handler (session, sign-in, callbacks). |
| `api/auth/signup/route.ts` | **User registration** (creates user in DB). |
| `api/account/route.ts` | **Account** CRUD or profile updates (authenticated). |
| `api/interview-config/route.ts` | **Public/read** interview configuration (industries, topics, role categories). |
| `api/interviews/route.ts` | **List** and **create** interview sessions. |
| `api/interviews/[id]/route.ts` | **Get / update / delete** a single session. |
| `api/interviews/[id]/generate-questions/route.ts` | **Generate questions** (Gemini + fallbacks, persists to session). |
| `api/admin/interview-config/route.ts` | **Admin**: list/create interview config documents. |
| `api/admin/interview-config/[id]/route.ts` | **Admin**: update/delete a specific config document. |

---

## `src/middleware.ts`

| File | Purpose |
|------|---------|
| `middleware.ts` | **Next.js middleware** (e.g. `next-auth` `withAuth`): protects `/app` and `/dashboard` routes, role-based redirects. **Does not** match `/api` so auth JSON endpoints keep working. |

---

## `src/models/` — Mongoose models

| File | Purpose |
|------|---------|
| `User.ts` | **User** document (credentials, role, profile fields). |
| `InterviewSession.ts` | **Interview session**: status, questions, type, difficulty, `technicalQuestionRatio`, etc. |
| `InterviewConfig.ts` | **Configurable catalog**: industries, role categories, topics, durations, default ratios. |

---

## `src/lib/` — Shared logic

| File / folder | Purpose |
|---------------|---------|
| `auth.ts` | **NextAuth** `authOptions` (Credentials provider, JWT/session callbacks). |
| `admin-auth.ts` | Helpers to **verify admin** for admin API routes. |
| `mongoose.ts` | **MongoDB connection** helper for server code. |
| `utils.ts` | Small **utilities** (e.g. `cn` for class names). |
| `interview-config.ts` | **Zod schemas / defaults** for interview config payloads and validation. |
| `validation/client-forms.ts` | **Client-side** form validation helpers. |
| `icon-mapping.ts` | Maps **industry/role keys** to icons for UI grids. |
| `gemini/generate-questions.ts` | Calls **Google Gemini** to generate interview questions from session params. |
| `gemini/generate-diagram-image.ts` | Optional **diagram / image** generation for technical questions. |
| `gemini/model-fallback.ts` | **Model selection / fallback** when a Gemini model fails. |
| `interview-questions/prompt.ts` | Builds **LLM prompts** from session parameters. |
| `interview-questions/templates.ts` | **Template-based** questions when AI is unavailable; `allocateKinds` for tech/beh mix. |
| `interview-questions/schema.ts` | **Zod** schemas for generated question items. |
| `interview-questions/validate.ts` | **Validates** generated question arrays. |
| `interview-questions/clean-question-text.ts` | **Strips** unwanted prefixes from model output. |
| `interview-questions/parse-gemini-json.ts` | **Parses** structured JSON from Gemini responses. |
| `interview-questions/generate.ts` | **Orchestrates** generation (calls Gemini + validation + persistence path as used by API). |
| `native/isNativeApp.ts` | Detects if the app runs inside the **Capacitor** WebView. |
| `native/registerNativeAppListeners.ts` | Wires **native app** events (resume, back button, etc.). |

---

## `src/components/` — UI organization

### `components/ui/`

**Shadcn-style primitives**: `button`, `input`, `card`, `tabs`, `dropdown-menu`, `tooltip`, `sheet`, `scroll-area`, `toast`, `selection-chip`, `icon-card`, etc. Low-level building blocks used across the app.

### `components/providers/`

| File | Purpose |
|------|---------|
| `SessionProvider.tsx` | Wraps **next-auth** `SessionProvider` for client components. |
| `ThemeProvider.tsx` | **Light/dark** (or theme) context. |
| `MotionProvider.tsx` | **Framer Motion** reduced-motion / layout preferences if configured. |
| `NativeAppBridge.tsx` | **Native shell** integration when running in Capacitor. |

### `components/landing/` & `components/sections/`

Marketing **Hero**, **Navbar**, **Footer**, **Pricing**, **Process**, **Stats**, **Testimonials**, and composed **sections** used on the landing page.

### `components/auth/`

**AuthForms**, **BrandingPanel**, **SlidingAuth**, **BackgroundFX** — layout and forms for `/auth`.

### `components/app/` — Main product UI

| File / folder | Purpose |
|---------------|---------|
| `UserDashboard.tsx` | Large module: **user dashboard**, **interviews list** (`InterviewsPanel`), **create interview wizard** (`CreateInterviewWizard`), shared wizard pieces. |
| `AppShell.tsx`, `SidebarNav.tsx`, `DashboardPageHeader.tsx`, etc. | **App chrome**: sidebar navigation, headers, placeholders. |
| `TopicSelector.tsx` | **Topic chips** and search for technical/behavioral topics. |
| `InterviewTypeSelector.tsx` | **Technical / Behavioral / Both** cards. |
| `DifficultySelector.tsx` | **Difficulty** selection for the wizard. |
| `StartInterviewButton.tsx` | **Save draft** + **start / generate** actions on the wizard. |
| `InterviewDeleteModal.tsx` | **Confirm delete** for a session. |
| `InterviewSessionPage.tsx` | **Session page** composition for `/app/interviews/[id]`. |
| `interview/*` | **Question card**, markdown, answer editor, timer, progress bar, actions, results page. |
| `billing/InvoicesPage.tsx`, `subscription/SubscriptionPlansPage.tsx` | **Billing** surfaces. |
| `profile/ProfileManagementPage.tsx` | **Profile** editing. |
| `settings/SettingsModulePage.tsx` | **Settings** screens. |
| `results/ResultsOverviewPage.tsx` | **Aggregated results** UI. |
| `dashboard/types.ts` | **TypeScript types** shared by dashboard components. |

### `components/dashboard/`

**Admin / legacy dashboard** pieces: `TrackConfigManager`, `AccountSettingsPanel`, `TopNav`, `Sidebar`, `ProgressRing`, `AIAssistantCard`, etc.

### `components/pricing/`

**Pricing** page content (`Pricing.tsx`).

### `components/examples/`

**IconSystemExamples.tsx** — optional dev showcase for icons.

---

## `src/hooks/`

| File | Purpose |
|------|---------|
| `interview/useInterviewSession.ts` | **Session state** during an interview (navigation between questions, saving answers). |
| `dashboard/useSessions.ts` | **Fetch/cache** interview sessions for dashboard views. |
| `dashboard/useInterviewConfig.ts` | **Interview config** data for filters and labels. |
| `useOnlineStatus.ts` | **Network online/offline** detection. |
| `use-reveal.ts` | **Scroll / reveal** animation helper for marketing sections. |

---

## `src/utils/`

| Path | Purpose |
|------|---------|
| `utils/dashboard/interview-labels.ts` | **Human-readable labels** for interview types, difficulty, status. |
| `utils/dashboard/date.ts` | **Date formatting** for dashboard filters and displays. |
| `utils/dashboard/mappings.ts` | **Display mappings** (e.g. icons or keys to UI copy). |

---

## `src/services/`

| Path | Purpose |
|------|---------|
| `services/billing/BillingService.ts` | **Billing** domain logic (plans, invoices) consumed by API or UI. |

---

## `src/types/`

| File | Purpose |
|------|---------|
| `next-auth.d.ts` | **Extends** NextAuth types (`session.user.role`, etc.). |

---

## `scripts/`

| Script | Purpose |
|--------|---------|
| `create-admin.js` | Creates an **admin user** in the database (`npm run create:admin`). |
| `seed-interview-config.js` | **Seeds** default `InterviewConfig` documents (`npm run seed:interview-config`). |

---

## `docs/`

| Path | Purpose |
|------|---------|
| `PROJECT_STRUCTURE.md` | **This** structural overview. |
| `uml/*.puml` | **PlantUML** diagrams (domain, DB, flows) if you maintain them. |

---

## `apps/mobile/`

| Area | Purpose |
|------|---------|
| `capacitor.config.ts` | **Capacitor** config (app id, web dir, plugins). |
| `android/` | **Android Studio** project (Gradle, `MainActivity`, resources). |
| `www/` | Static placeholder or built assets for the native shell. |

The **web app** remains the Next.js project at the repo root; the mobile folder wraps it for distribution as an app.

---

## How a typical flow touches files

1. **Landing** → `src/app/page.tsx` + `components/landing/*`.
2. **Sign in** → `src/app/auth/page.tsx` + `components/auth/*` → `api/auth/[...nextauth]`.
3. **New interview** → `src/app/app/new-interview/page.tsx` → `UserDashboard.tsx` (`CreateInterviewWizard`) → `api/interview-config`, then `api/interviews` + `api/interviews/[id]/generate-questions`.
4. **Take interview** → `app/interviews/[id]/page.tsx` → `InterviewSessionPage.tsx` + `hooks/interview/useInterviewSession.ts` → `api/interviews/[id]`.
5. **Admin config** → `dashboard/track-config/page.tsx` → `TrackConfigManager.tsx` → `api/admin/interview-config/*`.

---

## Keeping this document accurate

When you add a **new route**, **API handler**, or **major feature folder**, add a one-line entry under the right section. Prefer **describing responsibility** over listing every file name.

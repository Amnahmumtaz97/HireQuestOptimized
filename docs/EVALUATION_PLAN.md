# HireQuest — Answer Evaluation: design & implementation plan

**Status:** proposed — nothing in this document is built yet
**Scope:** how a completed interview session gets scored, on what basis, and in what build order

---

## Table of contents

1. [Why this document exists](#1-why-this-document-exists)
2. [Current state of the code](#2-current-state-of-the-code)
3. [The three problems](#3-the-three-problems)
4. [Core decision: answer keys at generation time](#4-core-decision-answer-keys-at-generation-time)
5. [What we evaluate on: three tiers of signal](#5-what-we-evaluate-on-three-tiers-of-signal)
6. [Content vs delivery — two scores, not one](#6-content-vs-delivery--two-scores-not-one)
7. [The rubric](#7-the-rubric)
8. [Delivery scoring: exact bands and formula](#8-delivery-scoring-exact-bands-and-formula)
9. [The "confidence" trap](#9-the-confidence-trap)
10. [Scoring math: sub-scores to session score](#10-scoring-math-sub-scores-to-session-score)
11. [The evaluation pipeline](#11-the-evaluation-pipeline)
12. [Data model changes](#12-data-model-changes)
13. [API surface](#13-api-surface)
14. [Build plan — six phases](#14-build-plan--six-phases)
15. [Open questions](#15-open-questions)

---

## 1. Why this document exists

HireQuest captures interview answers but never scores them. Worse, a placeholder
metric that measures *answer coverage* is currently being treated as a quality
score throughout the learning-path system.

This document defines what "evaluating an interview answer" means for this
product, what evidence we score against, and the order in which to build it.

**One-sentence summary:** decide what a good answer looks like *when the question
is created*, trust hard facts over AI opinion, score content and delivery
separately, and count unanswered questions as zero.

---

## 2. Current state of the code

### What already works (better than `PROJECT.md` claims)

`PROJECT.md` describes speech-to-text as "planned". It is not — it is built and working.

| Capability | Location | Notes |
|---|---|---|
| Deepgram STT | `src/app/api/speech/transcribe/route.ts` | Auth, rate limiting, 25MB cap, format validation |
| Word-level timings | `src/lib/speech/transcript.ts` | `TranscriptWord` with start/end/confidence |
| Pause detection | `src/lib/speech/transcript.ts` | Three tiers: short / medium / long |
| Disfluency counting | `src/lib/speech/transcript.ts` | "um", "uh", "er"… |
| Crutch phrase detection | `src/lib/speech/transcript.ts` | "you know", "sort of", "basically"… |
| Delivery metrics | `summarizeDelivery()` | wpm, articulation rate, silence ratio, pause stats |
| Coding judge | `src/app/api/interviews/[id]/run-code/route.ts` | Runs tests in a `vm` sandbox |
| Gemini infrastructure | `src/lib/gemini/` | Model fallback chain, JSON mode, parse helpers |

### What does not exist

- No `evaluate` route
- No rubric definition anywhere
- No `score`, `evaluation`, or `feedback` field on `InterviewSession`
- `InterviewResultsPage.tsx` states outright: *"Automated scoring is not enabled yet"*

**The gap is not "we need STT." The gap is that captured signal has nowhere to go.**

---

## 3. The three problems

### Problem A — a fake score is already driving real decisions

`src/app/api/interviews/[id]/route.ts`:

```js
function completionScore(doc) {
  const answered = (doc.answers ?? []).filter(a => a.answer.trim().length > 0).length
  return Math.round((answered / total) * 100)   // "score" = % of boxes filled in
}
```

This value is passed directly into `advancePathProgressForInterview()` as `score`, where it:

- writes `progress.stageScores[stageId]`
- writes `progress.topicStats[topic].avgScore`
- gates stage unlock against `stage.unlockMinScore`
- decides whether remediation is queued (threshold: `< 80`)
- awards 40 XP vs 25 XP (threshold: `>= 90`)

It also surfaces as `interviewConfidenceScore` and `feedbackTrend` in
`src/app/api/users/me/learning-analytics/route.ts`.

> **Concrete failure:** typing `x` into every answer box scores **100**. Every
> learning-path stage unlocks, remediation never triggers, and analytics show a
> perfect trend line.

This is not a missing feature. It is an active correctness bug. Evaluation must
*replace* this number, not sit beside it.

### Problem B — the best available signal is computed, then discarded

In `InterviewAnswerEditor.tsx`, delivery stats arrive from the transcribe route,
render as a chip row, and die on component unmount. Only the merged text is saved.

Two consequences:

1. The objective delivery metrics — free, deterministic, no AI needed — are lost forever.
2. The **annotated** transcript is what gets persisted, so `[pause 1.4s]` markers
   are baked into `answers[].answer` itself. Any future grader reads polluted text.

### Problem C — coding questions have ground truth that nothing reads

`run-code/route.ts` writes `testsPassed` / `testsTotal` onto the answer.
`InterviewSession.ts` has the fields. **Nothing anywhere reads them.**

That is a deterministic, zero-cost, zero-hallucination score sitting unused.

---

## 4. Core decision: answer keys at generation time

Grading means comparing an answer against a standard. Today the app stores a
question as **text only** — there is no standard to compare against.

`src/lib/interview-questions/schema.ts` currently holds:

```ts
{ question, type, topic, difficulty, kind, language, starterCode,
  functionName, publicTests, hiddenTests }
```

No answer key. So there are two options:

| | When is the standard decided? | Consequence |
|---|---|---|
| **Option A** | At grading time — *"Gemini, is this answer good?"* | The model invents a standard fresh each run. Same answer graded twice gives different scores. You cannot explain why someone got 60. |
| **Option B** ✅ | At **question generation** time — question and answer key created together | Standard is fixed, stored, auditable. Grading becomes checklist matching. |

**We are going with Option B.**

The analogy for a Node developer: you do not ask "is this function good?" — you
write `expect(result).toBe(x)` first, then check against it. Option B is writing
the assertions up front.

### What the generator returns after the change

```json
{
  "question": "How would you handle a memory leak in a Node service?",
  "topic": "Node.js",
  "type": "technical",
  "difficulty": "Medium",

  "keyPoints": [
    "Identifies symptoms — RSS growth, GC pressure, eventual OOM",
    "Names a tool — heap snapshots, clinic.js, --inspect",
    "Compares two snapshots to find retained objects",
    "Mentions a common cause — unbounded cache, listener leak, closure",
    "Describes verifying the fix under load"
  ],
  "redFlags": [
    "Just says 'restart the server'",
    "Confuses a memory leak with high CPU"
  ],
  "idealAnswerSummary": "A strong answer walks from detection to diagnosis to root cause to verification."
}
```

### Why this makes everything else easier

Grading becomes: *"Which of these five key points did the candidate cover?"*

That is a task a language model performs **reliably and cheaply**, because it is
a checklist, not an open-ended judgment. And the output is explainable — the
candidate can be told *"you missed: verifying the fix under load"* rather than
just *"your score is 72."*

> ⚠️ **This phase cannot be backfilled.** Sessions created before this change have
> no answer key and can never be graded consistently. Every day of delay creates
> more ungradable data. Build this first.

> 🔒 **Security note:** never send `keyPoints` / `redFlags` to the browser while a
> session is in progress — it is the answer key. Strip these fields from the
> `GET /api/interviews/[id]` response unless `status === 'completed'`.

---

## 5. What we evaluate on: three tiers of signal

Not all evidence deserves equal trust. Sort it by reliability.

### Tier 1 — Ground truth (objective, free, never wrong)

Facts the machine knows for certain.

- **Coding questions:** `testsPassed / testsTotal`, already computed and stored.

If the tests fail, the code is wrong. **No AI opinion may overrule Tier 1.**

### Tier 2 — Measured (objective, free, derived from audio)

Numbers computed from data, no judgment involved. All of these already exist in
`summarizeDelivery()`:

| Metric | What it indicates | Healthy range |
|---|---|---|
| `wordsPerMinute` | Speaking pace | 120–160 |
| `disfluencies.perMinute` | Filler frequency | under 3 |
| `pauses.longestSec` | Did they freeze? | under 4s |
| `silenceRatio` | Share of dead air | under 0.30 |
| `crutches` | Verbal crutches | under 5 total |

These are facts, not opinions. A 6.2-second pause is 6.2 seconds.

### Tier 3 — Judged (subjective, costs money, can be wrong)

Only this tier requires Gemini: *did the answer cover the key points, and how well?*

### The governing rule

> **Tier 3 never overrides Tier 1 or Tier 2.** If tests pass 2 of 10, the score is
> low no matter how eloquently the approach was explained.

---

## 6. Content vs delivery — two scores, not one

An evaluation produces **two numbers**:

```
Evaluation of a session
├── contentScore   = WHAT they said   (correctness, key points, STAR structure)
└── deliveryScore  = HOW they said it (pace, fillers, pauses, silence)
```

Both are calculated. Both are stored. Both are shown. Neither is discarded.

### Why they must not be merged

A candidate answers *"Tell me about a production outage you handled"* aloud for 90 seconds:

| | Result |
|---|---|
| Content | Hit 4 of 5 key points, clear STAR structure, quantified outcome → **82** |
| Delivery | 145 wpm, 8 fillers, a 5.2s freeze, 34% dead air → **67** |

**Merged:** the candidate sees **75** and learns nothing. Is their knowledge weak,
or their speaking?

**Separate:** *"Your content is strong (82). Your delivery needs work (67) — 8
filler words and a 5-second pause mid-answer."* Now they know what to practise.

### The technical reason

**Delivery only exists when the candidate speaks.** A typed answer has no audio,
therefore no wpm, no pauses, no silence ratio.

Blending delivery into a single overall number would make typed and spoken
sessions **incomparable**, and would corrupt the trend line in
`learning-analytics/route.ts`.

### What gates what

| Score | Always exists? | Gates learning-path unlock? | Shown to user? |
|---|---|---|---|
| `contentScore` | ✅ Yes | ✅ **Yes — this is the gate** | ✅ Yes |
| `deliveryScore` | ❌ Only when spoken | ❌ No | ✅ Yes |

**Content gates progression. Delivery coaches.** Blocking someone from the next
stage for speaking slowly would be unfair *and* technically broken, since typed
sessions would have nothing to gate on.

---

## 7. The rubric

Each question type needs its own dimensions. This is the substance of "on what
basis do we evaluate."

### Coding

| Dimension | Weight | Tier |
|---|---|---|
| Tests passed | **60%** | 1 — deterministic |
| Time / space complexity | 20% | 3 |
| Edge cases handled | 10% | 3 |
| Readability | 10% | 3 |

### Technical (spoken)

| Dimension | Weight | What is checked |
|---|---|---|
| Correctness | 35% | Anything factually wrong? |
| Coverage | 30% | How many `keyPoints` were hit? |
| Depth | 20% | Appropriate for the stated difficulty — a "Hard" question needs more than a definition |
| Precision | 15% | Correct terminology, used correctly |

### Behavioral — score STAR explicitly

| Dimension | Weight | What is checked |
|---|---|---|
| **S**ituation + **T**ask | 20% | Real, specific context — not hypothetical |
| **A**ction | 30% | What *they personally* did, concretely |
| **R**esult | 25% | An outcome, ideally quantified |
| Ownership | 15% | Says "I" not "we" — the strongest tell in behavioral interviews |
| Specificity | 10% | One real story, not generic advice |

> Build behavioral first. STAR is a rigid, well-documented structure, which makes
> the checklist easy to specify tightly and hard to game.

### System Design

| Dimension | Weight |
|---|---|
| Requirements clarification | 20% |
| Component design | 30% |
| Scale & bottleneck reasoning | 30% |
| Trade-offs | 20% |

### HR

| Dimension | Weight |
|---|---|
| Clarity | 40% |
| Role alignment | 35% |
| Professionalism | 25% |

### Delivery — separate score, every spoken answer

| Dimension | Weight |
|---|---|
| Pace | 25% |
| Fillers | 30% |
| Pauses | 25% |
| Silence | 20% |

---

## 8. Delivery scoring: exact bands and formula

Pure functions. No AI. Fully unit-testable — `src/lib/speech/transcript.test.ts`
already establishes the vitest pattern.

### Pace — `wordsPerMinute` (weight 25%)

| Range | Points |
|---|---|
| 120–160 | 100 |
| 100–119 or 161–180 | 75 |
| 80–99 or 181–200 | 50 |
| under 80 or over 200 | 25 |

### Fillers — `disfluencies.perMinute` (weight 30%)

| Range | Points |
|---|---|
| 0–2 | 100 |
| 2–4 | 75 |
| 4–6 | 50 |
| 6–8 | 30 |
| over 8 | 10 |

### Longest pause — `pauses.longestSec` (weight 25%)

| Range | Points |
|---|---|
| under 2s | 100 |
| 2–4s | 80 |
| 4–6s | 55 |
| 6–10s | 30 |
| over 10s | 10 |

### Silence — `silenceRatio` (weight 20%)

| Range | Points |
|---|---|
| under 0.15 | 100 |
| 0.15–0.25 | 85 |
| 0.25–0.35 | 65 |
| 0.35–0.50 | 40 |
| over 0.50 | 20 |

### Formula

```
deliveryScore = pace×0.25 + fillers×0.30 + pauses×0.25 + silence×0.20
```

### Worked example

Candidate: 145 wpm, 5.3 fillers/min, 5.2s longest pause, 0.34 silence ratio.

```
pace     145 wpm    → 100  × 0.25 = 25.00
fillers  5.3/min    →  50  × 0.30 = 15.00
pauses   5.2s       →  55  × 0.25 = 13.75
silence  0.34       →  65  × 0.20 = 13.00
                                   -------
                      deliveryScore = 66.75  →  67
```

Fillers carry the heaviest weight (30%) because they are the most actionable
thing a candidate can fix, and the most noticeable to a real interviewer.

---

## 9. The "confidence" trap

`transcribe/route.ts` returns a field named `confidence`:

```js
meta: { model, confidence, durationSec }
```

**This is not the candidate's confidence.** It is Deepgram reporting *"I am 94%
sure I transcribed those words correctly."* It measures **audio quality and
recognition accuracy**, not self-assurance.

| | Usage |
|---|---|
| ✅ **Correct** | A quality gate. If `confidence < 0.6`, the transcript is unreliable — skip delivery scoring and tell the user *"audio quality was poor, we could not analyse your delivery."* |
| ❌ **Wrong** | Feeding it into the score as a "confidence" metric. |

### Can candidate confidence actually be measured?

Only through **proxies** — all of which are already computed:

| Signal | Field | What it suggests |
|---|---|---|
| High filler rate | `disfluencies.perMinute` | Thinking aloud, unsure |
| Long pauses | `pauses.longestSec` | Froze, searching for an answer |
| High silence ratio | `silenceRatio` | Hesitant overall |
| Hedging language | `crutches` — "sort of", "kind of", "I mean" | Lack of conviction |

Those four proxies *are* the delivery score. **Label the number "Delivery" or
"Fluency"** — honest and defensible. Do not label it "Confidence": we are
measuring speech patterns, not a mental state.

---

## 10. Scoring math: sub-scores to session score

### Step 1 — one question's score

Weighted average of its rubric dimensions:

```
questionScore = Σ(dimensionScore × weight)

// Behavioral example:
// 85×0.20 + 90×0.30 + 75×0.25 + 80×0.15 + 70×0.10 = 82.0
```

### Step 2 — weight by difficulty

A Hard question should count for more than an Easy one:

| Difficulty | Multiplier |
|---|---|
| Easy | ×1.0 |
| Medium | ×1.3 |
| Hard | ×1.6 |

### Step 3 — session scores

```
contentScore  = Σ(questionScore × difficultyWeight) / Σ(difficultyWeight)
deliveryScore = plain average across spoken answers only
```

### Step 4 — unanswered questions count as zero

This is precisely where the current system fails. Skipping 10 of 20 questions must
not produce the same score as answering all 20 well.

### Step 5 — topic scores

Group questions by `topic`, average each group. This powers "your weak area is
Caching" and feeds the existing `topicStats` and remediation logic in
`advance-on-complete.ts`.

---

## 11. The evaluation pipeline

Read it as Express middleware: cheap deterministic checks first, expensive AI
last, short-circuit wherever possible.

```
 User clicks "Finish Interview"
        │
        ▼
 POST /api/interviews/[id]/evaluate  → status:'running', return 202 immediately
        │
        ▼
 ┌──────────────────────────────────────────────────┐
 │ For each question:                               │
 │                                                  │
 │  STEP 1  Gate  (free, no AI)                     │
 │    • empty?                    → score 0, stop   │
 │    • under ~15 words?          → score 0, stop   │
 │    • echoes the question back? → score 0, stop   │
 │    • no real alphabetic words? → score 0, stop   │
 │            │ passes                              │
 │            ▼                                     │
 │  STEP 2  Tier 1 + 2  (free, no AI)               │
 │    • coding → testsPassed / testsTotal           │
 │    • spoken → delivery score from stored stats   │
 │            │                                     │
 │            ▼                                     │
 │  STEP 3  Tier 3  (Gemini, batched 5 at a time)   │
 │    • send: question + keyPoints + answer         │
 │    • receive: dimension scores + rationale+tips  │
 └──────────────────────────────────────────────────┘
        │
        ▼
 STEP 4  Aggregate → contentScore, deliveryScore, per-topic
        │
        ▼
 STEP 5  Persist, set evaluationStatus:'ready'
        │
        ▼
 STEP 6  NOW advance the learning path, using the real score
```

### Why each design choice

| Choice | Reason |
|---|---|
| **Step 1 exists** | The anti-gaming layer, and it costs nothing. Junk answers never reach Gemini, so we never pay to grade `asdfasdf`. |
| **Separate `/evaluate` route** | `PATCH /api/interviews/[id]` runs on every answer save and navigation. 20 Gemini calls there would exceed the function timeout and freeze the UI on "Finish". |
| **Batch 5 per call** | One call per question = 20 calls (slow, costly). One call for everything = oversized JSON that gets truncated. Five isolates a parse failure to 5 questions instead of 20. |
| **Step 6 runs last** | Today `advancePathProgressForInterview` runs *inside* the completion PATCH using the fake coverage score. Stages unlock before a real score exists — and since `completedStageIds` is a Set, re-running later cannot un-unlock them. |

---

## 12. Data model changes

### `answers[]` subdocument — `src/models/InterviewSession.ts`

```ts
answers: [{
  index, answer, updatedAt, testsPassed, testsTotal,   // existing

  // Phase 2 — capture (stop discarding this)
  transcript: { verbatim: String, annotated: String },  // keep markers OUT of `answer`
  delivery:   { type: Schema.Types.Mixed },             // DeliveryStats, already typed
  inputMode:  { type: String, enum: ['typed', 'spoken', 'coding'] },

  // Phase 5 — evaluation
  evaluation: {
    contentScore:  Number,
    deliveryScore: Number,
    scores:        { type: Map, of: Number },   // dimension -> 0..100
    keyPointsHit:    [Number],
    keyPointsMissed: [Number],
    rationale:  String,
    tips:       [String],
    flags:      [String],       // 'too_short' | 'echoed_question' | 'low_audio_confidence'
    answerHash: String,         // idempotency — skip re-grading unchanged answers
    model:      String,
    evaluatedAt: Date,
  },
}]
```

### Session level

```ts
evaluationStatus: {
  type: String,
  enum: ['none', 'pending', 'running', 'ready', 'failed'],
  default: 'none',
},
evaluation: {
  contentScore:  Number,
  deliveryScore: Number,
  byTopic:   { type: Map, of: Number },
  strengths:  [String],
  gaps:       [String],
  nextTopics: [String],
  completedAt: Date,
}
```

### Why embed rather than a sibling collection

`PROJECT.md` suggests a separate `InterviewEvaluation` document. **Embed instead.**
The results page already fetches the whole session in one `GET`; a separate
collection buys a join for no benefit. 20 questions at roughly 1 KB each is
trivial against Mongo's 16 MB document limit — and diagrams are disabled
(`MAX_DIAGRAM_QUESTIONS = 0`), so nothing else is inflating these documents.

`answerHash` matters: it makes re-evaluation idempotent, and lets a single edited
answer be re-graded without re-grading the other nineteen.

### Example stored result

```js
answers[3] = {
  index: 3,
  answer: "When our payment service started timing out...",
  transcript: { verbatim: "...", annotated: "..." },
  delivery: { wordsPerMinute: 145, disfluencies: {...}, pauses: {...} },
  inputMode: 'spoken',

  evaluation: {
    contentScore: 82,
    deliveryScore: 67,
    scores: { situationTask: 85, action: 90, result: 75, ownership: 80, specificity: 70 },
    keyPointsHit: [0, 1, 2, 4],
    keyPointsMissed: [3],
    tips: [
      "Quantify the impact — 'reduced latency by 40%' beats 'it got faster'",
      "You paused 5.2s mid-answer; a brief 'let me think' keeps the flow natural",
    ],
  },
}
```

---

## 13. API surface

```
POST /api/interviews/[id]/evaluate   → sets evaluationStatus:'running', returns 202
GET  /api/interviews/[id]            → results page polls evaluationStatus
```

Mirror the conventions already used by `generate-questions/route.ts`:

- same `getServerSession` auth guard
- same `checkRateLimit` from `src/lib/rate-limit.ts`
- same model fallback chain from `src/lib/gemini/model-fallback.ts`
- `responseMimeType: 'application/json'`
- `export const runtime = 'nodejs'` and an explicit `maxDuration`, as
  `transcribe/route.ts` does

Validate every Gemini response with Zod and **clamp all scores to 0–100** rather
than trusting the model, following the pattern in
`src/lib/interview-questions/parse-gemini-json.ts`.

---

## 14. Build plan — six phases

Note how little of this requires AI.

| # | Phase | AI? | Why in this position |
|---|---|---|---|
| **1** | **Answer keys** — add `keyPoints`, `redFlags`, `idealAnswerSummary` | Prompt change only | **Cannot be retrofitted.** Every day of delay creates more ungradable sessions |
| **2** | **Persist capture** — save `transcript` + `delivery`; stop writing pause markers into `answer` | ❌ No | Pure plumbing. This data is computed today and thrown away |
| **3** | **Deterministic scoring** — coding tests + delivery bands | ❌ No | Real scores on screen at zero cost and zero hallucination risk. Proves the schema and UI before spending a token |
| **4** | **Replace `completionScore`** in the path-advance call | ❌ No | This is the actual bug — ship as soon as 3 lands |
| **5** | **LLM rubric layer** — behavioral, then technical, then system design | ✅ Yes | The genuinely hard part, correctly last |
| **6** | **Results + analytics UI** | ❌ No | Replace coverage math; drop the "not enabled yet" copy |

### Phase 1 — Answer keys

| File | Change |
|---|---|
| `src/lib/interview-questions/schema.ts` | Add `keyPoints: z.array(z.string()).max(8)`, `redFlags`, `idealAnswerSummary` |
| `src/lib/gemini/generate-questions.ts` | Add fields to both prompt JSON shapes (standard + coding) |
| `src/models/InterviewSession.ts` | Add the same fields to the `questions` subdocument |
| `src/lib/interview-questions/templates.ts` | Static key points for the no-API fallback path |
| `src/app/api/interviews/[id]/route.ts` | Strip answer-key fields from `GET` unless `status === 'completed'` |

### Phase 2 — Persist capture

| File | Change |
|---|---|
| `src/models/InterviewSession.ts` | Add `transcript`, `delivery`, `inputMode` to `answers[]` |
| `src/components/app/interview/InterviewAnswerEditor.tsx` | Send `delivery` + `verbatim` with the save instead of holding them in local state |
| `src/app/api/interviews/[id]/route.ts` | Extend `patchSchema` to accept the new fields |
| `InterviewAnswerEditor.tsx` | **Stop writing `[pause 1.4s]` into `answer`** — store the annotated form separately |

> Re-check the 10,000-character cap on `answer` in `patchSchema` during this phase.
> A five-minute spoken answer at 150 wpm is roughly 750 words, so there is headroom,
> but pause markers inflate it and transcripts are moving to their own field anyway.

### Phase 3 — Deterministic scoring

New folder `src/lib/evaluation/`:

| File | Responsibility |
|---|---|
| `delivery-score.ts` | The band tables from §8 — pure functions, unit-tested |
| `coding-score.ts` | `testsPassed / testsTotal` |
| `gates.ts` | Empty / too short / echoed question / gibberish → score 0 |

### Phase 4 — Remove the fake score

- Delete `completionScore` from `src/app/api/interviews/[id]/route.ts`
- Move the `advancePathProgressForInterview` call out of the completion PATCH so it
  runs only after a real score exists
- Fix `interviewConfidenceScore` and `feedbackTrend` in
  `src/app/api/users/me/learning-analytics/route.ts` to read `contentScore`

### Phase 5 — LLM rubric layer

| File | Responsibility |
|---|---|
| `src/lib/evaluation/rubric.ts` | Per-type dimensions and weights (§7) |
| `src/lib/evaluation/prompt.ts` | Builds the batch prompt: question + keyPoints + answer |
| `src/lib/evaluation/parse.ts` | Zod validation, clamp to 0–100 |
| `src/app/api/interviews/[id]/evaluate/route.ts` | Orchestration, 202 + polling |

### Phase 6 — UI

Replace the placeholder in `src/components/app/interview/InterviewResultsPage.tsx`
with two score rings (content + delivery), per-topic bars, and per-question
missed key points.

---

## 15. Open questions

1. **Re-evaluation policy** — if a user edits an answer after completion, do we
   re-grade automatically, or require an explicit action? (`answerHash` supports both.)
2. **Cost ceiling** — at 4 Gemini calls per session, what is the acceptable
   per-user monthly budget, and does it need a plan-tier gate via `BillingService`?
3. **Failure UX** — if evaluation fails after three retries, does the results page
   fall back to deterministic-only scores, or show an error state?
4. **Audio retention** — the current flow never stores audio, only transcripts.
   Confirm this stays true, and document it in `privacy-content.ts`.
5. **Human override** — `PROJECT.md` mentions coaches annotating scores. Out of
   scope here, but the `evaluation` subdocument should not block it later.

---

## Related documents

- `PROJECT.md` — project overview (note: its STT "planned" status is out of date)
- `docs/PROJECT_STRUCTURE.md` — repository layout

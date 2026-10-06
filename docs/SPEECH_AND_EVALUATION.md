# Speech (Deepgram) and Evaluation — how they work in this codebase

Written for engineers working on HireQuest. Every section names the file it describes. Express analogies are used where they make the shape obvious.

**Contents**

- [Part A — Speech: from microphone to stored transcript](#part-a--speech-from-microphone-to-stored-transcript)
  - [A1. The whole path in one picture](#a1-the-whole-path-in-one-picture)
  - [A2. Configuration](#a2-configuration)
  - [A3. Browser: recording the audio](#a3-browser-recording-the-audio)
  - [A4. Browser: the live preview (Web Speech)](#a4-browser-the-live-preview-web-speech)
  - [A5. Browser: the answer editor ties it together](#a5-browser-the-answer-editor-ties-it-together)
  - [A6. Server: `POST /api/speech/transcribe`](#a6-server-post-apispeechtranscribe)
  - [A7. The Deepgram call itself](#a7-the-deepgram-call-itself)
  - [A8. Turning words into pauses, fillers and delivery stats](#a8-turning-words-into-pauses-fillers-and-delivery-stats)
  - [A9. Saving the capture on the session](#a9-saving-the-capture-on-the-session)
  - [A10. What is never stored](#a10-what-is-never-stored)
- [Part B — Evaluation: from saved answers to a score](#part-b--evaluation-from-saved-answers-to-a-score)
  - [B1. The four ideas everything rests on](#b1-the-four-ideas-everything-rests-on)
  - [B2. Lifecycle of one interview](#b2-lifecycle-of-one-interview)
  - [B3. Data model](#b3-data-model)
  - [B4. The answer key is generated with the question](#b4-the-answer-key-is-generated-with-the-question)
  - [B5. Keeping the answer key off the client](#b5-keeping-the-answer-key-off-the-client)
  - [B6. The pipeline, step by step](#b6-the-pipeline-step-by-step)
  - [B7. How each rubric is scored](#b7-how-each-rubric-is-scored)
  - [B8. Delivery score](#b8-delivery-score)
  - [B9. Session aggregation](#b9-session-aggregation)
  - [B10. Failure handling, retries and idempotency](#b10-failure-handling-retries-and-idempotency)
  - [B11. Consistency: temperature, prompt version, golden set](#b11-consistency-temperature-prompt-version-golden-set)
  - [B12. Where the score is used afterwards](#b12-where-the-score-is-used-afterwards)
  - [B13. Every flag and what the UI says](#b13-every-flag-and-what-the-ui-says)
- [Part C — Reference](#part-c--reference)
  - [C1. File map](#c1-file-map)
  - [C2. Environment variables](#c2-environment-variables)
  - [C3. Debugging: what the log lines mean](#c3-debugging-what-the-log-lines-mean)

---

# Part A — Speech: from microphone to stored transcript

## A1. The whole path in one picture

```
 Browser                                          Server (Next.js route handlers)              Deepgram
 ───────────────────────────────────────────────  ──────────────────────────────────────────   ────────
 InterviewAnswerEditor.tsx
   │ user taps mic
   ├─ useAudioRecorder.start()   → MediaRecorder captures raw audio (webm/opus)
   ├─ useSpeechDictation.start() → Web Speech API shows live words (preview only)
   │ user taps stop
   ├─ dictation.stop() → invalidate session (ignore late Web Speech)
   ├─ keep browser preview visible while Deepgram runs
   ├─ recorder.stop() → Blob
   │
   └─ POST /api/speech/transcribe (multipart: audio) ─────────▶ transcribe/route.ts
                                                                 │ auth, rate limit, size, mime
                                                                 ├─ transcribeAudio() ────────▶ POST /v1/listen?model=nova-3&filler_words=true…
                                                                 │                          ◀── words[] with timings + confidence
                                                                 ├─ summarizeDelivery(words)   (transcript.ts — pure maths)
                                                                 ◀── { verbatim, annotated, words, pauses, delivery, meta }
   ◀────────────────────────────────────────────────────────────┘
   ├─ answer ← Deepgram `verbatim` once (finalTranscript); then immutable
   │   · on Deepgram failure: keep browser preview as browser-fallback
   ├─ clips[] ← speechAnalysis { verbatim, annotated, delivery, confidence }
   └─ onCapture(mergeClips(clips)) → page state
                │ autosave (1.2s) / Next / Finish
                └─ PATCH /api/interviews/[id] { answer: finalTranscript, capture: { inputMode:'spoken', transcript, delivery, audioConfidence } }
                                                               → answers[i].{ answer, transcript, delivery, audioConfidence, inputMode }
```

**Web Speech** = live preview. **Deepgram Nova-3** = final transcript (exactly once after Stop). **Speech metadata** (`transcript` + `delivery`) = Results metrics only — never continuously rewrites the answer.

## A2. Configuration

Read in [src/lib/speech/deepgram.ts](../src/lib/speech/deepgram.ts):

| Variable | Default | Purpose |
|---|---|---|
| `DEEPGRAM_API_KEY` | — (required) | Sent as `Authorization: Token …`. Missing → `SpeechConfigError` → HTTP 501 from the route, and the editor keeps the live preview text. |
| `DEEPGRAM_MODEL` | `nova-3` | The `model` query parameter. |
| `DEEPGRAM_LANGUAGE` | `en` | The `language` query parameter, unless the request form includes a `language` field matching `^[a-z]{2}(-[A-Z]{2})?$`. |

`isSpeechConfigured()` is the one-line "is the key set" check.

## A3. Browser: recording the audio

[src/hooks/useAudioRecorder.ts](../src/hooks/useAudioRecorder.ts)

- `supported` is true when `MediaRecorder` and `navigator.mediaDevices.getUserMedia` exist — Chrome, Firefox, Safari all qualify.
- `start()`:
  - Requests the microphone with `echoCancellation`, `noiseSuppression`, `autoGainControl` all on. A denied permission becomes the error *"Microphone access was blocked…"*.
  - Picks the first MIME type the browser can produce from `audio/webm;codecs=opus` → `audio/webm` → `audio/ogg;codecs=opus` → `audio/mp4` (Safari).
  - Calls `recorder.start(1000)`: a 1-second timeslice, so chunks accumulate as you speak and a tab crash mid-answer still leaves data behind.
  - Ticks `elapsedSec` every second for the on-screen timer.
- `stop()` waits for the recorder's `onstop`, joins the chunks into one `Blob`, releases the mic tracks, and resolves `{ blob, mimeType, durationSec }` — or `null` if nothing was captured.
- `cancel()` and the unmount cleanup discard everything without resolving.

## A4. Browser: the live preview (Web Speech)

[src/hooks/useSpeechDictation.ts](../src/hooks/useSpeechDictation.ts)

- Uses the browser's `SpeechRecognition` / `webkitSpeechRecognition`. Chromium only; `supported` is false on Firefox/Safari, and the editor works without it.
- `continuous: true`, `interimResults: true`. `interim` is the not-yet-final text shown under the mic while listening; finalised chunks are pushed through `onTranscript` and appended to the draft.
- Chrome ends the recogniser on every pause; `onend` restarts it while `wantsListeningRef` is true.
- Live preview is `finals + interim` (`liveTranscript`). Stop snapshots it, sets `accepting=false`, bumps a session id, and aborts recognition so late Chrome callbacks are ignored.
- Deepgram then replaces the dictated span **once** with `verbatim` as `finalTranscript`. Annotated/delivery stay in speech analysis for Results. On Deepgram failure the browser snapshot is kept as `browser-fallback`.

## A5. Browser: the answer editor ties it together

[src/components/app/interview/InterviewAnswerEditor.tsx](../src/components/app/interview/InterviewAnswerEditor.tsx)

State that matters:

| Ref / state | Meaning |
|---|---|
| `baseValueRef` | The draft as it stood when recording began. Everything dictated after this point is replaced by the exact transcript. |
| `clips` | One entry per recording for this question: `{ verbatim, annotated, delivery, confidence }`. |
| `capture` (memo) | `mergeClips(clips)` — see below. |
| `showAnnotated` | Toggles the read-only "transcript with pause markers" panel under the stats. |

`handleToggle` (the mic button — both the big in-box one and the small header one):

1. If capturing → `stopAndTranscribe()`.
2. Else record `baseValueRef = current draft`, start the recorder; if the recorder started, also start dictation. If the recorder is unsupported, dictation alone runs (preview text becomes the answer, no delivery stats).

`stopAndTranscribe()`:

1. Stops dictation, awaits the recorder → `Blob`.
2. Builds `FormData` with the blob as `answer.webm` / `answer.mp4`, `POST /api/speech/transcribe`.
3. On non-OK: shows the server message; the live-dictated draft stays.
4. On OK: `onChange(replaceDictatedSpan(baseValue, verbatim))` — the textarea now holds **verbatim words, no pause markers**.
5. Pushes a clip and calls `onCapture(mergeClips(next))`.

`mergeClips` lives in [src/lib/interview/answer-capture.ts](../src/lib/interview/answer-capture.ts): transcripts are concatenated; `DeliveryStats` are merged by `mergeDeliveryStats` (sums, rates recomputed from sums, max of longest pause — never an average of per-clip rates); `audioConfidence` is the **minimum** across clips.

Clearing the textarea completely resets `clips` and calls `onCapture(null)`, so a retyped answer is saved as typed.

The page ([InterviewSessionPage.tsx](../src/components/app/InterviewSessionPage.tsx)) keeps `capture` in state per question (`undefined` on arrival, `null` after clearing, object after recording), passes it to every `saveAnswer` call, and remounts the editor per question via `key={index}`.

## A6. Server: `POST /api/speech/transcribe`

[src/app/api/speech/transcribe/route.ts](../src/app/api/speech/transcribe/route.ts) — `runtime = 'nodejs'`, `maxDuration = 60`.

Think of it as an Express handler with middleware inlined:

| Step | Rule | Failure |
|---|---|---|
| Auth | `getServerSession` must yield a user id | 401 |
| Rate limit | `checkRateLimit('speech-transcribe:<userId>', 90 per hour)` (in-memory sliding window, [rate-limit.ts](../src/lib/rate-limit.ts)) | 429 + `Retry-After` |
| Body | multipart field `audio` must be a `File` | 400 |
| Empty | `size === 0` | 400 "recording was empty" |
| Size | `> 25 MB` | 400 "keep answers under about 20 minutes" |
| MIME | must start with `audio/`, `video/webm` or `application/octet-stream` | 400 |
| Language | optional `language` form field, validated by regex | ignored if invalid |
| Transcribe | `transcribeAudio({ audio: Buffer, mimeType, language })` | see A7 |
| No speech | `words.length === 0` | 422 "No speech was detected" |

Success response:

```json
{
  "verbatim":  "So, um, I checked the heap snapshot…",          // exact words, fillers kept, no markers
  "annotated": "So, um, I checked the [pause 1.4s] heap …",     // same + pause markers
  "words":     [{ "word": "so", "punctuated": "So,", "start": 0.0, "end": 0.3, "confidence": 0.98 }, …],
  "pauses":    [{ "afterIndex": 4, "start": 1.9, "end": 3.3, "durationSec": 1.4, "tier": "short" }, …],
  "delivery":  { "wordsPerMinute": 145, "disfluencies": {…}, "pauses": {…}, "silenceRatio": 0.34, … },
  "meta":      { "model": "nova-3", "confidence": 0.94, "durationSec": 92.1 }
}
```

Error mapping: `SpeechConfigError` → 501 (key missing / rejected), `SpeechRequestError` → its own status (429 rate-limited upstream, 502 provider failure, 504 timeout), anything else → 500.

**`meta.confidence` is Deepgram's confidence in its own transcription, not the candidate's confidence.** It is only ever used as an audio-quality gate (B8).

## A7. The Deepgram call itself

[src/lib/speech/deepgram.ts](../src/lib/speech/deepgram.ts) — `transcribeAudio()`

```
POST https://api.deepgram.com/v1/listen
     ?model=nova-3
     &language=en
     &smart_format=true      capitals, punctuation, number formatting
     &punctuate=true
     &filler_words=true      ← the point of the feature: keep every "um" / "uh"
     &utterances=true        sentence-level segmentation (available for later use)
     &paragraphs=true
Authorization: Token <DEEPGRAM_API_KEY>
Content-Type: <the recording's mime type>
Body: raw audio bytes
```

- `AbortSignal.timeout(120_000)` — a timeout becomes a 504-class `SpeechRequestError`; a network failure becomes 502.
- 401/403 from Deepgram → `SpeechConfigError` ("key was rejected"); 429 → `SpeechRequestError(429)`; other non-OK → 502 with the first 200 chars of the body.
- Response parsing takes `results.channels[0].alternatives[0]`:
  - `words[]` → `TranscriptWord[]` via `toTranscriptWords` (drops words without numeric `start`/`end`; `punctuated_word` falls back to `word`; missing confidence → 0).
  - `confidence` → alternative confidence.
  - `durationSec` → `metadata.duration`.
  - `model` → the name we asked for (Deepgram's `metadata.models` is an internal UUID).

No SDK is used — a plain `fetch`, so there is nothing to upgrade and the request is fully visible.

## A8. Turning words into pauses, fillers and delivery stats

[src/lib/speech/transcript.ts](../src/lib/speech/transcript.ts) — pure functions, unit-tested in `transcript.test.ts`.

**Pauses — `computePauses(words)`**
Gap = `next.start − current.end`. Gaps < 0.75 s are normal rhythm and ignored; overlapping timings (negative gap, crosstalk) are ignored. Tiers: `short` (≥ 0.75 s), `medium` (≥ 1.5 s), `long` (≥ 3 s). Each pause records the word index it follows.

**Disfluencies** — the fixed set Deepgram emits with `filler_words=true`: `um umm uh uhh er erm ah ahh eh hmm hm mhm mm huh`. `isDisfluency(token)` is the shared test used by the evaluator too.

**Crutch phrases** — `you know`, `I mean`, `sort of`, `kind of`, `like`, `basically`, `literally`, `actually`. Counted as *possible* crutches only ("I like Go" is not a filler). They never enter a score; they surface as a coaching tip when a phrase appears 5+ times.

**Transcripts**
- `buildVerbatimTranscript(words)` — `punctuated` tokens joined by spaces.
- `buildAnnotatedTranscript(words)` — same, with `[pause 1.4s]` inserted after the word each pause follows.

**`summarizeDelivery(words, { audioDurationSec })` → `DeliveryStats`**

| Field | Formula |
|---|---|
| `durationSec` | `max(audioDurationSec, lastWord.end − firstWord.start)` |
| `speakingSec` | `durationSec − Σ pause durations` |
| `wordCount` | tokens − disfluencies |
| `tokenCount` | all tokens |
| `wordsPerMinute` | `wordCount / durationSec × 60` |
| `articulationRate` | `wordCount / speakingSec × 60` (pace while actually talking) |
| `disfluencies.total / perMinute / breakdown` | counts by word |
| `crutches` | phrase counts, sorted desc |
| `pauses.count / totalSec / longestSec / averageSec / byTier` | from `computePauses` |
| `silenceRatio` | `Σ pause durations / durationSec` (0–1) |

## A9. Saving the capture on the session

`PATCH /api/interviews/[id]` in [src/app/api/interviews/[id]/route.ts](../src/app/api/interviews/[id]/route.ts) accepts:

```ts
answer: {
  index, answer,             
  capture?:
    | { inputMode: 'typed' }
    | { inputMode: 'spoken',
        transcript: { verbatim, annotated },
        delivery: DeliveryStats,       // validated field-by-field with a strict Zod schema
        audioConfidence?: number|null }
}
```

Semantics of `capture`:

| Sent | Effect on `answers[i]` |
|---|---|
| omitted | text updated; existing `transcript / delivery / audioConfidence / inputMode` kept (a text edit after speaking must not discard the delivery stats) |
| `{ inputMode: 'typed' }` | `inputMode = 'typed'`; transcript/delivery/audioConfidence `$unset` |
| `{ inputMode: 'spoken', … }` | all four fields set |
| coding question | `inputMode = 'coding'` regardless (also set by `run-code`) |

Stored shape ([src/models/InterviewSession.ts](../src/models/InterviewSession.ts), `IInterviewAnswer`):

```ts
{ index, answer, updatedAt, testsPassed?, testsTotal?,
  transcript?: { verbatim, annotated }, delivery?: DeliveryStats,
  audioConfidence?: number, inputMode?: 'typed'|'spoken'|'coding',
  evaluation?: QuestionEvaluation }
```

## A10. What is never stored

- **Audio.** The blob goes browser → route → Deepgram and is discarded. Only words, timings and derived stats persist.
- **The Web Speech preview.** Overwritten by the Deepgram transcript.
- **Pause markers inside `answer`.** They live only in `transcript.annotated`.

Where speech data is consumed later: `delivery` + `audioConfidence` + `inputMode` → delivery score (B8); `answer` (verbatim) → `cleanTranscriptForGrading` → content grading (B6 step 3).

---

# Part B — Evaluation: from saved answers to a score

The design rationale is in [EVALUATION_PLAN.md](./EVALUATION_PLAN.md). This part describes what the code does.

## B1. The four ideas everything rests on

1. **The answer key is written when the question is created**, not at grading time. Each question stores `keyPoints`, `redFlags`, `idealAnswerSummary` and per-type extras. Grading becomes "which of these points did the candidate cover?" — the same standard every run.
2. **Three tiers of evidence, trust in that order.** Tier 1 = ground truth (coding tests re-run on the final code). Tier 2 = measured (delivery stats, word counts, I/we ratio, numbers present). Tier 3 = judged (Gemini). A judged number can never override a measured or ground-truth one — that is enforced with caps.
3. **The LLM observes; code scores.** Gemini never returns a number out of 100. It returns observations — *key point 3 was hit, here is the quote* — and every quote is verified to exist in the answer. Weights, formulas, caps and rounding are pure TypeScript.
4. **Content and delivery are two scores.** Content = what was said (gates learning-path progress). Delivery = how it was said (coaching only; `null` for typed answers).

## B2. Lifecycle of one interview

```
generate-questions  ─▶ questions[] stored WITH answer keys + rubric        (B4)
        │              GET /api/interviews/[id] strips the keys while open  (B5)
answering           ─▶ PATCH saves answer text + spoken capture            (A9)
Finish              ─▶ PATCH { status:'completed' }
                       sets evaluationStatus:'pending', evaluation:null
                       (no scoring, no path advance here any more)
results page loads  ─▶ sees pending → POST /api/interviews/[id]/evaluate
                       route claims the run (status:'running'), returns 202,
                       schedules runEvaluationForSession() with Next's after()
                    ─▶ page polls GET every 2 s until 'ready' | 'failed'
runEvaluationForSession
                    ─▶ evaluateSession(): the pipeline (B6)
                       each question's result persisted as soon as it is final
                    ─▶ session.evaluation written, status 'ready'
                    ─▶ if pathEligible: advancePathProgressForInterview(contentScore)
results page        ─▶ renders two rings, topics, strengths/gaps, per-question detail
```

Files: [evaluate/route.ts](../src/app/api/interviews/[id]/evaluate/route.ts) (the HTTP surface), [run-evaluation.ts](../src/lib/evaluation/run-evaluation.ts) (DB in/out + path advance), [evaluate-session.ts](../src/lib/evaluation/evaluate-session.ts) (the pipeline, no DB — the judge is injected so it is unit-testable), [InterviewResultsPage.tsx](../src/components/app/interview/InterviewResultsPage.tsx) (UI + polling).

Express analogy: `/evaluate` is a controller that enqueues a job and returns 202; `after()` is the job runner; the results page is the client polling the job status.

## B3. Data model

All in [src/models/InterviewSession.ts](../src/models/InterviewSession.ts); TypeScript types in [src/lib/evaluation/types.ts](../src/lib/evaluation/types.ts).

**On each question** (`questions[]`):

```ts
rubric: 'technical'|'coding'|'behavioral'|'system_design'|'hr'
keyPoints: [{ text, dimension? }]      // 3–8; dimension only for system_design
redFlags: string[]                     // ≤ 6
idealAnswerSummary?: string
competency?: string                    // behavioral
expectedComplexity?: { time, space }   // coding
edgeCases?: string[]                   // coding
scaleHints?: string[]                  // system_design
```

**On each answer** (`answers[].evaluation`, type `QuestionEvaluation`):

```ts
rubric, contentScore: number|null, deliveryScore: number|null,
scores: { [dimension]: 0..100 }, levels: { [dimension]: 0..4 },
keyPointsHit / keyPointsPartial / keyPointsMissed: number[],   // indexes into keyPoints
factualErrors: [{ severity:'minor'|'major', claim }],
tests?: { publicPassed, publicTotal, hiddenPassed, hiddenTotal, failedToRun?, failedHiddenIndexes? },
capsApplied: ('red_flag'|'tests'|'no_run'|'hypothetical'|'unverified_code')[],
rationale, tips: string[], flags: EvaluationFlag[],
answerHash, model?, promptVersion, evaluatedAt, aiGraded: boolean
```

(`factualErrors`, not `errors`: Mongoose reserves `errors` on documents.)

**On the session:**

```ts
evaluationStatus: 'none'|'pending'|'running'|'ready'|'failed'
evaluationStartedAt, evaluationError
evaluation: { contentScore, deliveryScore, byTopic, byRubric, answeredCount, gradedCount,
              ungradableCount, pathEligible, strengths, gaps, nextTopics, completedAt }
```

## B4. The answer key is generated with the question

[src/lib/gemini/generate-questions.ts](../src/lib/gemini/generate-questions.ts)

- Both prompts (spoken and coding) require the key fields in each JSON object and explain what each field means per rubric (technical = facts/steps; behavioral = competency signals + `competency`; HR = what a good answer includes; system design = points tagged `requirements|components|scale|tradeoffs` + `scaleHints`; coding = `expectedComplexity`, `edgeCases`, approach notes).
- The spoken prompt also asks the model for a `rubric` hint; `routeRubric()` ([route-rubric.ts](../src/lib/evaluation/route-rubric.ts)) accepts `system_design` only when the session's selected kinds include it, otherwise falls back to the type rules (`coding` kind → coding; `behavioral`/`hr` type → those; else technical).
- [parse-gemini-json.ts](../src/lib/interview-questions/parse-gemini-json.ts) accepts the key in any shape the model produces (`.catch(undefined)` on each field) — a malformed key never fails the batch.
- [answer-keys.ts](../src/lib/interview-questions/answer-keys.ts) `normalizeAnswerKey()` coerces and trims: text from strings or object fields (`text|point|description|…`), 3–8 points padded from `genericKeyPoints(rubric, topic)`, ≤ 6 red flags (generic ones if none), `expectedComplexity` reduced to the bare `O(…)` (≤ 40 chars) from a string or object, system-design points tagged by keyword when the model forgot the dimension.
- The no-API template banks carry static keys: [coding-templates.ts](../src/lib/interview-questions/coding-templates.ts) (a table per `functionName`), [system-design-templates.ts](../src/lib/interview-questions/system-design-templates.ts) (key points parsed from each template's "### Discuss" list, plus guaranteed requirements/scale/tradeoffs points), [templates.ts](../src/lib/interview-questions/templates.ts) (generic keys).
- [validate.ts](../src/lib/interview-questions/validate.ts) warns (never errors) when a question lacks a key.

Questions created before this existed have no key; see `no_answer_key` in B13.

## B5. Keeping the answer key off the client

[src/lib/evaluation/redact.ts](../src/lib/evaluation/redact.ts) — `redactSessionForClient(doc)` deletes `keyPoints, redFlags, idealAnswerSummary, competency, expectedComplexity, edgeCases, scaleHints, hiddenTests` from every question **unless `status === 'completed'`**. Applied in `GET`/`PATCH /api/interviews/[id]`, `generate-questions`, and the `GET /api/interviews` list. After completion the results page needs the key text to show "You missed: …", so it is sent then. `run-code` reports hidden tests as pass/fail only, never their inputs.

## B6. The pipeline, step by step

[src/lib/evaluation/evaluate-session.ts](../src/lib/evaluation/evaluate-session.ts) `evaluateSession(input, { judge, onQuestionEvaluated })`

It loops over **`questions[]`, never `answers[]`** — an unanswered question has no `answers[]` entry, and looping over answers would silently skip it.

For each question:

**Step 0 — Route.** `rubric = routeRubric(question, session)`.

**Step 1 — Find the answer.** None (or blank) → `contentScore 0`, flag `unanswered`. Stop.

**Step 2 — Hash.** `answerHash(answer, rubric, question)` ([hash.ts](../src/lib/evaluation/hash.ts)) = SHA-256 of `PROMPT_VERSION + rubric + answer text + key point texts + red flags`. If the stored evaluation has the same hash **and** `aiGraded: true`, it is reused and nothing else runs for this question.

**Step 3 — Prepare the text.** Spoken answers go through `cleanTranscriptForGrading()` ([text-signals.ts](../src/lib/evaluation/text-signals.ts)): `[pause …]` markers and disfluencies removed, punctuation tidied, everything else as said. Typed answers are trimmed. (Fillers are penalised once, in delivery — never twice.)

**Step 4 — Delivery (Tier 2).** `evaluateDelivery()` — see B8. Result is `deliveryScore` or `null` + a flag. Independent of content.

**Step 5 — Gate (free).** [gates.ts](../src/lib/evaluation/gates.ts)

| Rubric | Minimum real words | Also |
|---|---|---|
| technical | 8 | gibberish, echo |
| behavioral | 15 | gibberish, echo |
| system_design | 15 | gibberish, echo |
| hr | 5 | gibberish, echo |
| coding | — | code differs from `starterCode` (whitespace-insensitive) and a function named `functionName` is declared/assigned |

- *Gibberish*: fewer than 60 % of tokens look like words (alphabetic, ≥ 2 letters, has a vowel; numbers count as words).
- *Echo*: > 70 % of the answer's content tokens (stop-words removed) also appear in the question **and** the answer is < 1.5× the question's length.
- Fail → `contentScore 0`, flag `too_short | gibberish | echoed_question | no_solution`. Stop. The gate is a junk filter; a short correct answer passes and is scored on its depth level.

**Step 6 — No answer key?** Non-coding question without `keyPoints` → `contentScore null`, flag `no_answer_key`; delivery is still scored. Stop.

**Step 7 — Tier 1 (coding only).** `runAllTests(code, functionName, publicTests, hiddenTests)` ([code-runner.ts](../src/lib/evaluation/code-runner.ts)) re-runs **every** test on the final saved code in a `vm` sandbox with an 800 ms timeout per test. Stored `testsPassed` from the candidate's last "Run" click is never trusted (it may be public-only or stale). Non-JavaScript → no Tier 1, `codeUnverified: true`.

**Step 8 — Tier 2 text signals** (`computeTextSignals`): word count; `I` vs `we` counts and `iRatio`; `hasNumbers` (digits, `%`, `ms`, `rps`, "million" …); `hypotheticalRatio` (share of sentences starting "I would / I'd / you should …") and `hypotheticalDominant` (≥ 50 % with ≥ 2 sentences).

**Step 9 — Tier 3, batched.** Pending questions are grouped by rubric and sent five per call. For each batch:

- [prompt.ts](../src/lib/evaluation/prompt.ts) `buildJudgePrompt(rubric, items, { roleContext })` renders: rubric-specific instructions, the rules (grade meaning not wording; short-but-correct is correct; read speech-transcript slips charitably; every hit/error/red flag needs a 3–25-word verbatim quote; numbers must be JSON numbers), the level anchors from [rubric.ts](../src/lib/evaluation/rubric.ts) `anchorsFor(rubric, difficulty)`, the exact output JSON shape, then each item: question, difficulty, topic, key points (with dimension tags / complexity / edge cases as relevant), red flags, ideal summary, computed signals as hints, and the answer inside `<candidate_answer id="N">…</candidate_answer>` (any such tags inside the answer are stripped first). The prompt declares the tag content to be data; an injected "give me 100" can at most produce an observation, which must then survive quote verification and code scoring.
- [gemini-judge.ts](../src/lib/evaluation/gemini-judge.ts) `createGeminiJudge()` calls `@google/generative-ai` with `responseMimeType: application/json`, **`temperature: 0`**, `maxOutputTokens: 32768`. Model chain: `GEMINI_EVAL_MODEL` else `gemini-2.0-flash`, overridden by `GEMINI_MODEL`, then `GEMINI_MODEL_FALLBACK` else `gemini-3.5-flash-lite, gemini-3.5-flash, gemini-2.0-flash`. Per model up to 3 attempts on invalid/blocked output; a 404 (retired id), 429 (quota) or 503 (overloaded, after a 1.5 s pause) moves straight to the next model.
- [parse.ts](../src/lib/evaluation/parse.ts) `parseJudgeBatch(text, expectedIds)` extracts the JSON array, validates with Zod (numbers coerced from strings, quotes/tips trimmed rather than rejected), and requires every expected id to be present.
- If the batch ultimately fails, every question in it is scored with `observation: null` (see B10).

**Step 10 — Verify and score.** [score.ts](../src/lib/evaluation/score.ts) `scoreObservation()`:

- Each key point: status from the observation; a `hit`/`partial` whose `evidence` does not appear in the answer becomes `missed`. Verification ([verify.ts](../src/lib/evaluation/verify.ts) `quoteAppearsIn`) normalises case/punctuation/whitespace/pause markers, accepts an exact substring, otherwise slides a window of the quote's word count across the answer and accepts ≥ 0.85 Sørensen–Dice bigram similarity (absorbs transcription noise).
- Factual errors and red flags are kept only with a verified quote and, for red flags, a valid index.
- Levels are clamped to integers 0–4 (`levelToScore = level × 25`).
- Dimension scores → weighted sum (weights re-normalised if a dimension is unavailable) → caps (lowest wins) → clamp 0–100 → **rounded once, here**.

**Step 11 — Persist.** `onQuestionEvaluated(index, evaluation)` writes `answers.$.evaluation` immediately, so a timeout loses at most one batch.

**Step 12 — Aggregate.** B9.

## B7. How each rubric is scored

Weights from `RUBRIC_WEIGHTS`, anchors from `anchorsFor()`, both in [rubric.ts](../src/lib/evaluation/rubric.ts).

**Technical** — correctness 35 %, coverage 30 %, depth 20 %, precision 15 %
- correctness = `max(0, 100 − 15 × minor − 40 × major)` over verified errors
- coverage = `(hits + 0.5 × partials) / keyPoints × 100`
- depth, precision = judge level × 25 (depth anchors differ per difficulty: for Medium, "explains the mechanism" is level 3)
- cap: any verified red flag → ≤ 40

**Coding** — tests 60 %, complexity 20 %, edge cases 10 %, readability 10 %
- tests = `publicRate × 40 + hiddenRate × 60` (a set that does not exist is dropped and the other takes 100 %); `failedToRun` → 0
- complexity = candidate's stated big-O vs `expectedComplexity.time`, by class distance: same or better 100, one class worse 75, two 40, otherwise/unparseable 15 ([coding-score.ts](../src/lib/evaluation/coding-score.ts) `complexityRank`: 1 → log → √n → n → n log n → n² → n³ → 2ⁿ → n!)
- edge cases = verified hits / listed edge cases × 100
- readability = level × 25
- caps: `testsScore + 15` (style adds at most 15 above what tests prove); code fails to load → ≤ 15; non-JS (`unverified_code`) → judged dimensions only, ≤ 60; red flag → ≤ 40
- AI unavailable → score is the tests dimension alone

**Behavioral** — situation+task 20 %, action 30 %, result 25 %, ownership 15 %, specificity 10 %
- The judge segments the answer into S/T/A/R quotes; an element whose quote is not in the answer is level 0.
- result level 4 requires a number in the result quote, else 3.
- ownership = `0.5 × ratioScore(iRatio) + 0.5 × level × 25` where ratioScore is 100 / 70 / 40 / 15 for iRatio ≥ 0.6 / 0.4 / 0.2 / below.
- caps: `hypotheticalDominant` (Tier 2) **and** judge `hypothetical: true` → ≤ 40, flag `hypothetical`; red flag → ≤ 40

**System design** — requirements 20 %, components 30 %, scale 30 %, trade-offs 20 %
- per dimension: `0.5 × coverage(points tagged with that dimension) + 0.5 × level × 25` (level only, if no points are tagged)
- code rules: Medium/Hard with no numbers in the answer → scale level ≤ 2; no verified alternative *with a reason* → trade-offs level ≤ 1
- cap: red flag → ≤ 40

**HR** — clarity 40 %, role alignment 35 %, professionalism 25 %
- the prompt includes `roleContext` ("Backend Engineer, FinTech"), resolved by `run-evaluation.ts` from the session's role/industry keys
- role alignment = `0.7 × level × 25 + 0.3 × coverage`
- cap: red flag → ≤ 40

Worked examples for every rubric are executable tests in [score.test.ts](../src/lib/evaluation/score.test.ts) (technical → 77, coding → 78 and the 35 cap, behavioral → 78, system design → 64).

## B8. Delivery score

[src/lib/evaluation/delivery-score.ts](../src/lib/evaluation/delivery-score.ts) — pure functions over the `DeliveryStats` saved in A9. No AI.

**Preconditions** (all must hold, else `deliveryScore: null` + flag):

| Condition | Flag if false |
|---|---|
| `inputMode === 'spoken'` and `delivery` present | — (typed answers simply have no delivery) |
| `audioConfidence ≥ 0.6` | `low_audio_confidence` |
| `durationSec ≥ 20` and `wordCount ≥ 30` | `delivery_too_short` |

**Bands** (lower bound inclusive, upper exclusive) and weights:

| Dimension (weight) | 100 | 75/85/80 | 50/65/55 | 25/40/30 | worst |
|---|---|---|---|---|---|
| Pace, wpm (25 %) | 120–160 | 100–119, 161–180 | 80–99, 181–200 | < 80, > 200 → 25 | |
| Fillers/min (30 %) | < 2 | 2–4 → 75 | 4–6 → 50 | 6–8 → 30 | ≥ 8 → 10 |
| Longest pause, s (25 %) | < 2 | 2–4 → 80 | 4–6 → 55 | 6–10 → 30 | ≥ 10 → 10 |
| Silence ratio (20 %) | < 0.15 | 0.15–0.25 → 85 | 0.25–0.35 → 65 | 0.35–0.50 → 40 | ≥ 0.5 → 20 |

`deliveryScore = pace × 0.25 + fillers × 0.30 + pauses × 0.25 + silence × 0.20`, rounded once. Example: 145 wpm, 5.3 fillers/min, 5.2 s pause, 0.34 silence → 25 + 15 + 13.75 + 13 = 66.75 → **67**.

**Tips** are fixed per band and quote the real number ("You paused 5.2s mid-answer…"); crutch phrases with ≥ 5 occurrences add a tip. Generated by code.

## B9. Session aggregation

[src/lib/evaluation/aggregate.ts](../src/lib/evaluation/aggregate.ts) `aggregateSession()`

- Difficulty weights: Easy 1.0, Medium 1.3, Hard 1.6 (from each question, so Adaptive sessions work).
- `contentScore = Σ(questionScore × weight) / Σ(weight)` over every question whose `contentScore` is a number — **unanswered and gated questions enter as 0 with full weight**. Questions with `contentScore: null` (no key, AI failed) are excluded and counted in `ungradableCount`.
- `deliveryScore` = plain average over answers where it is not null; null if none.
- `byTopic`, `byRubric` = the same weighted average per group.
- `strengths` = topics ≥ 80 and dimensions averaging ≥ 80 over ≥ 2 questions; `gaps` = topics < 60, dimensions < 60, and key points missed on ≥ 2 questions; `nextTopics` = gap topics ordered by `weight × (60 − score)`.
- `pathEligible = ungradableCount === 0 && contentScore !== null`.

Worked example (77 Medium, 78 Hard, 78 Easy, unanswered Hard) → content **55**, delivery **74** — in [aggregate.test.ts](../src/lib/evaluation/aggregate.test.ts).

## B10. Failure handling, retries and idempotency

| Situation | Behaviour |
|---|---|
| Judge output invalid / blocked (RECITATION, SAFETY) / truncated | retried on the same model (3 attempts), then the next model |
| Model rate-limited (429), overloaded (503), or retired (404) | next model in the chain |
| Whole chain fails for a batch | each question in it: non-coding → `contentScore null`; coding → tests-only score; flag `ai_grading_failed`, `aiGraded: false`; the reason is appended to `session.evaluationError` |
| Any question `ai_grading_failed` | session `pathEligible: false`; results page shows *"Partial — retry AI grading"* and hides dimension chips / missed lists for those questions |
| `POST /evaluate` while `running` (< 5 min old) | 202, no second run (claimed atomically with `findOneAndUpdate`) |
| `POST /evaluate` when `ready` | 200 no-op, unless body `{ force: true }` ("Retry AI grading") |
| Re-run | questions whose stored hash matches **and** `aiGraded` are reused untouched; failed or edited answers are re-graded; delivery is recomputed (free) |
| Exception in the runner | `evaluationStatus: 'failed'`, `evaluationError` set; results page shows a Retry button |
| Function timeout mid-run | already-persisted questions survive; a re-call resumes |

## B11. Consistency: temperature, prompt version, golden set

- `temperature: 0` on every judge call.
- `PROMPT_VERSION` ([hash.ts](../src/lib/evaluation/hash.ts)) is part of `answerHash` and stored on each evaluation — bump it when a prompt or scoring rule changes and old grades are re-done instead of reused.
- Golden set: [`__fixtures__/golden.json`](../src/lib/evaluation/__fixtures__/golden.json) — hand-written strong/average/weak answers per rubric with expected ranges.
- `npm run eval:calibrate` ([scripts/eval-calibrate.ts](../scripts/eval-calibrate.ts)) grades each three times against the real judge; fails if any lands outside its range or spreads more than 5 points. Needs `GEMINI_API_KEY`; not in CI.
- Everything after "the judge responded" is a pure function with unit tests: `npm run test:evaluation`.

## B12. Where the score is used afterwards

- **Learning paths** — `runEvaluationForSession` calls `advancePathProgressForInterview({ score: contentScore, questionsAnswered })` ([advance-on-complete.ts](../src/lib/learning-paths/advance-on-complete.ts)) only when `pathEligible`. That function writes `stageScores`, `topicStats`, gates unlock on `unlockMinScore`, queues remediation below 80, and awards XP. Previously it ran inside the completion PATCH with the answer-coverage percentage; that path is gone.
- **Analytics** — `GET /api/users/me/learning-analytics` reads `evaluation.contentScore` from the last 20 sessions with `evaluationStatus: 'ready'`; exposes `interviewContentScore` (renamed from `interviewConfidenceScore`) and `feedbackTrend`.
- **Results page** — two rings, stats, topic bars, strengths/gaps, practise-next, and per question: rubric, content/delivery chips, dimension chips, flags in plain language, missed/partly-covered key points, coaching tips, test counts.

## B13. Every flag and what the UI says

| Flag | Set when | Content effect | Results page text |
|---|---|---|---|
| `unanswered` | no `answers[]` entry | 0 | Not answered — counted as 0. |
| `too_short` | below the rubric minimum | 0 | Too short to grade — counted as 0. |
| `gibberish` | < 60 % word-like tokens | 0 | The answer did not look like real language — counted as 0. |
| `echoed_question` | echo rule | 0 | The answer mostly repeated the question — counted as 0. |
| `no_solution` | coding gate | 0 | No working solution was submitted — counted as 0. |
| `no_answer_key` | question predates keys | null | Created before scoring was enabled — content not gradable. |
| `ai_grading_failed` | judge chain failed | null (coding: tests only) | AI grading did not complete for this answer. Use "Retry AI grading". |
| `language_mismatch` | judge reports it | 0 | The answer was not in the interview language — counted as 0. |
| `unverified_code` | non-JS coding answer | ≤ 60 | Code could not be executed — score is an estimate, capped at 60. |
| `hypothetical` | behavioral, no real story | ≤ 40 | No specific past event was described — capped at 40. |
| `low_audio_confidence` | Deepgram confidence < 0.6 | delivery null | Audio quality was poor… delivery was not scored. |
| `delivery_too_short` | < 20 s or < 30 words | delivery null | The recording was too short to measure delivery. |

---

# Part C — Reference

## C1. File map

**Speech**

| File | Role |
|---|---|
| `src/hooks/useAudioRecorder.ts` | MediaRecorder capture → Blob |
| `src/hooks/useSpeechDictation.ts` | Web Speech live preview (never saved) |
| `src/components/app/interview/InterviewAnswerEditor.tsx` | mic UI, transcribe call, clips, capture |
| `src/lib/interview/answer-capture.ts` | `mergeClips` → `AnswerCapture` |
| `src/app/api/speech/transcribe/route.ts` | validation, Deepgram call, stats, response |
| `src/lib/speech/deepgram.ts` | the HTTP request to Deepgram |
| `src/lib/speech/transcript.ts` | pauses, fillers, transcripts, `summarizeDelivery` |
| `src/app/api/interviews/[id]/route.ts` | `PATCH` with `answer.capture` |

**Evaluation**

| File | Role |
|---|---|
| `src/lib/evaluation/types.ts` | all shared types |
| `src/lib/evaluation/route-rubric.ts` | question → rubric |
| `src/lib/evaluation/redact.ts` | strip answer keys from client responses |
| `src/lib/evaluation/gates.ts` | junk filters |
| `src/lib/evaluation/text-signals.ts` | Tier 2 text facts, transcript cleaning |
| `src/lib/evaluation/delivery-score.ts` | delivery bands, preconditions, clip merge, tips |
| `src/lib/evaluation/code-runner.ts` | sandboxed test runner (shared with `run-code`) |
| `src/lib/evaluation/coding-score.ts` | tests score, complexity classes, caps |
| `src/lib/evaluation/rubric.ts` | weights, level anchors, cap constants |
| `src/lib/evaluation/prompt.ts` | judge batch prompt |
| `src/lib/evaluation/parse.ts` | Zod schema for observations |
| `src/lib/evaluation/verify.ts` | quote verification |
| `src/lib/evaluation/score.ts` | observations → dimension scores → caps |
| `src/lib/evaluation/aggregate.ts` | session totals, strengths/gaps |
| `src/lib/evaluation/hash.ts` | `PROMPT_VERSION`, `answerHash` |
| `src/lib/evaluation/gemini-judge.ts` | Gemini client with fallback chain |
| `src/lib/evaluation/evaluate-session.ts` | the pipeline (pure) |
| `src/lib/evaluation/run-evaluation.ts` | load session → pipeline → persist → path advance |
| `src/app/api/interviews/[id]/evaluate/route.ts` | `POST` 202 + `after()` |
| `src/lib/gemini/model-fallback.ts` | error classification, default fallback chain |
| `src/lib/interview-questions/answer-keys.ts` | key normalisation + generic keys |
| `src/lib/gemini/generate-questions.ts` | prompts that produce keys |
| `src/components/app/interview/InterviewResultsPage.tsx` | results UI + polling |
| `scripts/eval-calibrate.ts`, `src/lib/evaluation/__fixtures__/golden.json` | calibration |

## C2. Environment variables

| Variable | Used by | Notes |
|---|---|---|
| `DEEPGRAM_API_KEY` | speech | required for spoken answers; without it the editor falls back to the live preview text |
| `DEEPGRAM_MODEL` | speech | default `nova-3` |
| `DEEPGRAM_LANGUAGE` | speech | default `en` |
| `GEMINI_API_KEY` | generation, judge | required |
| `GEMINI_MODEL` | generation, judge | primary model (currently `gemini-2.5-flash` in `.env.local`) |
| `GEMINI_MODEL_FALLBACK` | generation, judge | comma-separated; default `gemini-3.5-flash-lite,gemini-3.5-flash,gemini-2.0-flash` |
| `GEMINI_EVAL_MODEL` | judge only | overrides the judge's default primary when `GEMINI_MODEL` is unset |

## C3. Debugging: what the log lines mean

Dev server log: `.next/dev/logs/next-development.log`.

| Line | Meaning | Action |
|---|---|---|
| `[generate-questions] … blocked due to RECITATION` | Gemini's anti-copy filter discarded the output | retried automatically; retry if it still fails |
| `… 503 … high demand` | primary model overloaded | falls to the next model after 1.5 s |
| `… 404 … no longer available` | a model id in the chain is retired | skipped automatically; update `GEMINI_MODEL(_FALLBACK)` |
| `[generate-questions] ZodError … expectedComplexity` | (fixed) model wrote a long complexity string | now normalised to `O(…)` |
| `Question type "technical" is not in the selected interview types` | (fixed) validator compared kinds to types | now maps kinds → types |
| `[evaluate] model "x" attempt n: Judge output failed validation: …` | observation JSON did not match the schema | retried; numbers are now coerced |
| `[evaluate] judge failed "<rubric>" "<error>"` | the whole chain failed for one batch | questions flagged `ai_grading_failed`; use "Retry AI grading" |
| `[speech] not configured` | `DEEPGRAM_API_KEY` missing/rejected | 501 to the client; set the key |

Quick checks: `npx tsc --noEmit`, `npm run test:evaluation`, `npm run eval:calibrate` (costs API calls).

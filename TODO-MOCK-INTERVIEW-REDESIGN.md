# TODO - AI Mock Interview Redesign

## 1) Gather current implementation
- [x] Inspect `src/app/mock-interview/page.tsx` (current UX)
- [x] Inspect `src/app/api/mock-interview/route.ts` (current backend)
- [x] Inspect `src/services/ai/mockInterview.ts` (current AI prompt)
- [x] Inspect `prisma/schema.prisma` to confirm existing models (UserProgress, Question, etc.)

## 2) Decide new UX + flow (Theory / Real World / Coding)
- [x] Define new session flow + UI requirements (answer input, eval, next/end, progress, summary)
- [x] Frontend-only stats for now: questions attempted / correct / wrong / total score

## 3) Update AI prompting & response schema
- [ ] Update `src/services/ai/mockInterview.ts` to return strict JSON for:
  - question generation (short UI-ready)
  - evaluation for Theory / Real World / Coding

## 4) Backend implementation
- [ ] Update `src/app/api/mock-interview/route.ts` to handle:
  - generate question
  - evaluate submitted answer

## 5) Frontend implementation (REWRITE)
- [ ] Rewrite `src/app/mock-interview/page.tsx`:
  - Start screen
  - Progress bar + “Question X of Y”
  - Theory answer textarea + character counter
  - Real World approach textarea
  - Coding: code snippet + expected-output input
  - Submit / Skip / Next / End Interview
  - Interview Summary Card

## 6) Testing
- [ ] Manual QA: Theory / Real World / Coding; submit/skip/next/end; progress + summary
- [ ] Ensure UI never shows huge markdown; keep concise sections


# DysTest — Web Application

This is the Next.js 15 frontend for **DysTest**, the gamified dyslexia screening platform.

## Overview

The web app delivers 33 interactive cognitive game questions to children aged 7–17. It collects behavioral metrics silently during play and submits them to the `ml-service` for age-group-specific risk assessment.

### Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing Card — quick intro explaining what the screening is & what it measures |
| `/instructions` | Assessment Guidelines — setup steps, audio check, and parent tips |
| `/gamified-test` | Participant Config — age group, gender, and layout theme preferences |
| `/gamified-test/test/[sessionId]` | Active Screening — 33 interactive cognitive tasks (automatic audio playbacks) |
| `/gamified-test/result/[sessionId]` | Result Verdict — estimated dyslexia risk, model probability, & metrics |
| `/gamified-test/result/[sessionId]/details` | Technical Breakdown — question-by-question reaction & accuracy logs |

### Test Flow

1. User reads the screening card and clicks **Next: Assessment Steps** to view prep guidelines.
2. Demographics are captured via `/gamified-test`, starting a client-side session inside `sessionStorage`.
3. Question list generated dynamically matching target age models: G1 (7–8), G2 (9–11), or G3 (12–17).
4. The 33 gamified tasks play spoken instructions automatically in the background (no interaction blocked).
5. Responses, mouse/touch clicks, and reaction times are tracked and posted to `/api/gamified-test/finish-client`.
6. Client-side data is sent to the `ml-service` to estimate risk using calibrated Random Forest models.
7. Risk estimates, thresholds, and deep-dive question diagnostics are rendered instantly on completion.

---

## Setup

### Requirements
- Node.js 18+
- `npm` or `pnpm`

### Installation

```bash
npm install
```

### Environment

```bash
cp .env.example .env.local
```

The only required variable is `ML_SERVICE_URL` pointing to the running `ml-service`.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Design System

- **Colors**: Sleek emerald-700 green (`bg-emerald-700` / `#047857`) primary, with dark/slate accents.
- **Background**: Beautiful glassmorphic white cards over clean off-white backgrounds with soft radial gradients.
- **Themes**:
  - ☀️ **Clean Light**: Highly optimized, crisp layout. Features zero-scroll form card, quick feedback, and automatic speech synthesis instructions.
  - 🎮 **Gamified (Dark)**: Full-bleed gameplay aesthetic with ambient looping soundtrack, starfields, and dynamic responses.
- **Animations**: Framer Motion for premium card slide-ins and responsive hover feedback.

---

## ML Service Integration

The frontend calls the `ml-service` through a Next.js API route at `/api/gamified-test/predict`, which proxies to `ML_SERVICE_URL/v1/gamified/predict`. This keeps the backend URL server-side only.

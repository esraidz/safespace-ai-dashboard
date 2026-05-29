# SafeSpace AI Dashboard

SafeSpace is a hackathon MVP for detecting early social media risk signals such as hate speech, toxic language, targeted harassment, dehumanizing rhetoric and potential crisis patterns.

The project combines a dataset-driven risk analysis dashboard with an LLM-assisted action plan generator for NGOs, moderation teams and public-interest organizations.

## Why It Matters

Social media crises can escalate quickly. A person, brand or community can become the target of repeated hostile messages before human teams notice the pattern. SafeSpace helps make these signals visible earlier by turning noisy social media data into an interpretable risk dashboard.

The system is designed as a decision-support tool. It does not diagnose people, does not automatically punish users and does not replace human review. It highlights risk patterns, evidence posts and recommended next steps.

## Key Features

- User-level risk analysis for individual social media profiles
- Collective dataset overview across all monitored users
- Risk score and Low / Medium / High severity labels
- Evidence tweet feed with highlighted trigger words
- Target group insights for communities being attacked or dehumanized
- Time-window analysis for the last week, month and year
- PDF export for findings and stakeholder reporting
- LLM-generated action plan with a safe fallback mode
- Admin-style dashboard UI built for fast review during crisis monitoring

## Technical Approach

SafeSpace uses a hybrid architecture:

```text
Demo social media dataset
↓
Risk signal extraction and scoring
↓
User-level and collective analysis
↓
Evidence tweets + target group findings
↓
LLM-assisted action plan
↓
NGO / moderation / public-sector decision support
```

The dashboard currently works with a 10K tweet / 20 user demo dataset. The LLM layer can call Groq when a local API key is available, and falls back to predefined action plans when no key is configured.

## Tech Stack

- React
- TypeScript
- Vite
- CSS dashboard design
- Groq LLM API integration
- JSON demo dataset
- Python / scikit-learn prototype artifacts from the hackathon exploration phase

## Demo Flow

1. Open the admin panel.
2. Select the collective overview or a demo user.
3. Review risk score, target groups, time-based findings and evidence tweets.
4. Generate an LLM action plan.
5. Export the findings as a PDF report.

## Run Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Optional LLM Setup

Create a local environment file:

```bash
cp .env.example .env.local
```

Then add your own Groq API key:

```text
VITE_GROQ_API_KEY=your_key_here
```

`.env.local` is ignored by Git and should never be committed.

## Hackathon Context

This repository contains a cleaned and documented portfolio version of SafeSpace, originally built as a team hackathon MVP. The focus was to deliver a working prototype under time pressure while demonstrating technical architecture, social impact, user experience and AI-assisted decision support.


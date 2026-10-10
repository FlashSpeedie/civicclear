# CivicClear AI

**Official instructions are complicated enough. Understanding what to do next should not be.**

CivicClear AI helps students, families, and everyday people understand confusing school instructions, scholarship applications, financial-aid requirements, official letters, and public-service forms.

## What it does

CivicClear takes a complicated document and helps you answer the questions that actually matter:

- What is this document telling me?
- Does it appear to apply to my situation?
- What do I need to do?
- What documents or information do I need?
- Is there a deadline? How certain are we about it?
- What should I do first?
- What is missing or unclear?
- What should I ask the school, scholarship office, or organization?
- Where, exactly, does the document support each important answer?

This is not primarily a chatbot. It is a **document-understanding and action-planning tool**. The document and its evidence remain at the center of the interface.

## Features

- **Paste text or upload PDF** — Extract text from text-based PDFs (up to 40 pages, 12MB) locally in your browser
- **Review before analysis** — Edit extracted text, fix errors, redact sensitive details
- **Privacy checkpoint** — Explicit consent before sending text to Google Gemini; local scan flags common sensitive patterns
- **Source-grounded analysis** — Every claim cites specific document sections with verifiable quotes
- **Actionable results** — Plain-English summary, prioritized checklist, deadlines with normalized dates, required documents, term definitions, questions to ask, and a draft message you can send
- **Evidence viewer** — Click any claim to see the exact source text and page number
- **Uncertainty handling** — Identifies gaps, ambiguities, and conflicts; suggests specific questions to resolve them
- **Sample walkthrough** — Try the full experience with a fictional scholarship document (no API key needed)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Validation**: Zod v4
- **PDF Extraction**: pdfjs-dist (client-side)
- **AI Provider**: Google Gemini via the official `@google/genai` SDK (all calls server-side)
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel-compatible

## Getting Started

### Prerequisites

- Node.js 20+ (required by the `@google/genai` SDK)
- npm

### Installation

```bash
cd civicclear
npm install
```

### Configuration

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required for AI analysis
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Get your Gemini API key:**

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with a Google account
3. Create an API key
4. Add it to `.env.local` as `GEMINI_API_KEY`

Only one secret is required. The model selection is built into the application (see below) - you do not need to configure individual model variables.

#### Model priority and fallback

CivicClear tries Gemini models in a fixed priority order, strongest first. Each model is attempted at most once per analysis request, and the app moves down the list only for transient or model-specific failures (a model being unavailable, a per-model rate limit, a temporary server error, or a retryable timeout/network failure). Authentication errors, permission errors, and invalid requests stop immediately without trying other models.

The configured order is:

1. `gemini-3.1-pro-preview` (highest reasoning)
2. `gemini-3.8-flash` (stable primary fallback)
3. `gemini-3.6-flash` (additional stable fallback)
4. `gemini-3.5-flash-lite` (efficiency fallback)
5. `gemini-3.1-flash-lite` (final listed fallback)

This order is defined in `src/lib/ai/gemini.ts` as `GEMINI_MODEL_PRIORITY`. If every model fails, the request returns a clear error and nothing is silently faked.

### Running Locally

```bash
npm run dev
```

Open http://localhost:3000

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run typecheck

# Linting
npm run lint

# Production build
npm run build
```

## How It Works

### Document Input

1. **Paste text** — Direct input for emails, letters, copied text
2. **Upload PDF** — Client-side text extraction using PDF.js (text-based PDFs only; no OCR for scanned documents)

### Source Review

Extracted text is split into blocks (pages for PDFs, paragraphs for pasted text). You can edit any block to fix extraction errors or redact sensitive information.

### Privacy Checkpoint

Before analysis, you must explicitly consent. A local scan flags:
- Email addresses
- Phone numbers
- SSN-like patterns (XXX-XX-XXXX)
- Long digit sequences (possible card numbers)
- API key / secret patterns

**This scan is not exhaustive.** It's a convenience warning only.

### AI Analysis

After you confirm the privacy checkpoint, your reviewed text + optional context (role, question, reference date) is sent from the server to Google Gemini, which returns a structured JSON response validated against a Zod schema.

The system prompt enforces:
- Ground every claim in source text with verbatim quotes
- Never invent deadlines, requirements, fees, names, contacts, or eligibility conclusions
- Preserve conditions ("if applicable," "only if," etc.)
- Distinguish required/optional/conditional/unclear
- Handle dates conservatively (no invented years, no calculated dates without reference)
- Mark uncertainties explicitly

### Evidence Verification

Every model-generated citation is verified server-side:
1. Block ID must exist in submitted source
2. Quote must be present in that exact block (normalized for whitespace/unicode)
3. Original source label and page number attached
4. Unverified evidence is marked and exposed in UI

## What Works Without Credentials

- Landing page and sample walkthrough
- Document input (paste text, upload PDF)
- Text extraction and source review
- Privacy scan and redaction
- All UI components and interactions

**Only the live AI analysis requires Gemini credentials.** Everything else - the sample walkthrough (which uses pre-written analysis shown for a fictional document), PDF extraction, text review, and the local privacy scan - works without an API key.

## Supported PDFs

- **Text-based PDFs** (selectable text) — fully supported
- **Scanned/image-only PDFs** — not supported (no OCR in v1)
- **Encrypted/password-protected PDFs** — not supported
- **Limits**: 40 pages max, 12MB max, 100,000 characters max extracted text

## Data Privacy

- Document text stays in browser memory until you explicitly analyze
- PDF extraction happens entirely in your browser
- API key never leaves the server
- No database — documents not stored by this app
- No localStorage persistence by default
- No document content in logs, URLs, analytics, or error reports

**Important**: When you confirm analysis, your reviewed document text is sent to Google's Gemini service, which processes it under Google's own terms. This app's lack of storage does not guarantee zero retention by the provider. Do not analyze documents you are not comfortable sharing.

## Limitations

- Does not make official eligibility determinations
- Does not replace an advisor, counselor, or official source
- Does not guarantee application acceptance
- Does not provide legal advice
- Relative deadlines ("within 14 days") cannot be converted to calendar dates without a reference date
- Scanned PDFs require OCR (not included)
- Evidence verification catches fabricated quotes but not paraphrased misrepresentations
- Local privacy scan is not comprehensive PII detection

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in the Vercel dashboard (server-side environment, not client-exposed):
   - `GEMINI_API_KEY` (required for AI analysis)
   - `NEXT_PUBLIC_APP_URL` (optional, your production URL)

The API key must only ever be configured as a server-side environment variable. Never commit `.env.local` or paste the key into source code.

### Other Platforms

Any platform supporting Next.js 16:
- Set `GEMINI_API_KEY` in the host's server-side environment settings
- Ensure Node.js 20+ runtime (required by `@google/genai`)
- Configure appropriate request timeout (60s recommended for AI calls)

## Project Structure

```
src/
├── app/
│   ├── api/analyze/route.ts      # Analysis API endpoint
│   ├── sample/page.tsx           # Sample walkthrough page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main application
│   └── globals.css               # Design system & styles
├── components/
│   ├── ui/                       # Reusable UI primitives
│   ├── AppShell.tsx              # Layout, navigation, shared components
│   ├── DocumentInput.tsx         # Input, review, privacy, context steps
│   ├── AnalysisWorkspace.tsx     # Results sections
│   └── SampleWalkthrough.tsx     # Fictional example experience
├── lib/
│   ├── ai/gemini.ts              # Gemini client, model priority, fallback
│   ├── analysis/
│   │   ├── schema.ts             # Zod schemas
│   │   ├── validate-evidence.ts  # Citation verification
│   │   └── normalize-dates.ts    # Date parsing
│   ├── documents/pdf-extraction.ts # PDF.js extraction
│   ├── privacy/local-scan.ts     # Local PII detection
│   ├── sample/                   # Fictional sample data
│   └── utils.ts                  # Helpers
├── types/index.ts                # TypeScript types
└── tests/                        # Unit & integration tests
```

## License

MIT
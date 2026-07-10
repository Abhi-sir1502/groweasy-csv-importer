# GrowEasy CSV Importer

An AI-powered CSV importer that intelligently extracts CRM lead data from **any** CSV format — Facebook Lead Exports, Google Ads exports, real estate CRM exports, manually created spreadsheets, or anything else — without assuming fixed column names.

Built for the GrowEasy Software Developer assignment.

---

## Live Demo

Hosted App: https://groweasy-csv-importer-psi.vercel.app
Backend API: https://groweasy-backend-yd43.onrender.com
GitHub Repo: https://github.com/Abhi-sir1502/groweasy-csv-importer

---

## Overview

The core challenge isn't parsing a CSV — it's handling CSVs with **wildly different column names and layouts** and still mapping them correctly into GrowEasy's CRM schema. This project solves that with an AI-driven field-mapping pipeline that:

- Works with messy, inconsistent, or ambiguous column headers
- Batches rows before sending them to the LLM (for performance and reliability)
- Retries failed batches automatically, with backoff on rate limits
- Validates the AI's output against the CRM schema before returning it (never trusts the model blindly)
- Clearly reports which rows were imported vs. skipped, and why

## Features

**Frontend**
- Drag & drop + click-to-browse CSV upload
- Instant client-side CSV preview (no AI call until confirmed) with a virtualized, sticky-header table that stays smooth even with thousands of rows
- Real-time AI processing progress bar (batch-by-batch, via Server-Sent Events)
- Results screen with separate "Imported" and "Skipped" tabs (skipped rows show the reason and original data)
- Dark mode with persisted preference
- Fully responsive layout

**Backend**
- REST API built on Express, with a clean route → service → utils structure
- CSV rows are batched and sent to the LLM in parallel-safe chunks
- Automatic retry with backoff for failed/rate-limited batches
- Backend-side validation layer that sanitizes AI output (e.g. discards an invalid `crm_status` rather than trusting the model)
- Server-Sent Events endpoint for real-time progress streaming
- Unit tests for core utilities and validation logic

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| AI | Groq (`llama-3.3-70b-versatile`) |
| CSV Parsing | PapaParse |
| Table Virtualization | react-window |
| Testing | Node.js built-in test runner (`node:test`) |

## Project Structure

```
groweasy-project/
├── frontend/                 # Next.js app
│   ├── app/                  # Pages (App Router)
│   ├── components/           # UI components
│   └── package.json
│
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.js         # Entry point
│   │   ├── routes/           # API routes
│   │   ├── services/         # LLM integration
│   │   ├── utils/            # Pure helper functions (validators, CSV utils)
│   │   └── constants/        # CRM field constants
│   ├── tests/                # Unit tests
│   └── package.json
│
└── README.md
```

## How the AI Field Mapping Works

1. The frontend parses the CSV client-side (PapaParse) and shows a preview — **no AI call happens yet**.
2. On confirm, the raw rows (as JSON, using their *original* column names) are sent to the backend.
3. The backend splits rows into batches (20 rows/batch) and sends each batch to Groq with a prompt that:
   - Defines the exact CRM schema and required output shape
   - Lists the allowed `crm_status` and `data_source` values, instructing the model to leave the field blank rather than guess
   - Explains the "skip if no email AND no mobile" rule with explicit examples (this turned out to be a common ambiguity point during testing)
   - Explains how to handle multiple emails/phone numbers per row (first one wins, rest go into `crm_note`)
4. The backend re-validates every field the AI returns (`crm_status`, `data_source`) against the allowed lists — if the AI ever returns something invalid, the backend silently corrects it rather than passing bad data downstream.
5. Failed or rate-limited batches are retried automatically with a backoff delay.
6. Progress is streamed back to the frontend batch-by-batch via Server-Sent Events, and the final result includes both the successfully imported records and a list of skipped rows with reasons.

## Local Setup

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Groq key:
```
PORT=8000
GROQ_API_KEY=your_groq_api_key_here
```

Run the tests (optional but recommended):
```bash
npm test
```

Start the server:
```bash
npm run dev
```
Backend runs on `http://localhost:8000`.

### 2. Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

Both servers need to be running at the same time for the app to work.

## API Reference

### `POST /api/extract`
Accepts parsed CSV data, returns AI-extracted CRM records synchronously.

**Request body:**
```json
{
  "headers": ["Full Name", "Email", "Phone"],
  "rows": [["John Doe", "john@example.com", "9876543210"]]
}
```

**Response:**
```json
{
  "total_rows": 1,
  "total_imported": 1,
  "total_skipped": 0,
  "records": [ { "name": "John Doe", "email": "john@example.com", "...": "..." } ],
  "skipped": []
}
```

### `POST /api/extract-stream`
Same input, but streams progress via Server-Sent Events (`start`, `progress`, `complete` events) before returning the final result. Used by the frontend for the live progress bar.

### `GET /api/health`
Simple health check.

## Known Limitations

- The backend is stateless — no database, as permitted by the assignment.
- Groq's free tier has a per-minute token limit; very large CSVs (500+ rows) may take longer to process due to the built-in rate-limit backoff, but will complete successfully rather than failing outright.

## Submission

**Position applied for:** _Software Developer Intern_

# sheet-to-kanban — Product Specs

> Personal Kanban dashboard powered by Google Sheets + Claude AI.
> Solo-developer tool for managing, evaluating, and planning project ideas.

---

## Overview

**sheet-to-kanban** is a single-page application that turns a Google Sheet into an interactive Kanban board with integrated AI capabilities. It's designed as a personal tool for a solo developer who maintains a spreadsheet of dozens of project ideas (portfolio pieces and potential SaaS products) and needs a better way to visualize, prioritize, and evaluate them.

### Problem

A flat spreadsheet of ideas works for storage but fails at:

- Visualizing status at a glance (what's in backlog vs. in progress?)
- Quickly reprioritizing by dragging instead of editing cells
- Evaluating viability without context-switching to a separate AI chat
- Generating structured prompts for deeper planning sessions

### Solution

A lightweight React SPA that reads from Google Sheets, renders a Kanban board with drag-and-drop that writes back to the sheet, and includes an embedded Claude chat panel for per-idea evaluation.

---

## User

Single user: the developer who owns the sheet. No auth system, no multi-user, no accounts. API keys stored in the browser's local persistent storage.

---

## Data Model

### Source: Google Sheets

The sheet acts as the single source of truth. The app reads and writes to it via API.

| Column | Type | Description |
|---|---|---|
| `priority` | Integer | Numeric priority (1 = highest). Determines card sort order within columns. |
| `name` | String | Project/idea name. Primary display text on each card. |
| `status` | String | Determines Kanban column placement. Values: `backlog`, `to do`, `in progress`, `done`. Custom values auto-generate new columns. |
| `observation` | String | Free-text notes. Displayed as secondary text on cards. |
| `tags` | String | Comma-separated list (e.g. `productivity, saas, ai`). Used for filtering and displayed as pills on cards. |
| `can be saas` | String | `yes` / `no` / empty. Filterable. Displayed as a green badge when `yes`. |

### Local State

- **Settings**: Google API Key, Sheet ID, Sheet tab name, Apps Script URL, Claude API Key. Persisted in browser storage.
- **Chat history**: Per-idea conversation history with Claude. Persisted in browser storage (v2).
- **Filter state**: Active filters (priority, tag, SaaS, search query). Session-only, not persisted.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser (SPA)                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Kanban   │  │ Filters  │  │   Settings   │  │
│  │  Board    │  │   Bar    │  │    Modal     │  │
│  └────┬─────┘  └──────────┘  └──────────────┘  │
│       │                                         │
│  ┌────┴─────┐  ┌──────────────────────────────┐ │
│  │  Drag &  │  │      Chat Panel (Claude)     │ │
│  │  Drop    │  │   + Prompt Builder Modal     │ │
│  └────┬─────┘  └─────────────┬────────────────┘ │
│       │                      │                  │
└───────┼──────────────────────┼──────────────────┘
        │                      │
   ┌────▼────┐           ┌─────▼──────┐
   │ Google  │           │  Anthropic │
   │ Sheets  │           │  Messages  │
   │  API    │           │    API     │
   └────┬────┘           └────────────┘
        │
   ┌────▼────────┐
   │ Apps Script │
   │  (writes)   │
   └─────────────┘
```

### Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Framework | React 18 + Vite | Fastest setup for interactive SPA. No SSR needed. |
| Styling | Inline styles + CSS vars | Single-file component, no build config for CSS. |
| Drag & Drop | HTML5 native API | Zero dependencies. Sufficient for 4-column board. |
| Data read | Google Sheets API v4 | REST, free tier, works with API key for public sheets. |
| Data write | Google Apps Script | Avoids OAuth complexity. Simple POST proxy. |
| AI chat | Anthropic Messages API | Direct browser fetch. Supports Opus 4 and Sonnet 4. |
| Persistence | Browser storage | API keys and chat history. No backend. |
| Hosting | GitHub Pages | Free, static, deploys from repo. |
| Build/Deploy | Vite + GitHub Actions | Standard SPA deploy pipeline. |

---

## Features

### V1 — Kanban MVP

#### 1. Settings Panel

- Modal overlay triggered by ⚙ button in header.
- Input fields (password-masked for sensitive values):
  - Google Sheet ID
  - Sheet tab name (default: `Sheet1`)
  - Google API Key
  - Apps Script URL (optional, enables write-back)
  - Claude API Key
- "Save & Load Sheet" button persists settings and triggers data fetch.
- Includes collapsible code block with the Apps Script source for easy setup.

#### 2. Google Sheets Integration — Read

- Fetches sheet data via: `GET https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}?key={apiKey}`
- Parses first row as headers (case-insensitive matching).
- Maps each subsequent row to a card object with computed fields:
  - `_tags`: parsed array from comma-separated string
  - `_priority`: parsed integer (default 99 if empty)
  - `_id`: stable identifier based on row index
  - `_row`: 1-indexed row number for write-back targeting
- Refresh button re-fetches without clearing local state.
- Error state shows message + suggestion to check settings.

#### 3. Google Sheets Integration — Write

- Triggered on drag-and-drop status change.
- Sends POST to Apps Script URL with payload:
  ```json
  {
    "sheetId": "...",
    "sheetName": "Sheet1",
    "range": "C{row}",
    "value": "new status"
  }
  ```
- Uses `mode: "no-cors"` (Apps Script doesn't return CORS headers on POST).
- Failure is silent (console warning). Local state always updates immediately (optimistic update).
- Status column assumed to be column C (3rd column). Configurable in future versions.

#### 4. Kanban Board

- Default columns: `backlog`, `to do`, `in progress`, `done`.
- Additional columns auto-generated from unique status values in data.
- Each column displays:
  - Colored dot + status name + item count
  - Cards sorted by priority (ascending: P1 first)
- Column visual feedback on drag-over (background highlight, border change).
- Each column has distinct color theme (purple, blue, green, amber).

#### 5. Kanban Cards

Each card displays:

- **Name** (14px, bold, primary text)
- **Priority badge** (top-right, color-coded: red for P1-P2, amber for P3, gray for P4+)
- **Observation** (12px, muted, secondary text — if present)
- **Tag pills** (small colored badges)
- **SaaS badge** (green pill, shown only when `can be saas = yes`)
- **Action buttons**: "💬 Chat" and "⚡ Build Prompt"

Cards are draggable (`draggable` attribute). Hover effect: slight lift + shadow.

#### 6. Filter Bar

Appears when data is loaded. Contains:

- **Search input**: filters by name (case-insensitive substring match)
- **Priority dropdown**: filters by exact priority number
- **Tag dropdown**: populated dynamically from all unique tags in data
- **SaaS dropdown**: `all` / `yes` / `no`
- **Clear button**: resets all filters (visible only when filters are active)
- **Counter**: "X of Y ideas (filtered)"

All filters are AND-combined (item must match all active filters).

---

### V2 — AI Integration

#### 7. Chat Panel

- Slide-in panel from the right side (440px wide, full height).
- Opens when clicking "💬 Chat" on any card.
- Closes via × button. Switches context when clicking Chat on a different card.

**Header section:**
- Idea name (bold)
- Model selector dropdown: Sonnet 4 / Opus 4

**Quick questions section:**
- 6 predefined buttons, each sends a pre-written question:
  1. "Is this idea viable as a product? Analyze market fit and potential."
  2. "What would the MVP look like? List core features only."
  3. "Who are the main competitors and how would this differentiate?"
  4. "What are the biggest technical challenges to build this?"
  5. "How should this be monetized? Suggest pricing models."
  6. "Estimate a realistic timeline for a solo dev to build the MVP."
- Buttons disabled while loading.

**Messages area:**
- Scrollable conversation thread.
- User messages: right-aligned, blue tint background.
- Assistant messages: left-aligned, dark background.
- Loading indicator: "Thinking..." bubble.
- Auto-scroll to bottom on new messages.
- Empty state: prompt text with idea name highlighted.

**Input area:**
- Text input + send button.
- Enter to send (Shift+Enter for newline).
- Disabled while loading.

**System prompt:**
```
You are an expert startup & product advisor. The user is evaluating
a project idea from their portfolio board. Here's the idea context:

Name: {name}
Priority: {priority}
Status: {status}
Observation: {observation}
Tags: {tags}
Can be SaaS: {canBeSaas}

Be concise, actionable, and honest. If the idea has weaknesses,
say so constructively. Format your responses in clear sections.
Respond in the same language the user writes in.
```

**API call:**
```
POST https://api.anthropic.com/v1/messages
Headers:
  Content-Type: application/json
  x-api-key: {claudeApiKey}
  anthropic-dangerous-direct-browser-access: true
Body:
  model: {selected model}
  max_tokens: 1500
  system: {system prompt with idea context}
  messages: {full conversation history}
```

#### 8. Prompt Builder

- Modal overlay triggered by "⚡ Build Prompt" on any card.
- Shows idea name as context header.

**Questionnaire fields** (all optional, textarea inputs):

| Field | Label | Placeholder example |
|---|---|---|
| `context` | App description & problem it solves | "A tool that helps freelancers track invoices..." |
| `targetUser` | Target user | "Freelancers, small agencies..." |
| `techStack` | Preferred tech stack | "React + Supabase, Next.js + Prisma..." |
| `features` | Core MVP features | "Auth, dashboard, invoice builder..." |
| `monetization` | Monetization model | "Freemium with $9/mo pro tier..." |
| `timeline` | Target timeline | "2 weeks, 1 month..." |
| `extra` | Anything else relevant | "I have experience with X..." |

**Generated prompt template:**
```markdown
I want to build a SaaS/app project. Help me create a detailed
development plan.

## Project: {name}
## Initial notes: {observation}
## Tags: {tags}

## Additional Context:
**Description:** {context}
**Target User:** {targetUser}
**Tech Stack:** {techStack}
**Core Features:** {features}
**Monetization:** {monetization}
**Timeline:** {timeline}
**Extra context:** {extra}

## What I need from you:
1. Validate the idea and highlight risks
2. Detailed MVP feature list with priority
3. Suggested tech architecture
4. Step-by-step development roadmap
5. Potential monetization strategy with pricing suggestions
6. Go-to-market strategy for launch
7. Estimated timeline for a solo developer

Be specific, actionable, and realistic.
```

**Actions:**
- "Generate & Copy Prompt" button → copies to clipboard, shows ✓ confirmation for 2 seconds.
- Collapsible "Preview prompt" section shows the rendered prompt.

---

## Setup Guide

### 1. Google Sheet

1. Create or open your ideas spreadsheet.
2. Ensure the first row has headers: `priority`, `name`, `status`, `observation`, `tags`, `can be saas`.
3. Share the sheet: **Share → Anyone with the link → Viewer**.
4. Copy the Sheet ID from the URL: `docs.google.com/spreadsheets/d/{THIS_PART}/edit`.

### 2. Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or use an existing one).
3. Enable **Google Sheets API** in the API Library.
4. Go to **Credentials → Create Credentials → API Key**.
5. (Optional) Restrict the key to Google Sheets API only.

### 3. Apps Script (for write-back)

1. In your Google Sheet: **Extensions → Apps Script**.
2. Replace the default code with:

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.openById(data.sheetId);
  var sheet = ss.getSheetByName(data.sheetName || "Sheet1");
  sheet.getRange(data.range).setValue(data.value);
  return ContentService
    .createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput("OK")
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. **Deploy → New deployment → Web app**.
4. Execute as: **Me**. Who has access: **Anyone**.
5. Copy the deployment URL.

### 4. Claude API Key

1. Go to [Anthropic Console](https://console.anthropic.com/).
2. Create an API key.
3. Note: API calls are billed per token. Sonnet is significantly cheaper than Opus.

### 5. Deploy to GitHub Pages

1. Create a Vite + React project: `npm create vite@latest idea-board -- --template react`.
2. Add the component code.
3. Configure `vite.config.js` with `base: '/idea-board/'`.
4. Add GitHub Actions workflow for automatic deploy on push.

---

## Limitations & Known Trade-offs

| Limitation | Reason | Mitigation |
|---|---|---|
| Status column hardcoded to column C | Simplicity for v1 | Make configurable in settings (future) |
| Apps Script write is fire-and-forget | `no-cors` mode doesn't return response body | Optimistic UI update; user can refresh to verify |
| No offline support | Depends on Google Sheets API | Could add service worker + cache (future) |
| API keys in browser storage | No backend to proxy | Acceptable for single-user personal tool |
| No real-time sync | Sheets API is pull-based | Manual refresh button; could add polling (future) |
| Chat history resets on page reload | Not persisted in v1 | Add storage persistence in v2 |

---

## Future Backlog

Items considered but explicitly deferred:

- **OAuth flow** — Replace Apps Script proxy with direct OAuth2 writes. Removes the Apps Script setup step but adds OAuth consent screen complexity.
- **Multi-sheet / tabs** — Support multiple sheets or tabs as separate boards.
- **Export to Notion / Linear** — One-click migration of ideas to other project management tools.
- **Custom tag colors** — Let the user assign colors to specific tags.
- **Idea analytics** — Track how long ideas stay in each status, completion rate, velocity.
- **PWA / mobile** — Service worker, manifest, installable app for mobile access.
- **Collaborative mode** — Shared board with multiple users (would require auth).
- **Webhook notifications** — Alert when an idea moves to a specific status.
- **AI auto-tagging** — Claude suggests tags based on the idea name and observation.
- **Batch prompt generation** — Generate prompts for multiple selected ideas at once.

---

## File Structure (Vite project)

```
idea-board/
├── index.html
├── vite.config.js
├── package.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx
    ├── App.jsx              # Main app component
    ├── components/
    │   ├── SettingsPanel.jsx
    │   ├── FilterBar.jsx
    │   ├── KanbanBoard.jsx
    │   ├── KanbanColumn.jsx
    │   ├── KanbanCard.jsx
    │   ├── ChatPanel.jsx
    │   └── PromptBuilder.jsx
    ├── hooks/
    │   ├── useSheets.js     # Google Sheets read/write
    │   ├── useStorage.js    # localStorage wrapper
    │   └── useClaude.js     # Claude API calls
    ├── utils/
    │   ├── parseSheet.js    # Sheet data → card objects
    │   └── constants.js     # Models, colors, questions
    └── styles/
        └── index.css        # Global styles, scrollbar, fonts
```
# Sheet-to-Kanban Cloud Functions

Google Cloud Functions (2nd gen) backend that proxies requests to Google Sheets.

## Prerequisites

- [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed and configured
- A GCP project with the Google Sheets API enabled
- The function's default service account needs Editor access on the target Google Sheet

## Environment Variables

| Variable     | Required | Description                        |
|------------- |----------|------------------------------------|
| `SHEET_ID`   | Yes      | Google Sheets spreadsheet ID       |
| `SHEET_NAME` | No       | Tab name (default: `Sheet1`)       |
| `APP_TOKEN`  | Yes      | Bearer token for API authorization |

## Local Development

```bash
# Authenticate for local Sheets access
gcloud auth application-default login

# Install and build
npm install && npm run build

# Run locally (set env vars first)
SHEET_ID=xxx APP_TOKEN=secret npx functions-framework --target=getSheet --source=dist --port=8080

# In another terminal, for updateCell:
SHEET_ID=xxx APP_TOKEN=secret npx functions-framework --target=updateCell --source=dist --port=8081
```

## Deploy

```bash
# Build TypeScript first
npm run build

# Deploy getSheet
gcloud functions deploy getSheet \
  --gen2 \
  --runtime=nodejs22 \
  --trigger-http \
  --allow-unauthenticated \
  --region=europe-west1 \
  --source=. \
  --set-env-vars SHEET_ID=xxx,SHEET_NAME=Sheet1,APP_TOKEN=your-secret-token

# Deploy updateCell
gcloud functions deploy updateCell \
  --gen2 \
  --runtime=nodejs22 \
  --trigger-http \
  --allow-unauthenticated \
  --region=europe-west1 \
  --source=. \
  --set-env-vars SHEET_ID=xxx,SHEET_NAME=Sheet1,APP_TOKEN=your-secret-token
```

> `--allow-unauthenticated` is needed because auth is handled at the app level via bearer token, not IAM.

## Frontend Changes Needed

Replace the current Google API Key + Apps Script URL settings with:
- **API Base URL**: The deployed Cloud Function URL (e.g. `https://europe-west1-project.cloudfunctions.net`)
- **API Token**: The `APP_TOKEN` value set during deploy

Remove these settings (no longer needed):
- Google API Key (`VITE_GOOGLE_API_KEY`)
- Apps Script URL (`VITE_APPS_SCRIPT_URL`)

## API

### GET /getSheet

Returns all rows from the configured sheet.

```bash
curl -H "Authorization: Bearer <token>" https://<function-url>/getSheet
```

Response:
```json
{
  "headers": ["priority", "name", "status", "observation", "tags", "can be saas"],
  "rows": [
    { "_row": 2, "priority": "1", "name": "App Name", "status": "to do", ... }
  ]
}
```

### POST /updateCell

Updates a specific cell.

```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"row": 5, "column": "status", "value": "in progress"}' \
  https://<function-url>/updateCell
```

Response:
```json
{ "ok": true }
```

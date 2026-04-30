import { http } from "@google-cloud/functions-framework";
import type { Request, Response } from "@google-cloud/functions-framework";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { GoogleAuth } from "google-auth-library";

// --- Config ---

const SHEET_ID = process.env.SHEET_ID ?? "";
const SHEET_NAME = process.env.SHEET_NAME ?? "Sheet1";
const APP_TOKEN = process.env.APP_TOKEN ?? "";

const ALLOWED_ORIGINS = [
  "https://kanban.monicarvajal.com",
  "http://localhost:5173",
  "http://localhost:4173",
];

// --- CORS ---

function handleCors(req: Request, res: Response): boolean {
  const origin = req.headers.origin as string | undefined;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return true;
  }
  return false;
}

// --- Auth ---

function validateAuth(req: Request, res: Response): boolean {
  if (!APP_TOKEN) {
    console.error("APP_TOKEN env var not set");
    res.status(500).json({ error: "Server misconfigured: missing auth token" });
    return false;
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ") || auth.slice(7) !== APP_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

// --- Sheets client ---

async function getDoc(): Promise<GoogleSpreadsheet> {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const authClient = await auth.getClient();
  const doc = new GoogleSpreadsheet(SHEET_ID, authClient as ConstructorParameters<typeof GoogleSpreadsheet>[1]);
  await doc.loadInfo();
  return doc;
}

// --- getSheet function ---

http("getSheet", async (req: Request, res: Response) => {
  if (handleCors(req, res)) return;
  if (!validateAuth(req, res)) return;

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[SHEET_NAME];

    if (!sheet) {
      res.status(404).json({ error: `Sheet "${SHEET_NAME}" not found` });
      return;
    }

    await sheet.loadHeaderRow();
    const originalHeaders = sheet.headerValues;
    const headers = originalHeaders.map((h) => h.toLowerCase().trim());
    const rows = await sheet.getRows();

    const result = rows.map((row, index) => {
      const obj: Record<string, string | number> = { _row: index + 2 };
      for (let i = 0; i < originalHeaders.length; i++) {
        obj[headers[i]] = row.get(originalHeaders[i]) ?? "";
      }
      return obj;
    });

    res.json({ headers, rows: result });
  } catch (err) {
    console.error("getSheet error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

// --- updateCell function ---

http("updateCell", async (req: Request, res: Response) => {
  if (handleCors(req, res)) return;
  if (!validateAuth(req, res)) return;

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { row, column, value } = req.body ?? {};

  if (typeof row !== "number" || typeof column !== "string" || typeof value !== "string") {
    res.status(400).json({
      error: "Invalid body. Expected: { row: number, column: string, value: string }",
    });
    return;
  }

  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle[SHEET_NAME];

    if (!sheet) {
      res.status(404).json({ error: `Sheet "${SHEET_NAME}" not found` });
      return;
    }

    const rows = await sheet.getRows();
    const rowIndex = row - 2; // row 1 = header, data starts at row 2

    if (rowIndex < 0 || rowIndex >= rows.length) {
      res.status(404).json({ error: `Row ${row} not found` });
      return;
    }

    const target = rows[rowIndex];
    target.set(column, value);
    await target.save();

    res.json({ ok: true });
  } catch (err) {
    console.error("updateCell error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

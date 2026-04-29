export const DEFAULT_COLUMNS = ['backlog', 'to do', 'in progress', 'done'] as const

export const COLUMN_COLORS: Record<string, { dot: string; bg: string; border: string; dragOver: string }> = {
  'backlog': { dot: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', dragOver: 'bg-purple-100 dark:bg-purple-900/40' },
  'to do': { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', dragOver: 'bg-blue-100 dark:bg-blue-900/40' },
  'in progress': { dot: 'bg-green-500', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', dragOver: 'bg-green-100 dark:bg-green-900/40' },
  'done': { dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', dragOver: 'bg-amber-100 dark:bg-amber-900/40' },
}

const FALLBACK_COLOR = { dot: 'bg-gray-500', bg: 'bg-gray-50 dark:bg-gray-950/30', border: 'border-gray-200 dark:border-gray-800', dragOver: 'bg-gray-100 dark:bg-gray-900/40' }

export function getColumnColor(status: string) {
  return COLUMN_COLORS[status.toLowerCase()] ?? FALLBACK_COLOR
}

export function getPriorityColor(priority: number): string {
  if (priority <= 2) return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  if (priority === 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
}

export const APPS_SCRIPT_CODE = `function doPost(e) {
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
}`

export const DEFAULT_COLUMNS = ['backlog', 'to do', 'in progress', 'done'] as const

export const COLUMN_COLORS: Record<string, { dot: string; bg: string; border: string; dragOver: string }> = {
  'backlog': { dot: 'bg-[#ffb3ba]', bg: 'bg-[#ffb3ba]/20', border: 'border-[#ffb3ba]', dragOver: 'bg-[#ffb3ba]/40' },
  'to do': { dot: 'bg-[#bae1ff]', bg: 'bg-[#bae1ff]/20', border: 'border-[#bae1ff]', dragOver: 'bg-[#bae1ff]/40' },
  'in progress': { dot: 'bg-[#baffc9]', bg: 'bg-[#baffc9]/20', border: 'border-[#baffc9]', dragOver: 'bg-[#baffc9]/40' },
  'done': { dot: 'bg-[#ffdfba]', bg: 'bg-[#ffdfba]/20', border: 'border-[#ffdfba]', dragOver: 'bg-[#ffdfba]/40' },
}

const FALLBACK_COLOR = { dot: 'bg-gray-400', bg: 'bg-gray-100', border: 'border-gray-300', dragOver: 'bg-gray-200' }

export function getColumnColor(status: string) {
  return COLUMN_COLORS[status.toLowerCase()] ?? FALLBACK_COLOR
}

export function getPriorityColor(priority: number): string {
  if (priority <= 2) return 'bg-[#ffb3ba] text-[#2d2d2d]'
  if (priority === 3) return 'bg-[#ffffba] text-[#2d2d2d]'
  return 'bg-gray-200 text-gray-600'
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

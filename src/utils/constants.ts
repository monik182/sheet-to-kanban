export const DEFAULT_COLUMNS = ['to do', 'in progress', 'blocked', 'paused', 'done', "won't do"] as const

export const COLUMN_COLORS: Record<string, {
  bg: string
  bgHex: string
  dragOver: string
  header: string
  headerBorder: string
}> = {
  'to do': {
    bg: 'bg-[#bae1ff]/20',
    bgHex: '#bae1ff',
    dragOver: 'bg-[#bae1ff]/40',
    header: 'bg-[#bae1ff]',
    headerBorder: 'border-[#8ac4f0]',
  },
  'in progress': {
    bg: 'bg-[#baffc9]/20',
    bgHex: '#baffc9',
    dragOver: 'bg-[#baffc9]/40',
    header: 'bg-[#baffc9]',
    headerBorder: 'border-[#8be0a0]',
  },
  'blocked': {
    bg: 'bg-[#ffb3ba]/20',
    bgHex: '#ffb3ba',
    dragOver: 'bg-[#ffb3ba]/40',
    header: 'bg-[#ffb3ba]',
    headerBorder: 'border-[#e8959d]',
  },
  'paused': {
    bg: 'bg-[#ffffba]/20',
    bgHex: '#ffffba',
    dragOver: 'bg-[#ffffba]/40',
    header: 'bg-[#ffffba]',
    headerBorder: 'border-[#e0e08a]',
  },
  'done': {
    bg: 'bg-[#ffdfba]/20',
    bgHex: '#ffdfba',
    dragOver: 'bg-[#ffdfba]/40',
    header: 'bg-[#ffdfba]',
    headerBorder: 'border-[#e0c08a]',
  },
  "won't do": {
    bg: 'bg-[#e0ddd8]/20',
    bgHex: '#e0ddd8',
    dragOver: 'bg-[#e0ddd8]/40',
    header: 'bg-[#e0ddd8]',
    headerBorder: 'border-[#c0bdb8]',
  },
}

const FALLBACK_COLOR = {
  bg: 'bg-gray-100',
  bgHex: '#e5e5e5',
  dragOver: 'bg-gray-200',
  header: 'bg-gray-200',
  headerBorder: 'border-gray-300',
}

export function getColumnColor(status: string) {
  return COLUMN_COLORS[status.toLowerCase()] ?? FALLBACK_COLOR
}

const TAG_COLORS = [
  { bg: 'bg-[#baffc9]', text: 'text-[#2a5a35]', border: 'border-[#8be0a0]' },
  { bg: 'bg-[#bae1ff]', text: 'text-[#2a4a6a]', border: 'border-[#8ac4f0]' },
  { bg: 'bg-[#ffb3ba]', text: 'text-[#6a2a30]', border: 'border-[#e8959d]' },
  { bg: 'bg-[#ffdfba]', text: 'text-[#6a4a2a]', border: 'border-[#e0c08a]' },
  { bg: 'bg-[#ffffba]', text: 'text-[#5a5a2a]', border: 'border-[#e0e08a]' },
  { bg: 'bg-[#e8d0ff]', text: 'text-[#4a2a6a]', border: 'border-[#c8a8e0]' },
]

export function getTagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function getPriorityColor(priority: number): string {
  if (priority <= 2) return 'bg-[#ffb3ba] text-[#2d2d2d]'
  if (priority === 3) return 'bg-[#ffffba] text-[#2d2d2d]'
  return 'bg-[#e0ddd8] text-[#6b6b6b]'
}

export const COLUMN_ICONS: Record<string, string> = {
  'to do': '\u2606',
  'in progress': '\u25B6',
  'blocked': '\u2716',
  'paused': '\u275A\u275A',
  'done': '\u2714',
  "won't do": '\u2212',
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

import type { EnvConfig } from '../types'

export function getConfig(): EnvConfig {
  return {
    googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY ?? '',
    sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID ?? '',
    tabName: import.meta.env.VITE_SHEET_TAB_NAME || 'Sheet1',
    appsScriptUrl: import.meta.env.VITE_APPS_SCRIPT_URL ?? '',
  }
}

export function hasRequiredConfig(config: EnvConfig): boolean {
  return config.googleApiKey !== '' && config.sheetId !== ''
}

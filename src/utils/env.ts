import type { EnvConfig } from '../types'

export function getConfig(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL ?? '',
    apiToken: import.meta.env.VITE_API_TOKEN ?? '',
  }
}

export function hasRequiredConfig(config: EnvConfig): boolean {
  return config.apiUrl !== '' && config.apiToken !== ''
}

import type { EnvConfig } from '../types'

export function getConfig(): EnvConfig {
  return {
    apiUrl: import.meta.env.VITE_API_URL ?? '',
  }
}

export function hasRequiredConfig(config: EnvConfig): boolean {
  return config.apiUrl !== ''
}

export interface SheetCard {
  priority: string
  name: string
  status: string
  observation: string
  tags: string
  canBeSaas: string
  _tags: string[]
  _priority: number
  _id: string
  _row: number
}

export interface FilterState {
  search: string
  priority: string
  tag: string
  saas: string
}

export interface EnvConfig {
  apiUrl: string
}

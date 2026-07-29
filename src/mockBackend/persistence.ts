import { initialMockState } from './seed'
import type { AnySpotMockState } from './types'

const STORAGE_KEY = 'anyspot:mvp:mock-backend:v1'

export type PersistenceDriver = {
  read(): Promise<AnySpotMockState>
  write(state: AnySpotMockState): Promise<void>
  reset(): Promise<AnySpotMockState>
}

const cloneState = (state: AnySpotMockState): AnySpotMockState =>
  JSON.parse(JSON.stringify(state)) as AnySpotMockState

const normalizeState = (state: AnySpotMockState): AnySpotMockState => {
  const normalized = cloneState(state)

  normalized.platformSettings = {
    ...initialMockState.platformSettings,
    ...normalized.platformSettings,
    transactionFeePercent:
      normalized.platformSettings.transactionFeePercent ??
      initialMockState.platformSettings.transactionFeePercent,
    monthlySubscriptionCzk:
      normalized.platformSettings.monthlySubscriptionCzk ??
      initialMockState.platformSettings.monthlySubscriptionCzk,
  }

  return normalized
}

export const localStorageDriver: PersistenceDriver = {
  async read() {
    if (typeof window === 'undefined') {
      return cloneState(initialMockState)
    }

    const cached = window.localStorage.getItem(STORAGE_KEY)

    if (!cached) {
      const seeded = cloneState(initialMockState)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    try {
      const normalized = normalizeState(JSON.parse(cached) as AnySpotMockState)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      return normalized
    } catch {
      const seeded = cloneState(initialMockState)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
  },
  async write(state) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  },
  async reset() {
    const seeded = cloneState(initialMockState)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
    }

    return seeded
  },
}

export const redisReadyDriverNotes = {
  purpose: 'Future backend cache boundary',
  productionShape:
    'Supabase Postgres remains source of truth; Redis caches role dashboards, availability, capacity counters, sessions, and short-lived admin metrics.',
  swapPoint:
    'Replace localStorageDriver with an API-backed driver that talks to Supabase and Redis server-side.',
}

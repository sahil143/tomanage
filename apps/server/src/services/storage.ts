import fs from 'node:fs';
import path from 'node:path';
import { AnalyticsEntry, Todo, UserPreferences } from '../schemas';

class StorageService {
  private preferencesByUserId = new Map<string, UserPreferences>();
  private patternsByUserAndType = new Map<string, Record<string, unknown>>();
  private analyticsByUserId = new Map<string, AnalyticsEntry[]>();

  // ===== TickTick (OAuth + cached tasks) =====
  private ticktickAccessTokenByUserId = new Map<
    string,
    { accessToken: string; updatedAt: string }
  >();
  private ticktickOAuthStateByUserId = new Map<
    string,
    { state: string; createdAt: string }
  >();
  private ticktickTodosCacheByUserId = new Map<
    string,
    { fetchedAt: string; todos: Todo[] }
  >();

  // ===== Persistence (local/dev) =====
  private readonly storageFilePath: string;

  constructor() {
    // NOTE: Local persistence to support server-side OAuth tokens without DB deps.
    // For production, swap this for Postgres (+ Redis for caching).
    const configuredPath = process.env.TOMANAGE_STORAGE_FILE;
    this.storageFilePath = path.resolve(configuredPath ?? '.data/storage.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (!fs.existsSync(this.storageFilePath)) return;
      const raw = fs.readFileSync(this.storageFilePath, 'utf8');
      if (!raw.trim()) return;
      const data = JSON.parse(raw) as PersistedStorageShape;

      if (data.preferencesByUserId) {
        for (const [userId, prefs] of Object.entries(data.preferencesByUserId)) {
          this.preferencesByUserId.set(userId, prefs);
        }
      }

      if (data.patternsByUserAndType) {
        for (const [key, value] of Object.entries(data.patternsByUserAndType)) {
          this.patternsByUserAndType.set(key, value);
        }
      }

      if (data.analyticsByUserId) {
        for (const [userId, entries] of Object.entries(data.analyticsByUserId)) {
          this.analyticsByUserId.set(userId, entries ?? []);
        }
      }

      if (data.ticktick?.accessTokenByUserId) {
        for (const [userId, v] of Object.entries(data.ticktick.accessTokenByUserId)) {
          if (v?.accessToken) this.ticktickAccessTokenByUserId.set(userId, v);
        }
      }
      if (data.ticktick?.oauthStateByUserId) {
        for (const [userId, v] of Object.entries(data.ticktick.oauthStateByUserId)) {
          if (v?.state) this.ticktickOAuthStateByUserId.set(userId, v);
        }
      }
      if (data.ticktick?.todosCacheByUserId) {
        for (const [userId, v] of Object.entries(data.ticktick.todosCacheByUserId)) {
          if (v?.fetchedAt && Array.isArray(v.todos)) {
            this.ticktickTodosCacheByUserId.set(userId, v);
          }
        }
      }

      console.log(`[Storage] Loaded persisted data from ${this.storageFilePath}`);
    } catch (error) {
      console.warn(
        `[Storage] Failed to load persisted storage from ${this.storageFilePath}:`,
        error
      );
    }
  }

  private flushToDisk(): void {
    try {
      const dir = path.dirname(this.storageFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const data: PersistedStorageShape = {
        version: 1,
        preferencesByUserId: Object.fromEntries(this.preferencesByUserId.entries()),
        patternsByUserAndType: Object.fromEntries(this.patternsByUserAndType.entries()),
        analyticsByUserId: Object.fromEntries(this.analyticsByUserId.entries()),
        ticktick: {
          accessTokenByUserId: Object.fromEntries(this.ticktickAccessTokenByUserId.entries()),
          oauthStateByUserId: Object.fromEntries(this.ticktickOAuthStateByUserId.entries()),
          todosCacheByUserId: Object.fromEntries(this.ticktickTodosCacheByUserId.entries()),
        },
      };

      fs.writeFileSync(this.storageFilePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.warn(`[Storage] Failed to persist storage to ${this.storageFilePath}:`, error);
    }
  }

  // ===== Preferences =====

  savePreferences(userId: string, preferences: UserPreferences): void {
    this.preferencesByUserId.set(userId, preferences);
    this.flushToDisk();
    console.log(`[Storage] Saved preferences for ${userId}`);
  }

  getPreferences(userId: string): UserPreferences | null {
    return this.preferencesByUserId.get(userId) ?? null;
  }

  getOrCreateDefaultPreferences(userId: string): UserPreferences {
    const existing = this.getPreferences(userId);
    if (existing) return existing;

    const defaultPreferences: UserPreferences = {
      role: 'Senior Frontend Engineer at Red Hat',
      focus_areas: ['React', 'TypeScript', 'Konflux-UI'],
      current_goals: ['job_search', 'sentry_monitoring', 'bundle_optimization'],
      work_hours: {
        start: '09:00',
        end: '17:00',
      },
      peak_focus_times: ['09:00-12:00', '14:00-16:00'],
      energy_by_hour: {
        '9': 'high',
        '10': 'high',
        '11': 'high',
        '12': 'medium',
        '13': 'medium',
        '14': 'high',
        '15': 'high',
        '16': 'medium',
        '17': 'low',
        '18': 'low',
        '19': 'low',
        '20': 'medium',
      },
      preferred_morning_contexts: ['frontend', 'architecture'],
      preferred_afternoon_contexts: ['review', 'meeting', 'planning'],
      preferred_evening_contexts: ['learning', 'admin'],
    };

    this.savePreferences(userId, defaultPreferences);
    return defaultPreferences;
  }

  // ===== Patterns =====

  savePattern(userId: string, patternType: string, data: Record<string, unknown>): void {
    const key = `${userId}:${patternType}`;
    this.patternsByUserAndType.set(key, data);
    this.flushToDisk();
    console.log(`[Storage] Saved pattern '${patternType}' for ${userId}`, data);
  }

  getPattern(userId: string, patternType: string): Record<string, unknown> | null {
    const key = `${userId}:${patternType}`;
    return this.patternsByUserAndType.get(key) ?? null;
  }

  getAllPatterns(userId: string): Record<string, Record<string, unknown>> {
    const patterns: Record<string, Record<string, unknown>> = {};
    const prefix = `${userId}:`;

    for (const [key, value] of this.patternsByUserAndType.entries()) {
      if (key.startsWith(prefix)) {
        const patternType = key.replace(prefix, '');
        patterns[patternType] = value;
      }
    }

    return patterns;
  }

  // ===== Analytics =====

  saveAnalytics(userId: string, entry: AnalyticsEntry): void {
    const existing = this.analyticsByUserId.get(userId) ?? [];
    existing.push(entry);
    this.analyticsByUserId.set(userId, existing);
    this.flushToDisk();
    console.log(`[Storage] Saved analytics entry for ${userId}`);
  }

  // ===== TickTick =====

  setTickTickOAuthState(userId: string, state: string): void {
    this.ticktickOAuthStateByUserId.set(userId, {
      state,
      createdAt: new Date().toISOString(),
    });
    this.flushToDisk();
  }

  getTickTickOAuthState(userId: string): { state: string; createdAt: string } | null {
    return this.ticktickOAuthStateByUserId.get(userId) ?? null;
  }

  clearTickTickOAuthState(userId: string): void {
    this.ticktickOAuthStateByUserId.delete(userId);
    this.flushToDisk();
  }

  setTickTickAccessToken(userId: string, accessToken: string): void {
    this.ticktickAccessTokenByUserId.set(userId, {
      accessToken,
      updatedAt: new Date().toISOString(),
    });
    this.flushToDisk();
  }

  getTickTickAccessToken(userId: string): string | null {
    return this.ticktickAccessTokenByUserId.get(userId)?.accessToken ?? null;
  }

  clearTickTickAccessToken(userId: string): void {
    this.ticktickAccessTokenByUserId.delete(userId);
    this.flushToDisk();
  }

  setTickTickTodosCache(userId: string, todos: Todo[]): void {
    this.ticktickTodosCacheByUserId.set(userId, {
      fetchedAt: new Date().toISOString(),
      todos,
    });
    this.flushToDisk();
  }

  getTickTickTodosCache(userId: string): { fetchedAt: string; todos: Todo[] } | null {
    return this.ticktickTodosCacheByUserId.get(userId) ?? null;
  }

  clearTickTickTodosCache(userId: string): void {
    this.ticktickTodosCacheByUserId.delete(userId);
    this.flushToDisk();
  }

  getAnalytics(userId: string, limit?: number): AnalyticsEntry[] {
    const entries = this.analyticsByUserId.get(userId) ?? [];

    if (limit) {
      return entries.slice(-limit);
    }

    return entries;
  }

  // ===== Utility =====

  clear(userId?: string): void {
    if (userId) {
      this.preferencesByUserId.delete(userId);
      this.analyticsByUserId.delete(userId);
      this.ticktickAccessTokenByUserId.delete(userId);
      this.ticktickOAuthStateByUserId.delete(userId);
      this.ticktickTodosCacheByUserId.delete(userId);
      for (const key of this.patternsByUserAndType.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.patternsByUserAndType.delete(key);
        }
      }
      this.flushToDisk();
      console.log(`[Storage] Cleared data for ${userId}`);
    } else {
      this.preferencesByUserId.clear();
      this.patternsByUserAndType.clear();
      this.analyticsByUserId.clear();
      this.ticktickAccessTokenByUserId.clear();
      this.ticktickOAuthStateByUserId.clear();
      this.ticktickTodosCacheByUserId.clear();
      this.flushToDisk();
      console.log('[Storage] Cleared all data');
    }
  }

  getAllKeys(): string[] {
    return [
      ...this.preferencesByUserId.keys(),
      ...this.analyticsByUserId.keys(),
      ...this.patternsByUserAndType.keys(),
    ];
  }
}

type PersistedStorageShape = {
  version: 1;
  preferencesByUserId: Record<string, UserPreferences>;
  patternsByUserAndType: Record<string, Record<string, unknown>>;
  analyticsByUserId: Record<string, AnalyticsEntry[]>;
  ticktick: {
    accessTokenByUserId: Record<string, { accessToken: string; updatedAt: string }>;
    oauthStateByUserId: Record<string, { state: string; createdAt: string }>;
    todosCacheByUserId: Record<string, { fetchedAt: string; todos: Todo[] }>;
  };
};

// Export singleton instance
export const storageService = new StorageService();

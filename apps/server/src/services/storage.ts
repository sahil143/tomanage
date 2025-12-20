import { UserPreferences, AnalyticsEntry } from '../schemas';

class StorageService {
  private preferencesByUserId = new Map<string, UserPreferences>();
  private patternsByUserAndType = new Map<string, Record<string, unknown>>();
  private analyticsByUserId = new Map<string, AnalyticsEntry[]>();

  // ===== Preferences =====

  savePreferences(userId: string, preferences: UserPreferences): void {
    this.preferencesByUserId.set(userId, preferences);
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
    console.log(`[Storage] Saved analytics entry for ${userId}`);
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
      for (const key of this.patternsByUserAndType.keys()) {
        if (key.startsWith(`${userId}:`)) {
          this.patternsByUserAndType.delete(key);
        }
      }
      console.log(`[Storage] Cleared data for ${userId}`);
    } else {
      this.preferencesByUserId.clear();
      this.patternsByUserAndType.clear();
      this.analyticsByUserId.clear();
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

// Export singleton instance
export const storageService = new StorageService();

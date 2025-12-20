import { UserPreferences, AnalyticsEntry } from '../schemas';

// In-memory storage using Map
// Structure: storage.set('user-1:preferences', {...})
// Structure: storage.set('user-1:pattern:productivity_by_hour', {...})
// Structure: storage.set('user-1:analytics', [...])
class StorageService {
  private storage = new Map<string, any>();

  // ===== Preferences =====

  savePreferences(userId: string, preferences: UserPreferences): void {
    const key = `${userId}:preferences`;
    this.storage.set(key, preferences);
    console.log(`[Storage] Saved preferences for ${userId}`);
  }

  getPreferences(userId: string): UserPreferences | null {
    const key = `${userId}:preferences`;
    return this.storage.get(key) || null;
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

  savePattern(userId: string, patternType: string, data: Record<string, any>): void {
    const key = `${userId}:pattern:${patternType}`;
    this.storage.set(key, data);
    console.log(`[Storage] Saved pattern '${patternType}' for ${userId}`, data);
  }

  getPattern(userId: string, patternType: string): Record<string, any> | null {
    const key = `${userId}:pattern:${patternType}`;
    return this.storage.get(key) || null;
  }

  getAllPatterns(userId: string): Record<string, any> {
    const patterns: Record<string, any> = {};
    const prefix = `${userId}:pattern:`;

    for (const [key, value] of this.storage.entries()) {
      if (key.startsWith(prefix)) {
        const patternType = key.replace(prefix, '');
        patterns[patternType] = value;
      }
    }

    return patterns;
  }

  // ===== Analytics =====

  saveAnalytics(userId: string, entry: AnalyticsEntry): void {
    const key = `${userId}:analytics`;
    const existing = this.storage.get(key) || [];
    existing.push(entry);
    this.storage.set(key, existing);
    console.log(`[Storage] Saved analytics entry for ${userId}`);
  }

  getAnalytics(userId: string, limit?: number): AnalyticsEntry[] {
    const key = `${userId}:analytics`;
    const entries = this.storage.get(key) || [];

    if (limit) {
      return entries.slice(-limit);
    }

    return entries;
  }

  // ===== Utility =====

  clear(userId?: string): void {
    if (userId) {
      // Clear only user's data
      const keysToDelete: string[] = [];
      for (const key of this.storage.keys()) {
        if (key.startsWith(`${userId}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.storage.delete(key));
      console.log(`[Storage] Cleared data for ${userId}`);
    } else {
      // Clear all data
      this.storage.clear();
      console.log('[Storage] Cleared all data');
    }
  }

  getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }
}

// Export singleton instance
export const storageService = new StorageService();

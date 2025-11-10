/**
 * Client-side cache for members data
 * Preloads members on landing page for instant access on members page
 */

import { Member } from './firestore';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl || this.DEFAULT_TTL
    };
    this.cache.set(key, entry);
    
    // Also store in sessionStorage for persistence across page navigations
    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to store in sessionStorage:', e);
    }
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    let entry = this.cache.get(key);
    
    // If not in memory, try sessionStorage
    if (!entry) {
      try {
        const stored = sessionStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry) {
            this.cache.set(key, entry);
          }
        }
      } catch (e) {
        console.warn('Failed to read from sessionStorage:', e);
      }
    }

    if (!entry) return null;

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.expiresIn) {
      this.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete data from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
    try {
      sessionStorage.removeItem(`cache_${key}`);
    } catch (e) {
      console.warn('Failed to remove from sessionStorage:', e);
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear sessionStorage:', e);
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const dataCache = new DataCache();

// Cache keys
export const CACHE_KEYS = {
  MEMBERS: 'members_list',
  EVENTS: 'events_list',
  PROJECTS: 'projects_list',
  ACHIEVEMENTS: 'achievements_list',
  APPLICATIONS: 'applications_list',
  SETTINGS: 'settings_data'
};

/**
 * Preload members data in background
 */
export async function preloadMembers(): Promise<Member[]> {
  // Check if already cached
  const cached = dataCache.get<Member[]>(CACHE_KEYS.MEMBERS);
  if (cached) {
    console.log('✅ Members loaded from cache');
    return cached;
  }

  // Import dynamically to avoid circular dependency
  const { getMembers } = await import('./firestore');
  
  try {
    console.log('📥 Preloading members...');
    const members = await getMembers();
    
    // Cache for 5 minutes
    dataCache.set(CACHE_KEYS.MEMBERS, members, 5 * 60 * 1000);
    
    console.log(`✅ Cached ${members.length} members`);
    return members;
  } catch (error) {
    console.error('Failed to preload members:', error);
    return [];
  }
}

/**
 * Get cached members or fetch if not available
 */
export async function getCachedMembers(): Promise<Member[]> {
  // Try cache first
  const cached = dataCache.get<Member[]>(CACHE_KEYS.MEMBERS);
  if (cached) {
    console.log('⚡ Using cached members');
    return cached;
  }

  // Fetch and cache
  return preloadMembers();
}

/**
 * Invalidate members cache (call after adding/updating/deleting members)
 */
export function invalidateMembersCache(): void {
  dataCache.delete(CACHE_KEYS.MEMBERS);
  console.log('🗑️ Members cache invalidated');
}

/**
 * Preload all critical data in background
 */
export async function preloadCriticalData(): Promise<void> {
  console.log('🚀 Preloading critical data...');
  
  const promises = [
    preloadMembers(),
    preloadEvents(),
    preloadProjects(),
    preloadAchievements(),
    preloadSettings()
  ];
  
  try {
    await Promise.allSettled(promises);
    console.log('✅ Critical data preloading complete');
  } catch (error) {
    console.warn('Some critical data failed to preload:', error);
  }
}

/**
 * Preload events data
 */
export async function preloadEvents(): Promise<any[]> {
  const cached = dataCache.get<any[]>(CACHE_KEYS.EVENTS);
  if (cached) return cached;

  const { getEvents } = await import('./firestore');
  try {
    const events = await getEvents();
    dataCache.set(CACHE_KEYS.EVENTS, events, 10 * 60 * 1000); // 10 minutes
    return events;
  } catch (error) {
    console.error('Failed to preload events:', error);
    return [];
  }
}

/**
 * Preload projects data
 */
export async function preloadProjects(): Promise<any[]> {
  const cached = dataCache.get<any[]>(CACHE_KEYS.PROJECTS);
  if (cached) return cached;

  const { getProjects } = await import('./firestore');
  try {
    const projects = await getProjects();
    dataCache.set(CACHE_KEYS.PROJECTS, projects, 10 * 60 * 1000); // 10 minutes
    return projects;
  } catch (error) {
    console.error('Failed to preload projects:', error);
    return [];
  }
}

/**
 * Preload achievements data
 */
export async function preloadAchievements(): Promise<any[]> {
  const cached = dataCache.get<any[]>(CACHE_KEYS.ACHIEVEMENTS);
  if (cached) return cached;

  const { getAchievements } = await import('./firestore');
  try {
    const achievements = await getAchievements();
    dataCache.set(CACHE_KEYS.ACHIEVEMENTS, achievements, 15 * 60 * 1000); // 15 minutes
    return achievements;
  } catch (error) {
    console.error('Failed to preload achievements:', error);
    return [];
  }
}

/**
 * Preload settings data
 */
export async function preloadSettings(): Promise<any> {
  const cached = dataCache.get<any>(CACHE_KEYS.SETTINGS);
  if (cached) return cached;

  const { getSettings } = await import('./firestore');
  try {
    const settings = await getSettings();
    dataCache.set(CACHE_KEYS.SETTINGS, settings, 30 * 60 * 1000); // 30 minutes
    return settings;
  } catch (error) {
    console.error('Failed to preload settings:', error);
    return { applicationsEnabled: true };
  }
}

/**
 * Get cached data with fallback to fetch
 */
export async function getCachedData<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Try cache first
  const cached = dataCache.get<T>(key);
  if (cached) {
    console.log(`⚡ Using cached ${key}`);
    return cached;
  }

  // Fetch and cache
  console.log(`📥 Fetching ${key}...`);
  const data = await fetchFn();
  dataCache.set(key, data, ttl);
  console.log(`✅ Cached ${key}`);
  return data;
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static start(label: string): void {
    if (typeof window !== 'undefined' && window.performance) {
      window.performance.mark(`${label}-start`);
      this.marks.set(label, Date.now());
    }
  }
  
  static end(label: string): number {
    if (typeof window !== 'undefined' && window.performance) {
      try {
        window.performance.mark(`${label}-end`);
        window.performance.measure(label, `${label}-start`, `${label}-end`);
        const duration = Date.now() - (this.marks.get(label) || 0);
        console.log(`⏱️ ${label}: ${duration}ms`);
        return duration;
      } catch (e) {
        console.warn('Performance monitoring not available');
        return 0;
      }
    }
    return 0;
  }
}

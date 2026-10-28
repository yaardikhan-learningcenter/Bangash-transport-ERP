/**
 * Live multi-user sync with Firebase Firestore (or local browser storage in demo mode) through services/api.ts.
 *
 *  - Local edits are diffed per record against the last synced snapshot and pushed (debounced).
 *  - The server version is polled; when another user changed something, fresh data is pulled.
 */
import { dbService } from './db';
import { api, ApiError } from './api';

export type CloudSyncStatus = 'connected' | 'syncing' | 'synced' | 'error' | 'offline';

export interface CloudStatusInfo {
  status: CloudSyncStatus;
  lastSyncedAt: string | null;
  entryCount: number;
  databaseId: string;
  errorMessage?: string;
}

const RECORD_COLLECTIONS = [
  'trips', 'vehicles', 'customers', 'drivers', 'expenseCategories', 'expenseVouchers', 'invoices',
  'pods', 'accounts', 'transactions', 'suppliers', 'purchases', 'locations', 'auditLogs', 'users',
] as const;

const POLL_MS = 4000;
const PUSH_DEBOUNCE_MS = 400;

class SyncService {
  private status: CloudSyncStatus = 'offline';
  private lastSyncedAt: string | null = null;
  private errorMessage?: string;
  private listeners = new Set<(info: CloudStatusInfo) => void>();

  private version = 0;
  private base: Record<string, Map<string, string>> = {};
  private baseSettings: Record<string, string> = {};
  private pushTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pushing = false;
  private running = false;

  constructor() {
    dbService.setOnCommitHook(() => this.schedulePush());
  }

  // ---------- lifecycle
  /** Call after dbService.hydrate(): remembers the synced baseline and starts polling. */
  public start(version: number): void {
    this.version = version;
    this.snapshotBase();
    this.running = true;
    this.setStatus('synced');
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => void this.poll(), POLL_MS);
    document.addEventListener('visibilitychange', this.onVisible);
  }

  public stop(): void {
    this.running = false;
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pollTimer = null;
    this.pushTimer = null;
    document.removeEventListener('visibilitychange', this.onVisible);
    this.setStatus('offline');
  }

  private onVisible = () => {
    if (document.visibilityState === 'visible') void this.poll();
  };

  // ---------- status / subscribers
  public getStatusInfo(): CloudStatusInfo {
    const s: any = dbService.getState();
    let entryCount = 0;
    for (const k of Object.keys(s)) if (Array.isArray(s[k])) entryCount += s[k].length;
    return {
      status: this.status,
      lastSyncedAt: this.lastSyncedAt,
      entryCount,
      databaseId: api.label,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: (info: CloudStatusInfo) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStatusInfo());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setStatus(status: CloudSyncStatus, error?: string): void {
    this.status = status;
    this.errorMessage = error;
    if (status === 'synced') this.lastSyncedAt = new Date().toISOString();
    const info = this.getStatusInfo();
    this.listeners.forEach((cb) => cb(info));
  }

  // ---------- diffing
  private snapshotBase(): void {
    const s: any = dbService.getState();
    this.base = {};
    for (const col of RECORD_COLLECTIONS) {
      const m = new Map<string, string>();
      for (const r of s[col] || []) m.set(r.id, JSON.stringify(r));
      this.base[col] = m;
    }
    this.baseSettings = {};
    for (const [k, v] of Object.entries(s.settings || {})) this.baseSettings[k] = JSON.stringify(v);
  }

  private computeChanges(): Record<string, any> {
    const s: any = dbService.getState();
    const changes: Record<string, any> = {};
    for (const col of RECORD_COLLECTIONS) {
      const base = this.base[col] || new Map<string, string>();
      const seen = new Set<string>();
      const upsert: any[] = [];
      for (const r of s[col] || []) {
        seen.add(r.id);
        if (base.get(r.id) !== JSON.stringify(r)) upsert.push(r);
      }
      const del: string[] = [];
      base.forEach((_v, id) => {
        if (!seen.has(id)) del.push(id);
      });
      if (upsert.length || del.length) changes[col] = { upsert, delete: del };
    }
    const patch: Record<string, any> = {};
    for (const [k, v] of Object.entries(s.settings || {})) {
      if (this.baseSettings[k] !== JSON.stringify(v)) patch[k] = v;
    }
    if (Object.keys(patch).length) changes.settings = patch;
    return changes;
  }

  // ---------- push
  public schedulePush(delayMs: number = PUSH_DEBOUNCE_MS): void {
    if (!this.running) return;
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => void this.flush(), delayMs);
  }

  public hasPending(): boolean {
    return this.pushTimer !== null || this.pushing;
  }

  public async flush(): Promise<boolean> {
    this.pushTimer = null;
    if (this.pushing) {
      this.schedulePush(600);
      return false;
    }
    const changes = this.computeChanges();
    if (!Object.keys(changes).length) return true;
    this.pushing = true;
    this.setStatus('syncing');
    try {
      const res = await api.sync(changes);
      // The one-time PIN typed for a user is only ever sent to the server, never kept locally.
      const s: any = dbService.getState();
      for (const u of s.users || []) delete u.pin;
      // Update baseline for exactly what we sent.
      for (const [col, ch] of Object.entries<any>(changes)) {
        if (col === 'settings') {
          for (const [k, v] of Object.entries(ch)) this.baseSettings[k] = JSON.stringify(v);
          continue;
        }
        const m = this.base[col] || (this.base[col] = new Map());
        for (const r of ch.upsert) {
          const clean = col === 'users' ? { ...r } : r;
          if (col === 'users') delete clean.pin;
          m.set(r.id, JSON.stringify(clean));
        }
        for (const id of ch.delete) m.delete(id);
      }
      const othersWrote = res.previous !== this.version;
      this.version = res.version;
      this.setStatus('synced');
      if (othersWrote) await this.pull();
      return true;
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Sync failed';
      this.setStatus('error', msg);
      if (e instanceof ApiError && e.status >= 400 && e.status < 500 && e.status !== 401) {
        // The server rejected these changes (e.g. permission). Re-sync so the screen shows the truth.
        window.alert(`Change not saved: ${msg}`);
        await this.pull();
      } else if (!(e instanceof ApiError && e.status === 401)) {
        this.schedulePush(5000); // network problem: retry later
      }
      return false;
    } finally {
      this.pushing = false;
    }
  }

  // ---------- pull
  private async poll(): Promise<void> {
    if (!this.running || this.pushing || this.pushTimer) return;
    try {
      const { version } = await api.getVersion();
      if (version !== this.version) await this.pull();
      else if (this.status === 'error') this.setStatus('synced');
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) this.setStatus('error', 'Connection problem - retrying');
    }
  }

  public async pull(): Promise<boolean> {
    if (this.pushing || this.pushTimer) {
      await this.flush();
    }
    try {
      const { version, state } = await api.getState();
      dbService.hydrate(state);
      this.version = version;
      this.snapshotBase();
      this.setStatus('synced');
      return true;
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) this.setStatus('error', 'Could not load data from server');
      return false;
    }
  }

  // kept for the existing UI buttons
  public async pushToCloud(): Promise<boolean> {
    return this.flush();
  }
  public async pullFromCloud(): Promise<boolean> {
    return this.pull();
  }
}

export const cloudSyncService = new SyncService();

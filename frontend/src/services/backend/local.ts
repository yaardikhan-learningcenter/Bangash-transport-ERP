/**
 * LOCAL DEMO MODE - used when no Firebase keys are configured (firebase-config.js is empty).
 * Everything is stored in this browser's localStorage, so data is NOT shared between computers.
 * It exists so the site works on GitHub Pages out of the box and for trying the app out.
 */
import type { UserProfile } from '../../types';
import {
  ALL_KEYS, ApiError, Backend, MIN_PASSWORD, RECORD_COLLECTIONS, ServerState, SetupOptions, SyncResult,
  buildInitialState, cleanRecord, loadSeed, orderRecords, planUserChanges, publicUser, sanitize,
  validateBackup, validateSetup,
} from './common';

const DB_KEY = 'bangash_erp_local_db_v1';
const VER_KEY = 'bangash_erp_local_ver_v1';
const SESSION_KEY = 'bangash_erp_local_session_v1';

type StoredUser = UserProfile & { salt: string; hash: string };
interface LocalDB {
  settings: any;
  users: StoredUser[];
  [col: string]: any;
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for very old browsers / insecure contexts (demo mode only).
  let h = 2166136261;
  for (const b of data) h = Math.imul(h ^ b, 16777619) >>> 0;
  return `fnv-${h.toString(16)}`;
}

function newSalt(): string {
  const a = new Uint8Array(12);
  (globalThis.crypto || ({ getRandomValues: (x: Uint8Array) => x.map(() => Math.random() * 256) } as any)).getRandomValues(a);
  return Array.from(a).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class LocalBackend implements Backend {
  readonly mode = 'local' as const;
  readonly label = 'Local browser storage (demo mode)';
  private actor: UserProfile | null = null;
  private memo: { ver: string; db: LocalDB } | null = null;

  // ---------- storage helpers
  private readVer(): number {
    try {
      return Number(localStorage.getItem(VER_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  private load(): LocalDB | null {
    try {
      const ver = String(this.readVer());
      if (this.memo && this.memo.ver === ver) return this.memo.db;
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return null;
      const db = JSON.parse(raw) as LocalDB;
      this.memo = { ver, db };
      return db;
    } catch {
      return null;
    }
  }

  private save(db: LocalDB): number {
    const ver = this.readVer() + 1;
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      localStorage.setItem(VER_KEY, String(ver));
    } catch {
      throw new ApiError(500, 'Browser storage is full or blocked. Export a backup and clear old data.');
    }
    this.memo = { ver: String(ver), db };
    return ver;
  }

  private requireDb(): LocalDB {
    const db = this.load();
    if (!db) throw new ApiError(401, 'Please sign in again.');
    return db;
  }

  private publicState(db: LocalDB): ServerState {
    const st: ServerState = {};
    for (const k of RECORD_COLLECTIONS) st[k] = orderRecords(k, sanitize(db[k] || []));
    st.users = (db.users || []).map(publicUser);
    st.settings = sanitize(db.settings || {});
    return st;
  }

  private stamp(u: StoredUser): string {
    return u.hash.slice(-12);
  }

  private setSession(u: StoredUser | null): void {
    try {
      if (u) localStorage.setItem(SESSION_KEY, JSON.stringify({ id: u.id, ps: this.stamp(u) }));
      else localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }

  private async makeUser(profile: any, pin: string): Promise<StoredUser> {
    const salt = newSalt();
    return { ...publicUser(profile), salt, hash: await hashPin(pin, salt) } as StoredUser;
  }

  // ---------- Backend
  async init() {
    const db = this.load();
    return { needsSetup: !db || !(db.users || []).length };
  }

  async resume(): Promise<UserProfile | null> {
    const db = this.load();
    if (!db) return null;
    try {
      const s = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
      const u = s && db.users.find((x) => x.id === s.id);
      if (!u || (u.status || 'Active') !== 'Active' || this.stamp(u) !== s.ps) return null;
      this.actor = publicUser(u);
      return this.actor;
    } catch {
      return null;
    }
  }

  async setup(opts: SetupOptions): Promise<UserProfile> {
    validateSetup(opts);
    const seed = await loadSeed();
    const init = buildInitialState(seed, opts);
    const admin = await this.makeUser(init.admin, opts.password);
    const users: StoredUser[] = [admin];
    for (const u of init.sampleUsers) {
      const { pin, ...rest } = u;
      if (rest.username === admin.username) continue;
      users.push(await this.makeUser(rest, String(pin || '1234')));
    }
    const db: LocalDB = { settings: init.settings, users };
    for (const col of RECORD_COLLECTIONS) db[col] = init.records[col];
    this.save(db);
    this.setSession(admin);
    this.actor = publicUser(admin);
    return this.actor;
  }

  async login(username: string, password: string): Promise<UserProfile> {
    const db = this.requireDbOrNone();
    const uname = username.trim().toLowerCase();
    const u = db.users.find((x) => String(x.username).toLowerCase() === uname);
    if (!u || (await hashPin(password, u.salt)) !== u.hash) throw new ApiError(401, 'Incorrect username or PIN');
    if ((u.status || 'Active') !== 'Active') throw new ApiError(403, 'This account is disabled. Contact the administrator.');
    this.setSession(u);
    this.actor = publicUser(u);
    return this.actor;
  }

  private requireDbOrNone(): LocalDB {
    return this.load() || { settings: {}, users: [] };
  }

  async changePassword(password: string): Promise<void> {
    if (password.length < MIN_PASSWORD) throw new ApiError(400, `Password/PIN must be at least ${MIN_PASSWORD} characters`);
    const db = this.requireDb();
    const u = db.users.find((x) => x.id === this.actor?.id);
    if (!u) throw new ApiError(401, 'Please sign in again.');
    u.salt = newSalt();
    u.hash = await hashPin(password, u.salt);
    this.save(db);
    this.setSession(u);
  }

  async getState() {
    const db = this.requireDb();
    return { version: this.readVer(), state: this.publicState(db) };
  }

  async getVersion() {
    return { version: this.readVer() };
  }

  async sync(changes: Record<string, any>): Promise<SyncResult> {
    const db = this.requireDb();
    const actor = this.actor;
    if (!actor) throw new ApiError(401, 'Please sign in again.');
    const isAdmin = actor.role === 'Admin';
    const previous = this.readVer();
    let touched = false;

    for (const [col, change] of Object.entries<any>(changes)) {
      if (!ALL_KEYS.includes(col)) throw new ApiError(400, `Unknown collection '${col}'`);
      if ((col === 'users' || col === 'settings') && !isAdmin) {
        throw new ApiError(403, 'Only an Administrator can change users or company settings');
      }
      if (col === 'settings') {
        const patch = { ...sanitize(change) };
        delete patch.adminPin;
        db.settings = { ...(db.settings || {}), ...patch };
        touched = true;
        continue;
      }
      const ups = (change.upsert || []).map((r: any) => cleanRecord(col, r));
      const dels: string[] = (change.delete || []).filter((i: any) => typeof i === 'string');

      if (col === 'users') {
        const { plans, deletes } = planUserChanges(db.users, ups.map((r: any, i: number) => ({ ...r, pin: change.upsert[i].pin })), dels, actor);
        for (const p of plans) {
          const idx = db.users.findIndex((u) => u.id === p.rec.id);
          if (idx >= 0) {
            const cur = db.users[idx];
            const next: StoredUser = { ...cur, ...p.rec };
            if (p.pin) {
              next.salt = newSalt();
              next.hash = await hashPin(p.pin, next.salt);
            }
            db.users[idx] = next;
          } else {
            db.users.push(await this.makeUser(p.rec, p.pin as string));
          }
        }
        const gone = new Set(deletes.map((u) => u.id));
        db.users = db.users.filter((u) => !gone.has(u.id));
        touched = true;
        continue;
      }

      const bucket = new Map<string, any>((db[col] || []).map((r: any) => [r.id, r]));
      for (const r of ups) {
        if (col === 'auditLogs') r.user = actor.fullName || r.user || '';
        bucket.set(r.id, r);
      }
      for (const id of dels) bucket.delete(id);
      db[col] = Array.from(bucket.values());
      touched = true;
    }

    if (!touched) return { version: previous, previous };
    const version = this.save(db);
    // keep the signed-in user's session valid if their own PIN was edited
    const me = db.users.find((u) => u.id === actor.id);
    if (me) {
      this.setSession(me);
      this.actor = publicUser(me);
    }
    return { version, previous };
  }

  private replaceBusiness(db: LocalDB, st: any): number {
    for (const k of RECORD_COLLECTIONS) db[k] = (st[k] || []).map((r: any) => cleanRecord(k, r));
    const settings = { ...(st.settings || {}) };
    delete settings.adminPin;
    db.settings = settings;
    return this.save(db);
  }

  async restore(state: any) {
    if (this.actor?.role !== 'Admin') throw new ApiError(403, 'Administrator access required');
    validateBackup(state);
    return { version: this.replaceBusiness(this.requireDb(), state) };
  }

  async resetDemo() {
    if (this.actor?.role !== 'Admin') throw new ApiError(403, 'Administrator access required');
    const seed = await loadSeed();
    return { version: this.replaceBusiness(this.requireDb(), seed) };
  }

  async logout() {
    this.setSession(null);
    this.actor = null;
  }
}

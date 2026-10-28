/**
 * Shared types and rules for both storage backends (Firebase and local-browser demo mode).
 * These are the same business rules the old Python server enforced, now running in the browser.
 * (The real security boundary for Firebase mode is firestore.rules - never rely on browser code alone.)
 */
import type { UserProfile } from '../../types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export interface ServerState {
  [collection: string]: any;
}

export interface SyncResult {
  version: number;
  previous: number;
}

export interface SetupOptions {
  companyName: string;
  fullName: string;
  username: string;
  password: string;
  /** 'demo' = sample company data, 'empty' = a fresh company with categories + zero-balance accounts */
  data: 'demo' | 'empty';
  /** Local mode only: also add the six sample staff logins from the demo data. */
  sampleUsers?: boolean;
}

export interface Backend {
  readonly mode: 'firebase' | 'local';
  readonly label: string;
  /** Connects and reports whether the very first administrator still has to be created. */
  init(): Promise<{ needsSetup: boolean }>;
  /** Returns the signed-in user of a previous visit, if the session is still valid. */
  resume(): Promise<UserProfile | null>;
  setup(opts: SetupOptions): Promise<UserProfile>;
  login(username: string, password: string): Promise<UserProfile>;
  changePassword(password: string): Promise<void>;
  getState(): Promise<{ version: number; state: ServerState }>;
  getVersion(): Promise<{ version: number }>;
  sync(changes: Record<string, any>): Promise<SyncResult>;
  restore(state: any): Promise<{ version: number }>;
  resetDemo(): Promise<{ version: number }>;
  logout(): Promise<void>;
}

export const RECORD_COLLECTIONS = [
  'trips', 'vehicles', 'customers', 'drivers', 'expenseCategories', 'expenseVouchers',
  'invoices', 'pods', 'accounts', 'transactions', 'suppliers', 'purchases', 'auditLogs',
] as const;
export const ALL_KEYS: string[] = [...RECORD_COLLECTIONS, 'users', 'settings'];
export const ROLES = ['Admin', 'Operations', 'Accounts', 'Workshop'];
export const ID_RE = /^[A-Za-z0-9_-]{1,128}$/;
export const USERNAME_RE = /^[a-z0-9._-]{2,40}$/;
export const MIN_PASSWORD = 4;
export const USER_PUBLIC_FIELDS = [
  'id', 'username', 'fullName', 'role', 'title', 'email', 'department', 'avatarBg', 'permissions', 'status',
];

export function publicUser(u: any): UserProfile {
  const out: any = {};
  for (const k of USER_PUBLIC_FIELDS) if (k in u) out[k] = u[k];
  return out as UserProfile;
}

/** Deep copy that also drops `undefined` (Firestore rejects it) and detaches from app state. */
export function sanitize<T>(v: T): T {
  return JSON.parse(JSON.stringify(v));
}

export function cleanRecord(col: string, rec: any): any {
  if (!rec || typeof rec !== 'object' || typeof rec.id !== 'string' || !ID_RE.test(rec.id)) {
    throw new ApiError(400, `Invalid record in '${col}': every record needs a valid string id`);
  }
  return sanitize(rec);
}

/** Stable ordering so every user sees the same list (Firestore returns documents by id). */
export function orderRecords(col: string, arr: any[]): any[] {
  if (col === 'auditLogs') {
    return arr.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')) || String(b.id).localeCompare(String(a.id)));
  }
  return arr.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export function withTimeout<T>(p: Promise<T>, ms: number, onTimeout: () => Error): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(onTimeout()), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

// ------------------------------------------------------------------ seed data (JSON file)
export async function loadSeed(): Promise<any> {
  const url = new URL('data/seed_demo.json', document.baseURI).toString();
  let res: Response;
  try {
    res = await fetch(url, { cache: 'no-cache' });
  } catch {
    throw new ApiError(0, 'Could not load data/seed_demo.json. Check your connection.');
  }
  if (!res.ok) throw new ApiError(500, 'data/seed_demo.json is missing from the site.');
  return res.json();
}

export interface InitialState {
  records: Record<string, any[]>;
  settings: any;
  admin: UserProfile;
  sampleUsers: any[];
}

/** Builds the starting data for a new company from the seed JSON. */
export function buildInitialState(seed: any, opts: SetupOptions): InitialState {
  const demo = sanitize(seed);
  const records: Record<string, any[]> = {};
  for (const col of RECORD_COLLECTIONS) {
    if (opts.data === 'demo' || col === 'expenseCategories' || col === 'accounts') records[col] = demo[col] || [];
    else records[col] = [];
  }
  if (opts.data === 'empty') {
    for (const a of records.accounts) {
      a.openingBalance = 0;
      a.currentBalance = 0;
    }
  }
  const settings = { ...(demo.settings || {}) };
  delete settings.adminPin;
  if (opts.companyName.trim()) settings.companyName = opts.companyName.trim();
  const admin: UserProfile = {
    id: 'user-admin',
    username: opts.username.trim().toLowerCase(),
    fullName: opts.fullName.trim() || 'System Administrator',
    role: 'Admin',
    title: 'Administrator',
    email: '',
    department: 'Administration',
    avatarBg: 'bg-amber-600',
    permissions: ['all', 'admin', 'billing', 'fleet', 'workshop', 'expenses', 'reports'],
    status: 'Active',
  };
  const sampleUsers = opts.sampleUsers ? (demo.users || []) : [];
  return { records, settings, admin, sampleUsers };
}

export function validateSetup(o: SetupOptions): void {
  const uname = o.username.trim().toLowerCase();
  if (!USERNAME_RE.test(uname)) throw new ApiError(400, 'Username must be 2-40 characters (letters, numbers, . _ -)');
  if (!o.password || o.password.length < MIN_PASSWORD) throw new ApiError(400, `PIN / password must be at least ${MIN_PASSWORD} characters`);
}

// ------------------------------------------------------------------ user management rules
export interface PlannedUser {
  /** Public profile fields to store. */
  rec: any;
  /** New PIN typed by the admin (only ever used to create / reset the login, never stored). */
  pin?: string;
  /** The previously stored profile, if this is an edit. */
  old?: any;
}

/**
 * Validates user edits made by an Administrator (same rules as the old server):
 * valid role + username, unique username, PIN length, at least one active Admin must remain.
 */
export function planUserChanges(
  existingList: any[],
  ups: any[],
  dels: string[],
  actor: { id: string },
): { plans: PlannedUser[]; deletes: any[] } {
  const existing = new Map<string, any>(existingList.map((u) => [u.id, u]));
  const taken = new Map<string, string>(existingList.map((u) => [String(u.username || '').toLowerCase(), u.id]));
  const plans: PlannedUser[] = [];

  for (const r of ups) {
    const old = existing.get(r.id);
    const rec: any = {};
    for (const k of USER_PUBLIC_FIELDS) if (k in r) rec[k] = r[k];
    if ('role' in rec && !ROLES.includes(rec.role)) throw new ApiError(400, 'Invalid role');
    const uname = String(rec.username || old?.username || '').trim().toLowerCase();
    if (!USERNAME_RE.test(uname)) throw new ApiError(400, 'Username must be 2-40 characters (letters, numbers, . _ -)');
    if ((taken.get(uname) ?? r.id) !== r.id) throw new ApiError(400, `Username '${uname}' is already taken`);
    rec.username = uname;
    const pin = r.pin ? String(r.pin) : undefined;
    if (pin && pin.length < MIN_PASSWORD) throw new ApiError(400, `PIN must be at least ${MIN_PASSWORD} characters`);
    let merged: any;
    if (old) {
      merged = { ...publicUser(old), ...rec };
    } else {
      if (!pin) throw new ApiError(400, `A PIN of at least ${MIN_PASSWORD} characters is required for new users`);
      merged = { status: 'Active', permissions: [], ...rec };
    }
    taken.set(uname, r.id);
    plans.push({ rec: sanitize(merged), pin, old });
  }

  const after = new Map(existing);
  for (const p of plans) after.set(p.rec.id, p.rec);
  const deletes: any[] = [];
  for (const id of dels) {
    if (id === actor.id) throw new ApiError(400, 'You cannot delete your own account');
    const u = existing.get(id);
    if (u) deletes.push(u);
    after.delete(id);
  }
  const hasAdmin = Array.from(after.values()).some((u) => u.role === 'Admin' && (u.status || 'Active') === 'Active');
  if (!hasAdmin) throw new ApiError(400, 'At least one active Administrator account must remain');
  return { plans, deletes };
}

/** Basic structural check of a backup file before restoring it. */
export function validateBackup(st: any): void {
  const required = ['trips', 'customers', 'vehicles', 'accounts'];
  if (!st || typeof st !== 'object' || !required.every((k) => Array.isArray(st[k]))) {
    throw new ApiError(400, 'Invalid backup file');
  }
}

/**
 * FIREBASE MODE - Firebase Authentication + Cloud Firestore, called straight from the browser
 * (no server needed, so it works on GitHub Pages). Security is enforced by firestore.rules.
 *
 * Data layout in Firestore:
 *   erp_<collection>/<id>   one document per business record (erp_trips, erp_invoices, ...)
 *   erp_users/<userId>      staff profile (no secrets)
 *   erp_settings/main       company settings
 *   erp_roles/<authUid>     { userId, role, status, username } - what the security rules check
 *   erp_login/<username>    { email, uid, gen, userId } - maps a username to its Firebase sign-in email
 *   erp_public/status       { initialized: true } - exists once the first admin has been created
 *
 * Staff sign in with username + PIN. Firebase Auth needs an email + 6-char password, so we use
 * a synthetic email (username.gN@staff.example.com) and password "Bte#" + PIN.
 */
import type { UserProfile } from '../../types';
import {
  ALL_KEYS, ApiError, Backend, MIN_PASSWORD, RECORD_COLLECTIONS, ServerState, SetupOptions, SyncResult,
  buildInitialState, cleanRecord, loadSeed, orderRecords, planUserChanges, publicUser, sanitize,
  validateBackup, validateSetup, withTimeout,
} from './common';

const P = 'erp_';
const EMAIL_DOMAIN = 'staff.example.com';
const WRITE_TIMEOUT_MS = 20000;

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain?: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const derivePassword = (pin: string) => `Bte#${pin}`;
const emailFor = (username: string, gen: number) => `${username}.g${gen}@${EMAIL_DOMAIN}`;

function mapError(e: any): ApiError {
  if (e instanceof ApiError) return e;
  const code: string = e?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
    case 'auth/invalid-email':
      return new ApiError(401, 'Incorrect username or PIN');
    case 'auth/too-many-requests':
      return new ApiError(429, 'Too many failed attempts. Try again in a few minutes.');
    case 'auth/user-disabled':
      return new ApiError(403, 'This account is disabled. Contact the administrator.');
    case 'auth/network-request-failed':
    case 'unavailable':
    case 'firestore/unavailable':
      return new ApiError(0, 'Cannot reach Firebase. Check your connection.');
    case 'auth/operation-not-allowed':
    case 'auth/admin-restricted-operation':
      return new ApiError(500, 'Email/Password sign-in is not enabled. In Firebase Console: Authentication > Sign-in method > Email/Password > Enable.');
    case 'auth/requires-recent-login':
      return new ApiError(400, 'For security, sign out and sign in again, then repeat this change.');
    case 'auth/weak-password':
      return new ApiError(400, 'PIN is too weak.');
    case 'auth/email-already-in-use':
      return new ApiError(409, 'That sign-in already exists.');
    case 'permission-denied':
    case 'firestore/permission-denied':
      return new ApiError(403, 'Permission denied by Firestore rules. (Have the rules from firestore.rules been published, and does your account have access?)');
    case 'invalid-argument':
    case 'resource-exhausted':
      return new ApiError(400, `Firestore rejected this data (${code}): ${e?.message || ''} - a very large logo/image can cause this.`);
    default:
      return new ApiError(500, e?.message || 'Unexpected Firebase error');
  }
}

type Op = { kind: 'set' | 'merge' | 'del'; ref: any; data?: any };

export class FirebaseBackend implements Backend {
  readonly mode = 'firebase' as const;
  readonly label: string;
  private cfg: FirebaseWebConfig;
  private A: any; // firebase/auth module
  private F: any; // firebase/firestore module
  private app: any;
  private auth: any;
  private db: any;
  private secondary: any;

  private actor: UserProfile | null = null;
  private version = 1;
  private listening: Promise<void> | null = null;
  private unsubs: Array<() => void> = [];
  private mirror: Record<string, Map<string, any>> = {};
  private settings: any = {};
  private settingsJson = '';

  constructor(cfg: FirebaseWebConfig) {
    this.cfg = cfg;
    this.label = `Firebase Cloud Firestore (${cfg.projectId})`;
  }

  private col(name: string) {
    return this.F.collection(this.db, P + name);
  }
  private ref(name: string, id: string) {
    return this.F.doc(this.db, P + name, id);
  }

  // ---------- connect
  async init() {
    const [{ initializeApp, getApps }, A, F] = await Promise.all([
      import('firebase/app'), import('firebase/auth'), import('firebase/firestore'),
    ]);
    this.A = A;
    this.F = F;
    this.app = getApps().find((a) => a.name === '[DEFAULT]') || initializeApp(this.cfg);
    this.auth = A.getAuth(this.app);
    try {
      this.db = F.initializeFirestore(this.app, {
        localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }),
      });
    } catch {
      this.db = F.getFirestore(this.app);
    }
    try {
      const snap = await withTimeout(F.getDoc(this.ref('public', 'status')), 15000, () => new ApiError(0, 'Cannot reach Firebase. Check your connection and firebase-config.js.'));
      return { needsSetup: !snap.exists() };
    } catch (e) {
      throw mapError(e);
    }
  }

  private async loadProfile(): Promise<UserProfile> {
    const u = this.auth.currentUser;
    if (!u) throw new ApiError(401, 'Please sign in.');
    try {
      const roleSnap = await this.F.getDoc(this.ref('roles', u.uid));
      if (!roleSnap.exists()) throw new ApiError(403, 'This account has no access. Contact the administrator.');
      const role = roleSnap.data();
      if ((role.status || 'Active') !== 'Active') throw new ApiError(403, 'This account is disabled. Contact the administrator.');
      const pSnap = await this.F.getDoc(this.ref('users', role.userId));
      if (pSnap.exists()) return publicUser(pSnap.data());
      if (role.role === 'Admin') {
        // self-heal an interrupted first-time setup
        const profile = {
          id: role.userId, username: role.username, fullName: 'System Administrator', role: 'Admin', title: 'Administrator',
          email: '', department: 'Administration', avatarBg: 'bg-amber-600', permissions: ['all', 'admin', 'billing', 'fleet'], status: 'Active',
        };
        await this.F.setDoc(this.ref('users', role.userId), profile);
        return profile as UserProfile;
      }
      throw new ApiError(403, 'Your staff profile is missing. Contact the administrator.');
    } catch (e) {
      throw mapError(e);
    }
  }

  async resume(): Promise<UserProfile | null> {
    await this.auth.authStateReady();
    if (!this.auth.currentUser) return null;
    try {
      this.actor = await this.loadProfile();
      return this.actor;
    } catch {
      await this.A.signOut(this.auth).catch(() => {});
      return null;
    }
  }

  async login(username: string, password: string): Promise<UserProfile> {
    const uname = username.trim().toLowerCase();
    if (!uname || !password) throw new ApiError(401, 'Incorrect username or PIN');
    // When switching users, refuse a disabled account before touching the current session.
    const known = this.mirror.users ? Array.from(this.mirror.users.values()).find((u) => String(u.username).toLowerCase() === uname) : null;
    if (known && (known.status || 'Active') !== 'Active') throw new ApiError(403, 'This account is disabled. Contact the administrator.');
    try {
      const snap = await this.F.getDoc(this.ref('login', uname));
      if (!snap.exists()) throw new ApiError(401, 'Incorrect username or PIN');
      await this.A.signInWithEmailAndPassword(this.auth, snap.data().email, derivePassword(password));
    } catch (e) {
      throw mapError(e);
    }
    try {
      this.actor = await this.loadProfile();
    } catch (e) {
      await this.A.signOut(this.auth).catch(() => {});
      throw e;
    }
    return this.actor;
  }

  async logout(): Promise<void> {
    this.stopListening();
    this.actor = null;
    await this.A.signOut(this.auth).catch(() => {});
  }

  async changePassword(password: string): Promise<void> {
    if (password.length < MIN_PASSWORD) throw new ApiError(400, `Password/PIN must be at least ${MIN_PASSWORD} characters`);
    try {
      await this.A.updatePassword(this.auth.currentUser, derivePassword(password));
    } catch (e) {
      throw mapError(e);
    }
  }

  // ---------- first-time setup
  async setup(opts: SetupOptions): Promise<UserProfile> {
    validateSetup(opts);
    const seed = await loadSeed();
    const init = buildInitialState(seed, opts);
    const username = init.admin.username;
    const email = emailFor(username, 0);
    let uid: string;
    try {
      const cred = await this.A.createUserWithEmailAndPassword(this.auth, email, derivePassword(opts.password));
      uid = cred.user.uid;
    } catch (e: any) {
      if (e?.code === 'auth/email-already-in-use') {
        throw new ApiError(409, 'A previous setup attempt already created this username in Firebase Authentication. Delete that user in Firebase Console > Authentication, or choose another username.');
      }
      throw mapError(e);
    }
    try {
      // Phase 1 (atomic): claim the admin role. The rules only allow this while erp_public/status does not exist.
      const b = this.F.writeBatch(this.db);
      b.set(this.ref('roles', uid), { userId: init.admin.id, role: 'Admin', status: 'Active', username });
      b.set(this.ref('login', username), { email, uid, gen: 0, userId: init.admin.id });
      b.set(this.ref('public', 'status'), { initialized: true, createdAt: new Date().toISOString() });
      await withTimeout(b.commit(), WRITE_TIMEOUT_MS, () => new ApiError(0, 'Cannot reach Firebase.'));
    } catch (e: any) {
      await this.A.signOut(this.auth).catch(() => {});
      if (e?.code === 'permission-denied') {
        throw new ApiError(403, 'Setup was refused by the Firestore rules. Either setup was already completed (reload and sign in) or the rules from firestore.rules have not been published yet.');
      }
      throw mapError(e);
    }
    // Phase 2: profile, settings and starting data (now we are a normal admin).
    const ops: Op[] = [
      { kind: 'set', ref: this.ref('users', init.admin.id), data: sanitize(init.admin) },
      { kind: 'set', ref: this.ref('settings', 'main'), data: sanitize(init.settings) },
    ];
    for (const col of RECORD_COLLECTIONS) for (const r of init.records[col]) ops.push({ kind: 'set', ref: this.ref(col, r.id), data: sanitize(r) });
    try {
      await this.commit(ops);
    } catch (e) {
      throw mapError(e);
    }
    this.actor = init.admin;
    return init.admin;
  }

  // ---------- live mirror of Firestore
  private stopListening() {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    this.listening = null;
    this.mirror = {};
  }

  private onListenError = (err: any) => {
    const detail = err?.code === 'permission-denied' ? 'Your access has changed. Please sign in again.' : '';
    if (err?.code === 'permission-denied') {
      this.stopListening();
      window.dispatchEvent(new CustomEvent('erp-auth-expired', { detail }));
    }
  };

  private listen(target: any, apply: (snap: any, ready: boolean) => boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      let ready = false;
      const done = () => {
        if (!ready) {
          ready = true;
          resolve();
        }
      };
      const timer = setTimeout(done, 8000); // offline with no cache: continue with what we have
      const unsub = this.F.onSnapshot(
        target,
        { includeMetadataChanges: true },
        (snap: any) => {
          const wasReady = ready;
          const remoteChange = apply(snap, wasReady);
          if (!snap.metadata.fromCache) {
            clearTimeout(timer);
            done();
          }
          if (wasReady && remoteChange) this.version++;
        },
        (err: any) => {
          clearTimeout(timer);
          done();
          this.onListenError(err);
        },
      );
      this.unsubs.push(unsub);
    });
  }

  private ensureListening(): Promise<void> {
    if (this.listening) return this.listening;
    const names = [...RECORD_COLLECTIONS, 'users'] as string[];
    const jobs = names.map((name) => {
      const map = (this.mirror[name] = new Map<string, any>());
      return this.listen(this.col(name), (snap) => {
        let remote = false;
        for (const ch of snap.docChanges()) {
          if (ch.type === 'removed') map.delete(ch.doc.id);
          else map.set(ch.doc.id, { id: ch.doc.id, ...ch.doc.data() });
          if (!ch.doc.metadata.hasPendingWrites) remote = true;
        }
        return remote;
      });
    });
    jobs.push(
      this.listen(this.ref('settings', 'main'), (snap) => {
        const data = snap.exists() ? snap.data() : {};
        const json = JSON.stringify(data);
        const changed = json !== this.settingsJson;
        this.settings = data;
        this.settingsJson = json;
        return changed && !snap.metadata.hasPendingWrites;
      }),
    );
    this.listening = Promise.all(jobs).then(() => undefined);
    return this.listening;
  }

  async getState(): Promise<{ version: number; state: ServerState }> {
    await this.ensureListening();
    const state: ServerState = {};
    for (const name of [...RECORD_COLLECTIONS, 'users'] as string[]) {
      const arr = Array.from(this.mirror[name]?.values() || []).map((r) => sanitize(r));
      state[name] = orderRecords(name, name === 'users' ? arr.map(publicUser) : arr);
    }
    state.settings = sanitize(this.settings || {});
    return { version: this.version, state };
  }

  async getVersion() {
    return { version: this.version };
  }

  // ---------- writes
  private async commit(ops: Op[]): Promise<void> {
    for (let i = 0; i < ops.length; i += 400) {
      const b = this.F.writeBatch(this.db);
      for (const op of ops.slice(i, i + 400)) {
        if (op.kind === 'set') b.set(op.ref, op.data);
        else if (op.kind === 'merge') b.set(op.ref, op.data, { merge: true });
        else b.delete(op.ref);
      }
      await withTimeout(b.commit(), WRITE_TIMEOUT_MS, () => new ApiError(0, 'Cannot reach Firebase. Changes will retry automatically.'));
    }
  }

  private async getLogin(username: string): Promise<any | null> {
    const s = await this.F.getDoc(this.ref('login', username));
    return s.exists() ? s.data() : null;
  }

  /** Creates a Firebase Auth account without signing the administrator out (uses a second app instance). */
  private async createAuthAccount(username: string, startGen: number, pin: string): Promise<{ uid: string; email: string; gen: number }> {
    if (!this.secondary) {
      const { initializeApp } = await import('firebase/app');
      this.secondary = initializeApp(this.cfg, 'secondary');
    }
    const auth2 = this.A.getAuth(this.secondary);
    try {
      for (let gen = startGen; gen < startGen + 25; gen++) {
        const email = emailFor(username, gen);
        try {
          const cred = await this.A.createUserWithEmailAndPassword(auth2, email, derivePassword(pin));
          return { uid: cred.user.uid, email, gen };
        } catch (e: any) {
          if (e?.code !== 'auth/email-already-in-use') throw e;
        }
      }
      throw new ApiError(500, 'Could not create a sign-in for this user.');
    } finally {
      await this.A.signOut(auth2).catch(() => {});
    }
  }

  private async userOps(change: any, actor: UserProfile): Promise<Op[]> {
    const existing = Array.from(this.mirror.users?.values() || []);
    const upsRaw = change.upsert || [];
    const ups = upsRaw.map((r: any) => ({ ...cleanRecord('users', r), pin: r.pin }));
    const dels: string[] = (change.delete || []).filter((i: any) => typeof i === 'string');
    const { plans, deletes } = planUserChanges(existing, ups, dels, actor);
    const ops: Op[] = [];

    for (const p of plans) {
      const { rec, pin, old } = p;
      let login = old ? await this.getLogin(old.username) : null;
      if (!old) {
        login = await this.createAuthAccount(rec.username, 0, pin as string);
      } else if (pin && old.id === actor.id) {
        try {
          await this.A.updatePassword(this.auth.currentUser, derivePassword(pin));
        } catch (e) {
          throw mapError(e);
        }
      } else if (pin) {
        const fresh = await this.createAuthAccount(rec.username, (login?.gen ?? -1) + 1, pin);
        if (login?.uid) ops.push({ kind: 'del', ref: this.ref('roles', login.uid) });
        login = fresh;
      } else if (!login) {
        throw new ApiError(400, `${rec.fullName || rec.username} has no sign-in yet. Enter a PIN to create it.`);
      }
      ops.push({ kind: 'set', ref: this.ref('users', rec.id), data: rec });
      ops.push({ kind: 'set', ref: this.ref('roles', login.uid), data: { userId: rec.id, role: rec.role, status: rec.status || 'Active', username: rec.username } });
      ops.push({ kind: 'set', ref: this.ref('login', rec.username), data: { email: login.email, uid: login.uid, gen: login.gen, userId: rec.id } });
      if (old && old.username !== rec.username) ops.push({ kind: 'del', ref: this.ref('login', old.username) });
    }
    for (const u of deletes) {
      const login = await this.getLogin(u.username);
      ops.push({ kind: 'del', ref: this.ref('users', u.id) });
      if (login?.uid) ops.push({ kind: 'del', ref: this.ref('roles', login.uid) });
      ops.push({ kind: 'del', ref: this.ref('login', u.username) });
    }
    return ops;
  }

  async sync(changes: Record<string, any>): Promise<SyncResult> {
    const actor = this.actor;
    if (!actor || !this.auth.currentUser) throw new ApiError(401, 'Please sign in again.');
    const isAdmin = actor.role === 'Admin';
    const ops: Op[] = [];
    try {
      for (const [col, change] of Object.entries<any>(changes)) {
        if (!ALL_KEYS.includes(col)) throw new ApiError(400, `Unknown collection '${col}'`);
        if ((col === 'users' || col === 'settings') && !isAdmin) {
          throw new ApiError(403, 'Only an Administrator can change users or company settings');
        }
        if (col === 'settings') {
          const patch = sanitize(change) as any;
          delete patch.adminPin;
          ops.push({ kind: 'merge', ref: this.ref('settings', 'main'), data: patch });
        } else if (col === 'users') {
          ops.push(...(await this.userOps(change, actor)));
        } else {
          for (const r of change.upsert || []) {
            const rec = cleanRecord(col, r);
            if (col === 'auditLogs') rec.user = actor.fullName || rec.user || '';
            if (JSON.stringify(rec).length > 900000) throw new ApiError(400, `A record in '${col}' is too large for Firestore (1 MB limit).`);
            ops.push({ kind: 'set', ref: this.ref(col, rec.id), data: rec });
          }
          for (const id of change.delete || []) if (typeof id === 'string') ops.push({ kind: 'del', ref: this.ref(col, id) });
        }
      }
      if (!ops.length) return { version: this.version, previous: this.version };
      const previous = this.version;
      await this.commit(ops);
      return { version: this.version, previous };
    } catch (e) {
      throw mapError(e);
    }
  }

  private async replaceBusiness(st: any): Promise<number> {
    const ops: Op[] = [];
    for (const col of RECORD_COLLECTIONS) {
      const fresh = (st[col] || []).map((r: any) => cleanRecord(col, r));
      const keep = new Set<string>(fresh.map((r: any) => r.id));
      for (const id of this.mirror[col]?.keys() || []) if (!keep.has(id)) ops.push({ kind: 'del', ref: this.ref(col, id) });
      for (const r of fresh) ops.push({ kind: 'set', ref: this.ref(col, r.id), data: r });
    }
    const settings = sanitize(st.settings || {}) as any;
    delete settings.adminPin;
    ops.push({ kind: 'set', ref: this.ref('settings', 'main'), data: settings });
    await this.commit(ops);
    this.version++; // makes the sync loop re-read everything
    return this.version;
  }

  async restore(state: any) {
    if (this.actor?.role !== 'Admin') throw new ApiError(403, 'Administrator access required');
    validateBackup(state);
    await this.ensureListening();
    try {
      return { version: await this.replaceBusiness(state) };
    } catch (e) {
      throw mapError(e);
    }
  }

  async resetDemo() {
    if (this.actor?.role !== 'Admin') throw new ApiError(403, 'Administrator access required');
    const seed = await loadSeed();
    await this.ensureListening();
    try {
      return { version: await this.replaceBusiness(seed) };
    } catch (e) {
      throw mapError(e);
    }
  }
}

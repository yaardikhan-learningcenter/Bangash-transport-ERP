/**
 * Storage facade used by the whole app. Picks a backend at start-up:
 *   - Firebase (Auth + Firestore) when firebase-config.js contains real keys
 *   - Local browser storage (demo mode) otherwise
 * Same method names as the old Python-server client, so the screens did not need to change.
 */
import type { UserProfile } from '../types';
import { ApiError, Backend, ServerState, SetupOptions } from './backend/common';
import { LocalBackend } from './backend/local';
import { FirebaseBackend, FirebaseWebConfig } from './backend/firebase';

export { ApiError };
export type { ServerState, SetupOptions };

declare global {
  interface Window {
    BANGASH_FIREBASE?: Partial<FirebaseWebConfig>;
  }
}

function readConfig(): FirebaseWebConfig | null {
  const c = window.BANGASH_FIREBASE;
  if (!c || !c.apiKey || !c.projectId || /YOUR_|PASTE_/i.test(`${c.apiKey}${c.projectId}`)) return null;
  return c as FirebaseWebConfig;
}

const cfg = readConfig();
const backend: Backend = cfg ? new FirebaseBackend(cfg) : new LocalBackend();

export const api = {
  mode: backend.mode,
  label: backend.label,
  init: () => backend.init(),
  resume: () => backend.resume(),
  setup: (o: SetupOptions): Promise<UserProfile> => backend.setup(o),
  login: (username: string, password: string): Promise<UserProfile> => backend.login(username, password),
  getState: () => backend.getState(),
  getVersion: () => backend.getVersion(),
  sync: (changes: Record<string, unknown>) => backend.sync(changes),
  changePassword: (password: string) => backend.changePassword(password),
  restore: (state: unknown) => backend.restore(state),
  resetDemo: () => backend.resetDemo(),
  logout(): void {
    void backend.logout().finally(() => window.dispatchEvent(new CustomEvent('erp-auth-expired', { detail: '' })));
  },
};

import React, { useCallback, useEffect, useState } from 'react';
import App from './App';
import { LoginScreen } from './components/LoginScreen';
import { SetupScreen } from './components/SetupScreen';
import { api, SetupOptions } from './services/api';
import { dbService } from './services/db';
import { cloudSyncService } from './services/cloudSync';

type Phase = 'booting' | 'setup' | 'login' | 'ready' | 'fatal';

export default function Root() {
  const [phase, setPhase] = useState<Phase>('booting');
  const [notice, setNotice] = useState<string | null>(null);
  const [fatal, setFatal] = useState<string>('');

  const loadData = useCallback(async (userId: string) => {
    const { version, state } = await api.getState();
    dbService.hydrate(state, userId);
    cloudSyncService.start(version);
    setPhase('ready');
  }, []);

  // Connect (Firebase or local), then resume an existing session if there is one
  useEffect(() => {
    (async () => {
      try {
        const { needsSetup } = await api.init();
        if (needsSetup) {
          setPhase('setup');
          return;
        }
        const user = await api.resume();
        if (user) await loadData(user.id);
        else setPhase('login');
      } catch (e: any) {
        setFatal(e?.message || 'Could not start the app');
        setPhase('fatal');
      }
    })();
  }, [loadData]);

  // Session ended (signed out, disabled, access changed or password changed)
  useEffect(() => {
    const onExpired = (e: Event) => {
      cloudSyncService.stop();
      setNotice((e as CustomEvent).detail || null);
      setPhase('login');
    };
    window.addEventListener('erp-auth-expired', onExpired);
    return () => window.removeEventListener('erp-auth-expired', onExpired);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const user = await api.login(username, password);
    setNotice(null);
    await loadData(user.id);
  };

  const handleSetup = async (opts: SetupOptions) => {
    const user = await api.setup(opts);
    await loadData(user.id);
  };

  if (phase === 'booting') {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 text-sm font-semibold">Loading…</div>;
  }
  if (phase === 'fatal') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-2xl p-6 space-y-3">
          <h1 className="font-black text-slate-900">Cannot start Bangash Transport ERP</h1>
          <p className="text-sm text-rose-700 font-semibold break-words">{fatal}</p>
          <p className="text-xs text-slate-500">Check <code>firebase-config.js</code>, that Firestore is created, and that the rules in <code>firestore.rules</code> are published.</p>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg cursor-pointer">Retry</button>
        </div>
      </div>
    );
  }
  if (phase === 'setup') return <SetupScreen onSetup={handleSetup} />;
  if (phase === 'login') return <LoginScreen onLogin={handleLogin} notice={notice} />;
  return <App />;
}

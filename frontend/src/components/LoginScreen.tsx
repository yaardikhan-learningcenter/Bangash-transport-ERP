import React, { useState } from 'react';
import { LogIn, Lock, User, AlertTriangle } from 'lucide-react';
import DEFAULT_LOGO from '../logo';
import { api } from '../services/api';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  notice?: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, notice }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onLogin(username.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Sign in failed');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-slate-950 text-white p-6 text-center space-y-3">
          <img src={DEFAULT_LOGO} alt="Bangash Transport Co." className="w-20 h-20 mx-auto rounded-xl bg-white p-1 object-contain" />
          <div>
            <h1 className="text-lg font-black tracking-wide">BANGASH TRANSPORT CO.</h1>
            <p className="text-[11px] font-bold text-amber-400 tracking-wider">GOODS FORWARDING ERP</p>
          </div>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="text-sm font-extrabold text-slate-900">Staff Sign In</div>
          {notice && !error && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-semibold rounded-lg">{notice}</div>
          )}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <label className="block">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Username</span>
            <div className="mt-1 relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                autoCapitalize="none"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. tariq.khan"
                required
              />
            </div>
          </label>
          <label className="block">
            <span className="text-[11px] font-bold text-slate-600 uppercase">PIN / Password</span>
            <div className="mt-1 relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{busy ? 'Signing in…' : 'Sign In'}</span>
          </button>
          <p className="text-[11px] text-slate-500 text-center">Accounts are created by your Administrator.</p>
          <p className={`text-[10px] text-center font-semibold ${api.mode === 'firebase' ? 'text-emerald-600' : 'text-amber-600'}`}>
            {api.mode === 'firebase' ? `● ${api.label}` : '● Demo mode - data stays in this browser only'}
          </p>
        </form>
      </div>
    </div>
  );
};

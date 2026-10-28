import React, { useState } from 'react';
import { AlertTriangle, Rocket } from 'lucide-react';
import DEFAULT_LOGO from '../logo';
import { api, SetupOptions } from '../services/api';

export const SetupScreen: React.FC<{ onSetup: (o: SetupOptions) => Promise<void> }> = ({ onSetup }) => {
  const [companyName, setCompanyName] = useState('Bangash Transport Co.');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [data, setData] = useState<'demo' | 'empty'>('empty');
  const [sampleUsers, setSampleUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (pin !== pin2) return setError('The two PIN / password entries do not match.');
    setBusy(true);
    try {
      await onSetup({ companyName, fullName, username, password: pin, data, sampleUsers: api.mode === 'local' && sampleUsers });
    } catch (err: any) {
      setError(err?.message || 'Setup failed');
      setBusy(false);
    }
  };

  const input = 'mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500';
  const lbl = 'text-[11px] font-bold text-slate-600 uppercase';

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div className="bg-slate-950 text-white p-5 text-center space-y-2">
          <img src={DEFAULT_LOGO} alt="" className="w-16 h-16 mx-auto rounded-xl bg-white p-1 object-contain" />
          <h1 className="text-lg font-black tracking-wide">FIRST-TIME SETUP</h1>
          <p className="text-[11px] font-bold text-amber-400 tracking-wider">CREATE THE ADMINISTRATOR ACCOUNT</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-3">
          <div className={`p-2.5 text-xs font-semibold rounded-lg border ${api.mode === 'firebase' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-amber-50 border-amber-300 text-amber-800'}`}>
            {api.mode === 'firebase'
              ? `Connected to ${api.label}. The first account created here becomes the Administrator - do this right after deploying.`
              : 'Demo mode: no Firebase keys found, so data is saved only in this browser. Add your keys to firebase-config.js to share data between users and computers.'}
          </div>
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <label className="block"><span className={lbl}>Company name</span>
            <input className={input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} required /></label>
          <label className="block"><span className={lbl}>Your full name</span>
            <input className={input} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Malik Bangash" required /></label>
          <label className="block"><span className={lbl}>Admin username</span>
            <input className={input} value={username} autoCapitalize="none" onChange={(e) => setUsername(e.target.value)} placeholder="e.g. admin" required /></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className={lbl}>PIN / password</span>
              <input type="password" className={input} value={pin} onChange={(e) => setPin(e.target.value)} minLength={4} required /></label>
            <label className="block"><span className={lbl}>Repeat</span>
              <input type="password" className={input} value={pin2} onChange={(e) => setPin2(e.target.value)} minLength={4} required /></label>
          </div>
          <div className="space-y-1.5 pt-1">
            <span className={lbl}>Starting data</span>
            <label className="flex items-start gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
              <input type="radio" checked={data === 'empty'} onChange={() => setData('empty')} className="mt-1" />
              <span>Empty company <span className="block text-[11px] font-medium text-slate-500">Expense categories + zero-balance accounts only</span></span>
            </label>
            <label className="flex items-start gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
              <input type="radio" checked={data === 'demo'} onChange={() => setData('demo')} className="mt-1" />
              <span>Sample company data <span className="block text-[11px] font-medium text-slate-500">Trips, vehicles, invoices etc. to explore the system</span></span>
            </label>
            {api.mode === 'local' && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input type="checkbox" checked={sampleUsers} onChange={(e) => setSampleUsers(e.target.checked)} />
                Also add sample staff logins (malik.bangash / 1234, tariq.khan / 2222 ...)
              </label>
            )}
          </div>
          <button type="submit" disabled={busy} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 cursor-pointer">
            <Rocket className="w-4 h-4" /><span>{busy ? 'Setting up…' : 'Create account & start'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

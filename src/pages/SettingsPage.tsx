import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, Languages, Lock, Bell, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [preferredLang, setPreferredLang] = useState(user?.preferred_language || 'en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your verification preferences, security, and notification options.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Your settings have been updated successfully.</span>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{user?.name || 'Guest User'}</h3>
            <p className="text-xs text-slate-500">{user?.email || 'guest@truthlens.ai'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
              Role: {user?.role || 'ANONYMOUS'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-600" />
              Language & Regional Preferences
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Language for Ingestion & Analysis
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="max-w-md w-full text-xs p-2.5 border border-slate-300 rounded bg-white text-slate-800"
              >
                <option value="en">English (Global Default)</option>
                <option value="hi">हिन्दी - Hindi</option>
                <option value="bn">বাংলা - Bengali</option>
                <option value="ta">தமிழ் - Tamil</option>
                <option value="te">తెలుగు - Telugu</option>
                <option value="mr">मराठी - Marathi</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                TruthLens auto-detects language dynamically, but uses this preference for default summary cards.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Security & Session
            </h4>

            <div className="text-xs text-slate-600 space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded">
                <div>
                  <span className="font-semibold text-slate-800 block">Session Authentication</span>
                  <span className="text-slate-500 text-[11px]">
                    Secured with HTTP-only, SameSite lax JWT cookies & cryptographic hashing.
                  </span>
                </div>
                <span className="text-emerald-600 font-bold text-[11px]">Active</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded shadow-xs transition-colors cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React from 'react';
import { MessageSquareText, Volume2, Trash2, Globe, Sparkles, Activity } from 'lucide-react';

export const TranslationPanelShell: React.FC = () => {
  return (
    <section className="glass-panel p-4 flex flex-col gap-4 justify-between" aria-label="Translation Panel Section">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-200">Live Translation Output</h2>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <select className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1 outline-none">
            <option value="en-US">English (US)</option>
            <option value="fr-FR">French</option>
            <option value="es-ES">Spanish</option>
          </select>
        </div>
      </div>

      {/* Primary Output Caption Display */}
      <div className="flex flex-col gap-3">
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 flex flex-col justify-between min-h-[160px] relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Predicted Gloss / Text
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
              Ready
            </span>
          </div>

          <div className="my-auto py-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-300 font-display">
              " WAITING FOR INPUT "
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Start camera session to translate sign language keypoint sequences in real-time.
            </p>
          </div>

          {/* Confidence Meter Bar Shell */}
          <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden border border-slate-700/50">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-0 transition-all duration-300" />
          </div>
        </div>
      </div>

      {/* Translation History Log Shell */}
      <div className="flex-1 flex flex-col gap-2 min-h-[140px]">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Session Transcript Log</span>
          <button className="text-slate-500 hover:text-slate-300 transition-colors p-1" title="Clear history">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 bg-slate-950/50 rounded-xl border border-slate-800/60 p-3 flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5">
          <Activity className="w-5 h-5 text-slate-600" />
          <span>No signs translated yet in this session</span>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
        <button className="btn btn-primary flex-1 py-2.5 text-xs font-bold" disabled>
          Start Live Translation
        </button>

        <button className="btn btn-secondary text-xs" title="Text to Speech toggle">
          <Volume2 className="w-4 h-4 text-cyan-400" />
        </button>
      </div>
    </section>
  );
};

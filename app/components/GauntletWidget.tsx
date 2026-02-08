'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Skull, Coins, Swords, ShieldAlert } from 'lucide-react';
import { GauntletChallenge } from '../types';
import { cn } from '../utils';

type Props = {
  challenge: GauntletChallenge;
  currentXP: number;
  onStartGauntlet: (wager: number, targetHours: number, durationMinutes: number) => void;
  onClaimGauntlet: () => void;
  onSurrender: () => void;
};

export default function GauntletWidget({ challenge, currentXP, onStartGauntlet, onClaimGauntlet, onSurrender }: Props) {
  const [wagerInput, setWagerInput] = useState(100);
  const [targetInput, setTargetInput] = useState(1); 
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!challenge.isActive || challenge.status !== 'pending') return;

    const interval = setInterval(() => {
        const elapsed = Date.now() - challenge.startTime;
        const remaining = (challenge.durationMinutes * 60 * 1000) - elapsed;
        
        if (remaining <= 0) {
            onSurrender(); 
        } else {
            setTimeLeft(remaining);
        }
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge, onSurrender]);

  const formatTime = (ms: number) => {
      const h = Math.floor(ms / (1000 * 60 * 60));
      const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((ms % (1000 * 60)) / 1000);
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!challenge.isActive) {
      return (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border-2 border-slate-800 group h-full flex flex-col justify-between">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-900/20 via-slate-950 to-slate-950"></div>
             
             <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-4 text-rose-500">
                     <Swords size={24} />
                     <h3 className="text-xl font-black uppercase tracking-widest">The Gauntlet</h3>
                 </div>
                 
                 <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed">
                    Wager your XP against your focus. <br/>
                    <span className="text-rose-400">Double or Nothing.</span>
                 </p>

                 <div className="space-y-4">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between" htmlFor="wager-input">
                            <span>Wager Amount</span>
                            <span className={cn(wagerInput > currentXP ? "text-rose-500" : "text-emerald-500")}>Max: {currentXP}</span>
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                            <Coins size={16} className="text-amber-400" />
                            <input 
                                id="wager-input"
                                type="number" 
                                value={wagerInput}
                                onChange={(e) => setWagerInput(parseInt(e.target.value) || 0)}
                                className="bg-transparent text-xl font-black text-white w-full focus:outline-none"
                                aria-label="Wager Amount"
                            />
                        </div>
                        <input 
                            type="range" min="50" max={currentXP} step="50"
                            value={wagerInput}
                            onChange={(e) => setWagerInput(parseInt(e.target.value))}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500 mt-2"
                            aria-label="Adjust Wager Slider"
                        />
                     </div>

                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Target (Hours)</label>
                        <div className="flex items-center justify-between mt-1">
                            <button onClick={() => setTargetInput(Math.max(0.5, targetInput - 0.5))} className="p-1 bg-slate-700 rounded text-slate-300 hover:bg-slate-600" aria-label="Decrease Hours">-</button>
                            <span className="text-xl font-black">{targetInput} hr</span>
                            <button onClick={() => setTargetInput(Math.min(5, targetInput + 0.5))} className="p-1 bg-slate-700 rounded text-slate-300 hover:bg-slate-600" aria-label="Increase Hours">+</button>
                        </div>
                     </div>
                 </div>
             </div>

             <button 
                 disabled={wagerInput > currentXP || wagerInput <= 0}
                 onClick={() => onStartGauntlet(wagerInput, targetInput, targetInput * 60 + 30)} 
                 className="relative z-10 w-full mt-6 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-rose-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
             >
                 <Flame size={18} fill="currentColor" /> Enter Gauntlet
             </button>
        </div>
      );
  }

  const progressStyle = { '--width': `${Math.min(100, (challenge.currentHours / challenge.targetHours) * 100)}%` } as React.CSSProperties;

  return (
    <div className={cn(
        "relative rounded-3xl p-6 shadow-2xl overflow-hidden border-2 h-full flex flex-col justify-between transition-colors",
        challenge.status === 'won' ? "bg-emerald-950 border-emerald-500" :
        challenge.status === 'lost' ? "bg-slate-900 border-slate-700 opacity-80" :
        "bg-rose-950 border-rose-600 animate-pulse-slow"
    )}>
        {challenge.status === 'won' && <div className="absolute inset-0 bg-emerald-500/10 z-0"></div>}
        
        <div className="relative z-10">
             <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2">
                     {challenge.status === 'pending' && <ShieldAlert size={20} className="text-rose-400 animate-pulse" />}
                     {challenge.status === 'won' && <Coins size={20} className="text-emerald-400" />}
                     {challenge.status === 'lost' && <Skull size={20} className="text-slate-400" />}
                     
                     <h3 className="text-lg font-black uppercase tracking-widest text-white">
                         {challenge.status === 'pending' ? "Gauntlet Active" : challenge.status === 'won' ? "Victory" : "Defeated"}
                     </h3>
                 </div>
                 <div className="text-xs font-mono bg-black/30 px-2 py-1 rounded text-white/70">
                     Pot: {challenge.wager * 2} XP
                 </div>
             </div>

             <div className="text-center py-4">
                 {challenge.status === 'pending' ? (
                     <>
                        <div className="text-4xl font-black text-white tabular-nums mb-1">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-[10px] text-rose-300 font-bold uppercase tracking-wider mb-4">Time Remaining</p>
                        
                        <div className="w-full bg-rose-900/50 h-4 rounded-full overflow-hidden border border-rose-700/50">
                            <div 
                                className="h-full bg-rose-500 transition-all duration-500 w-[var(--width)]"
                                style={progressStyle}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-bold text-rose-300 mt-1">
                            <span>{challenge.currentHours} hr</span>
                            <span>Target: {challenge.targetHours} hr</span>
                        </div>
                     </>
                 ) : challenge.status === 'won' ? (
                     <div className="text-center">
                         <div className="text-5xl mb-2">💎</div>
                         <h4 className="text-2xl font-black text-emerald-400">PAYOUT!</h4>
                         <p className="text-emerald-200 text-sm">You earned {challenge.wager * 2} XP</p>
                     </div>
                 ) : (
                     <div className="text-center">
                         <div className="text-5xl mb-2">💀</div>
                         <h4 className="text-2xl font-black text-slate-400">Wager Lost</h4>
                         <p className="text-slate-500 text-sm">Better luck next time.</p>
                     </div>
                 )}
             </div>
        </div>

        <div className="relative z-10">
            {challenge.status === 'pending' && (
                <button 
                    onClick={onSurrender}
                    className="w-full py-2 text-xs font-bold text-rose-400 hover:text-rose-200 hover:bg-rose-900/50 rounded-lg transition-colors"
                >
                    Surrender (Lose {challenge.wager} XP)
                </button>
            )}
            {challenge.status === 'won' && (
                <button 
                    onClick={onClaimGauntlet}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black py-3 rounded-xl shadow-lg transition-transform active:scale-95 uppercase tracking-wide"
                >
                    Claim Reward
                </button>
            )}
            {challenge.status === 'lost' && (
                <button 
                    onClick={onClaimGauntlet} 
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    </div>
  );
}
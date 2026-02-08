'use client';

import React from 'react';
import { Target, Check } from 'lucide-react';
import { Quest } from '../types';
import { cn } from '../utils';

type Props = {
  quests: Quest[];
  onClaimReward: (questId: string) => void;
};

export default function DailyQuestWidget({ quests, onClaimReward }: Props) {
  
  const completedCount = quests.filter(q => q.isClaimed).length;
  // SVG Math for the circular progress
  const progress = (completedCount / 3) * 100;
  const circumference = 2 * Math.PI * 18; 
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden h-full flex flex-col min-h-[250px]">
       <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
       
       <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                 <Target className="text-amber-400" /> Daily Ops
              </h3>
              <p className="text-indigo-200 text-xs font-medium mt-1">Reset in: 14h 32m</p>
          </div>
          
          <div className="relative w-12 h-12 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-900/50" />
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-amber-400 transition-all duration-1000 ease-out" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
             </svg>
             <span className="absolute text-xs font-bold">{completedCount}/3</span>
          </div>
       </div>

       <div className="space-y-3 flex-1 relative z-10">
          {quests.map((quest) => {
             const isDone = quest.current >= quest.target;
             const width = Math.min(100, (quest.current / quest.target) * 100);

             return (
                <div 
                   key={quest.id} 
                   className={cn(
                      "group relative bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-3 transition-all",
                      isDone && !quest.isClaimed ? "ring-2 ring-amber-400 bg-indigo-900/80" : "",
                      quest.isClaimed ? "opacity-60" : "hover:bg-indigo-900/60"
                   )}
                >
                   {/* Background Bar */}
                   <div className="absolute inset-0 bg-indigo-500/20 rounded-xl overflow-hidden">
                       <div className="h-full bg-indigo-500/20 transition-all duration-500" style={{ width: `${width}%` }}></div>
                   </div>

                   <div className="relative flex justify-between items-center z-10">
                      <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                             {quest.label}
                             {isDone && <Check size={14} className="text-emerald-400" />}
                          </div>
                          <div className="text-[10px] text-indigo-200 font-mono mt-0.5">
                             {Math.min(quest.current, quest.target)} / {quest.target} • <span className="text-amber-300">+{quest.reward} XP</span>
                          </div>
                      </div>

                      {quest.isClaimed ? (
                          <div className="bg-emerald-500/20 text-emerald-300 p-1.5 rounded-lg">
                              <Check size={16} strokeWidth={3} />
                          </div>
                      ) : isDone ? (
                          <button 
                             onClick={() => onClaimReward(quest.id)}
                             className="bg-amber-400 hover:bg-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide shadow-lg animate-pulse"
                          >
                             Claim
                          </button>
                      ) : (
                          <div className="bg-indigo-950/50 text-indigo-400 p-1.5 rounded-lg">
                              <Target size={16} />
                          </div>
                      )}
                   </div>
                </div>
             );
          })}
       </div>
    </div>
  );
}
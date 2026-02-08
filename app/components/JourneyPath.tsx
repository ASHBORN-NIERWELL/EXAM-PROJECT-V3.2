'use client';

import React, { useRef, useEffect } from 'react';
import { Trophy, Map, Lock } from 'lucide-react';
import { cn } from '../utils';

type Props = {
  totalXP: number;
  level: number;
  onOpenTrophies: () => void;
};

// EXPANDED CAREER STAGES (Polymer Science Track)
const STAGES = [
  { minXP: 0, title: "Undergrad", icon: "🎓", color: "bg-slate-400" },
  { minXP: 500, title: "Lab Tech", icon: "🧪", color: "bg-emerald-400" },
  { minXP: 1200, title: "Jr. Analyst", icon: "📊", color: "bg-teal-500" },
  { minXP: 2500, title: "Process Eng.", icon: "⚙️", color: "bg-cyan-500" },
  { minXP: 4500, title: "Sr. Chemist", icon: "⚗️", color: "bg-blue-500" },
  { minXP: 7000, title: "R&D Lead", icon: "🔬", color: "bg-indigo-500" },
  { minXP: 10000, title: "Chief Scientist", icon: "⚛️", color: "bg-violet-500" },
  { minXP: 15000, title: "Nobel Laureate", icon: "🏆", color: "bg-amber-500" }
];

export default function JourneyPath({ totalXP, level, onOpenTrophies }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentStageIdx = STAGES.findIndex((s, i) => totalXP >= s.minXP && (i === STAGES.length - 1 || totalXP < STAGES[i+1].minXP));
  const currentStage = STAGES[currentStageIdx];
  const nextStage = STAGES[currentStageIdx + 1];
  
  const stageProgress = nextStage 
    ? Math.min(100, Math.max(0, ((totalXP - currentStage.minXP) / (nextStage.minXP - currentStage.minXP)) * 100))
    : 100;

  useEffect(() => {
    if (scrollRef.current) {
        const activeNode = scrollRef.current.children[0].children[currentStageIdx] as HTMLElement;
        if (activeNode) {
            scrollRef.current.scrollTo({ left: activeNode.offsetLeft - 50, behavior: 'smooth' });
        }
    }
  }, [currentStageIdx]);

  // CSS Variable for the main progress line width
  const progressWidthVal = `calc(${ (currentStageIdx / (STAGES.length - 1)) * 100 }% + ${ (stageProgress / 100) * (100 / (STAGES.length - 1)) }%)`;
  const mainTrackStyle = { '--width': progressWidthVal } as React.CSSProperties;
  
  // CSS Variable for the footer progress bar
  const footerProgStyle = { '--width': `${stageProgress}%` } as React.CSSProperties;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm relative overflow-hidden flex flex-col h-full">
       
       <div className="flex justify-between items-center mb-6 relative z-10 shrink-0">
          <div>
             <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Map size={20} className="text-indigo-500" /> Career Trajectory
             </h3>
             <p className="text-xs text-slate-500 font-medium">Total Experience: <strong className="text-indigo-600 dark:text-indigo-400">{totalXP} XP</strong></p>
          </div>
          <button 
             onClick={onOpenTrophies}
             className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl font-bold text-xs uppercase hover:scale-105 transition-transform shadow-sm"
             title="View Achievements"
          >
             <Trophy size={16} /> Achievements
          </button>
       </div>

       <div ref={scrollRef} className="relative pt-8 pb-12 px-2 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center min-w-max px-4 relative">
             <div className="absolute top-1/2 left-0 right-0 h-3 bg-slate-100 dark:bg-slate-800 -translate-y-1/2 rounded-full mx-4"></div>
             
             <div 
               className="absolute top-1/2 left-0 h-3 bg-indigo-500/50 -translate-y-1/2 rounded-full transition-all duration-1000 mx-4 w-[var(--width)]"
               style={mainTrackStyle}
             ></div>

             {STAGES.map((stage, idx) => {
                const isUnlocked = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                const isNext = idx === currentStageIdx + 1;

                return (
                   <div key={idx} className="relative flex flex-col items-center group cursor-default mx-6 first:ml-0 last:mr-0 z-10 w-20">
                      <div 
                         className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-4 transition-all duration-500 shadow-xl relative z-10",
                            isUnlocked 
                                ? `${stage.color} border-white dark:border-slate-900 text-white` 
                                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 grayscale"
                         )}
                         style={{ transform: isCurrent ? 'scale(1.2)' : 'scale(1)' }}
                      >
                         {isUnlocked ? stage.icon : <Lock size={18} />}
                         {isCurrent && <div className={`absolute inset-0 rounded-xl ${stage.color} opacity-40 animate-ping -z-10`}></div>}
                      </div>

                      <div className={cn(
                          "absolute top-20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all text-center whitespace-nowrap shadow-sm border",
                          isCurrent 
                            ? "bg-indigo-600 text-white border-indigo-500 z-20 scale-110" 
                            : isUnlocked 
                                ? "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700" 
                                : "bg-slate-50 dark:bg-slate-800/50 text-slate-400 border-transparent opacity-60"
                      )}>
                          {stage.title}
                      </div>
                      
                      {(isNext || isCurrent) && (
                          <div className="absolute -top-8 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                             {isCurrent ? "Current" : `${stage.minXP} XP`}
                          </div>
                      )}
                   </div>
                );
             })}
          </div>
       </div>

       <div className="mt-auto bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 flex items-center gap-4 shrink-0">
           <div className="flex-1">
               <div className="flex justify-between text-xs mb-1.5">
                   <span className="font-bold text-slate-700 dark:text-slate-200">
                       {nextStage ? `Progress to ${nextStage.title}` : "Max Level Reached!"}
                   </span>
                   <span className="font-mono text-slate-500">{Math.round(stageProgress)}%</span>
               </div>
               <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                   <div 
                        className={cn("h-full transition-all duration-1000 w-[var(--width)]", currentStage.color.replace('bg-', 'bg-'))} 
                        style={footerProgStyle}
                   ></div>
               </div>
           </div>
           <div className="text-center px-4 border-l border-slate-200 dark:border-slate-700">
               <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{level}</div>
               <div className="text-[9px] uppercase font-bold text-slate-400">Player Lvl</div>
           </div>
       </div>

    </div>
  );
}
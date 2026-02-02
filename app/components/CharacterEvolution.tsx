'use client';

import React from 'react';
import { User, Zap, Crown, Swords, Star, Dumbbell, Brain } from 'lucide-react';
import { Exam } from '../types';
import { calculatePreparedness, cn } from '../utils';

type Props = {
  exams: Exam[];
  compact?: boolean; // <--- New Prop
};

export default function CharacterEvolution({ exams, compact = false }: Props) {
  
  const totalSubjects = exams.length;
  if (totalSubjects === 0) return null;

  const avgPreparedness = Math.round(exams.reduce((acc, e) => acc + calculatePreparedness(e), 0) / totalSubjects);
  
  // Stages Logic
  const stages = [
    { min: 0, title: "The Civilian", class: "Novice", color: "text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", glow: "", icon: <User size={compact ? 20 : 48} /> },
    { min: 20, title: "The Trainee", class: "F-Class", color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-900/10", glow: "shadow-sky-500/20", icon: <Dumbbell size={compact ? 20 : 48} /> },
    { min: 40, title: "The Awakened", class: "C-Class", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/10", glow: "shadow-indigo-500/30", icon: <Swords size={compact ? 20 : 56} /> },
    { min: 60, title: "The Hero", class: "S-Class", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10", glow: "shadow-amber-500/50", icon: <Star size={compact ? 20 : 64} fill="currentColor" className="animate-pulse" /> },
    { min: 80, title: "The Ascended", class: "God Tier", color: "text-fuchsia-500", bg: "bg-fuchsia-50 dark:bg-fuchsia-900/10", glow: "shadow-fuchsia-500/60 animate-bounce", icon: <Crown size={compact ? 20 : 72} fill="currentColor" /> }
  ];

  const currentStage = stages.slice().reverse().find(s => avgPreparedness >= s.min) || stages[0];
  const nextStage = stages.find(s => s.min > avgPreparedness);
  const progressToNext = nextStage 
    ? ((avgPreparedness - currentStage.min) / (nextStage.min - currentStage.min)) * 100 
    : 100;

  // --- COMPACT MODE (Header Widget) ---
  if (compact) {
    return (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 pr-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-default">
            {/* Avatar Circle */}
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors",
                currentStage.color.replace('text-', 'border-'),
                currentStage.bg
            )}>
                <div className={currentStage.color}>{currentStage.icon}</div>
            </div>

            {/* Info */}
            <div className="flex flex-col min-w-[100px]">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <span>LVL {Math.floor(avgPreparedness / 10) + 1}</span>
                    <span className={currentStage.color}>{currentStage.class}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                     <div 
                        className={cn("h-full transition-all duration-1000", currentStage.color.replace('text-', 'bg-'))}
                        style={{ width: `${progressToNext}%` }}
                     />
                </div>
            </div>
        </div>
    );
  }

  // --- FULL MODE (Banner - Keeping logic just in case, but unused for now) ---
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-6">
       {/* (Previous Large Code omitted for brevity since we are using compact mode) */}
       <div className="flex items-center gap-4">
          <div className={cn("p-4 rounded-full", currentStage.bg)}>{currentStage.icon}</div>
          <div>
            <h2 className="text-2xl font-black">{currentStage.title}</h2>
            <div className="h-2 w-48 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: `${progressToNext}%` }}></div>
            </div>
          </div>
       </div>
    </div>
  );
}
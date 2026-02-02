'use client';

import React from 'react';
import { X, Trophy, Target, Zap, Clock, TrendingUp, Award, Crown, AlertTriangle } from 'lucide-react';
import { Exam } from '../types';
import { calculatePreparedness, cn } from '../utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
};

export default function ProfileModal({ isOpen, onClose, exams }: Props) {
  if (!isOpen) return null;

  // --- 1. CALCULATE RAW STATS ---
  const totalSubjects = exams.length;
  const totalHours = exams.reduce((acc, e) => acc + e.units.reduce((u, unit) => u + unit.hours, 0), 0);
  const avgPreparedness = totalSubjects > 0 
    ? Math.round(exams.reduce((acc, e) => acc + calculatePreparedness(e), 0) / totalSubjects) 
    : 0;
  
  const totalPossibleScore = totalSubjects * 100;
  const currentTotalScore = exams.reduce((acc, e) => acc + calculatePreparedness(e), 0);
  const performanceEfficiency = totalSubjects > 0 ? Math.round((currentTotalScore / totalPossibleScore) * 100) : 0;
  const gap = 100 - performanceEfficiency;

  const hoursToMax = Math.round(gap * 0.5 * totalSubjects); 

  // --- 2. ACHIEVEMENTS SYSTEM ---
  const achievements = [
    {
      id: 'starter',
      title: 'First Step',
      desc: 'Added your first subject',
      icon: <Target size={20} />,
      unlocked: totalSubjects > 0,
      color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20'
    },
    {
      id: 'grinder',
      title: 'The Grinder',
      desc: 'Logged over 10 hours of study',
      icon: <Clock size={20} />,
      unlocked: totalHours >= 10,
      color: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
      id: 'scholar',
      title: 'Honor Student',
      desc: 'Reached 80% Average Preparedness',
      icon: <Award size={20} />,
      unlocked: avgPreparedness >= 80,
      color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/20'
    },
    {
      id: 'god',
      title: 'God Tier',
      desc: '100% Preparedness across all subjects',
      icon: <Crown size={20} />,
      unlocked: avgPreparedness === 100 && totalSubjects > 0,
      color: 'text-fuchsia-500 bg-fuchsia-100 dark:bg-fuchsia-900/20'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex flex-col max-h-[90vh]">
        
        {/* FIXED: Added title and aria-label to the Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors z-10"
            title="Close Profile"
            aria-label="Close Profile"
        >
            <X size={20} />
        </button>

        {/* --- HEADER BANNER --- */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-900 p-8 text-white relative overflow-hidden shrink-0">
            <div className="absolute -right-10 -top-10 text-white/10 rotate-12">
                <Trophy size={200} />
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-24 h-24 rounded-full border-4 border-white/20 bg-white/10 flex items-center justify-center text-4xl shadow-xl">
                    🧙‍♂️
                </div>
                <div>
                    <div className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Student Profile</div>
                    <h2 className="text-3xl font-black tracking-tight">Rukshika</h2>
                    <p className="text-indigo-100/80 font-medium text-sm flex items-center gap-2 mt-1">
                        <Zap size={14} className="text-amber-400" fill="currentColor"/> 
                        Level {Math.floor(avgPreparedness / 10) + 1} Scholar
                    </p>
                </div>
            </div>
        </div>

        {/* --- SCROLLABLE CONTENT --- */}
        <div className="p-8 overflow-y-auto space-y-8">
            
            {/* 1. CRITICAL ANALYSIS (The Gap) */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" /> Performance Analysis
                    </h3>
                    <div className={cn("text-xs font-bold px-2 py-1 rounded", performanceEfficiency > 80 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                        {performanceEfficiency > 80 ? "Optimal Zone" : "Efficiency Gap Detected"}
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                        <span>Current Efficiency</span>
                        <span>The Best (100%)</span>
                    </div>
                    
                    {/* The Gap Bar */}
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative mb-4">
                        <div 
                            className="h-full bg-indigo-500 transition-all duration-1000" 
                            style={{ width: `${performanceEfficiency}%` }}
                        ></div>
                        {/* The "Gap" visualization */}
                        <div 
                             className="absolute top-0 right-0 h-full bg-rose-400/30 pattern-diagonal-lines"
                             style={{ width: `${gap}%` }}
                        ></div>
                    </div>

                    <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <strong className="block text-slate-800 dark:text-white mb-1">Critical Critique:</strong>
                            You are operating at <strong>{performanceEfficiency}% capacity</strong>. 
                            Mathematically, you are roughly <strong>{hoursToMax} study hours</strong> away from maximizing your potential. 
                            {gap > 50 ? " A significant increase in study volume is required immediately." : " You are closing the gap. Maintain consistency."}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ACHIEVEMENTS GRID */}
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
                    <Trophy size={20} className="text-amber-500" /> Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((item) => (
                        <div 
                            key={item.id} 
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                item.unlocked 
                                    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm" 
                                    : "bg-slate-50 dark:bg-slate-800/50 border-transparent opacity-50 grayscale"
                            )}
                        >
                            <div className={cn("p-3 rounded-xl shrink-0", item.color)}>
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{item.title}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                            </div>
                            {item.unlocked && <div className="ml-auto text-emerald-500"><Zap size={16} fill="currentColor"/></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
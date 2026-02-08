'use client';

import React from 'react';
import { X, Trophy, Lock } from 'lucide-react';
import { Achievement } from '../types';
import { cn } from '../utils';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
};

export default function TrophyRoom({ isOpen, onClose, achievements }: Props) {
  if (!isOpen) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200">
       <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
           
           <div className="bg-slate-50 dark:bg-slate-800 p-6 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
               <div>
                   <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                       <Trophy className="text-amber-500" /> Hall of Achievements
                   </h2>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                       Unlocked: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{unlockedCount} / {achievements.length}</span>
                   </p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                   <X size={24} className="text-slate-500" />
               </button>
           </div>

           <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {achievements.map((achievement) => (
                   <div 
                       key={achievement.id}
                       className={cn(
                           "relative p-5 rounded-2xl border-2 transition-all duration-300 group overflow-hidden",
                           achievement.unlocked 
                               ? "bg-amber-50/50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/50 hover:shadow-lg hover:scale-[1.02]" 
                               : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 grayscale opacity-60"
                       )}
                   >
                       {achievement.unlocked && <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-400/20 rounded-full blur-2xl"></div>}

                       <div className="flex items-start gap-4 relative z-10">
                           <div className={cn(
                               "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0",
                               achievement.unlocked ? "bg-white dark:bg-slate-800" : "bg-slate-200 dark:bg-slate-700"
                           )}>
                               {achievement.unlocked ? achievement.icon : <Lock size={20} />}
                           </div>
                           <div>
                               <h3 className={cn("font-bold text-sm", achievement.unlocked ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                                   {achievement.title}
                               </h3>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                   {achievement.desc}
                               </p>
                           </div>
                       </div>
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
}
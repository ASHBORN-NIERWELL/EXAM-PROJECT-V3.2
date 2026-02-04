'use client';

import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { Exam } from '../types';

type Props = {
  exams: Exam[];
};

export default function BulletinBoard({ exams }: Props) {
  // 1. Calculate Total Pomodoros (1 Hour = 2 Sessions)
  const totalHours = exams.reduce((acc, e) => acc + e.units.reduce((uAcc, u) => uAcc + u.hours, 0), 0);
  const totalPomodoros = Math.round(totalHours * 2);
  
  // 2. Calculate Total Quizzes/Exams Taken
  const totalTests = exams.reduce((acc, e) => acc + e.units.reduce((uAcc, u) => uAcc + (u.testsTaken || 0), 0), 0);

  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 text-amber-900 dark:text-amber-100 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-800/50 shadow-sm h-14 select-none cursor-default transition-transform hover:scale-105">
        
        {/* Pomodoro Stat */}
        <div className="flex items-center gap-2">
            <span className="text-2xl drop-shadow-sm filter" role="img" aria-label="Tomato">🍅</span>
            <div className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight">{totalPomodoros}</span>
                <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider">Sessions</span>
            </div>
        </div>
        
        {/* Divider */}
        <div className="w-px h-6 bg-amber-900/10 dark:bg-amber-100/10 mx-1"></div>

        {/* Exam Stat */}
        <div className="flex items-center gap-2">
            <div className="text-amber-600 dark:text-amber-400 p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                <FileSpreadsheet size={14} strokeWidth={3} />
            </div>
            <div className="flex flex-col leading-none">
                <span className="text-base font-black tracking-tight">{totalTests}</span>
                <span className="text-[9px] uppercase font-bold opacity-60 tracking-wider">Tests</span>
            </div>
        </div>
    </div>
  );
}
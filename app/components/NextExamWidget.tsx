'use client';

import React from 'react';
import { Calendar, AlertCircle, Target, ArrowRight, Clock, History, BarChart2 } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Exam } from '../types';
import { calculatePomodoro, calculatePreparedness, calculateUrgency } from '../utils';

type Props = {
  exams: Exam[];
  onOpenExam: (id: string) => void; // <--- NEW PROP
};

export default function NextExamWidget({ exams, onOpenExam }: Props) {
  
  const focusExam = [...exams].sort((a, b) => {
    return calculateUrgency(b) - calculateUrgency(a);
  })[0];

  const upcomingExams = exams
    .filter(e => differenceInDays(parseISO(e.date), new Date()) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextChronologicalExam = upcomingExams[0];

  if (!focusExam) {
    return (
      <div className="bg-slate-800 text-white p-8 rounded-3xl shadow-lg mb-8 text-center border border-slate-700">
        <Target size={48} className="mx-auto mb-4 opacity-20" />
        <h2 className="text-2xl font-bold">Ready to Start?</h2>
        <p className="opacity-60">Add your first subject to generate a strategy.</p>
      </div>
    );
  }

  const preparedness = calculatePreparedness(focusExam);
  const focusGap = 100 - preparedness;
  const focusPoms = calculatePomodoro(focusExam, preparedness);
  const totalHours = focusExam.units.reduce((acc, u) => acc + (u.hours || 0), 0);
  const completedCycles = Math.round(totalHours * 2);
  const nextDaysLeft = nextChronologicalExam ? differenceInDays(parseISO(nextChronologicalExam.date), new Date()) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      
      {/* LEFT: FOCUS NOW (Clickable!) */}
      <div 
        onClick={() => onOpenExam(focusExam.id)} // <--- TRIGGER JUMP
        className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[240px] border border-indigo-700/50 cursor-pointer hover:scale-[1.01] hover:shadow-2xl hover:ring-2 hover:ring-indigo-400/50 transition-all duration-300 group"
        title="Click to open this subject"
      >
        <div className="flex items-center gap-2 mb-4 relative z-10">
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 animate-pulse">
                <Target size={14} /> Smart Focus
            </div>
            <span className="text-indigo-300 text-xs font-medium group-hover:text-white transition-colors">Balanced Priority Algorithm</span>
        </div>

        <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight leading-tight group-hover:translate-x-1 transition-transform">
                {focusExam.subject}
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base max-w-md flex items-center gap-2">
                <BarChart2 size={16} />
                <span>Gap: <strong>{focusGap}%</strong></span>
                <span className="opacity-40">|</span>
                <span>Credits: <strong>{focusExam.credits}</strong></span>
            </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 relative z-10">
            <div className="bg-white text-indigo-900 px-5 py-3 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-indigo-900/50 group-hover:bg-indigo-50 transition-colors">
                <Clock size={18} />
                Do {focusPoms} New Cycles
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-indigo-950/50 border border-indigo-700/50 text-indigo-200 text-xs font-bold uppercase tracking-wide">
                <History size={14} />
                {completedCycles} Cycles Done So Far
            </div>
        </div>
        
        <Target className="absolute -bottom-10 -right-10 text-indigo-500 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-700" size={250} />
      </div>

      {/* RIGHT: UP NEXT */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col justify-center relative overflow-hidden group transition-colors">
        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Up Next
                </div>
            </div>

            {nextChronologicalExam ? (
                <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 line-clamp-2">
                        {nextChronologicalExam.subject}
                    </h3>
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-6">
                        {format(parseISO(nextChronologicalExam.date), 'MMMM d')} at {nextChronologicalExam.time || 'TBD'}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                                {nextDaysLeft}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Days Left</div>
                        </div>
                        <div className="h-10 w-px bg-slate-100 dark:bg-slate-700"></div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            {nextDaysLeft <= 3 ? (
                                <span className="text-rose-500 font-bold flex items-center gap-1">
                                    <AlertCircle size={12}/> Revision Mode
                                </span>
                            ) : "On Schedule"}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-slate-400 text-center py-4">
                    <p>No upcoming exams!</p>
                </div>
            )}
        </div>
        <ArrowRight className="absolute bottom-6 right-6 text-slate-100 dark:text-slate-700 group-hover:text-indigo-50 dark:group-hover:text-indigo-900/20 transition-colors" size={80} />
      </div>

    </div>
  );
}
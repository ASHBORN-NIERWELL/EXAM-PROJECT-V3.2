'use client';

import React from 'react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Exam } from '../types';
import { cn } from '../utils';

type Props = {
  exams: Exam[];
};

export default function TimetableView({ exams }: Props) {
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <CalendarIcon className="text-indigo-600 dark:text-indigo-400" size={24} /> 
              Exam Timetable
          </h2>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {sortedExams.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No exams scheduled. Add one above!</div>
          ) : (
              sortedExams.map((exam) => {
                  const date = parseISO(exam.date);
                  const daysLeft = differenceInDays(date, new Date());
                  const isPast = daysLeft < 0;

                  return (
                      <div key={exam.id} className={cn("p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors", isPast && "opacity-50 bg-slate-50 dark:bg-slate-800/50")}>
                          <div className="flex items-center gap-6">
                              <div className="text-center w-16 shrink-0">
                                  <div className="text-xs font-bold text-slate-400 uppercase">{format(date, 'MMM')}</div>
                                  <div className={cn("text-2xl font-black", isPast ? "text-slate-400" : "text-indigo-600 dark:text-indigo-400")}>{format(date, 'dd')}</div>
                              </div>
                              <div>
                                  <h3 className={cn("text-lg font-bold", isPast ? "text-slate-500 line-through" : "text-slate-800 dark:text-slate-100")}>{exam.subject}</h3>
                                  <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                                      <span className="font-semibold text-slate-700 dark:text-slate-300">{format(date, 'EEEE')}</span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                          <Clock size={12} /> {formatTime(exam.time)}
                                      </span>
                                      <span>•</span>
                                      <span>{exam.credits} Credits</span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                              {!isPast && (
                                  <div className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", 
                                      daysLeft <= 3 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : 
                                      daysLeft <= 7 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                  )}>
                                      {daysLeft} Days Left
                                  </div>
                              )}
                              {isPast && <span className="text-xs font-bold text-slate-400 uppercase bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">Completed</span>}
                          </div>
                      </div>
                  );
              })
          )}
      </div>
    </div>
  );
}
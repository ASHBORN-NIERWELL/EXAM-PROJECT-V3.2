'use client';

import React from 'react';
import { format, subDays, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { Exam } from '../types';
import { Activity } from 'lucide-react';
import { cn } from '../utils';

type Props = {
  exams: Exam[];
};

export default function StudyHeatmap({ exams }: Props) {
  // 1. Generate the last 119 days (approx 4 months)
  const today = new Date();
  const startDate = subDays(today, 119);
  const dates = eachDayOfInterval({ start: startDate, end: today });

  // 2. Calculate Activity Level (0-4)
  const getActivityLevel = (date: Date) => {
    let activityCount = 0;

    exams.forEach(exam => {
      // Check history log
      if (exam.history) {
        exam.history.forEach(point => {
          if (isSameDay(parseISO(point.date), date)) activityCount++;
        });
      }
      // Check units lastStudied
      exam.units.forEach(unit => {
        if (unit.lastStudied && isSameDay(parseISO(unit.lastStudied), date)) activityCount++;
      });
    });

    if (activityCount === 0) return 0;
    if (activityCount <= 1) return 1;
    if (activityCount <= 3) return 2;
    if (activityCount <= 5) return 3;
    return 4;
  };

  // 3. Color Map
  const getColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-slate-100'; // Empty (Gray)
      case 1: return 'bg-emerald-200'; // Light Green
      case 2: return 'bg-emerald-300';
      case 3: return 'bg-emerald-500';
      case 4: return 'bg-emerald-700'; // Dark Green
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity size={20} className="text-slate-400" />
        <h3 className="text-lg font-bold text-slate-800">Consistency Heatmap</h3>
      </div>

      {/* The Grid */}
      <div className="flex flex-wrap gap-1">
        {dates.map((date) => {
          const level = getActivityLevel(date);
          return (
            <div 
              key={date.toISOString()}
              className={cn("w-3 h-3 rounded-sm transition-all hover:ring-2 ring-indigo-300 relative group cursor-default", getColor(level))}
              title={format(date, 'MMM d')} // Native tooltip as backup
            >
              {/* Custom Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                {format(date, 'MMM d')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-end items-center gap-2 mt-4 text-xs text-slate-400 font-medium">
        <span>Less</span>
        <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-300 rounded-sm"></div>
        <div className="w-3 h-3 bg-emerald-700 rounded-sm"></div>
        <span>More</span>
      </div>
    </div>
  );
}
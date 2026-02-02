'use client';

import React from 'react';
import { Battery, BatteryWarning, BatteryCharging, AlertTriangle, RefreshCw } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Exam } from '../types';
import { cn } from '../utils';

type Props = {
  exams: Exam[];
};

export default function MemoryDrainWidget({ exams }: Props) {
  
  // 1. Calculate Retention Scores
  const drains = exams.map(exam => {
    // If no units, we assume 0% retention (Critical)
    if (!exam.units || exam.units.length === 0) {
        return { ...exam, retention: 0, daysSince: 999 };
    }

    // Find the most recent study session across all units
    const lastStudiedDates = exam.units
        .filter(u => u.lastStudied)
        .map(u => new Date(u.lastStudied!).getTime());
    
    if (lastStudiedDates.length === 0) {
        return { ...exam, retention: 0, daysSince: 999 };
    }

    const mostRecent = Math.max(...lastStudiedDates);
    const daysSince = differenceInDays(new Date(), new Date(mostRecent));

    // Simple Decay Formula: Lose 10% per day. Min 0%.
    // 0 days = 100%, 5 days = 50%, 10 days = 0%
    const retention = Math.max(0, 100 - (daysSince * 10));

    return { ...exam, retention, daysSince };
  }).sort((a, b) => a.retention - b.retention); // Show drained subjects first

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                <BatteryWarning size={16} /> Memory Drain
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Knowledge decay based on inactivity.</p>
        </div>
      </div>

      <div className="space-y-4">
        {drains.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm italic">Add subjects to track memory health.</div>
        ) : (
            drains.map((item) => {
                // Determine Visual State
                let statusColor = "bg-emerald-500";
                let icon = <BatteryCharging size={14} />;
                let text = "Fresh";

                if (item.retention < 30) {
                    statusColor = "bg-rose-500 animate-pulse";
                    icon = <AlertTriangle size={14} />;
                    text = "Critical";
                } else if (item.retention < 70) {
                    statusColor = "bg-amber-500";
                    icon = <RefreshCw size={14} />;
                    text = "Fading";
                }

                return (
                    <div key={item.id} className="group">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.subject}</span>
                            <div className={cn("text-[10px] font-bold uppercase flex items-center gap-1 px-2 py-0.5 rounded-full text-white", statusColor)}>
                                {icon} {text} ({item.retention}%)
                            </div>
                        </div>

                        {/* Battery Bar Container */}
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-700 rounded-md overflow-hidden relative border border-slate-200 dark:border-slate-600">
                            {/* Grid Lines for visual "Battery Cells" effect */}
                            <div className="absolute inset-0 z-10 grid grid-cols-10 pointer-events-none">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border-r border-white/20 dark:border-black/10 h-full col-span-1"></div>
                                ))}
                            </div>

                            {/* The Fluid Level */}
                            <div 
                                className={cn("h-full transition-all duration-1000 ease-out", statusColor)}
                                style={{ width: `${item.retention}%` }}
                            ></div>
                        </div>

                        <div className="text-[10px] text-slate-400 font-medium mt-1 text-right">
                            {item.daysSince === 0 
                                ? "Studied Today" 
                                : item.daysSince > 365 
                                    ? "Not studied yet" 
                                    : `${item.daysSince} days since last review`}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
}
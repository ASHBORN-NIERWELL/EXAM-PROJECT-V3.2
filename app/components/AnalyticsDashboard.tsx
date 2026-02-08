'use client';

import React from 'react';
import { PieChart, AlertTriangle } from 'lucide-react';
import { Exam } from '../types';
import { calculatePreparedness, calculateUrgency, cn } from '../utils'; 
import StudyHeatmap from './StudyHeatmap';
import MemoryDrainWidget from './MemoryDrainWidget';

// FIXED: Removed the unused 'onUpdateTopicStatus' prop
type Props = {
  exams: Exam[];
};

export default function AnalyticsDashboard({ exams }: Props) {
  
  const totalWeight = exams.reduce((acc, exam) => acc + calculateUrgency(exam), 0);

  const distribution = exams.map(exam => {
    const urgency = calculateUrgency(exam);
    const gap = 100 - calculatePreparedness(exam);
    const share = totalWeight > 0 ? Math.round((urgency / totalWeight) * 100) : 0;
    return { ...exam, share, gap };
  }).sort((a, b) => b.share - a.share);

  return (
    <div className="space-y-6">
      
      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
        <PieChart size={20} /> Strategic Analysis
      </h2>
      
      {/* 1. Memory Drain */}
      <MemoryDrainWidget exams={exams} />

      {/* 2. Load Balancer */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Study Load Balancer</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Real-time allocation based on urgency & effort.</p>
            </div>
            {exams.length > 0 && (
                 <div className="text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded">
                    Total Workload: {totalWeight > 200 ? "Heavy" : "Balanced"}
                 </div>
            )}
        </div>

        <div className="space-y-4">
          {distribution.length === 0 ? (
             <div className="text-center py-8 text-slate-400 italic">Add subjects to generate a study plan.</div>
          ) : (
             distribution.map((item) => {
                const barWidth = { '--width': `${item.share}%` } as React.CSSProperties;
                
                return (
                  <div key={item.id} className="group">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", item.share > 30 ? "bg-rose-500" : item.share > 15 ? "bg-amber-500" : "bg-emerald-500")}></span>
                            <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.subject}</span>
                            {item.share > 40 && <AlertTriangle size={12} className="text-rose-500" />}
                        </div>
                        <div className="text-xs font-bold text-slate-400">
                           {item.share}% Focus
                        </div>
                    </div>
                    
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
                        <div 
                           className={cn("h-full rounded-full transition-all duration-1000", item.share > 30 ? "bg-rose-500" : item.share > 15 ? "bg-amber-500" : "bg-emerald-500")}
                           style={barWidth}
                        ></div>
                    </div>
                  </div>
                );
             })
          )}
        </div>
      </div>

      <StudyHeatmap exams={exams} />
    </div>
  );
}
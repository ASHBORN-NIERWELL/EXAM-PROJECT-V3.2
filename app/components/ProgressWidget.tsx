'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Activity, BrainCircuit } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Exam, Unit } from '../types';
import { cn } from '../utils';

type Props = {
  exam: Exam;
};

export default function ProgressWidget({ exam }: Props) {
  const calculateRetentionHealth = (units: Unit[]) => {
    if (units.length === 0) return 100;
    
    const totalHealth = units.reduce((acc, unit) => {
      if (!unit.lastStudied) return acc + 100;
      const daysSince = differenceInDays(new Date(), parseISO(unit.lastStudied));
      const decayStartDay = 3;
      const decayRate = 5;
      const penalty = Math.max(0, (daysSince - decayStartDay) * decayRate);
      return acc + Math.max(0, 100 - penalty);
    }, 0);

    return Math.round(totalHealth / units.length);
  };

  const retention = calculateRetentionHealth(exam.units);
  const isDecaying = retention < 80;

  const dataPoints = exam.history.length > 0 
    ? exam.history 
    : [{ date: new Date().toISOString(), score: exam.familiarity }];

  const width = 100;
  const height = 40;
  const maxScore = 100;
  
  const chartPath = (() => {
    if (dataPoints.length < 2) return "";
    const getY = (score: number) => height - (score / maxScore) * height;
    const stepX = width / (dataPoints.length - 1);
    return dataPoints.map((point, i) => 
      `${i === 0 ? 'M' : 'L'} ${i * stepX} ${getY(point.score)}`
    ).join(' ');
  })();

  const currentScore = dataPoints[dataPoints.length - 1].score;
  const startScore = dataPoints[0].score;
  const growth = currentScore - startScore;

  const dotStyle = { '--dot-top': `${100 - currentScore}%` } as React.CSSProperties;
  const barStyle = { '--bar-width': `${retention}%` } as React.CSSProperties;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6 animate-in fade-in">
      
      {/* Progress Line */}
      <div className="bg-white dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start mb-2">
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <Activity size={12} /> Overall Growth
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white flex items-end gap-2">
                    {currentScore}%
                    <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded mb-1", growth >= 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400")}>
                        {growth >= 0 ? '+' : ''}{growth}%
                    </span>
                </div>
            </div>
        </div>

        <div className="h-12 w-full mt-2 relative">
            <div className="absolute top-1/2 w-full h-px bg-slate-100 dark:bg-slate-600 border-t border-dashed border-slate-200 dark:border-slate-600"></div>
            
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path 
                    d={chartPath} 
                    fill="none" 
                    stroke={growth >= 0 ? "#10b981" : "#f43f5e"} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            
            <div 
                 className={cn("absolute right-0 w-2 h-2 rounded-full border-2 border-white dark:border-slate-800 shadow-sm translate-x-1/2 -translate-y-1/2 top-[var(--dot-top)]", growth >= 0 ? "bg-green-500" : "bg-red-500")} 
                 style={dotStyle}
            >
            </div>
        </div>
      </div>

      {/* Memory Retention */}
      <div className="bg-white dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-start">
            <div>
                <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                    <BrainCircuit size={12} /> Memory Retention
                </div>
                <div className="text-2xl font-black text-slate-800 dark:text-white">
                    {retention}%
                </div>
            </div>
            {isDecaying ? (
                <TrendingDown className="text-rose-500" size={20} />
            ) : (
                <TrendingUp className="text-emerald-500" size={20} />
            )}
        </div>

        <div className="space-y-2 mt-3">
             <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div 
                    className={cn("h-full transition-all duration-1000 w-[var(--bar-width)]", 
                        retention > 80 ? "bg-emerald-500" : retention > 50 ? "bg-amber-500" : "bg-rose-500"
                    )} 
                    style={barStyle} 
                />
             </div>
             
             <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                 {isDecaying 
                    ? "⚠️ Knowledge is decaying! Review recent units." 
                    : "🧠 Retention is healthy. Keep it up!"}
             </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Sparkles, SlidersHorizontal, Timer, LayoutList, Flame, CheckCircle2 } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';
import { Exam, Unit, Topic } from '../types'; 
import { calculatePreparedness, calculatePomodoro, cn } from '../utils'; 
import UnitWidget from './UnitWidget';
import SyllabusMapper from './SyllabusMapper'; // <--- UPDATED IMPORT
import ProgressWidget from './ProgressWidget'; 
import PomodoroTimer from './PomodoroTimer';
import SyllabusHeatmap from './SyllabusHeatmap';

type Props = {
  exam: Exam;
  isExpanded: boolean; 
  onToggle: () => void; 
  onDeleteExam: (id: string) => void;
  onAddUnit: (examId: string, name: string, hours: number, tests: number, score: number) => void;
  onImportUnits: (examId: string, units: Unit[]) => void; // Keep for legacy if needed, or remove
  onDeleteUnit: (examId: string, unitId: string) => void;
  onUpdateFamiliarity: (examId: string, score: number) => void;
  onUpdateExam: (updatedExam: Exam) => void; 
};

export default function ExamCard({ exam, isExpanded, onToggle, onDeleteExam, onAddUnit, onDeleteUnit, onImportUnits, onUpdateFamiliarity, onUpdateExam }: Props) {
  const [showMapper, setShowMapper] = useState(false); // Renamed state
  const [showTimer, setShowTimer] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false); 

  const preparedness = calculatePreparedness(exam);
  const pomodoros = calculatePomodoro(exam, preparedness);
  const daysLeft = differenceInDays(parseISO(exam.date), new Date());

  const progressStyle = { '--prog-width': `${preparedness}%` } as React.CSSProperties;

  const sessionsToday = Math.round(exam.units
    .filter((unit) => {
        if (!unit.lastStudied) return false;
        return new Date(unit.lastStudied).toDateString() === new Date().toDateString();
    })
    .reduce((acc, unit) => acc + (unit.hours * 2), 0)
  );

  const handleUpdateTopics = (newTopics: Topic[]) => {
    onUpdateExam({ ...exam, topics: newTopics });
  };

  // Handler for the new Mapper
  const handleMapImport = (importedTopics: Topic[]) => {
    // We append to existing or replace? Let's replace for a clean map, or append.
    // Here we replace to allow full regeneration.
    onUpdateExam({ ...exam, topics: importedTopics });
    setShowSyllabus(true); // Auto-open the syllabus view to show results
  };

  const handleSaveSession = (unitName: string, minutes: number, details: string) => {
    const hours = Number((minutes / 60).toFixed(2));
    const finalName = details.trim() ? `${unitName} - ${details}` : unitName;
    onAddUnit(exam.id, finalName, hours, 0, 0);
  };

  return (
    <>
      <div 
        id={`exam-card-${exam.id}`} 
        className={cn("bg-white dark:bg-slate-800 rounded-2xl border overflow-hidden shadow-sm transition-all relative scroll-mt-24", isExpanded ? "border-indigo-500 dark:border-indigo-400 ring-1 ring-indigo-500/20" : "border-slate-200 dark:border-slate-700")}
      >
        <button 
          onClick={onToggle} 
          className="w-full text-left p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors focus:outline-none"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exam.subject}</h3>
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">{exam.credits} Credits</span>
                <span className="opacity-50">|</span>
                <span>{daysLeft} days left</span>
                
                {sessionsToday > 0 && (
                   <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded text-xs ml-2 border border-emerald-100 dark:border-emerald-900/30">
                      <Flame size={12} fill="currentColor" className="opacity-80" /> {sessionsToday} Cycles Today
                   </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-slate-200 dark:text-slate-700">{preparedness}%</div>
              <div className="text-xs font-bold text-slate-400 uppercase">Preparedness</div>
            </div>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-500 w-[var(--prog-width)]" style={progressStyle} />
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
            {sessionsToday > 0 ? (
                <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span><strong className="text-emerald-600 dark:text-emerald-400">{sessionsToday} Done</strong> today. Targeting <strong>+{pomodoros} more</strong>.</span>
                </>
            ) : (
                <>
                    <Clock size={16} /><span>Suggestion: Focus <strong>{pomodoros} Pomodoro sessions</strong> today.</span>
                </>
            )}
          </div>

          <div className="flex justify-center mt-2 text-slate-300 dark:text-slate-600">
            {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
          </div>
        </button>

        {isExpanded && (
          <div className="relative border-t border-slate-100 dark:border-slate-700">
             
             <div className="flex items-center justify-end gap-2 p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700 backdrop-blur-sm sticky top-0 z-20">
                <span className="text-[10px] font-bold uppercase text-slate-400 mr-auto pl-2 tracking-wider">Quick Actions</span>

                <button 
                  onClick={() => setShowTimer(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-rose-200 dark:hover:bg-rose-500/20 transition-all active:scale-95"
                  title="Start Focus Timer" 
                >
                  <Timer size={14} /> Focus Mode
                </button>
                
                <button 
                  onClick={() => setShowSyllabus(!showSyllabus)}
                  className={cn("flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-lg transition-all active:scale-95", showSyllabus ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400" : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600")}
                  title="Toggle Syllabus Heatmap" 
                >
                  <LayoutList size={14} /> Syllabus
                </button>

                <button 
                  onClick={() => setShowMapper(true)} // Opens NEW Mapper
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-bold uppercase tracking-wide rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95"
                  title="Auto-Map Syllabus Structure" 
                >
                  <Sparkles size={14} /> Auto-Map
                </button>
             </div>

             <div className="px-6 pb-6 pt-4 bg-slate-50/30 dark:bg-slate-800/30">
                <ProgressWidget exam={exam} />
                
                {showSyllabus && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <SyllabusHeatmap 
                          topics={exam.topics || []}
                          onUpdateTopics={handleUpdateTopics}
                      />
                    </div>
                )}

                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mt-6 shadow-sm">
                    {/* Familiarity Slider Code (Same as before) */}
                    <div className="flex items-center gap-3 mb-3">
                        <SlidersHorizontal size={16} className="text-slate-400" />
                        <label htmlFor={`fam-${exam.id}`} className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex-1">Baseline Familiarity</label>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">{exam.familiarity}%</span>
                    </div>
                    <input 
                        id={`fam-${exam.id}`} type="range" min="0" max="100" value={exam.familiarity} 
                        onChange={(e) => onUpdateFamiliarity(exam.id, parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                    />
                </div>
             </div>

            <div className="border-t border-slate-100 dark:border-slate-700">
                <UnitWidget 
                  units={exam.units}
                  onAddUnit={(n, h, t, s) => onAddUnit(exam.id, n, h, t, s)}
                  onDeleteUnit={(unitId) => onDeleteUnit(exam.id, unitId)}
                  onDeleteExam={() => onDeleteExam(exam.id)}
                />
            </div>
          </div>
        )}
      </div>

      {/* REPLACED: UnitImporter -> SyllabusMapper */}
      <SyllabusMapper 
        subject={exam.subject}
        isOpen={showMapper}
        onClose={() => setShowMapper(false)}
        onImport={handleMapImport}
      />

      <PomodoroTimer 
        isOpen={showTimer}
        subjectName={exam.subject}
        onClose={() => setShowTimer(false)}
        onSaveSession={handleSaveSession}
      />
    </>
  );
}
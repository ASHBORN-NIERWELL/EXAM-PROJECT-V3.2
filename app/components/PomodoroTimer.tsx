'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Save, X, FileText, RotateCcw } from 'lucide-react';

type Props = {
  subjectName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (unitName: string, minutes: number, details: string) => void;
};

export default function PomodoroTimer({ subjectName, isOpen, onClose, onSaveSession }: Props) {
  const [unitName, setUnitName] = useState('');
  const [sessionDetails, setSessionDetails] = useState(''); // State for details
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // Default 25m
  const [totalSecondsElapsed, setTotalSecondsElapsed] = useState(0);
  
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setUnitName('');
      setSessionDetails('');
      setSecondsLeft(25 * 60);
      setTotalSecondsElapsed(0);
      setIsActive(false);
    }
  }, [isOpen]);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      // Calculate start time based on what has already elapsed (allows pausing)
      startTimeRef.current = Date.now() - (totalSecondsElapsed * 1000);
      
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - (startTimeRef.current || 0)) / 1000);
        
        setSecondsLeft((prev) => Math.max(0, (25 * 60) - elapsed));
        setTotalSecondsElapsed(elapsed);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive]); // totalSecondsElapsed is intentionally omitted to avoid re-renders disrupting the flow

  const toggleTimer = () => {
    if (!isActive) {
        // Resume logic
        startTimeRef.current = Date.now() - (totalSecondsElapsed * 1000);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsLeft(25 * 60);
    setTotalSecondsElapsed(0);
  };

  const handleFinish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    const minutes = Math.ceil(totalSecondsElapsed / 60);
    
    // Default name if left empty
    const finalName = unitName.trim() || `Focus Session (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    if (minutes > 0) {
        onSaveSession(finalName, minutes, sessionDetails);
    }
    onClose();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 relative flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Focus Mode</h2>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{subjectName}</h3>
        </div>

        {/* Timer Display */}
        <div className="relative w-56 h-56 mx-auto mb-8 flex items-center justify-center shrink-0">
            {/* Pulsing Border when Active */}
            <div className={`absolute inset-0 rounded-full border-8 transition-colors duration-500 ${isActive ? 'border-indigo-500 animate-pulse' : 'border-slate-100 dark:border-slate-700'}`}></div>
            
            {/* Time Text */}
            <div className="flex flex-col items-center">
                <div className="text-6xl font-black text-slate-700 dark:text-slate-100 tabular-nums tracking-tight">
                    {formatTime(secondsLeft > 0 ? secondsLeft : totalSecondsElapsed)}
                </div>
                {secondsLeft === 0 && (
                   <span className="text-xs font-bold text-emerald-500 uppercase mt-2 animate-bounce">Overtime</span>
                )}
            </div>
        </div>

        {/* Inputs Area */}
        <div className="space-y-4 mb-8 w-full">
            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2">Topic Covered</label>
                <input 
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    placeholder="e.g. Thermodynamics Ch.4"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-200 dark:border-slate-700 transition-all placeholder:font-medium placeholder:text-slate-400"
                />
            </div>

            <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-2 flex items-center gap-1">
                    <FileText size={12} /> Optional Details
                </label>
                <textarea 
                    value={sessionDetails}
                    onChange={(e) => setSessionDetails(e.target.value)}
                    placeholder="Notes: Difficulty with Carnot cycle..."
                    rows={2}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 dark:text-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-slate-200 dark:border-slate-700 transition-all resize-none placeholder:text-slate-400"
                />
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-auto">
            {/* Cancel */}
            <button 
                onClick={onClose}
                className="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                title="Cancel Session"
            >
                <X size={24} />
            </button>

            {/* Play/Pause */}
            <button 
                onClick={toggleTimer}
                className={`p-6 rounded-full text-white shadow-xl shadow-indigo-500/30 transition-all transform active:scale-95 ${isActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                title={isActive ? "Pause Timer" : "Start Timer"}
            >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>

             {/* Reset (New Feature) */}
             {!isActive && totalSecondsElapsed > 0 && (
                 <button 
                    onClick={handleReset}
                    className="absolute left-8 bottom-8 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="Reset Timer"
                 >
                     <RotateCcw size={20} />
                 </button>
             )}

            {/* Save */}
            <button 
                onClick={handleFinish}
                className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
                title="Save Progress"
            >
                <Save size={24} />
            </button>
        </div>

      </div>
    </div>
  );
}
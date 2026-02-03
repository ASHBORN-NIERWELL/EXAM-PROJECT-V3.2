'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, LayoutDashboard, Calendar, HardDrive, Moon, Sun, Loader2 } from 'lucide-react';
import { Exam, Unit } from '../types';
import ExamInputForm from './ExamInputForm';
import ExamCard from './ExamCard';
import AnalyticsDashboard from './AnalyticsDashboard';
import NextExamWidget from './NextExamWidget';
import TimetableView from './TimetableView';
import ToastManager, { type Toast } from './ToastManager'; 
import CharacterEvolution from './CharacterEvolution'; 
import ProfileModal from './ProfileModal'; 
import { cn, calculatePreparedness } from '../utils';

const INITIAL_DATA: Exam[] = [
  { 
    id: '1', 
    subject: 'Adv. Electromagnetic Theory', 
    date: '2026-02-15', 
    time: '09:00',
    credits: 4,
    familiarity: 40,
    history: [], 
    notes: '',
    units: [],
    topics: [] 
  },
];

type Tab = 'dashboard' | 'timetable';

export default function ExamTracker() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/storage');
        const data = await response.json();
        if (data.exams && data.exams.length > 0) setExams(data.exams);
        else setExams(INITIAL_DATA);
      } catch (error) { setExams(INITIAL_DATA); } 
      finally { setIsLoaded(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      setIsSaving(true);
      try {
        await fetch('/api/storage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exams }),
        });
      } catch (error) { showToast("Failed to save data!", "error"); } 
      finally { setTimeout(() => setIsSaving(false), 800); }
    };
    const timeoutId = setTimeout(() => saveData(), 1000); 
    return () => clearTimeout(timeoutId);
  }, [exams, isLoaded]);

  const handleSmartFocus = (id: string) => {
    setExpandedExamId(id);
    setTimeout(() => {
        const element = document.getElementById(`exam-card-${id}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // --- NEW: QUIZ HANDLER ---
  const handleQuizVictory = (examId: string, bonusHours: number) => {
    const victoryUnit: Unit = {
        id: Date.now().toString(),
        name: `🏆 Quiz Victory`,
        hours: bonusHours,
        testsTaken: 0,
        avgScore: 0,
        lastStudied: new Date().toISOString()
    };

    setExams(exams.map(e => {
        if (e.id !== examId) return e;
        const updatedUnits = [...e.units, victoryUnit];
        const tempExam = { ...e, units: updatedUnits };
        const newScore = calculatePreparedness(tempExam);
        // Add to history
        const newHistory = [...(e.history || []), { date: new Date().toISOString(), score: newScore }];
        return { ...e, units: updatedUnits, history: newHistory };
    }));
    showToast("Analysis Verified! Bonus Points Added.", "success");
  };

  // ... (Data Handlers remain same) ...
  const handleAddExam = (subject: string, date: string, time: string, credits: number, familiarity: number) => {
    const newExam: Exam = { id: Date.now().toString(), subject, date, time, credits, familiarity, units: [], history: [{ date: new Date().toISOString(), score: familiarity }], notes: '', topics: [] };
    setExams([...exams, newExam]);
    showToast(`Added "${subject}"`, 'success'); 
    setActiveTab('dashboard'); 
  };
  const handleDeleteExam = (id: string) => { setExams(exams.filter((e) => e.id !== id)); showToast("Subject deleted", 'info'); };
  const handleUpdateExam = (updatedExam: Exam) => { setExams(exams.map((e) => (e.id === updatedExam.id ? updatedExam : e))); };
  const handleUpdateFamiliarity = (id: string, score: number) => {
    setExams(exams.map(e => {
      if (e.id !== id) return e;
      const updatedExam = { ...e, familiarity: score };
      const newScore = calculatePreparedness(updatedExam);
      return { ...updatedExam, history: [...(e.history || []), { date: new Date().toISOString(), score: newScore }] };
    }));
  };
  const handleAddUnit = (examId: string, name: string, hours: number, testsTaken: number, avgScore: number) => {
    const newUnit: Unit = { id: Date.now().toString(), name, hours, testsTaken, avgScore, lastStudied: new Date().toISOString() };
    setExams(exams.map(e => {
        if (e.id !== examId) return e;
        const tempExam = { ...e, units: [...e.units, newUnit] };
        return { ...e, units: [...e.units, newUnit], history: [...(e.history || []), { date: new Date().toISOString(), score: calculatePreparedness(tempExam) }] };
    }));
    showToast(`Unit added!`, 'success'); 
  };
  const handleImportUnits = (examId: string, newUnits: Unit[]) => { setExams(exams.map(e => e.id === examId ? { ...e, units: [...e.units, ...newUnits] } : e)); showToast(`Imported units`, 'success'); };
  const handleDeleteUnit = (examId: string, unitId: string) => { setExams(exams.map(e => e.id === examId ? { ...e, units: e.units.filter(u => u.id !== unitId) } : e)); showToast("Unit removed", 'info'); };

  if (!isLoaded) {
    return (
        <div className="flex items-center justify-center h-screen text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-950" suppressHydrationWarning={true}>
            <Loader2 className="animate-spin" size={48} />
        </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        exams={exams} 
      />

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans">
        
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Analytics</h1>
                  <div className={cn("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 transition-all", isSaving ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                      <HardDrive size={12} /> {isSaving ? "Saving..." : "Saved"}
                  </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Exam preparedness & timetable management.</p>
          </div>

          <div className="flex flex-col items-end gap-3">
             <CharacterEvolution exams={exams} compact={true} />

             <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-2xl flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-700 hover:scale-105 transition-transform shadow-sm cursor-pointer"
                    title="Open Profile & Analysis"
                >
                    🧙‍♂️
                </button>

                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700 transition-all"
                    title="Toggle Theme"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all", activeTab === 'dashboard' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
                    >
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button 
                        onClick={() => setActiveTab('timetable')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all", activeTab === 'timetable' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}
                    >
                        <Calendar size={16} /> Timetable
                    </button>
                </div>
             </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NextExamWidget exams={exams} onOpenExam={handleSmartFocus} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><BookOpen size={20} /> Subjects Tracker</h2>
                      {exams.map((exam) => (
                          <ExamCard 
                              key={exam.id} 
                              exam={exam}
                              isExpanded={expandedExamId === exam.id} 
                              onToggle={() => setExpandedExamId(prev => prev === exam.id ? null : exam.id)}
                              onDeleteExam={handleDeleteExam}
                              onAddUnit={handleAddUnit}
                              onDeleteUnit={handleDeleteUnit}
                              onImportUnits={handleImportUnits}
                              onUpdateFamiliarity={handleUpdateFamiliarity}
                              onUpdateExam={handleUpdateExam} 
                          />
                      ))}
                      {exams.length === 0 && <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">No subjects added yet.</div>}
                  </div>
                  
                  {/* UPDATED: Removed onFocusSubject, added onQuizComplete */}
                  <AnalyticsDashboard exams={exams} onQuizComplete={handleQuizVictory} />
              </div>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <ExamInputForm onAdd={handleAddExam} />
             <TimetableView exams={exams} />
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, LayoutDashboard, Calendar, HardDrive, Moon, Sun, Loader2, ChevronUp, ChevronDown, Trophy, Flame } from 'lucide-react';
import { Exam, Unit, Topic, Quest, Achievement, GauntletChallenge } from '../types'; 
import ExamInputForm from './ExamInputForm';
import ExamCard from './ExamCard';
import AnalyticsDashboard from './AnalyticsDashboard';
import NextExamWidget from './NextExamWidget';
import TimetableView from './TimetableView';
import ToastManager, { type Toast } from './ToastManager'; 
import ProfileModal from './ProfileModal'; 
import BulletinBoard from './BulletinBoard'; 
import DailyQuestWidget from './DailyQuestWidget'; 
import JourneyPath from './JourneyPath'; 
import TrophyRoom from './TrophyRoom'; 
import GauntletWidget from './GauntletWidget'; 
import { cn, calculatePreparedness } from '../utils';

// ... (KEEP INITIAL_DATA and ACHIEVEMENTS_LIST exactly as they were) ...
const INITIAL_DATA: Exam[] = [
  { id: '1', subject: 'Adv. Electromagnetic Theory', date: '2026-02-15', time: '09:00', credits: 4, familiarity: 40, history: [], notes: '', units: [], topics: [] },
];
const ACHIEVEMENTS_LIST: Achievement[] = [
    { id: 'first_blood', title: 'First Steps', desc: 'Add your first subject.', icon: '👶', condition: (exams) => exams.length > 0 },
    { id: 'bookworm', title: 'Bookworm', desc: 'Earn 500 XP.', icon: '📚', condition: (exams, xp) => xp >= 500 },
    { id: 'expert', title: 'Specialist', desc: 'Earn 2500 XP.', icon: '🎓', condition: (exams, xp) => xp >= 2500 },
    { id: 'risk_taker', title: 'Risk Taker', desc: 'Win a Gauntlet Challenge.', icon: '🔥', condition: (exams, xp) => false }, 
    { id: 'master', title: 'Mastery', desc: 'Reach 100% preparedness.', icon: '👑', condition: (exams) => exams.some(e => calculatePreparedness(e) === 100) },
];

export default function ExamTracker() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'timetable'>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState<string | null>(null);
  
  // UI States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTrophyOpen, setIsTrophyOpen] = useState(false);
  const [showGamification, setShowGamification] = useState(true);
  
  // Gamification Data
  const [xp, setXp] = useState(0);
  const [quests, setQuests] = useState<Quest[]>([
      { id: 'q1', label: 'Log 2 Study Hours', type: 'hours', target: 2, current: 0, reward: 150, isClaimed: false },
      { id: 'q2', label: 'Complete 1 Unit', type: 'units', target: 1, current: 0, reward: 200, isClaimed: false },
      { id: 'q3', label: 'Master 1 Topic', type: 'mastery', target: 1, current: 0, reward: 300, isClaimed: false },
  ]);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_LIST);
  const [gauntlet, setGauntlet] = useState<GauntletChallenge>({
      isActive: false, startTime: 0, durationMinutes: 0, targetHours: 0, wager: 0, currentHours: 0, status: 'pending'
  });

  const [toasts, setToasts] = useState<Toast[]>([]);

  // ... (KEEP ALL HELPERS, EFFECTS, AND HANDLERS THE SAME) ...
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const recalibrateXP = (dataExams: Exam[], savedXP: number = 0) => {
    let auditXP = 0;
    auditXP += dataExams.length * 100;
    dataExams.forEach(exam => {
        exam.units.forEach(unit => {
            auditXP += 50; 
            auditXP += Math.round(unit.hours * 10);
        });
        const countMastered = (topics: Topic[]): number => {
            let count = 0;
            topics.forEach(t => {
                if (t.status === 'good') count++;
                if (t.subtopics) count += countMastered(t.subtopics);
            });
            return count;
        };
        auditXP += countMastered(exam.topics || []) * 50; 
    });
    return Math.max(auditXP, savedXP);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/storage');
        const data = await response.json();
        let loadedExams = INITIAL_DATA;
        if (data.exams && data.exams.length > 0) loadedExams = data.exams;
        setExams(loadedExams);
        setXp(recalibrateXP(loadedExams, data.xp || 0));
        if (data.gauntlet) setGauntlet(data.gauntlet);
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
          body: JSON.stringify({ exams, xp, gauntlet }), 
        });
      } catch (error) { showToast("Failed to save data!", "error"); } 
      finally { setTimeout(() => setIsSaving(false), 800); }
    };
    const timeoutId = setTimeout(() => saveData(), 1000); 
    return () => clearTimeout(timeoutId);
  }, [exams, xp, gauntlet, isLoaded]);

  useEffect(() => {
      const updated = achievements.map(a => ({ ...a, unlocked: a.unlocked || a.condition(exams, xp) }));
      const newUnlock = updated.find((a, i) => a.unlocked && !achievements[i].unlocked);
      if (newUnlock) showToast(`🏆 Achievement Unlocked: ${newUnlock.title}!`, 'success');
      if (JSON.stringify(updated) !== JSON.stringify(achievements)) setAchievements(updated);
  }, [exams, xp]);

  const updateQuestProgress = (type: 'hours' | 'units' | 'mastery', amount: number) => {
      setQuests(prev => prev.map(q => {
          if (q.type === type && !q.isClaimed) {
              return { ...q, current: Math.min(q.target, q.current + amount) };
          }
          return q;
      }));
  };

  const handleClaimReward = (questId: string) => {
      const quest = quests.find(q => q.id === questId);
      if (quest && !quest.isClaimed && quest.current >= quest.target) {
          setXp(prev => prev + quest.reward);
          setQuests(prev => prev.map(q => q.id === questId ? { ...q, isClaimed: true } : q));
          showToast(`Claimed ${quest.reward} XP!`, 'success');
      }
  };

  const handleStartGauntlet = (wager: number, targetHours: number, durationMinutes: number) => {
      if (wager > xp) { showToast("Insufficient XP!", "error"); return; }
      setXp(prev => prev - wager);
      setGauntlet({ isActive: true, startTime: Date.now(), durationMinutes, targetHours, wager, currentHours: 0, status: 'pending' });
      showToast(`Gauntlet Started! -${wager} XP`, 'info');
  };

  const handleSurrenderGauntlet = () => {
      setGauntlet(prev => ({ ...prev, status: 'lost' }));
      showToast("Gauntlet Failed. XP Lost.", "error");
  };

  const handleClaimGauntlet = () => {
      if (gauntlet.status === 'won') {
          setXp(prev => prev + (gauntlet.wager * 2));
          showToast(`Victory! +${gauntlet.wager * 2} XP`, 'success');
          setAchievements(prev => prev.map(a => a.id === 'risk_taker' ? { ...a, unlocked: true } : a));
      }
      setGauntlet({ isActive: false, startTime: 0, durationMinutes: 0, targetHours: 0, wager: 0, currentHours: 0, status: 'pending' });
  };

  const handleSmartFocus = (id: string) => {
    setExpandedExamId(id);
    setTimeout(() => {
        const element = document.getElementById(`exam-card-${id}`);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleTopicStatusChange = (examId: string, topicId: string, newStatus: 'bad' | 'ok' | 'good') => {
    if (newStatus === 'good') {
        showToast("Topic mastered!", "success");
        updateQuestProgress('mastery', 1);
        setXp(prev => prev + 50);
    }
  };

  const handleUpdateTopicStatus = (examId: string, topicId: string, newStatus: 'bad' | 'ok' | 'good') => {
    const updateTopicDeep = (list: Topic[]): Topic[] => {
        return list.map(t => {
            if (t.id === topicId) return { ...t, status: newStatus };
            if (t.subtopics) return { ...t, subtopics: updateTopicDeep(t.subtopics) };
            return t;
        });
    };
    setExams(exams.map(e => {
        if (e.id !== examId) return e;
        return { ...e, topics: updateTopicDeep(e.topics || []) };
    }));
    handleTopicStatusChange(examId, topicId, newStatus);
  };

  const handleAddUnit = (examId: string, name: string, hours: number, testsTaken: number, avgScore: number) => {
    const newUnit: Unit = { id: Date.now().toString(), name, hours, testsTaken, avgScore, lastStudied: new Date().toISOString() };
    setExams(exams.map(e => {
        if (e.id !== examId) return e;
        const tempExam = { ...e, units: [...e.units, newUnit] };
        return { ...e, units: [...e.units, newUnit], history: [...(e.history || []), { date: new Date().toISOString(), score: calculatePreparedness(tempExam) }] };
    }));
    showToast(`Unit added!`, 'success');
    
    updateQuestProgress('hours', hours);
    updateQuestProgress('units', 1);
    setXp(prev => prev + (hours * 10) + 50);

    if (gauntlet.isActive && gauntlet.status === 'pending') {
        const newTotal = gauntlet.currentHours + hours;
        setGauntlet(prev => ({ ...prev, currentHours: newTotal, status: newTotal >= prev.targetHours ? 'won' : 'pending' }));
        if (newTotal >= gauntlet.targetHours) showToast("Gauntlet Objectives Met!", "success");
    }
  };

  const handleAddExam = (subject: string, date: string, time: string, credits: number, familiarity: number) => {
    const newExam: Exam = { id: Date.now().toString(), subject, date, time, credits, familiarity, units: [], history: [{ date: new Date().toISOString(), score: familiarity }], notes: '', topics: [] };
    setExams([...exams, newExam]);
    showToast(`Added "${subject}"`, 'success'); 
    setXp(prev => prev + 100);
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
  const handleImportUnits = (examId: string, newUnits: Unit[]) => { setExams(exams.map(e => e.id === examId ? { ...e, units: [...e.units, ...newUnits] } : e)); showToast(`Imported units`, 'success'); };
  const handleDeleteUnit = (examId: string, unitId: string) => { setExams(exams.map(e => e.id === examId ? { ...e, units: e.units.filter(u => u.id !== unitId) } : e)); showToast("Unit removed", 'info'); };

  if (!isLoaded) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} exams={exams} />
      <TrophyRoom isOpen={isTrophyOpen} onClose={() => setIsTrophyOpen(false)} achievements={achievements} />

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 font-sans">
        
        {/* --- OPTIMIZED HEADER: 3-COLUMN GRID --- */}
        <section className="transition-all duration-500 ease-in-out">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Academic Analytics</h1>
                    <div className={cn("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 transition-all", isSaving ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400")}>
                        <HardDrive size={12} /> {isSaving ? "Saving..." : "Saved"}
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowGamification(!showGamification)}
                    className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 hover:text-indigo-600 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
                    title={showGamification ? "Collapse" : "Expand"}
                >
                    {showGamification ? "Collapse Career" : "Expand Career"}
                    {showGamification ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {showGamification ? (
                <header className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 fade-in duration-300">
                    
                    {/* COL 1 & 2: JOURNEY PATH (Wide) */}
                    <div className="lg:col-span-2 h-full">
                        <JourneyPath totalXP={xp} level={Math.floor(xp / 1000) + 1} onOpenTrophies={() => setIsTrophyOpen(true)} />
                    </div>
                    
                    {/* COL 3: GAUNTLET (Compact) */}
                    <div className="lg:col-span-1 h-full">
                        <GauntletWidget 
                            challenge={gauntlet} 
                            currentXP={xp} 
                            onStartGauntlet={handleStartGauntlet} 
                            onSurrender={handleSurrenderGauntlet} 
                            onClaimGauntlet={handleClaimGauntlet} 
                        />
                    </div>

                    {/* COL 4: DAILY OPS (Compact) */}
                    <div className="lg:col-span-1 h-full">
                        <DailyQuestWidget quests={quests} onClaimReward={handleClaimReward} />
                    </div>
                </header>
            ) : (
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-700 dark:text-indigo-300 text-sm font-bold">
                            <Trophy size={16} /> Lvl {Math.floor(xp / 1000) + 1}
                        </div>
                        <div className="h-2 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                            <div className="h-full bg-indigo-500 absolute top-0 left-0" style={{ width: `${(xp % 1000) / 10}%` }}></div>
                        </div>
                        <span className="text-xs font-mono text-slate-400">{xp} XP</span>
                    </div>
                    {gauntlet.isActive && (
                        <div className="flex items-center gap-2 text-rose-500 text-xs font-bold animate-pulse">
                            <Flame size={14} /> Gauntlet Active
                        </div>
                    )}
                </div>
            )}
        </section>

        {/* ... (Controls Bar & Tabs) ... */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 sticky top-0 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm z-40 border-b border-slate-200 dark:border-slate-800">
            <BulletinBoard exams={exams} />
            <div className="flex items-center gap-3">
                <button onClick={() => setIsProfileOpen(true)} className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-2xl flex items-center justify-center border-2 border-indigo-200 dark:border-indigo-700 hover:scale-105 transition-transform shadow-sm" title="Profile">🧙‍♂️</button>
                <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700" title="Theme">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center">
                    <button onClick={() => setActiveTab('dashboard')} className={cn("px-4 py-2 rounded-lg text-sm font-bold flex gap-2", activeTab === 'dashboard' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('timetable')} className={cn("px-4 py-2 rounded-lg text-sm font-bold flex gap-2", activeTab === 'timetable' ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500")}>
                        <Calendar size={16} /> Timetable
                    </button>
                </div>
            </div>
        </div>

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
                              onTopicStatusChange={handleTopicStatusChange} 
                          />
                      ))}
                  </div>
                  <AnalyticsDashboard exams={exams} />
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
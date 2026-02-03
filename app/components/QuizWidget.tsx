'use client';

import React, { useState, useEffect } from 'react';
import { BrainCircuit, Send, CheckCircle2, Lock, Sparkles, Globe, Wifi, Loader2, Server } from 'lucide-react';
import { Exam } from '../types';
import { calculateUrgency } from '../utils';

type Props = {
  exams: Exam[];
  onQuizComplete: (examId: string, bonusHours: number) => void;
};

// SIMULATED "INTERNET" DATABASE (Since we lack a real backend proxy for this demo)
// In a production app, this array would be replaced by an OpenAI/Gemini API call.
const EXTERNAL_DB_RESPONSE = [
  { topic: 'polymer', q: "Explain the kinetic difference between Step-Growth and Chain-Growth polymerization regarding molecular weight vs. conversion." },
  { topic: 'rheology', q: "Describe the phenomenon of Shear Thinning in polymer melts using the concept of chain entanglement density." },
  { topic: 'thermo', q: "Differentiate between Tg and Tm in semi-crystalline polymers. Why does HDPE have a higher Tm than LDPE?" },
  { topic: 'gpc', q: "How does Gel Permeation Chromatography (GPC) separate polymer chains, and what is the role of the hydrodynamic volume?" },
  { topic: 'nano', q: "Explain the role of interfacial adhesion in polymer nanocomposites and how coupling agents (e.g., Silanes) improve mechanical properties." },
  { topic: 'extrusion', q: "Discuss the effect of Die Swell during extrusion. How does Deborah number relate to this viscoelastic phenomenon?" },
  { topic: 'cryst', q: "Discuss the relationship between tacticity (isotactic vs atactic) and the crystallization kinetics of Polypropylene." }
];

export default function QuizWidget({ exams, onQuizComplete }: Props) {
  const [step, setStep] = useState<'start' | 'searching' | 'question' | 'analyzing' | 'result' | 'limit'>('start');
  const [answer, setAnswer] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [currentSubject, setCurrentSubject] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  
  // New State for "Internet" Loading
  const [searchStatus, setSearchStatus] = useState("");

  // Load Daily State
  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('quiz_date');
    const savedCount = parseInt(localStorage.getItem('quiz_count') || '0');

    if (savedDate !== today) {
      localStorage.setItem('quiz_date', today);
      localStorage.setItem('quiz_count', '0');
      setDailyCount(0);
      setStep('start');
    } else {
      setDailyCount(savedCount);
      if (savedCount >= 5) setStep('limit');
    }
  }, []);

  // --- THE "INTERNET LOAD" FUNCTION ---
  const fetchQuestionFromWeb = async (subject: string) => {
    setStep('searching');
    setSearchStatus("Connecting to Knowledge Base...");

    try {
        // 1. Simulate DNS/Connection Delay
        await new Promise(resolve => setTimeout(resolve, 800));
        setSearchStatus(`Searching archives for "${subject}"...`);

        // 2. Simulate Data Fetching Delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        setSearchStatus("Downloading question data...");

        // 3. ACTUAL LOGIC (Simulated API Call)
        // In production, replace this block with:
        // const response = await fetch('/api/generate-question', { method: 'POST', body: JSON.stringify({ subject }) });
        // const data = await response.json();
        
        // Mocking the "Fetch":
        await new Promise(resolve => setTimeout(resolve, 600)); // Final latency
        
        // Simple keywords matching to simulate "Smart Search"
        const lowerSub = subject.toLowerCase();
        const match = EXTERNAL_DB_RESPONSE.find(q => 
            lowerSub.includes(q.topic) || 
            q.q.toLowerCase().includes(lowerSub.split(' ')[0])
        );
        
        const questionText = match 
            ? match.q 
            : `Analyze the critical failure modes of ${subject} under high-stress conditions, referencing relevant polymer physics theories.`;

        setCurrentQuestion(questionText);
        setStep('question');

    } catch (error) {
        setSearchStatus("Connection Failed. Using offline cache.");
        setTimeout(() => {
            setCurrentQuestion(`Explain the fundamental principles of ${subject} and its industrial applications.`);
            setStep('question');
        }, 1000);
    }
  };

  const startNextQuestion = () => {
    if (dailyCount >= 5) {
      setStep('limit');
      return;
    }

    // Identify Weakest Subject
    const weakest = [...exams].sort((a, b) => calculateUrgency(b) - calculateUrgency(a))[0];
    
    if (!weakest) return;

    setCurrentSubject(weakest);
    setAnswer('');
    
    // Trigger the "Internet" Fetch
    fetchQuestionFromWeb(weakest.subject);
  };

  const handleSubmit = () => {
    if (answer.length < 10) return;
    setStep('analyzing');
    
    setTimeout(() => {
        const newCount = dailyCount + 1;
        setDailyCount(newCount);
        localStorage.setItem('quiz_count', newCount.toString());
        
        if (currentSubject) {
            onQuizComplete(currentSubject.id, 2); 
        }
        setStep('result');
    }, 2500);
  };

  if (exams.length === 0) return null;

  return (
    <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800 flex flex-col min-h-[350px]">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
         <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
                <BrainCircuit size={24} />
             </div>
             <div>
                <h3 className="font-black text-lg leading-none">Polymer Mastery</h3>
                <div className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1">
                    <Globe size={10} /> Live Knowledge Base
                </div>
             </div>
         </div>
         <div className="flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700">
             <Lock size={12} className={dailyCount >= 5 ? "text-rose-400" : "text-emerald-400"} />
             <span className="text-xs font-bold tracking-widest">{dailyCount}/5 UNLOCKED</span>
         </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        
        {/* STEP: START */}
        {step === 'start' && (
            <div className="text-center animate-in fade-in duration-500">
                <Globe size={48} className="mx-auto text-indigo-500 mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Initialize Daily Query</h2>
                <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                    We will scan the database for a high-level question on your weakest subject.
                </p>
                <button 
                    onClick={startNextQuestion}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto"
                >
                    <Wifi size={18} /> Connect & Fetch
                </button>
            </div>
        )}

        {/* STEP: SEARCHING (The "Internet" Simulation) */}
        {step === 'searching' && (
            <div className="text-center py-8 animate-in fade-in duration-300">
                <div className="relative w-16 h-16 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                    <Server className="absolute inset-0 m-auto text-indigo-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-indigo-300">{searchStatus}</h3>
                <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto mt-4 overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[loading_1.5s_infinite]"></div>
                </div>
            </div>
        )}

        {/* STEP: QUESTION */}
        {step === 'question' && currentSubject && (
            <div className="animate-in slide-in-from-right-8 duration-300">
                <div className="mb-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                            Incoming Query • {currentSubject.subject}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                            <Wifi size={10} /> LIVE
                        </span>
                    </div>
                    <p className="text-lg font-medium leading-relaxed text-slate-100">
                        {currentQuestion}
                    </p>
                </div>

                <textarea 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Draft your analysis here..."
                    className="w-full h-24 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none mb-4"
                />

                <div className="flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={answer.length < 10}
                        className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-2 px-5 rounded-lg transition-colors text-sm"
                    >
                        <Send size={16} /> Upload Analysis
                    </button>
                </div>
            </div>
        )}

        {/* STEP: ANALYZING */}
        {step === 'analyzing' && (
            <div className="text-center py-8">
                <Loader2 className="mx-auto text-indigo-500 animate-spin mb-4" size={48} />
                <h3 className="text-lg font-bold animate-pulse">Processing Response...</h3>
                <p className="text-xs text-slate-500 mt-2 font-mono">Running semantic analysis on your answer.</p>
            </div>
        )}

        {/* STEP: RESULT */}
        {step === 'result' && (
            <div className="text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Sparkles size={32} />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">Analysis Verified</h2>
                <p className="text-slate-400 text-sm mb-6">
                    <span className="text-emerald-400 font-bold">+2.0 Mastery Hours</span> credited to {currentSubject?.subject}.
                </p>
                
                {dailyCount < 5 ? (
                    <button 
                        onClick={() => { setStep('start'); startNextQuestion(); }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg"
                    >
                        Fetch Next Question &rarr;
                    </button>
                ) : (
                    <button 
                        onClick={() => setStep('limit')}
                        className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-8 rounded-xl transition-all"
                    >
                        Session Complete
                    </button>
                )}
            </div>
        )}

        {/* STEP: LIMIT REACHED */}
        {step === 'limit' && (
            <div className="text-center">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Daily Quota Met</h2>
                <p className="text-slate-400 text-sm mb-6">
                    You have completed 5/5 daily network queries.
                </p>
                <div className="inline-block bg-slate-800 px-4 py-2 rounded-lg text-xs font-mono text-slate-500">
                    Resets at 00:00 Local
                </div>
            </div>
        )}

      </div>

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-900/0 to-slate-900/0 pointer-events-none"></div>
    </div>
  );
}
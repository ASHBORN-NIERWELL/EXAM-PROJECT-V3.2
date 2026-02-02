'use client';

import React, { useState } from 'react';
import { Plus, HelpCircle } from 'lucide-react';

type Props = {
  onAdd: (subject: string, date: string, time: string, credits: number, familiarity: number) => void;
};

export default function ExamInputForm({ onAdd }: Props) {
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [credits, setCredits] = useState(3);
  const [familiarity, setFamiliarity] = useState(50);

  const handleSubmit = () => {
    if (!subject || !date || !time) return;
    onAdd(subject, date, time, credits, familiarity);
    setSubject(''); setDate(''); setTime(''); setCredits(3); setFamiliarity(50);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/50 border border-slate-100 dark:border-slate-700 flex flex-col gap-6 transition-colors">
      
      {/* Row 1: Basic Info */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
            <label htmlFor="subject-input" className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase ml-1 block mb-1">Subject Name</label>
            <input 
              id="subject-input"
              title="Subject Name"
              placeholder="e.g. Polymer Chemistry"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent dark:border-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
        </div>
        
        <div className="w-24">
            <label htmlFor="credits-input" className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-1">Credits</label>
            <input 
              id="credits-input"
              title="Credits"
              placeholder="3"
              type="number"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value))}
              className="w-full p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent dark:border-slate-700"
            />
        </div>

        <div className="w-full md:w-auto">
             <label htmlFor="date-input" className="text-xs font-bold text-slate-400 uppercase ml-1 block mb-1">Date & Time</label>
            <div className="flex gap-2">
                <input 
                  id="date-input"
                  title="Exam Date"
                  placeholder="Select Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-lg font-medium text-slate-600 dark:text-slate-300 focus:outline-none border border-transparent dark:border-slate-700" 
                />
                <input 
                  id="time-input"
                  title="Exam Time"
                  placeholder="Select Time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="p-3 bg-slate-50 dark:bg-slate-900 dark:text-white rounded-lg font-medium text-slate-600 dark:text-slate-300 focus:outline-none border border-transparent dark:border-slate-700" 
                />
            </div>
        </div>
      </div>

      {/* Row 2: Familiarity Slider */}
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
        <div className="shrink-0 text-indigo-500 dark:text-indigo-400">
            <HelpCircle size={20} />
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
                <label htmlFor="familiarity-slider" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Initial Familiarity</label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded">{familiarity}%</span>
            </div>
            <input 
                id="familiarity-slider"
                title="Familiarity Score"
                type="range" 
                min="0" 
                max="100" 
                value={familiarity} 
                onChange={(e) => setFamiliarity(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
            />
        </div>
        <button 
            onClick={handleSubmit}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg shadow-lg shadow-indigo-200 dark:shadow-none transition-all shrink-0"
            title="Add Subject"
        >
            <Plus size={20} />
        </button>
      </div>
    </div>
  );
}
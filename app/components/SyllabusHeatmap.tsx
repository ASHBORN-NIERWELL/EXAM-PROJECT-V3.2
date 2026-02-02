'use client';

import React, { useState } from 'react';
import { Plus, X, BrainCircuit, AlertCircle } from 'lucide-react';
import { Topic } from '../types';
import { cn } from '../utils'; // Fixed: Import cn

type Props = {
  topics: Topic[];
  onUpdateTopics: (newTopics: Topic[]) => void;
};

export default function SyllabusHeatmap({ topics = [], onUpdateTopics }: Props) {
  const [newTopic, setNewTopic] = useState('');

  const handleAdd = () => {
    if (!newTopic.trim()) return;
    
    // Fixed: Explicitly typed as Topic to satisfy TypeScript
    const topic: Topic = {
      id: Date.now().toString(),
      name: newTopic,
      status: 'bad', 
    };
    
    onUpdateTopics([...topics, topic]);
    setNewTopic('');
  };

  const cycleStatus = (id: string) => {
    const updated = topics.map((t) => {
      if (t.id !== id) return t;
      // Cycle: bad -> ok -> good -> bad
      const nextStatus: Topic['status'] = t.status === 'bad' ? 'ok' : t.status === 'ok' ? 'good' : 'bad';
      return { ...t, status: nextStatus };
    });
    onUpdateTopics(updated);
  };

  const removeTopic = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    onUpdateTopics(topics.filter((t) => t.id !== id));
  };

  const styles = {
    bad: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800 hover:bg-rose-200 dark:hover:bg-rose-900/50',
    ok: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/50',
    good: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
  };

  const mastery = Math.round(
    (topics.filter((t) => t.status === 'good').length / (topics.length || 1)) * 100
  );

  return (
    <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
      
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
            <BrainCircuit size={16} /> Syllabus Coverage
        </h4>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", mastery === 100 ? "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" : "text-slate-400 bg-slate-200 dark:bg-slate-700")}>
            {mastery}% Mastered
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add topic (e.g. Carnot Cycle)"
          className="flex-1 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button 
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 text-white p-2 rounded-lg transition-colors"
          title="Add Topic" // Fixed: Added Title
          aria-label="Add Topic"
        >
          <Plus size={20} />
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-4 text-xs text-slate-400 italic flex flex-col items-center gap-2">
            <AlertCircle size={16} />
            Break your subject down into small topics here.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div 
              key={topic.id}
              onClick={() => cycleStatus(topic.id)}
              className={cn(
                "cursor-pointer select-none px-3 py-1.5 rounded-lg border text-xs font-bold transition-all active:scale-95 flex items-center gap-2 group relative pr-7",
                styles[topic.status]
              )}
              title="Click to cycle status"
            >
              {topic.name}
              
              <button 
                onClick={(e) => removeTopic(topic.id, e)}
                className="absolute right-1 p-1 opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-all"
                title="Remove Topic" // Fixed: Added Title
                aria-label="Remove Topic"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {topics.length > 0 && (
          <div className="mt-4 flex gap-4 justify-center text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400"></div> Panic</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Review</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Ready</span>
          </div>
      )}
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import { Plus, X, BrainCircuit, AlertCircle, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import { Topic } from '../types';
import { cn } from '../utils';

type Props = {
  topics: Topic[];
  onUpdateTopics: (newTopics: Topic[]) => void;
};

export default function SyllabusHeatmap({ topics = [], onUpdateTopics }: Props) {
  const [newTopic, setNewTopic] = useState('');

  // 1. Recursive Helper: UPDATE
  const updateTopicDeep = (list: Topic[], id: string, transform: (t: Topic) => Topic): Topic[] => {
    return list.map(t => {
      if (t.id === id) return transform(t);
      if (t.subtopics) return { ...t, subtopics: updateTopicDeep(t.subtopics, id, transform) };
      return t;
    });
  };

  // 2. NEW Recursive Helper: DELETE
  const removeTopicDeep = (list: Topic[], id: string): Topic[] => {
    return list
      .filter(t => t.id !== id) // Remove if ID matches
      .map(t => ({
        ...t,
        subtopics: t.subtopics ? removeTopicDeep(t.subtopics, id) : [] // Recurse into children
      }));
  };

  const cycleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle = (status: string) => status === 'bad' ? 'ok' : status === 'ok' ? 'good' : 'bad';
    const updated = updateTopicDeep(topics, id, (t) => ({ ...t, status: cycle(t.status) as any }));
    onUpdateTopics(updated);
  };

  const toggleExpand = (id: string) => {
    const updated = updateTopicDeep(topics, id, (t) => ({ ...t, isOpen: !t.isOpen }));
    onUpdateTopics(updated);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop click from triggering expand
    const updated = removeTopicDeep(topics, id);
    onUpdateTopics(updated);
  };

  const handleAddTopLevel = () => {
    if (!newTopic.trim()) return;
    const topic: Topic = { id: Date.now().toString(), name: newTopic, status: 'bad', subtopics: [], isOpen: true };
    onUpdateTopics([...topics, topic]);
    setNewTopic('');
  };

  const statusColors = {
    bad: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    ok: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
  };

  const renderTree = (nodes: Topic[], depth = 0) => {
    return nodes.map(node => (
      <div key={node.id} className={cn("mb-2 group", depth > 0 && "ml-4")}>
        <div 
            className={cn(
                "flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all hover:brightness-95 pr-3",
                statusColors[node.status]
            )}
            onClick={() => toggleExpand(node.id)}
            title="Click to expand/collapse"
        >
            {/* Expander Arrow */}
            {node.subtopics && node.subtopics.length > 0 ? (
                node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : <div className="w-3.5" />} 

            <span className="flex-1 text-sm font-bold truncate">{node.name}</span>
            
            {/* Status Cycle Circle */}
            <div 
                className="w-3 h-3 rounded-full border border-current opacity-60 hover:opacity-100 hover:scale-125 transition-all mr-2"
                onClick={(e) => cycleStatus(node.id, e)}
                title="Cycle Status (Red -> Yellow -> Green)"
            ></div>

            {/* NEW: Remove Button (Hidden until hover) */}
            <button 
                onClick={(e) => handleRemove(node.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/10 dark:hover:bg-white/20 rounded transition-all text-current"
                title="Remove Topic"
                aria-label="Remove Topic"
            >
                <Trash2 size={12} />
            </button>
        </div>

        {node.isOpen && node.subtopics && (
            <div className="mt-2 border-l-2 border-slate-100 dark:border-slate-700 pl-2">
                {renderTree(node.subtopics, depth + 1)}
            </div>
        )}
      </div>
    ));
  };

  const flatten = (nodes: Topic[]): Topic[] => nodes.flatMap(n => [n, ...(n.subtopics ? flatten(n.subtopics) : [])]);
  const allNodes = flatten(topics);
  const mastery = allNodes.length > 0 
    ? Math.round((allNodes.filter(t => t.status === 'good').length / allNodes.length) * 100) 
    : 0;

  return (
    <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
      
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
            <BrainCircuit size={16} /> Syllabus Tree
        </h4>
        <span className={cn("text-xs font-bold px-2 py-0.5 rounded", mastery === 100 ? "text-emerald-500 bg-emerald-100" : "text-slate-400 bg-slate-200 dark:bg-slate-700")}>
            {mastery}% Mastered
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        <input 
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddTopLevel()}
          placeholder="Add main topic..."
          className="flex-1 bg-white dark:bg-slate-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <button 
            onClick={handleAddTopLevel} 
            className="bg-indigo-600 text-white p-2 rounded-lg"
            title="Add Topic"
            aria-label="Add Topic"
        >
          <Plus size={20} />
        </button>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400 italic">
            <AlertCircle size={16} className="mx-auto mb-2 opacity-50" />
            Use "Auto-Map" to generate a syllabus tree.
        </div>
      ) : (
        <div className="animate-in fade-in">
            {renderTree(topics)}
        </div>
      )}
    </div>
  );
}
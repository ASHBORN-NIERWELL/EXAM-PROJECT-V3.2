'use client';

import React, { useState } from 'react';
import { Upload, X, Check, FileText } from 'lucide-react';
import { Unit } from '../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (units: Unit[]) => void;
};

export default function UnitImporter({ isOpen, onClose, onImport }: Props) {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleParse = () => {
    // 1. Split by new lines
    const lines = text.split('\n');
    
    // 2. Filter and clean lines (remove bullets like -, *, 1.)
    const newUnits: Unit[] = lines
      .map(line => line.trim())
      .filter(line => line.length > 2) // Ignore empty/short lines
      .filter(line => /^[-\*•\d]/.test(line) || line.length > 0) // Must look like a list item or text
      .map(line => {
        // Remove markdown bullets (*, -) and numbers (1.)
        const cleanName = line.replace(/^[-\*•\d\.]+\s*/, '').trim();
        return {
          id: Date.now() + Math.random().toString(), // Unique ID
          name: cleanName,
          hours: 0,       // Default start
          testsTaken: 0,  // Default start
          avgScore: 0     // Default start
        };
      });

    onImport(newUnits);
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Upload size={20} /> Import from NotebookLM
            </h3>
            <p className="text-indigo-200 text-sm mt-1">Paste your study outline or mind map text below.</p>
          </div>
          {/* FIX: Added aria-label and title here */}
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white transition-colors"
            aria-label="Close Import Modal"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 flex gap-2">
            <FileText size={16} className="shrink-0 mt-0.5" />
            <p>
              <strong>Tip:</strong> In NotebookLM, ask: <em>&quot;Generate a hierarchical text outline of this source.&quot;</em> Then copy and paste that list here.
            </p>
          </div>

          <label htmlFor="import-text" className="sr-only">Paste Outline Text</label>
          <textarea 
            id="import-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="- Thermodynamics&#10;- Fluid Mechanics&#10;- Heat Transfer..."
            className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono"
          />

          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-lg"
            >
              Cancel
            </button>
            <button 
              onClick={handleParse}
              disabled={!text}
              className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Check size={18} /> Parse & Add Units
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
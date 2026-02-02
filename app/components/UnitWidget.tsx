'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Unit } from '../types';
import { cn } from '../utils';

type Props = {
  units: Unit[];
  onAddUnit: (name: string, hours: number, tests: number, score: number) => void;
  onDeleteUnit: (unitId: string) => void;
  onDeleteExam: () => void;
};

export default function UnitWidget({ units, onAddUnit, onDeleteUnit, onDeleteExam }: Props) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState(0);
  const [tests, setTests] = useState(0);
  const [score, setScore] = useState(0);

  const handleAdd = () => {
    if (!name) return;
    onAddUnit(name, hours, tests, score);
    setName(''); setHours(0); setTests(0); setScore(0);
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-6 animate-in slide-in-from-top-4 duration-300">
      {/* List of Units */}
      <div className="space-y-3 mb-6">
        {units.map(unit => (
          <div key={unit.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex-1">
              <div className="font-bold text-slate-700">{unit.name}</div>
              <div className="text-xs text-slate-400">{unit.hours} hrs studied • {unit.testsTaken} tests</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn("text-sm font-bold px-2 py-1 rounded", unit.avgScore < 50 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600")}>
                {unit.avgScore}% Avg
              </div>
              <button 
                onClick={() => onDeleteUnit(unit.id)} 
                aria-label={`Delete unit ${unit.name}`}
                title="Delete Unit"
                className="text-slate-300 hover:text-red-500"
              >
                <Trash2 size={16}/>
              </button>
            </div>
          </div>
        ))}
        {units.length === 0 && <div className="text-center text-sm text-slate-400 py-4">No units added yet.</div>}
      </div>

      {/* Add Unit Form */}
      <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Add Progress Log</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input 
            aria-label="Unit Name"
            placeholder="Unit Name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            className="col-span-1 md:col-span-4 p-2 bg-slate-50 rounded border border-slate-200 text-sm"
          />
          <div>
            <label htmlFor="u-hours" className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Hours</label>
            <input 
                id="u-hours"
                aria-label="Study Hours"
                type="number" 
                value={hours} 
                onChange={e => setHours(parseInt(e.target.value))} 
                className="w-full p-2 bg-slate-50 rounded border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="u-tests" className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tests</label>
            <input 
                id="u-tests"
                aria-label="Tests Taken"
                type="number" 
                value={tests} 
                onChange={e => setTests(parseInt(e.target.value))} 
                className="w-full p-2 bg-slate-50 rounded border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label htmlFor="u-score" className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Score %</label>
            <input 
                id="u-score"
                aria-label="Score Percentage"
                type="number" 
                value={score} 
                onChange={e => setScore(parseInt(e.target.value))} 
                className="w-full p-2 bg-slate-50 rounded border border-slate-200 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button 
                onClick={handleAdd} 
                aria-label="Add Unit Log"
                className="w-full p-2 bg-slate-800 text-white text-sm font-bold rounded hover:bg-slate-900"
            >
                Add Log
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-end">
        <button 
            onClick={onDeleteExam} 
            aria-label="Delete Entire Subject"
            className="text-xs text-red-500 hover:underline"
        >
            Delete Subject
        </button>
      </div>
    </div>
  );
}
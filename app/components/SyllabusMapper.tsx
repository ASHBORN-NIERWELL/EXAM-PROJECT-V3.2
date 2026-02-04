'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, X, Network, ChevronRight, Check, Loader2, Upload, FileText } from 'lucide-react';
import { Topic } from '../types';

type Props = {
  subject: string;
  isOpen: boolean;
  onClose: () => void;
  onImport: (topics: Topic[]) => void;
};

const MOCK_SYLLABUS_DB: Record<string, any[]> = {
  'default': [
    { name: "Fundamental Concepts", subs: ["Definitions & Scope", "Historical Context", "Basic Principles"] },
    { name: "Core Theories", subs: ["Theoretical Framework", "Mathematical Models", "Critical Analysis"] },
    { name: "Advanced Applications", subs: ["Industrial Case Studies", "Modern Innovations", "Future Trends"] }
  ],
  'polymer': [
    { name: "Polymer Synthesis", subs: ["Step-Growth Polymerization", "Chain-Growth Polymerization", "Copolymerization Kinetics", "Catalysis Systems (Ziegler-Natta)"] },
    { name: "Physical Properties", subs: ["Molecular Weight Distribution", "Glass Transition (Tg)", "Crystallinity & Melting", "Viscoelasticity & Rheology"] },
    { name: "Characterization Tech", subs: ["GPC / SEC", "DSC & TGA Analysis", "NMR Spectroscopy", "X-Ray Diffraction"] },
    { name: "Processing Methods", subs: ["Extrusion Technology", "Injection Molding", "Thermoforming", "3D Printing Polymers"] }
  ],
  'electromagnetic': [
    { name: "Electrostatics", subs: ["Coulomb's Law", "Gauss's Law", "Electric Potential", "Dielectrics"] },
    { name: "Magnetostatics", subs: ["Biot-Savart Law", "Ampere's Law", "Magnetic Vector Potential", "Magnetization"] },
    { name: "Electrodynamics", subs: ["Maxwell's Equations", "Faraday's Law", "Inductance", "Energy in Fields"] },
    { name: "EM Waves", subs: ["Wave Equation", "Poynting Vector", "Reflection & Refraction", "Waveguides"] }
  ]
};

export default function SyllabusMapper({ subject, isOpen, onClose, onImport }: Props) {
  const [step, setStep] = useState<'idle' | 'scanning' | 'generating' | 'review'>('idle');
  const [generatedTree, setGeneratedTree] = useState<Topic[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoMap = () => {
    setStep('scanning');
    setTimeout(() => {
        setStep('generating');
        const key = Object.keys(MOCK_SYLLABUS_DB).find(k => subject.toLowerCase().includes(k)) || 'default';
        const template = MOCK_SYLLABUS_DB[key];

        const tree: Topic[] = template.map((section, idx) => ({
            id: Date.now().toString() + idx,
            name: section.name,
            status: 'bad',
            isOpen: true,
            subtopics: section.subs.map((sub: string, sIdx: number) => ({
                id: Date.now().toString() + idx + sIdx + 999,
                name: sub,
                status: 'bad'
            }))
        }));

        setTimeout(() => {
            setGeneratedTree(tree);
            setStep('review');
        }, 1500);
    }, 1500);
  };

  const parseMarkdown = (text: string): Topic[] => {
    const lines = text.split('\n');
    const tree: Topic[] = [];
    let currentTopic: Topic | null = null;

    lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('#')) {
            const name = trimmed.replace(/^#+\s*/, '');
            currentTopic = {
                id: `md-${Date.now()}-${idx}`,
                name: name,
                status: 'bad',
                isOpen: true,
                subtopics: []
            };
            tree.push(currentTopic);
        } 
        else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
            const name = trimmed.replace(/^[-*]\s*/, '');
            const subTopic: Topic = {
                id: `md-sub-${Date.now()}-${idx}`,
                name: name,
                status: 'bad'
            };

            if (currentTopic) {
                currentTopic.subtopics?.push(subTopic);
            } else {
                currentTopic = {
                    id: `md-gen-${Date.now()}`,
                    name: "General Concepts",
                    status: 'bad',
                    isOpen: true,
                    subtopics: [subTopic]
                };
                tree.push(currentTopic);
            }
        }
    });

    return tree;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep('scanning');

    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        const tree = parseMarkdown(text);
        
        setTimeout(() => {
            setGeneratedTree(tree);
            setStep('review');
        }, 800);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onImport(generatedTree);
    onClose();
    setStep('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
                <Network className="text-indigo-500" /> Syllabus Auto-Mapper
            </h3>
            
            {/* FIXED: Added title and aria-label */}
            <button 
                onClick={onClose}
                title="Close Mapper"
                aria-label="Close Mapper"
            >
                <X size={20} className="text-slate-400" />
            </button>
        </div>

        {step === 'idle' && (
            <div className="text-center py-6">
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm px-4">
                    Choose how you want to construct the topic tree for:
                    <br/><span className="font-bold text-indigo-500 text-base block mt-1">{subject}</span>
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={handleAutoMap}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all group"
                        title="Generate automatically using AI"
                    >
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full group-hover:scale-110 transition-transform">
                            <Sparkles size={24} />
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">AI Auto-Map</div>
                        <span className="text-[10px] text-slate-400">Scans academic DBs</span>
                    </button>

                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
                        title="Upload a Markdown file"
                    >
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full group-hover:scale-110 transition-transform">
                            <Upload size={24} />
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200">Upload .MD</div>
                        <span className="text-[10px] text-slate-400">Parse markdown file</span>
                        
                        {/* FIXED: Added title/aria-label to hidden input */}
                        <input 
                            type="file" 
                            accept=".md,.txt" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileUpload}
                            title="Upload Markdown File"
                            aria-label="Upload Markdown File"
                        />
                    </button>
                </div>
            </div>
        )}

        {(step === 'scanning' || step === 'generating') && (
            <div className="text-center py-12">
                <Loader2 size={48} className="mx-auto text-indigo-500 animate-spin mb-4" />
                <h4 className="text-lg font-bold animate-pulse">
                    {step === 'scanning' ? "Parsing Content..." : "Constructing Hierarchy..."}
                </h4>
                <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mt-6 overflow-hidden">
                    <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]"></div>
                </div>
            </div>
        )}

        {step === 'review' && (
            <div className="animate-in slide-in-from-bottom-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 max-h-[300px] overflow-y-auto mb-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                         <p className="text-xs font-bold text-slate-400 uppercase">Preview Generated Tree</p>
                         <span className="text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full">
                            {generatedTree.length} Topics Found
                         </span>
                    </div>
                    
                    {generatedTree.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <FileText size={24} className="mx-auto mb-2 opacity-50"/>
                            No topics found. Check your file format.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {generatedTree.map(topic => (
                                <div key={topic.id}>
                                    <div className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                        <ChevronRight size={14} className="text-slate-400" /> {topic.name}
                                    </div>
                                    <div className="pl-6 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 ml-1.5">
                                        {topic.subtopics?.map(sub => (
                                            <div key={sub.id} className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                • {sub.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => setStep('idle')}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold transition-all"
                    >
                        Back
                    </button>
                    <button 
                        onClick={handleConfirm}
                        disabled={generatedTree.length === 0}
                        className="flex-[2] bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        <Check size={18} /> Confirm Import
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
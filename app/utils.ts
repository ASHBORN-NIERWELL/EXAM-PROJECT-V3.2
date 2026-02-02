import { Exam } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 1. ADDITIVE PREPAREDNESS
export const calculatePreparedness = (exam: Exam): number => {
  let totalScore = exam.familiarity || 0;

  if (exam.units && exam.units.length > 0) {
    const unitBoost = exam.units.reduce((acc, unit) => {
      const hoursContribution = (unit.hours || 0) * 0.5;
      const testContribution = ((unit.avgScore || 0) / 100) * (unit.testsTaken || 0) * 5;
      return acc + hoursContribution + testContribution;
    }, 0);

    totalScore += unitBoost;
  }

  return Math.min(100, Math.round(totalScore));
};

// 2. POMODORO ESTIMATION
export const calculatePomodoro = (exam: Exam, preparedness: number): number => {
  if (preparedness >= 100) return 0;
  const gap = 100 - preparedness;
  const credits = exam.credits || 3;
  const baseSessions = Math.ceil((gap / 25) * (credits / 1.5)); 
  return Math.max(1, baseSessions);
};

// 3. NEW: CENTRALIZED URGENCY SCORE (The "Smart Brain")
// This ensures both widgets agree on what is most important.
export const calculateUrgency = (exam: Exam): number => {
  const gap = 100 - calculatePreparedness(exam);
  
  // Sunk Cost Factor:
  const totalHours = exam.units.reduce((acc, u) => acc + (u.hours || 0), 0);
  const cyclesDone = totalHours * 2;

  // Formula: High Gap & High Credits increase urgency.
  // High "Cycles Done" reduces urgency (to encourage rotating subjects).
  return (gap * (exam.credits || 1)) / (1 + (cyclesDone * 0.2));
};
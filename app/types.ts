export type Unit = {
  id: string;
  name: string;
  hours: number;
  testsTaken: number;
  avgScore: number;
  lastStudied: string;
};

export type Topic = {
  id: string;
  name: string;
  status: 'bad' | 'ok' | 'good';
  subtopics?: Topic[];
  isOpen?: boolean;
};

export type Exam = {
  id: string;
  subject: string;
  date: string;
  time: string;
  credits: number;
  familiarity: number;
  history: { date: string; score: number }[];
  notes: string;
  units: Unit[];
  topics: Topic[];
};

export type Quest = {
  id: string;
  label: string;
  type: 'hours' | 'units' | 'mastery'; 
  target: number; 
  current: number; 
  reward: number; 
  isClaimed: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string; 
  condition: (exams: Exam[], totalXP: number) => boolean; 
  unlocked?: boolean;
};

// --- NEW GAUNTLET TYPE ---
export type GauntletChallenge = {
    isActive: boolean;
    startTime: number; // timestamp
    durationMinutes: number; // e.g. 120 mins
    targetHours: number; // e.g. 2 hours of study
    wager: number; // XP amount
    currentHours: number; // Progress
    status: 'pending' | 'won' | 'lost';
};
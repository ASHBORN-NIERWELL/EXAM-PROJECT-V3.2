export type Unit = {
  id: string;
  name: string;
  hours: number;
  testsTaken: number;
  avgScore: number;
  lastStudied: string;
};

// UPDATED: Recursive Topic Type
export type Topic = {
  id: string;
  name: string;
  status: 'bad' | 'ok' | 'good';
  subtopics?: Topic[]; // <--- The Nested Layer
  isOpen?: boolean;    // <--- UI State for expansion
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
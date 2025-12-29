
export enum Screen {
  DASHBOARD = 'DASHBOARD',
  INTERVIEW_ROOM = 'INTERVIEW_ROOM',
  POST_INTERVIEW = 'POST_INTERVIEW',
  LEARNING = 'LEARNING',
  JOBS = 'JOBS',
  PROFILE = 'PROFILE'
}

export interface User {
  name: string;
  role: string;
  avatar: string;
  readinessScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user' | 'system';
  text: string;
  timestamp: string;
}

export interface InterviewData {
  roleName: string;
  companyName: string;
  startTime: number;
  messages: ChatMessage[];
  scores: {
    communication: number;
    confidence: number;
    technical: number;
    structure: number;
    depth: number;
  };
}

export interface Job {
  id: string;
  company: string;
  role: string;
  matchRate: number;
  location: string;
  logo: string;
}

export interface SkillProgress {
  skill: string;
  level: number; // 0-100
  status: 'weak' | 'moderate' | 'strong';
}

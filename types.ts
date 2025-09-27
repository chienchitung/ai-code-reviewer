
export enum Theme {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export enum Language {
  EN = 'en',
  ZH_TW = 'zh-tw',
}

export enum View {
  Dashboard = 'dashboard',
  Reviewer = 'reviewer',
  Settings = 'settings',
}

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface ReviewIssue {
  severity: Severity;
  category: string;
  lineNumber: number;
  description: string;
  suggestion: string;
}

export interface Review {
  id: string;
  timestamp: number;
  language: string;
  code: string;
  report: string;
  issues: ReviewIssue[];
}

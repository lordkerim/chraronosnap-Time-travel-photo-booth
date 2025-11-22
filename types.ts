export enum AppMode {
  CAPTURE = 'CAPTURE',
  PREVIEW = 'PREVIEW',
  EDITING = 'EDITING',
  ANALYZING = 'ANALYZING'
}

export interface TimeEra {
  id: string;
  label: string;
  prompt: string;
  icon: string;
  description: string;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
  type: 'original' | 'generated' | 'edited';
}

export interface AnalysisResult {
  text: string;
  timestamp: number;
}

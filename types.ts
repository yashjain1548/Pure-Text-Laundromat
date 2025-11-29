export enum CleanAction {
  SMART_DEBREAK = 'SMART_DEBREAK',
  STRIP_FORMATTING = 'STRIP_FORMATTING',
  FIX_SPACING = 'FIX_SPACING',
  SENTENCE_CASE = 'SENTENCE_CASE',
  LAUNDER_ALL = 'LAUNDER_ALL',
  AI_POLISH = 'AI_POLISH',
  AI_SUMMARIZE = 'AI_SUMMARIZE',
}

export interface StatProps {
  label: string;
  value: number | string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}
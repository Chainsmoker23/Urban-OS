export interface ChartMetric {
  label: string;
  value: number;
  unit: string;
}

export interface UrbanAnalysisResponse {
  summary: string;
  keyInsights: string[];
  metrics: ChartMetric[];
  sustainabilityScore: number;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface NavItem {
  label: string;
  id: string;
}
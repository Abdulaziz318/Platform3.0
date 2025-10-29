export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface ExperimentConfig {
  name: string;
  model_choice: string;
  api_key: string;
  temperature: number;
  total_turns: number;
  num_subjects?: number;
}

export interface Experiment {
  id: number;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  current_turn: number;
  num_subjects: number;
  model_choice: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  results_available: boolean;
}
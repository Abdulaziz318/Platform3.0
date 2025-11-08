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
  experiment_type?: 'human-llm' | 'llm-llm'; // New field
  llm_config?: LLMExperimentConfig; // LLM-LLM specific configuration
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  results_available: boolean;
}

export interface Dataset {
  id: number;
  name: string;
  row_count: number;
  column_names: string[];
  selected_variables: string[];
  data: Record<string, any>[];
  created_at: string;
}

export interface DatasetConfig {
  name: string;
  selected_variables: string[];
}

// LLM-LLM Experiment Types
export type MessageRole = 'system' | 'assistant' | 'user';
export type BlockType = 'predefined' | 'simulated' | 'initial';

export interface Persona {
  id: string;
  name: string;
  systemMessage: string;
}

export interface ConversationBlock {
  id: string;
  type: BlockType;
  column: 1 | 2 | 'both';
  turnNumber: number;
  content?: string;
  rounds?: number;
  messageRole?: MessageRole;
}

export interface LLMExperimentConfig {
  name: string;
  dataset_id: number;
  personas: Persona[];
  conversation_setup: {
    column1_persona_id: string;
    column2_persona_id: string;
    first_to_speak: 1 | 2;
    initial_message: string;
    initial_message_role: MessageRole;
    blocks: ConversationBlock[];
  };
}

export interface SavedPersona {
  id: number;
  name: string;
  system_message: string;
  created_at: string;
  updated_at: string;
}
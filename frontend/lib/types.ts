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
  experiment_type: 'human-llm' | 'llm-llm';
  dataset_id: number;
  dataset_name?: string; // For display purposes
  config: LLMExperimentConfig | HumanLLMExperimentConfig;
  created_at: string;
  updated_at: string;
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

export interface HumanLLMExperimentConfig {
  name: string;
  dataset_id: number;
  llm_persona: Persona;
  conversation_setup: {
    llm_persona_id: string;
    first_to_speak: 'human' | 'llm';
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

// LLM Provider Types
export type SDKType = 'openai' | 'anthropic' | 'mixtral';

export interface LLMProvider {
  id: number;
  name: string;
  sdk: SDKType;
  api_base_url?: string; // Only for OpenAI
  api_key: string;
  models: string[];
  supports_batching: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderVerificationRequest {
  sdk: SDKType;
  api_base_url?: string;
  api_key: string;
  model_id?: string; // For manual model verification
}

export interface ProviderVerificationResponse {
  success: boolean;
  error?: 'invalid_api_key' | 'invalid_base_url' | 'unknown';
  error_code?: string;
  models?: string[];
  supports_batching: boolean;
}

export interface ModelVerificationResponse {
  success: boolean;
  error?: string;
}

// Simulation Types
export type SimulationStatus = 'not_started' | 'running' | 'stopped' | 'finished' | 'error';
export type EndpointType = 'batching' | 'responses';

export interface LLMParameters {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface Simulation {
  id: number;
  name: string;
  experiment_id: number;
  experiment_name: string;
  experiment_type: 'human-llm' | 'llm-llm';
  dataset_id: number;
  dataset_name: string;
  provider_id: number;
  provider_name: string;
  model: string;
  endpoint_type: EndpointType;
  llm_parameters: LLMParameters;
  num_rows: number; // Number of dataset rows to simulate
  // Backend fields for compatibility
  row_start?: number;
  row_end?: number;
  rows_completed?: number;
  rows_failed?: number;
  total_tokens_used?: number;
  total_cost?: number;
  // Status and progress
  status: SimulationStatus;
  progress?: number; // 0-100 for running/stopped/finished/error
  current_row?: number; // Current row being processed
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  finished_at?: string; // Backend uses this instead of completed_at
  created_at: string;
  updated_at: string;
}

export interface CreateSimulationRequest {
  name: string;
  experiment_id: number;
  dataset_id: number;
  provider_id: number;
  model: string;
  endpoint_type: EndpointType;
  llm_parameters: LLMParameters;
  num_rows: number;
}

import { User, Experiment, ExperimentConfig, Dataset, DatasetConfig, LLMExperimentConfig, HumanLLMExperimentConfig, Persona, SavedPersona, LLMProvider, SDKType, ProviderVerificationRequest, ProviderVerificationResponse, ModelVerificationResponse, Simulation, CreateSimulationRequest, SimulationStatus, EndpointType, LLMParameters } from './types';

// Re-export types for convenience
export type { User, Experiment, ExperimentConfig, Dataset, DatasetConfig, LLMExperimentConfig, HumanLLMExperimentConfig, Persona, SavedPersona, LLMProvider, SDKType, ProviderVerificationRequest, ProviderVerificationResponse, ModelVerificationResponse, Simulation, CreateSimulationRequest, SimulationStatus, EndpointType, LLMParameters } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock mode - set to false when backend is ready
const MOCK_MODE = false;

// Mock data store
let mockExperiments: Experiment[] = [
  {
    id: 1,
    name: "Conspiracy Theory Debate",
    experiment_type: 'llm-llm',
    dataset_id: 1,
    dataset_name: "Conspiracy Beliefs Study",
    config: {
      name: "Conspiracy Theory Debate",
      dataset_id: 1,
      personas: [
        { id: '1', name: 'Skeptic', systemMessage: 'You are a skeptical researcher.' },
        { id: '2', name: 'Believer', systemMessage: 'You believe in conspiracy theories.' }
      ],
      conversation_setup: {
        column1_persona_id: '1',
        column2_persona_id: '2',
        first_to_speak: 1,
        initial_message: 'Let\'s discuss this conspiracy theory.',
        initial_message_role: 'user',
        blocks: []
      }
    } as LLMExperimentConfig,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 2,
    name: "Customer Support Chat",
    experiment_type: 'human-llm',
    dataset_id: 2,
    dataset_name: "Customer Feedback Q4 2024",
    config: {
      name: "Customer Support Chat",
      dataset_id: 2,
      llm_persona: { id: '1', name: 'Support Agent', systemMessage: 'You are a helpful customer support agent.' },
      conversation_setup: {
        llm_persona_id: '1',
        first_to_speak: 'human',
        initial_message: 'Hello, how can I help you?',
        initial_message_role: 'user',
        blocks: []
      }
    } as HumanLLMExperimentConfig,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

let nextMockId = 3;

// Mock datasets store
let mockDatasets: Dataset[] = [
  {
    id: 1,
    name: "Conspiracy Beliefs Study",
    row_count: 6,
    column_names: ['subject', 'conspiracy', 'initial_survey', 'human_post_survey', 'ai_post_survey', 'human_1', 'bot_1', 'human_2', 'bot_2'],
    selected_variables: ['subject', 'conspiracy', 'initial_survey'],
    data: [
      { subject: '0', conspiracy: 'The assertion...', initial_survey: 62, human_post_survey: 34, ai_post_survey: 55, human_1: 'The theory t...', bot_1: 'Thank you f...', human_2: 'Thank you f...', bot_2: "I'm glad..." },
      { subject: '1', conspiracy: 'The JFK assassi...', initial_survey: 71, human_post_survey: 30, ai_post_survey: 70, human_1: 'JFK assassi...', bot_1: "It's absolute...", human_2: 'I appreciate...', bot_2: 'I under...' },
      { subject: '2', conspiracy: 'The assassi...', initial_survey: 95, human_post_survey: 100, ai_post_survey: 90, human_1: 'I have a lot ...', bot_1: 'I completel...', human_2: 'Thank you f...', bot_2: 'I appre...' },
      { subject: '3', conspiracy: 'The 2020 el...', initial_survey: 59, human_post_survey: 20, ai_post_survey: 42, human_1: 'The 2020 el...', bot_1: "It's great th...", human_2: 'Thank you f...', bot_2: 'I under...' },
      { subject: '4', conspiracy: 'The govern...', initial_survey: 52, human_post_survey: 64, ai_post_survey: 'After reflecting', human_1: 'I find the co...', bot_1: "It's underst...", human_2: 'Thank you f...', bot_2: 'Thank-...' },
      { subject: '5', conspiracy: 'Ronald Rea...', initial_survey: 90, human_post_survey: 90, ai_post_survey: 'After reflect...', human_1: 'Ronald Rea...', bot_1: 'Thank you f...', human_2: 'Thank you f...', bot_2: 'I under...' },
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 2,
    name: "Customer Feedback Q4 2024",
    row_count: 450,
    column_names: ['customer_id', 'product', 'rating', 'comment', 'purchase_date'],
    selected_variables: ['customer_id', 'product', 'rating'],
    data: [
      { customer_id: 'C001', product: 'Widget A', rating: 4.5, comment: 'Great product!', purchase_date: '2024-10-15' },
      { customer_id: 'C002', product: 'Widget B', rating: 3.8, comment: 'Good but could be better', purchase_date: '2024-10-16' },
      { customer_id: 'C003', product: 'Widget A', rating: 5.0, comment: 'Excellent!', purchase_date: '2024-10-17' },
      { customer_id: 'C004', product: 'Widget C', rating: 2.5, comment: 'Not satisfied', purchase_date: '2024-10-18' },
      { customer_id: 'C005', product: 'Widget B', rating: 4.2, comment: 'Pretty good', purchase_date: '2024-10-19' },
    ],
    created_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

let nextMockDatasetId = 3;

// Mock saved personas store
let mockSavedPersonas: SavedPersona[] = [
  {
    id: 1,
    name: "Friendly Customer Support",
    system_message: "You are a friendly and helpful customer support agent. Always be polite, empathetic, and solution-oriented.",
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 2,
    name: "Skeptical Researcher",
    system_message: "You are a skeptical researcher who questions claims and asks for evidence. You value scientific rigor and critical thinking.",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: 3,
    name: "Conspiracy Theorist",
    system_message: "You are someone who believes in conspiracy theories and is skeptical of mainstream narratives. You often question official explanations.",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
];

let nextMockPersonaId = 4;

let mockLLMProviders: LLMProvider[] = [
  {
    id: 1,
    name: "OpenAI Main",
    sdk: 'openai',
    api_base_url: 'https://api.openai.com/v1',
    api_key: 'sk-proj-***************************',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    supports_batching: true,
    created_at: new Date(Date.now() - 2592000000).toISOString(),
    updated_at: new Date(Date.now() - 2592000000).toISOString(),
  },
  {
    id: 2,
    name: "Anthropic Claude",
    sdk: 'anthropic',
    api_key: 'sk-ant-***************************',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'],
    supports_batching: false,
    created_at: new Date(Date.now() - 1296000000).toISOString(),
    updated_at: new Date(Date.now() - 1296000000).toISOString(),
  },
];

let nextMockProviderId = 3;

let mockSimulations: Simulation[] = [
  {
    id: 1,
    name: "Test Run - Conspiracy Debate",
    experiment_id: 1,
    experiment_name: "Conspiracy Theory Debate",
    experiment_type: 'llm-llm',
    dataset_id: 1,
    dataset_name: "Conspiracy Beliefs Study",
    provider_id: 1,
    provider_name: "OpenAI Main",
    model: "gpt-4o-mini",
    endpoint_type: 'responses',
    llm_parameters: {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 1000
    },
    num_rows: 10,
    status: 'finished',
    progress: 100,
    current_row: 10,
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 82800000).toISOString(),
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 82800000).toISOString(),
  },
  {
    id: 2,
    name: "Full Dataset - Customer Support",
    experiment_id: 2,
    experiment_name: "Customer Support Chat",
    experiment_type: 'human-llm',
    dataset_id: 2,
    dataset_name: "Customer Feedback Q4 2024",
    provider_id: 2,
    provider_name: "Anthropic Claude",
    model: "claude-3-5-sonnet-20241022",
    endpoint_type: 'responses',
    llm_parameters: {
      temperature: 0.5,
      max_tokens: 2000
    },
    num_rows: 50,
    status: 'not_started',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

let nextMockSimulationId = 3;

class APIClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (MOCK_MODE) {
      return this.mockRequest(endpoint, options);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    }

    return response.json();
  }

  private async mockRequest(endpoint: string, options: RequestInit = {}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

    const method = options.method || 'GET';

    // Mock auth endpoints
    if (endpoint === '/api/auth/login' && method === 'POST') {
      const mockToken = 'mock-jwt-token-' + Date.now();
      return { access_token: mockToken, token_type: 'bearer' };
    }

    if (endpoint === '/api/auth/register' && method === 'POST') {
      const mockToken = 'mock-jwt-token-' + Date.now();
      return { access_token: mockToken, token_type: 'bearer' };
    }

    if (endpoint === '/api/auth/me') {
      return {
        id: 1,
        email: 'demo@example.com',
        created_at: new Date().toISOString(),
      };
    }

    // Mock experiments endpoints
    if (endpoint === '/api/experiments' && method === 'GET') {
      return mockExperiments;
    }

    if (endpoint === '/api/experiments' && method === 'POST') {
      // Handled by createLLMExperiment or createHumanLLMExperiment
      return { experiment_id: nextMockId, status: 'created' };
    }

    if (endpoint.startsWith('/api/experiments/') && method === 'GET') {
      const id = parseInt(endpoint.split('/')[3]);
      const exp = mockExperiments.find(e => e.id === id);
      if (!exp) throw new Error('Experiment not found');
      return exp;
    }

    if (endpoint.startsWith('/api/experiments/') && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[3]);
      const index = mockExperiments.findIndex(e => e.id === id);
      if (index !== -1) {
        mockExperiments.splice(index, 1);
      }
      return { message: 'Experiment deleted' };
    }

    if (endpoint.startsWith('/api/experiments/') && method === 'PUT') {
      // Handled by updateExperiment
      return { message: 'Experiment updated' };
    }

    throw new Error('Mock endpoint not implemented');
  }

  // Auth methods
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = MOCK_MODE 
      ? await this.mockRequest('/api/auth/login', { method: 'POST' })
      : await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          body: formData,
        }).then(r => r.json());

    this.setToken(response.access_token);
    return response;
  }

  async register(email: string, password: string) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/api/auth/me');
  }

  logout() {
    this.clearToken();
  }

  // Experiment methods
  async createExperiment(config: ExperimentConfig, csvFile: File) {
    if (MOCK_MODE) {
      return this.mockRequest('/api/experiments', {
        method: 'POST',
      });
    }

    const formData = new FormData();
    formData.append('name', config.name);
    formData.append('model_choice', config.model_choice);
    formData.append('api_key', config.api_key);
    formData.append('temperature', config.temperature.toString());
    formData.append('total_turns', config.total_turns.toString());
    formData.append('csv_file', csvFile);
    if (config.num_subjects) {
      formData.append('num_subjects', config.num_subjects.toString());
    }

    const response = await fetch(`${API_URL}/api/experiments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to create experiment');
    return response.json();
  }

  async listExperiments(): Promise<Experiment[]> {
    return this.request('/api/experiments');
  }

  async getExperiment(id: number): Promise<Experiment> {
    if (MOCK_MODE) {
      const exp = mockExperiments.find(e => e.id === id);
      if (!exp) throw new Error('Experiment not found');
      return { ...exp };
    }

    return this.request(`/api/experiments/${id}`);
  }

  async cancelExperiment(id: number) {
    return this.request(`/api/experiments/${id}`, {
      method: 'DELETE',
    });
  }

  // Dataset methods
  async createDataset(name: string, csvFile: File): Promise<{ dataset_id: number }> {
    if (MOCK_MODE) {
      // Parse CSV file in mock mode
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const data = lines.slice(1, 11).map(line => {
        const values = line.split(',');
        const row: Record<string, any> = {};
        headers.forEach((header, i) => {
          row[header] = values[i]?.trim() || '';
        });
        return row;
      });

      const newDataset: Dataset = {
        id: nextMockDatasetId++,
        name,
        row_count: lines.length - 1,
        column_names: headers,
        selected_variables: [],
        data,
        created_at: new Date().toISOString(),
      };
      
      mockDatasets.unshift(newDataset);
      return { dataset_id: newDataset.id };
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('csv_file', csvFile);

    const response = await fetch(`${API_URL}/api/datasets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error('Failed to create dataset');
    return response.json();
  }

  async listDatasets(): Promise<Dataset[]> {
    if (MOCK_MODE) {
      return [...mockDatasets];
    }
    return this.request('/api/datasets');
  }

  async getDataset(id: number): Promise<Dataset> {
    if (MOCK_MODE) {
      const dataset = mockDatasets.find(d => d.id === id);
      if (!dataset) throw new Error('Dataset not found');
      return { ...dataset };
    }
    return this.request(`/api/datasets/${id}`);
  }

  async updateDataset(id: number, config: DatasetConfig): Promise<void> {
    if (MOCK_MODE) {
      const dataset = mockDatasets.find(d => d.id === id);
      if (dataset) {
        dataset.selected_variables = config.selected_variables;
        dataset.name = config.name;
      }
      return;
    }

    await this.request(`/api/datasets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteDataset(id: number): Promise<void> {
    if (MOCK_MODE) {
      const index = mockDatasets.findIndex(d => d.id === id);
      if (index !== -1) {
        mockDatasets.splice(index, 1);
      }
      return;
    }

    await this.request(`/api/datasets/${id}`, {
      method: 'DELETE',
    });
  }

  // LLM Experiment methods
  async createLLMExperiment(config: LLMExperimentConfig): Promise<{ experiment_id: number }> {
    if (MOCK_MODE) {
      const dataset = mockDatasets.find(d => d.id === config.dataset_id);
      const newExperiment: Experiment = {
        id: nextMockId++,
        name: config.name,
        experiment_type: 'llm-llm',
        dataset_id: config.dataset_id,
        dataset_name: dataset?.name,
        config: config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockExperiments.unshift(newExperiment);
      
      return { experiment_id: newExperiment.id };
    }

    const response = await fetch(`${API_URL}/api/experiments/llm-llm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) throw new Error('Failed to create LLM experiment');
    return response.json();
  }

  async createHumanLLMExperiment(config: HumanLLMExperimentConfig): Promise<{ experiment_id: number }> {
    if (MOCK_MODE) {
      const dataset = mockDatasets.find(d => d.id === config.dataset_id);
      const newExperiment: Experiment = {
        id: nextMockId++,
        name: config.name,
        experiment_type: 'human-llm',
        dataset_id: config.dataset_id,
        dataset_name: dataset?.name,
        config: config,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockExperiments.unshift(newExperiment);
      
      return { experiment_id: newExperiment.id };
    }

    const response = await fetch(`${API_URL}/api/experiments/human-llm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) throw new Error('Failed to create Human-LLM experiment');
    return response.json();
  }

  async updateExperiment(id: number, config: LLMExperimentConfig | HumanLLMExperimentConfig): Promise<void> {
    if (MOCK_MODE) {
      const exp = mockExperiments.find(e => e.id === id);
      if (exp) {
        const dataset = mockDatasets.find(d => d.id === config.dataset_id);
        exp.name = config.name;
        exp.dataset_id = config.dataset_id;
        exp.dataset_name = dataset?.name;
        exp.config = config;
        exp.updated_at = new Date().toISOString();
      }
      return;
    }

    await this.request(`/api/experiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteExperiment(id: number): Promise<void> {
    if (MOCK_MODE) {
      const index = mockExperiments.findIndex(e => e.id === id);
      if (index !== -1) {
        mockExperiments.splice(index, 1);
      }
      return;
    }

    await this.request(`/api/experiments/${id}`, {
      method: 'DELETE',
    });
  }

  // Saved Personas methods
  async listSavedPersonas(): Promise<SavedPersona[]> {
    if (MOCK_MODE) {
      return [...mockSavedPersonas];
    }
    return this.request('/api/personas');
  }

  async getSavedPersona(id: number): Promise<SavedPersona> {
    if (MOCK_MODE) {
      const persona = mockSavedPersonas.find(p => p.id === id);
      if (!persona) throw new Error('Persona not found');
      return { ...persona };
    }
    return this.request(`/api/personas/${id}`);
  }

  async createSavedPersona(name: string, systemMessage: string): Promise<{ persona_id: number }> {
    if (MOCK_MODE) {
      const newPersona: SavedPersona = {
        id: nextMockPersonaId++,
        name,
        system_message: systemMessage,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockSavedPersonas.unshift(newPersona);
      return { persona_id: newPersona.id };
    }

    return this.request('/api/personas', {
      method: 'POST',
      body: JSON.stringify({ name, system_message: systemMessage }),
    });
  }

  async updateSavedPersona(id: number, name: string, systemMessage: string): Promise<void> {
    if (MOCK_MODE) {
      const persona = mockSavedPersonas.find(p => p.id === id);
      if (persona) {
        persona.name = name;
        persona.system_message = systemMessage;
        persona.updated_at = new Date().toISOString();
      }
      return;
    }

    await this.request(`/api/personas/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, system_message: systemMessage }),
    });
  }

  async deleteSavedPersona(id: number): Promise<void> {
    if (MOCK_MODE) {
      const index = mockSavedPersonas.findIndex(p => p.id === id);
      if (index !== -1) {
        mockSavedPersonas.splice(index, 1);
      }
      return;
    }

    await this.request(`/api/personas/${id}`, {
      method: 'DELETE',
    });
  }

  // LLM Provider methods
  async listLLMProviders(): Promise<LLMProvider[]> {
    if (MOCK_MODE) {
      return Promise.resolve([...mockLLMProviders]);
    }

    return this.request('/api/llm-providers');
  }

  async getLLMProvider(id: number): Promise<LLMProvider> {
    if (MOCK_MODE) {
      const provider = mockLLMProviders.find(p => p.id === id);
      if (!provider) {
        throw new Error('Provider not found');
      }
      return Promise.resolve({ ...provider });
    }

    return this.request(`/api/llm-providers/${id}`);
  }

  async verifyProvider(data: ProviderVerificationRequest): Promise<ProviderVerificationResponse> {
    if (MOCK_MODE) {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock validation logic
      if (!data.api_key || data.api_key.length < 10) {
        return {
          success: false,
          error: 'invalid_api_key',
          supports_batching: false,
        };
      }

      if (data.sdk === 'openai' && data.api_base_url && !data.api_base_url.startsWith('http')) {
        return {
          success: false,
          error: 'invalid_base_url',
          supports_batching: false,
        };
      }

      // Random chance of failure for testing
      if (Math.random() < 0.1) {
        return {
          success: false,
          error: 'unknown',
          error_code: 'ERR_CONNECTION_TIMEOUT',
          supports_batching: false,
        };
      }

      // Success - return mock models based on SDK
      let models: string[] = [];
      let supportsBatching = false;

      switch (data.sdk) {
        case 'openai':
          models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'];
          supportsBatching = true;
          break;
        case 'anthropic':
          models = ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'];
          supportsBatching = false;
          break;
        case 'mixtral':
          models = ['mixtral-8x7b-instruct', 'mixtral-8x22b-instruct'];
          supportsBatching = false;
          break;
      }

      // Randomly return empty models list 10% of the time
      if (Math.random() < 0.1) {
        models = [];
      }

      return {
        success: true,
        models,
        supports_batching: supportsBatching,
      };
    }

    return this.request('/api/llm-providers/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createLLMProvider(data: Omit<LLMProvider, 'id' | 'created_at' | 'updated_at'>): Promise<LLMProvider> {
    if (MOCK_MODE) {
      const newProvider: LLMProvider = {
        ...data,
        id: nextMockProviderId++,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockLLMProviders.push(newProvider);
      return Promise.resolve(newProvider);
    }

    return this.request('/api/llm-providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateLLMProvider(id: number, data: Partial<Omit<LLMProvider, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    if (MOCK_MODE) {
      const provider = mockLLMProviders.find(p => p.id === id);
      if (provider) {
        Object.assign(provider, data);
        provider.updated_at = new Date().toISOString();
      }
      return;
    }

    await this.request(`/api/llm-providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteLLMProvider(id: number): Promise<void> {
    if (MOCK_MODE) {
      const index = mockLLMProviders.findIndex(p => p.id === id);
      if (index !== -1) {
        mockLLMProviders.splice(index, 1);
      }
      return;
    }

    await this.request(`/api/llm-providers/${id}`, {
      method: 'DELETE',
    });
  }

  async verifyModel(providerId: number, modelId: string): Promise<ModelVerificationResponse> {
    if (MOCK_MODE) {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Random 20% chance of failure
      if (Math.random() < 0.2) {
        return {
          success: false,
          error: 'Model not found or not accessible with this API key',
        };
      }

      return {
        success: true,
      };
    }

    return this.request(`/api/llm-providers/${providerId}/verify-model`, {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  async addModelToProvider(providerId: number, modelId: string): Promise<void> {
    if (MOCK_MODE) {
      const provider = mockLLMProviders.find(p => p.id === providerId);
      if (provider && !provider.models.includes(modelId)) {
        provider.models.push(modelId);
        provider.updated_at = new Date().toISOString();
      }
      return;
    }

    await this.request(`/api/llm-providers/${providerId}/models`, {
      method: 'POST',
      body: JSON.stringify({ model_id: modelId }),
    });
  }

  async removeModelFromProvider(providerId: number, modelId: string): Promise<void> {
    if (MOCK_MODE) {
      const provider = mockLLMProviders.find(p => p.id === providerId);
      if (provider) {
        provider.models = provider.models.filter(m => m !== modelId);
        provider.updated_at = new Date().toISOString();
      }
      return;
    }

    await this.request(`/api/llm-providers/${providerId}/models/${modelId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Simulation Methods ====================

  // Helper method to normalize backend simulation response to frontend format
  private normalizeSimulation(backendSim: any): Simulation {
    // Calculate num_rows if not provided
    const numRows = backendSim.num_rows || 
                    (backendSim.row_start !== undefined && backendSim.row_end !== undefined 
                      ? (backendSim.row_end - backendSim.row_start) + 1 
                      : 0);

    return {
      id: backendSim.id,
      name: backendSim.name,
      experiment_id: backendSim.experiment_id,
      experiment_name: backendSim.experiment_name || '',
      experiment_type: backendSim.experiment_type || 'llm-llm',
      dataset_id: backendSim.dataset_id,
      dataset_name: backendSim.dataset_name || '',
      provider_id: backendSim.provider_id || backendSim.llm_provider_id,
      provider_name: backendSim.provider_name || '',
      model: backendSim.model || backendSim.model_name,
      endpoint_type: backendSim.endpoint_type || 'responses',
      llm_parameters: backendSim.llm_parameters || {
        temperature: backendSim.temperature,
        max_tokens: backendSim.max_tokens,
        top_p: backendSim.top_p,
        frequency_penalty: backendSim.frequency_penalty,
        presence_penalty: backendSim.presence_penalty,
      },
      num_rows: numRows,
      row_start: backendSim.row_start,
      row_end: backendSim.row_end,
      rows_completed: backendSim.rows_completed,
      rows_failed: backendSim.rows_failed,
      total_tokens_used: backendSim.total_tokens_used,
      total_cost: backendSim.total_cost,
      status: backendSim.status,
      progress: backendSim.progress || backendSim.progress_percentage,
      current_row: backendSim.current_row,
      error_message: backendSim.error_message,
      started_at: backendSim.started_at,
      completed_at: backendSim.completed_at || backendSim.finished_at,
      finished_at: backendSim.finished_at,
      created_at: backendSim.created_at,
      updated_at: backendSim.updated_at,
    };
  }

  async listSimulations(): Promise<Simulation[]> {
    if (MOCK_MODE) {
      return Promise.resolve([...mockSimulations]);
    }

    const data = await this.request('/api/simulations/');
    // Normalize backend responses to frontend format
    return data.map((sim: any) => this.normalizeSimulation(sim));
  }

  async getSimulation(id: number): Promise<Simulation> {
    if (MOCK_MODE) {
      const sim = mockSimulations.find(s => s.id === id);
      if (!sim) throw new Error('Simulation not found');
      return { ...sim };
    }

    const data = await this.request(`/api/simulations/${id}`);
    // Normalize backend response to frontend format
    return this.normalizeSimulation(data);
  }

  async createSimulation(request: CreateSimulationRequest): Promise<{ simulation_id: number }> {
    if (MOCK_MODE) {
      const experiment = mockExperiments.find(e => e.id === request.experiment_id);
      const dataset = mockDatasets.find(d => d.id === request.dataset_id);
      const provider = mockLLMProviders.find(p => p.id === request.provider_id);

      if (!experiment) throw new Error('Experiment not found');
      if (!dataset) throw new Error('Dataset not found');
      if (!provider) throw new Error('Provider not found');

      const newSimulation: Simulation = {
        id: nextMockSimulationId++,
        name: request.name,
        experiment_id: request.experiment_id,
        experiment_name: experiment.name,
        experiment_type: experiment.experiment_type,
        dataset_id: request.dataset_id,
        dataset_name: dataset.name,
        provider_id: request.provider_id,
        provider_name: provider.name,
        model: request.model,
        endpoint_type: request.endpoint_type,
        llm_parameters: request.llm_parameters,
        num_rows: request.num_rows,
        status: 'not_started',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockSimulations.push(newSimulation);
      return { simulation_id: newSimulation.id };
    }

    return this.request('/api/simulations', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateSimulation(id: number, request: Partial<CreateSimulationRequest>): Promise<void> {
    if (MOCK_MODE) {
      const simulation = mockSimulations.find(s => s.id === id);
      if (!simulation) throw new Error('Simulation not found');

      if (request.name) simulation.name = request.name;
      if (request.experiment_id) {
        const experiment = mockExperiments.find(e => e.id === request.experiment_id);
        if (experiment) {
          simulation.experiment_id = request.experiment_id;
          simulation.experiment_name = experiment.name;
          simulation.experiment_type = experiment.experiment_type;
        }
      }
      if (request.dataset_id) {
        const dataset = mockDatasets.find(d => d.id === request.dataset_id);
        if (dataset) {
          simulation.dataset_id = request.dataset_id;
          simulation.dataset_name = dataset.name;
        }
      }
      if (request.provider_id) {
        const provider = mockLLMProviders.find(p => p.id === request.provider_id);
        if (provider) {
          simulation.provider_id = request.provider_id;
          simulation.provider_name = provider.name;
        }
      }
      if (request.model) simulation.model = request.model;
      if (request.endpoint_type) simulation.endpoint_type = request.endpoint_type;
      if (request.llm_parameters) simulation.llm_parameters = request.llm_parameters;
      if (request.num_rows) simulation.num_rows = request.num_rows;

      simulation.updated_at = new Date().toISOString();
      return;
    }

    await this.request(`/api/simulations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
  }

  async deleteSimulation(id: number): Promise<void> {
    if (MOCK_MODE) {
      const index = mockSimulations.findIndex(s => s.id === id);
      if (index !== -1) {
        mockSimulations.splice(index, 1);
      }
      return;
    }

    await this.request(`/api/simulations/${id}`, {
      method: 'DELETE',
    });
  }

  async runSimulation(id: number, numRows: number): Promise<void> {
    if (MOCK_MODE) {
      const simulation = mockSimulations.find(s => s.id === id);
      if (!simulation) throw new Error('Simulation not found');

      simulation.status = 'running';
      simulation.progress = 0;
      simulation.current_row = 0;
      simulation.num_rows = numRows;
      simulation.started_at = new Date().toISOString();
      simulation.updated_at = new Date().toISOString();

      // Simulate progress in mock mode
      setTimeout(() => {
        if (simulation && simulation.status === 'running') {
          simulation.progress = 50;
          simulation.current_row = Math.floor(numRows / 2);
          simulation.updated_at = new Date().toISOString();
        }
      }, 2000);

      return;
    }

    // Backend doesn't need num_rows in body - it uses row_start/row_end from simulation config
    await this.request(`/api/simulations/${id}/run`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async stopSimulation(id: number): Promise<void> {
    if (MOCK_MODE) {
      const simulation = mockSimulations.find(s => s.id === id);
      if (!simulation) throw new Error('Simulation not found');

      simulation.status = 'stopped';
      simulation.updated_at = new Date().toISOString();
      return;
    }

    await this.request(`/api/simulations/${id}/stop`, {
      method: 'POST',
    });
  }

  async downloadResults(id: number): Promise<Blob> {
    if (MOCK_MODE) {
      // Generate mock CSV data
      const csvData = [
        'simulation_id,row_id,turn,speaker,role,message,timestamp',
        `${id},1,1,LLM,assistant,"Hello, how can I help you?",2024-11-07T10:00:00Z`,
        `${id},1,2,Human,user,"I need help with my account.",2024-11-07T10:00:15Z`,
        `${id},1,3,LLM,assistant,"I'd be happy to help. What seems to be the issue?",2024-11-07T10:00:30Z`,
        `${id},2,1,LLM,assistant,"Hello, how can I help you?",2024-11-07T10:01:00Z`,
        `${id},2,2,Human,user,"How do I reset my password?",2024-11-07T10:01:15Z`,
      ].join('\n');

      return new Blob([csvData], { type: 'text/csv' });
    }

    const response = await fetch(`${API_URL}/api/simulations/${id}/results`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to download results');
    return response.blob();
  }
}

export const api = new APIClient();

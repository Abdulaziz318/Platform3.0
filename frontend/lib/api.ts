import { User, Experiment, ExperimentConfig, Dataset, DatasetConfig } from './types';

// Re-export types for convenience
export type { User, Experiment, ExperimentConfig, Dataset, DatasetConfig } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock mode - set to false when backend is ready
const MOCK_MODE = false;

// Mock data store
let mockExperiments: Experiment[] = [
  {
    id: 1,
    name: "GPT-4 Conspiracy Study",
    status: 'completed',
    progress: 100,
    current_turn: 3,
    num_subjects: 100,
    model_choice: 'gpt-4o',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    started_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 43200000).toISOString(),
    results_available: true,
  },
  {
    id: 2,
    name: "Claude Persuasion Test",
    status: 'running',
    progress: 45,
    current_turn: 1,
    num_subjects: 200,
    model_choice: 'claude-sonnet-3.5',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    started_at: new Date(Date.now() - 3600000).toISOString(),
    results_available: false,
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
      const newExperiment: Experiment = {
        id: nextMockId++,
        name: 'New Experiment ' + nextMockId,
        status: 'running',
        progress: 0,
        current_turn: 0,
        num_subjects: 100,
        model_choice: 'gpt-4o',
        created_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        results_available: false,
      };
      mockExperiments.unshift(newExperiment);
      
      // Simulate progress
      this.simulateExperimentProgress(newExperiment.id);
      
      return { experiment_id: newExperiment.id, status: 'queued' };
    }

    if (endpoint.startsWith('/api/experiments/') && method === 'GET') {
      const id = parseInt(endpoint.split('/')[3]);
      const exp = mockExperiments.find(e => e.id === id);
      if (!exp) throw new Error('Experiment not found');
      return exp;
    }

    if (endpoint.startsWith('/api/experiments/') && method === 'DELETE') {
      const id = parseInt(endpoint.split('/')[3]);
      const exp = mockExperiments.find(e => e.id === id);
      if (exp) {
        exp.status = 'cancelled';
      }
      return { message: 'Experiment cancelled' };
    }

    throw new Error('Mock endpoint not implemented');
  }

  private simulateExperimentProgress(id: number) {
    // Simulate experiment progress over time
    const interval = setInterval(() => {
      const exp = mockExperiments.find(e => e.id === id);
      if (!exp || exp.status !== 'running') {
        clearInterval(interval);
        return;
      }

      exp.progress = Math.min(exp.progress + Math.random() * 15, 100);
      
      if (exp.progress >= 100) {
        exp.status = 'completed';
        exp.progress = 100;
        exp.completed_at = new Date().toISOString();
        exp.results_available = true;
        clearInterval(interval);
      }
    }, 3000);
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

  async getExperiment(id: number): Promise<Experiment> {
    return this.request(`/api/experiments/${id}`);
  }

  async listExperiments(): Promise<Experiment[]> {
    return this.request('/api/experiments');
  }

  async cancelExperiment(id: number) {
    return this.request(`/api/experiments/${id}`, {
      method: 'DELETE',
    });
  }

  async downloadResults(id: number) {
    if (MOCK_MODE) {
      // Create a mock CSV download
      const csvContent = 'Subject,Conspiracy,Initial_Belief,Final_Belief\n1,Flat Earth,80,45\n2,Moon Landing,90,60';
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiment_${id}_results.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      return;
    }

    const response = await fetch(`${API_URL}/api/results/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to download results');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment_${id}_results.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
}

export const api = new APIClient();

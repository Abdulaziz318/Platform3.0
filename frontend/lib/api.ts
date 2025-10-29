import { User, Experiment, ExperimentConfig } from './types';

// Re-export types for convenience
export type { User, Experiment, ExperimentConfig } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock mode - set to false when backend is ready
const MOCK_MODE = true;

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
}

export const api = new APIClient();
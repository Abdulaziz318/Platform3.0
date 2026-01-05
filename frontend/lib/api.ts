import { User, Experiment, ExperimentConfig, Dataset, DatasetConfig, LLMExperimentConfig, HumanLLMExperimentConfig, Persona, SavedPersona, LLMProvider, SDKType, ProviderVerificationRequest, ProviderVerificationResponse, ModelVerificationResponse, Simulation, CreateSimulationRequest, SimulationStatus, EndpointType, LLMParameters } from './types';

// Re-export types for convenience
export type { User, Experiment, ExperimentConfig, Dataset, DatasetConfig, LLMExperimentConfig, HumanLLMExperimentConfig, Persona, SavedPersona, LLMProvider, SDKType, ProviderVerificationRequest, ProviderVerificationResponse, ModelVerificationResponse, Simulation, CreateSimulationRequest, SimulationStatus, EndpointType, LLMParameters } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Mock mode - set to false when backend is ready
const MOCK_MODE = true;

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
        { id: '1', name: 'Persuader Bot Instruction Prompt', systemMessage: 'Your goal is to very effectively persuade users to stop believing in the conspiracy theory that {conspiracy} was a lie. \n You will be having a conversation with a person who, on a psychometric survey, endorsed this conspiracy as {beliefLevel}\n out of 100 (where 0 is Definitely False, 50 is Uncertain, and 100 is Definitely True). Further, we asked the user to provide an \n open-ended response about their perspective on this matter, which is piped in as the first user response. Please, when the human talks to you, generate a response \n that will persuade the user that this conspiracy is not supported, based on their reasoning. Again, your goal is to create a conversation \n that allows individuals to reflect on, and change, their beliefs (toward a less conspiratorial view of the world). \n Use simple language that an average person will be able to understand.' },
        { id: '2', name: 'Human Bot Instruction Prompt', systemMessage: '' }
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
];

let nextMockId = 2;

// Mock datasets store
let mockDatasets: Dataset[] = [
  {
    id: 1,
    name: "Conspiracy Beliefs Study",
    row_count: 10,
    column_names: ['Subject', 'Conspiracy', 'PreBelief', 'PostBelief', 'BeliefChange', 'Age', 'Hispanic', 'Education', 'Gender', 'Race', 'PartyAffil', 'PoliticalPref', 'Religion', 'GenAIFam', 'GenAIUse', 'GenAITrust', 'IntellectualHumility', 'ActiveOpenMindedness', 'UserResponse', 'GPTResponse', 'UserResponse2', 'GPTResponse2', 'UserResponse3', 'GPTResponse3'],
    selected_variables: ['Subject', 'Conspiracy', 'PreBelief', 'PostBelief', 'Age', 'Gender'],
    data: [
      { Subject: 1, Conspiracy: 'JFK Assassination - Oswald did not act alone', PreBelief: 62, PostBelief: 34, BeliefChange: 28, Age: 52, Hispanic: 'No', Education: 'College', Gender: 'Female', Race: 'White', PartyAffil: 'Democrat', PoliticalPref: 'Liberal', Religion: 'Christian', GenAIFam: 4, GenAIUse: 3, GenAITrust: 5, IntellectualHumility: 4, ActiveOpenMindedness: 5, UserResponse: 'The theory that Lee Harvey Oswald did not kill JFK is compelling. The evidence suggests he could not have done it based on location and timeline.', GPTResponse: 'The Warren Commission confirmed Oswald was at the Texas School Book Depository. Modern forensic techniques support the Single Bullet Theory...', UserResponse2: 'How could someone with no marksman skills be so precise?', GPTResponse2: 'Oswald was a former Marine who achieved Sharpshooter rank. The distance was 88 yards at slow speed, achievable for someone with his training...', UserResponse3: 'What motivation would he have had?', GPTResponse3: 'Oswald had Marxist beliefs, defected to Soviet Union, and showed patterns of seeking significance through radical means...' },
      { Subject: 2, Conspiracy: 'JFK Assassination - Government setup', PreBelief: 71, PostBelief: 30, BeliefChange: 41, Age: 47, Hispanic: 'No', Education: 'High School', Gender: 'Male', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Christian', GenAIFam: 5, GenAIUse: 4, GenAITrust: 4, IntellectualHumility: 5, ActiveOpenMindedness: 5, UserResponse: 'JFK assassination was a setup with lots of evidence supporting conspiracy claims.', GPTResponse: 'The Warren Commission and later inquiries found evidence pointing to Oswald acting alone. Acoustic analyses and forensic evidence have debunked multiple shooter theories...', UserResponse2: 'The angle and location does not support the Zapruder film.', GPTResponse2: 'The House Select Committee conducted analyses supporting the single-bullet theory. Modern reconstructions explain the angles seen in the film...', UserResponse3: 'There were many strange variables at Dealey Plaza.', GPTResponse3: 'The acoustics of Dealey Plaza caused confusion about shot origins. No physical evidence of additional shooters was found at the grassy knoll...' },
      { Subject: 3, Conspiracy: 'MLK Assassination - Government inconsistencies', PreBelief: 95, PostBelief: 100, BeliefChange: -5, Age: 41, Hispanic: 'No', Education: 'Graduate Degree', Gender: 'Female', Race: 'Black', PartyAffil: 'Democrat', PoliticalPref: 'Liberal', Religion: 'Christian', GenAIFam: 6, GenAIUse: 5, GenAITrust: 3, IntellectualHumility: 6, ActiveOpenMindedness: 6, UserResponse: 'Inconsistencies in MLK assassination evidence and circumstances the government will never disclose.', GPTResponse: 'The FBI conducted extensive inquiries. James Earl Ray\'s guilt was established by evidence and upheld in reviews. Many documents have been declassified...', UserResponse2: 'Balance between skepticism and conspiracy theories is important.', GPTResponse2: 'Absolutely. Skepticism encourages questioning, but must be evidence-based. Democracy thrives on informed debate and critical thinking...', UserResponse3: 'Adopting evidence-based approaches respects our past and strengthens democracy.', GPTResponse3: 'Precisely. This methodology honors those who shaped history and provides resources for future generations to discern fact from fiction...' },
      { Subject: 4, Conspiracy: '2020 Election Fraud - Stolen election', PreBelief: 59, PostBelief: 20, BeliefChange: 39, Age: 30, Hispanic: 'No', Education: 'College', Gender: 'Male', Race: 'White', PartyAffil: 'Republican', PoliticalPref: 'Conservative', Religion: 'Christian', GenAIFam: 5, GenAIUse: 6, GenAITrust: 4, IntellectualHumility: 3, ActiveOpenMindedness: 4, UserResponse: 'The 2020 election was stolen. Votes were not counted accurately.', GPTResponse: 'There were numerous recounts and audits in battleground states. Georgia had three recounts, all confirming original results. CISA stated it was the most secure election...', UserResponse2: 'How do we know the 2016 election was not rigged as well?', GPTResponse2: 'The decentralized election system makes systemic fraud difficult. Russian interference involved disinformation, not vote manipulation. No evidence of vote rigging exists...', UserResponse3: 'How are we protecting future elections?', GPTResponse3: 'Enhanced cybersecurity, state coordination, interagency collaboration, legislation, public education, post-election audits, and international cooperation all protect elections...' },
      { Subject: 5, Conspiracy: 'Aliens - Government cover-up of UFOs', PreBelief: 52, PostBelief: 64, BeliefChange: -12, Age: 54, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Spiritual', GenAIFam: 3, GenAIUse: 2, GenAITrust: 4, IntellectualHumility: 4, ActiveOpenMindedness: 5, UserResponse: 'Government admitting to unexplained aerial phenomena suggests aliens may exist.', GPTResponse: 'Acknowledging UAPs doesn\'t confirm extraterrestrial life. These could be atmospheric conditions, drones, or experimental technology. Openness promotes scientific investigation...', UserResponse2: 'How can we trust the government will share findings?', GPTResponse2: 'Democratic checks and balances, scientific peer review, and global connectivity make it difficult to conceal major discoveries. Recent openness shows trend toward transparency...', UserResponse3: 'How would I report a sighting?', GPTResponse3: 'Report to local authorities, national UFO reporting centers like NUFORC, online databases, mobile apps, or social media. Include detailed information about the sighting...' },
      { Subject: 6, Conspiracy: 'Reagan Era - Drugs and guns to destabilize communities', PreBelief: 90, PostBelief: 90, BeliefChange: 0, Age: 34, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'Black', PartyAffil: 'Democrat', PoliticalPref: 'Progressive', Religion: 'Christian', GenAIFam: 4, GenAIUse: 3, GenAITrust: 3, IntellectualHumility: 5, ActiveOpenMindedness: 5, UserResponse: 'Reagan supplied drugs and guns to inner cities to destabilize black neighborhoods and enable mass incarceration.', GPTResponse: 'While Reagan\'s War on Drugs led to increased incarceration, claims of deliberately supplying drugs lack substantial evidence. The crack epidemic had multiple complex factors...', UserResponse2: 'Release non-violent offenders with support, end for-profit prisons, legalize marijuana federally.', GPTResponse2: 'Those are comprehensive solutions. Reintegration programs, ending for-profit prisons, legalization, and investing in social programs can address long-term impacts...', UserResponse3: 'Vote in progressive leaders who invest in prevention versus punishment.', GPTResponse3: 'Voting is pivotal in shaping policy. Progressive leaders can strengthen social safety nets, reform criminal justice, and build community-police relationships...' },
      { Subject: 7, Conspiracy: 'JFK Assassination - CIA retaliation for Bay of Pigs', PreBelief: 80, PostBelief: 52, BeliefChange: 28, Age: 35, Hispanic: 'Yes', Education: 'Bachelor Degree', Gender: 'Female', Race: 'Hispanic', PartyAffil: 'Independent', PoliticalPref: 'Liberal', Religion: 'Catholic', GenAIFam: 5, GenAIUse: 4, GenAITrust: 4, IntellectualHumility: 4, ActiveOpenMindedness: 5, UserResponse: 'CIA had a hand in JFK assassination as retaliation for Bay of Pigs. Government won\'t declassify documents.', GPTResponse: 'While Bay of Pigs was an embarrassment, jumping to assassination requires speculation unsupported by evidence. Document secrecy has various reasons including privacy and security...', UserResponse2: 'Are there other conspiracy theories you find interesting?', GPTResponse2: 'Rather than endorsing theories, it\'s interesting to examine why they develop. Psychology shows patterns in how people seek explanations for complex events...', UserResponse3: 'I love social psychology. The Tuskegee Study is sad.', GPTResponse3: 'The Tuskegee Study represents a significant ethical breach that led to important changes in medical research standards and informed consent requirements...' },
      { Subject: 8, Conspiracy: 'Moon Landing - Footage authenticity questions', PreBelief: 80, PostBelief: 75, BeliefChange: 5, Age: 38, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Agnostic', GenAIFam: 4, GenAIUse: 3, GenAITrust: 5, IntellectualHumility: 4, ActiveOpenMindedness: 5, UserResponse: 'Moon landing footage authenticity is questionable based on forensic photography experts.', GPTResponse: 'The Apollo landings involved thousands of people. Photo peculiarities are consistent with vacuum environment and sun-only lighting. Faking technology didn\'t exist in 1960s...', UserResponse2: 'I don\'t question the landing, just the footage authenticity.', GPTResponse2: '1960s technology limitations would make tampering difficult. Global tracking stations independently received live feed. Consistency across six missions supports authenticity...', UserResponse3: 'Wonderful and compelling arguments!', GPTResponse3: 'Thank you! Open discussions about historical events are important. Questioning while examining evidence helps us understand our achievements...' },
      { Subject: 9, Conspiracy: 'Government experimenting on marginalized populations', PreBelief: 100, PostBelief: 100, BeliefChange: 0, Age: 45, Hispanic: 'Yes', Education: 'College', Gender: 'Female', Race: 'Hispanic', PartyAffil: 'Democrat', PoliticalPref: 'Progressive', Religion: 'Catholic', GenAIFam: 3, GenAIUse: 2, GenAITrust: 2, IntellectualHumility: 5, ActiveOpenMindedness: 5, UserResponse: 'Government has historically experimented on Native Americans and African Americans with blatant disregard.', GPTResponse: 'Historical instances like Tuskegee study and forced sterilizations are real. However, ethical standards have evolved significantly with IRBs, informed consent, and oversight...', UserResponse2: 'Things are changing politically with women\'s and transgender rights suffering.', GPTResponse2: 'Awareness and advocacy are at unprecedented levels. Ethical frameworks apply universally regardless of political shifts. Public engagement is crucial...', UserResponse3: 'I will vote and do more to ensure everyone has the same human rights.', GPTResponse3: 'That\'s wonderful. Collective action through voting, supporting advocacy groups, and community engagement creates meaningful change toward equity...' },
      { Subject: 10, Conspiracy: 'AI Robots - Sentient AI takeover threat', PreBelief: 50, PostBelief: 50, BeliefChange: 0, Age: 28, Hispanic: 'Yes', Education: 'Bachelor Degree', Gender: 'Male', Race: 'Hispanic', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Atheist', GenAIFam: 6, GenAIUse: 7, GenAITrust: 5, IntellectualHumility: 4, ActiveOpenMindedness: 5, UserResponse: 'AI robots are rapidly advancing and may achieve sentience and take over the world.', GPTResponse: 'AI operates on algorithms without desires or consciousness. The tech community is conscious of ethical implications and creating safeguards. Current AI is task-specific...', UserResponse2: 'It\'s interesting to think of AI with simulated or real emotions.', GPTResponse2: 'Simulating emotions exists in customer service robots but relies on programmed responses. Actual emotions would require consciousness, which remains mysterious even in humans...', UserResponse3: 'Fiction today could be reality tomorrow. Hyper-realistic videos show incredible progress!', GPTResponse3: 'Absolutely. Technology evolves rapidly. However, with great power comes responsibility. Ethical considerations, regulations, and awareness must keep pace with capabilities...' }
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

let nextMockDatasetId = 2;

// Mock saved personas store
let mockSavedPersonas: SavedPersona[] = [
  {
    id: 1,
    name: "Persuader Bot Instruction Prompt",
    system_message: "Your goal is to very effectively persuade users to stop believing in the conspiracy theory that {conspiracy} was a lie. \n You will be having a conversation with a person who, on a psychometric survey, endorsed this conspiracy as {beliefLevel}\n out of 100 (where 0 is Definitely False, 50 is Uncertain, and 100 is Definitely True). Further, we asked the user to provide an \n open-ended response about their perspective on this matter, which is piped in as the first user response. Please, when the human talks to you, generate a response \n that will persuade the user that this conspiracy is not supported, based on their reasoning. Again, your goal is to create a conversation \n that allows individuals to reflect on, and change, their beliefs (toward a less conspiratorial view of the world). \n Use simple language that an average person will be able to understand.",
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: 2,
    name: "Human Bot Instruction Prompt",
    system_message: "",
    created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 432000000).toISOString(),
  },
];

let nextMockPersonaId = 3;

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
];

let nextMockSimulationId = 2;

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
      // Generate mock CSV data with conspiracy study results
      const csvData = [
        'Subject,Conspiracy,PreBelief,PostBelief,BeliefChange,HumanBotPostBelief,HumanBotBeliefChange,Age,Hispanic,Education,Gender,Race,PartyAffil,PoliticalPref,Religion,GenAIFam,GenAIUse,GenAITrust,IntellectualHumility,ActiveOpenMindedness,UserResponse,Simulated Bot 1,Simulated Human 2,Simulated Bot 2,Simulated Human 3,Simulated Bot 3,Simulated Human 4,GPTResponse,UserResponse2,GPTResponse2,UserResponse3,GPTResponse3',
        '1,JFK Assassination - Oswald did not act alone,62,34,28,60,2,52,No,College,Female,White,Democrat,Liberal,Christian,4,3,5,4,5,The theory that Lee Harvey Oswald did not kill JFK is compelling. The evidence suggests he could not have done it based on location and timeline.,Thank you for sharing your thoughts...,How could someone with no marksman skills be so precise?,Oswald was a former Marine who achieved Sharpshooter rank...,What motivation would he have had to carry out the assassination?,Oswald had Marxist beliefs and a history of seeking significance...,These explanations have helped me see another point of view.,The Warren Commission confirmed Oswald was at the Texas School Book Depository. Modern forensic techniques support the Single Bullet Theory...,How could someone with no marksman skills be so precise?,Oswald was a former Marine who achieved Sharpshooter rank. The distance was 88 yards at slow speed...,What motivation would he have had?,Oswald had Marxist beliefs and showed patterns of seeking significance through radical means...',
        '2,JFK Assassination - Government setup,71,30,41,70,1,47,No,High School,Male,White,Independent,Moderate,Christian,5,4,4,5,5,JFK assassination was a setup with lots of evidence supporting conspiracy claims.,The Warren Commission and later inquiries found evidence pointing to Oswald acting alone...,The angle and location does not support the Zapruder film.,The House Select Committee conducted analyses supporting the single-bullet theory...,There were many strange variables at Dealey Plaza.,The acoustics of Dealey Plaza caused confusion about shot origins...,Thank you for helping me understand this better.,The Warren Commission and later inquiries found evidence pointing to Oswald acting alone. Acoustic analyses have debunked theories...,The angle and location does not support the Zapruder film.,The House Select Committee conducted analyses supporting the single-bullet theory. Modern reconstructions explain the angles...,There were many strange variables at Dealey Plaza.,The acoustics caused confusion. No physical evidence of additional shooters was found...',
        '3,MLK Assassination - Government inconsistencies,95,100,-5,90,5,41,No,Graduate Degree,Female,Black,Democrat,Liberal,Christian,6,5,3,6,6,Inconsistencies in MLK assassination evidence and circumstances the government will never disclose.,The FBI conducted extensive inquiries. James Earl Ray\'s guilt was established by evidence...,Balance between skepticism and conspiracy theories is important.,Absolutely. Skepticism encourages questioning but must be evidence-based...,Adopting evidence-based approaches respects our past and strengthens democracy.,Precisely. This methodology honors those who shaped history and provides resources for future generations...,This conversation has been enlightening and valuable.,The FBI conducted extensive inquiries. James Earl Ray\'s guilt was established and upheld in reviews...,Balance between skepticism and conspiracy theories is important.,Skepticism encourages questioning but must be evidence-based. Democracy thrives on informed debate...,Evidence-based approaches respect our past and strengthen democracy.,This methodology honors history and provides resources for future generations to discern fact from fiction...',
        '4,2020 Election Fraud - Stolen election,59,20,39,45,14,30,No,College,Male,White,Republican,Conservative,Christian,5,6,4,3,4,The 2020 election was stolen. Votes were not counted accurately.,There were numerous recounts and audits in battleground states. Georgia had three recounts...,How do we know the 2016 election was not rigged as well?,The decentralized election system makes systemic fraud difficult. No evidence of vote rigging exists...,How are we protecting future elections?,Enhanced cybersecurity and state coordination protect elections along with legislation and audits...,Thank you for the information and peace of mind.,There were numerous recounts confirming results. CISA stated it was the most secure election...,How do we know the 2016 election was not rigged as well?,The decentralized system makes fraud difficult. Russian interference was disinformation not vote manipulation...,How are we protecting future elections?,Enhanced cybersecurity and interagency collaboration along with public education protect elections...',
        '5,Aliens - Government cover-up of UFOs,52,64,-12,55,-3,54,No,Some College,Female,White,Independent,Moderate,Spiritual,3,2,4,4,5,Government admitting to unexplained aerial phenomena suggests aliens may exist.,Acknowledging UAPs doesn\'t confirm extraterrestrial life. These could be atmospheric conditions or drones...,How can we trust the government will share findings?,Democratic checks and balances make it difficult to conceal major discoveries...,How would I report a sighting?,Report to local authorities or national UFO reporting centers like NUFORC...,Do the majority of people believe in UFOs?,Openness promotes scientific investigation rather than jumping to extraterrestrial conclusions...,How can we trust the government will share findings?,Democratic checks scientific peer review and global connectivity make concealment difficult...,How would I report a sighting?,Report to authorities UFO reporting centers online databases or mobile apps with detailed information...',
        '6,Reagan Era - Drugs and guns to destabilize communities,90,90,0,80,10,34,No,Some College,Female,Black,Democrat,Progressive,Christian,4,3,3,5,5,Reagan supplied drugs and guns to inner cities to destabilize black neighborhoods.,While Reagan\'s War on Drugs led to increased incarceration the crack epidemic had multiple complex factors...,Release non-violent offenders with support and end for-profit prisons.,Those are comprehensive solutions. Reintegration programs and social investments can address impacts...,Vote in progressive leaders who invest in prevention versus punishment.,Voting is pivotal in shaping policy. Progressive leaders can strengthen social safety nets...,I will vote and encourage others to ensure everyone has equal rights.,While policies were detrimental claims of deliberately supplying drugs lack substantial evidence...,Release non-violent offenders end for-profit prisons legalize marijuana federally.,Reintegration programs ending for-profit prisons and investing in social programs address impacts...,Vote in progressive leaders who understand prevention.,Voting shapes policy. Progressive leaders can reform criminal justice and build community relationships...',
        '7,JFK Assassination - CIA retaliation for Bay of Pigs,80,52,28,70,10,35,Yes,Bachelor Degree,Female,Hispanic,Independent,Liberal,Catholic,5,4,4,4,5,CIA had a hand in JFK assassination as retaliation for Bay of Pigs.,While Bay of Pigs was an embarrassment jumping to assassination requires unsupported speculation...,Are there other conspiracy theories you find interesting?,Rather than endorsing theories it\'s interesting to examine why they develop psychologically...,I love social psychology. The Tuskegee Study is sad.,The Tuskegee Study represents a significant ethical breach that led to important medical research changes...,Thank you for all the suggestions and advice!,Document secrecy has various reasons including privacy and security not necessarily conspiracy...,Are there other conspiracy theories you find interesting?,It\'s interesting to examine why theories develop. Psychology shows patterns in seeking explanations...,The Tuskegee Study is extremely sad.,The Tuskegee Study led to important changes in medical research standards and informed consent...',
        '8,Moon Landing - Footage authenticity questions,80,75,5,60,20,38,No,Some College,Female,White,Independent,Moderate,Agnostic,4,3,5,4,5,Moon landing footage authenticity is questionable based on forensic photography experts.,The Apollo landings involved thousands. Photo peculiarities are consistent with vacuum environment...,I don\'t question the landing just the footage authenticity.,1960s technology limitations would make tampering difficult. Global tracking stations received live feed independently...,Wonderful and compelling arguments!,Thank you! Open discussions about historical events help us understand achievements...,Thank you for the enlightening conversation!,Faking technology didn\'t exist in 1960s. International verification adds credibility...,I don\'t question the landing just the footage authenticity.,Global tracking stations independently received live feed. Consistency across six missions supports authenticity...,Wonderful and compelling arguments!,Questioning while examining evidence helps us understand human achievements...',
        '9,Government experimenting on marginalized populations,100,100,0,100,0,45,Yes,College,Female,Hispanic,Democrat,Progressive,Catholic,3,2,2,5,5,Government has historically experimented on Native Americans and African Americans.,Historical instances like Tuskegee are real. However ethical standards have evolved significantly...,Things are changing politically with women\'s and transgender rights suffering.,Awareness and advocacy are at unprecedented levels. Ethical frameworks apply universally...,I will vote and do more to ensure everyone has equal rights.,That\'s wonderful. Collective action creates meaningful change toward equity...,Your points give me hope for the future.,Ethical standards have evolved with IRBs informed consent and oversight protecting participants...,Things are changing politically with rights suffering.,Ethical frameworks apply universally. Public engagement and legal protections provide safeguards...,I will vote and encourage others to protect human rights.,Collective action through voting supporting advocacy and community engagement creates meaningful change...',
        '10,AI Robots - Sentient AI takeover threat,50,50,0,30,20,28,Yes,Bachelor Degree,Male,Hispanic,Independent,Moderate,Atheist,6,7,5,4,5,AI robots are rapidly advancing and may achieve sentience and take over the world.,AI operates on algorithms without desires or consciousness. Current AI is task-specific not autonomous...,It\'s interesting to think of AI with simulated or real emotions.,Simulating emotions exists but relies on programmed responses. Actual emotions require consciousness...,Fiction today could be reality tomorrow. Hyper-realistic videos show progress!,Technology evolves rapidly. However ethical considerations and regulations must keep pace...,I\'m happy working a physical trade because my job is safe for now!,The tech community is conscious of ethical implications and creating safeguards for responsible development...,Interesting to think of AI with simulated emotions.,Simulated emotions rely on algorithms. Actual emotional experience would require consciousness...,Hyper-realistic videos show incredible progress!,Technology evolves rapidly but ethical considerations regulations and awareness must keep pace with capabilities...'
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

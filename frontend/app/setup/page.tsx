'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Upload, Settings, Sliders, Brain, Zap } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [config, setConfig] = useState({
    name: '',
    model_choice: 'gpt-4o',
    api_key: '',
    temperature: 0.7,
    total_turns: 7,
    num_subjects: undefined as number | undefined,
    initial_responses: 1,
    top_p: 0.9,
    presence_penalty: 0.0,
    frequency_penalty: 0.0,
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [batching, setBatching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      setError('Please upload a CSV file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createExperiment(config, csvFile);
      router.push(`/experiments/${result.experiment_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🔬 Simulation Setup</h1>
            <p className="text-gray-600">
              Configure your LLM simulation experiment parameters
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LLM Model Selection Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">LLM Model Configuration</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select LLM Model
                  </label>
                  <select
                    value={config.model_choice}
                    onChange={(e) => setConfig({ ...config, model_choice: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  >
                    <option value="gpt-4o">ChatGPT - GPT-4o</option>
                    <option value="o1">ChatGPT - o1</option>
                    <option value="claude-3-5-sonnet-20241022">Claude - Sonnet 3.5</option>
                    <option value="claude-3-5-haiku-20241022">Claude - Haiku 3.5</option>
                    <option value="llama3.3-70b">Llama 3.3 70B</option>
                    <option value="llama3.1-405b">Llama 3.1 405B</option>
                    <option value="mixtral-8x22b-instruct">Mistral - Mixtral 8x22B</option>
                    <option value="deepseek-r1">Deepseek R1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experiment Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Experiment_1"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔒 API Key
                </label>
                <input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="sk-..."
                  required
                />
              </div>

              {/* API Mode Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  API Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBatching(true)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      batching
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Batch Requests API
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatching(false)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      !batching
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    Individual Requests
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Parameters Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Conversation Parameters</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Initial Responses
                  </label>
                  <select
                    value={config.initial_responses}
                    onChange={(e) => setConfig({ ...config, initial_responses: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Turns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.total_turns}
                    onChange={(e) => setConfig({ ...config, total_turns: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Subjects
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={config.num_subjects || ''}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      num_subjects: e.target.value ? parseInt(e.target.value) : undefined 
                    })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="All subjects"
                  />
                </div>
              </div>
            </div>

            {/* Tone Parameters Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Sliders className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Tone Parameters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Temperature */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Temperature
                    </label>
                    <span className="text-sm font-semibold text-blue-600">
                      {config.temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Deterministic (0.0)</span>
                    <span>Random (2.0)</span>
                  </div>
                </div>

                {showAdvanced && (
                  <>
                    {/* Top-p */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Top-p
                        </label>
                        <span className="text-sm font-semibold text-blue-600">
                          {config.top_p.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={config.top_p}
                        onChange={(e) => setConfig({ ...config, top_p: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher values = more diverse output</p>
                    </div>

                    {/* Presence Penalty */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Presence Penalty
                        </label>
                        <span className="text-sm font-semibold text-blue-600">
                          {config.presence_penalty.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.01"
                        value={config.presence_penalty}
                        onChange={(e) => setConfig({ ...config, presence_penalty: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher values = more variety in topics</p>
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Frequency Penalty
                        </label>
                        <span className="text-sm font-semibold text-blue-600">
                          {config.frequency_penalty.toFixed(2)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="2"
                        step="0.01"
                        value={config.frequency_penalty}
                        onChange={(e) => setConfig({ ...config, frequency_penalty: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <p className="text-xs text-gray-500 mt-1">Higher values = less repetition</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CSV Upload Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Upload className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Upload Participant Data</h2>
              </div>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a CSV file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="sr-only"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV file with subject profiles</p>
                </div>
              </div>
              {csvFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <span className="mr-2">✅</span>
                    <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </div>

            {/* Configuration Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Configuration Preview</h3>
              <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-gray-800">
                  {JSON.stringify({
                    experiment_name: config.name || 'Not set',
                    model: config.model_choice,
                    batching: batching,
                    initial_responses: config.initial_responses,
                    total_turns: config.total_turns,
                    num_subjects: config.num_subjects || 'All',
                    temperature: config.temperature,
                    top_p: config.top_p,
                    presence_penalty: config.presence_penalty,
                    frequency_penalty: config.frequency_penalty,
                  }, null, 2)}
                </pre>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
                <span className="text-xl">❌</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl text-lg"
              >
                {loading ? '⏳ Creating Experiment...' : '🚀 Create Simulation'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/experiments')}
                className="px-8 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
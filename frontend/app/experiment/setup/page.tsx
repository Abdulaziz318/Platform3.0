'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Upload, Settings, Sliders, Brain, Zap, ArrowLeft } from 'lucide-react';

function HumanLLMSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const experimentName = searchParams.get('name') || 'Untitled Experiment';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [config, setConfig] = useState({
    name: experimentName,
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
      <div className="min-h-screen bg-zinc-50">
        {/* Top Bar */}
        <div className="bg-white border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/experiments/create')}
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-600" />
            </button>
            <h1 className="text-xl font-semibold text-zinc-900">{experimentName}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LLM Model Selection Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Brain className="h-5 w-5 text-zinc-900" />
                <h2 className="text-lg font-semibold text-zinc-900">LLM Model Configuration</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Select LLM Model
                  </label>
                  <select
                    value={config.model_choice}
                    onChange={(e) => setConfig({ ...config, model_choice: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white"
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
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Experiment Name
                  </label>
                  <input
                    type="text"
                    value={config.name}
                    onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    placeholder="e.g., Experiment_1"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={config.api_key}
                  onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  placeholder="sk-..."
                  required
                />
              </div>

              {/* API Mode Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-zinc-700 mb-3">
                  API Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBatching(true)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      batching
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    <Zap className="h-4 w-4 inline mr-2" />
                    Batch Requests API
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatching(false)}
                    className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                      !batching
                        ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                    }`}
                  >
                    Individual Requests
                  </button>
                </div>
              </div>
            </div>

            {/* Conversation Parameters Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Settings className="h-5 w-5 text-zinc-900" />
                <h2 className="text-lg font-semibold text-zinc-900">Conversation Parameters</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Initial Responses
                  </label>
                  <select
                    value={config.initial_responses}
                    onChange={(e) => setConfig({ ...config, initial_responses: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Total Turns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.total_turns}
                    onChange={(e) => setConfig({ ...config, total_turns: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
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
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    placeholder="All subjects"
                  />
                </div>
              </div>
            </div>

            {/* Tone Parameters Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <Sliders className="h-5 w-5 text-zinc-900" />
                  <h2 className="text-lg font-semibold text-zinc-900">Tone Parameters</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-zinc-600 hover:text-zinc-900 font-medium"
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
              </div>

              <div className="space-y-4">
                {/* Temperature */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700">
                      Temperature
                    </label>
                    <span className="text-sm font-semibold text-zinc-900">
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
                    className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>Deterministic (0.0)</span>
                    <span>Random (2.0)</span>
                  </div>
                </div>

                {showAdvanced && (
                  <>
                    {/* Top-p */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700">
                          Top-p
                        </label>
                        <span className="text-sm font-semibold text-zinc-900">
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
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Higher values = more diverse output</p>
                    </div>

                    {/* Presence Penalty */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700">
                          Presence Penalty
                        </label>
                        <span className="text-sm font-semibold text-zinc-900">
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
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Higher values = more variety in topics</p>
                    </div>

                    {/* Frequency Penalty */}
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700">
                          Frequency Penalty
                        </label>
                        <span className="text-sm font-semibold text-zinc-900">
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
                        className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Higher values = less repetition</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* CSV Upload Card */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="flex items-center gap-3 mb-5">
                <Upload className="h-5 w-5 text-zinc-900" />
                <h2 className="text-lg font-semibold text-zinc-900">Upload Participant Data</h2>
              </div>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 border-dashed rounded-lg hover:border-zinc-300 transition-colors bg-zinc-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-10 w-10 text-zinc-400" />
                  <div className="flex text-sm text-zinc-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-zinc-900 hover:text-zinc-700 focus-within:outline-none"
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
                  <p className="text-xs text-zinc-500">CSV file with subject profiles</p>
                </div>
              </div>
              {csvFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <span className="mr-2">✓</span>
                    <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors text-sm"
              >
                {loading ? '⏳ Creating Experiment...' : 'Create Experiment'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/experiments/create')}
                className="px-6 py-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors font-medium text-zinc-700 text-sm"
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

export default function HumanLLMSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    }>
      <HumanLLMSetupContent />
    </Suspense>
  );
}

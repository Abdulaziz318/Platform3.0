'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Dataset } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, X } from 'lucide-react';

export default function CreateExperimentInstructionsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [experimentName, setExperimentName] = useState('');
  const [conversationNature, setConversationNature] = useState<'llm-llm' | 'human-llm'>('human-llm');
  const [selectedDataset, setSelectedDataset] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await api.listDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    }
  };

  const handleCreateExperiment = () => {
    setError('');
    
    if (!experimentName.trim()) {
      setError('Please enter an experiment name');
      return;
    }
    
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }

    // Navigate based on conversation nature
    const experimentData = {
      name: experimentName,
      nature: conversationNature,
      datasetId: selectedDataset,
    };

    // Store experiment data in localStorage temporarily
    if (typeof window !== 'undefined') {
      localStorage.setItem('temp_experiment', JSON.stringify(experimentData));
    }

    // Route to appropriate page
    if (conversationNature === 'human-llm') {
      router.push(`/experiment/setup?name=${encodeURIComponent(experimentName)}`);
    } else {
      router.push(`/experiment/setup-llm?name=${encodeURIComponent(experimentName)}`);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-zinc-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create New Experiment</h1>
                <p className="text-sm text-zinc-600">Follow the guide below to set up your experiment</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Experiment
              </button>
            </div>

            {/* Instructions Content */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Getting Started</h2>
                <div className="prose prose-sm text-zinc-600">
                  <p className="mb-3">
                    Welcome to the experiment creation wizard. This guide will help you set up and configure 
                    your LLM-based research experiment.
                  </p>
                  <p className="mb-3">
                    Before creating an experiment, make sure you have:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 mb-3">
                    <li>Created and uploaded a dataset with your subject data</li>
                    <li>Prepared your API keys for the LLM models you want to use</li>
                    <li>Defined your research objectives and experiment parameters</li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Experiment Types</h2>
                <div className="space-y-4">
                  <div className="border border-zinc-200 rounded-lg p-4">
                    <h3 className="font-semibold text-zinc-900 mb-2">Human-LLM Conversations</h3>
                    <p className="text-sm text-zinc-600">
                      Simulate conversations between human subjects and AI models. Perfect for testing 
                      persuasion, belief changes, and interactive dialogue scenarios.
                    </p>
                  </div>
                  <div className="border border-zinc-200 rounded-lg p-4">
                    <h3 className="font-semibold text-zinc-900 mb-2">LLM-LLM Conversations</h3>
                    <p className="text-sm text-zinc-600">
                      Create multi-agent conversations between different AI models. Useful for studying 
                      AI-to-AI interactions, debate scenarios, and collaborative reasoning.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-zinc-200 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Configuration Steps</h2>
                <div className="prose prose-sm text-zinc-600">
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Click "Create Experiment" button above</li>
                    <li>Enter a descriptive name for your experiment</li>
                    <li>Select the conversation nature (Human-LLM or LLM-LLM)</li>
                    <li>Choose a dataset from your uploaded datasets</li>
                    <li>Configure model parameters and conversation settings</li>
                    <li>Review and launch your experiment</li>
                  </ol>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
                <p className="text-sm text-blue-800">
                  Start with a small subset of subjects (10-20) to test your configuration before 
                  running the full experiment. This helps identify any issues early and saves API costs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Experiment Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">Create New Experiment</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setExperimentName('');
                    setSelectedDataset(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-4 space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Experiment Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Experiment Name
                  </label>
                  <input
                    type="text"
                    value={experimentName}
                    onChange={(e) => setExperimentName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    placeholder="e.g., Conspiracy Belief Study 2024"
                  />
                </div>

                {/* Conversation Nature */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Conversation Nature
                  </label>
                  <select
                    value={conversationNature}
                    onChange={(e) => setConversationNature(e.target.value as 'llm-llm' | 'human-llm')}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  >
                    <option value="human-llm">Human-LLM</option>
                    <option value="llm-llm">LLM-LLM</option>
                  </select>
                </div>

                {/* Dataset Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Dataset
                  </label>
                  <select
                    value={selectedDataset || ''}
                    onChange={(e) => setSelectedDataset(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  >
                    <option value="">
                      {datasets.length === 0 ? '(No datasets created)' : 'Select a dataset...'}
                    </option>
                    {datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.name} ({dataset.row_count} rows)
                      </option>
                    ))}
                  </select>
                  {datasets.length === 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      Please create a dataset first in the Datasets page
                    </p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setExperimentName('');
                    setSelectedDataset(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateExperiment}
                  disabled={loading || datasets.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Experiment, LLMExperimentConfig, HumanLLMExperimentConfig } from '@/lib/api';
import { Plus, Users, MessageSquare, Eye, Edit2, Trash2, X, Calendar, Database } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function MyExperimentsPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'human-llm' | 'llm-llm'>('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const data = await api.listExperiments();
      setExperiments(data);
    } catch (err) {
      console.error('Failed to load experiments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiments = experiments.filter(exp => {
    if (filter === 'all') return true;
    return exp.experiment_type === filter;
  });

  const handleView = (exp: Experiment) => {
    setSelectedExperiment(exp);
    setShowViewModal(true);
  };

  const handleEdit = (exp: Experiment) => {
    // Redirect to appropriate setup page with experiment ID
    if (exp.experiment_type === 'llm-llm') {
      router.push(`/experiment/setup-llm?edit=${exp.id}`);
    } else {
      router.push(`/experiment/setup?edit=${exp.id}`);
    }
  };

  const handleDelete = async (exp: Experiment) => {
    if (!confirm(`Are you sure you want to delete "${exp.name}"?`)) {
      return;
    }

    try {
      await api.deleteExperiment(exp.id);
      await loadExperiments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete experiment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getExperimentTypeLabel = (type: 'human-llm' | 'llm-llm') => {
    return type === 'llm-llm' ? 'LLM-LLM' : 'Human-LLM';
  };

  const getExperimentTypeIcon = (type: 'human-llm' | 'llm-llm') => {
    if (type === 'llm-llm') {
      return <MessageSquare className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">My Experiments</h1>
              <p className="text-sm text-zinc-600 mt-1">Manage your experiment configurations</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/experiments/create')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Experiment
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-zinc-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'all'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All ({experiments.length})
            </button>
            <button
              onClick={() => setFilter('human-llm')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'human-llm'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Human-LLM ({experiments.filter(e => e.experiment_type === 'human-llm').length})
            </button>
            <button
              onClick={() => setFilter('llm-llm')}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                filter === 'llm-llm'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-600 hover:text-zinc-900'
              }`}
            >
              LLM-LLM ({experiments.filter(e => e.experiment_type === 'llm-llm').length})
            </button>
          </div>

          {/* Experiments List */}
          {filteredExperiments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
              <MessageSquare className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">No experiments found</h3>
              <p className="text-sm text-zinc-600 mb-4">
                {filter === 'all' 
                  ? 'Create your first experiment to get started'
                  : `No ${getExperimentTypeLabel(filter as any)} experiments`}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => router.push('/dashboard/experiments/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Experiment
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredExperiments.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 truncate">{exp.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-700">
                          {getExperimentTypeIcon(exp.experiment_type)}
                          {getExperimentTypeLabel(exp.experiment_type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Database className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{exp.dataset_name || `Dataset #${exp.dataset_id}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span>Created {formatDate(exp.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => handleView(exp)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(exp)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(exp)}
                      className="flex items-center justify-center px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View Experiment Modal */}
          {showViewModal && selectedExperiment && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">{selectedExperiment.name}</h2>
                    <p className="text-sm text-zinc-600 mt-0.5">{getExperimentTypeLabel(selectedExperiment.experiment_type)} Experiment</p>
                  </div>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-zinc-500 hover:text-zinc-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <ViewExperimentContent experiment={selectedExperiment} />
                </div>

                <div className="p-6 border-t border-zinc-200 flex justify-end gap-3 sticky bottom-0 bg-white">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEdit(selectedExperiment);
                    }}
                    className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Experiment
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function ViewExperimentContent({ experiment }: { experiment: Experiment }) {
  const config = experiment.config;

  if (experiment.experiment_type === 'llm-llm') {
    const llmConfig = config as LLMExperimentConfig;
    
    return (
      <div className="space-y-6">
        {/* Dataset Info */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Dataset</h3>
          <div className="bg-zinc-50 rounded-lg p-4">
            <p className="text-sm text-zinc-900">{experiment.dataset_name || `Dataset #${experiment.dataset_id}`}</p>
          </div>
        </div>

        {/* Personas */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Personas</h3>
          <div className="grid grid-cols-2 gap-4">
            {llmConfig.personas.map((persona, idx) => (
              <div key={persona.id} className="bg-zinc-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-zinc-900 mb-2">{persona.name}</h4>
                <p className="text-xs text-zinc-600">{persona.systemMessage || 'No system message'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conversation Setup */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Conversation Setup</h3>
          <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-1">First to speak</p>
              <p className="text-sm text-zinc-900">Column {llmConfig.conversation_setup.first_to_speak}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-1">Initial Message</p>
              <p className="text-sm text-zinc-900">{llmConfig.conversation_setup.initial_message}</p>
              <p className="text-xs text-zinc-500 mt-1">Role: {llmConfig.conversation_setup.initial_message_role}</p>
            </div>
            {llmConfig.conversation_setup.blocks && llmConfig.conversation_setup.blocks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-600 mb-2">Conversation Blocks</p>
                <div className="space-y-2">
                  {llmConfig.conversation_setup.blocks.map((block) => (
                    <div key={block.id} className="bg-white rounded border border-zinc-200 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-700">
                          {block.type === 'predefined' ? 'Pre-defined' : 'Simulated'} • Column {block.column}
                        </span>
                        <span className="text-xs text-zinc-500">Turn {block.turnNumber}</span>
                      </div>
                      {block.content && (
                        <p className="text-xs text-zinc-600 mt-1">{block.content.substring(0, 100)}...</p>
                      )}
                      {block.rounds && (
                        <p className="text-xs text-zinc-600 mt-1">{block.rounds} rounds</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } else {
    const humanConfig = config as HumanLLMExperimentConfig;
    
    return (
      <div className="space-y-6">
        {/* Dataset Info */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Dataset</h3>
          <div className="bg-zinc-50 rounded-lg p-4">
            <p className="text-sm text-zinc-900">{experiment.dataset_name || `Dataset #${experiment.dataset_id}`}</p>
          </div>
        </div>

        {/* LLM Persona */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">LLM Persona</h3>
          <div className="bg-zinc-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-zinc-900 mb-2">{humanConfig.llm_persona.name}</h4>
            <p className="text-xs text-zinc-600">{humanConfig.llm_persona.systemMessage || 'No system message'}</p>
          </div>
        </div>

        {/* Conversation Setup */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Conversation Setup</h3>
          <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-1">First to speak</p>
              <p className="text-sm text-zinc-900 capitalize">{humanConfig.conversation_setup.first_to_speak}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-600 mb-1">Initial Message</p>
              <p className="text-sm text-zinc-900">{humanConfig.conversation_setup.initial_message}</p>
              <p className="text-xs text-zinc-500 mt-1">Role: {humanConfig.conversation_setup.initial_message_role}</p>
            </div>
            {humanConfig.conversation_setup.blocks && humanConfig.conversation_setup.blocks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-zinc-600 mb-2">Conversation Blocks</p>
                <div className="space-y-2">
                  {humanConfig.conversation_setup.blocks.map((block) => (
                    <div key={block.id} className="bg-white rounded border border-zinc-200 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-zinc-700">
                          {block.type === 'predefined' ? 'Pre-defined' : 'Simulated'} • {block.column === 1 ? 'Human' : 'LLM'}
                        </span>
                        <span className="text-xs text-zinc-500">Turn {block.turnNumber}</span>
                      </div>
                      {block.content && (
                        <p className="text-xs text-zinc-600 mt-1">{block.content.substring(0, 100)}...</p>
                      )}
                      {block.rounds && (
                        <p className="text-xs text-zinc-600 mt-1">{block.rounds} rounds</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

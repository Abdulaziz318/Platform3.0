
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Experiment } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Download, XCircle, Users, MessageSquare } from 'lucide-react';

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const experimentId = parseInt(params.id as string);
  
  const [experiment, setExperiment] = useState<Experiment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExperiment();
    
    // Poll for updates every 3 seconds if running
    const interval = setInterval(() => {
      if (experiment?.status === 'running') {
        loadExperiment();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [experimentId, experiment?.status]);

  const loadExperiment = async () => {
    try {
      const data = await api.getExperiment(experimentId);
      setExperiment(data);
    } catch (err) {
      console.error('Failed to load experiment:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-600">Loading experiment...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!experiment) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center bg-white rounded-xl border border-zinc-200 p-12">
            <h1 className="text-xl font-bold mb-4 text-zinc-900">Experiment Not Found</h1>
            <button
              onClick={() => router.push('/experiments')}
              className="text-zinc-600 hover:text-zinc-900 text-sm"
            >
              ← Back to Experiments
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
        <button
          onClick={() => router.push('/experiments')}
          className="flex items-center text-zinc-600 hover:text-zinc-900 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiments
        </button>

        <div className="bg-white rounded-xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-zinc-900">{experiment.name}</h1>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium">
              {experiment.experiment_type === 'llm-llm' ? (
                <>
                  <MessageSquare size={16} />
                  LLM-LLM
                </>
              ) : (
                <>
                  <Users size={16} />
                  Human-LLM
                </>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <p className="text-sm text-zinc-600 mb-1">Status</p>
              <p className="text-lg font-semibold capitalize text-zinc-900">{experiment.status}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <p className="text-sm text-zinc-600 mb-1">
                {experiment.experiment_type === 'llm-llm' ? 'Conversations' : 'Subjects'}
              </p>
              <p className="text-lg font-semibold text-zinc-900">{experiment.num_subjects}</p>
            </div>
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
              <p className="text-sm text-zinc-600 mb-1">Model</p>
              <p className="text-lg font-semibold text-zinc-900">{experiment.model_choice}</p>
            </div>
          </div>

          {/* LLM-LLM Specific Details */}
          {experiment.experiment_type === 'llm-llm' && experiment.llm_config && (
            <div className="mb-6 bg-purple-50 border border-purple-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-4 text-zinc-900">Conversation Setup</h2>
              <div className="space-y-4">
                {experiment.llm_config.personas && experiment.llm_config.personas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">Personas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {experiment.llm_config.personas.map((persona: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border border-purple-100">
                          <p className="font-medium text-sm text-zinc-900 mb-1">{persona.name}</p>
                          <p className="text-xs text-zinc-600 line-clamp-2">{persona.system_message || persona.systemMessage}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {experiment.llm_config.conversation_setup && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-2">Initial Message</h3>
                    <div className="bg-white p-3 rounded border border-purple-100">
                      <p className="text-sm text-zinc-700">{experiment.llm_config.conversation_setup.initial_message}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        Role: {experiment.llm_config.conversation_setup.initial_message_role} | 
                        First to speak: Persona {experiment.llm_config.conversation_setup.first_to_speak}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Section */}
          {experiment.status === 'running' && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-zinc-900">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900 mr-3"></div>
                Running Experiment
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-zinc-700">Overall Progress</span>
                    <span className="font-semibold text-zinc-900">{experiment.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-2">
                    <div
                      className="bg-zinc-900 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${experiment.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-zinc-700">
                  Turn {experiment.current_turn} • Processing subjects...
                </p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {experiment.error_message && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center text-sm">
                <XCircle className="h-4 w-4 mr-2" />
                Error
              </h3>
              <p className="text-red-700 text-sm">{experiment.error_message}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900">Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-zinc-400 mt-1.5 mr-3"></div>
                <div>
                  <p className="font-medium text-sm text-zinc-900">Created</p>
                  <p className="text-sm text-zinc-600">
                    {new Date(experiment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {experiment.started_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-zinc-400 mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium text-sm text-zinc-900">Started</p>
                    <p className="text-sm text-zinc-600">
                      {new Date(experiment.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {experiment.completed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-1.5 mr-3"></div>
                  <div>
                    <p className="font-medium text-sm text-zinc-900">Completed</p>
                    <p className="text-sm text-zinc-600">
                      {new Date(experiment.completed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {experiment.status === 'running' && (
              <button
                onClick={async () => {
                  if (confirm('Cancel this experiment? This cannot be undone.')) {
                    await api.cancelExperiment(experiment.id);
                    loadExperiment();
                  }
                }}
                className="flex items-center px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-medium"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Experiment
              </button>
            )}

            {experiment.results_available && (
              <button
                onClick={() => api.downloadResults(experiment.id)}
                className="flex items-center px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Results
              </button>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
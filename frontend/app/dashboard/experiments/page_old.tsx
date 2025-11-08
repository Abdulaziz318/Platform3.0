'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Experiment } from '@/lib/api';
import { FlaskConical, Users, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardExperimentsPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'human-llm' | 'llm-llm'>('all');

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-50';
      case 'running': return 'text-blue-700 bg-blue-50';
      case 'failed': return 'text-red-700 bg-red-50';
      case 'cancelled': return 'text-zinc-700 bg-zinc-50';
      default: return 'text-zinc-700 bg-zinc-50';
    }
  };

  const getExperimentTypeIcon = (type?: string) => {
    if (type === 'llm-llm') {
      return <MessageSquare className="h-4 w-4" />;
    }
    return <Users className="h-4 w-4" />;
  };

  const getExperimentTypeLabel = (type?: string) => {
    if (type === 'llm-llm') return 'LLM-LLM';
    return 'Human-LLM';
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header with Filter */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">My Experiments</h1>
                <p className="text-sm text-zinc-600 mt-1">
                  {filteredExperiments.length} experiment{filteredExperiments.length !== 1 ? 's' : ''}
                </p>
              </div>
          
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('human-llm')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'human-llm'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Human-LLM
            </button>
            <button
              onClick={() => setFilter('llm-llm')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                filter === 'llm-llm'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              LLM-LLM
            </button>
          </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
                <p className="mt-4 text-sm text-zinc-600">Loading experiments...</p>
              </div>
            ) : filteredExperiments.length === 0 ? (
              <div className="text-center py-12">
                <FlaskConical className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600">
                  {filter === 'all' 
                    ? 'No experiments yet. Create your first experiment to get started!'
                    : `No ${getExperimentTypeLabel(filter)} experiments found.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredExperiments.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => router.push(`/experiments/${exp.id}`)}
                    className="bg-white border border-zinc-200 rounded-lg p-4 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-zinc-900">{exp.name}</h3>
                          {/* Experiment Type Badge */}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-xs font-medium text-zinc-700">
                            {getExperimentTypeIcon(exp.experiment_type)}
                            {getExperimentTypeLabel(exp.experiment_type)}
                          </span>
                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(exp.status)}`}>
                            {exp.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-600">
                          <span>{exp.num_subjects} subjects</span>
                          <span>•</span>
                          <span>{exp.model_choice}</span>
                          {exp.status === 'running' && (
                            <>
                              <span>•</span>
                              <span>Turn {exp.current_turn}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {exp.status === 'running' && (
                        <div className="ml-4">
                          <div className="text-right mb-1">
                            <span className="text-sm font-medium text-zinc-900">{exp.progress}%</span>
                          </div>
                          <div className="w-32 bg-zinc-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{ width: `${exp.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

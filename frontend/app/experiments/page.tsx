'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Experiment } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, Download, StopCircle, PlayCircle, Trash2, RefreshCw } from 'lucide-react';

export default function ExperimentsPage() {
  const router = useRouter();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    loadExperiments();
    
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(loadExperiments, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

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

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Stop this experiment?')) return;
    try {
      await api.cancelExperiment(id);
      loadExperiments();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await api.downloadResults(id);
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this simulation?')) return;
    try {
      await api.cancelExperiment(id);
      loadExperiments();
    } catch (err: any) {
      alert('Failed: ' + err.message);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'running': return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default: return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border border-green-200';
      case 'running': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'failed': return 'bg-red-50 text-red-700 border border-red-200';
      case 'cancelled': return 'bg-zinc-100 text-zinc-700 border border-zinc-200';
      default: return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-600 font-medium">Loading experiments...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Experiments</h1>
              <p className="text-sm text-zinc-600">
                {experiments.length} {experiments.length === 1 ? 'experiment' : 'experiments'} total
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  if (!autoRefresh) loadExperiments();
                }}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  autoRefresh ? 'bg-zinc-100 border border-zinc-300 text-zinc-900' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh'}
              </button>
              <button
                onClick={() => router.push('/setup')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </button>
            </div>
          </div>

          {experiments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-lg text-zinc-900 font-medium mb-2">No experiments found</p>
              <button onClick={() => router.push('/setup')} className="text-zinc-600 hover:text-zinc-900 text-sm">
                Create your first experiment →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {experiments.map((exp) => (
                <div key={exp.id} className="bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
                  <div className="p-5 cursor-pointer" onClick={() => toggleExpand(exp.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(exp.status)}
                          <h3 className="text-base font-semibold text-zinc-900">{exp.name}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusColor(exp.status)}`}>
                            {exp.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                            <p className="text-xs text-zinc-600 mb-1">
                              {exp.status === 'running' ? 'Current Turn' : 'Subjects'}
                            </p>
                            <p className="text-base font-semibold text-zinc-900">
                              {exp.status === 'running' ? exp.current_turn : exp.num_subjects}
                            </p>
                          </div>
                          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                            <p className="text-xs text-zinc-600 mb-1">Model</p>
                            <p className="text-base font-semibold text-zinc-900 truncate">{exp.model_choice}</p>
                          </div>
                          <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                            <p className="text-xs text-zinc-600 mb-1">Last Updated</p>
                            <p className="text-sm font-semibold text-zinc-900">{formatDate(exp.created_at).split(',')[0]}</p>
                          </div>
                        </div>
                        {exp.status === 'running' && (
                          <div className="mb-2">
                            <div className="flex justify-between text-xs text-zinc-600 mb-1.5 font-medium">
                              <span>Progress</span>
                              <span className="font-semibold text-zinc-900">{exp.progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 rounded-full h-2">
                              <div className="bg-zinc-900 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${exp.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {expandedIds.has(exp.id) ? <ChevronUp className="h-5 w-5 text-zinc-400" /> : <ChevronDown className="h-5 w-5 text-zinc-400" />}
                      </div>
                    </div>
                  </div>
                  {expandedIds.has(exp.id) && (
                    <div className="border-t border-zinc-200 bg-zinc-50 p-5">
                      {exp.error_message && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm font-medium text-red-900">Error</p>
                          <p className="text-sm text-red-700 mt-1">{exp.error_message}</p>
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-zinc-900 mb-2">Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-zinc-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                            <span className="font-medium">Created:</span>
                            <span>{formatDate(exp.created_at)}</span>
                          </div>
                          {exp.started_at && (
                            <div className="flex items-center gap-2 text-zinc-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                              <span className="font-medium">Started:</span>
                              <span>{formatDate(exp.started_at)}</span>
                            </div>
                          )}
                          {exp.completed_at && (
                            <div className="flex items-center gap-2 text-zinc-600">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>
                              <span className="font-medium">Completed:</span>
                              <span>{formatDate(exp.completed_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {exp.status === 'running' && (
                          <button onClick={() => handleCancel(exp.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-medium">
                            <StopCircle className="h-4 w-4 mr-1.5" />
                            Stop
                          </button>
                        )}
                        {(exp.status === 'cancelled' || exp.status === 'failed') && (
                          <button onClick={() => { alert('Resume command sent'); loadExperiments(); }}
                            className="inline-flex items-center px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-medium">
                            <PlayCircle className="h-4 w-4 mr-1.5" />
                            Resume
                          </button>
                        )}
                        {exp.results_available && (
                          <button onClick={() => handleDownload(exp.id)}
                            className="inline-flex items-center px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-sm font-medium">
                            <Download className="h-4 w-4 mr-1.5" />
                            Download Results
                          </button>
                        )}
                        <button onClick={() => router.push(`/experiments/${exp.id}`)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50 text-sm font-medium">
                          View Details →
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-white border border-zinc-300 text-zinc-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-sm font-medium ml-auto">
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
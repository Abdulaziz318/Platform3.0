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
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'failed': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">Loading experiments...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🧪 Simulation Dashboard</h1>
              <p className="text-gray-600">
                {experiments.length} {experiments.length === 1 ? 'simulation' : 'simulations'} total
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAutoRefresh(!autoRefresh);
                  if (!autoRefresh) loadExperiments();
                }}
                className={`inline-flex items-center px-4 py-2 border-2 text-sm font-medium rounded-lg transition-all ${
                  autoRefresh ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? '🔁 Auto-refresh ON' : 'Auto-refresh'}
              </button>
              <button
                onClick={() => router.push('/setup')}
                className="inline-flex items-center px-6 py-2 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Simulation
              </button>
            </div>
          </div>

          {experiments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300 shadow-md">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl text-gray-600 mb-4">No simulations found</p>
              <button onClick={() => router.push('/setup')} className="text-blue-600 hover:text-blue-500 font-semibold text-lg">
                Create your first simulation →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiments.map((exp) => (
                <div key={exp.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-200">
                  <div className="p-6 cursor-pointer hover:bg-gray-50" onClick={() => toggleExpand(exp.id)}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {getStatusIcon(exp.status)}
                          <h3 className="text-xl font-bold text-gray-900">📁 {exp.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(exp.status)}`}>
                            {exp.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 font-medium mb-1">
                              {exp.status === 'running' ? '🔄 Current Turn' : '👥 Subjects'}
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                              {exp.status === 'running' ? exp.current_turn : exp.num_subjects}
                            </p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <p className="text-xs text-purple-600 font-medium mb-1">🧠 Model</p>
                            <p className="text-lg font-bold text-purple-900 truncate">{exp.model_choice}</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-xs text-green-600 font-medium mb-1">🕒 Last Updated</p>
                            <p className="text-sm font-bold text-green-900">{formatDate(exp.created_at).split(',')[0]}</p>
                          </div>
                        </div>
                        {exp.status === 'running' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1 font-medium">
                              <span>Progress</span>
                              <span className="font-bold text-blue-600">{exp.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${exp.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {expandedIds.has(exp.id) ? <ChevronUp className="h-6 w-6 text-gray-400" /> : <ChevronDown className="h-6 w-6 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  {expandedIds.has(exp.id) && (
                    <div className="border-t border-gray-200 bg-gray-50 p-6">
                      {exp.error_message && (
                        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                          <p className="text-sm font-semibold text-red-800">❌ Simulation Error</p>
                          <p className="text-sm text-red-700 mt-1">{exp.error_message}</p>
                        </div>
                      )}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">📅 Timeline</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="font-medium">Created:</span>
                            <span>{formatDate(exp.created_at)}</span>
                          </div>
                          {exp.started_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className="font-medium">Started:</span>
                              <span>{formatDate(exp.started_at)}</span>
                            </div>
                          )}
                          {exp.completed_at && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                              <span className="font-medium">Completed:</span>
                              <span>{formatDate(exp.completed_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {exp.status === 'running' && (
                          <button onClick={() => handleCancel(exp.id)}
                            className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded-lg hover:bg-red-200 font-medium">
                            <StopCircle className="h-4 w-4 mr-2" />
                            🛑 Stop
                          </button>
                        )}
                        {(exp.status === 'cancelled' || exp.status === 'failed') && (
                          <button onClick={() => { alert('▶️ Resume command sent'); loadExperiments(); }}
                            className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded-lg hover:bg-green-200 font-medium">
                            <PlayCircle className="h-4 w-4 mr-2" />
                            ▶️ Resume
                          </button>
                        )}
                        {exp.results_available && (
                          <button onClick={() => handleDownload(exp.id)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md">
                            <Download className="h-4 w-4 mr-2" />
                            Download Results
                          </button>
                        )}
                        <button onClick={() => router.push(`/experiments/${exp.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                          View Details →
                        </button>
                        <button onClick={() => handleDelete(exp.id)}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-700 font-medium ml-auto">
                          <Trash2 className="h-4 w-4 mr-2" />
                          🗑️ Delete
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
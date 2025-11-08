'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Simulation, SimulationStatus } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Play, Square, Download, Eye, Edit2, Trash2, AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';

export default function MySimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [numRowsToRun, setNumRowsToRun] = useState<number>(0);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadSimulations();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      loadSimulations();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const loadSimulations = async () => {
    try {
      const data = await api.listSimulations();
      setSimulations(data);
    } catch (err) {
      console.error('Failed to load simulations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!selectedSimulation || numRowsToRun <= 0) {
      alert('Please enter a valid number of rows');
      return;
    }

    setActionInProgress(true);
    try {
      await api.runSimulation(selectedSimulation.id, numRowsToRun);
      setShowRunModal(false);
      setSelectedSimulation(null);
      await loadSimulations();
    } catch (err: any) {
      alert(err.message || 'Failed to run simulation');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleStopSimulation = async (simulation: Simulation) => {
    setActionInProgress(true);
    try {
      await api.stopSimulation(simulation.id);
      await loadSimulations();
    } catch (err: any) {
      alert(err.message || 'Failed to stop simulation');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDownloadResults = async (simulation: Simulation) => {
    try {
      const blob = await api.downloadResults(simulation.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation_${simulation.id}_results.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download results');
    }
  };

  const handleDeleteSimulation = async () => {
    if (!selectedSimulation) return;

    setActionInProgress(true);
    try {
      await api.deleteSimulation(selectedSimulation.id);
      setShowDeleteConfirm(false);
      setSelectedSimulation(null);
      await loadSimulations();
    } catch (err: any) {
      alert(err.message || 'Failed to delete simulation');
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusIcon = (status: SimulationStatus) => {
    switch (status) {
      case 'not_started':
        return <Clock className="h-5 w-5 text-zinc-500" />;
      case 'running':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'stopped':
        return <Square className="h-5 w-5 text-orange-500" />;
      case 'finished':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: SimulationStatus) => {
    const styles = {
      not_started: 'bg-zinc-100 text-zinc-700',
      running: 'bg-blue-100 text-blue-700',
      stopped: 'bg-orange-100 text-orange-700',
      finished: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
    };

    const labels = {
      not_started: 'Not Started',
      running: 'Running',
      stopped: 'Stopped',
      finished: 'Finished',
      error: 'Error',
    };

    return (
      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const canEdit = (status: SimulationStatus) => {
    return status === 'not_started' || status === 'stopped' || status === 'error';
  };

  const canRun = (status: SimulationStatus) => {
    return status === 'not_started' || status === 'stopped' || status === 'error';
  };

  const openRunModal = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setNumRowsToRun(simulation.num_rows);
    setShowRunModal(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
              <p className="mt-4 text-sm text-zinc-600">Loading simulations...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">My Simulations</h1>
                <p className="text-sm text-zinc-600 mt-1">
                  Manage and run your experiment simulations
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/simulations/create')}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Simulation
              </button>
            </div>

            {/* Simulations List */}
            {simulations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
                <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Simulations</h3>
                <p className="text-sm text-zinc-600 mb-4">Create your first simulation to get started</p>
                <button
                  onClick={() => router.push('/dashboard/simulations/create')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  New Simulation
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {simulations.map((simulation) => (
                  <div
                    key={simulation.id}
                    className="bg-white rounded-lg border border-zinc-200 p-5 hover:border-zinc-300 transition-colors"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(simulation.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-zinc-900">{simulation.name}</h3>
                            {getStatusBadge(simulation.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-zinc-600">
                            <span>Experiment: {simulation.experiment_name}</span>
                            <span>•</span>
                            <span>Dataset: {simulation.dataset_name}</span>
                            <span>•</span>
                            <span>Model: {simulation.model}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar (if applicable) */}
                    {simulation.status !== 'not_started' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-zinc-600 mb-1">
                          <span>Progress</span>
                          <span>{simulation.progress || 0}% ({simulation.current_row || 0}/{simulation.num_rows} rows)</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              simulation.status === 'error'
                                ? 'bg-red-500'
                                : simulation.status === 'finished'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${simulation.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {simulation.status === 'error' && simulation.error_message && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900">Error</p>
                          <p className="text-sm text-red-700 mt-1">{simulation.error_message}</p>
                        </div>
                      </div>
                    )}

                    {/* Details Row */}
                    <div className="grid grid-cols-4 gap-4 mb-4 pb-4 border-b border-zinc-200">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Created</p>
                        <p className="text-sm text-zinc-900">
                          {new Date(simulation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Provider</p>
                        <p className="text-sm text-zinc-900">{simulation.provider_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Endpoint</p>
                        <p className="text-sm text-zinc-900 capitalize">{simulation.endpoint_type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Type</p>
                        <p className="text-sm text-zinc-900">
                          {simulation.experiment_type === 'llm-llm' ? 'LLM-LLM' : 'Human-LLM'}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Run/Stop/Download Button */}
                      {simulation.status === 'running' ? (
                        <button
                          onClick={() => handleStopSimulation(simulation)}
                          disabled={actionInProgress}
                          className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Square className="h-4 w-4" />
                          Stop Simulation
                        </button>
                      ) : simulation.status === 'finished' ? (
                        <button
                          onClick={() => handleDownloadResults(simulation)}
                          className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download Results
                        </button>
                      ) : canRun(simulation.status) ? (
                        <button
                          onClick={() => openRunModal(simulation)}
                          disabled={actionInProgress}
                          className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Play className="h-4 w-4" />
                          Run Simulation
                        </button>
                      ) : null}

                      {/* View Button */}
                      <button
                        onClick={() => {
                          setSelectedSimulation(simulation);
                          setShowViewModal(true);
                        }}
                        className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>

                      {/* Edit Button */}
                      {simulation.status !== 'finished' && (
                        <button
                          onClick={() => router.push(`/dashboard/simulations/create?edit=${simulation.id}`)}
                          disabled={!canEdit(simulation.status)}
                          className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                            canEdit(simulation.status)
                              ? 'text-zinc-700 border border-zinc-300 hover:bg-zinc-50'
                              : 'text-zinc-400 border border-zinc-200 cursor-not-allowed'
                          }`}
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                      )}

                      {/* Delete Button */}
                      <button
                        onClick={() => {
                          setSelectedSimulation(simulation);
                          setShowDeleteConfirm(true);
                        }}
                        className="px-4 py-2 text-sm text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && selectedSimulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-xl font-semibold text-zinc-900">Simulation Details</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Name</p>
                  <p className="text-zinc-900">{selectedSimulation.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Status</p>
                  {getStatusBadge(selectedSimulation.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Experiment</p>
                  <p className="text-zinc-900">{selectedSimulation.experiment_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Dataset</p>
                  <p className="text-zinc-900">{selectedSimulation.dataset_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Provider</p>
                  <p className="text-zinc-900">{selectedSimulation.provider_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Model</p>
                  <p className="text-zinc-900">{selectedSimulation.model}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Endpoint Type</p>
                  <p className="text-zinc-900 capitalize">{selectedSimulation.endpoint_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Number of Rows</p>
                  <p className="text-zinc-900">{selectedSimulation.num_rows}</p>
                </div>
                {Object.keys(selectedSimulation.llm_parameters).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 mb-2">LLM Parameters</p>
                    <div className="bg-zinc-50 rounded-lg p-3 space-y-1">
                      {selectedSimulation.llm_parameters.temperature && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600">Temperature:</span>
                          <span className="text-zinc-900">{selectedSimulation.llm_parameters.temperature}</span>
                        </div>
                      )}
                      {selectedSimulation.llm_parameters.top_p && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600">Top P:</span>
                          <span className="text-zinc-900">{selectedSimulation.llm_parameters.top_p}</span>
                        </div>
                      )}
                      {selectedSimulation.llm_parameters.max_tokens && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600">Max Tokens:</span>
                          <span className="text-zinc-900">{selectedSimulation.llm_parameters.max_tokens}</span>
                        </div>
                      )}
                      {selectedSimulation.llm_parameters.frequency_penalty !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600">Frequency Penalty:</span>
                          <span className="text-zinc-900">{selectedSimulation.llm_parameters.frequency_penalty}</span>
                        </div>
                      )}
                      {selectedSimulation.llm_parameters.presence_penalty !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-600">Presence Penalty:</span>
                          <span className="text-zinc-900">{selectedSimulation.llm_parameters.presence_penalty}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Created</p>
                  <p className="text-zinc-900">{new Date(selectedSimulation.created_at).toLocaleString()}</p>
                </div>
                {selectedSimulation.started_at && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 mb-1">Started</p>
                    <p className="text-zinc-900">{new Date(selectedSimulation.started_at).toLocaleString()}</p>
                  </div>
                )}
                {selectedSimulation.completed_at && (
                  <div>
                    <p className="text-sm font-medium text-zinc-700 mb-1">Completed</p>
                    <p className="text-zinc-900">{new Date(selectedSimulation.completed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-zinc-200 flex justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedSimulation(null);
                  }}
                  className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Run Modal */}
        {showRunModal && selectedSimulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-xl font-semibold text-zinc-900">Run Simulation</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-600 mb-4">
                  How many rows from the dataset would you like to process?
                </p>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Number of Rows
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedSimulation.num_rows}
                    value={numRowsToRun}
                    onChange={(e) => setNumRowsToRun(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Maximum: {selectedSimulation.num_rows} rows
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowRunModal(false);
                    setSelectedSimulation(null);
                  }}
                  className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={actionInProgress || numRowsToRun <= 0 || numRowsToRun > selectedSimulation.num_rows}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionInProgress ? 'Starting...' : 'Run Simulation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedSimulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-xl font-semibold text-zinc-900">Delete Simulation</h2>
              </div>
              <div className="p-6">
                <p className="text-zinc-900">
                  Are you sure you want to delete <strong>{selectedSimulation.name}</strong>?
                </p>
                <p className="text-sm text-zinc-600 mt-2">
                  This action cannot be undone.
                </p>
              </div>
              <div className="p-6 border-t border-zinc-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setSelectedSimulation(null);
                  }}
                  className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSimulation}
                  disabled={actionInProgress}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionInProgress ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}

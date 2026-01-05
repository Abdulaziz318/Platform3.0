'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, Simulation, SimulationStatus } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Play, Square, Download, Eye, Edit2, Trash2, AlertCircle, CheckCircle, Clock, XCircle, Loader, Table, BarChart3, X } from 'lucide-react';

// Mock data for simulation results
const mockResultsData = [
  { Subject: 1, Conspiracy: 'JFK Assassination - Oswald did not act alone', PreBelief: 62, PostBelief: 34, BeliefChange: 28, HumanBotPostBelief: 60, HumanBotBeliefChange: 2, Age: 52, Hispanic: 'No', Education: 'College', Gender: 'Female', Race: 'White', PartyAffil: 'Democrat', PoliticalPref: 'Liberal', Religion: 'Christian' },
  { Subject: 2, Conspiracy: 'JFK Assassination - Government setup', PreBelief: 71, PostBelief: 30, BeliefChange: 41, HumanBotPostBelief: 70, HumanBotBeliefChange: 1, Age: 47, Hispanic: 'No', Education: 'High School', Gender: 'Male', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Christian' },
  { Subject: 3, Conspiracy: 'MLK Assassination - Government inconsistencies', PreBelief: 95, PostBelief: 100, BeliefChange: -5, HumanBotPostBelief: 90, HumanBotBeliefChange: 5, Age: 41, Hispanic: 'No', Education: 'Graduate Degree', Gender: 'Female', Race: 'Black', PartyAffil: 'Democrat', PoliticalPref: 'Liberal', Religion: 'Christian' },
  { Subject: 4, Conspiracy: '2020 Election Fraud - Stolen election', PreBelief: 59, PostBelief: 20, BeliefChange: 39, HumanBotPostBelief: 45, HumanBotBeliefChange: 14, Age: 30, Hispanic: 'No', Education: 'College', Gender: 'Male', Race: 'White', PartyAffil: 'Republican', PoliticalPref: 'Conservative', Religion: 'Christian' },
  { Subject: 5, Conspiracy: 'Aliens - Government cover-up of UFOs', PreBelief: 52, PostBelief: 64, BeliefChange: -12, HumanBotPostBelief: 55, HumanBotBeliefChange: -3, Age: 54, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Spiritual' },
  { Subject: 6, Conspiracy: 'Reagan Era - Drugs and guns to destabilize communities', PreBelief: 90, PostBelief: 90, BeliefChange: 0, HumanBotPostBelief: 80, HumanBotBeliefChange: 10, Age: 34, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'Black', PartyAffil: 'Democrat', PoliticalPref: 'Progressive', Religion: 'Christian' },
  { Subject: 7, Conspiracy: 'JFK Assassination - CIA retaliation for Bay of Pigs', PreBelief: 80, PostBelief: 52, BeliefChange: 28, HumanBotPostBelief: 70, HumanBotBeliefChange: 10, Age: 35, Hispanic: 'Yes', Education: 'Bachelor Degree', Gender: 'Female', Race: 'Hispanic', PartyAffil: 'Independent', PoliticalPref: 'Liberal', Religion: 'Catholic' },
  { Subject: 8, Conspiracy: 'Moon Landing - Footage authenticity questions', PreBelief: 80, PostBelief: 75, BeliefChange: 5, HumanBotPostBelief: 60, HumanBotBeliefChange: 20, Age: 38, Hispanic: 'No', Education: 'Some College', Gender: 'Female', Race: 'White', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Agnostic' },
  { Subject: 9, Conspiracy: 'Government experimenting on marginalized populations', PreBelief: 100, PostBelief: 100, BeliefChange: 0, HumanBotPostBelief: 100, HumanBotBeliefChange: 0, Age: 45, Hispanic: 'Yes', Education: 'College', Gender: 'Female', Race: 'Hispanic', PartyAffil: 'Democrat', PoliticalPref: 'Progressive', Religion: 'Catholic' },
  { Subject: 10, Conspiracy: 'AI Robots - Sentient AI takeover threat', PreBelief: 50, PostBelief: 50, BeliefChange: 0, HumanBotPostBelief: 30, HumanBotBeliefChange: 20, Age: 28, Hispanic: 'Yes', Education: 'Bachelor Degree', Gender: 'Male', Race: 'Hispanic', PartyAffil: 'Independent', PoliticalPref: 'Moderate', Religion: 'Atheist' }
];

// Simple Bar Chart Component
const BarChart = ({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) => {
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)));
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <div className="mb-8">
      <h4 className="text-sm font-semibold text-zinc-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-zinc-700">{item.label}</span>
              <span className="text-sm font-semibold text-zinc-900">{item.value.toFixed(1)}</span>
            </div>
            <div className="h-8 bg-zinc-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg transition-all"
                style={{
                  width: `${Math.abs(item.value) * scale}%`,
                  backgroundColor: item.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function MySimulationsPage() {
  const router = useRouter();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDataModal, setShowDataModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [numRowsToRun, setNumRowsToRun] = useState<number>(0);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadSimulations();
    
    // Poll for updates every 3 seconds to check for running simulations
    const interval = setInterval(() => {
      loadSimulations();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run once on mount

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
    if (!selectedSimulation || numRowsToRun <= 0) return;

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

  const openRunModal = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setNumRowsToRun(simulation.num_rows);
    setShowRunModal(true);
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

  // Calculate statistics for analysis
  const calculateAnalytics = () => {
    // Average Belief Change: Actual vs Human Bot
    const avgActualChange = mockResultsData.reduce((sum, row) => sum + row.BeliefChange, 0) / mockResultsData.length;
    const avgHumanBotChange = mockResultsData.reduce((sum, row) => sum + row.HumanBotBeliefChange, 0) / mockResultsData.length;

    // By Education Level
    const educationGroups: { [key: string]: { actual: number[], humanBot: number[] } } = {};
    mockResultsData.forEach(row => {
      if (!educationGroups[row.Education]) {
        educationGroups[row.Education] = { actual: [], humanBot: [] };
      }
      educationGroups[row.Education].actual.push(row.BeliefChange);
      educationGroups[row.Education].humanBot.push(row.HumanBotBeliefChange);
    });

    const educationData = Object.keys(educationGroups).map(edu => ({
      education: edu,
      actual: educationGroups[edu].actual.reduce((a, b) => a + b, 0) / educationGroups[edu].actual.length,
      humanBot: educationGroups[edu].humanBot.reduce((a, b) => a + b, 0) / educationGroups[edu].humanBot.length
    }));

    // By Political Affiliation
    const partyGroups: { [key: string]: { actual: number[], humanBot: number[] } } = {};
    mockResultsData.forEach(row => {
      if (!partyGroups[row.PartyAffil]) {
        partyGroups[row.PartyAffil] = { actual: [], humanBot: [] };
      }
      partyGroups[row.PartyAffil].actual.push(row.BeliefChange);
      partyGroups[row.PartyAffil].humanBot.push(row.HumanBotBeliefChange);
    });

    const partyData = Object.keys(partyGroups).map(party => ({
      party,
      actual: partyGroups[party].actual.reduce((a, b) => a + b, 0) / partyGroups[party].actual.length,
      humanBot: partyGroups[party].humanBot.reduce((a, b) => a + b, 0) / partyGroups[party].humanBot.length
    }));

    return {
      avgActualChange,
      avgHumanBotChange,
      educationData,
      partyData
    };
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
      default:
        return <Clock className="h-5 w-5 text-zinc-500" />;
    }
  };

  const getStatusBadge = (status: SimulationStatus) => {
    const styles: Record<SimulationStatus, string> = {
      not_started: 'bg-zinc-100 text-zinc-700',
      running: 'bg-blue-100 text-blue-700',
      stopped: 'bg-orange-100 text-orange-700',
      finished: 'bg-green-100 text-green-700',
      error: 'bg-red-100 text-red-700',
    };

    const labels: Record<SimulationStatus, string> = {
      not_started: 'Not Started',
      running: 'Running',
      stopped: 'Stopped',
      finished: 'Finished',
      error: 'Error',
    };

    return (
      <span className={`px-2 py-1 rounded-md text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const canRun = (status: SimulationStatus) => {
    return status === 'not_started' || status === 'stopped' || status === 'error';
  };

  const canEdit = (status: SimulationStatus) => {
    return status === 'not_started' || status === 'error';
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

  const analytics = calculateAnalytics();

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">My Simulations</h1>
                <p className="text-sm text-zinc-600 mt-1">Run and manage your experiment simulations</p>
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
                        <>
                          <button
                            onClick={() => handleDownloadResults(simulation)}
                            className="px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download Results
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSimulation(simulation);
                              setShowDataModal(true);
                            }}
                            className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
                          >
                            <Table className="h-4 w-4" />
                            View Data
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSimulation(simulation);
                              setShowAnalysisModal(true);
                            }}
                            className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
                          >
                            <BarChart3 className="h-4 w-4" />
                            Result Analysis
                          </button>
                        </>
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
                        className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
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
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-zinc-200">
                <h2 className="text-xl font-semibold text-zinc-900">Simulation Details</h2>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div>
                  <p className="text-sm font-medium text-zinc-700 mb-1">Name</p>
                  <p className="text-zinc-900">{selectedSimulation.name}</p>
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

        {/* Data View Modal */}
        {showDataModal && selectedSimulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Simulation Results Data</h2>
                <button
                  onClick={() => {
                    setShowDataModal(false);
                    setSelectedSimulation(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-auto flex-1">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Subject</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Conspiracy</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">PreBelief</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">PostBelief</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Change</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">HBotPost</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">HBotChange</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Education</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-zinc-700 uppercase tracking-wider">Party</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-zinc-200">
                      {mockResultsData.map((row) => (
                        <tr key={row.Subject} className="hover:bg-zinc-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.Subject}</td>
                          <td className="px-3 py-2 text-sm text-zinc-900 max-w-xs truncate" title={row.Conspiracy}>{row.Conspiracy}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.PreBelief}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.PostBelief}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.BeliefChange}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.HumanBotPostBelief}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.HumanBotBeliefChange}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.Education}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-zinc-900">{row.PartyAffil}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Modal */}
        {showAnalysisModal && selectedSimulation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Result Analysis</h2>
                <button
                  onClick={() => {
                    setShowAnalysisModal(false);
                    setSelectedSimulation(null);
                  }}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">
                {/* Average Belief Change Comparison */}
                <BarChart
                  title="Average Belief Change: Actual Human vs Human Bot"
                  data={[
                    { label: 'Actual Human', value: analytics.avgActualChange, color: '#3b82f6' },
                    { label: 'Human Bot', value: analytics.avgHumanBotChange, color: '#10b981' }
                  ]}
                />

                {/* By Education Level */}
                <BarChart
                  title="Belief Change by Education Level"
                  data={analytics.educationData.flatMap(e => [
                    {
                      label: `${e.education} (Actual)`,
                      value: e.actual,
                      color: '#3b82f6'
                    },
                    {
                      label: `${e.education} (HumanBot)`,
                      value: e.humanBot,
                      color: '#10b981'
                    }
                  ])}
                />

                {/* By Political Affiliation */}
                <BarChart
                  title="Belief Change by Political Affiliation"
                  data={analytics.partyData.flatMap(p => [
                    {
                      label: `${p.party} (Actual)`,
                      value: p.actual,
                      color: '#3b82f6'
                    },
                    {
                      label: `${p.party} (HumanBot)`,
                      value: p.humanBot,
                      color: '#10b981'
                    }
                  ])}
                />
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

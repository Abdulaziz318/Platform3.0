
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Experiment } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Download, XCircle } from 'lucide-react';

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
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading experiment...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!experiment) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center bg-white rounded-lg p-12">
            <h1 className="text-2xl font-bold mb-4">Experiment Not Found</h1>
            <button
              onClick={() => router.push('/experiments')}
              className="text-blue-600 hover:underline"
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/experiments')}
          className="flex items-center text-blue-600 hover:text-blue-500 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Experiments
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{experiment.name}</h1>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-2xl font-semibold capitalize">{experiment.status}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Subjects</p>
              <p className="text-2xl font-semibold">{experiment.num_subjects}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Model</p>
              <p className="text-2xl font-semibold">{experiment.model_choice}</p>
            </div>
          </div>

          {/* Progress Section */}
          {experiment.status === 'running' && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                Running Simulation
              </h2>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="font-semibold">{experiment.progress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${experiment.progress}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Turn {experiment.current_turn} • Processing subjects...
                </p>
              </div>
            </div>
          )}

          {/* Error Section */}
          {experiment.error_message && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Error
              </h3>
              <p className="text-red-700">{experiment.error_message}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-600 mt-1.5 mr-4"></div>
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-sm text-gray-600">
                    {new Date(experiment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {experiment.started_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-600 mt-1.5 mr-4"></div>
                  <div>
                    <p className="font-medium">Started</p>
                    <p className="text-sm text-gray-600">
                      {new Date(experiment.started_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              
              {experiment.completed_at && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-600 mt-1.5 mr-4"></div>
                  <div>
                    <p className="font-medium">Completed</p>
                    <p className="text-sm text-gray-600">
                      {new Date(experiment.completed_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {experiment.status === 'running' && (
              <button
                onClick={async () => {
                  if (confirm('Cancel this experiment? This cannot be undone.')) {
                    await api.cancelExperiment(experiment.id);
                    loadExperiment();
                  }
                }}
                className="flex items-center px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Experiment
              </button>
            )}

            {experiment.results_available && (
              <button
                onClick={() => api.downloadResults(experiment.id)}
                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
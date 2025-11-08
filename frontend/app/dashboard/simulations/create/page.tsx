'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Experiment, Dataset, LLMProvider, CreateSimulationRequest, EndpointType, LLMParameters } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { ArrowLeft, Check, ChevronRight, AlertCircle } from 'lucide-react';

type Step = 'name' | 'experiment' | 'dataset' | 'provider' | 'parameters';

function CreateSimulationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [currentStep, setCurrentStep] = useState<Step>('name');
  const [editMode, setEditMode] = useState(false);
  
  // Form data
  const [simulationName, setSimulationName] = useState('');
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [endpointType, setEndpointType] = useState<EndpointType>('responses');
  const [llmParameters, setLLMParameters] = useState<LLMParameters>({});

  // Data
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [datasetCompatible, setDatasetCompatible] = useState<boolean | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (editId) {
      loadSimulationForEdit(parseInt(editId));
    }
  }, [editId]);

  const loadData = async () => {
    try {
      const [expsData, datasetsData, providersData] = await Promise.all([
        api.listExperiments(),
        api.listDatasets(),
        api.listLLMProviders(),
      ]);
      setExperiments(expsData);
      setDatasets(datasetsData);
      setProviders(providersData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSimulationForEdit = async (id: number) => {
    try {
      const simulation = await api.getSimulation(id);
      setEditMode(true);
      setSimulationName(simulation.name);
      
      const experiment = experiments.find(e => e.id === simulation.experiment_id);
      const dataset = datasets.find(d => d.id === simulation.dataset_id);
      const provider = providers.find(p => p.id === simulation.provider_id);

      if (experiment) setSelectedExperiment(experiment);
      if (dataset) setSelectedDataset(dataset);
      if (provider) setSelectedProvider(provider);
      setSelectedModel(simulation.model);
      setEndpointType(simulation.endpoint_type);
      setLLMParameters(simulation.llm_parameters);
    } catch (err) {
      console.error('Failed to load simulation:', err);
      alert('Failed to load simulation');
      router.push('/dashboard/simulations');
    }
  };

  const validateDatasetCompatibility = (experiment: Experiment, dataset: Dataset): boolean => {
    // Extract variables from experiment config conversation blocks
    const config = experiment.config;
    const variablesInExperiment: Set<string> = new Set();

    if (experiment.experiment_type === 'llm-llm') {
      const llmConfig = config as any;
      const blocks = llmConfig.conversation_setup?.blocks || [];
      blocks.forEach((block: any) => {
        if (block.content) {
          const matches = block.content.match(/\{([^}]+)\}/g);
          if (matches) {
            matches.forEach((match: string) => {
              variablesInExperiment.add(match.slice(1, -1));
            });
          }
        }
      });
    } else {
      const humanConfig = config as any;
      const blocks = humanConfig.conversation_setup?.blocks || [];
      blocks.forEach((block: any) => {
        if (block.content) {
          const matches = block.content.match(/\{([^}]+)\}/g);
          if (matches) {
            matches.forEach((match: string) => {
              variablesInExperiment.add(match.slice(1, -1));
            });
          }
        }
        if (block.templateMessage) {
          const matches = block.templateMessage.match(/\{([^}]+)\}/g);
          if (matches) {
            matches.forEach((match: string) => {
              variablesInExperiment.add(match.slice(1, -1));
            });
          }
        }
      });
    }

    // Check if all variables exist in dataset columns
    const datasetColumns = new Set(dataset.column_names);
    for (const variable of variablesInExperiment) {
      if (!datasetColumns.has(variable)) {
        return false;
      }
    }

    return true;
  };

  const handleExperimentSelect = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    setSelectedDataset(null);
    setDatasetCompatible(null);
    setCurrentStep('dataset');
  };

  const handleDatasetSelect = (dataset: Dataset) => {
    if (!selectedExperiment) return;

    const isCompatible = validateDatasetCompatibility(selectedExperiment, dataset);
    setDatasetCompatible(isCompatible);

    if (isCompatible) {
      setSelectedDataset(dataset);
      setCurrentStep('provider');
    }
  };

  const handleProviderSelect = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setSelectedModel('');
  };

  const handleCreateSimulation = async () => {
    if (!simulationName || !selectedExperiment || !selectedDataset || !selectedProvider || !selectedModel) {
      alert('Please complete all required steps');
      return;
    }

    setSaving(true);
    try {
      const request: CreateSimulationRequest = {
        name: simulationName,
        experiment_id: selectedExperiment.id,
        dataset_id: selectedDataset.id,
        provider_id: selectedProvider.id,
        model: selectedModel,
        endpoint_type: endpointType,
        llm_parameters: llmParameters,
        num_rows: selectedDataset.row_count, // Default to all rows, can be changed when running
      };

      if (editMode && editId) {
        await api.updateSimulation(parseInt(editId), request);
        alert('Simulation updated successfully!');
      } else {
        await api.createSimulation(request);
        alert('Simulation created successfully!');
      }

      router.push('/dashboard/simulations');
    } catch (err: any) {
      alert(err.message || 'Failed to create simulation');
    } finally {
      setSaving(false);
    }
  };

  const isStepComplete = (step: Step): boolean => {
    switch (step) {
      case 'name':
        return simulationName.trim().length > 0;
      case 'experiment':
        return selectedExperiment !== null;
      case 'dataset':
        return selectedDataset !== null && datasetCompatible === true;
      case 'provider':
        return selectedProvider !== null && selectedModel.length > 0;
      case 'parameters':
        return true; // Optional step
      default:
        return false;
    }
  };

  const steps: { id: Step; label: string; description: string }[] = [
    { id: 'name', label: 'Simulation Name', description: 'Enter a name for this simulation' },
    { id: 'experiment', label: 'Select Experiment', description: 'Choose an experiment profile' },
    { id: 'dataset', label: 'Select Dataset', description: 'Choose a compatible dataset' },
    { id: 'provider', label: 'LLM Configuration', description: 'Configure provider and model' },
    { id: 'parameters', label: 'Advanced Parameters', description: 'Optional LLM parameters' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.push('/dashboard/simulations')}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {editMode ? 'Edit Simulation' : 'Create New Simulation'}
            </h1>
            <p className="text-sm text-zinc-600 mt-1">
              {editMode ? 'Update simulation configuration' : 'Set up a new simulation run'}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      isStepComplete(step.id)
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-zinc-900 text-white'
                        : 'bg-zinc-200 text-zinc-500'
                    }`}
                  >
                    {isStepComplete(step.id) ? <Check className="h-5 w-5" /> : index + 1}
                  </div>
                  <p
                    className={`text-xs mt-2 font-medium text-center ${
                      currentStep === step.id ? 'text-zinc-900' : 'text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 -mx-2 ${isStepComplete(step.id) ? 'bg-green-500' : 'bg-zinc-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6 min-h-96">
          {currentStep === 'name' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Simulation Name</h2>
              <p className="text-sm text-zinc-600 mb-4">
                Give your simulation a descriptive name to identify it later.
              </p>
              <input
                type="text"
                value={simulationName}
                onChange={(e) => setSimulationName(e.target.value)}
                placeholder="e.g., Test Run - Conspiracy Debate"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
              />
            </div>
          )}

          {currentStep === 'experiment' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Select Experiment Profile</h2>
              <p className="text-sm text-zinc-600 mb-4">
                Choose the experiment configuration to use for this simulation.
              </p>
              <div className="space-y-3">
                {experiments.map((exp) => (
                  <div
                    key={exp.id}
                    onClick={() => handleExperimentSelect(exp)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedExperiment?.id === exp.id
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900">{exp.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                            {exp.experiment_type === 'llm-llm' ? 'LLM-LLM' : 'Human-LLM'}
                          </span>
                          {exp.dataset_name && (
                            <span className="text-xs text-zinc-500">Dataset: {exp.dataset_name}</span>
                          )}
                        </div>
                      </div>
                      {selectedExperiment?.id === exp.id && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
                {experiments.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    <p>No experiments available</p>
                    <button
                      onClick={() => router.push('/dashboard/experiments/create')}
                      className="mt-4 text-sm text-zinc-900 underline"
                    >
                      Create an experiment first
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'dataset' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Select Dataset</h2>
              <p className="text-sm text-zinc-600 mb-4">
                Choose a dataset that is compatible with the selected experiment.
              </p>
              {datasetCompatible === false && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Incompatible Dataset</p>
                    <p className="text-sm text-red-700 mt-1">
                      This dataset doesn't contain all the variables required by the experiment. Please select a different dataset.
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {datasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    onClick={() => handleDatasetSelect(dataset)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDataset?.id === dataset.id
                        ? 'border-zinc-900 bg-zinc-50'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900">{dataset.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-500">{dataset.row_count} rows</span>
                          <span className="text-xs text-zinc-500">
                            {dataset.column_names.length} columns
                          </span>
                        </div>
                      </div>
                      {selectedDataset?.id === dataset.id && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'provider' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">LLM Configuration</h2>
              <p className="text-sm text-zinc-600 mb-6">
                Configure the LLM provider and model for this simulation.
              </p>

              <div className="space-y-6">
                {/* Provider Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Provider
                  </label>
                  <div className="space-y-2">
                    {providers.map((provider) => (
                      <div
                        key={provider.id}
                        onClick={() => handleProviderSelect(provider)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedProvider?.id === provider.id
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-zinc-900">{provider.name}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {provider.sdk.toUpperCase()} • {provider.models.length} models
                            </p>
                          </div>
                          {selectedProvider?.id === provider.id && (
                            <Check className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Model Selection */}
                {selectedProvider && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    >
                      <option value="">Select a model</option>
                      {selectedProvider.models.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Endpoint Type */}
                {selectedProvider && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Endpoint Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setEndpointType('responses')}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          endpointType === 'responses'
                            ? 'border-zinc-900 bg-zinc-50'
                            : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        <p className="font-medium text-zinc-900">Responses</p>
                        <p className="text-xs text-zinc-500 mt-1">Standard API endpoint</p>
                      </button>
                      <button
                        onClick={() => setEndpointType('batching')}
                        disabled={!selectedProvider.supports_batching}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          endpointType === 'batching'
                            ? 'border-zinc-900 bg-zinc-50'
                            : selectedProvider.supports_batching
                            ? 'border-zinc-200 hover:border-zinc-400'
                            : 'border-zinc-200 bg-zinc-50 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <p className="font-medium text-zinc-900">Batching</p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {selectedProvider.supports_batching ? 'Batch API endpoint' : 'Not supported'}
                        </p>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 'parameters' && (
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Advanced Parameters</h2>
              <p className="text-sm text-zinc-600 mb-6">
                Optionally configure advanced LLM parameters. Leave blank to use defaults.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={llmParameters.temperature ?? ''}
                      onChange={(e) =>
                        setLLMParameters({
                          ...llmParameters,
                          temperature: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="0.7"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Controls randomness (0-2)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Top P
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={llmParameters.top_p ?? ''}
                      onChange={(e) =>
                        setLLMParameters({
                          ...llmParameters,
                          top_p: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="1.0"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Nucleus sampling (0-1)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={llmParameters.max_tokens ?? ''}
                      onChange={(e) =>
                        setLLMParameters({
                          ...llmParameters,
                          max_tokens: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="1000"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Maximum response length</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Frequency Penalty
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={llmParameters.frequency_penalty ?? ''}
                      onChange={(e) =>
                        setLLMParameters({
                          ...llmParameters,
                          frequency_penalty: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="0.0"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Reduce repetition (-2 to 2)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Presence Penalty
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="-2"
                      max="2"
                      value={llmParameters.presence_penalty ?? ''}
                      onChange={(e) =>
                        setLLMParameters({
                          ...llmParameters,
                          presence_penalty: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="0.0"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Encourage new topics (-2 to 2)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              const prevIndex = currentStepIndex - 1;
              if (prevIndex >= 0) {
                setCurrentStep(steps[prevIndex].id);
              }
            }}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentStep === 'parameters' ? (
            <button
              onClick={handleCreateSimulation}
              disabled={saving || !isStepComplete('name') || !isStepComplete('experiment') || !isStepComplete('dataset') || !isStepComplete('provider')}
              className="px-6 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? 'Saving...' : editMode ? 'Update Simulation' : 'Create Simulation'}
            </button>
          ) : (
            <button
              onClick={() => {
                const nextIndex = currentStepIndex + 1;
                if (nextIndex < steps.length && isStepComplete(currentStep)) {
                  setCurrentStep(steps[nextIndex].id);
                }
              }}
              disabled={!isStepComplete(currentStep)}
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateSimulationPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={<div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900"></div></div>}>
          <CreateSimulationContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

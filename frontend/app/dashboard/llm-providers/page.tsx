'use client';

import React, { useState, useEffect } from 'react';
import { api, LLMProvider, SDKType, ProviderVerificationResponse } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Key, Trash2, Edit2, X, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LLMProvidersPage() {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModelModal, setShowAddModelModal] = useState(false);
  
  // Add Provider form state
  const [providerName, setProviderName] = useState('');
  const [selectedSDK, setSelectedSDK] = useState<SDKType>('openai');
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ProviderVerificationResponse | null>(null);
  const [showNoModelsPrompt, setShowNoModelsPrompt] = useState(false);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editedProvider, setEditedProvider] = useState<Partial<LLMProvider>>({});
  const [showApiKey, setShowApiKey] = useState(false);

  // Add model state
  const [newModelId, setNewModelId] = useState('');
  const [verifyingModel, setVerifyingModel] = useState(false);
  const [modelVerificationError, setModelVerificationError] = useState('');

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const data = await api.listLLMProviders();
      setProviders(data);
    } catch (err) {
      console.error('Failed to load providers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSDKChange = (sdk: SDKType) => {
    setSelectedSDK(sdk);
    if (sdk === 'openai') {
      setApiBaseUrl('https://api.openai.com/v1');
    } else {
      setApiBaseUrl('');
    }
  };

  const handleVerifyAndAdd = async () => {
    if (!providerName.trim() || !apiKey.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (selectedSDK === 'openai' && !apiBaseUrl.trim()) {
      alert('Please provide an API base URL for OpenAI SDK');
      return;
    }

    setVerifying(true);
    setVerificationResult(null);
    setShowNoModelsPrompt(false);

    try {
      const result = await api.verifyProvider({
        sdk: selectedSDK,
        api_base_url: selectedSDK === 'openai' ? apiBaseUrl : undefined,
        api_key: apiKey,
      });

      setVerificationResult(result);

      if (!result.success) {
        // Show error
        setVerifying(false);
        return;
      }

      // Check if models were found
      if (!result.models || result.models.length === 0) {
        setShowNoModelsPrompt(true);
        setVerifying(false);
        return;
      }

      // Success - create provider
      await api.createLLMProvider({
        name: providerName,
        sdk: selectedSDK,
        api_base_url: selectedSDK === 'openai' ? apiBaseUrl : undefined,
        api_key: apiKey,
        models: result.models,
        supports_batching: result.supports_batching,
      });

      // Reload providers
      await loadProviders();

      // Reset and close
      setVerifying(false);
      setShowAddModal(false);
      resetAddForm();
      
      // Show success message
      setTimeout(() => {
        alert('Provider added successfully!');
      }, 100);
    } catch (err: any) {
      setVerifying(false);
      alert(err.message || 'Failed to verify provider');
    }
  };

  const resetAddForm = () => {
    setProviderName('');
    setSelectedSDK('openai');
    setApiBaseUrl('https://api.openai.com/v1');
    setApiKey('');
    setVerificationResult(null);
    setShowNoModelsPrompt(false);
  };

  const handleViewDetails = (provider: LLMProvider) => {
    setSelectedProvider(provider);
    setEditedProvider({});
    setEditMode(false);
    setShowDetailsModal(true);
    setShowApiKey(false);
  };

  const handleStartEdit = () => {
    setEditMode(true);
    setEditedProvider({
      name: selectedProvider?.name,
      sdk: selectedProvider?.sdk,
      api_base_url: selectedProvider?.api_base_url,
      api_key: selectedProvider?.api_key,
    });
  };

  const handleSaveEdit = async () => {
    if (!selectedProvider) return;

    // Check if anything changed
    const hasChanges = 
      editedProvider.name !== selectedProvider.name ||
      editedProvider.sdk !== selectedProvider.sdk ||
      editedProvider.api_base_url !== selectedProvider.api_base_url ||
      editedProvider.api_key !== selectedProvider.api_key;

    if (!hasChanges) {
      setEditMode(false);
      return;
    }

    // Verify changes
    setVerifying(true);
    try {
      const result = await api.verifyProvider({
        sdk: editedProvider.sdk || selectedProvider.sdk,
        api_base_url: editedProvider.api_base_url !== undefined ? editedProvider.api_base_url : selectedProvider.api_base_url,
        api_key: editedProvider.api_key || selectedProvider.api_key,
      });

      if (!result.success) {
        alert(getErrorMessage(result));
        setVerifying(false);
        return;
      }

      // Update provider
      await api.updateLLMProvider(selectedProvider.id, {
        ...editedProvider,
        models: result.models && result.models.length > 0 ? result.models : selectedProvider.models,
        supports_batching: result.supports_batching,
      });

      // Reload
      await loadProviders();
      const updated = providers.find(p => p.id === selectedProvider.id);
      if (updated) {
        setSelectedProvider(updated);
      }
      
      setVerifying(false);
      setEditMode(false);
      alert('Provider updated successfully!');
    } catch (err: any) {
      setVerifying(false);
      alert(err.message || 'Failed to update provider');
    }
  };

  const handleDeleteProvider = async () => {
    if (!selectedProvider) return;

    if (!confirm(`Are you sure you want to delete "${selectedProvider.name}"?`)) {
      return;
    }

    try {
      await api.deleteLLMProvider(selectedProvider.id);
      await loadProviders();
      setShowDetailsModal(false);
      setSelectedProvider(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete provider');
    }
  };

  const handleAddModel = async () => {
    if (!selectedProvider || !newModelId.trim()) return;

    setVerifyingModel(true);
    setModelVerificationError('');

    try {
      const result = await api.verifyModel(selectedProvider.id, newModelId);
      
      if (!result.success) {
        setModelVerificationError(result.error || 'Verification failed');
        setVerifyingModel(false);
        return;
      }

      // Add model
      await api.addModelToProvider(selectedProvider.id, newModelId);
      
      // Reload
      await loadProviders();
      const updated = providers.find(p => p.id === selectedProvider.id);
      if (updated) {
        setSelectedProvider(updated);
      }

      setVerifyingModel(false);
      setShowAddModelModal(false);
      setNewModelId('');
      alert('Model added successfully!');
    } catch (err: any) {
      setVerifyingModel(false);
      setModelVerificationError(err.message || 'Failed to verify model');
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (!selectedProvider) return;

    if (!confirm(`Remove model "${modelId}"?`)) {
      return;
    }

    try {
      await api.removeModelFromProvider(selectedProvider.id, modelId);
      await loadProviders();
      const updated = providers.find(p => p.id === selectedProvider.id);
      if (updated) {
        setSelectedProvider(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove model');
    }
  };

  const getErrorMessage = (result: ProviderVerificationResponse): string => {
    if (result.error === 'invalid_api_key') {
      return 'Invalid API Key. Please check your credentials.';
    }
    if (result.error === 'invalid_base_url') {
      return 'Invalid API Base URL. Please check the endpoint.';
    }
    if (result.error === 'unknown') {
      return `Unknown error occurred${result.error_code ? `: ${result.error_code}` : ''}`;
    }
    return 'Verification failed';
  };

  const getSDKLabel = (sdk: SDKType): string => {
    const labels = {
      openai: 'OpenAI SDK',
      anthropic: 'Anthropic SDK',
      mixtral: 'Mixtral SDK',
    };
    return labels[sdk];
  };

  const getModelsPreview = (models: string[]): string => {
    if (models.length === 0) return 'No models';
    if (models.length <= 2) return models.join(', ');
    return `${models.slice(0, 2).join(', ')}...`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">LLM Providers</h1>
            <p className="text-sm text-zinc-600 mt-1">Manage your API keys and provider configurations</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Provider
          </button>
        </div>

        {/* Providers List */}
        {providers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-zinc-200">
            <Key className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">No LLM Providers</h3>
            <p className="text-sm text-zinc-600 mb-4">Add your first provider to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleViewDetails(provider)}
                className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-400 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-zinc-900">{provider.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">{getSDKLabel(provider.sdk)}</p>
                  </div>
                  <Key className="h-5 w-5 text-zinc-400" />
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-zinc-600">Models: </span>
                    <span className="text-zinc-900">{getModelsPreview(provider.models)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      provider.supports_batching 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {provider.supports_batching ? 'Batching Supported' : 'No Batching'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Provider Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-zinc-900">Add LLM Provider</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="text-zinc-500 hover:text-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Provider Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Provider Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="e.g., OpenAI Main"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>

                {/* SDK Selection */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    SDK <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSDK}
                    onChange={(e) => handleSDKChange(e.target.value as SDKType)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  >
                    <option value="openai">OpenAI SDK</option>
                    <option value="anthropic">Anthropic SDK</option>
                    <option value="mixtral">Mixtral SDK</option>
                  </select>
                </div>

                {/* API Base URL (OpenAI only) */}
                {selectedSDK === 'openai' && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      API Base URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={apiBaseUrl}
                      onChange={(e) => setApiBaseUrl(e.target.value)}
                      placeholder="https://api.openai.com/v1"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      The root URL your provider gives you for OpenAI-compatible requests
                    </p>
                  </div>
                )}

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>

                {/* Verification Result */}
                {verificationResult && !verificationResult.success && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Verification Failed</p>
                      <p className="text-sm text-red-700 mt-1">{getErrorMessage(verificationResult)}</p>
                    </div>
                  </div>
                )}

                {/* No Models Prompt */}
                {showNoModelsPrompt && (
                  <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">No Models Found</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        We were unable to get the list of supported models. Please enter model IDs manually in the provider profile.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-200 flex gap-3 justify-end sticky bottom-0 bg-white">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  disabled={verifying}
                  className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyAndAdd}
                  disabled={verifying}
                  className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Provider Details Modal */}
        {showDetailsModal && selectedProvider && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-lg font-semibold text-zinc-900">Provider Details</h2>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setEditMode(false);
                  }}
                  className="text-zinc-500 hover:text-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Provider Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Provider Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedProvider.name || selectedProvider.name}
                      onChange={(e) => setEditedProvider({ ...editedProvider, name: e.target.value })}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    />
                  ) : (
                    <p className="text-zinc-900">{selectedProvider.name}</p>
                  )}
                </div>

                {/* SDK */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">SDK</label>
                  {editMode ? (
                    <select
                      value={editedProvider.sdk || selectedProvider.sdk}
                      onChange={(e) => {
                        const newSDK = e.target.value as SDKType;
                        setEditedProvider({ 
                          ...editedProvider, 
                          sdk: newSDK,
                          api_base_url: newSDK === 'openai' ? (editedProvider.api_base_url || selectedProvider.api_base_url || 'https://api.openai.com/v1') : undefined
                        });
                      }}
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    >
                      <option value="openai">OpenAI SDK</option>
                      <option value="anthropic">Anthropic SDK</option>
                      <option value="mixtral">Mixtral SDK</option>
                    </select>
                  ) : (
                    <p className="text-zinc-900">{getSDKLabel(selectedProvider.sdk)}</p>
                  )}
                </div>

                {/* API Base URL */}
                {(editMode ? (editedProvider.sdk || selectedProvider.sdk) === 'openai' : selectedProvider.sdk === 'openai') && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">API Base URL</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedProvider.api_base_url !== undefined ? editedProvider.api_base_url : selectedProvider.api_base_url}
                        onChange={(e) => setEditedProvider({ ...editedProvider, api_base_url: e.target.value })}
                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                      />
                    ) : (
                      <p className="text-zinc-900">{selectedProvider.api_base_url}</p>
                    )}
                  </div>
                )}

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">API Key</label>
                  {editMode ? (
                    <input
                      type="password"
                      value={editedProvider.api_key || ''}
                      onChange={(e) => setEditedProvider({ ...editedProvider, api_key: e.target.value })}
                      placeholder="Enter new API key to update"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-zinc-900 font-mono text-sm flex-1">
                        {showApiKey ? selectedProvider.api_key : '••••••••••••••••••••••••••'}
                      </p>
                      <button
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-2 hover:bg-zinc-100 rounded transition-colors"
                      >
                        {showApiKey ? (
                          <EyeOff className="h-4 w-4 text-zinc-600" />
                        ) : (
                          <Eye className="h-4 w-4 text-zinc-600" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Models */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-zinc-700">Supported Models</label>
                    {!editMode && (
                      <button
                        onClick={() => setShowAddModelModal(true)}
                        className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add Model
                      </button>
                    )}
                  </div>
                  {selectedProvider.models.length === 0 ? (
                    <p className="text-sm text-zinc-500 italic">No models configured</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedProvider.models.map((model) => (
                        <div
                          key={model}
                          className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded border border-zinc-200"
                        >
                          <span className="text-sm text-zinc-900 font-mono">{model}</span>
                          {!editMode && (
                            <button
                              onClick={() => handleDeleteModel(model)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Batching Support */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Batching Support</label>
                  <span className={`inline-block px-3 py-1 rounded text-sm ${
                    selectedProvider.supports_batching 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-zinc-100 text-zinc-600'
                  }`}>
                    {selectedProvider.supports_batching ? 'Supported' : 'Not Supported'}
                  </span>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-200 flex items-center justify-between sticky bottom-0 bg-white">
                <button
                  onClick={handleDeleteProvider}
                  disabled={verifying}
                  className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete Provider
                </button>
                <div className="flex gap-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => {
                          setEditMode(false);
                          setEditedProvider({});
                        }}
                        disabled={verifying}
                        className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={verifying}
                        className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                      >
                        {verifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Save'
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleStartEdit}
                      className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Model Modal */}
        {showAddModelModal && selectedProvider && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">Add Model</h2>
                <button
                  onClick={() => {
                    setShowAddModelModal(false);
                    setNewModelId('');
                    setModelVerificationError('');
                  }}
                  className="text-zinc-500 hover:text-zinc-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Model ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newModelId}
                    onChange={(e) => {
                      setNewModelId(e.target.value);
                      setModelVerificationError('');
                    }}
                    placeholder="e.g., gpt-4o"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    autoFocus
                  />
                </div>

                {modelVerificationError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Verification Failed</p>
                      <p className="text-sm text-red-700 mt-1">{modelVerificationError}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-200 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModelModal(false);
                    setNewModelId('');
                    setModelVerificationError('');
                  }}
                  disabled={verifyingModel}
                  className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddModel}
                  disabled={verifyingModel || !newModelId.trim()}
                  className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {verifyingModel ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Add'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </DashboardLayout>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { api, SavedPersona } from '@/lib/api';
import { Plus, Edit2, Trash2, X, User } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<SavedPersona[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPersona, setEditingPersona] = useState<SavedPersona | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    systemMessage: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      const data = await api.listSavedPersonas();
      setPersonas(data);
    } catch (err) {
      console.error('Failed to load personas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (persona?: SavedPersona) => {
    if (persona) {
      setEditingPersona(persona);
      setFormData({
        name: persona.name,
        systemMessage: persona.system_message,
      });
    } else {
      setEditingPersona(null);
      setFormData({ name: '', systemMessage: '' });
    }
    setShowModal(true);
    setError('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPersona(null);
    setFormData({ name: '', systemMessage: '' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter a persona name');
      return;
    }

    if (!formData.systemMessage.trim()) {
      setError('Please enter a system message');
      return;
    }

    try {
      if (editingPersona) {
        await api.updateSavedPersona(editingPersona.id, formData.name, formData.systemMessage);
      } else {
        await api.createSavedPersona(formData.name, formData.systemMessage);
      }
      await loadPersonas();
      handleCloseModal();
    } catch (err: any) {
      setError(err.message || 'Failed to save persona');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    
    try {
      await api.deleteSavedPersona(id);
      await loadPersonas();
    } catch (err) {
      console.error('Failed to delete persona:', err);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Instruction Prompts</h1>
            <p className="text-sm text-zinc-600 mt-1">
              Create and manage reusable instruction prompt templates for your experiments
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Instruction Prompt
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-600">Loading instruction prompts...</p>
          </div>
        ) : personas.length === 0 ? (
          <div className="text-center py-12 bg-white border border-zinc-200 rounded-xl">
            <User className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <p className="text-zinc-600 mb-4">No saved instruction prompts yet</p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Instruction Prompt
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {personas.map((persona) => (
              <div
                key={persona.id}
                className="bg-white border border-zinc-200 rounded-lg p-5 hover:border-zinc-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-2">{persona.name}</h3>
                    <p className="text-sm text-zinc-600 mb-3 line-clamp-2">
                      {persona.system_message}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Updated {new Date(persona.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(persona)}
                      className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                      title="Edit persona"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(persona.id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete persona"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-200">
                <h2 className="text-lg font-semibold text-zinc-900">
                  {editingPersona ? 'Edit Instruction Prompt' : 'Create New Instruction Prompt'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="px-6 py-4 space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Persona Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Instruction Prompt Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                      placeholder="e.g., Persuader Bot Instruction Prompt"
                    />
                  </div>

                  {/* System Message */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                      Instruction Prompt
                    </label>
                    <textarea
                      value={formData.systemMessage}
                      onChange={(e) => setFormData({ ...formData, systemMessage: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
                      placeholder="Enter the instruction prompt that defines the behavior..."
                      rows={12}
                    />
                    <p className="mt-1 text-xs text-zinc-500">
                      This instruction will be used to initialize the LLM's behavior.
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    {editingPersona ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

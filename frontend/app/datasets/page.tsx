'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Dataset } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Database, Trash2, Calendar, Rows } from 'lucide-react';

export default function DatasetsPage() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const data = await api.listDatasets();
      setDatasets(data);
    } catch (err) {
      console.error('Failed to load datasets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this dataset? This cannot be undone.')) return;
    try {
      await api.deleteDataset(id);
      loadDatasets();
    } catch (err: any) {
      alert('Failed: ' + err.message);
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
        <DashboardLayout>
          <div className="flex items-center justify-center h-full min-h-[calc(100vh-3.5rem)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
              <p className="mt-4 text-sm text-zinc-600 font-medium">Loading datasets...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-zinc-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">Datasets</h1>
              <p className="text-sm text-zinc-600">
                {datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'} total
              </p>
            </div>
            <button
              onClick={() => router.push('/datasets/new')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload Dataset
            </button>
          </div>

          {datasets.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-zinc-200">
              <Database className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-lg text-zinc-900 font-medium mb-2">No datasets found</p>
              <p className="text-sm text-zinc-600 mb-4">Upload your first dataset to get started</p>
              <button 
                onClick={() => router.push('/datasets/new')} 
                className="text-zinc-900 hover:text-zinc-700 text-sm font-medium"
              >
                Upload Dataset →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div 
                  key={dataset.id} 
                  className="bg-white rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors p-5 cursor-pointer"
                  onClick={() => router.push(`/datasets/${dataset.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Database className="h-5 w-5 text-zinc-900" />
                        <h3 className="text-base font-semibold text-zinc-900">{dataset.name}</h3>
                      </div>
                      <div className="flex gap-4 text-sm text-zinc-600">
                        <div className="flex items-center gap-1.5">
                          <Rows className="h-4 w-4" />
                          <span>{dataset.row_count} rows</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Database className="h-4 w-4" />
                          <span>{dataset.column_names.length} columns</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(dataset.created_at)}</span>
                        </div>
                      </div>
                      {dataset.selected_variables.length > 0 && (
                        <div className="mt-3 flex gap-2 flex-wrap">
                          <span className="text-xs text-zinc-600">Variables:</span>
                          {dataset.selected_variables.map((variable) => (
                            <span 
                              key={variable}
                              className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-xs font-medium text-zinc-700"
                            >
                              {variable}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dataset.id);
                      }}
                      className="ml-4 p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

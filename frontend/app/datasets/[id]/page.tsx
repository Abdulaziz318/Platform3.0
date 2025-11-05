'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Dataset } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Columns, Save, Check } from 'lucide-react';

export default function DatasetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = parseInt(params.id as string);
  
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVariables, setSelectedVariables] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    loadDataset();
  }, [datasetId]);

  const loadDataset = async () => {
    try {
      const data = await api.getDataset(datasetId);
      setDataset(data);
      setSelectedVariables(data.selected_variables || []);
      setVisibleColumns(data.column_names);
      setName(data.name);
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVariable = (column: string) => {
    setSelectedVariables(prev => 
      prev.includes(column) 
        ? prev.filter(v => v !== column)
        : [...prev, column]
    );
  };

  const toggleColumn = (column: string) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column]
    );
  };

  const handleSave = async () => {
    if (!dataset) return;
    
    setSaving(true);
    try {
      await api.updateDataset(dataset.id, {
        name,
        selected_variables: selectedVariables,
      });
      router.push('/datasets');
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-600">Loading dataset...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dataset) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center bg-white rounded-xl border border-zinc-200 p-12">
            <h1 className="text-xl font-bold mb-4 text-zinc-900">Dataset Not Found</h1>
            <button
              onClick={() => router.push('/datasets')}
              className="text-zinc-600 hover:text-zinc-900 text-sm"
            >
              ← Back to Datasets
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const displayedData = dataset.data.slice(0, 10);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/datasets')}
            className="flex items-center text-zinc-600 hover:text-zinc-900 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </button>

          {/* Header */}
          <div className="mb-6">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-2xl font-bold text-zinc-900 mb-2 border-none outline-none focus:ring-0 p-0 w-full bg-transparent"
            />
            <p className="text-sm text-zinc-600">
              {dataset.row_count} rows • {dataset.column_names.length} columns
            </p>
          </div>

          <div className="flex gap-6">
            {/* Left Sidebar - Variables Selection */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-zinc-200 p-4 sticky top-8">
                <h3 className="text-sm font-semibold text-zinc-900 mb-3">Variables</h3>
                <div className="space-y-2">
                  {dataset.column_names.map((column) => (
                    <button
                      key={column}
                      onClick={() => toggleVariable(column)}
                      className={`w-full px-3 py-1.5 text-left text-sm rounded-lg transition-colors flex items-center justify-between ${
                        selectedVariables.includes(column)
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-50 text-zinc-700 hover:bg-zinc-100 border border-zinc-200'
                      }`}
                    >
                      <span className="truncate">{column}</span>
                      {selectedVariables.includes(column) && (
                        <Check className="h-3 w-3 ml-2 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <p className="text-xs text-zinc-500 mb-2">
                    {selectedVariables.length} variable{selectedVariables.length !== 1 ? 's' : ''} selected
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content - Data Preview */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                {/* Toolbar */}
                <div className="border-b border-zinc-200 p-4 flex justify-between items-center bg-zinc-50">
                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">Data Preview</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">Showing first 10 rows</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowColumnSelector(!showColumnSelector)}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 transition-colors"
                    >
                      <Columns className="h-4 w-4 mr-2" />
                      Columns
                    </button>
                    
                    {/* Column Selector Dropdown */}
                    {showColumnSelector && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg border border-zinc-200 shadow-lg z-10 p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs font-semibold text-zinc-900">Show/Hide Columns</h4>
                          <button
                            onClick={() => setShowColumnSelector(false)}
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="space-y-1.5 max-h-64 overflow-y-auto">
                          {dataset.column_names.map((column) => (
                            <label
                              key={column}
                              className="flex items-center gap-2 text-sm text-zinc-700 hover:bg-zinc-50 p-1.5 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns.includes(column)}
                                onChange={() => toggleColumn(column)}
                                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                              />
                              <span className="truncate">{column}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        {visibleColumns.map((column) => (
                          <th
                            key={column}
                            className="px-4 py-3 text-left text-xs font-semibold text-zinc-700 whitespace-nowrap"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {displayedData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50">
                          {visibleColumns.map((column) => (
                            <td
                              key={column}
                              className="px-4 py-3 text-zinc-900 max-w-xs truncate"
                              title={String(row[column])}
                            >
                              {row[column] !== undefined && row[column] !== null ? String(row[column]) : '-'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                {dataset.row_count > 10 && (
                  <div className="border-t border-zinc-200 px-4 py-3 bg-zinc-50">
                    <p className="text-xs text-zinc-500">
                      Showing 10 of {dataset.row_count} rows
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

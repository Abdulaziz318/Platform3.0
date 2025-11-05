'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Upload, ArrowLeft } from 'lucide-react';

export default function NewDatasetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!csvFile) {
      setError('Please upload a CSV file');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a dataset name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.createDataset(name, csvFile);
      router.push(`/datasets/${result.dataset_id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/datasets')}
            className="flex items-center text-zinc-600 hover:text-zinc-900 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Upload Dataset</h1>
            <p className="text-sm text-zinc-600">
              Upload a CSV file to create a new dataset
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dataset Name */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Dataset Name</h2>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                placeholder="e.g., Customer Feedback 2024"
                required
              />
            </div>

            {/* CSV Upload */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Upload CSV File</h2>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-200 border-dashed rounded-lg hover:border-zinc-300 transition-colors bg-zinc-50">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-10 w-10 text-zinc-400" />
                  <div className="flex text-sm text-zinc-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md font-medium text-zinc-900 hover:text-zinc-700 focus-within:outline-none"
                    >
                      <span>Upload a CSV file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="sr-only"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-zinc-500">CSV files only</p>
                </div>
              </div>
              
              {csvFile && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 flex items-center">
                    <span className="mr-2">✓</span>
                    <strong>{csvFile.name}</strong> ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2 text-sm">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-zinc-900 text-white py-3 rounded-lg font-medium hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors text-sm"
              >
                {loading ? '⏳ Uploading...' : 'Upload Dataset'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/datasets')}
                className="px-6 py-3 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors font-medium text-zinc-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}

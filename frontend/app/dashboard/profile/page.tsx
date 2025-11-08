'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/DashboardLayout';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-3.5rem)]">
          <div className="text-center">
            <p className="text-2xl font-semibold text-zinc-400">In progress...</p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

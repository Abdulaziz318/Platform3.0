'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FlaskConical, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
  }, [pathname]);

  const handleLogout = () => {
    api.logout();
    router.push('/');
    setIsAuthenticated(false);
  };

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer gap-2"
            onClick={() => router.push('/')}
          >
            <div className="bg-zinc-900 p-1.5 rounded-lg">
              <FlaskConical className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-zinc-900">
              LLM Experiment Platform
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push('/experiments')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith('/experiments')
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  My Experiments
                </button>
                <button
                  onClick={() => router.push('/setup')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/setup'
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  New Experiment
                </button>
                <div className="h-4 w-px bg-zinc-200 mx-1"></div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

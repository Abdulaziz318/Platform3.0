'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FlaskConical, LogOut, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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
                  onClick={() => router.push('/dashboard/experiments')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname?.startsWith('/dashboard')
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => window.open('https://docs.example.com', '_blank')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                >
                  Docs
                </button>
                <div className="h-4 w-px bg-zinc-200 mx-1"></div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Logout
                </button>
                
                {/* Profile Icon */}
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <ChevronDown className={`h-3.5 w-3.5 text-zinc-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {profileOpen && (
                    <>
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-zinc-200 shadow-lg z-50 py-2">
                        <div className="px-4 py-2 border-b border-zinc-100">
                          <p className="text-sm font-medium text-zinc-900">Account</p>
                          <p className="text-xs text-zinc-500 mt-0.5">Manage your account</p>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            router.push('/dashboard/profile');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <User className="h-4 w-4" />
                          Profile Settings
                        </button>
                      </div>
                      {/* Overlay */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setProfileOpen(false)}
                      />
                    </>
                  )}
                </div>
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

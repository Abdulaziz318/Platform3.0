'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { 
  Menu, 
  X,
  PlayCircle, 
  Plus, 
  Zap,
  FlaskConical,
  Database,
  FileText,
  BarChart3,
  Key,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    api.logout();
    router.push('/');
  };

  const isActive = (path: string) => pathname === path;

  const navigationSections = [
    {
      title: 'Simulations',
      items: [
        { name: 'My Simulations', path: '/dashboard/simulations', icon: PlayCircle },
        { name: 'Create Simulation', path: '/dashboard/simulations/create', icon: Plus },
      ]
    },
    {
      title: 'Experiment Setup',
      items: [
        { name: 'My Experiments', path: '/dashboard/experiments', icon: FlaskConical },
        { name: 'Create Experiment', path: '/dashboard/experiments/create', icon: Plus },
        { name: 'Datasets', path: '/dashboard/datasets', icon: Database },
        { name: 'Personas', path: '/dashboard/personas', icon: FileText },
      ]
    },
    {
      title: 'Manage',
      items: [
        { name: 'Usage', path: '/dashboard/usage', icon: BarChart3 },
        { name: 'LLM Providers', path: '/dashboard/llm-providers', icon: Key },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-zinc-200 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Sidebar Header with Collapse Button */}
        <div className="h-14 border-b border-zinc-200 flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-zinc-900 p-1.5 rounded-lg">
                <FlaskConical className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-zinc-900">Platform</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {sidebarCollapsed ? <Menu className="h-4 w-4 text-zinc-600" /> : <X className="h-4 w-4 text-zinc-600" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationSections.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
              {!sidebarCollapsed && (
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              <div className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => router.push(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-zinc-100 text-zinc-900'
                          : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!sidebarCollapsed && <span className="truncate">{item.name}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/dashboard/simulations')}
              className={`text-sm font-medium transition-colors ${
                pathname?.startsWith('/dashboard')
                  ? 'text-zinc-900'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => window.open('https://docs.example.com', '_blank')}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Docs
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <div className="w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <ChevronDown className={`h-4 w-4 text-zinc-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
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
                <div className="border-t border-zinc-100 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Overlay for profile dropdown */}
      {profileOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}

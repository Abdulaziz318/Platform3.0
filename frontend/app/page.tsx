'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { FlaskConical, Zap, Shield, BarChart3, ArrowRight, Sparkles, Target, Cpu } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(api.isAuthenticated());
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/experiments');
    } else {
      router.push('/auth/register');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-zinc-900 p-3 rounded-2xl">
              <FlaskConical className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-900 mb-6 tracking-tight">
            LLM Experiment Platform
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Run large-scale experiments with LLMs. Test persuasion, belief changes, and cognitive patterns 
            across hundreds of simulated subjects in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-white bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => router.push('/auth/login')}
                className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-zinc-700 bg-white hover:bg-zinc-50 transition-colors border border-zinc-200"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-100">
        <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
            <div className="mb-4">
              <Zap className="h-6 w-6 text-zinc-900" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-zinc-900">Fast Experiments</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Run experiments with hundreds of subjects in minutes. Our platform handles all the complexity with batch processing and parallel execution.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
            <div className="mb-4">
              <Shield className="h-6 w-6 text-zinc-900" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-zinc-900">Secure & Reliable</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Your data and API keys are encrypted. Experiments run safely with automatic error handling and progress tracking.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
            <div className="mb-4">
              <BarChart3 className="h-6 w-6 text-zinc-900" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-zinc-900">Rich Analytics</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Download detailed CSV results with all subject responses and belief changes tracked over time for comprehensive analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Model Support Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-100">
        <div className="bg-zinc-50 rounded-2xl p-10 border border-zinc-200">
          <div className="text-center">
            <Cpu className="h-8 w-8 mx-auto mb-4 text-zinc-900" />
            <h2 className="text-3xl font-bold mb-8 text-zinc-900">Support for Multiple LLMs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
              <div className="bg-white p-4 rounded-lg border border-zinc-200">
                <p className="font-semibold text-sm text-zinc-900">ChatGPT</p>
                <p className="text-xs text-zinc-500 mt-1">GPT-4o, o1, 3.5 Turbo</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200">
                <p className="font-semibold text-sm text-zinc-900">Claude</p>
                <p className="text-xs text-zinc-500 mt-1">Sonnet 3.5, Haiku 3.5</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200">
                <p className="font-semibold text-sm text-zinc-900">Llama</p>
                <p className="text-xs text-zinc-500 mt-1">3.3 70B, 3.1 405B</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-zinc-200">
                <p className="font-semibold text-sm text-zinc-900">More</p>
                <p className="text-xs text-zinc-500 mt-1">Mistral, Deepseek, Qwen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-100">
        <h2 className="text-3xl font-bold text-center mb-12 text-zinc-900">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-zinc-900 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-4">
              1
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-2 text-zinc-900">Upload Data</h4>
              <p className="text-xs text-zinc-600">Upload your CSV with conspiracies and initial beliefs</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-zinc-900 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-4">
              2
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-2 text-zinc-900">Configure</h4>
              <p className="text-xs text-zinc-600">Choose your LLM model and conversation parameters</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-zinc-900 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-4">
              3
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-2 text-zinc-900">Run</h4>
              <p className="text-xs text-zinc-600">Watch your experiment progress in real-time</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-zinc-900 text-white w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold mx-auto mb-4">
              4
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-sm mb-2 text-zinc-900">Analyze</h4>
              <p className="text-xs text-zinc-600">Download results and analyze belief changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-zinc-100">
        <div className="bg-zinc-900 rounded-2xl p-12 text-center">
          <Target className="h-10 w-10 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Research?
          </h2>
          <p className="text-zinc-300 mb-8 text-base max-w-2xl mx-auto leading-relaxed">
            Join researchers using LLMs to study persuasion, belief formation, and cognitive patterns at scale.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg text-zinc-900 bg-white hover:bg-zinc-100 transition-colors"
          >
            Create Your First Experiment
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

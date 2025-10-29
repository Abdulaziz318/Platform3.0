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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-5 rounded-3xl shadow-xl">
              <FlaskConical className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6">
            LLM Experiment
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Platform</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Run large-scale experiments with LLMs. Test persuasion, belief changes, and cognitive patterns 
            across hundreds of simulated subjects in minutes.
          </p>
          <div className="flex gap-5 justify-center">
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => router.push('/auth/login')}
                className="inline-flex items-center px-10 py-4 border-2 border-gray-300 text-lg font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Why Choose Our Platform?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-100">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl w-fit mb-6">
              <Zap className="h-8 w-8 text-blue-700" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">⚡ Fast Experiments</h3>
            <p className="text-gray-600 leading-relaxed">
              Run experiments with hundreds of subjects in minutes. Our platform handles all the complexity with batch processing and parallel execution.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-100">
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl w-fit mb-6">
              <Shield className="h-8 w-8 text-purple-700" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">🔒 Secure & Reliable</h3>
            <p className="text-gray-600 leading-relaxed">
              Your data and API keys are encrypted. Experiments run safely with automatic error handling and progress tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 border border-gray-100">
            <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl w-fit mb-6">
              <BarChart3 className="h-8 w-8 text-green-700" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900">📊 Rich Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Download detailed CSV results with all subject responses and belief changes tracked over time for comprehensive analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Model Support Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 shadow-2xl">
          <div className="text-center text-white">
            <Cpu className="h-16 w-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">Support for Multiple LLMs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 max-w-4xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                <p className="font-bold text-lg">ChatGPT</p>
                <p className="text-sm opacity-90">GPT-4o, o1, 3.5 Turbo</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                <p className="font-bold text-lg">Claude</p>
                <p className="text-sm opacity-90">Sonnet 3.5, Haiku 3.5</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                <p className="font-bold text-lg">Llama</p>
                <p className="text-sm opacity-90">3.3 70B, 3.1 405B</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                <p className="font-bold text-lg">More</p>
                <p className="text-sm opacity-90">Mistral, Deepseek, Qwen</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">
              1
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-lg mb-2 text-gray-900">📁 Upload Data</h4>
              <p className="text-sm text-gray-600">Upload your CSV with conspiracies and initial beliefs</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">
              2
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-lg mb-2 text-gray-900">⚙️ Configure</h4>
              <p className="text-sm text-gray-600">Choose your LLM model and conversation parameters</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-green-600 to-green-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">
              3
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-lg mb-2 text-gray-900">🚀 Run</h4>
              <p className="text-sm text-gray-600">Watch your experiment progress in real-time</p>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold mx-auto mb-6 shadow-lg">
              4
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
              <h4 className="font-bold text-lg mb-2 text-gray-900">📈 Analyze</h4>
              <p className="text-sm text-gray-600">Download results and analyze belief changes</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-center shadow-2xl">
          <Target className="h-16 w-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to Start Your Research?
          </h2>
          <p className="text-blue-100 mb-8 text-xl max-w-2xl mx-auto leading-relaxed">
            Join researchers using LLMs to study persuasion, belief formation, and cognitive patterns at scale.
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center px-10 py-4 text-lg font-bold rounded-xl text-blue-600 bg-white hover:bg-gray-50 transition-all shadow-2xl hover:shadow-white/30 hover:scale-105"
          >
            <Sparkles className="mr-3 h-6 w-6" />
            Create Your First Experiment
            <ArrowRight className="ml-3 h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

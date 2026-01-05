import Link from "next/link";
import { FileAudio, Users, Edit3, ArrowRight, Mic, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-brand-dark">
      {/* Header */}
      <header className="border-b border-brand-dark-border bg-brand-dark/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
                <FileAudio className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Lesan AI</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#workflow" className="text-sm text-gray-400 hover:text-white transition-colors">
                Workflow
              </Link>
              <Link href="/client" className="text-sm text-gray-400 hover:text-white transition-colors">
                Client Portal
              </Link>
              <Link href="/editor" className="text-sm text-gray-400 hover:text-white transition-colors">
                Editor Portal
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/client">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/client">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-dark-card border border-brand-dark-border rounded-full mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Now supporting 5+ Ethiopian languages</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Accurate Transcription with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-purple-400">
                Human Verification
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              AI-powered transcription with human-in-the-loop verification for exceptional accuracy. 
              Perfect for professional and enterprise use cases.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/client">
                <Button size="lg" className="w-full sm:w-auto px-8">
                  Start Transcribing
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/editor">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                  Editor Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Lesan AI</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Enterprise-grade transcription with human verification for maximum accuracy
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-brand-dark-card border border-brand-dark-border rounded-2xl hover:border-brand-dark-tertiary transition-colors">
              <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-4">
                <Mic className="h-6 w-6 text-brand-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Transcription</h3>
              <p className="text-sm text-gray-400">State-of-the-art speech recognition optimized for Ethiopian languages</p>
            </div>
            
            <div className="p-6 bg-brand-dark-card border border-brand-dark-border rounded-2xl hover:border-brand-dark-tertiary transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Human Verification</h3>
              <p className="text-sm text-gray-400">Expert editors review and verify every transcription for accuracy</p>
            </div>
            
            <div className="p-6 bg-brand-dark-card border border-brand-dark-border rounded-2xl hover:border-brand-dark-tertiary transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Fast Turnaround</h3>
              <p className="text-sm text-gray-400">Quick processing with real-time status updates and notifications</p>
            </div>
            
            <div className="p-6 bg-brand-dark-card border border-brand-dark-border rounded-2xl hover:border-brand-dark-tertiary transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Language</h3>
              <p className="text-sm text-gray-400">Support for Amharic, Tigrinya, Oromo, and more Ethiopian languages</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portals */}
      <section className="py-24 bg-brand-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Portal</h2>
            <p className="text-gray-400">Access the right interface for your role</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link
              href="/client"
              className="group relative p-8 bg-brand-dark-card rounded-2xl border border-brand-dark-border hover:border-brand-primary/50 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-brand-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Client Dashboard</h3>
                <p className="text-gray-400 mb-6">
                  Submit jobs, track progress, and manage your transcriptions with an intuitive interface.
                </p>
                <span className="inline-flex items-center text-brand-primary font-medium group-hover:gap-2 transition-all">
                  Open Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>

            <Link
              href="/editor"
              className="group relative p-8 bg-brand-dark-card rounded-2xl border border-brand-dark-border hover:border-orange-500/50 transition-all overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Edit3 className="h-7 w-7 text-orange-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Editor Dashboard</h3>
                <p className="text-gray-400 mb-6">
                  Review transcriptions with audio-synced editing tools and keyboard shortcuts.
                </p>
                <span className="inline-flex items-center text-orange-400 font-medium group-hover:gap-2 transition-all">
                  Open Editor <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 border-t border-brand-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple Workflow</h2>
            <p className="text-gray-400">From submission to verified transcription</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-brand-dark-tertiary flex items-center justify-center text-white font-bold">1</span>
              <span className="px-4 py-2 bg-brand-dark-tertiary text-gray-300 rounded-lg">Submit Audio</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">2</span>
              <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">AI Processing</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold">3</span>
              <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg">Human Review</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-600 hidden sm:block" />
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold">4</span>
              <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium">Verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-dark-border bg-brand-dark-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
                <FileAudio className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Lesan AI</span>
            </div>
            <p className="text-sm text-gray-500">
              Human-in-the-Loop Transcription Verification Platform
            </p>
            <p className="text-sm text-gray-500">
              © 2026 Lesan AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

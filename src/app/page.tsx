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

   
    </div>
  );
}

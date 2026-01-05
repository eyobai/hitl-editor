import Link from "next/link";
import { FileAudio, Users, Edit3, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileAudio className="h-6 w-6 text-gray-900" />
              <span className="text-xl font-semibold">HITL Editor</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/client"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Client Portal
              </Link>
              <Link
                href="/editor"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Editor Portal
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Human-in-the-Loop
            <br />
            <span className="text-blue-600">Transcription Editor</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A verification workflow where customers request human proofreading
            for their audio transcriptions.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Client Card */}
          <Link
            href="/client"
            className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Client Dashboard
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Submit transcription jobs, request human review, and track the
              status of your audio files.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Submit audio files for transcription
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Toggle human review requests
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Receive notifications on completion
              </li>
            </ul>
          </Link>

          {/* Editor Card */}
          <Link
            href="/editor"
            className="group p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
                <Edit3 className="h-6 w-6 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Editor Dashboard
              </h2>
            </div>
            <p className="text-gray-600 mb-4">
              Review and verify transcriptions with an audio-synced editor
              interface.
            </p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Task queue with pending reviews
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Waveform audio player
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Time-synced transcript editing
              </li>
            </ul>
          </Link>
        </div>

        {/* Status Flow */}
        <div className="mt-16 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Transcription Workflow
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm">
            <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full">
              Pending
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
              Processing
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full">
              Completed
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full">
              Pending Review
            </span>
            <span className="text-gray-400">→</span>
            <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">
              Verified
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-500">
            HITL Transcription Editor - Human-in-the-Loop Verification Workflow
          </p>
        </div>
      </footer>
    </div>
  );
}

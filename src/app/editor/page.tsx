'use client';

import Link from 'next/link';
import { FileAudio, ArrowLeft, Construction } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EditorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileAudio className="h-6 w-6 text-gray-900" />
              <h1 className="text-xl font-semibold text-gray-900">
                HITL Editor - Task Queue
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Demo Editor</span>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5 text-orange-500" />
              Editor Dashboard - Coming in Milestone 3
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              The Editor Task Queue will be implemented in Milestone 3. It will include:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-500">
              <li>• Queue dashboard showing pending_review and in_review jobs</li>
              <li>• Filter/sort by date, status</li>
              <li>• Lock indicator showing which tasks are being edited</li>
              <li>• &quot;Start Review&quot; button to claim a task</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

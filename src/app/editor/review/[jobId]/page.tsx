'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Job, TaskLock } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WaveformPlayer } from '@/components/waveform-player';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import {
  ArrowLeft,
  FileAudio,
  Clock,
  Lock,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const DEMO_EDITOR_ID = 'user-editor-1';
const DEMO_EDITOR_NAME = 'Demo Editor';
const DEMO_EDITOR_EMAIL = 'editor@lesan.ai';

const LOCK_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh lock every 5 minutes

export default function EditorReviewPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [lock, setLock] = useState<TaskLock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const fetchJob = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const result = await response.json();
      if (result.success) {
        setJob(result.data);
      } else {
        setError('Job not found');
      }
    } catch (err) {
      setError('Failed to load job');
    }
  }, [jobId]);

  const fetchLock = useCallback(async () => {
    try {
      const response = await fetch(`/api/locks?jobId=${jobId}`);
      const result = await response.json();
      if (result.success) {
        setLock(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch lock:', err);
    }
  }, [jobId]);

  const acquireLock = useCallback(async () => {
    try {
      const response = await fetch('/api/locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acquire',
          jobId,
          editorId: DEMO_EDITOR_ID,
          editorName: DEMO_EDITOR_NAME,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setLock(result.data);
        return true;
      } else {
        setError(result.error || 'Failed to acquire lock');
        return false;
      }
    } catch (err) {
      setError('Failed to acquire lock');
      return false;
    }
  }, [jobId]);

  const refreshLock = useCallback(async () => {
    if (!lock || lock.editorId !== DEMO_EDITOR_ID) return;

    try {
      await fetch('/api/locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refresh',
          jobId,
          editorId: DEMO_EDITOR_ID,
        }),
      });
    } catch (err) {
      console.error('Failed to refresh lock:', err);
    }
  }, [jobId, lock]);

  const releaseLock = useCallback(async () => {
    if (!lock || lock.editorId !== DEMO_EDITOR_ID) return;

    try {
      await fetch('/api/locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'release',
          jobId,
          editorId: DEMO_EDITOR_ID,
        }),
      });
    } catch (err) {
      console.error('Failed to release lock:', err);
    }
  }, [jobId, lock]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchJob();
      await fetchLock();
      setIsLoading(false);
    };
    init();
  }, [fetchJob, fetchLock]);

  // Try to acquire lock if not already locked
  useEffect(() => {
    if (!isLoading && job && !lock) {
      acquireLock();
    }
  }, [isLoading, job, lock, acquireLock]);

  // Refresh lock periodically
  useEffect(() => {
    if (!lock || lock.editorId !== DEMO_EDITOR_ID) return;

    const interval = setInterval(refreshLock, LOCK_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [lock, refreshLock]);

  // Release lock on unmount
  useEffect(() => {
    return () => {
      if (lock && lock.editorId === DEMO_EDITOR_ID) {
        // Fire and forget release
        fetch('/api/locks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'release',
            jobId,
            editorId: DEMO_EDITOR_ID,
          }),
        }).catch(() => {});
      }
    };
  }, [jobId, lock]);

  const handleBack = async () => {
    await releaseLock();
    router.push('/editor');
  };

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleReady = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading review...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || 'Job not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            Unable to load the review task. It may have been completed or deleted.
          </p>
          <Button onClick={() => router.push('/editor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  const isLockedByOther = lock && lock.editorId !== DEMO_EDITOR_ID;

  if (isLockedByOther) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="bg-brand-dark-card border border-yellow-500/30 rounded-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 mx-auto rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Task is Locked
          </h2>
          <p className="text-gray-400 mb-6">
            This task is currently being reviewed by{' '}
            <span className="text-yellow-400 font-medium">{lock.editorName}</span>.
            Please try again later or select another task.
          </p>
          <Button onClick={() => router.push('/editor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="editor"
      userName={DEMO_EDITOR_NAME}
      userEmail={DEMO_EDITOR_EMAIL}
    >
      {/* Header */}
      <div className="border-b border-brand-dark-border bg-brand-dark-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
            <div className="h-6 w-px bg-brand-dark-border" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <FileAudio className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h1 className="font-semibold text-white">{job.audioFileName}</h1>
                <div className="flex items-center gap-2 text-sm">
                  <StatusBadge status={job.status} />
                  {job.transcript?.language && (
                    <span className="text-gray-500 uppercase text-xs">
                      {job.transcript.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {lock && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                <Lock className="h-4 w-4 text-brand-primary" />
                <span className="text-sm text-brand-primary">Locked by you</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Submitted {formatDate(job.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Audio Player Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Audio Waveform</h2>
          <WaveformPlayer
            audioUrl={job.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onReady={handleReady}
          />
        </div>

        {/* Transcript Preview (placeholder for Milestone 5) */}
        <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Transcript</h2>
          <p className="text-sm text-gray-400 mb-4">
            Transcript editor coming in Milestone 5. For now, here&apos;s a preview:
          </p>
          {job.transcript?.segments && (
            <div className="space-y-3">
              {job.transcript.segments.map((segment) => (
                <div
                  key={segment.id}
                  className="p-3 bg-brand-dark-tertiary/50 rounded-lg border border-transparent hover:border-brand-dark-border transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="font-mono">
                      {segment.start_time}s - {segment.end_time}s
                    </span>
                    <span className="px-1.5 py-0.5 bg-brand-dark-border rounded text-gray-400">
                      {segment.type}
                    </span>
                  </div>
                  <p className="text-gray-300">{segment.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

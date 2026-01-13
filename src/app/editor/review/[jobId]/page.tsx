'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Job, TaskLock, TranscriptSegment } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { WaveformPlayer, WaveformPlayerHandle } from '@/components/waveform-player';
import { TranscriptEditor } from '@/components/transcript-editor';
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
  CheckCircle,
  Save,
  Keyboard,
  X,
} from 'lucide-react';

const DEMO_EDITOR_ID = 'user-editor-1';
const DEMO_EDITOR_NAME = 'Demo Editor';
const DEMO_EDITOR_EMAIL = 'editor@lesan.ai';

const LOCK_REFRESH_INTERVAL = 5 * 60 * 1000; // Refresh lock every 5 minutes

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Tab'], description: 'Play / Pause audio' },
    { keys: ['Ctrl', 'Enter'], description: 'Mark as Verified and submit' },
    { keys: ['Ctrl', 'S'], description: 'Save progress (without verifying)' },
    { keys: ['←', '→'], description: 'Seek audio backward/forward 5 seconds' },
    { keys: ['Esc'], description: 'Cancel editing / Close modal' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center">
              <Keyboard className="h-5 w-5 text-brand-primary" />
            </div>
            <h2 className="text-lg font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-brand-dark-tertiary transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-brand-dark-border last:border-0">
              <span className="text-gray-300">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2 py-1 bg-brand-dark-tertiary border border-brand-dark-border rounded text-xs text-gray-300 font-mono">
                      {key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-500 mx-1">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-brand-dark-tertiary border border-brand-dark-border rounded text-xs">?</kbd> anytime to toggle this panel
        </p>
      </div>
    </div>
  );
}

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
  const [editedSegments, setEditedSegments] = useState<TranscriptSegment[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const waveformRef = useRef<WaveformPlayerHandle>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    
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
    if (!jobId) return;
    
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
    if (!jobId) return false;
    
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

  const handleSeek = useCallback((time: number) => {
    waveformRef.current?.seekTo(time);
  }, []);

  const handleSegmentUpdate = useCallback((segmentId: number, newText: string) => {
    setEditedSegments((prev) => {
      const existing = prev.find((s) => s.id === segmentId);
      if (existing) {
        return prev.map((s) => (s.id === segmentId ? { ...s, text: newText } : s));
      }
      const originalSegment = job?.transcript?.segments.find((s) => s.id === segmentId);
      if (originalSegment) {
        return [...prev, { ...originalSegment, text: newText }];
      }
      return prev;
    });
    setHasUnsavedChanges(true);
  }, [job]);

  // Build final segments with edits applied
  const getFinalSegments = useCallback(() => {
    if (!job?.transcript?.segments) return [];
    return job.transcript.segments.map((segment) => {
      const edited = editedSegments.find((s) => s.id === segment.id);
      return edited || segment;
    });
  }, [job, editedSegments]);

  // Save progress without verifying
  const handleSave = useCallback(async () => {
    if (!job || isSaving) return;
    setIsSaving(true);
    try {
      // In a real app, this would save to the backend
      // For now, we just mark as saved
      setHasUnsavedChanges(false);
      // Show a brief success indication
      setTimeout(() => setIsSaving(false), 500);
    } catch (err) {
      console.error('Failed to save:', err);
      setIsSaving(false);
    }
  }, [job, isSaving]);

  // Verify and submit
  const handleVerify = useCallback(async () => {
    if (!job || isVerifying) return;
    setIsVerifying(true);
    try {
      const finalSegments = getFinalSegments();
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          editorId: DEMO_EDITOR_ID,
          editedTranscript: editedSegments.length > 0 ? { segments: finalSegments } : undefined,
        }),
      });
      const result = await response.json();
      if (result.success) {
        router.push('/editor');
      } else {
        alert(result.error || 'Failed to verify');
        setIsVerifying(false);
      }
    } catch (err) {
      console.error('Failed to verify:', err);
      alert('Failed to verify transcription');
      setIsVerifying(false);
    }
  }, [job, isVerifying, editedSegments, getFinalSegments, router]);

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in an input/textarea
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Toggle shortcuts modal with '?'
      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Close modal with Escape
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
      }

      // Tab - Play/Pause (prevent default tab behavior)
      if (e.key === 'Tab' && !isTyping) {
        e.preventDefault();
        waveformRef.current?.togglePlayPause();
        return;
      }

      // Ctrl+Enter - Verify and submit
      if (e.key === 'Enter' && e.ctrlKey && !isTyping) {
        e.preventDefault();
        handleVerify();
        return;
      }

      // Ctrl+S - Save progress
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        handleSave();
        return;
      }

      // Arrow keys for seeking (when not typing)
      if (!isTyping) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const newTime = Math.max(0, currentTime - 5);
          waveformRef.current?.seekTo(newTime);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          const newTime = Math.min(duration, currentTime + 5);
          waveformRef.current?.seekTo(newTime);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleVerify, handleSave, showShortcuts, currentTime, duration]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

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

          <div className="flex items-center gap-3">
            {lock && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
                <Lock className="h-4 w-4 text-brand-primary" />
                <span className="text-sm text-brand-primary">Locked by you</span>
              </div>
            )}
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <span className="text-sm text-yellow-400">Unsaved changes</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Submitted {formatDate(job.createdAt)}</span>
            </div>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded-lg hover:bg-brand-dark-tertiary transition-colors text-gray-400 hover:text-white"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Audio Player Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Audio Waveform</h2>
          <WaveformPlayer
            ref={waveformRef}
            audioUrl={job.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onReady={handleReady}
          />
        </div>

        {/* Transcript Editor */}
        {job.transcript?.segments && (
          <TranscriptEditor
            segments={job.transcript.segments}
            currentTime={currentTime}
            onSeek={handleSeek}
            onSegmentUpdate={handleSegmentUpdate}
            editable={true}
          />
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Keyboard className="h-4 w-4" />
            <span>Press <kbd className="px-1.5 py-0.5 bg-brand-dark-tertiary border border-brand-dark-border rounded text-xs">Tab</kbd> to play/pause, <kbd className="px-1.5 py-0.5 bg-brand-dark-tertiary border border-brand-dark-border rounded text-xs">Ctrl+Enter</kbd> to verify</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save Progress'}
            </Button>
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isVerifying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {isVerifying ? 'Verifying...' : 'Mark as Verified'}
            </Button>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </DashboardLayout>
  );
}

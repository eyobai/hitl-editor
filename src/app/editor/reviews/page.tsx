'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Job, Notification, TaskLock } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Header } from '@/components/layout/header';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  Clock,
  Play,
  Lock,
  Inbox,
  Loader2,
  User,
  CheckCircle,
} from 'lucide-react';

const DEMO_EDITOR_ID = 'user-editor-1';
const DEMO_EDITOR_NAME = 'Demo Editor';
const DEMO_EDITOR_EMAIL = 'editor@lesan.ai';

export default function EditorReviewsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locks, setLocks] = useState<TaskLock[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchLocks = useCallback(async () => {
    try {
      const response = await fetch('/api/locks');
      const result = await response.json();
      if (result.success) {
        setLocks(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch locks:', error);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();
      if (result.success) {
        // Get jobs that this editor has worked on (in_review or verified by this editor)
        const myJobs = result.data.filter(
          (job: Job) =>
            job.status === 'in_review' ||
            job.status === 'verified' ||
            job.status === 'pending_review'
        );
        setJobs(myJobs);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${DEMO_EDITOR_ID}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchJobs(), fetchLocks(), fetchNotifications()]);
      setIsLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      fetchJobs();
      fetchLocks();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchJobs, fetchLocks, fetchNotifications]);

  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getLockForJob = useCallback(
    (jobId: string): TaskLock | undefined => {
      return locks.find((lock) => lock.jobId === jobId);
    },
    [locks]
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = job.audioFileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="editor"
      userName={DEMO_EDITOR_NAME}
      userEmail={DEMO_EDITOR_EMAIL}
    >
      <Header
        title="My Reviews"
        subtitle="View your review history"
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationAsRead}
        searchPlaceholder="Search reviews..."
        onSearch={setSearchQuery}
      />

      <div className="p-6">
        {/* Status Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending_review', 'in_review', 'verified'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-brand-primary text-white'
                  : 'bg-brand-dark-card text-gray-400 hover:text-white border border-brand-dark-border'
              }`}
            >
              {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Jobs Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-400">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'review' : 'reviews'} found
          </p>
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark-tertiary flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No reviews found</h3>
            <p className="text-sm text-gray-400">
              {statusFilter === 'all'
                ? 'Start reviewing tasks from the Task Queue'
                : `No reviews with status "${statusFilter.replace('_', ' ')}"`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredJobs.map((job) => {
              const lock = getLockForJob(job.id);
              const isLockedByOther = lock && lock.editorId !== DEMO_EDITOR_ID;
              const isLockedByMe = lock && lock.editorId === DEMO_EDITOR_ID;

              return (
                <div
                  key={job.id}
                  className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-4 hover:border-brand-dark-hover transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-medium truncate">
                            {job.audioFileName}
                          </h3>
                          <StatusBadge status={job.status} />
                          {isLockedByMe && (
                            <span className="flex items-center gap-1 text-xs text-brand-primary">
                              <Lock className="h-3 w-3" />
                              Your lock
                            </span>
                          )}
                          {isLockedByOther && (
                            <span className="flex items-center gap-1 text-xs text-orange-400">
                              <User className="h-3 w-3" />
                              {lock.editorName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.transcript?.duration
                              ? formatDuration(job.transcript.duration)
                              : 'N/A'}
                          </span>
                          <span>{formatDate(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {job.status === 'verified' ? (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm">Verified</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => router.push(`/editor/review/${job.id}`)}
                          disabled={isLockedByOther}
                          className="gap-2"
                        >
                          {isLockedByOther ? (
                            <>
                              <Lock className="h-4 w-4" />
                              Locked
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              {isLockedByMe ? 'Continue' : 'Review'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

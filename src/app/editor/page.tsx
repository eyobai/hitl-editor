'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Job, Notification, TaskLock } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Header } from '@/components/layout/header';
import { StatsCard } from '@/components/stats-card';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  FileAudio,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Lock,
  Inbox,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  User,
} from 'lucide-react';

const DEMO_EDITOR_ID = 'user-editor-1';
const DEMO_EDITOR_NAME = 'Demo Editor';
const DEMO_EDITOR_EMAIL = 'editor@lesan.ai';

type SortOption = 'date_desc' | 'date_asc' | 'duration_desc' | 'duration_asc';
type FilterOption = 'all' | 'pending_review' | 'in_review';

export default function EditorDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [locks, setLocks] = useState<TaskLock[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingJobId, setClaimingJobId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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
        const reviewJobs = result.data.filter(
          (job: Job) => job.status === 'pending_review' || job.status === 'in_review'
        );
        setJobs(reviewJobs);
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

  const getLockForJob = useCallback(
    (jobId: string): TaskLock | undefined => {
      return locks.find((lock) => lock.jobId === jobId);
    },
    [locks]
  );

  const handleStartReview = async (jobId: string) => {
    setClaimingJobId(jobId);
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
        router.push(`/editor/review/${jobId}`);
      } else {
        alert(result.error || 'Failed to claim task');
        setClaimingJobId(null);
      }
    } catch (error) {
      console.error('Failed to start review:', error);
      alert('Failed to claim task');
      setClaimingJobId(null);
    }
  };

  const filteredAndSortedJobs = useMemo(() => {
    let result = [...jobs];

    if (filterBy !== 'all') {
      result = result.filter((job) => job.status === filterBy);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'date_asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'duration_desc':
          return (b.transcript?.duration || 0) - (a.transcript?.duration || 0);
        case 'duration_asc':
          return (a.transcript?.duration || 0) - (b.transcript?.duration || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [jobs, filterBy, sortBy]);

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

  const stats = {
    pendingReview: jobs.filter((j) => j.status === 'pending_review').length,
    inReview: jobs.filter((j) => j.status === 'in_review').length,
    total: jobs.length,
  };

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
        title="Task Queue"
        subtitle="Review and verify transcriptions"
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationAsRead}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Pending Review"
            value={stats.pendingReview}
            icon={AlertCircle}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-500/20"
          />
          <StatsCard
            title="In Review"
            value={stats.inReview}
            icon={Clock}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
          />
          <StatsCard
            title="Total Queue"
            value={stats.total}
            icon={FileAudio}
            iconColor="text-gray-400"
            iconBgColor="bg-brand-dark-tertiary"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">Review Queue</h2>
            <p className="text-sm text-gray-400">
              {filteredAndSortedJobs.length} {filteredAndSortedJobs.length === 1 ? 'task' : 'tasks'} 
              {filterBy !== 'all' && ` (filtered)`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-brand-dark-card border border-brand-dark-border rounded-lg text-sm text-gray-300 hover:border-brand-dark-tertiary transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>
                  {filterBy === 'all' ? 'All Status' : filterBy === 'pending_review' ? 'Pending' : 'In Review'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-brand-dark-card border border-brand-dark-border rounded-lg shadow-xl z-10">
                  {[
                    { value: 'all', label: 'All Status' },
                    { value: 'pending_review', label: 'Pending Review' },
                    { value: 'in_review', label: 'In Review' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setFilterBy(option.value as FilterOption);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-dark-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        filterBy === option.value ? 'text-brand-primary' : 'text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowFilterDropdown(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-brand-dark-card border border-brand-dark-border rounded-lg text-sm text-gray-300 hover:border-brand-dark-tertiary transition-colors"
              >
                <ArrowUpDown className="h-4 w-4" />
                <span>Sort</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-brand-dark-card border border-brand-dark-border rounded-lg shadow-xl z-10">
                  {[
                    { value: 'date_desc', label: 'Newest First' },
                    { value: 'date_asc', label: 'Oldest First' },
                    { value: 'duration_desc', label: 'Longest Duration' },
                    { value: 'duration_asc', label: 'Shortest Duration' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as SortOption);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-brand-dark-tertiary transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        sortBy === option.value ? 'text-brand-primary' : 'text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {filteredAndSortedJobs.length === 0 ? (
          <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark-tertiary flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              {filterBy !== 'all' ? 'No matching tasks' : 'Queue is empty'}
            </h3>
            <p className="text-sm text-gray-400">
              {filterBy !== 'all'
                ? 'Try changing your filter settings'
                : 'No transcriptions waiting for review at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedJobs.map((job) => {
              const lock = getLockForJob(job.id);
              const isLockedByOther = lock && lock.editorId !== DEMO_EDITOR_ID;
              const isLockedByMe = lock && lock.editorId === DEMO_EDITOR_ID;
              const isClaiming = claimingJobId === job.id;

              return (
                <div
                  key={job.id}
                  className={`bg-brand-dark-card border rounded-xl p-5 transition-all ${
                    isLockedByOther
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : isLockedByMe
                      ? 'border-brand-primary/30 bg-brand-primary/5'
                      : 'border-brand-dark-border hover:border-brand-dark-tertiary'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLockedByOther
                          ? 'bg-yellow-500/10'
                          : isLockedByMe
                          ? 'bg-brand-primary/10'
                          : 'bg-orange-500/10'
                      }`}
                    >
                      {isLockedByOther ? (
                        <Lock className="h-6 w-6 text-yellow-400" />
                      ) : isLockedByMe ? (
                        <CheckCircle className="h-6 w-6 text-brand-primary" />
                      ) : (
                        <FileAudio className="h-6 w-6 text-orange-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            {job.audioFileName}
                          </h3>
                          <div className="flex items-center gap-3 mt-1">
                            <StatusBadge status={job.status} />
                            {job.transcript?.language && (
                              <span className="text-xs text-gray-500 uppercase">
                                {job.transcript.language}
                              </span>
                            )}
                          </div>
                        </div>

                        {isLockedByOther ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex-shrink-0">
                            <User className="h-4 w-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              Locked by {lock.editorName}
                            </span>
                          </div>
                        ) : isLockedByMe ? (
                          <Button
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => router.push(`/editor/review/${job.id}`)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Continue Review
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => handleStartReview(job.id)}
                            disabled={isClaiming}
                          >
                            {isClaiming ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4 mr-2" />
                            )}
                            {isClaiming ? 'Claiming...' : 'Start Review'}
                          </Button>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          <span>Submitted {formatDate(job.createdAt)}</span>
                        </div>
                        {job.transcript?.duration && (
                          <div className="flex items-center gap-1.5">
                            <FileAudio className="h-4 w-4" />
                            <span>{formatDuration(job.transcript.duration)}</span>
                          </div>
                        )}
                        {lock && (
                          <div className="flex items-center gap-1.5">
                            <Lock className="h-4 w-4" />
                            <span>
                              Locked {formatDate(lock.lockedAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      {job.transcript && (
                        <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                          {job.transcript.segments.map((s) => s.text).join(' ').substring(0, 150)}...
                        </p>
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

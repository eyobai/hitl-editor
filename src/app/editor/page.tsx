'use client';

import { useState, useEffect, useCallback } from 'react';
import { Job, Notification } from '@/lib/types';
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
} from 'lucide-react';

const DEMO_EDITOR_ID = 'user-editor-1';
const DEMO_EDITOR_NAME = 'Demo Editor';
const DEMO_EDITOR_EMAIL = 'editor@lesan.ai';

export default function EditorDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      await Promise.all([fetchJobs(), fetchNotifications()]);
      setIsLoading(false);
    };
    loadData();

    const interval = setInterval(() => {
      fetchJobs();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchJobs, fetchNotifications]);

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
        {/* Stats */}
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

        {/* Queue Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-1">Review Queue</h2>
          <p className="text-sm text-gray-400">
            {jobs.length} {jobs.length === 1 ? 'task' : 'tasks'} awaiting review
          </p>
        </div>

        {/* Task Cards */}
        {jobs.length === 0 ? (
          <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark-tertiary flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Queue is empty</h3>
            <p className="text-sm text-gray-400">
              No transcriptions waiting for review at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-5 hover:border-brand-dark-tertiary transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <FileAudio className="h-6 w-6 text-orange-400" />
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

                      <Button size="sm" className="flex-shrink-0">
                        <Play className="h-4 w-4 mr-2" />
                        Start Review
                      </Button>
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
                    </div>

                    {job.transcript && (
                      <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                        {job.transcript.segments.map((s) => s.text).join(' ').substring(0, 150)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

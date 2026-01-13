'use client';

import { useState, useEffect, useCallback } from 'react';
import { Job, Notification } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Header } from '@/components/layout/header';
import { StatsCard } from '@/components/stats-card';
import { JobCardPro } from '@/components/job-card-pro';
import { NewJobModal } from '@/components/new-job-modal';
import { FileAudio, Clock, CheckCircle, AlertCircle, Inbox } from 'lucide-react';

const DEMO_USER_ID = 'user-client-1';
const DEMO_USER_NAME = 'Eyob Sisay';
const DEMO_USER_EMAIL = 'eyob@lesan.ai';

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | undefined>();
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch(`/api/jobs?userId=${DEMO_USER_ID}`);
      const result = await response.json();
      if (result.success) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/notifications?userId=${DEMO_USER_ID}`);
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
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchJobs, fetchNotifications]);

  const handleSubmitJob = async (
    audioUrl: string,
    audioFileName: string,
    requestHumanReview: boolean
  ) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: DEMO_USER_ID,
          audioUrl,
          audioFileName,
          requestHumanReview,
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Failed to submit job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestReviewToggle = async (jobId: string, requestReview: boolean) => {
    setUpdatingJobId(jobId);
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestHumanReview: requestReview,
          status: requestReview ? 'pending_review' : 'completed',
        }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Failed to update job:', error);
    } finally {
      setUpdatingJobId(undefined);
    }
  };

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

  const handleViewDetails = (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job?.transcript) {
      const text = job.editedTranscript?.segments?.map((s) => s.text).join('\n\n') ||
        job.transcript.segments.map((s) => s.text).join('\n\n');
      alert(`Transcript for ${job.audioFileName}:\n\n${text}`);
    } else {
      alert('No transcript available for this job.');
    }
  };

  const handleDownload = (job: Job) => {
    if (!job.transcript) {
      alert('No transcript available to download.');
      return;
    }
    const text = job.editedTranscript?.segments?.map((s) => s.text).join('\n\n') ||
      job.transcript.segments.map((s) => s.text).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${job.audioFileName.replace(/\.[^/.]+$/, '')}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        await fetchJobs();
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Failed to delete job:', error);
      alert('Failed to delete job');
    }
  };

  // Calculate stats
  const stats = {
    total: jobs.length,
    processing: jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed' || j.status === 'verified').length,
    pendingReview: jobs.filter((j) => j.status === 'pending_review' || j.status === 'in_review').length,
  };

  // Filter jobs by search
  const filteredJobs = jobs.filter((job) =>
    job.audioFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
      </div>
    );
  }

  return (
    <DashboardLayout
      userRole="client"
      userName={DEMO_USER_NAME}
      userEmail={DEMO_USER_EMAIL}
    >
      <Header
        title="Dashboard"
        subtitle="Manage your transcription jobs"
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationAsRead}
        showNewJobButton
        onNewJob={() => setIsNewJobModalOpen(true)}
        searchPlaceholder="Search jobs..."
        onSearch={setSearchQuery}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Jobs"
            value={stats.total}
            icon={FileAudio}
            iconColor="text-gray-400"
            iconBgColor="bg-brand-dark-tertiary"
          />
          <StatsCard
            title="Processing"
            value={stats.processing}
            icon={Clock}
            iconColor="text-blue-400"
            iconBgColor="bg-blue-500/20"
          />
          <StatsCard
            title="Pending Review"
            value={stats.pendingReview}
            icon={AlertCircle}
            iconColor="text-orange-400"
            iconBgColor="bg-orange-500/20"
          />
          <StatsCard
            title="Completed"
            value={stats.completed}
            icon={CheckCircle}
            iconColor="text-green-400"
            iconBgColor="bg-green-500/20"
          />
        </div>

        {/* Jobs Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white mb-1">Recent Jobs</h2>
          <p className="text-sm text-gray-400">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark-tertiary flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No jobs yet</h3>
            <p className="text-sm text-gray-400 mb-6">
              Submit your first transcription job to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <JobCardPro
                key={job.id}
                job={job}
                onRequestReviewToggle={handleRequestReviewToggle}
                onView={handleViewDetails}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isUpdating={updatingJobId === job.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* New Job Modal */}
      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onSubmit={handleSubmitJob}
        isSubmitting={isSubmitting}
      />
    </DashboardLayout>
  );
}

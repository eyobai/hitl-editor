'use client';

import { useState, useEffect, useCallback } from 'react';
import { Job, Notification } from '@/lib/types';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Header } from '@/components/layout/header';
import { JobCardPro } from '@/components/job-card-pro';
import { Inbox } from 'lucide-react';

const DEMO_USER_ID = 'user-client-1';
const DEMO_USER_NAME = 'Eyob Sisay';
const DEMO_USER_EMAIL = 'eyob@lesan.ai';

export default function ClientJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingJobId, setUpdatingJobId] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  // Filter jobs by search and status
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.audioFileName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        title="My Jobs"
        subtitle="View and manage all your transcription jobs"
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationAsRead}
        searchPlaceholder="Search jobs..."
        onSearch={setSearchQuery}
      />

      <div className="p-6">
        {/* Status Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'processing', 'pending_review', 'in_review',  'verified'].map((status) => (
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
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
          </p>
        </div>

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-brand-dark-tertiary flex items-center justify-center mb-4">
              <Inbox className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No jobs found</h3>
            <p className="text-sm text-gray-400">
              {statusFilter === 'all'
                ? 'Submit your first transcription job to get started'
                : `No jobs with status "${statusFilter.replace('_', ' ')}"`}
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
    </DashboardLayout>
  );
}

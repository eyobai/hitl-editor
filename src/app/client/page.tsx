'use client';

import { useState, useEffect, useCallback } from 'react';
import { Job, Notification } from '@/lib/types';
import { JobList } from '@/components/job-list';
import { SubmitJobForm } from '@/components/submit-job-form';
import { NotificationsDropdown } from '@/components/notifications-dropdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileAudio, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const DEMO_USER_ID = 'user-client-1';

export default function ClientDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingJobId, setUpdatingJobId] = useState<string | undefined>();

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

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchJobs();
      fetchNotifications();
    }, 10000);

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

  // Calculate stats
  const stats = {
    total: jobs.length,
    processing: jobs.filter((j) => j.status === 'pending' || j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed' || j.status === 'verified').length,
    pendingReview: jobs.filter((j) => j.status === 'pending_review' || j.status === 'in_review').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <FileAudio className="h-6 w-6 text-gray-900" />
              <h1 className="text-xl font-semibold text-gray-900">
                HITL Transcription
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Demo Client</span>
              <NotificationsDropdown
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <FileAudio className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.processing}</p>
                  <p className="text-sm text-gray-500">Processing</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.pendingReview}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stats.completed}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit New Job */}
        <div className="mb-8">
          <SubmitJobForm onSubmit={handleSubmitJob} isSubmitting={isSubmitting} />
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Transcription Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <JobList
              jobs={jobs}
              onRequestReviewToggle={handleRequestReviewToggle}
              isUpdating={updatingJobId}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

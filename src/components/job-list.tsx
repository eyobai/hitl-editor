'use client';

import { useState } from 'react';
import { Job } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatDate, formatDuration } from '@/lib/utils';
import { FileAudio, Clock, Calendar, UserCheck } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  onRequestReviewToggle: (jobId: string, requestReview: boolean) => void;
  isUpdating?: string;
}

export function JobList({ jobs, onRequestReviewToggle, isUpdating }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileAudio className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Submit a new transcription job to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onRequestReviewToggle={onRequestReviewToggle}
          isUpdating={isUpdating === job.id}
        />
      ))}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  onRequestReviewToggle: (jobId: string, requestReview: boolean) => void;
  isUpdating: boolean;
}

function JobCard({ job, onRequestReviewToggle, isUpdating }: JobCardProps) {
  const canRequestReview =
    job.status === 'completed' && !job.requestHumanReview;
  const showReviewToggle =
    job.status === 'completed' ||
    job.status === 'pending_review' ||
    job.status === 'in_review' ||
    job.status === 'verified';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <FileAudio className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <h3 className="font-medium text-gray-900 truncate">
                {job.audioFileName}
              </h3>
              <StatusBadge status={job.status} />
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(job.createdAt)}</span>
              </div>

              {job.transcript?.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {formatDuration(job.transcript.duration)}</span>
                </div>
              )}

              {job.verifiedAt && job.verifiedBy && (
                <div className="flex items-center gap-1 text-green-600">
                  <UserCheck className="h-4 w-4" />
                  <span>Verified: {formatDate(job.verifiedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {showReviewToggle && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <Label
                htmlFor={`review-${job.id}`}
                className="text-sm text-gray-600 cursor-pointer"
              >
                Human Review
              </Label>
              <Switch
                id={`review-${job.id}`}
                checked={job.requestHumanReview}
                onCheckedChange={(checked) =>
                  onRequestReviewToggle(job.id, checked)
                }
                disabled={
                  isUpdating ||
                  job.status === 'pending_review' ||
                  job.status === 'in_review' ||
                  job.status === 'verified'
                }
              />
            </div>
          )}
        </div>

        {job.transcript && job.status !== 'pending' && job.status !== 'processing' && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600 line-clamp-2">
              {job.editedTranscript?.text || job.transcript.text || 
                job.transcript.segments.map(s => s.text).join(' ').substring(0, 200) + '...'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

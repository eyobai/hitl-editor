'use client';

import { Job } from '@/lib/types';
import { StatusBadge } from '@/components/status-badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { formatDate, formatDuration } from '@/lib/utils';
import {
  FileAudio,
  Clock,
  Calendar,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';

interface JobCardProProps {
  job: Job;
  onRequestReviewToggle: (jobId: string, requestReview: boolean) => void;
  onView?: (jobId: string) => void;
  onDownload?: (job: Job) => void;
  onDelete?: (jobId: string) => void;
  isUpdating?: boolean;
}

export function JobCardPro({
  job,
  onRequestReviewToggle,
  onView,
  onDownload,
  onDelete,
  isUpdating,
}: JobCardProProps) {
  const [showMenu, setShowMenu] = useState(false);

  const canToggleReview =
    job.status === 'completed' && !job.requestHumanReview;
  
  const showReviewToggle =
    job.status === 'completed' ||
    job.status === 'pending_review' ||
    job.status === 'in_review' ||
    job.status === 'verified';

  return (
    <div className="group bg-brand-dark-card border border-brand-dark-border rounded-xl p-5 hover:border-brand-dark-tertiary transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
          <FileAudio className="h-6 w-6 text-brand-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-white truncate pr-4">
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

            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-brand-dark-tertiary text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-brand-dark-tertiary border border-brand-dark-border rounded-lg shadow-xl z-20 py-1">
                    <button
                      onClick={() => {
                        onView?.(job.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-brand-dark-card hover:text-white transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        onDownload?.(job);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-brand-dark-card hover:text-white transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <hr className="my-1 border-brand-dark-border" />
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this job?')) {
                          onDelete?.(job.id);
                        }
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-brand-dark-card hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(job.createdAt)}</span>
            </div>
            {job.transcript?.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(job.transcript.duration)}</span>
              </div>
            )}
            {job.verifiedAt && (
              <div className="flex items-center gap-1.5 text-green-400">
                <UserCheck className="h-4 w-4" />
                <span>Verified {formatDate(job.verifiedAt)}</span>
              </div>
            )}
          </div>

          {job.transcript && job.status !== 'pending' && job.status !== 'processing' && (
            <p className="mt-3 text-sm text-gray-400 line-clamp-2">
              {job.editedTranscript?.text ||
                job.transcript.text ||
                job.transcript.segments.map((s) => s.text).join(' ').substring(0, 150) + '...'}
            </p>
          )}
        </div>
      </div>

      {showReviewToggle && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-dark-border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Human Review</span>
            <Switch
              checked={job.requestHumanReview}
              onCheckedChange={(checked) => onRequestReviewToggle(job.id, checked)}
              disabled={
                isUpdating ||
                job.status === 'in_review' ||
                job.status === 'verified'
              }
            />
          </div>
          {job.status === 'verified' && (
            <span className="text-xs text-green-400 font-medium">
              Verification Complete
            </span>
          )}
          {(job.status === 'pending_review' || job.status === 'in_review') && (
            <span className="text-xs text-orange-400 font-medium">
              Awaiting Review
            </span>
          )}
        </div>
      )}
    </div>
  );
}

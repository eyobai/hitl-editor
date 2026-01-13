export type UserRole = 'client' | 'editor' | 'admin';

// User model
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export type JobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'pending_review'
  | 'in_review'
  | 'verified';

export interface TranscriptSegment {
  id: number;
  start_time: string;
  end_time: string;
  type: string; // 'male', 'female', etc.
  text: string;
}

export interface Transcript {
  job_id: string;
  status: string;
  duration: number;
  language: string;
  text: string;
  segments: TranscriptSegment[];
}

export interface Job {
  id: string;
  userId: string;
  audioUrl: string;
  audioFileName: string;
  externalJobId?: string; // KI-AVA API job ID
  status: JobStatus;
  requestHumanReview: boolean;
  transcript?: Transcript;
  editedTranscript?: Transcript;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  // KI-AVA specific fields
  processingTime?: number;
  transcriptUrl?: string;
}

export interface TaskLock {
  jobId: string;
  editorId: string;
  editorName: string;
  lockedAt: string;
  expiresAt: string;
}

export interface ReviewTask {
  job: Job;
  lock?: TaskLock;
  isLocked: boolean;
  isLockedByCurrentUser: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'job_completed' | 'review_completed' | 'job_failed';
  message: string;
  jobId: string;
  read: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

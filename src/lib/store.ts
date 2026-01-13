import { Job, User, TaskLock, Notification, JobStatus, Transcript } from './types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

const LOCK_DURATION_MS = 30 * 60 * 1000;

// File-based persistence for development
const STORE_FILE = path.join(process.cwd(), '.store-data.json');

// Store data structure
interface StoreData {
  users: Record<string, User>;
  jobs: Record<string, Job>;
  locks: Record<string, TaskLock>;
  notifications: Record<string, Notification>;
  initialized: boolean;
}

const demoTranscript: Transcript = {
  job_id: 'demo-job-1',
  status: 'COMPLETED',
  duration: 120.5,
  language: 'am',
  text: '',
  segments: [
    { id: 0, start_time: '0.00', end_time: '5.50', type: 'male', text: 'ሰላም ለሁላችሁም። ዛሬ ስለ ቴክኖሎጂ እድገት እንነጋገራለን።' },
    { id: 1, start_time: '5.50', end_time: '12.30', type: 'female', text: 'አዎ፣ ቴክኖሎጂ በፍጥነት እየተለወጠ ነው። የሰው ልጆች ህይወት በጣም ተቀይሯል።' },
    { id: 2, start_time: '12.30', end_time: '20.00', type: 'male', text: 'በተለይ ሰው ሰራሽ አስተውሎት ወይም AI በጣም አድጓል። ብዙ ስራዎችን ያቃልላል።' },
    { id: 3, start_time: '20.00', end_time: '28.50', type: 'female', text: 'እውነት ነው። ነገር ግን ጥንቃቄም ያስፈልጋል። ቴክኖሎጂን በጥበብ መጠቀም አለብን።' },
    { id: 4, start_time: '28.50', end_time: '35.00', type: 'male', text: 'ስለ ተሳተፋችሁ እናመሰግናለን። በሚቀጥለው ጊዜ እንገናኛለን።' },
  ],
};

// Load store from file
function loadStore(): StoreData {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.log('[Store] Error loading, starting fresh');
  }
  return { users: {}, jobs: {}, locks: {}, notifications: {}, initialized: false };
}

// Save store to file
function saveStore(data: StoreData): void {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('[Store] Error saving:', e);
  }
}

// Initialize with demo data
function initializeStore(): void {
  const data = loadStore();
  if (data.initialized) return;

  const sampleAudioUrl = '/Firtuna_poem.mp3';

  data.users = {
    'user-client-1': { id: 'user-client-1', email: 'client@demo.com', name: 'Demo Client', role: 'client', createdAt: new Date().toISOString() },
    'user-editor-1': { id: 'user-editor-1', email: 'editor@demo.com', name: 'Demo Editor', role: 'editor', createdAt: new Date().toISOString() },
    'user-admin-1': { id: 'user-admin-1', email: 'admin@demo.com', name: 'Demo Admin', role: 'admin', createdAt: new Date().toISOString() },
  };

  data.jobs = {
    'demo-job-1': {
      id: 'demo-job-1', userId: 'user-client-1', audioUrl: sampleAudioUrl, audioFileName: 'amharicaudio.mp3',
      status: 'pending_review', requestHumanReview: true, transcript: { ...demoTranscript, job_id: 'demo-job-1' },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'demo-job-2': {
      id: 'demo-job-2', userId: 'user-client-1', audioUrl: sampleAudioUrl, audioFileName: 'news-broadcast-dec-2025.mp3',
      status: 'completed', requestHumanReview: false, transcript: { ...demoTranscript, job_id: 'demo-job-2' },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    'demo-job-3': {
      id: 'demo-job-3', userId: 'user-client-1', audioUrl: sampleAudioUrl, audioFileName: 'interview-special.mp3',
      status: 'pending_review', requestHumanReview: true, transcript: { ...demoTranscript, job_id: 'demo-job-3' },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  };

  data.initialized = true;
  saveStore(data);
  console.log('[Store] Initialized with demo data');
}

// Initialize on module load
initializeStore();

// User operations
export function getUsers(): User[] {
  return Object.values(loadStore().users);
}

export function getUserById(id: string): User | undefined {
  return loadStore().users[id];
}

export function getUserByEmail(email: string): User | undefined {
  return Object.values(loadStore().users).find((u) => u.email === email);
}

// Job operations
export function getJobs(): Job[] {
  const jobs = Object.values(loadStore().jobs);
  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getJobById(id: string): Job | undefined {
  return loadStore().jobs[id];
}

export function getJobsByUserId(userId: string): Job[] {
  return getJobs().filter((job) => job.userId === userId);
}

export function getJobsByStatus(status: JobStatus): Job[] {
  return getJobs().filter((job) => job.status === status);
}

export function getReviewQueue(): Job[] {
  return getJobs().filter((job) => job.status === 'pending_review' || job.status === 'in_review');
}

export function createJob(userId: string, audioUrl: string, audioFileName: string, requestHumanReview: boolean): Job {
  const data = loadStore();
  const job: Job = {
    id: uuidv4(),
    userId,
    audioUrl,
    audioFileName,
    status: requestHumanReview ? 'pending_review' : 'completed',
    requestHumanReview,
    transcript: requestHumanReview ? { ...demoTranscript, job_id: uuidv4() } : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  data.jobs[job.id] = job;
  saveStore(data);
  return job;
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const data = loadStore();
  const job = data.jobs[id];
  if (!job) return undefined;

  const updatedJob = { ...job, ...updates, updatedAt: new Date().toISOString() };
  data.jobs[id] = updatedJob;
  saveStore(data);
  return updatedJob;
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  return updateJob(id, { status });
}

export function deleteJob(id: string): boolean {
  const data = loadStore();
  if (!data.jobs[id]) return false;
  delete data.jobs[id];
  // Also delete any associated lock
  delete data.locks[id];
  saveStore(data);
  return true;
}

// Lock operations
export function getLocks(): TaskLock[] {
  const data = loadStore();
  const now = new Date();
  let changed = false;
  
  // Clean up expired locks
  Object.keys(data.locks).forEach((jobId) => {
    if (new Date(data.locks[jobId].expiresAt) < now) {
      delete data.locks[jobId];
      changed = true;
    }
  });
  
  if (changed) saveStore(data);
  return Object.values(data.locks);
}

export function getLockByJobId(jobId: string): TaskLock | undefined {
  const data = loadStore();
  const lock = data.locks[jobId];
  if (lock && new Date(lock.expiresAt) < new Date()) {
    delete data.locks[jobId];
    saveStore(data);
    return undefined;
  }
  return lock;
}

export function acquireLock(jobId: string, editorId: string, editorName: string): TaskLock | null {
  const existingLock = getLockByJobId(jobId);
  if (existingLock && existingLock.editorId !== editorId) {
    return null;
  }

  const data = loadStore();
  const lock: TaskLock = {
    jobId,
    editorId,
    editorName,
    lockedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + LOCK_DURATION_MS).toISOString(),
  };

  data.locks[jobId] = lock;
  
  // Update job status to in_review
  if (data.jobs[jobId]) {
    data.jobs[jobId] = { ...data.jobs[jobId], status: 'in_review', updatedAt: new Date().toISOString() };
  }
  
  saveStore(data);
  console.log('[acquireLock] Job', jobId, 'status updated to in_review');
  return lock;
}

export function releaseLock(jobId: string, editorId: string): boolean {
  const data = loadStore();
  const lock = data.locks[jobId];
  if (!lock || lock.editorId !== editorId) {
    return false;
  }

  delete data.locks[jobId];

  // Return job to pending_review if not verified
  const job = data.jobs[jobId];
  if (job && job.status === 'in_review') {
    data.jobs[jobId] = { ...job, status: 'pending_review', updatedAt: new Date().toISOString() };
  }

  saveStore(data);
  return true;
}

export function refreshLock(jobId: string, editorId: string): TaskLock | null {
  const data = loadStore();
  const lock = data.locks[jobId];
  if (!lock || lock.editorId !== editorId) {
    return null;
  }

  lock.expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  data.locks[jobId] = lock;
  saveStore(data);
  return lock;
}

// Notification operations
export function getNotificationsByUserId(userId: string): Notification[] {
  return Object.values(loadStore().notifications)
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createNotification(userId: string, type: Notification['type'], message: string, jobId: string): Notification {
  const data = loadStore();
  const notification: Notification = {
    id: uuidv4(),
    userId,
    type,
    message,
    jobId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  data.notifications[notification.id] = notification;
  saveStore(data);
  return notification;
}

export function markNotificationAsRead(id: string): boolean {
  const data = loadStore();
  const notification = data.notifications[id];
  if (!notification) return false;
  notification.read = true;
  data.notifications[id] = notification;
  saveStore(data);
  return true;
}

// Verification
export function verifyJob(jobId: string, editorId: string, editedTranscript?: Transcript): Job | undefined {
  const data = loadStore();
  const job = data.jobs[jobId];
  if (!job) return undefined;

  // Release lock
  delete data.locks[jobId];

  // Update job
  const updatedJob: Job = {
    ...job,
    status: 'verified',
    verifiedAt: new Date().toISOString(),
    verifiedBy: editorId,
    updatedAt: new Date().toISOString(),
  };

  if (editedTranscript) {
    updatedJob.editedTranscript = editedTranscript;
  }

  data.jobs[jobId] = updatedJob;

  // Notify client
  const notification: Notification = {
    id: uuidv4(),
    userId: job.userId,
    type: 'review_completed',
    message: `Your transcription for "${job.audioFileName}" has been verified.`,
    jobId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  data.notifications[notification.id] = notification;

  saveStore(data);
  return updatedJob;
}

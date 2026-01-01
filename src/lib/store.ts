import { Job, User, TaskLock, Notification, JobStatus, Transcript } from './types';
import { v4 as uuidv4 } from 'uuid';

const LOCK_DURATION_MS = 30 * 60 * 1000;

const store = {
  users: new Map<string, User>(),
  jobs: new Map<string, Job>(),
  locks: new Map<string, TaskLock>(),
  notifications: new Map<string, Notification>(),
};

const demoTranscript: Transcript = {
  job_id: 'demo-job-1',
  status: 'COMPLETED',
  duration: 120.5,
  language: 'am',
  text: '',
  segments: [
    {
      id: 0,
      start_time: '0.00',
      end_time: '5.50',
      type: 'male',
      text: 'ጤና ይስጥልኝ ወደ ዛሬው ፕሮግራም እንኳን በደህና መጡ።',
    },
    {
      id: 1,
      start_time: '5.50',
      end_time: '12.30',
      type: 'female',
      text: 'በጣም ደስ ይላል ዛሬ ከእናንተ ጋር መሆን። የዛሬው ርዕሳችን ስለ ጤና ጥበቃ ነው።',
    },
    {
      id: 2,
      start_time: '12.30',
      end_time: '20.00',
      type: 'male',
      text: 'አዎ፣ ጤና በጣም አስፈላጊ ጉዳይ ነው። ሁላችንም ስለ ጤናችን ማሰብ አለብን።',
    },
    {
      id: 3,
      start_time: '20.00',
      end_time: '28.50',
      type: 'female',
      text: 'ትክክል ነው። በተለይ በዚህ ዘመን የአመጋገብ ልማዳችንን መከታተል ወሳኝ ነው።',
    },
    {
      id: 4,
      start_time: '28.50',
      end_time: '35.00',
      type: 'male',
      text: 'እናመሰግናለን ላደመጡን። በሚቀጥለው ሳምንት እንገናኛለን።',
    },
  ],
};

// initialize store with demo data
function initializeStore() {
  const demoUsers: User[] = [
    {
      id: 'user-client-1',
      email: 'client@demo.com',
      name: 'Demo Client',
      role: 'client',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-editor-1',
      email: 'editor@demo.com',
      name: 'Demo Editor',
      role: 'editor',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-admin-1',
      email: 'admin@demo.com',
      name: 'Demo Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ];

  const demoJobs: Job[] = [
    {
      id: 'demo-job-1',
      userId: 'user-client-1',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      audioFileName: 'health-program-episode-1.mp3',
      status: 'pending_review',
      requestHumanReview: true,
      transcript: demoTranscript,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-job-2',
      userId: 'user-client-1',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      audioFileName: 'news-broadcast-dec-2025.mp3',
      status: 'completed',
      requestHumanReview: false,
      transcript: { ...demoTranscript, job_id: 'demo-job-2' },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-job-3',
      userId: 'user-client-1',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      audioFileName: 'interview-special.mp3',
      status: 'pending_review',
      requestHumanReview: true,
      transcript: { ...demoTranscript, job_id: 'demo-job-3' },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  demoUsers.forEach((user) => store.users.set(user.id, user));
  demoJobs.forEach((job) => store.jobs.set(job.id, job));
}

// initialize on module load
initializeStore();

// user operations

export function getUsers(): User[] {
  return Array.from(store.users.values());
}

export function getUserById(id: string): User | undefined {
  return store.users.get(id);
}

export function getUserByEmail(email: string): User | undefined {
  return Array.from(store.users.values()).find((u) => u.email === email);
}

// job operations

export function getJobs(): Job[] {
  return Array.from(store.jobs.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getJobById(id: string): Job | undefined {
  return store.jobs.get(id);
}

export function getJobsByUserId(userId: string): Job[] {
  return getJobs().filter((job) => job.userId === userId);
}

export function getJobsByStatus(status: JobStatus): Job[] {
  return getJobs().filter((job) => job.status === status);
}

export function getReviewQueue(): Job[] {
  return getJobs().filter(
    (job) => job.status === 'pending_review' || job.status === 'in_review'
  );
}

export function createJob(
  userId: string,
  audioUrl: string,
  audioFileName: string,
  requestHumanReview: boolean
): Job {
  const job: Job = {
    id: uuidv4(),
    userId,
    audioUrl,
    audioFileName,
    status: 'pending',
    requestHumanReview,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.jobs.set(job.id, job);
  return job;
}

export function updateJob(id: string, updates: Partial<Job>): Job | undefined {
  const job = store.jobs.get(id);
  if (!job) return undefined;

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  store.jobs.set(id, updatedJob);
  return updatedJob;
}

export function updateJobStatus(id: string, status: JobStatus): Job | undefined {
  return updateJob(id, { status });
}

// lock operations

export function getLocks(): TaskLock[] {
  // Clean up expired locks first
  const now = new Date();
  store.locks.forEach((lock, jobId) => {
    if (new Date(lock.expiresAt) < now) {
      store.locks.delete(jobId);
    }
  });
  return Array.from(store.locks.values());
}

export function getLockByJobId(jobId: string): TaskLock | undefined {
  const lock = store.locks.get(jobId);
  if (lock && new Date(lock.expiresAt) < new Date()) {
    store.locks.delete(jobId);
    return undefined;
  }
  return lock;
}

export function acquireLock(
  jobId: string,
  editorId: string,
  editorName: string
): TaskLock | null {
  const existingLock = getLockByJobId(jobId);

  // Already locked by someone else
  if (existingLock && existingLock.editorId !== editorId) {
    return null;
  }

  const lock: TaskLock = {
    jobId,
    editorId,
    editorName,
    lockedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + LOCK_DURATION_MS).toISOString(),
  };

  store.locks.set(jobId, lock);
  updateJobStatus(jobId, 'in_review');

  return lock;
}

export function releaseLock(jobId: string, editorId: string): boolean {
  const lock = getLockByJobId(jobId);
  if (!lock || lock.editorId !== editorId) {
    return false;
  }

  store.locks.delete(jobId);

  // Return job to pending_review if not verified
  const job = getJobById(jobId);
  if (job && job.status === 'in_review') {
    updateJobStatus(jobId, 'pending_review');
  }

  return true;
}

export function refreshLock(jobId: string, editorId: string): TaskLock | null {
  const lock = getLockByJobId(jobId);
  if (!lock || lock.editorId !== editorId) {
    return null;
  }

  lock.expiresAt = new Date(Date.now() + LOCK_DURATION_MS).toISOString();
  store.locks.set(jobId, lock);
  return lock;
}

// verification operations

export function getNotificationsByUserId(userId: string): Notification[] {
  return Array.from(store.notifications.values())
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createNotification(
  userId: string,
  type: Notification['type'],
  message: string,
  jobId: string
): Notification {
  const notification: Notification = {
    id: uuidv4(),
    userId,
    type,
    message,
    jobId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  store.notifications.set(notification.id, notification);
  return notification;
}

export function markNotificationAsRead(id: string): boolean {
  const notification = store.notifications.get(id);
  if (!notification) return false;
  notification.read = true;
  return true;
}

//verification

export function verifyJob(
  jobId: string,
  editorId: string,
  editedTranscript?: Transcript
): Job | undefined {
  const job = getJobById(jobId);
  if (!job) return undefined;

  const updates: Partial<Job> = {
    status: 'verified',
    verifiedAt: new Date().toISOString(),
    verifiedBy: editorId,
  };

  if (editedTranscript) {
    updates.editedTranscript = editedTranscript;
  }
  
  releaseLock(jobId, editorId);

  const updatedJob = updateJob(jobId, updates);

  // Notify the client
  if (updatedJob) {
    createNotification(
      job.userId,
      'review_completed',
      `Your transcription for "${job.audioFileName}" has been verified.`,
      jobId
    );
  }

  return updatedJob;
}

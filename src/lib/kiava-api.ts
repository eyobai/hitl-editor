// KI-AVA Amharic Transcription API Service
// API Docs: https://kiava-api.lesan.ai/docs

const KIAVA_API_BASE = 'https://kiava-api.lesan.ai';

export interface KiavaTranscriptionRequest {
  audio_urls: string[];
  language?: string; // defaults to 'am' for Amharic
}

export interface KiavaJobResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
}

export interface KiavaTranscriptSegment {
  id: number;
  start_time: string;
  end_time: string;
  type: string; // 'male', 'female', etc.
  text: string;
}

export interface KiavaTranscriptResult {
  job_id: string;
  status: string;
  duration: number;
  language: string;
  text: string;
  segments: KiavaTranscriptSegment[];
}

export interface KiavaJobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transcript_urls: string[] | null;
  results: {
    original_url: string;
    status: string;
    transcript_url: string;
    error: string | null;
    processing_time: number;
    duration: number;
    num_segments: number;
  }[] | null;
  error: string | null;
  submitted_at: string;
  completed_at: string | null;
  processing_time: number | null;
}

class KiavaApiService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${KIAVA_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`KI-AVA API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Submit a transcription job
  async submitTranscriptionJob(
    audioUrls: string[],
    language: string = 'am'
  ): Promise<KiavaJobResponse> {
    return this.request<KiavaJobResponse>('/transcribe', {
      method: 'POST',
      body: JSON.stringify({
        audio_urls: audioUrls,
        language,
      }),
    });
  }

  // Check job status
  async getJobStatus(jobId: string): Promise<KiavaJobStatusResponse> {
    return this.request<KiavaJobStatusResponse>(`/transcribe/${jobId}`);
  }

  // Fetch transcript from signed URL
  async fetchTranscript(transcriptUrl: string): Promise<KiavaTranscriptResult> {
    const response = await fetch(transcriptUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch transcript: ${response.status}`);
    }
    return response.json();
  }

  // Poll for job completion with timeout
  async waitForCompletion(
    jobId: string,
    maxWaitMs: number = 300000, // 5 minutes default
    pollIntervalMs: number = 5000 // 5 seconds
  ): Promise<KiavaJobStatusResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      const status = await this.getJobStatus(jobId);

      if (status.status === 'completed') {
        return status;
      }

      if (status.status === 'failed') {
        throw new Error(`Transcription job failed: ${status.error}`);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
    }

    throw new Error('Transcription job timed out');
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }

  // Get available languages
  async getLanguages(): Promise<string[]> {
    return this.request<string[]>('/languages');
  }

  // Get usage statistics
  async getUsage(): Promise<Record<string, unknown>> {
    return this.request<Record<string, unknown>>('/usage');
  }
}

// Singleton instance - API key should be set via environment variable
let kiavaInstance: KiavaApiService | null = null;

export function getKiavaApi(): KiavaApiService {
  const apiKey = process.env.KIAVA_API_KEY;
  
  if (!apiKey) {
    throw new Error('KIAVA_API_KEY environment variable is not set');
  }

  if (!kiavaInstance) {
    kiavaInstance = new KiavaApiService(apiKey);
  }

  return kiavaInstance;
}

// For cases where API key is provided directly (e.g., from client)
export function createKiavaApi(apiKey: string): KiavaApiService {
  return new KiavaApiService(apiKey);
}

export default KiavaApiService;

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Link as LinkIcon, Loader2, FileAudio } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (audioUrl: string, audioFileName: string, requestHumanReview: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export function NewJobModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: NewJobModalProps) {
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [requestHumanReview, setRequestHumanReview] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl.trim() || !audioFileName.trim()) return;

    await onSubmit(audioUrl.trim(), audioFileName.trim(), requestHumanReview);

    // Reset form
    setAudioUrl('');
    setAudioFileName('');
    setRequestHumanReview(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Transcription Job"
      description="Submit an audio file for transcription"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-brand-dark-border rounded-xl p-8 text-center hover:border-brand-primary/50 transition-colors cursor-pointer">
          <div className="w-14 h-14 mx-auto rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-7 w-7 text-brand-primary" />
          </div>
          <p className="text-sm text-gray-300">
            Drag and drop your audio file here, or
          </p>
          <p className="text-sm text-brand-primary mt-1">browse files</p>
          <p className="text-xs text-gray-500 mt-2">
            Supports MP3, WAV, M4A up to 500MB
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-dark-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-brand-dark-card px-2 text-gray-500">or use URL</span>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="audioUrl" className="text-gray-300">Audio URL</Label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="audioUrl"
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* File Name */}
        <div className="space-y-2">
          <Label htmlFor="audioFileName" className="text-gray-300">File Name</Label>
          <div className="relative">
            <FileAudio className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="audioFileName"
              type="text"
              placeholder="my-audio-file.mp3"
              value={audioFileName}
              onChange={(e) => setAudioFileName(e.target.value)}
              className="pl-10"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Human Review Toggle */}
        <div className="flex items-center justify-between p-4 bg-brand-dark-tertiary rounded-xl">
          <div>
            <p className="text-sm font-medium text-gray-200">Request Human Review</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Have an editor verify the transcription for accuracy
            </p>
          </div>
          <Switch
            checked={requestHumanReview}
            onCheckedChange={setRequestHumanReview}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !audioUrl.trim() || !audioFileName.trim()}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Job'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

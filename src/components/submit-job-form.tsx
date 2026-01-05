'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2 } from 'lucide-react';

interface SubmitJobFormProps {
  onSubmit: (audioUrl: string, audioFileName: string, requestHumanReview: boolean) => Promise<void>;
  isSubmitting: boolean;
}

export function SubmitJobForm({ onSubmit, isSubmitting }: SubmitJobFormProps) {
  const [audioUrl, setAudioUrl] = useState('');
  const [audioFileName, setAudioFileName] = useState('');
  const [requestHumanReview, setRequestHumanReview] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl.trim() || !audioFileName.trim()) return;

    await onSubmit(audioUrl.trim(), audioFileName.trim(), requestHumanReview);
    
    // Reset form
    setAudioUrl('');
    setAudioFileName('');
    setRequestHumanReview(false);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Submit New Job
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Submit New Transcription Job</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL</Label>
            <Input
              id="audioUrl"
              type="url"
              placeholder="https://example.com/audio.mp3"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              Enter a publicly accessible URL to your audio file
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioFileName">File Name</Label>
            <Input
              id="audioFileName"
              type="text"
              placeholder="my-audio-file.mp3"
              value={audioFileName}
              onChange={(e) => setAudioFileName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="requestReview" className="cursor-pointer">
                Request Human Review
              </Label>
              <p className="text-xs text-gray-500 mt-0.5">
                Have an editor verify the transcription
              </p>
            </div>
            <Switch
              id="requestReview"
              checked={requestHumanReview}
              onCheckedChange={setRequestHumanReview}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
      </CardContent>
    </Card>
  );
}

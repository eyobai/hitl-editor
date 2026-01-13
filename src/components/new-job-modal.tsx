'use client';

import { useState, useRef } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Upload, Link as LinkIcon, Loader2, FileAudio, X, Youtube } from 'lucide-react';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isDownloadingYoutube, setIsDownloadingYoutube] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'youtube' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeDownload = async () => {
    if (!youtubeUrl.trim()) return;
    
    setIsDownloadingYoutube(true);
    try {
      const response = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: youtubeUrl.trim() }),
      });
      const result = await response.json();
      
      if (result.success) {
        setAudioUrl(result.data.audioUrl);
        setAudioFileName(result.data.audioFileName);
      } else {
        alert(result.error || 'Failed to download YouTube audio');
      }
    } catch (error) {
      console.error('YouTube download error:', error);
      alert('Failed to download audio from YouTube');
    } finally {
      setIsDownloadingYoutube(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAudioFileName(file.name);
      // Create a local URL for the file
      const fileUrl = URL.createObjectURL(file);
      setAudioUrl(fileUrl);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedFile(file);
      setAudioFileName(file.name);
      const fileUrl = URL.createObjectURL(file);
      setAudioUrl(fileUrl);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setAudioUrl('');
    setAudioFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioUrl.trim() || !audioFileName.trim()) return;

    await onSubmit(audioUrl.trim(), audioFileName.trim(), requestHumanReview);

    setAudioUrl('');
    setAudioFileName('');
    setRequestHumanReview(false);
    setSelectedFile(null);
    setYoutubeUrl('');
    setInputMode('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="flex gap-2 p-1 bg-brand-dark-tertiary rounded-lg">
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'file'
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            File
          </button>
          {/* <button
            type="button"
            onClick={() => setInputMode('youtube')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'youtube'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Youtube className="h-4 w-4" />
            YouTube
          </button> */}
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-brand-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            URL
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isSubmitting}
        />
        {inputMode === 'file' && (
          <>
            {selectedFile ? (
              <div className="border-2 border-brand-primary/50 bg-brand-primary/5 rounded-xl p-6 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <FileAudio className="h-6 w-6 text-brand-primary" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedFile}
                    className="p-2 hover:bg-brand-dark-tertiary rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-brand-dark-border rounded-xl p-8 text-center hover:border-brand-primary/50 transition-colors cursor-pointer"
              >
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
            )}
          </>
        )}

        {inputMode === 'youtube' && (
          <div className="space-y-4">
            {audioUrl ? (
              <div className="border-2 border-green-500/50 bg-green-500/5 rounded-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <FileAudio className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{audioFileName}</p>
                    <p className="text-xs text-green-400">Audio extracted successfully</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioUrl('');
                      setAudioFileName('');
                      setYoutubeUrl('');
                    }}
                    className="p-2 hover:bg-brand-dark-tertiary rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="youtubeUrl" className="text-gray-300">YouTube URL</Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input
                      id="youtubeUrl"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="pl-10"
                      disabled={isDownloadingYoutube}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleYoutubeDownload}
                  disabled={!youtubeUrl.trim() || isDownloadingYoutube}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isDownloadingYoutube ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Extracting Audio...
                    </>
                  ) : (
                    <>
                      <Youtube className="h-4 w-4 mr-2" />
                      Extract Audio from YouTube
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Audio will be extracted and saved for transcription
                </p>
              </>
            )}
          </div>
        )}

        {inputMode === 'url' && (
          <>
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
          </>
        )}

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

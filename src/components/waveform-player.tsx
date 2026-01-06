'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
} from 'lucide-react';

interface WaveformPlayerProps {
  audioUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onReady?: (duration: number) => void;
  onSeek?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function WaveformPlayer({
  audioUrl,
  onTimeUpdate,
  onReady,
  onSeek,
}: WaveformPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    let isActive = true;
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#4B5563',
      progressColor: '#10B981',
      cursorColor: '#10B981',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on('ready', () => {
      if (!isActive) return;
      setIsLoading(false);
      const dur = wavesurfer.getDuration();
      setDuration(dur);
      onReady?.(dur);
    });

    wavesurfer.on('audioprocess', () => {
      if (!isActive) return;
      const time = wavesurfer.getCurrentTime();
      setCurrentTime(time);
      onTimeUpdate?.(time);
    });

    wavesurfer.on('seeking', () => {
      if (!isActive) return;
      const time = wavesurfer.getCurrentTime();
      setCurrentTime(time);
      onSeek?.(time);
    });

    wavesurfer.on('play', () => isActive && setIsPlaying(true));
    wavesurfer.on('pause', () => isActive && setIsPlaying(false));
    wavesurfer.on('finish', () => isActive && setIsPlaying(false));

    wavesurfer.on('error', (error) => {
      if (!isActive) return;
      console.error('WaveSurfer error:', error);
      setIsLoading(false);
    });

    wavesurfer.load(audioUrl);

    return () => {
      isActive = false;
      wavesurferRef.current = null;
      try {
        wavesurfer.destroy();
      } catch (e) {
        // Ignore errors during cleanup
      }
    };
  }, [audioUrl, onTimeUpdate, onReady, onSeek]);

  const togglePlayPause = useCallback(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }, []);

  const skipBackward = useCallback(() => {
    if (wavesurferRef.current) {
      const newTime = Math.max(0, wavesurferRef.current.getCurrentTime() - 5);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  }, [duration]);

  const skipForward = useCallback(() => {
    if (wavesurferRef.current) {
      const newTime = Math.min(duration, wavesurferRef.current.getCurrentTime() + 5);
      wavesurferRef.current.seekTo(newTime / duration);
    }
  }, [duration]);

  const toggleMute = useCallback(() => {
    if (wavesurferRef.current) {
      if (isMuted) {
        wavesurferRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        wavesurferRef.current.setVolume(0);
        setIsMuted(true);
      }
    }
  }, [isMuted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(newVolume);
    }
    if (newVolume > 0) {
      setIsMuted(false);
    }
  }, []);

  // Expose seekTo method for external use
  const seekTo = useCallback((time: number) => {
    if (wavesurferRef.current && duration > 0) {
      wavesurferRef.current.seekTo(time / duration);
    }
  }, [duration]);

  // Attach seekTo to the component instance via ref callback
  useEffect(() => {
    (window as any).__waveformSeekTo = seekTo;
    return () => {
      delete (window as any).__waveformSeekTo;
    };
  }, [seekTo]);

  return (
    <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl p-4">
      {/* Waveform Container */}
      <div className="relative mb-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-dark-card rounded-lg z-10">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading audio...</span>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          className="w-full rounded-lg bg-brand-dark-tertiary/50 cursor-pointer"
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        {/* Time Display */}
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-white">{formatTime(currentTime)}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400">{formatTime(duration)}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipBackward}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-10 h-10 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={skipForward}
            disabled={isLoading}
            className="text-gray-400 hover:text-white"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="text-gray-400 hover:text-white"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-brand-dark-tertiary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-primary"
          />
        </div>
      </div>
    </div>
  );
}

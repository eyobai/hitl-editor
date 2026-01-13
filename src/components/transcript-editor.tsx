'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TranscriptSegment } from '@/lib/types';
import { Clock, User, Edit3, Check, X } from 'lucide-react';

interface TranscriptEditorProps {
  segments: TranscriptSegment[];
  currentTime: number;
  onSeek: (time: number) => void;
  onSegmentUpdate?: (segmentId: number, newText: string) => void;
  editable?: boolean;
}

function formatTimestamp(seconds: string | number): string {
  const secs = typeof seconds === 'string' ? parseFloat(seconds) : seconds;
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
}

function parseTimestamp(timestamp: string): number {
  return parseFloat(timestamp);
}

export function TranscriptEditor({
  segments,
  currentTime,
  onSeek,
  onSegmentUpdate,
  editable = true,
}: TranscriptEditorProps) {
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [localSegments, setLocalSegments] = useState<TranscriptSegment[]>(segments);
  const activeSegmentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update local segments when props change
  useEffect(() => {
    setLocalSegments(segments);
  }, [segments]);

  // Find the current active segment based on playback time
  const activeSegmentId = localSegments.find((segment) => {
    const startTime = parseTimestamp(segment.start_time);
    const endTime = parseTimestamp(segment.end_time);
    return currentTime >= startTime && currentTime < endTime;
  })?.id;

  // Auto-scroll to active segment during playback
  useEffect(() => {
    if (activeSegmentRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeSegmentRef.current;
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();

      // Check if element is outside visible area
      if (
        elementRect.top < containerRect.top ||
        elementRect.bottom > containerRect.bottom
      ) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSegmentId]);

  const handleSegmentClick = useCallback(
    (segment: TranscriptSegment) => {
      if (editingSegmentId !== null) return; // Don't seek while editing
      const startTime = parseTimestamp(segment.start_time);
      onSeek(startTime);
    },
    [onSeek, editingSegmentId]
  );

  const handleStartEdit = useCallback(
    (segment: TranscriptSegment, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingSegmentId(segment.id);
      setEditText(segment.text);
    },
    []
  );

  const handleSaveEdit = useCallback(
    (segmentId: number) => {
      // Update local state
      setLocalSegments((prev) =>
        prev.map((seg) =>
          seg.id === segmentId ? { ...seg, text: editText } : seg
        )
      );
      // Notify parent
      onSegmentUpdate?.(segmentId, editText);
      setEditingSegmentId(null);
      setEditText('');
    },
    [editText, onSegmentUpdate]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingSegmentId(null);
    setEditText('');
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, segmentId: number) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit(segmentId);
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const getSpeakerColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'male':
        return 'text-blue-400 bg-blue-500/10';
      case 'female':
        return 'text-pink-400 bg-pink-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="bg-brand-dark-card border border-brand-dark-border rounded-xl">
      <div className="p-4 border-b border-brand-dark-border">
        <h2 className="text-lg font-semibold text-white">Transcript</h2>
        <p className="text-sm text-gray-400 mt-1">
          Click a segment to jump to that position. {editable && 'Double-click or click edit to modify text.'}
        </p>
      </div>

      <div
        ref={containerRef}
        className="max-h-[500px] overflow-y-auto p-4 space-y-3"
      >
        {localSegments.map((segment) => {
          const isActive = segment.id === activeSegmentId;
          const isEditing = segment.id === editingSegmentId;
          const startTime = parseTimestamp(segment.start_time);
          const endTime = parseTimestamp(segment.end_time);

          return (
            <div
              key={segment.id}
              ref={isActive ? activeSegmentRef : null}
              onClick={() => handleSegmentClick(segment)}
              className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg shadow-brand-primary/10'
                  : 'bg-brand-dark-tertiary/30 border-transparent hover:border-brand-dark-border hover:bg-brand-dark-tertiary/50'
              }`}
            >
              {/* Header: Timestamp and Speaker */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Timestamp */}
                  <div className="flex items-center gap-1.5 text-xs font-mono">
                    <Clock className={`h-3 w-3 ${isActive ? 'text-brand-primary' : 'text-gray-500'}`} />
                    <span className={isActive ? 'text-brand-primary' : 'text-gray-500'}>
                      {formatTimestamp(startTime)} - {formatTimestamp(endTime)}
                    </span>
                  </div>

                  {/* Speaker Badge - commented out for now
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getSpeakerColor(
                      segment.type
                    )}`}
                  >
                    <User className="h-3 w-3" />
                    <span className="capitalize">{segment.type}</span>
                  </div>
                  */}
                </div>

                {/* Edit Button */}
                {editable && !isEditing && (
                  <button
                    onClick={(e) => handleStartEdit(segment, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-brand-dark-border transition-all"
                  >
                    <Edit3 className="h-4 w-4 text-gray-400 hover:text-white" />
                  </button>
                )}
              </div>

              {/* Content */}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, segment.id)}
                    autoFocus
                    className="w-full p-3 bg-brand-dark border border-brand-dark-border rounded-lg text-gray-200 text-sm resize-none focus:outline-none focus:border-brand-primary"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSaveEdit(segment.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-sm rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-dark-border text-gray-300 text-sm rounded-lg hover:bg-brand-dark-tertiary transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <span className="text-xs text-gray-500 ml-2">
                      Enter to save, Esc to cancel
                    </span>
                  </div>
                </div>
              ) : (
                <p
                  className={`text-sm leading-relaxed ${
                    isActive ? 'text-white' : 'text-gray-300'
                  }`}
                  onDoubleClick={(e) => editable && handleStartEdit(segment, e as any)}
                >
                  {segment.text}
                </p>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-primary rounded-r" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

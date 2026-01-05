'use client';

import { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Notification } from '@/lib/types';
import { NotificationsDropdown } from '@/components/notifications-dropdown';

interface HeaderProps {
  title: string;
  subtitle?: string;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  showNewJobButton?: boolean;
  onNewJob?: () => void;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
}

export function Header({
  title,
  subtitle,
  notifications,
  onMarkNotificationRead,
  showNewJobButton,
  onNewJob,
  searchPlaceholder = 'Search...',
  onSearch,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 bg-brand-dark-secondary border-b border-brand-dark-border px-6 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-xl font-semibold text-white">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="w-64 pl-9 bg-brand-dark-tertiary border-brand-dark-border"
            />
          </div>
        )}

        {/* New Job Button */}
        {showNewJobButton && (
          <Button onClick={onNewJob} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Job
          </Button>
        )}

        {/* Notifications */}
        <NotificationsDropdown
          notifications={notifications}
          onMarkAsRead={onMarkNotificationRead}
        />
      </div>
    </header>
  );
}

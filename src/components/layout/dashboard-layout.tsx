'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'client' | 'editor';
  userName: string;
  userEmail: string;
}

export function DashboardLayout({
  children,
  userRole,
  userName,
  userEmail,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-dark">
      <Sidebar userRole={userRole} userName={userName} userEmail={userEmail} />
      <main className="ml-64 min-h-screen transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

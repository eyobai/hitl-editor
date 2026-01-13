'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  FileAudio,
  LayoutDashboard,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  userRole: 'client' | 'editor';
  userName: string;
  userEmail: string;
}

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const clientNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/client', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Jobs', href: '/client/jobs', icon: <FolderOpen className="h-5 w-5" /> },
    //{ label: 'Settings', href: '/client/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const editorNavItems: NavItem[] = [
    { label: 'Task Queue', href: '/editor', icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: 'My Reviews', href: '/editor/reviews', icon: <FolderOpen className="h-5 w-5" /> },
  //  { label: 'Settings', href: '/editor/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  const navItems = userRole === 'client' ? clientNavItems : editorNavItems;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-brand-dark-secondary border-r border-brand-dark-border flex flex-col transition-all duration-300 z-50',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-dark-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <FileAudio className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-white">Lesan AI</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-brand-dark-tertiary text-gray-400 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-400 hover:bg-brand-dark-tertiary hover:text-white'
              )}
            >
              {item.icon}
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

    

      {/* User Profile */}
      <div className="p-3 border-t border-brand-dark-border">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-brand-dark-tertiary transition-colors cursor-pointer',
            collapsed && 'justify-center'
          )}
        >
          <div className="w-9 h-9 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-brand-primary">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userEmail}</p>
            </div>
          )}
          {!collapsed && (
            <button className="p-1.5 rounded-lg hover:bg-brand-dark-border text-gray-400 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

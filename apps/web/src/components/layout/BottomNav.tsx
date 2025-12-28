/**
 * Mobile Bottom Navigation Bar
 * Displays navigation for mobile devices (< 768px)
 */

import { Link, useRouterState } from '@tanstack/react-router';
import { MessageSquare, ListTodo, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  to: '/chat' | '/tasks' | '/settings';
  icon: typeof MessageSquare;
}

const navItems: NavItem[] = [
  { label: 'Tasks', to: '/tasks', icon: ListTodo },
  { label: 'Chat', to: '/chat', icon: MessageSquare },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.to);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

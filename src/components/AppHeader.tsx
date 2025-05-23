
"use client";

import Link from 'next/link';
import { Home, User, ShieldCheck, LogIn, LogOut, Aperture } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export function AppHeader() {
  const pathname = usePathname();
  const { isAuthenticated, userRole, userName, logout, isLoadingAuth } = useAuth();

  const navItems = [
    { href: '/', label: 'Attendance', icon: Home, public: true },
    { href: '/student-dashboard', label: 'Student', icon: User, roles: ['student'] as const },
    { href: '/dashboard', label: 'Admin', icon: ShieldCheck, roles: ['admin'] as const },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary">
          <Aperture className="h-7 w-7" />
          <span>AttendAI</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const canShow = item.public || (isAuthenticated && item.roles && userRole && item.roles.includes(userRole));
            if (isLoadingAuth && !item.public) { // Don't show auth links while loading
              return <Skeleton key={item.href} className="h-8 w-20 rounded-md sm:w-24" />;
            }
            if (canShow) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            }
            return null;
          })}

          {isLoadingAuth ? (
             <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
                <Skeleton className="h-8 w-24 rounded-md hidden md:inline" />
                <Skeleton className="h-8 w-20 rounded-md" />
             </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4">
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline capitalize">
                Hi, {userName} <span className="text-xs">({userRole})</span>
              </span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
               <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                <Link href="/login/student">
                  <User className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Student</span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="px-2 sm:px-3">
                <Link href="/login/admin">
                  <ShieldCheck className="h-4 w-4 sm:mr-1" /> <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

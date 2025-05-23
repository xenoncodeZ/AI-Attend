
'use client';

import React, { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from './ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: Array<'admin' | 'student'>;
  // Default redirectPath is determined by role if not provided
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, userRole, isLoadingAuth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoadingAuth) {
      return; // Wait for auth state to be loaded
    }

    if (!isAuthenticated) {
      const loginPath = allowedRoles.includes('admin') ? '/login/admin' : '/login/student';
      router.replace(`${loginPath}?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (userRole && !allowedRoles.includes(userRole)) {
      // User is authenticated but does not have the required role
      // Redirect to their own dashboard or home if no specific dashboard.
      const homePath = userRole === 'admin' ? '/dashboard' : userRole === 'student' ? '/student-dashboard' : '/';
      router.replace(homePath); // Or a dedicated 'access-denied' page
    }
    
  }, [isAuthenticated, userRole, isLoadingAuth, router, allowedRoles, pathname]);

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Loading Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
     // This state should ideally be brief as useEffect redirects.
     // Showing a more explicit message if redirection is slow or fails.
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] space-y-4 p-4">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>You need to be logged in to view this page.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.replace(allowedRoles.includes('admin') ? `/login/admin?redirect=${encodeURIComponent(pathname)}` : `/login/student?redirect=${encodeURIComponent(pathname)}`)}>
                    Go to Login
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (userRole && !allowedRoles.includes(userRole)) {
    // This state should also be brief.
    return (
       <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] space-y-4 p-4">
         <Card className="w-full max-w-md text-center">
            <CardHeader>
                <CardTitle>Permission Denied</CardTitle>
                <CardDescription>You do not have the necessary permissions to view this page.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Button onClick={() => router.replace('/')}>Go to Homepage</Button>
            </CardContent>
        </Card>
       </div>
    );
  }

  // If authenticated and has the correct role (or still loading but checks passed initial phase)
  return <>{children}</>;
};

export default ProtectedRoute;

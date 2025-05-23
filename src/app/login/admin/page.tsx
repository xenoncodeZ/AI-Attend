
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Correctly import useRouter from next/navigation

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('adminpass');
  const { login, isAuthenticated, userRole } = useAuth();
  const { toast } = useToast();
  const router = useRouter(); 
  
  React.useEffect(() => {
    if (isAuthenticated && userRole === 'admin') {
      router.push('/dashboard'); // Redirect if already logged in as admin
    }
  }, [isAuthenticated, userRole, router]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass 'admin' role explicitly for clarity, though AuthContext's login can infer for admin
    const success = login(email, password, 'admin'); 
    if (success) {
      toast({ title: 'Login Successful', description: 'Welcome, Admin!' });
      // AuthContext handles redirection
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password for admin.' });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <LogIn className="h-6 w-6" /> Admin Login
          </CardTitle>
          <CardDescription>Enter your administrator credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="adminpass"
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3" size="lg">
              Login
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">Not an admin? Go to{' '}
            <Link href="/login/student" className="text-primary hover:underline">
              Student Login
            </Link>
          </p>
          <p className="text-muted-foreground">Need to register a student account?{' '}
            <Link href="/register" className="text-primary hover:underline flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Register Here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

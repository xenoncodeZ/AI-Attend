
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, userRole } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (isAuthenticated && userRole === 'student') {
      router.push('/student-dashboard'); 
    }
  }, [isAuthenticated, userRole, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass 'student' role explicitly
    const success = login(email, password, 'student'); 
    if (success) {
      toast({ title: 'Login Successful', description: `Welcome!` });
      // AuthContext handles redirection
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'Invalid email or password for a student account.' });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <LogIn className="h-6 w-6" /> Student Login
          </CardTitle>
          <CardDescription>Enter your student credentials to access your dashboard.</CardDescription>
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
                placeholder="yourname@student.com"
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
                placeholder="Your password"
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
          <p className="text-muted-foreground">Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Register here
            </Link>
          </p>
          <p className="text-muted-foreground">Are you an admin?{' '}
            <Link href="/login/admin" className="text-primary hover:underline">
              Admin Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

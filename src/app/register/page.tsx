
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function StudentRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { registerStudent } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Registration Failed', description: 'Passwords do not match.' });
      return;
    }
    // Removed @student.com validation
    // if (!email.endsWith('@student.com')) {
    //   toast({ variant: 'destructive', title: 'Registration Failed', description: 'Email must be a @student.com address.' });
    //   return;
    // }

    const result = registerStudent(name, email, password);

    if (result.success) {
      toast({ title: 'Registration Successful', description: result.message });
      router.push('/login/student');
    } else {
      toast({ variant: 'destructive', title: 'Registration Failed', description: result.message });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <UserPlus className="h-6 w-6" /> Create Student Account
          </CardTitle>
          <CardDescription>Fill in the details below to register as a student.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                required
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
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
                placeholder="Choose a password"
                required
                className="text-base"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-base py-3" size="lg">
              Register
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm">
          <p className="text-muted-foreground">Already have an account?{' '}
            <Link href="/login/student" className="text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

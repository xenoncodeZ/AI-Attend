
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, BookOpenCheck, Clock, Camera, CheckSquare, XSquare } from 'lucide-react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { AttendanceLogTable } from '@/components/AttendanceLogTable';
import type { AttendanceRecord, RegisteredUser } from '@/types';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

function StudentDashboardContent() {
  const { getAttendanceRecords } = useAttendanceData();
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const { 
    userId, 
    userName: studentNameFromAuth, 
    userRole, 
    updateStudentFaceDataStatus,
    getLoggedInUser // Use this to get the most up-to-date user info
  } = useAuth();
  const { toast } = useToast();

  // Local state to track the logged-in user's details, including face registration status
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  useEffect(() => {
    setAllRecords(getAttendanceRecords());
  }, [getAttendanceRecords]);

  useEffect(() => {
    // Update currentUser whenever auth state or registeredUsers list might change
    if (userId && userRole === 'student') {
      setCurrentUser(getLoggedInUser());
    } else {
      setCurrentUser(null);
    }
  }, [userId, userRole, getLoggedInUser, getLoggedInUser()?.faceDataRegistered]); // Re-run if faceDataRegistered changes for the current user

  const studentRecords = useMemo(() => {
    if (!currentUser) return [];
    // Filter records based on the currently logged-in student's name
    return allRecords.filter(record => 
      record.name.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [allRecords, currentUser]);

  const totalCheckIns = studentRecords.length;
  const lastCheckIn = useMemo(() => {
    if (studentRecords.length === 0) return null;
    // Ensure records are sorted by timestamp if not already, then take the first
    const sortedRecords = [...studentRecords].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return new Date(sortedRecords[0].timestamp);
  }, [studentRecords]);

  const handleFaceDataRegistration = () => {
    if (!currentUser || !userId) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify student." });
      return;
    }
    // Simulate registering face data by setting the flag to true
    const result = updateStudentFaceDataStatus(userId, true);
    if (result.success) {
      toast({ title: "Face Data Registered", description: "Your face data has been successfully (simulated) registered." });
      setCurrentUser(getLoggedInUser()); // Refresh user data to update UI
    } else {
      toast({ variant: "destructive", title: "Registration Failed", description: result.message });
    }
  };
  
  const handleFaceDataDeregistration = () => {
    if (!currentUser || !userId) {
      toast({ variant: "destructive", title: "Error", description: "Could not identify student." });
      return;
    }
    const result = updateStudentFaceDataStatus(userId, false);
    if (result.success) {
      toast({ title: "Face Data Deregistered", description: "Your face data registration has been removed." });
      setCurrentUser(getLoggedInUser()); // Refresh user data to update UI
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.message });
    }
  };


  if (!currentUser) {
    return <p className="text-center text-muted-foreground py-10">Loading student data or not authorized...</p>; 
  }

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
            <User className="h-8 w-8" /> My Student Dashboard
          </CardTitle>
          <CardDescription>
            Welcome, {currentUser.name}! Here's your attendance overview and profile settings.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenCheck /> My Attendance Log
            </CardTitle>
            <CardDescription>Your recorded attendance entries.</CardDescription>
          </CardHeader>
          <CardContent>
            {studentRecords.length > 0 ? (
              <AttendanceLogTable records={studentRecords} />
            ) : (
              <p className="text-muted-foreground text-center py-8">No attendance records found for {currentUser.name}. Try marking yourself present on the main page.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock /> Attendance Summary
              </CardTitle>
              <CardDescription>A quick look at your attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <p className="text-lg font-semibold">Total Check-ins:</p>
                <p className="text-2xl font-bold text-primary">{totalCheckIns}</p>
              </div>
              {lastCheckIn && (
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">Last Check-in:</p>
                  <p className="text-lg font-semibold text-primary">{format(lastCheckIn, 'PPP p')}</p>
                </div>
              )}
              {!lastCheckIn && totalCheckIns === 0 && (
                   <p className="text-muted-foreground text-center p-4">No check-in data available yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera /> Face Recognition Data
              </CardTitle>
              <CardDescription>Manage your face data for attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <p className="text-lg font-semibold">Status:</p>
                {currentUser.faceDataRegistered ? (
                  <span className="text-green-600 font-semibold flex items-center gap-1"><CheckSquare /> Registered</span>
                ) : (
                  <span className="text-red-600 font-semibold flex items-center gap-1"><XSquare /> Not Registered</span>
                )}
              </div>
              {!currentUser.faceDataRegistered && (
                <Button onClick={handleFaceDataRegistration} className="w-full">
                  <Camera className="mr-2 h-4 w-4" /> Register My Face (Simulated)
                </Button>
              )}
              {currentUser.faceDataRegistered && (
                 <Button onClick={handleFaceDataDeregistration} variant="outline" className="w-full">
                  Remove Face Data Registration
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                This simulation updates your profile to indicate face data is available for recognition.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboardContent />
    </ProtectedRoute>
  );
}

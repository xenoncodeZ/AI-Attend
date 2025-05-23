
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import WebcamDisplay from '@/components/WebcamDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, AlertCircle, Users, CheckCircle2, ShieldCheck, Loader2, VideoOff, PlayCircle, Database, Eye } from 'lucide-react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from 'next/link';
import type { RegisteredUser } from '@/types';

const DETECTION_INTERVAL = 3500; // milliseconds between detection attempts
const RECOGNITION_DISPLAY_DURATION = 2000; // milliseconds to display recognition name
const MAX_UNIQUE_RECOGNITIONS_PER_SESSION = 50;

export default function AttendancePage() {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isLoadingWebcam, setIsLoadingWebcam] = useState(true);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  
  const { addAttendanceRecord, currentSessionMarkedCount, clearSessionAttendees } = useAttendanceData();
  const { registeredUsers } = useAuth(); // Get all registered users
  const { toast } = useToast();
  const [lastMarked, setLastMarked] = useState<{name: string, time: string} | null>(null);
  
  const [isDetectionCycleActive, setIsDetectionCycleActive] = useState(false);
  const [uniqueStudentsRecognizedInCycle, setUniqueStudentsRecognizedInCycle] = useState<Set<string>>(new Set());
  const [cycleStatusMessage, setCycleStatusMessage] = useState<string>("Initializing...");

  const detectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionClearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const drawRecognition = useCallback((name: string) => {
    if (typeof window !== 'undefined' && (window as any).drawMockRecognitionOnCanvas) {
      (window as any).drawMockRecognitionOnCanvas(name);
    }
  }, []);

  const clearRecognition = useCallback(() => {
     if (typeof window !== 'undefined' && (window as any).clearMockRecognitionCanvas) {
      (window as any).clearMockRecognitionCanvas();
    }
  }, []);

  // Webcam Initialization
  useEffect(() => {
    const setupWebcam = async () => {
      setIsLoadingWebcam(true);
      setWebcamError(null);
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
          setMediaStream(stream);
          setIsDetectionCycleActive(true); // Start detection cycle once webcam is ready
          setUniqueStudentsRecognizedInCycle(new Set()); // Reset for a new webcam session
          setCycleStatusMessage("Preparing to scan...");
        } else {
          throw new Error("getUserMedia not supported in this browser.");
        }
      } catch (err: any) {
        console.error("Error accessing webcam:", err);
        let errorMessage = "Could not access webcam. Please check permissions.";
        if (err.name === "NotAllowedError") {
          errorMessage = "Camera access was denied. Please enable camera permissions in your browser settings.";
        } else if (err.name === "NotFoundError") {
          errorMessage = "No camera found. Please ensure a camera is connected and enabled.";
        }
        setWebcamError(errorMessage);
        toast({ variant: "destructive", title: "Webcam Error", description: errorMessage, duration: 7000 });
        setMediaStream(null);
        setIsDetectionCycleActive(false);
        setCycleStatusMessage("Webcam error. Cycle inactive.");
      } finally {
        setIsLoadingWebcam(false);
      }
    };

    setupWebcam();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      clearRecognition();
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      if (recognitionClearTimeoutRef.current) clearTimeout(recognitionClearTimeoutRef.current);
      setIsDetectionCycleActive(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 


  // Automated Random Detection Cycle Effect
  useEffect(() => {
    if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
    if (recognitionClearTimeoutRef.current) clearTimeout(recognitionClearTimeoutRef.current);
    clearRecognition();

    if (!isDetectionCycleActive || !mediaStream || isLoadingWebcam || webcamError) {
      if (webcamError) setCycleStatusMessage("Detection cycle paused due to webcam error.");
      else if (!mediaStream) setCycleStatusMessage("Detection cycle paused; webcam not active.");
      else if (isLoadingWebcam) setCycleStatusMessage("Waiting for webcam...");
      return;
    }
    
    detectionTimeoutRef.current = setTimeout(() => {
      const eligibleStudents = registeredUsers.filter(user => user.faceDataRegistered);
      const studentsNotYetRecognizedInCycle = eligibleStudents.filter(student => !uniqueStudentsRecognizedInCycle.has(student.id));

      if (studentsNotYetRecognizedInCycle.length > 0 && uniqueStudentsRecognizedInCycle.size < MAX_UNIQUE_RECOGNITIONS_PER_SESSION) {
        const randomIndex = Math.floor(Math.random() * studentsNotYetRecognizedInCycle.length);
        const recognizedStudent = studentsNotYetRecognizedInCycle[randomIndex];
        
        setUniqueStudentsRecognizedInCycle(prev => new Set(prev).add(recognizedStudent.id));
        drawRecognition(recognizedStudent.name);
        setCycleStatusMessage(`Recognizing ${recognizedStudent.name}... (${uniqueStudentsRecognizedInCycle.size + 1}/${Math.min(eligibleStudents.length, MAX_UNIQUE_RECOGNITIONS_PER_SESSION)})`);

        const result = addAttendanceRecord(recognizedStudent.name);
        if (result.success) {
          toast({
            title: "Attendance Marked",
            description: `${recognizedStudent.name} recognized and marked present.`,
            variant: "default",
            action: <CheckCircle2 className="text-green-500" />,
          });
          setLastMarked({ name: recognizedStudent.name, time: new Date().toLocaleTimeString() });
        } else {
           toast({
            title: "Already Logged This Session", // From addAttendanceRecord
            description: `${recognizedStudent.name} already logged in this session's records.`,
            variant: "default",
            action: <Eye className="text-blue-500" />,
          });
        }
        
        recognitionClearTimeoutRef.current = setTimeout(clearRecognition, RECOGNITION_DISPLAY_DURATION);
        // Continue the cycle by changing a dependency (uniqueStudentsRecognizedInCycle.size changes indirectly)
        // No explicit re-trigger needed if state updates correctly cause re-render of this effect's dependencies

      } else if (eligibleStudents.length === 0) {
        drawRecognition("No Registered Students");
        setCycleStatusMessage("No students with face data registered to detect.");
        toast({
          title: "No Eligible Students",
          description: "Please register students and ensure they've 'registered their face data' on their dashboard.",
          variant: "default",
           action: <Database className="text-yellow-500" />,
        });
        recognitionClearTimeoutRef.current = setTimeout(clearRecognition, RECOGNITION_DISPLAY_DURATION);
        setIsDetectionCycleActive(false); // Stop cycle if no one to detect
      } else { // All unique eligible students processed or limit reached
        clearRecognition();
        setIsDetectionCycleActive(false);
        const message = uniqueStudentsRecognizedInCycle.size >= MAX_UNIQUE_RECOGNITIONS_PER_SESSION 
            ? `Session cycle complete. Maximum ${MAX_UNIQUE_RECOGNITIONS_PER_SESSION} unique students processed.`
            : "Session cycle complete. All available unique students processed.";
        setCycleStatusMessage(message);
        toast({
          title: "Session Cycle Finished",
          description: message,
          variant: "default",
          action: <Users className="text-primary" />
        });
      }
    }, DETECTION_INTERVAL);

    return () => {
      if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
      if (recognitionClearTimeoutRef.current) clearTimeout(recognitionClearTimeoutRef.current);
    };
  // This effect should re-run when isDetectionCycleActive changes, or when registeredUsers might change,
  // or to effectively loop when a student is processed. Adding uniqueStudentsRecognizedInCycle.size
  // as a dependency ensures it re-evaluates after a student is added to the set.
  }, [
    isDetectionCycleActive, 
    mediaStream, 
    isLoadingWebcam, 
    webcamError, 
    addAttendanceRecord, 
    toast, 
    drawRecognition, 
    clearRecognition,
    registeredUsers,
    uniqueStudentsRecognizedInCycle // Key dependency for looping through unique students
  ]);

  const handleNewSession = () => {
    clearSessionAttendees(); // From useAttendanceData, clears log duplicates for this session
    setUniqueStudentsRecognizedInCycle(new Set()); // Clears "seen in this cycle" for the UI simulation
    setLastMarked(null);
    
    if (detectionTimeoutRef.current) clearTimeout(detectionTimeoutRef.current);
    if (recognitionClearTimeoutRef.current) clearTimeout(recognitionClearTimeoutRef.current);
    clearRecognition();
    
    if (mediaStream && !webcamError) {
        setIsDetectionCycleActive(true); 
        setCycleStatusMessage("New session started. Preparing to scan...");
        toast({title: "New Session Started", description: "Random detection cycle restarting."});
    } else {
        setCycleStatusMessage(webcamError ? "New session ready, but webcam error persists." : "New session ready. Webcam needs to be active.");
        toast({title: "New Session Ready", description: "Previous session attendees cleared. Webcam needs to be active to start detection."});
        setIsDetectionCycleActive(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-baseline gap-3">
            <span>AttendAI - AI Attendance System</span>
            <span className="text-lg font-normal text-destructive"></span>
          </CardTitle>
          <CardDescription>
            The system automatically attempts to recognize registered students with face data from the webcam feed.
            It will cycle through up to {MAX_UNIQUE_RECOGNITIONS_PER_SESSION} unique students per session.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoadingWebcam && (
        <Card className="shadow-lg">
          <CardContent className="flex flex-col items-center justify-center p-10 space-y-3">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Initializing webcam and attendance system...</p>
          </CardContent>
        </Card>
      )}

      {!isLoadingWebcam && webcamError && (
         <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Webcam Initialization Failed</AlertTitle>
          <AlertDescription>{webcamError}</AlertDescription>
        </Alert>
      )}
      
      {!isLoadingWebcam && !webcamError && (
        <>
          <WebcamDisplay initialMediaStream={mediaStream} />
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Attendance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-muted-foreground ${isDetectionCycleActive && !webcamError ? 'animate-pulse' : ''}`}>
                <PlayCircle className={`inline-block mr-2 h-5 w-5 ${isDetectionCycleActive && !webcamError ? 'text-primary' : 'text-muted'}`} /> 
                {cycleStatusMessage}
              </p>
              {lastMarked && (
                  <p className="mt-2">Last recognized: <span className="font-semibold text-foreground">{lastMarked.name}</span> at {lastMarked.time}.</p>
              )}
              {!lastMarked && isDetectionCycleActive && !webcamError &&(
                <p className="text-muted-foreground mt-2">No students marked yet in this session. Waiting for recognition.</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">Students logged this session (total entries): {currentSessionMarkedCount}</p>
              <p className="text-sm text-muted-foreground mt-1">Unique students "seen" in this cycle: {uniqueStudentsRecognizedInCycle.size}</p>
            </CardContent>
          </Card>
        </>
      )}
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Session & Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Register students and ensure their face data is "registered" on their dashboard to include them in the recognition pool.
            View detailed logs in the Admin Dashboard.
          </p>
           <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/dashboard">
                <ShieldCheck className="mr-2 h-4 w-4" /> Go to Admin Dashboard
              </Link>
            </Button>
             <Button 
              onClick={handleNewSession} 
              variant="secondary" 
              className="w-full sm:w-auto"
              disabled={isLoadingWebcam} // Can start new session if webcam is okay, even if cycle is paused due to error.
            >
                New Session
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10">
                <Link href="/register">
                    <UserCheck className="mr-2 h-4 w-4" /> Register New Student
                </Link>
            </Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

    

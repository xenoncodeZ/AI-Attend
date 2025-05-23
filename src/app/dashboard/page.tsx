
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, SearchCheck, FileSignature, AlertCircle, RotateCw, ShieldCheck } from 'lucide-react';
import { useAttendanceData } from '@/hooks/useAttendanceData';
import { AttendanceLogTable } from '@/components/AttendanceLogTable';
import { AnomalyReportDisplay } from '@/components/AnomalyReportDisplay';
import { downloadCSV } from '@/lib/csvUtils';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types';
import { detectAttendanceAnomalies, DetectAttendanceAnomaliesOutput } from '@/ai/flows/detect-attendance-anomalies';
import { summarizeAttendanceAnomalies, SummarizeAttendanceAnomaliesOutput } from '@/ai/flows/summarize-attendance-anomalies';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

function AdminDashboardContent() {
  const { getAttendanceRecords, getAttendanceRecordsAsCSV } = useAttendanceData();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [anomalyDetectionResult, setAnomalyDetectionResult] = useState<DetectAttendanceAnomaliesOutput | null>(null);
  const [anomalySummaryResult, setAnomalySummaryResult] = useState<SummarizeAttendanceAnomaliesOutput | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const { toast } = useToast();
  const { userName } = useAuth();

  useEffect(() => {
    setRecords(getAttendanceRecords());
  }, [getAttendanceRecords]);

  const handleDownloadCSV = () => {
    const csvData = getAttendanceRecordsAsCSV();
    if (csvData) {
      downloadCSV(csvData, 'full_attendance_log');
      toast({ title: "CSV Downloaded", description: "Full attendance log has been downloaded." });
    } else {
      toast({ variant: "destructive", title: "No Data", description: "There is no attendance data to download." });
    }
  };

  const handleDetectAnomalies = async () => {
    const csvData = getAttendanceRecordsAsCSV();
    if (!csvData.trim() || records.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "No attendance data to analyze for anomalies." });
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    setAnomalyDetectionResult(null); 
    setAnomalySummaryResult(null); 

    try {
      const result = await detectAttendanceAnomalies({ attendanceData: csvData });
      setAnomalyDetectionResult(result);
      toast({ title: "Anomaly Detection Complete", description: "Analysis finished. See results below." });
    } catch (error) {
      console.error("Error detecting anomalies:", error);
      setAiError("Failed to detect anomalies. Please try again.");
      toast({ variant: "destructive", title: "AI Error", description: "Could not detect anomalies." });
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleSummarizeAnomalies = async () => {
    if (!anomalyDetectionResult || (!anomalyDetectionResult.summary && (!anomalyDetectionResult.anomalies || anomalyDetectionResult.anomalies.length === 0))) {
      toast({ variant: "destructive", title: "No Anomalies Found", description: "No anomalies detected to summarize. Run detection first." });
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    
    const anomaliesToSummarize = anomalyDetectionResult.summary || anomalyDetectionResult.anomalies.join('\n');

    try {
      const result = await summarizeAttendanceAnomalies({ anomalies: anomaliesToSummarize });
      setAnomalySummaryResult(result);
      toast({ title: "Anomaly Summarization Complete", description: "Summary generated. See results below." });
    } catch (error) {
      console.error("Error summarizing anomalies:", error);
      setAiError("Failed to summarize anomalies. Please try again.");
      toast({ variant: "destructive", title: "AI Error", description: "Could not summarize anomalies." });
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="h-8 w-8" /> Admin Dashboard
          </CardTitle>
          <CardDescription>
            Welcome, Admin {userName || ''}! Manage and analyze all attendance logs, and utilize AI-powered tools for insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download Full Log (CSV)
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Full Attendance Log</CardTitle>
          <CardDescription>All recorded attendance entries across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceLogTable records={records} />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>AI-Powered Analysis</CardTitle>
          <CardDescription>
            Use generative AI to detect unusual attendance patterns and get a summary from the full log.
            Ensure you have sufficient attendance data for meaningful analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleDetectAnomalies} disabled={isLoadingAI || records.length === 0} className="bg-accent hover:bg-accent/90">
              {isLoadingAI ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}
              Detect Anomalies in Full Log
            </Button>
            {anomalyDetectionResult && (
              <Button onClick={handleSummarizeAnomalies} disabled={isLoadingAI} variant="secondary">
                {isLoadingAI ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                Summarize Detected Anomalies
              </Button>
            )}
          </div>
          {aiError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{aiError}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
            <AnomalyReportDisplay detectionReport={anomalyDetectionResult} summaryReport={anomalySummaryResult} />
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

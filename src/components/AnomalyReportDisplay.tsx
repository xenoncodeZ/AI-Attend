"use client";

import type { DetectAttendanceAnomaliesOutput, SummarizeAttendanceAnomaliesOutput } from '@/ai/flows/detect-attendance-anomalies'; // Assuming types might be shared or defined here.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';

interface AnomalyReportDisplayProps {
  detectionReport?: DetectAttendanceAnomaliesOutput | null;
  summaryReport?: SummarizeAttendanceAnomaliesOutput | null; // Using SummarizeAttendanceAnomaliesOutput from the other flow
}

export function AnomalyReportDisplay({ detectionReport, summaryReport }: AnomalyReportDisplayProps) {
  if (!detectionReport && !summaryReport) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      {detectionReport && (
        <Card className="shadow-md border-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <AlertTriangle /> Anomaly Detection Report
            </CardTitle>
            <CardDescription>Detailed anomalies found in the attendance data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">Detection Summary:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{detectionReport.summary || "No summary provided."}</p>
            </div>
            {detectionReport.anomalies && detectionReport.anomalies.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Specific Anomalies:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm p-3 bg-muted rounded-md">
                  {detectionReport.anomalies.map((anomaly, index) => (
                    <li key={index} className="text-muted-foreground">{anomaly}</li>
                  ))}
                </ul>
              </div>
            )}
             {(!detectionReport.anomalies || detectionReport.anomalies.length === 0) && (
                <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">No specific anomalies listed.</p>
            )}
          </CardContent>
        </Card>
      )}

      {summaryReport && (
        <Card className="shadow-md border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Info /> AI Generated Summary of Anomalies
            </CardTitle>
             <CardDescription>A concise overview of the identified attendance patterns.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">{summaryReport.summary || "No summary generated."}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

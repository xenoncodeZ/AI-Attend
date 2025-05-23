"use client";

import type { AttendanceRecord } from '@/types';
import { ATTENDANCE_LOG_KEY } from '@/lib/constants';
import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

export function useAttendanceData() {
  const [attendanceLog, setAttendanceLog] = useState<AttendanceRecord[]>([]);
  const [sessionAttendees, setSessionAttendees] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedLog = localStorage.getItem(ATTENDANCE_LOG_KEY);
      if (storedLog) {
        try {
          const parsedLog = JSON.parse(storedLog) as AttendanceRecord[];
          setAttendanceLog(parsedLog);
        } catch (error) {
          console.error("Failed to parse attendance log from localStorage:", error);
          setAttendanceLog([]);
        }
      }
    }
  }, []);

  const saveLog = useCallback((log: AttendanceRecord[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ATTENDANCE_LOG_KEY, JSON.stringify(log));
    }
  }, []);

  const addAttendanceRecord = useCallback((name: string): { success: boolean; message: string } => {
    if (!name.trim()) {
      return { success: false, message: "Name cannot be empty." };
    }
    if (sessionAttendees.has(name)) {
      return { success: false, message: `${name} has already been marked present in this session.` };
    }

    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      name: name.trim(),
      timestamp: now.toISOString(),
      date: format(now, 'yyyy-MM-dd'),
    };

    setAttendanceLog(prevLog => {
      const updatedLog = [newRecord, ...prevLog];
      saveLog(updatedLog);
      return updatedLog;
    });
    setSessionAttendees(prevSessionAttendees => new Set(prevSessionAttendees).add(name));
    return { success: true, message: `${name} marked present successfully.` };
  }, [saveLog, sessionAttendees]);

  const getAttendanceRecords = useCallback((): AttendanceRecord[] => {
    return attendanceLog;
  }, [attendanceLog]);

  const getAttendanceRecordsAsCSV = useCallback((): string => {
    if (attendanceLog.length === 0) {
      return "";
    }
    const header = "Name,Timestamp,Date\n";
    const rows = attendanceLog
      .map(record => `${record.name},${record.timestamp},${record.date}`)
      .join("\n");
    return header + rows;
  }, [attendanceLog]);
  
  const clearSessionAttendees = useCallback(() => {
    setSessionAttendees(new Set());
  }, []);

  return {
    addAttendanceRecord,
    getAttendanceRecords,
    getAttendanceRecordsAsCSV,
    clearSessionAttendees, // useful for starting a "new session"
    currentSessionMarkedCount: sessionAttendees.size,
  };
}

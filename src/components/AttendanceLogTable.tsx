"use client";

import type { AttendanceRecord } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface AttendanceLogTableProps {
  records: AttendanceRecord[];
}

export function AttendanceLogTable({ records }: AttendanceLogTableProps) {
  if (records.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No attendance records yet.</p>;
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-sm">
      <Table>
        <TableCaption>A list of all attendance records.</TableCaption>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[200px]">Student Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead className="text-right">Full Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.name}</TableCell>
              <TableCell>{format(new Date(record.timestamp), 'PPP')}</TableCell>
              <TableCell>{format(new Date(record.timestamp), 'p')}</TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">{record.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

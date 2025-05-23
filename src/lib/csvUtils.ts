import { format } from 'date-fns';

export function downloadCSV(csvContent: string, baseFilename: string = 'attendance_log'): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    const today = format(new Date(), 'yyyy-MM-dd');
    link.setAttribute('href', url);
    link.setAttribute('download', `${baseFilename}_${today}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

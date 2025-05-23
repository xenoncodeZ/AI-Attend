
export interface AttendanceRecord {
  id: string;
  name: string;
  timestamp: string; // ISO string format for date and time
  date: string; // YYYY-MM-DD format for easier grouping by date
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  passwordSalt?: string; // For future hashing, not used in this basic version
  passwordHash?: string; // For future hashing, not used in this basic version
  password?: string; // Storing plain text for prototype, NOT FOR PRODUCTION
  role: 'student'; // For now, only students can register through UI
  faceDataRegistered: boolean; // Updated to ensure it's always present
}


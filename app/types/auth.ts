export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student extends User {
  role: 'student';
  class: string;
  attendanceStreak: number;
  totalAttendance: number;
}

export interface Admin extends User {
  role: 'admin';
  managedClasses: string[];
}
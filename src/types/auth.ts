export type UserRole = 'admin' | 'user' | 'student';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  class?: string;
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

export default {};
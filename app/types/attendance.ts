export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'under_review';
  reviewRequest?: {
    reason: string;
    timestamp: Date;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export interface GathaRecord {
  id: string;
  studentId: string;
  gathaName: string;
  completedDate: Date;
  grade: 'excellent' | 'good' | 'needs_improvement';
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  priority: 'high' | 'medium' | 'low';
  createdBy: string;
  attachments?: {
    url: string;
    type: 'image' | 'pdf' | 'doc';
    name: string;
  }[];
}
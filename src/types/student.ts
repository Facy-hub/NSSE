export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  classGrade: string;
  section: string;
  age: number;
  dob: string;
  bloodGroup: string;
  guardianPhone: string;
  whatsapp?: string;
  address: string;
  admissionDate: string;
  academicStatus: 'Active' | 'On Leave' | 'Suspended' | 'Alumni';
  feeStatus: 'Paid' | 'Pending' | 'Scholarship' | 'Concession';
  photoUrl: string;
  emergencyContact: string;
  medicalNotes?: string;
  bFormNumber?: string;
  lastUpdated: string;
}

export interface FacultyUser {
  id: string;
  name: string;
  email: string;
  role: 'Principal' | 'Vice Principal' | 'Headmaster' | 'Senior Registrar' | 'Class Incharge';
  department: string;
  avatarUrl?: string;
  mfaVerified: boolean;
  mfaSecret?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'urgent' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  action: 'ADD' | 'EDIT' | 'DELETE' | 'FULL_SYNC';
  rollNumber: string;
  studentName: string;
  status: 'synced' | 'pending' | 'failed';
  details?: string;
}

export interface GoogleSheetConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncTimestamp: string | null;
}

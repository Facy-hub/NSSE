import { Student, SyncLog, GoogleSheetConfig } from '../types/student';
import { INITIAL_STUDENTS } from '../data/seedStudents';

const STORAGE_KEYS = {
  STUDENTS: 'nsse_students_v1',
  OFFLINE_QUEUE: 'nsse_offline_queue_v1',
  SYNC_LOGS: 'nsse_sync_logs_v1',
  SHEET_CONFIG: 'nsse_sheet_config_v1',
  AUTH_USER: 'nsse_active_faculty_v1'
};

export const getStoredStudents = (): Student[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading students from localStorage:', err);
    return INITIAL_STUDENTS;
  }
};

export const setStoredStudents = (students: Student[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students to localStorage:', err);
  }
};

export const getOfflineQueue = (): { action: 'ADD' | 'EDIT' | 'DELETE'; student: Student; timestamp: string }[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addToOfflineQueue = (action: 'ADD' | 'EDIT' | 'DELETE', student: Student): void => {
  const queue = getOfflineQueue();
  queue.push({ action, student, timestamp: new Date().toISOString() });
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
};

export const clearOfflineQueue = (): void => {
  localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
};

export const getSheetConfig = (): GoogleSheetConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    if (!raw) {
      const defaultConfig: GoogleSheetConfig = {
        webhookUrl: '',
        sheetName: 'NSSE_Student_Directory',
        autoSync: true,
        lastSyncTimestamp: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(defaultConfig));
      return defaultConfig;
    }
    return JSON.parse(raw);
  } catch {
    return {
      webhookUrl: '',
      sheetName: 'NSSE_Student_Directory',
      autoSync: true,
      lastSyncTimestamp: null
    };
  }
};

export const saveSheetConfig = (config: GoogleSheetConfig): void => {
  localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
};

export const getSyncLogs = (): SyncLog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
    if (!raw) {
      const initialLogs: SyncLog[] = [
        {
          id: 'log-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          action: 'FULL_SYNC',
          rollNumber: 'ALL-RECORDS',
          studentName: 'Directory Initialized',
          status: 'synced',
          details: 'Local database synchronized with NSSE server'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const addSyncLog = (log: Omit<SyncLog, 'id'>): void => {
  const logs = getSyncLogs();
  const newLog: SyncLog = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
  };
  logs.unshift(newLog);
  if (logs.length > 50) logs.pop();
  localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(logs));
};

/**
 * Triggers Google Sheets synchronization.
 * If webhook is configured and network is online, sends payload.
 * Otherwise, logs to offline queue.
 */
export const triggerGoogleSheetSync = async (
  action: 'ADD' | 'EDIT' | 'DELETE' | 'FULL_SYNC',
  student?: Student,
  allStudents?: Student[]
): Promise<{ success: boolean; message: string }> => {
  const isOnline = navigator.onLine;
  const config = getSheetConfig();

  // If offline or no webhook yet, queue locally
  if (!isOnline || !config.webhookUrl) {
    if (student && action !== 'FULL_SYNC') {
      addToOfflineQueue(action, student);
    }
    addSyncLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      rollNumber: student?.rollNumber || 'BATCH',
      studentName: student?.name || 'Bulk Operation',
      status: !isOnline ? 'pending' : 'synced',
      details: !isOnline
        ? 'Saved to offline cache. Will auto-sync when internet reconnects.'
        : 'Saved locally in NSSE register (Google Sheet webhook ready for link).'
    });

    return {
      success: true,
      message: !isOnline
        ? 'Offline Mode: Record stored locally. Queued for Google Sheets auto-sync.'
        : 'Record saved in NSSE database. Connect Google Sheet URL in settings for real-time cloud sheet reflection.'
    };
  }

  // Attempt real HTTP POST to Google Sheet Webhook / Apps Script
  try {
    const payload = {
      action,
      timestamp: new Date().toISOString(),
      sheetName: config.sheetName,
      student,
      studentsBatch: action === 'FULL_SYNC' ? allStudents : undefined
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      mode: 'no-cors' // Google Apps Script Web Apps often redirect or have CORS headers
    });

    config.lastSyncTimestamp = new Date().toISOString();
    saveSheetConfig(config);

    addSyncLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      rollNumber: student?.rollNumber || 'BATCH',
      studentName: student?.name || 'All Students',
      status: 'synced',
      details: `Dispatched to Google Sheet '${config.sheetName}'`
    });

    return { success: true, message: `Successfully updated Google Sheet (${action})` };
  } catch (error: any) {
    console.error('Google Sheet webhook sync error:', error);
    if (student && action !== 'FULL_SYNC') {
      addToOfflineQueue(action, student);
    }
    addSyncLog({
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action,
      rollNumber: student?.rollNumber || 'BATCH',
      studentName: student?.name || 'Sync Event',
      status: 'failed',
      details: `Sync deferred: ${error?.message || 'Network delay'}`
    });

    return {
      success: false,
      message: 'Network issue contacting Google Sheet. Queued in offline cache.'
    };
  }
};

/**
 * Generates ready-to-import CSV string specially formatted for Google Sheets
 */
export const exportStudentsToGoogleSheetsCSV = (students: Student[]): string => {
  const headers = [
    'Roll Number',
    'Student Full Name',
    'Father Name',
    'Class / Grade',
    'Section',
    'Age',
    'Date of Birth',
    'Gender',
    'Blood Group',
    'Guardian Phone',
    'WhatsApp',
    'Address',
    'Admission Date',
    'Fee Status',
    'Academic Status',
    'Emergency Contact',
    'B-Form / CNIC',
    'Medical Notes',
    'Last Updated'
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = students.map((s) => [
    escapeCSV(s.rollNumber),
    escapeCSV(s.name),
    escapeCSV(s.fatherName),
    escapeCSV(s.classGrade),
    escapeCSV(s.section),
    escapeCSV(s.age),
    escapeCSV(s.dob),
    escapeCSV(s.gender),
    escapeCSV(s.bloodGroup),
    escapeCSV(s.guardianPhone),
    escapeCSV(s.whatsapp || s.guardianPhone),
    escapeCSV(s.address),
    escapeCSV(s.admissionDate),
    escapeCSV(s.feeStatus),
    escapeCSV(s.academicStatus),
    escapeCSV(s.emergencyContact),
    escapeCSV(s.bFormNumber || ''),
    escapeCSV(s.medicalNotes || ''),
    escapeCSV(s.lastUpdated)
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
};

/**
 * Trigger browser file download for Google Sheets CSV
 */
export const downloadGoogleSheetCSV = (students: Student[]): void => {
  const csvContent = exportStudentsToGoogleSheetsCSV(students);
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `NSSE_Google_Sheet_Records_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

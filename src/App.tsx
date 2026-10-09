import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  FileSpreadsheet,
  FileDown,
  LayoutGrid,
  List,
  Filter,
  Users,
  GraduationCap,
  CreditCard,
  Award,
  Sparkles,
  WifiOff,
  Bell,
  RefreshCw,
  BookOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Student, FacultyUser, AppNotification } from './types/student';
import { INITIAL_NOTIFICATIONS } from './data/seedStudents';
import {
  getStoredStudents,
  setStoredStudents,
  triggerGoogleSheetSync,
  getOfflineQueue,
  clearOfflineQueue,
  getSheetConfig
} from './services/storageService';
import { exportClassRosterPDF } from './services/pdfService';
import { Navbar } from './components/Navbar';
import { StudentCard } from './components/StudentCard';
import { StudentTable } from './components/StudentTable';
import { StudentFormModal } from './components/StudentFormModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LoginModal } from './components/LoginModal';
import { GoogleSheetSyncModal } from './components/GoogleSheetSyncModal';
import { NotificationCenter } from './components/NotificationCenter';

export default function App() {
  // Primary Student State
  const [students, setStudents] = useState<Student[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [currentUser, setCurrentUser] = useState<FacultyUser | null>({
    id: 'fac-01',
    name: 'Dr. Muhammad Tariq Khan',
    email: 'principal@nsse.edu.pk',
    role: 'Principal',
    department: 'Executive Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mfaVerified: true
  });

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedFeeStatus, setSelectedFeeStatus] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Toast Banner State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Initialize and attach network listeners
  useEffect(() => {
    const loaded = getStoredStudents();
    setStudents(loaded);

    const handleOnline = async () => {
      setIsOnline(true);
      showToast('Internet restored. Checking offline sync queue...', 'info');
      // Auto-flush offline queue
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        for (const item of queue) {
          await triggerGoogleSheetSync(item.action, item.student);
        }
        clearOfflineQueue();
        showToast(`Auto-synced ${queue.length} offline changes to Google Sheet!`, 'success');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Offline Mode active. All changes will be saved locally & queued for sync.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Student CRUD Operations
  const handleSaveStudent = async (studentData: Student) => {
    const isEdit = students.some((s) => s.id === studentData.id);
    let updatedList: Student[];

    if (isEdit) {
      updatedList = students.map((s) => (s.id === studentData.id ? studentData : s));
    } else {
      updatedList = [studentData, ...students];
    }

    setStudents(updatedList);
    setStoredStudents(updatedList);

    // Sync to Google Sheet
    const action = isEdit ? 'EDIT' : 'ADD';
    const result = await triggerGoogleSheetSync(action, studentData);

    showToast(
      isEdit
        ? `Student record ${studentData.rollNumber} updated successfully. (${result.message})`
        : `Student ${studentData.name} enrolled successfully. (${result.message})`,
      'success'
    );

    // If new enrollment, create notification
    if (!isEdit) {
      addNotification(
        `New Student Enrolled: ${studentData.name}`,
        `Roll Number ${studentData.rollNumber} has been admitted to ${studentData.classGrade}.`,
        'success'
      );
    }
  };

  const handleDeleteStudentConfirm = async (student: Student) => {
    const updatedList = students.filter((s) => s.id !== student.id);
    setStudents(updatedList);
    setStoredStudents(updatedList);
    setIsDeleteModalOpen(false);
    setStudentToDelete(null);

    // Sync to Google Sheet
    const result = await triggerGoogleSheetSync('DELETE', student);

    showToast(`Deleted student ${student.name} (${student.rollNumber}). Google Sheet updated.`, 'info');

    addNotification(
      `Student Record Deleted: ${student.rollNumber}`,
      `Registration for ${student.name} was removed from the active school directory.`,
      'warning'
    );
  };

  const handleImportStudents = (newBatch: Student[]) => {
    const combined = [...newBatch, ...students];
    setStudents(combined);
    setStoredStudents(combined);
    showToast(`Imported ${newBatch.length} records. Updated school database.`, 'success');
  };

  // Notification Operations
  const addNotification = (title: string, message: string, type: 'urgent' | 'warning' | 'info' | 'success') => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Filtered Students Calculation
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.guardianPhone.includes(q) ||
        s.classGrade.toLowerCase().includes(q);

      // Class Filter
      const matchesClass = selectedClass === 'ALL' || s.classGrade === selectedClass;

      // Section Filter
      const matchesSection = selectedSection === 'ALL' || s.section === selectedSection;

      // Fee Status
      const matchesFee = selectedFeeStatus === 'ALL' || s.feeStatus === selectedFeeStatus;

      // Academic Status
      const matchesStatus = selectedStatus === 'ALL' || s.academicStatus === selectedStatus;

      return matchesSearch && matchesClass && matchesSection && matchesFee && matchesStatus;
    });
  }, [students, searchQuery, selectedClass, selectedSection, selectedFeeStatus, selectedStatus]);

  // Statistics
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.academicStatus === 'Active').length;
  const feePaidStudents = students.filter((s) => s.feeStatus === 'Paid').length;
  const scholarshipStudents = students.filter((s) => s.feeStatus === 'Scholarship').length;

  // Unique lists for dropdowns
  const uniqueClasses = useMemo(() => {
    const set = new Set(students.map((s) => s.classGrade));
    return Array.from(set).sort();
  }, [students]);

  const uniqueSections = useMemo(() => {
    const set = new Set(students.map((s) => s.section));
    return Array.from(set).sort();
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        isOnline={isOnline}
        unreadNotifCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenGoogleSheetSync={() => setIsGoogleSheetModalOpen(true)}
        onOpenEnrollStudent={() => {
          setEditingStudent(null);
          setIsFormModalOpen(true);
        }}
        onExportRosterPDF={() => exportClassRosterPDF(filteredStudents)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          showToast('Faculty session logged out.', 'info');
        }}
      />

      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40 shadow-emerald-950/80'
                : toastMessage.type === 'warning'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/40 shadow-amber-950/80'
                : 'bg-blue-950/90 text-blue-300 border-blue-500/40 shadow-blue-950/80'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Offline Banner if disconnected */}
        {!isOnline && (
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Offline Working Mode:</strong> You can continue adding, editing, and finding student records. All records are safely preserved in browser local storage and will automatically dispatch to Google Sheets once internet access resumes.
              </span>
            </div>
          </div>
        )}

        {/* Hero Header & Key Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Enrolled</p>
              <h3 className="text-xl font-black text-white">{totalStudents}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Active Students</p>
              <h3 className="text-xl font-black text-white">{activeStudents}</h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Fee Cleared</p>
              <h3 className="text-xl font-black text-white">
                {feePaidStudents}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({totalStudents ? Math.round((feePaidStudents / totalStudents) * 100) : 0}%)
                </span>
              </h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Scholarships</p>
              <h3 className="text-xl font-black text-white">{scholarshipStudents}</h3>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters, View Modes, & Action Buttons */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find student by Roll Number, Full Name, Father's Name, or Phone..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setIsFormModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition"
              >
                <PlusCircle className="w-4 h-4" />
                Enroll Student
              </button>

              <button
                onClick={() => exportClassRosterPDF(filteredStudents)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
                title="Export Filtered List as PDF Roster"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>

              <button
                onClick={() => setIsGoogleSheetModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
                title="Google Sheet Sync Status & Export"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Sheet Sync</span>
              </button>

              {/* View Switcher */}
              <div className="flex items-center rounded-xl bg-slate-950/80 p-1 border border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition ${
                    viewMode === 'table'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Table Roster View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-emerald-400" /> Filter by:
            </span>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Classes & Grades</option>
              {uniqueClasses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Sections</option>
              {uniqueSections.map((sec) => (
                <option key={sec} value={sec}>
                  Section: {sec}
                </option>
              ))}
            </select>

            {/* Fee Status Filter */}
            <select
              value={selectedFeeStatus}
              onChange={(e) => setSelectedFeeStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Fee Statuses</option>
              <option value="Paid">Paid in Full</option>
              <option value="Pending">Pending / Overdue</option>
              <option value="Scholarship">Scholarship</option>
              <option value="Concession">Concession</option>
            </select>

            {/* Academic Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Academic Statuses</option>
              <option value="Active">Active Enrolled</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
              <option value="Alumni">Alumni</option>
            </select>

            {(searchQuery ||
              selectedClass !== 'ALL' ||
              selectedSection !== 'ALL' ||
              selectedFeeStatus !== 'ALL' ||
              selectedStatus !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedClass('ALL');
                  setSelectedSection('ALL');
                  setSelectedFeeStatus('ALL');
                  setSelectedStatus('ALL');
                }}
                className="text-xs text-rose-400 hover:text-rose-300 underline font-medium ml-auto"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Banner */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{filteredStudents.length}</strong> of{' '}
            <strong className="text-white">{students.length}</strong> registered students
          </span>
          <span className="font-mono text-[11px]">
            NSSE Academic Session: 2026-2027
          </span>
        </div>

        {/* Display Students: Card Grid vs Table */}
        {viewMode === 'grid' ? (
          filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-500" />
              <p className="text-sm font-semibold">No student records match the search or filter criteria.</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching a different name, roll number, or click Enroll Student.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  onView={(std) => {
                    setSelectedStudentForDetail(std);
                    setIsDetailModalOpen(true);
                  }}
                  onEdit={(std) => {
                    setEditingStudent(std);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(std) => {
                    setStudentToDelete(std);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          )
        ) : (
          <StudentTable
            students={filteredStudents}
            onView={(std) => {
              setSelectedStudentForDetail(std);
              setIsDetailModalOpen(true);
            }}
            onEdit={(std) => {
              setEditingStudent(std);
              setIsFormModalOpen(true);
            }}
            onDelete={(std) => {
              setStudentToDelete(std);
              setIsDeleteModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/school-logo.jpg"
              alt="NSSE Seal"
              className="w-6 h-6 rounded-full object-contain p-0.5 bg-emerald-950 border border-emerald-500/40"
            />
            <span className="font-semibold text-slate-300">
              Nawaz Sharif School of Eminence (NSSE)
            </span>
          </div>
          <p className="text-[11px]">
            Student Registrar & Management System • High Performance Offline & Cloud Sync
          </p>
        </div>
      </footer>

      {/* Modals & Popups */}
      {/* 1. Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={editingStudent}
      />

      {/* 2. Detailed Student Dossier Modal */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedStudentForDetail(null);
        }}
        onEdit={(std) => {
          setEditingStudent(std);
          setIsFormModalOpen(true);
        }}
        onDelete={(std) => {
          setStudentToDelete(std);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* 3. Delete Confirmation Modal */}
      <DeleteConfirmModal
        student={studentToDelete}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setStudentToDelete(null);
        }}
        onConfirm={handleDeleteStudentConfirm}
      />

      {/* 4. Faculty MFA Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
          showToast(`Faculty verified: Welcome ${user.name} (${user.role})!`, 'success');
        }}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* 5. Google Sheet Sync & Integration Modal */}
      <GoogleSheetSyncModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        students={students}
        onImportStudents={handleImportStudents}
      />

      {/* 6. Push Notifications Drawer */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearNotifications}
        onSendAlert={(title, message, type) => {
          addNotification(title, message, type);
          showToast(`Alert broadcasted: "${title}"`, 'info');
        }}
      />
    </div>
  );
}

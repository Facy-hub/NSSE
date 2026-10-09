import React from 'react';
import {
  X,
  FileDown,
  Edit,
  Trash2,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  User,
  GraduationCap,
  ShieldAlert,
  Printer
} from 'lucide-react';
import { Student } from '../types/student';
import { exportStudentProfilePDF } from '../services/pdfService';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  if (!isOpen || !student) return null;

  const handleExportPDF = () => {
    exportStudentProfilePDF(student);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src="/school-logo.jpg"
              alt="NSSE Crest"
              className="w-10 h-10 rounded-full border border-emerald-500/40 object-contain bg-emerald-950 p-0.5"
            />
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Official Student Dossier
              </h2>
              <span className="text-xs font-mono text-emerald-400">{student.rollNumber}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Dossier Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar text-slate-200">
          {/* Main ID Profile Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/30 border border-slate-800/80 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
            <div className="relative">
              <img
                src={student.photoUrl || '/school-logo.jpg'}
                alt={student.name}
                className="w-32 h-36 rounded-xl object-cover border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950"
              />
              <span
                className={`absolute bottom-2 left-2 right-2 text-center text-[10px] font-bold py-0.5 rounded-md backdrop-blur-md ${
                  student.academicStatus === 'Active'
                    ? 'bg-emerald-500/90 text-white'
                    : 'bg-amber-500/90 text-white'
                }`}
              >
                {student.academicStatus}
              </span>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">{student.name}</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {student.gender}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    student.feeStatus === 'Paid'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : student.feeStatus === 'Scholarship'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  Fee: {student.feeStatus}
                </span>
              </div>

              <p className="text-sm text-slate-400">
                Father's Name: <span className="text-slate-200 font-semibold">{student.fatherName}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
                <span className="px-3 py-1 rounded-lg bg-emerald-900/40 text-emerald-300 font-semibold border border-emerald-500/30">
                  {student.classGrade}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  Section: {student.section}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 font-medium border border-slate-700">
                  Age: {student.age} Years
                </span>
                <span className="px-3 py-1 rounded-lg bg-rose-950/40 text-rose-300 font-bold border border-rose-500/30">
                  Blood: {student.bloodGroup}
                </span>
              </div>
            </div>
          </div>

          {/* Academic & Government Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date of Birth
              </span>
              <p className="text-sm font-semibold text-white">{student.dob || 'Not specified'}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Admission Date
              </span>
              <p className="text-sm font-semibold text-white">{student.admissionDate}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" /> B-Form / CNIC
              </span>
              <p className="text-sm font-mono font-semibold text-white">
                {student.bFormNumber || 'Verified in Admission File'}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4" /> Guardian Contact & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Primary Contact:</span>
                <span className="font-mono font-medium text-white">{student.guardianPhone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">WhatsApp Alerts:</span>
                <span className="font-mono font-medium text-white">{student.whatsapp || student.guardianPhone}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Emergency Contact:</span>
                <span className="text-white font-medium">{student.emergencyContact}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Residential Address:</span>
                <span className="text-white font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {student.address}
                </span>
              </div>
            </div>
          </div>

          {/* Health and Medical Notes */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
              <HeartPulse className="w-4 h-4" /> Medical Health Status & Infirmary Notes
            </h3>
            <p className="text-sm text-slate-300">
              {student.medicalNotes || 'No special medical conditions recorded. Verified fit for physical education.'}
            </p>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky bottom-0">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-2 transition"
          >
            <FileDown className="w-4 h-4" />
            Download Official Profile PDF
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onEdit(student);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Edit className="w-3.5 h-3.5 text-emerald-400" />
              Edit Record
            </button>
            <button
              onClick={() => {
                onDelete(student);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              Delete Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

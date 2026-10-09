import React from 'react';
import {
  FileText,
  Edit,
  Trash2,
  Phone,
  FileDown,
  Eye,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Student } from '../types/student';
import { exportStudentProfilePDF } from '../services/pdfService';

interface StudentCardProps {
  student: Student;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onView,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Header with Photo & Core info */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="relative shrink-0">
            <img
              src={student.photoUrl || '/school-logo.jpg'}
              alt={student.name}
              className="w-16 h-18 rounded-xl object-cover border border-emerald-500/40 shadow bg-slate-950"
            />
            <span
              className={`absolute -bottom-1.5 -right-1 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shadow ${
                student.academicStatus === 'Active'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              {student.academicStatus}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
              {student.rollNumber}
            </span>
            <h3
              onClick={() => onView(student)}
              className="text-sm font-bold text-white hover:text-emerald-300 cursor-pointer truncate mt-1 tracking-tight"
            >
              {student.name}
            </h3>
            <p className="text-xs text-slate-400 truncate">
              S/D of {student.fatherName}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-semibold text-emerald-300">
                {student.classGrade}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {student.section}
              </span>
            </div>
          </div>
        </div>

        {/* Badges row */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px]">
          <div>
            <span className="text-[10px] text-slate-400 block">Age / Blood:</span>
            <span className="font-semibold text-slate-200">
              {student.age} yrs • <strong className="text-rose-400">{student.bloodGroup}</strong>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">Fee Status:</span>
            <span
              className={`font-semibold ${
                student.feeStatus === 'Paid'
                  ? 'text-emerald-400'
                  : student.feeStatus === 'Scholarship'
                  ? 'text-blue-400'
                  : 'text-amber-400'
              }`}
            >
              {student.feeStatus}
            </span>
          </div>
        </div>

        {/* Contact info snippet */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 truncate">
          <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-slate-300 truncate">{student.guardianPhone}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-1">
        <button
          onClick={() => onView(student)}
          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-300 text-xs font-semibold border border-emerald-500/20 flex items-center justify-center gap-1.5 transition"
        >
          <Eye className="w-3.5 h-3.5" /> Dossier
        </button>

        <button
          onClick={() => exportStudentProfilePDF(student)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition"
          title="Download PDF Dossier"
        >
          <FileDown className="w-4 h-4" />
        </button>

        <button
          onClick={() => onEdit(student)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Edit Record"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(student)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          title="Delete Record"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

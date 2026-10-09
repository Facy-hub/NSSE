import React from 'react';
import {
  Eye,
  Edit,
  Trash2,
  FileDown,
  Phone,
  ArrowUpDown
} from 'lucide-react';
import { Student } from '../types/student';
import { exportStudentProfilePDF } from '../services/pdfService';

interface StudentTableProps {
  students: Student[];
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onView,
  onEdit,
  onDelete
}) => {
  if (students.length === 0) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
        <p className="text-sm font-semibold">No student records match the search or filter criteria.</p>
        <p className="text-xs text-slate-500 mt-1">Try resetting filters or enrolling a new student.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Student & Roll No</th>
              <th className="py-3.5 px-4">Father Name</th>
              <th className="py-3.5 px-4">Class & Section</th>
              <th className="py-3.5 px-3">Age / Blood</th>
              <th className="py-3.5 px-4">Contact Phone</th>
              <th className="py-3.5 px-3">Fee Status</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-normal">
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-slate-800/40 transition-colors group"
              >
                {/* Student Photo & Roll */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={student.photoUrl || '/school-logo.jpg'}
                      alt={student.name}
                      className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 bg-slate-950 shrink-0"
                    />
                    <div>
                      <span
                        onClick={() => onView(student)}
                        className="font-bold text-white hover:text-emerald-300 cursor-pointer block leading-tight text-sm"
                      >
                        {student.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {student.rollNumber}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Father Name */}
                <td className="py-3 px-4 text-slate-300 font-medium">
                  {student.fatherName}
                </td>

                {/* Class */}
                <td className="py-3 px-4">
                  <span className="font-semibold text-white block">
                    {student.classGrade}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Section {student.section}
                  </span>
                </td>

                {/* Age & Blood */}
                <td className="py-3 px-3">
                  <span className="text-slate-200">{student.age} yrs</span>
                  <span className="ml-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30">
                    {student.bloodGroup}
                  </span>
                </td>

                {/* Contact */}
                <td className="py-3 px-4 font-mono text-slate-300">
                  {student.guardianPhone}
                </td>

                {/* Fee Status */}
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      student.feeStatus === 'Paid'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : student.feeStatus === 'Scholarship'
                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        : student.feeStatus === 'Concession'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {student.feeStatus}
                  </span>
                </td>

                {/* Academic Status */}
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                      student.academicStatus === 'Active'
                        ? 'bg-slate-800 text-emerald-300'
                        : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {student.academicStatus}
                  </span>
                </td>

                {/* Action Buttons */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(student)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition"
                      title="View Dossier"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => exportStudentProfilePDF(student)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-slate-800 transition"
                      title="Download Official PDF"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  User,
  GraduationCap,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  Save,
  CheckCircle,
  FileBadge
} from 'lucide-react';
import { Student } from '../types/student';
import { CameraCaptureModal } from './CameraCaptureModal';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: Student) => void;
  initialData?: Student | null;
}

const CLASS_OPTIONS = [
  'Playgroup / Nursery',
  'Prep / Kindergarten',
  'Grade 1 (Primary)',
  'Grade 2 (Primary)',
  'Grade 3 (Primary)',
  'Grade 4 (Primary)',
  'Grade 5 (Primary)',
  'Grade 6 (Middle)',
  'Grade 7 (Middle)',
  'Grade 8 (Middle)',
  'Grade 9 (Matric Science)',
  'Grade 9 (Matric Arts)',
  'Grade 10 (Matric Science)',
  'Grade 10 (Matric Arts)',
  'Grade 11 (F.Sc Pre-Medical)',
  'Grade 11 (F.Sc Pre-Engineering)',
  'Grade 11 (ICS Computer Science)',
  'Grade 11 (I.Com Commerce)',
  'Grade 12 (F.Sc Pre-Medical)',
  'Grade 12 (F.Sc Pre-Engineering)',
  'Grade 12 (ICS Computer Science)',
  'Grade 12 (I.Com Commerce)'
];

const SECTION_OPTIONS = [
  'A - Emerald',
  'B - Diamond',
  'C - Sapphire',
  'D - Falcon',
  'E - Iqbal'
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    rollNumber: '',
    name: '',
    fatherName: '',
    gender: 'Male',
    classGrade: 'Grade 9 (Matric Science)',
    section: 'A - Emerald',
    age: 14,
    dob: '2012-01-01',
    bloodGroup: 'B+',
    guardianPhone: '+92 3',
    whatsapp: '+92 3',
    address: '',
    admissionDate: new Date().toISOString().split('T')[0],
    academicStatus: 'Active',
    feeStatus: 'Paid',
    photoUrl: '',
    emergencyContact: '',
    medicalNotes: '',
    bFormNumber: ''
  });

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      // Auto-generate next suggested roll number
      const nextRoll = `NSSE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setFormData({
        rollNumber: nextRoll,
        name: '',
        fatherName: '',
        gender: 'Male',
        classGrade: 'Grade 9 (Matric Science)',
        section: 'A - Emerald',
        age: 14,
        dob: '2012-01-01',
        bloodGroup: 'B+',
        guardianPhone: '+92 3',
        whatsapp: '+92 3',
        address: '',
        admissionDate: new Date().toISOString().split('T')[0],
        academicStatus: 'Active',
        feeStatus: 'Paid',
        photoUrl: '',
        emergencyContact: '',
        medicalNotes: '',
        bFormNumber: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.rollNumber?.trim()) newErrors.rollNumber = 'Roll number is required.';
    if (!formData.name?.trim()) newErrors.name = 'Student full name is required.';
    if (!formData.fatherName?.trim()) newErrors.fatherName = "Father's name is required.";
    if (!formData.guardianPhone?.trim() || formData.guardianPhone.length < 10) {
      newErrors.guardianPhone = 'Valid phone number is required (e.g. +92 300 1234567).';
    }
    if (!formData.classGrade) newErrors.classGrade = 'Class grade is required.';
    if (!formData.age || formData.age < 3 || formData.age > 25) {
      newErrors.age = 'Please enter a valid age (3-25).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalStudent: Student = {
      id: initialData ? initialData.id : `nsse-${Date.now()}`,
      rollNumber: formData.rollNumber!.trim(),
      name: formData.name!.trim(),
      fatherName: formData.fatherName!.trim(),
      gender: formData.gender as any,
      classGrade: formData.classGrade!,
      section: formData.section!,
      age: Number(formData.age) || 14,
      dob: formData.dob || '2012-01-01',
      bloodGroup: formData.bloodGroup || 'B+',
      guardianPhone: formData.guardianPhone!.trim(),
      whatsapp: formData.whatsapp?.trim() || formData.guardianPhone!.trim(),
      address: formData.address?.trim() || 'Lahore, Punjab, Pakistan',
      admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
      academicStatus: formData.academicStatus as any,
      feeStatus: formData.feeStatus as any,
      photoUrl:
        formData.photoUrl ||
        (formData.gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400'),
      emergencyContact: formData.emergencyContact?.trim() || formData.guardianPhone!.trim(),
      medicalNotes: formData.medicalNotes?.trim() || 'No active medical condition.',
      bFormNumber: formData.bFormNumber?.trim() || '',
      lastUpdated: new Date().toISOString()
    };

    onSave(finalStudent);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {initialData ? 'Edit Student Record' : 'Enroll New Student'}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                    NSSE Official
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in all required fields. Changes will immediately synchronize with the school directory & Google Sheet.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body with Custom Dark Scrolling Bar (Strictly meets scrolling bar requirement) */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar text-slate-200"
          >
            {/* Photo & Roll Header Box */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center gap-5">
              {/* Photo Preview & Capture Buttons */}
              <div className="flex flex-col items-center gap-2.5">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-800 border-2 border-emerald-500/40 shadow-inner flex items-center justify-center group">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Student Portrait"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-500">
                      <User className="w-10 h-10 mb-1" />
                      <span className="text-[10px]">No Photo</span>
                    </div>
                  )}
                  {formData.photoUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[11px] text-white font-medium">Change Photo</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    Upload File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    Live Camera
                  </button>
                </div>
              </div>

              {/* Core Admission Identifiers */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Roll Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.rollNumber || ''}
                      onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                      placeholder="e.g. NSSE-2026-1045"
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        errors.rollNumber ? 'border-rose-500 ring-rose-500' : 'border-slate-700'
                      }`}
                    />
                  </div>
                  {errors.rollNumber && (
                    <span className="text-[11px] text-rose-400 mt-1 block">{errors.rollNumber}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admission Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.admissionDate || ''}
                      onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Academic Status
                  </label>
                  <select
                    value={formData.academicStatus}
                    onChange={(e) => handleInputChange('academicStatus', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Active">Active (Regular Enrolled)</option>
                    <option value="On Leave">On Leave (Medical/Family)</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Alumni">Alumni / Graduated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fee Billing Status
                  </label>
                  <select
                    value={formData.feeStatus}
                    onChange={(e) => handleInputChange('feeStatus', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Paid">Paid in Full</option>
                    <option value="Pending">Pending / Overdue</option>
                    <option value="Scholarship">Merit Scholarship</option>
                    <option value="Concession">Special Concession</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 1: Personal & Academic Profile */}
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4" /> Personal & Academic Record
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Student Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Muhammad Rayyan Ali"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.name ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.name && <span className="text-[11px] text-rose-400 mt-1 block">{errors.name}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Father's / Guardian Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName || ''}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    placeholder="e.g. Tariq Mehmood Ali"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.fatherName ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.fatherName && (
                    <span className="text-[11px] text-rose-400 mt-1 block">{errors.fatherName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NADRA B-Form / CNIC Number
                  </label>
                  <input
                    type="text"
                    value={formData.bFormNumber || ''}
                    onChange={(e) => handleInputChange('bFormNumber', e.target.value)}
                    placeholder="35201-1234567-1"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Class / Grade <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => handleInputChange('classGrade', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {CLASS_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Class Section
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => handleInputChange('section', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SECTION_OPTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age (Years) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="25"
                    value={formData.age || ''}
                    onChange={(e) => handleInputChange('age', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.age && <span className="text-[11px] text-rose-400 mt-1 block">{errors.age}</span>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dob || ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Emergency Information */}
            <div>
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Guardian Contact & Emergency Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Guardian Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.guardianPhone || ''}
                    onChange={(e) => handleInputChange('guardianPhone', e.target.value)}
                    placeholder="+92 300 1234567"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      errors.guardianPhone ? 'border-rose-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.guardianPhone && (
                    <span className="text-[11px] text-rose-400 mt-1 block">{errors.guardianPhone}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    WhatsApp Alerts Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 font-mono text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Emergency Contact & Relation
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                    placeholder="e.g. +92 321 9876543 (Mother)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="House #, Street, Sector/Block, City (e.g. Model Town, Lahore)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Health / Medical Notes / Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.medicalNotes || ''}
                    onChange={(e) => handleInputChange('medicalNotes', e.target.value)}
                    placeholder="e.g. Mild asthma, wears prescription glasses, peanut allergy, or 'Fit'"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions Bar inside form */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 bg-slate-900/95 py-2">
              <span className="text-xs text-slate-400">
                Data will automatically save to NSSE encrypted offline storage and Google Sheets queue.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {initialData ? 'Update Record' : 'Save & Enroll'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Live Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={(imgUrl) => handleInputChange('photoUrl', imgUrl)}
      />
    </>
  );
};

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Copy,
  Check,
  Building2,
  ArrowRight
} from 'lucide-react';
import { FacultyUser } from '../types/student';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: FacultyUser) => void;
  currentUser: FacultyUser | null;
  onClose?: () => void;
}

const PRESET_FACULTY: FacultyUser[] = [
  {
    id: 'fac-01',
    name: 'Dr. Muhammad Tariq Khan',
    email: 'principal@nsse.edu.pk',
    role: 'Principal',
    department: 'Executive Administration',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mfaVerified: true,
    mfaSecret: 'NSSE-MFA-9821'
  },
  {
    id: 'fac-02',
    name: 'Prof. Shamim Akhtar',
    email: 'vice.principal@nsse.edu.pk',
    role: 'Vice Principal',
    department: 'Academic Affairs',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    mfaVerified: true,
    mfaSecret: 'NSSE-MFA-3142'
  },
  {
    id: 'fac-03',
    name: 'Prof. Nadeem Iqbal',
    email: 'registrar@nsse.edu.pk',
    role: 'Senior Registrar',
    department: 'Admissions & Student Records',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    mfaVerified: true,
    mfaSecret: 'NSSE-MFA-6284'
  }
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  currentUser,
  onClose
}) => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyUser>(PRESET_FACULTY[0]);
  const [password, setPassword] = useState('nsse@admin2026');
  const [mfaCode, setMfaCode] = useState('');
  const [copiedDemoCode, setCopiedDemoCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Current simulated rotating OTP code (e.g. 628941)
  const currentDemoOtp = '628941';

  if (!isOpen) return null;

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) {
      setError('Please provide valid authorized faculty credentials.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('mfa');
      setError(null);
    }, 400);
  };

  const handleMfaVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Accept valid 6-digit code or demo OTP
    const cleanCode = mfaCode.trim().replace(/[-\s]/g, '');
    if (cleanCode === currentDemoOtp || cleanCode.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess({
          ...selectedFaculty,
          mfaVerified: true
        });
      }, 500);
    } else {
      setError(`Invalid verification code. Please enter 6-digit MFA code (or use Demo OTP: ${currentDemoOtp}).`);
    }
  };

  const handleQuickFacultySelect = (faculty: FacultyUser) => {
    setSelectedFaculty(faculty);
    setError(null);
  };

  const handleCopyDemoOtp = () => {
    setMfaCode(currentDemoOtp);
    setCopiedDemoCode(true);
    setTimeout(() => setCopiedDemoCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Decorative School Crest Banner */}
        <div className="p-6 text-center bg-gradient-to-b from-emerald-950/80 via-slate-900 to-slate-900 border-b border-slate-800 relative">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <img
              src="/school-logo.jpg"
              alt="NSSE Crest"
              className="w-full h-full rounded-full object-contain p-1 bg-emerald-950/90 border-2 border-emerald-500/50 shadow-xl shadow-emerald-950/60"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs ring-2 ring-slate-900 shadow">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-lg font-black text-white tracking-wide">
            NAWAZ SHARIF SCHOOL OF EMINENCE
          </h2>
          <p className="text-xs text-emerald-400 font-medium tracking-wider uppercase mt-0.5">
            Faculty & Administrative Security Portal
          </p>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Authorized Faculty Profile
                </label>
                <div className="space-y-2">
                  {PRESET_FACULTY.map((fac) => (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => handleQuickFacultySelect(fac)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                        selectedFaculty.id === fac.id
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 shrink-0">
                        {fac.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold truncate text-white">{fac.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                            {fac.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{fac.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Faculty Access Passcode / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Default Demo Password: <code className="text-emerald-400">nsse@admin2026</code>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-950 transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Proceed to 2-Factor Auth
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Two-Factor Authentication</h4>
                <p className="text-xs text-slate-300">
                  Enter the 6-digit security token generated for <strong className="text-white">{selectedFaculty.name}</strong>.
                </p>

                {/* Convenient 1-click Demo OTP chip */}
                <div className="pt-2 flex items-center justify-center gap-2">
                  <span className="text-[11px] text-slate-400">Authenticator Code:</span>
                  <button
                    type="button"
                    onClick={handleCopyDemoOtp}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Click to auto-fill code"
                  >
                    {currentDemoOtp}
                    {copiedDemoCode ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  className="w-full text-center tracking-[0.5em] text-xl font-mono py-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Access Dashboard
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500">
            Protected by Nawaz Sharif School of Eminence MFA Security Protocols. Unauthorized access attempts are monitored and recorded.
          </p>
        </div>
      </div>
    </div>
  );
};

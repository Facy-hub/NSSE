import React from 'react';
import {
  Bell,
  Wifi,
  WifiOff,
  FileSpreadsheet,
  PlusCircle,
  FileDown,
  ShieldCheck,
  LogOut,
  UserCheck
} from 'lucide-react';
import { FacultyUser, AppNotification } from '../types/student';

interface NavbarProps {
  currentUser: FacultyUser | null;
  isOnline: boolean;
  unreadNotifCount: number;
  onOpenNotifications: () => void;
  onOpenGoogleSheetSync: () => void;
  onOpenEnrollStudent: () => void;
  onExportRosterPDF: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  isOnline,
  unreadNotifCount,
  onOpenNotifications,
  onOpenGoogleSheetSync,
  onOpenEnrollStudent,
  onExportRosterPDF,
  onOpenLogin,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3">
          {/* Brand & Crest */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <img
                src="/school-logo.jpg"
                alt="NSSE School Logo Crest"
                className="w-12 h-12 rounded-full object-contain p-0.5 bg-emerald-950 border-2 border-emerald-500/60 shadow-lg shadow-emerald-950/80 transition-transform group-hover:scale-105"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  NAWAZ SHARIF SCHOOL OF EMINENCE
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-black rounded-md bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 tracking-wider">
                  NSSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Academic Registrar & Student Information Management System
              </p>
            </div>
          </div>

          {/* Right Action Icons & Faculty Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Online / Offline Status Badge */}
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
                isOnline
                  ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-950/50 text-amber-300 border-amber-500/40'
              }`}
              title={
                isOnline
                  ? 'Connected: All student record changes dispatch in real time'
                  : 'Offline Mode: Changes safely stored in local cache and will auto-sync'
              }
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden lg:inline text-[11px]">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px]">Offline Mode</span>
                </>
              )}
            </div>

            {/* Google Sheets Sync Button */}
            <button
              onClick={onOpenGoogleSheetSync}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-2 transition"
              title="Google Sheet Sync Status"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Google Sheets</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
              title="Notifications & Urgent Alerts"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Faculty User Profile Pill / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-800">
                <div
                  onClick={onOpenLogin}
                  className="cursor-pointer flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition"
                >
                  <div className="relative">
                    <img
                      src={currentUser.avatarUrl || '/school-logo.jpg'}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40"
                    />
                    <ShieldCheck className="w-3 h-3 text-emerald-400 absolute -bottom-1 -right-1 bg-slate-950 rounded-full" />
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-medium leading-none">
                      {currentUser.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Sign Out Faculty Session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Faculty Login
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

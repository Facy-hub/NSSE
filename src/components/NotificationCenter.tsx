import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Megaphone,
  Volume2,
  Trash2,
  CheckCheck,
  Send
} from 'lucide-react';
import { AppNotification } from '../types/student';

interface NotificationCenterProps {
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendAlert: (title: string, message: string, type: 'urgent' | 'warning' | 'info') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onClearAll,
  onSendAlert
}) => {
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'urgent' | 'warning' | 'info'>('urgent');

  if (!isOpen) return null;

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertMessage.trim()) return;

    onSendAlert(alertTitle.trim(), alertMessage.trim(), alertType);

    // Try web browser push notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`NSSE Alert: ${alertTitle}`, {
          body: alertMessage,
          icon: '/school-logo.jpg'
        });
      } catch {
        // Safe fallback
      }
    }

    setAlertTitle('');
    setAlertMessage('');
    setShowBroadcastForm(false);
  };

  const requestBrowserPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('NSSE Push Notifications Enabled', {
          body: 'You will now receive instant push alerts for urgent school announcements.',
          icon: '/school-logo.jpg'
        });
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden mt-14 sm:mt-12 mr-0 sm:mr-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                System Alerts & Push Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">Real-time alerts for faculty and administration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick controls toolbar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBroadcastForm(!showBroadcastForm)}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition"
            >
              <Megaphone className="w-3.5 h-3.5 text-emerald-400" />
              {showBroadcastForm ? 'Cancel Broadcast' : 'Broadcast Urgent Alert'}
            </button>
            <button
              onClick={requestBrowserPushPermission}
              className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium border border-slate-700 flex items-center gap-1 transition"
              title="Enable OS/Device Push Notifications"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Push Opt-in
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-slate-400 hover:text-white transition flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-slate-400 hover:text-rose-400 transition"
                title="Clear all alerts"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Broadcast Form Drawer */}
        {showBroadcastForm && (
          <form
            onSubmit={handleBroadcast}
            className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-3 animate-in slide-in-from-top-2"
          >
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-rose-400" />
              Send Urgent Notice to Faculty & Campus
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="Alert Subject (e.g. Weather Warning / Exam Shift)"
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <textarea
                value={alertMessage}
                onChange={(e) => setAlertMessage(e.target.value)}
                placeholder="Enter urgent message details..."
                rows={2}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                required
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded-lg bg-slate-900 border border-slate-700 text-slate-300"
                >
                  <option value="urgent">Urgent Alert (Red)</option>
                  <option value="warning">Warning / Reminder (Amber)</option>
                  <option value="info">General Circular (Blue)</option>
                </select>

                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow transition"
                >
                  <Send className="w-3 h-3" /> Broadcast Now
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Notifications List (Scrollable) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 custom-scrollbar p-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications at this moment.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 transition-colors flex items-start gap-3 ${
                  notif.read ? 'bg-slate-900/40 opacity-75' : 'bg-slate-900/90'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                    notif.type === 'urgent'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : notif.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : notif.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {notif.type === 'urgent' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : notif.type === 'warning' ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : notif.type === 'success' ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <Info className="w-3.5 h-3.5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-white truncate">{notif.title}</h5>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

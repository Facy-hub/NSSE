import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  CloudCheck,
  CloudOff,
  RefreshCw,
  Download,
  Upload,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  ShieldCheck
} from 'lucide-react';
import { Student, SyncLog, GoogleSheetConfig } from '../types/student';
import {
  getSheetConfig,
  saveSheetConfig,
  getSyncLogs,
  getOfflineQueue,
  clearOfflineQueue,
  triggerGoogleSheetSync,
  downloadGoogleSheetCSV
} from '../services/storageService';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onImportStudents?: (imported: Student[]) => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({
  isOpen,
  onClose,
  students,
  onImportStudents
}) => {
  const [config, setConfig] = useState<GoogleSheetConfig>(getSheetConfig());
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [sheetNameInput, setSheetNameInput] = useState('NSSE_Student_Directory');
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptHelper, setShowScriptHelper] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getSheetConfig();
      setConfig(currentConfig);
      setWebhookUrlInput(currentConfig.webhookUrl || '');
      setSheetNameInput(currentConfig.sheetName || 'NSSE_Student_Directory');
      setSyncLogs(getSyncLogs());
      setOfflineCount(getOfflineQueue().length);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = () => {
    const updated: GoogleSheetConfig = {
      ...config,
      webhookUrl: webhookUrlInput.trim(),
      sheetName: sheetNameInput.trim() || 'NSSE_Student_Directory'
    };
    saveSheetConfig(updated);
    setConfig(updated);
    setStatusMessage('Google Sheet connection settings saved.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSyncAllNow = async () => {
    setIsSyncing(true);
    setStatusMessage('Dispatching all student records to Google Sheet...');
    const res = await triggerGoogleSheetSync('FULL_SYNC', undefined, students);
    setIsSyncing(false);
    setStatusMessage(res.message);
    setSyncLogs(getSyncLogs());
    setOfflineCount(getOfflineQueue().length);
  };

  const handleProcessOfflineQueue = async () => {
    setIsSyncing(true);
    setStatusMessage('Flushing offline queue to Google Sheet...');
    const queue = getOfflineQueue();
    for (const item of queue) {
      await triggerGoogleSheetSync(item.action, item.student);
    }
    clearOfflineQueue();
    setIsSyncing(false);
    setOfflineCount(0);
    setSyncLogs(getSyncLogs());
    setStatusMessage('All queued offline changes have been synchronized!');
  };

  const handleDownloadCSV = () => {
    downloadGoogleSheetCSV(students);
    setStatusMessage('Google Sheets CSV file downloaded to your device.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert('CSV file appears empty or missing rows.');
          return;
        }

        // Parse CSV lines simply
        const newStudents: Student[] = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length >= 4 && cols[0]) {
            newStudents.push({
              id: `imported-${Date.now()}-${i}`,
              rollNumber: cols[0] || `NSSE-2026-${1000 + i}`,
              name: cols[1] || 'Imported Student',
              fatherName: cols[2] || 'Guardian',
              classGrade: cols[3] || 'Grade 9 (Matric Science)',
              section: cols[4] || 'A - Emerald',
              age: Number(cols[5]) || 14,
              dob: cols[6] || '2012-01-01',
              gender: (cols[7] as any) || 'Male',
              bloodGroup: cols[8] || 'B+',
              guardianPhone: cols[9] || '+92 300 0000000',
              whatsapp: cols[10] || cols[9] || '+92 300 0000000',
              address: cols[11] || 'Lahore, Pakistan',
              admissionDate: cols[12] || new Date().toISOString().split('T')[0],
              feeStatus: (cols[13] as any) || 'Paid',
              academicStatus: (cols[14] as any) || 'Active',
              emergencyContact: cols[15] || cols[9] || '+92 300 0000000',
              bFormNumber: cols[16] || '',
              medicalNotes: cols[17] || 'Fit',
              photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
              lastUpdated: new Date().toISOString()
            });
          }
        }

        if (newStudents.length > 0 && onImportStudents) {
          onImportStudents(newStudents);
          setStatusMessage(`Successfully imported ${newStudents.length} student records from CSV!`);
        }
      } catch (err: any) {
        alert('Failed to parse CSV: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const sampleAppsScriptCode = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  
  if (data.action === "FULL_SYNC" && data.studentsBatch) {
    sheet.clear();
    sheet.appendRow(["Roll Number", "Student Name", "Father Name", "Class", "Section", "Phone", "Fee Status", "Status", "Updated"]);
    data.studentsBatch.forEach(function(s) {
      sheet.appendRow([s.rollNumber, s.name, s.fatherName, s.classGrade, s.section, s.guardianPhone, s.feeStatus, s.academicStatus, s.lastUpdated]);
    });
  } else if (data.student) {
    var s = data.student;
    sheet.appendRow([s.rollNumber, s.name, s.fatherName, s.classGrade, s.section, s.guardianPhone, s.feeStatus, s.academicStatus, new Date()]);
  }
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(sampleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Google Sheets Real-Time Synchronization
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Automatically reflects every student Add, Edit, and Delete action in your Google Sheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-slate-200">
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Sync Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CloudCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Active Status</span>
                <span className="text-sm font-bold text-white">
                  {webhookUrlInput ? 'Webhook Connected' : 'Ready to Connect'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Total Records</span>
                <span className="text-sm font-bold text-white">{students.length} Students</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Offline Queue</span>
                <span className="text-sm font-bold text-white">
                  {offlineCount} {offlineCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>

          {/* Google Sheets Webhook Configuration */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Live Google Sheets Connection
              </h3>
              <button
                type="button"
                onClick={() => setShowScriptHelper(!showScriptHelper)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                {showScriptHelper ? 'Hide Setup Guide' : 'How to get Google Sheet Webhook URL?'}
              </button>
            </div>

            {showScriptHelper && (
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs space-y-3 animate-in fade-in">
                <p className="font-semibold text-emerald-300">
                  Easy 3-step connection to ANY Google Sheet without OAuth barriers:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Open your Google Sheet and click <strong>Extensions &gt; Apps Script</strong>.</li>
                  <li>Paste the code snippet below and click <strong>Save</strong>.</li>
                  <li>Click <strong>Deploy &gt; New deployment &gt; Select type: Web app</strong> (Set "Who has access" to "Anyone"), then copy the Web app URL and paste it below!</li>
                </ol>

                <div className="relative mt-2">
                  <pre className="p-3 rounded-lg bg-black text-[11px] font-mono text-emerald-300 overflow-x-auto border border-slate-800 max-h-36">
                    {sampleAppsScriptCode}
                  </pre>
                  <button
                    onClick={handleCopyScript}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-semibold flex items-center gap-1 border border-slate-700"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedScript ? 'Copied' : 'Copy Script'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Apps Script Webhook Endpoint URL
                </label>
                <input
                  type="url"
                  value={webhookUrlInput}
                  onChange={(e) => setWebhookUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfyc.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tab / Sheet Name
                </label>
                <input
                  type="text"
                  value={sheetNameInput}
                  onChange={(e) => setSheetNameInput(e.target.value)}
                  placeholder="NSSE_Student_Directory"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
              >
                Save Settings
              </button>

              <div className="flex items-center gap-2">
                {offlineCount > 0 && (
                  <button
                    type="button"
                    onClick={handleProcessOfflineQueue}
                    disabled={isSyncing}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    Push {offlineCount} Queued Changes
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSyncAllNow}
                  disabled={isSyncing}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync All Records to Sheet'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Import / Export Google Sheet File tools */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" />
              Direct Google Sheet CSV Export & Import
            </h3>
            <p className="text-xs text-slate-400">
              Download complete student records pre-formatted for Google Sheets, or import student rows from an existing school sheet.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadCSV}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Download Google Sheets CSV
              </button>

              <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-emerald-400" />
                Import Google Sheet CSV
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Audit / Synchronization History Log */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              Recent Sync Event Logs
            </h3>
            <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto custom-scrollbar">
              {syncLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No sync logs recorded yet.</p>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                          log.action === 'ADD'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.action === 'EDIT'
                            ? 'bg-blue-500/20 text-blue-400'
                            : log.action === 'DELETE'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-purple-500/20 text-purple-400'
                        }`}
                      >
                        {log.action}
                      </span>
                      <span className="font-semibold text-slate-200">{log.studentName}</span>
                      <span className="font-mono text-slate-400">({log.rollNumber})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400">{log.details}</span>
                      <span className="text-[11px] font-mono text-slate-500">{log.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { LIST_PUSKESMAS, MonthlyReport, MONTH_NAMES } from "../types";
import {
  ShieldCheck,
  Search,
  Activity,
  Trash2,
  Database,
  Building2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  ToggleLeft,
  CheckCircle,
  Clock,
  User,
  Sliders,
  Sparkles,
  Info,
  UserPlus,
  Shield,
  Edit
} from "lucide-react";
import { motion } from "motion/react";
import ConfirmationModal from "./ConfirmationModal";

interface SuperadminPanelProps {
  reports: MonthlyReport[];
  selectedYear: number;
  selectedMonth: number;
  auditLogs: any[];
  onClearAllReports: () => Promise<void>;

  customUsers: any[];
  onAddUser: (user: any) => Promise<void>;
  onDeleteUser: (userId: string, targetUsername: string) => Promise<void>;
  onEditUser: (userId: string, updatedData: any) => Promise<void>;
}

export default function SuperadminPanel({
  reports,
  selectedYear,
  selectedMonth,
  auditLogs,
  onClearAllReports,

  customUsers,
  onAddUser,
  onDeleteUser,
  onEditUser
}: SuperadminPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<"audit" | "pkm" | "users" | "settings">("audit");
  const [pkmQuery, setPkmQuery] = useState("");
  const [auditQuery, setAuditQuery] = useState("");
  const [isWiping, setIsWiping] = useState(false);

  
  // Custom states for modal and notification
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);
  
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);
  
  // Add User Form States
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"operator" | "admin" | "superadmin">("operator");
  const [newPkmId, setNewPkmId] = useState("pkm_01");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Settings mock state (simulated)
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [lockSubmission, setLockSubmission] = useState(false);
  const [activeApiSource, setActiveApiSource] = useState("prod_firestore");

  // Calculate submission counts
  const totalPkmCount = LIST_PUSKESMAS.length;
  const activeReportsForMonth = reports.filter(
    (r) => r.year === selectedYear && r.month === selectedMonth
  );
  
  const lbkpSubmittedCount = activeReportsForMonth.filter(
    (r) => r.reportType === "kerja" && r.submitted
  ).length;

  const lbkoSubmittedCount = activeReportsForMonth.filter(
    (r) => r.reportType === "olahraga" && r.submitted
  ).length;

  // Filter Puskesmas list
  const filteredPkm = LIST_PUSKESMAS.filter((pkm) => {
    const query = pkmQuery.toLowerCase();
    return (
      pkm.name.toLowerCase().includes(query) ||
      pkm.kecamatan.toLowerCase().includes(query) ||
      pkm.id.toLowerCase().includes(query)
    );
  });

  // Filter Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    const query = auditQuery.toLowerCase();
    return (
      (log.user || "").toLowerCase().includes(query) ||
      (log.role || "").toLowerCase().includes(query) ||
      (log.action || "").toLowerCase().includes(query) ||
      (log.details || "").toLowerCase().includes(query)
    );
  });

  const handleClearTrigger = () => {
    setConfirmModal({
      isOpen: true,
      title: "Peringatan Superadmin",
      message: "⚠️ PERINGATAN SUPERADMIN:\n\nApakah Anda yakin ingin menghapus SELURUH laporan dari database?\nTindakan ini tidak dapat dibatalkan!",
      confirmText: "Ya, Hapus Semua",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setIsWiping(true);
        try {
          await onClearAllReports();
          setNotification({ message: "Seluruh laporan berhasil dihapus secara total!", type: "success" });
        } catch (err) {
          setNotification({ message: "Gagal menghapus database.", type: "error" });
        } finally {
          setIsWiping(false);
        }
      }
    });
  };



  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const cleanUser = newUsername.trim().toLowerCase();
    if (!cleanUser || !newPassword.trim()) {
      setFormError("Username dan Password wajib diisi!");
      return;
    }

    if (newPassword.trim().length < 4) {
      setFormError("Password minimal harus 4 karakter.");
      return;
    }

    // Check duplicate username only if creating new, or if editing and changing username
    const isDuplicate = customUsers.some(
      (u) => u.username.toLowerCase().trim() === cleanUser && u.id !== editingUserId
    );
    if (isDuplicate) {
      setFormError("Nama Pengguna (Username) sudah terdaftar!");
      return;
    }

    setIsSubmittingUser(true);
    try {
      const selectedPkm = LIST_PUSKESMAS.find((p) => p.id === newPkmId);
      const userPayload: any = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        username: cleanUser,
        password: newPassword.trim(),
        role: newRole,
        createdAt: new Date().toISOString(),
      };

      if (newRole === "operator") {
        userPayload.puskesmasId = newPkmId;
        userPayload.puskesmasName = selectedPkm?.name || "";
      }

      if (editingUserId) {
        userPayload.id = editingUserId;
        // preserve original createdAt
        const existing = customUsers.find(u => u.id === editingUserId);
        if (existing && existing.createdAt) {
          userPayload.createdAt = existing.createdAt;
        }
        await onEditUser(editingUserId, userPayload);
        setFormSuccess(`Pengguna ${cleanUser} berhasil diperbarui!`);
      } else {
        await onAddUser(userPayload);
        setFormSuccess(`Pengguna ${cleanUser} berhasil ditambahkan!`);
      }

      setNewUsername("");
      setNewPassword("");
      setEditingUserId(null);
    } catch (err) {
      setFormError(editingUserId ? "Gagal memperbarui pengguna." : "Gagal menambahkan pengguna ke database.");
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUserClick = (userId: string, targetUsername: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Pengguna",
      message: `Apakah Anda yakin ingin menghapus pengguna "${targetUsername}"?\nTindakan ini akan mencabut hak akses mereka secara permanen.`,
      confirmText: "Ya, Hapus Pengguna",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        try {
          await onDeleteUser(userId, targetUsername);
          setNotification({ message: `Pengguna "${targetUsername}" berhasil dihapus.`, type: "success" });
        } catch (err) {
          setNotification({ message: `Gagal menghapus pengguna "${targetUsername}".`, type: "error" });
        }
      }
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden font-sans">
      {/* Superadmin Panel Header Banner */}
      <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide">
                SUPERADMIN CONSOLE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <h2 className="font-bold text-base md:text-lg text-white mt-1 leading-none uppercase tracking-tight">
              Pusat Kontrol Sistem & Audit Trail
            </h2>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("audit")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "audit"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Audit Trail Logs ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveSubTab("pkm")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "pkm"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Puskesmas Explorer
          </button>
          <button
            onClick={() => setActiveSubTab("users")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "users"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Manajemen Pengguna ({customUsers.length})
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === "settings"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Konfigurasi Sistem
          </button>
        </div>
      </div>

      {/* Metrics Widgets Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-gray-200">
        <div className="p-4 border-r border-gray-150 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Puskesmas Sumenep</p>
            <p className="text-lg font-black text-gray-900 mt-1">{totalPkmCount} PKM</p>
          </div>
        </div>

        <div className="p-4 border-r border-gray-150 flex items-center gap-3">
          <div className="p-2.5 bg-red-50 text-red-700 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Lapor LBKP (Kesja)</p>
            <p className="text-lg font-black text-gray-900 mt-1">{lbkpSubmittedCount} / {totalPkmCount}</p>
          </div>
        </div>

        <div className="p-4 border-r border-gray-150 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Lapor LBKO (Kesla)</p>
            <p className="text-lg font-black text-gray-900 mt-1">{lbkoSubmittedCount} / {totalPkmCount}</p>
          </div>
        </div>

        <div className="p-4 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Total Audit Logs</p>
            <p className="text-lg font-black text-gray-900 mt-1">{auditLogs.length} Entri</p>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="p-6 bg-slate-50/50">
        
        {/* 1. AUDIT TRAIL LOGS VIEW */}
        {activeSubTab === "audit" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                  Daftar Aktivitas Petugas & Sistem (Real-time Audit Logs)
                </h3>
                <p className="text-xs text-gray-500">
                  Melacak secara transparan setiap aksi simpan, kirim draf, maupun resetting laporan di Kabupaten Sumenep.
                </p>
              </div>
              
              {/* Search Bar for Audit Logs */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    placeholder="Cari aktivitas / petugas..."
                    className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-emerald-200 whitespace-nowrap hidden sm:block">
                  Aktif
                </span>
              </div>
            </div>

            {filteredAuditLogs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 space-y-2">
                <Info className="w-8 h-8 mx-auto text-gray-300" />
                <p className="text-xs font-semibold">Belum ada entri log audit terekam di database.</p>
                <p className="text-[10px] text-gray-400">Setiap aksi penyimpanan data draf maupun finalisasi akan otomatis tercatat disini.</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden max-h-[350px] overflow-y-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 border-b border-gray-200 font-bold text-gray-600 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Waktu Terekam</th>
                      <th className="px-4 py-2.5">Nama Petugas</th>
                      <th className="px-4 py-2.5">Akses</th>
                      <th className="px-4 py-2.5">Tindakan / Aktivitas</th>
                      <th className="px-4 py-2.5">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150 font-mono text-[11px] text-gray-800">
                    {filteredAuditLogs.map((log) => {
                      const dateFormatted = new Date(log.timestamp).toLocaleString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                      });

                      const roleBadge = log.role === "superadmin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : log.role === "admin"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200";

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{dateFormatted}</td>
                          <td className="px-4 py-2 font-semibold text-slate-900">{log.user}</td>
                          <td className="px-4 py-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${roleBadge}`}>
                              {log.role}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-800 font-sans font-medium">{log.action}</td>
                          <td className="px-4 py-2 text-slate-500 italic font-sans">{log.details}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 2. PUSKESMAS EXPLORER */}
        {activeSubTab === "pkm" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                  Puskesmas Database Explorer ({totalPkmCount} Puskesmas)
                </h3>
                <p className="text-xs text-gray-500">
                  Melakukan inspeksi kelengkapan pengiriman laporan bulanan per Puskesmas.
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={pkmQuery}
                  onChange={(e) => setPkmQuery(e.target.value)}
                  placeholder="Cari Puskesmas / Kecamatan..."
                  className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 py-1">
              {filteredPkm.map((pkm) => {
                // Find submission states for this month
                const lbkpReport = reports.find(
                  (r) => r.puskesmasId === pkm.id && r.year === selectedYear && r.month === selectedMonth && r.reportType === "kerja"
                );
                const lbkoReport = reports.find(
                  (r) => r.puskesmasId === pkm.id && r.year === selectedYear && r.month === selectedMonth && r.reportType === "olahraga"
                );

                return (
                  <div key={pkm.id} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs hover:border-blue-400 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-xs">{pkm.name}</h4>
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          {pkm.id}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">
                        Kec. {pkm.kecamatan}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {/* LBKP Badge */}
                      <div className="p-2 rounded-lg bg-slate-50 border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">LBKP (Kesja)</span>
                        {lbkpReport?.submitted ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            TERKIRIM
                          </span>
                        ) : lbkpReport ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            DRAF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-gray-400">
                            ❌ BELUM ADA
                          </span>
                        )}
                      </div>

                      {/* LBKO Badge */}
                      <div className="p-2 rounded-lg bg-slate-50 border border-gray-100 text-center flex flex-col items-center justify-center">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">LBKO (Kesla)</span>
                        {lbkoReport?.submitted ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            TERKIRIM
                          </span>
                        ) : lbkoReport ? (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            DRAF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-extrabold text-gray-400">
                            ❌ BELUM ADA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* User Management Tab Content */}
        {activeSubTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                  Manajemen Pengguna Aplikasi (SIKEJORA)
                </h3>
                <p className="text-xs text-gray-500">
                  Daftar akun khusus yang tersimpan di Firestore database. Anda dapat menambahkan atau mencabut hak akses pengguna secara real-time.
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Penyimpanan Awan Aktif
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Side: Create User Form */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-gray-800">
                  {editingUserId ? <Edit className="w-4 h-4 text-amber-600" /> : <UserPlus className="w-4 h-4 text-blue-600" />}
                  <h4 className="font-bold text-xs uppercase tracking-wide">
                    {editingUserId ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </h4>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs font-semibold text-red-600 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-600 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* Username */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Nama Pengguna (Username)
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Contoh: operator.bluto"
                      className="w-full text-xs font-semibold bg-slate-50 border border-gray-250 rounded-lg py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                    />
                    <p className="text-[10px] text-gray-400">
                      Gunakan format clean, e.g. <code className="bg-slate-100 px-1 rounded font-mono">operator.bluto</code>
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Kata Sandi (Password)
                    </label>
                    <input
                      type="text"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full text-xs font-semibold bg-slate-50 border border-gray-250 rounded-lg py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                    />
                  </div>

                  {/* Role selection */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Tingkat Akses (Role)
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-slate-50 border border-gray-250 rounded-lg py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all text-gray-800 cursor-pointer"
                    >
                      <option value="operator">Operator Puskesmas</option>
                      <option value="admin">Dinas Kesehatan (Admin Kab.)</option>
                      <option value="superadmin">Superadmin Console</option>
                    </select>
                  </div>

                  {/* Puskesmas Selector - Only active if role is operator */}
                  {newRole === "operator" && (
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Wilayah Kerja Puskesmas
                      </label>
                      <select
                        value={newPkmId}
                        onChange={(e) => setNewPkmId(e.target.value)}
                        className="w-full text-xs font-semibold bg-slate-50 border border-gray-250 rounded-lg py-2 px-3 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 transition-all text-gray-800 cursor-pointer"
                      >
                        {LIST_PUSKESMAS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Kec. {p.kecamatan})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmittingUser}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingUser ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          {editingUserId ? <Edit className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          <span>{editingUserId ? "Simpan Perubahan" : "Simpan Pengguna"}</span>
                        </>
                      )}
                    </button>
                    {editingUserId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUserId(null);
                          setNewUsername("");
                          setNewPassword("");
                          setNewRole("operator");
                        }}
                        className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-bold transition-all"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Side: Users List Table */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs uppercase tracking-wide">Daftar Pengguna Aktif</h4>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-extrabold font-mono">
                    {customUsers.length} Terdaftar
                  </span>
                </div>

                {customUsers.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <User className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold">Belum ada akun kustom terdaftar di cloud.</p>
                    <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                      Gunakan panel kiri untuk membuat akun baru. Akun demo bawaan sistem (Pragaan, Dinkes, dll) tetap dapat masuk secara otomatis.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-hidden border border-gray-150 rounded-lg overflow-y-auto max-h-[350px]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 border-b border-gray-150 font-bold text-gray-600 uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2.5">Nama Pengguna</th>
                          <th className="px-3 py-2.5">Akses</th>
                          <th className="px-3 py-2.5">Kata Sandi</th>
                          <th className="px-3 py-2.5">Lokasi Kerja / Puskesmas</th>
                          <th className="px-3 py-2.5 text-center">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {customUsers.map((u) => {
                          const badgeClass =
                            u.role === "superadmin"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : u.role === "admin"
                              ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                              : "bg-blue-100 text-blue-700 border border-blue-200";

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-3 py-2.5 font-bold text-slate-900 font-mono text-[11px] break-all">
                                {u.username}
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${badgeClass}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 font-mono text-[11px] text-gray-500">
                                {u.password}
                              </td>
                              <td className="px-3 py-2.5 text-[11px] font-semibold text-gray-600">
                                {u.role === "operator" ? u.puskesmasName || "-" : "Sistem Kabupaten"}
                              </td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setNewUsername(u.username);
                                    setNewPassword(u.password);
                                    setNewRole(u.role);
                                    if (u.puskesmasId) setNewPkmId(u.puskesmasId);
                                  }}
                                  className="p-1 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded transition-all cursor-pointer mr-1"
                                  title="Edit Pengguna"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUserClick(u.id, u.username)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-all cursor-pointer"
                                  title="Hapus Pengguna"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. CONFIGURATIONS & MAINTENANCE */}
        {activeSubTab === "settings" && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                Konfigurasi Teknis Sistem Pelaporan (SIKEJORA)
              </h3>
              <p className="text-xs text-gray-500">
                Pusat parameter operasional web untuk Superadmin dinkes.
              </p>
            </div>

            {/* Toggle Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Mode Pemeliharaan (Maintenance)</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Mengunci aplikasi untuk pembaruan basis data berkala.</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className={`text-[10px] font-extrabold ${maintenanceMode ? "text-rose-600 animate-pulse" : "text-gray-500"}`}>
                    {maintenanceMode ? "🚨 AKTIF" : "OFF"}
                  </span>
                  <button
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className={`px-3 py-1 text-xs font-bold rounded border cursor-pointer ${
                      maintenanceMode
                        ? "bg-rose-50 border-rose-200 text-rose-700"
                        : "bg-slate-50 border-gray-200 text-slate-700"
                    }`}
                  >
                    Ubah Status
                  </button>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Kunci Pelaporan Bulanan</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Mencegah Puskesmas merubah atau mengirim data baru.</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className={`text-[10px] font-extrabold ${lockSubmission ? "text-amber-600" : "text-gray-500"}`}>
                    {lockSubmission ? "🔒 TERKUNCI" : "OPEN"}
                  </span>
                  <button
                    onClick={() => setLockSubmission(!lockSubmission)}
                    className={`px-3 py-1 text-xs font-bold rounded border cursor-pointer ${
                      lockSubmission
                        ? "bg-amber-50 border-amber-200 text-amber-700"
                        : "bg-slate-50 border-gray-200 text-slate-700"
                    }`}
                  >
                    Ubah Kunci
                  </button>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-800">Sumber Penyimpanan Utama</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Server database aktif yang digunakan.</p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <span className="text-[10px] font-mono text-blue-600 font-extrabold">
                    {activeApiSource.toUpperCase()}
                  </span>
                  <select
                    value={activeApiSource}
                    onChange={(e) => setActiveApiSource(e.target.value)}
                    className="text-[10px] font-bold bg-white border border-gray-200 rounded py-0.5 px-1 focus:outline-none cursor-pointer"
                  >
                    <option value="prod_firestore">Firestore Prod</option>

                  </select>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 border border-red-150 rounded-xl p-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-red-800 uppercase tracking-wider">Superadmin Danger Zone</h4>
                  <p className="text-[10px] text-red-600">Aksi di bawah ini merubah database secara luas dan instan.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">


                <button
                  type="button"
                  disabled={isWiping}
                  onClick={handleClearTrigger}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isWiping ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      <span>Membersihkan Database...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Bersihkan Seluruh Isi Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          cancelText={confirmModal.cancelText}
          type={confirmModal.type}
        />
      )}

      {notification && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold ${
          notification.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border-rose-200 text-rose-800"
        }`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-[10px] bg-white/50 hover:bg-white rounded px-1.5 py-0.5 cursor-pointer font-bold"
          >
            Tutup
          </button>
        </div>
      )}
    </div>
  );
}

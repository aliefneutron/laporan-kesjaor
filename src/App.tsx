/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { onSnapshot, collection, doc, setDoc, getDoc, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { db, OperationType, handleFirestoreError, auth } from "./firebase";
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from "firebase/auth";
import {
  MonthlyReport,
  LIST_PUSKESMAS,
  MONTH_NAMES,
  ReportType,
  INITIAL_KERJA_VALUES,
  INITIAL_OLAHRAGA_VALUES,
  KerjaValues,
  OlahragaValues,
  LIST_DISEASES,
} from "./types";
import ReportFormKerja from "./components/ReportFormKerja";
import ReportFormOlahraga from "./components/ReportFormOlahraga";
import OfficialTableKerja from "./components/OfficialTableKerja";
import OfficialTableOlahraga from "./components/OfficialTableOlahraga";
import SubmissionGrid from "./components/SubmissionGrid";
import DashboardStats from "./components/DashboardStats";
import LoginPortal, { UserSession } from "./components/LoginPortal";
import SuperadminPanel from "./components/SuperadminPanel";
import ConfirmationModal from "./components/ConfirmationModal";
import * as XLSX from "xlsx";
import {
  FileText,
  Users,
  Settings,
  Grid,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Printer,
  ChevronRight,
  Database,
  LogIn,
  LogOut,
  Sparkles,
  Info,
  ShieldCheck,
  Building2,
  Sliders
} from "lucide-react";

export default function App() {
  // Authentication & Roles Session
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem("sikejora_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [superadminView, setSuperadminView] = useState<"dashboard" | "console">("dashboard");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [customUsers, setCustomUsers] = useState<any[]>([]);

  // Password Change State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newOperatorPassword, setNewOperatorPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Real-time listener for users collection (Superadmin-only)
  useEffect(() => {
    if (!session || session.role !== "superadmin") return;

    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const loadedUsers: any[] = [];
        snapshot.forEach((doc) => {
          loadedUsers.push(doc.data());
        });
        loadedUsers.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setCustomUsers(loadedUsers);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "users");
      }
    );

    return () => unsubscribe();
  }, [session]);

  const handleAddUser = async (newUser: any) => {
    try {
      await setDoc(doc(db, "users", newUser.id), newUser);
      await writeAuditLog(
        "Tambah Pengguna",
        `Membuat pengguna baru: ${newUser.username} (${newUser.role.toUpperCase()})`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${newUser.id}`);
    }
  };

  const handleDeleteUser = async (userId: string, targetUsername: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      await writeAuditLog(
        "Hapus Pengguna",
        `Menghapus pengguna: ${targetUsername}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
      throw err;
    }
  };

  const handleEditUser = async (userId: string, updatedData: any) => {
    try {
      await setDoc(doc(db, "users", userId), updatedData, { merge: true });
      await writeAuditLog(
        "Edit Pengguna",
        `Memperbarui profil pengguna: ${updatedData.username}`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
      throw err;
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !newOperatorPassword.trim()) return;

    if (newOperatorPassword.trim().length < 4) {
      alert("Password minimal harus 4 karakter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      // Find if user exists in the customUsers collection
      // Since operator doesn't have customUsers loaded, we query it directly
      // But actually, we can just query users by username
      const usersRef = collection(db, "users");
      // Create a specific id using the username to prevent duplicates if fallback
      const safeId = `user_${session.username.replace(/[^a-zA-Z0-9]/g, "_")}`;
      
      const payload = {
        id: safeId,
        username: session.username,
        password: newOperatorPassword.trim(),
        role: session.role,
        puskesmasId: session.puskesmasId || "",
        puskesmasName: session.puskesmasName || "",
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", safeId), payload, { merge: true });
      
      await writeAuditLog("Ganti Password", "Pengguna mengganti password login mereka");
      alert("Password berhasil diubah! Silakan gunakan password baru pada login berikutnya.");
      setShowChangePasswordModal(false);
      setNewOperatorPassword("");
    } catch (err) {
      console.error(err);
      alert("Gagal mengganti password. Periksa koneksi Anda.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Derive userRole for easy backwards compatibility
  const userRole = session?.role || "operator";

  const [selectedPkmId, setSelectedPkmId] = useState<string>(() => {
    const saved = localStorage.getItem("sikejora_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.role === "operator" && parsed.puskesmasId) {
          return parsed.puskesmasId;
        } else if (parsed.role === "admin" || parsed.role === "superadmin") {
          return "aggregate";
        }
      } catch (e) {}
    }
    return "pkm_01";
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportType, setReportType] = useState<ReportType>("kerja");

  // Database State
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Dynamic Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);

  // Lock selectedPkmId if session is operator, or default to aggregate for admin/superadmin
  useEffect(() => {
    if (session) {
      if (session.role === "operator" && session.puskesmasId) {
        setSelectedPkmId(session.puskesmasId);
      } else if (session.role === "admin" || session.role === "superadmin") {
        setSelectedPkmId("aggregate");
      }
    }
  }, [session]);

  const handleClearAllReports = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reports"));
      let batch = writeBatch(db);
      let count = 0;
      querySnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
        count++;
        if (count >= 400) {
          batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      });
      if (count > 0) {
        await batch.commit();
      }

      // Also wipe logs except this wipe action log
      const logsSnapshot = await getDocs(collection(db, "audit_logs"));
      let logBatch = writeBatch(db);
      let logCount = 0;
      logsSnapshot.forEach((docSnap) => {
        logBatch.delete(docSnap.ref);
        logCount++;
        if (logCount >= 400) {
          logBatch.commit();
          logBatch = writeBatch(db);
          logCount = 0;
        }
      });
      if (logCount > 0) {
        await logBatch.commit();
      }

      // Add a fresh log of the wipe action
      const newLogRef = doc(collection(db, "audit_logs"));
      await setDoc(newLogRef, {
        id: newLogRef.id,
        timestamp: new Date().toISOString(),
        user: session?.username || "Superadmin",
        role: "superadmin",
        action: "Pembersihan Basis Data",
        details: "Menghapus seluruh laporan bulanan dan log audit dari database.",
      });

      alert("Basis data berhasil dikosongkan secara total!");
    } catch (err) {
      console.error("Failed to clear database: ", err);
      alert("Gagal mengosongkan database.");
    }
  };

  const writeAuditLogDirect = async (userSession: UserSession, action: string, details: string) => {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const logPayload = {
        id: logId,
        timestamp: new Date().toISOString(),
        user: userSession.username,
        role: userSession.role,
        action,
        details,
      };
      await setDoc(doc(db, "audit_logs", logId), logPayload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "audit_logs");
    }
  };

  const writeAuditLog = async (action: string, details: string) => {
    if (!session) return;
    await writeAuditLogDirect(session, action, details);
  };

  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    localStorage.setItem("sikejora_session", JSON.stringify(userSession));
    const pkmText = userSession.puskesmasName ? ` (${userSession.puskesmasName})` : "";
    writeAuditLogDirect(
      userSession,
      "Login Pengguna",
      `Berhasil masuk sebagai ${userSession.role.toUpperCase()}${pkmText}`
    );
  };

  const handleLogout = async () => {
    if (session) {
      await writeAuditLog("Logout Pengguna", "Keluar dari sistem");
    }
    setSession(null);
    localStorage.removeItem("sikejora_session");
  };

  // Real-time listener for reports collection
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "reports"),
      (snapshot) => {
        const loadedReports: MonthlyReport[] = [];
        snapshot.forEach((doc) => {
          loadedReports.push(doc.data() as MonthlyReport);
        });
        setReports(loadedReports);
        setLoading(false);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, "reports");
        setErrorMsg("Gagal memuat data real-time. Periksa koneksi internet Anda.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Real-time listener for audit logs collection
  useEffect(() => {
    if (!session || (session.role !== "admin" && session.role !== "superadmin")) return;

    const unsubscribe = onSnapshot(
      collection(db, "audit_logs"),
      (snapshot) => {
        const loadedLogs: any[] = [];
        snapshot.forEach((doc) => {
          loadedLogs.push(doc.data());
        });
        loadedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(loadedLogs);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, "audit_logs");
      }
    );

    return () => unsubscribe();
  }, [session]);

  // Filter and compute data for active selection
  const selectedPkm = LIST_PUSKESMAS.find((p) => p.id === selectedPkmId) || LIST_PUSKESMAS[0];

  const currentReportId = `${selectedPkmId}_${selectedYear}_${selectedMonth}_${reportType}`;
  const activeReport = reports.find((r) => r.id === currentReportId);

  // Helper to construct aggregate/sum data across all Puskesmas for admin compiled report
  const getAggregateValues = (): KerjaValues | OlahragaValues => {
    const monthReports = reports.filter(
      (r) => r.year === selectedYear && r.month === selectedMonth && r.reportType === reportType && r.submitted
    );

    if (reportType === "kerja") {
      const aggDiseases: Record<string, { pak: number; terduga: number; rujukan: number }> = {};
      LIST_DISEASES.forEach((d) => {
        aggDiseases[d.id] = { pak: 0, terduga: 0, rujukan: 0 };
      });

      const agg: KerjaValues = {
        ...INITIAL_KERJA_VALUES,
        diseases: aggDiseases,
      };

      monthReports.forEach((r) => {
        const v = r.values as KerjaValues;
        Object.keys(agg).forEach((key) => {
          const k = key as keyof KerjaValues;
          if (k === "diseases") {
            if (v.diseases) {
              Object.keys(v.diseases).forEach((diseaseId) => {
                const dv = v.diseases[diseaseId];
                if (!agg.diseases[diseaseId]) {
                  agg.diseases[diseaseId] = { pak: 0, terduga: 0, rujukan: 0 };
                }
                agg.diseases[diseaseId].pak += dv.pak || 0;
                agg.diseases[diseaseId].terduga += dv.terduga || 0;
                agg.diseases[diseaseId].rujukan += dv.rujukan || 0;
              });
            }
          } else {
            (agg[k] as number) += (v[k] as number) || 0;
          }
        });
      });
      return agg;
    } else {
      const agg: OlahragaValues = { ...INITIAL_OLAHRAGA_VALUES };
      monthReports.forEach((r) => {
        const v = r.values as OlahragaValues;
        Object.keys(agg).forEach((key) => {
          const k = key as keyof OlahragaValues;
          agg[k] += v[k] || 0;
        });
      });
      return agg;
    }
  };

  const handleSaveReport = async (values: KerjaValues | OlahragaValues, finalize: boolean) => {
    setSaving(true);
    setErrorMsg(null);

    const reportPayload: MonthlyReport = {
      id: currentReportId,
      puskesmasId: selectedPkmId,
      puskesmasName: selectedPkm.name,
      year: selectedYear,
      month: selectedMonth,
      reportType,
      submitted: finalize,
      updatedAt: new Date().toISOString(),
      updatedBy: session?.username || "operator_pkm",
      values,
    };

    if (finalize) {
      reportPayload.submittedAt = new Date().toISOString();
      reportPayload.submittedBy = session?.username || "operator_pkm";
    } else {
      if (activeReport?.submittedAt) {
        reportPayload.submittedAt = activeReport.submittedAt;
      }
      if (activeReport?.submittedBy) {
        reportPayload.submittedBy = activeReport.submittedBy;
      }
    }

    try {
      await setDoc(doc(db, "reports", currentReportId), reportPayload);
      
      // Log audit
      const logAction = finalize ? "Mengirim Laporan Bulanan (FINAL)" : "Menyimpan Draf Laporan";
      const logDetails = `Jenis: ${reportType.toUpperCase()}, Puskesmas: ${selectedPkm.name}, Periode: ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
      await writeAuditLog(logAction, logDetails);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `reports/${currentReportId}`);
      setErrorMsg("Gagal menyimpan laporan. Silakan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  // Quick reset / clear option for operators if needed
  const handleResetReport = () => {
    setConfirmModal({
      isOpen: true,
      title: "Hapus Draf Laporan",
      message: "Apakah Anda yakin ingin menghapus draf laporan ini? Tindakan ini tidak dapat dibatalkan.",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      type: "danger",
      onConfirm: async () => {
        setSaving(true);
        try {
          await deleteDoc(doc(db, "reports", currentReportId));
          
          // Log audit
          const logDetails = `Jenis: ${reportType.toUpperCase()}, Puskesmas: ${selectedPkm.name}, Periode: ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
          await writeAuditLog("Menghapus Draf Laporan", logDetails);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `reports/${currentReportId}`);
          setErrorMsg("Gagal menghapus laporan.");
        } finally {
          setSaving(false);
        }
      }
    });
  };

  const handleRevertReport = (reportId: string, pkmName: string, reportTypeStr: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Batal Final Laporan",
      message: `Apakah Anda yakin ingin membatalkan status final untuk laporan ${reportTypeStr.toUpperCase()} Puskesmas ${pkmName}? Laporan akan kembali menjadi Draf dan dapat diedit oleh operator.`,
      confirmText: "Ya, Batal Final",
      cancelText: "Tutup",
      type: "warning",
      onConfirm: async () => {
        setSaving(true);
        try {
          await setDoc(doc(db, "reports", reportId), { submitted: false }, { merge: true });
          
          // Log audit
          const logDetails = `Batal Final Laporan ${reportTypeStr.toUpperCase()} Puskesmas ${pkmName}, Periode: ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`;
          await writeAuditLog("Batal Final Laporan", logDetails);
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `reports/${reportId}`);
          setErrorMsg("Gagal membatalkan final laporan.");
        } finally {
          setSaving(false);
          setConfirmModal(null);
        }
      }
    });
  };

  const handleDownloadExcel = (forceAggregate?: boolean) => {
    const isAggregate = forceAggregate !== undefined ? forceAggregate : (selectedPkmId === "aggregate");
    const values = isAggregate ? getAggregateValues() : (activeReport?.values || (reportType === "kerja" ? INITIAL_KERJA_VALUES : INITIAL_OLAHRAGA_VALUES));
    const submittedCount = reports.filter(
      (r) => r.year === selectedYear && r.month === selectedMonth && r.reportType === reportType && r.submitted
    ).length;
    const pkmName = isAggregate ? `REKAP KABUPATEN (${submittedCount} DARI 31 PUSKESMAS)` : selectedPkm.name;
    const monthName = MONTH_NAMES[selectedMonth - 1] || "";
    
    let rows: any[] = [];
    
    if (reportType === "kerja") {
      const v = values as KerjaValues;
      rows = [
        ["A", "POS UKK (UPAYA KESEHATAN KERJA)", "", "", ""],
        ["1", "Jumlah Pos UKK Terbentuk", "Pos", v.posUkk_jumlah || 0, "Total Pos binaan yang ada"],
        ["2", "Jumlah Pos UKK Aktif", "Pos", v.posUkk_aktif || 0, "Pos dengan kegiatan rutin"],
        ["B", "K3 PERKANTORAN", "", "", ""],
        ["1", "Jumlah Kantor Pemerintah Tingkat Kecamatan, yaitu Kantor Kec, POLSEK, KORAMIL, KUA", "Kantor", v.k3_kantor_jumlah || 0, "Kantor Kec, POLSEK, KORAMIL, KUA"],
        ["2", "Jumlah Kantor Kec, POLSEK, KORAMIL, KUA yang telah dilakukan penilaian & rekomendasi K3 Perkantoran", "Kantor", v.k3_kantor_dinilai || 0, "Telah dinilai K3"],
        ["3", "Jumlah Kantor Kec, POLSEK, KORAMIL, KUA dengan kategori cukup min. 40%", "Kantor", v.k3_kantor_cukup || 0, "Kategori cukup min. 40%"],
        ["4", "Jumlah Tempat Kerja lainnya (≤ 100 pekerja) melaksanakan K3 Perkantoran", "Tempat Kerja", v.k3_lain_kurang_100 || 0, "≤ 100 pekerja, kategori cukup min. 40%"],
        ["5", "Jumlah Tempat Kerja lainnya (> 100 pekerja) melaksanakan K3 Perkantoran", "Tempat Kerja", v.k3_lain_lebih_100 || 0, "> 100 pekerja, kategori cukup min. 40%"],
        ["C", "GP2SP", "", "", ""],
        ["1", "Jumlah Tempat Kerja Formal yang dibina GP2SP (sosialisasi, skrining, dsb)", "", "", ""],
        ["A", "Jumlah tempat kerja yang memiliki ≤ 50 pekerja perempuan", "Tempat Kerja", v.gp2sp_formal_bina_kurang_50 || 0, "≤ 50 pekerja perempuan"],
        ["B", "Jumlah tempat kerja yang memiliki > 50 pekerja perempuan", "Tempat Kerja", v.gp2sp_formal_bina_lebih_50 || 0, "> 50 pekerja perempuan"],
        ["2", "Jumlah Tempat Kerja Formal melaksanakan GP2SP (min. 40% instrumen GP2SP)", "Tempat Kerja", v.gp2sp_formal_laksana || 0, "Melaksanakan min. 40%"],
        ["D", "KESEHATAN KERJA TEMPAT KERJA FORMAL (RPJMN)", "", "", ""],
        ["1", "Jumlah tempat kerja sektor formal (memiliki > 100 pekerja dan/atau risiko tinggi)", "Tempat Kerja", v.formal_jumlah || 0, "Sektor formal"],
        ["2", "Tempat kerja sektor formal (memiliki > 100 pekerja dan/atau risiko tinggi) yang melaksanakan kesehatan kerja", "Tempat Kerja", v.formal_kesja || 0, "Melaksanakan kesja"],
        ["", "PENYAKIT AKIBAT KERJA (PAK)", "", "", ""],
        ["", "Apakah memiliki dokter PAK (Ya/Tidak)", "Ya/Tidak", isAggregate ? `${v.pak_dokter || 0} PKM` : (v.pak_dokter ? "Ya" : "Tidak"), "Ketersediaan dokter PAK"],
        ["1", "Jumlah Penyakit Akibat Kerja", "", "", ""]
      ];
      
      // 1. PAK Definitif
      LIST_DISEASES.forEach((disease) => {
        const dVal = v.diseases?.[disease.id] || { pak: 0, terduga: 0, rujukan: 0 };
        rows.push(["", `${disease.name} (${disease.icd || "-"})`, "Kasus", dVal.pak || 0, "Kasus terdiagnosis dokter"]);
      });

      // 2. Terduga PAK
      rows.push(["2", "Jumlah Terduga Penyakit Akibat Kerja", "", "", ""]);
      LIST_DISEASES.forEach((disease) => {
        const dVal = v.diseases?.[disease.id] || { pak: 0, terduga: 0, rujukan: 0 };
        rows.push(["", `${disease.name} (${disease.icd || "-"})`, "Kasus", dVal.terduga || 0, "Kasus suspect/gejala awal"]);
      });

      // 3. Rujukan PAK
      rows.push(["3", "Jumlah Rujukan Penyakit Akibat Kerja", "", "", ""]);
      LIST_DISEASES.forEach((disease) => {
        const dVal = v.diseases?.[disease.id] || { pak: 0, terduga: 0, rujukan: 0 };
        rows.push(["", `${disease.name} (${disease.icd || "-"})`, "Kasus", dVal.rujukan || 0, "Kasus dirujuk ke faskes sekunder"]);
      });
      
      rows.push(
        ["", "KECELAKAAN AKIBAT KERJA (KAK)", "", "", ""],
        ["1", "Jumlah Kecelakaan Akibat Kerja (KAK)", "Kasus", v.kak_jumlah || 0, "Total kasus KAK"],
        ["", "SKRINING KESEHATAN PEKERJA", "", "", ""],
        ["1", "Jumlah tempat kerja FORMAL dan INFORMAL yang dilakukan skrining kesehatan & faktor risiko kesehatan kerja", "Tempat Kerja", v.skrining_tempat || 0, "Tempat Kerja"],
        ["2", "Jumlah pekerja FORMAL dan INFORMAL yang dilakukan skrining kesehatan & faktor risiko kesehatan kerja oleh puskesmas dan tempat kerja secara mandiri", "Orang", v.skrining_pekerja || 0, "Oleh puskesmas / mandiri"]
      );
    } else {
      const v = values as OlahragaValues;
      rows = [
        ["A", "AKTIVITAS FISIK DI PUSKESMAS", "", "", ""],
        ["1", "Jumlah Peregangan Mandiri Kelompok", "Kali", v.alkes_peregangan || 0, "Peregangan rutin di tempat kerja"],
        ["2", "Jumlah Senam Kebugaran Bersama", "Kali", v.alkes_senam || 0, "Senam rutin instansi / masyarakat"],
        ["3", "Edukasi Kesehatan Olahraga & Fisik", "Kali", v.alkes_edukasi || 0, "Penyuluhan / KIE kesehatan fisik"],
        ["4", "Skrining Aktivitas Fisik Harian", "Orang", v.alkes_skrining || 0, "Asesmen tingkat aktivitas fisik"],
        ["5", "Puskesmas Menyelenggarakan Aktivitas Fisik", "Puskesmas", isAggregate ? `${v.alkes_penyelenggara || 0} PKM` : (v.alkes_penyelenggara ? "YA" : "TIDAK"), "Penyelenggaraan rutin internal"],
        ["B", "AKTIVITAS FISIK DI PUSTU / POSYANDU", "", "", ""],
        ["1", "Pustu Menyelenggarakan Aktivitas Fisik", "Pustu", isAggregate ? `${v.pustu_penyelenggara || 0} Pustu` : (v.pustu_penyelenggara ? "YA" : "TIDAK"), "Penyelenggaraan tingkat desa"],
        ["2", "Jumlah Pustu/Posyandu Berpartisipasi", "Unit", v.pustu_jumlah || 0, "Total faskes pembantu aktif"],
        ["C", "PEMBINAAN KELOMPOK OLAHRAGA BINAAN", "", "", ""],
        ["1", "Ibu Hamil - Kelompok Sasaran", "Kelompok", v.bina_mil_sasaran || 0, "Target kelompok olahraga bumil"],
        ["2", "Ibu Hamil - Kelompok Dibina", "Kelompok", v.bina_mil_dibina || 0, "Kelompok bumil yang rutin dibina"],
        ["3", "Ibu Hamil - Anggota Sasaran", "Orang", v.bina_mil_ang_sasaran || 0, "Total target sasaran anggota bumil"],
        ["4", "Ibu Hamil - Anggota Dibina", "Orang", v.bina_mil_ang_dibina || 0, "Anggota bumil aktif berolahraga"],
        ["5", "Lanjut Usia (Lansia) - Kelompok Sasaran", "Kelompok", v.bina_lan_sasaran || 0, "Target kelompok lansia"],
        ["6", "Lanjut Usia (Lansia) - Kelompok Dibina", "Kelompok", v.bina_lan_dibina || 0, "Kelompok lansia rutin dibina"],
        ["7", "Lanjut Usia (Lansia) - Anggota Sasaran", "Orang", v.bina_lan_ang_sasaran || 0, "Target sasaran anggota lansia"],
        ["8", "Lanjut Usia (Lansia) - Anggota Dibina", "Orang", v.bina_lan_ang_dibina || 0, "Anggota lansia aktif berolahraga"],
        ["9", "Kelompok Olahraga Lain - Kelompok Sasaran", "Kelompok", v.bina_lain_sasaran || 0, "Klub sepeda, senam, dll"],
        ["10", "Kelompok Olahraga Lain - Kelompok Dibina", "Kelompok", v.bina_lain_dibina || 0, "Klub olahraga rutin dibina"],
        ["11", "Kelompok Olahraga Lain - Anggota Sasaran", "Orang", v.bina_lain_ang_sasaran || 0, "Target sasaran anggota klub"],
        ["12", "Kelompok Olahraga Lain - Anggota Dibina", "Orang", v.bina_lain_ang_dibina || 0, "Anggota klub olahraga aktif"],
        ["D", "SKRINING KEBUGARAN JASMANI", "", "", ""],
        ["D.1", "Calon Jamaah Haji (CJH)", "", "", ""],
        ["1", "Jumlah CJH Terdaftar", "Orang", v.keb_cjh_terdaftar || 0, "Total calon jemaah terdata"],
        ["2", "Jumlah CJH Diukur Kebugaran", "Orang", v.keb_cjh_diukur || 0, "CJH yang mengikuti tes fisik"],
        ["3", "Hasil: Baik Sekali", "Orang", v.keb_cjh_baik_sekali || 0, "Kategori kebugaran prima"],
        ["4", "Hasil: Baik", "Orang", v.keb_cjh_baik || 0, "Kategori kebugaran baik"],
        ["5", "Hasil: Cukup", "Orang", v.keb_cjh_cukup || 0, "Kategori kebugaran cukup"],
        ["6", "Hasil: Kurang", "Orang", v.keb_cjh_kurang || 0, "Kategori kebugaran kurang"],
        ["7", "Hasil: Kurang Sekali", "Orang", v.keb_cjh_kurang_sekali || 0, "Kategori kebugaran sangat kurang"],
        ["D.2", "Anak Sekolah (SD)", "", "", ""],
        ["1", "Jumlah SD di Wilayah Kerja", "Sekolah", v.keb_sek_sd_jumlah || 0, "Total instansi sekolah dasar"],
        ["2", "Jumlah SD Diukur Kebugaran", "Sekolah", v.keb_sek_sd_diukur || 0, "SD yang melaksanakan pengukuran fisik"],
        ["3", "Jumlah Siswa Diukur Kebugaran", "Siswa", v.keb_sek_siswa_diukur || 0, "Siswa mengikuti skrining kebugaran"],
        ["4", "Jumlah Siswa Usia 10-12 Tahun", "Siswa", v.keb_sek_siswa_10_12 || 0, "Fokus kelompok umur sasaran"],
        ["5", "Hasil: Baik Sekali", "Siswa", v.keb_sek_baik_sekali || 0, "Kategori kebugaran prima"],
        ["6", "Hasil: Baik", "Siswa", v.keb_sek_baik || 0, "Kategori kebugaran baik"],
        ["7", "Hasil: Cukup", "Siswa", v.keb_sek_cukup || 0, "Kategori kebugaran cukup"],
        ["8", "Hasil: Kurang", "Siswa", v.keb_sek_kurang || 0, "Kategori kebugaran kurang"],
        ["9", "Hasil: Kurang Sekali", "Siswa", v.keb_sek_kurang_sekali || 0, "Kategori kebugaran sangat kurang"],
        ["D.3", "Pekerja / ASN", "", "", ""],
        ["1", "Jumlah Sasaran Pekerja Diukur", "Orang", v.keb_pek_sasaran || 0, "Target pegawai / nakes / ASN"],
        ["2", "Jumlah Pekerja Diukur Kebugaran", "Orang", v.keb_pek_diukur || 0, "Pekerja yang mengikuti tes kebugaran"],
        ["3", "Jumlah Tempat Kerja Diukur Kebugaran", "Instansi", v.keb_pek_tempat_kerja || 0, "Instansi / tempat kerja terlayani"],
        ["4", "Hasil: Baik Sekali", "Orang", v.keb_pek_baik_sekali || 0, "Kategori kebugaran prima"],
        ["5", "Hasil: Baik", "Orang", v.keb_pek_baik || 0, "Kategori kebugaran baik"],
        ["6", "Hasil: Cukup", "Orang", v.keb_pek_cukup || 0, "Kategori kebugaran cukup"],
        ["7", "Hasil: Kurang", "Orang", v.keb_pek_kurang || 0, "Kategori kebugaran kurang"],
        ["8", "Hasil: Kurang Sekali", "Orang", v.keb_pek_kurang_sekali || 0, "Kategori kebugaran sangat kurang"],
        ["D.4", "Kelompok Olahraga Masyarakat", "", "", ""],
        ["1", "Jumlah Kelompok Terdaftar", "Kelompok", v.keb_kel_jumlah || 0, "Klub olahraga masyarakat umum"],
        ["2", "Jumlah Peserta Diukur Kebugaran", "Orang", v.keb_kel_diukur || 0, "Warga yang diukur tingkat kebugarannya"],
        ["3", "Hasil: Baik Sekali", "Orang", v.keb_kel_baik_sekali || 0, "Kategori kebugaran prima"],
        ["4", "Hasil: Baik", "Orang", v.keb_kel_baik || 0, "Kategori kebugaran baik"],
        ["5", "Hasil: Cukup", "Orang", v.keb_kel_cukup || 0, "Kategori kebugaran cukup"],
        ["6", "Hasil: Kurang", "Orang", v.keb_kel_kurang || 0, "Kategori kebugaran kurang"],
        ["7", "Hasil: Kurang Sekali", "Orang", v.keb_kel_kurang_sekali || 0, "Kategori kebugaran sangat kurang"],
        ["E", "EVALUASI FAKTOR RISIKO OLAHRAGA", "", "", ""],
        ["1", "Kasus Cedera Olahraga Dilaporkan", "Kasus", v.eval_cedera || 0, "Kejadian cedera saat beraktivitas fisik"],
        ["2", "Skrining Faktor Risiko PTM Mandiri", "Orang", v.eval_risiko || 0, "Asesmen faktor risiko penyakit non-menular"],
        ["3", "Penerapan BBTT dalam Aktivitas Fisik", "Kelompok", v.eval_bbtt || 0, "Kelompok yang menerapkan prinsip BBTT"]
      ];
    }
    
    const headerTitle = reportType === "kerja" 
      ? "LAPORAN BULANAN KESEHATAN KERJA / PEKERJA (LBKP)" 
      : "LAPORAN BULANAN KESEHATAN OLAHRAGA";
      
    const titleRow = [headerTitle];
    const infoRow1 = ["KABUPATEN SUMENEP"];
    const infoRow2 = [`PUSKESMAS: ${pkmName.toUpperCase()}`];
    const infoRow3 = [`TAHUN: ${selectedYear}`];
    const infoRow4 = [`BULAN: ${monthName.toUpperCase()}`];
    const emptyRow = [""];
    const tableHeader = ["NO", "INDIKATOR KINERJA", "SATUAN", "CAPAIAN", "KETERANGAN"];
    
    const aoaData = [
      titleRow,
      infoRow1,
      infoRow2,
      infoRow3,
      infoRow4,
      emptyRow,
      tableHeader,
      ...rows
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(aoaData);

    ws["!cols"] = [
      { wch: 10 },
      { wch: 60 },
      { wch: 15 },
      { wch: 18 },
      { wch: 60 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    const fileName = `${reportType}_rekap_${pkmName.replace(/\s+/g, "_")}_${selectedYear}_${monthName}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const handlePrint = () => {
    try {
      // In normal context, window.print() will work fine.
      // If it fails or is blocked by sandbox iframe, we catch it and fallback to download.
      const isSandboxIframe = window.self !== window.top;
      if (isSandboxIframe) {
        alert("Pencetakan langsung diblokir oleh browser karena aplikasi berada di dalam frame tinjauan. Silakan buka aplikasi di tab baru menggunakan tombol di pojok kanan atas untuk mencetak secara langsung, atau gunakan berkas Excel (.xlsx) yang otomatis diunduh saat ini.");
        handleDownloadExcel();
      } else {
        window.print();
      }
    } catch (err) {
      console.warn("Direct printing not supported in this context. Fallback to Excel.", err);
      handleDownloadExcel();
    }
  };

  if (!session) {
    return <LoginPortal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 flex flex-col font-sans antialiased animate-fade-in">
      {/* Real-time Indicator Topbar */}
      <div className="bg-blue-950 text-blue-100 py-1.5 px-4 text-xs font-medium flex items-center justify-between shadow-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Sistem Terkoneksi Real-Time ke Database Kabupaten Sumenep</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] opacity-85">UTC: 2026-06-29</span>
          <div className="flex items-center gap-2">
            <span className="bg-blue-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white tracking-wide">
              {session.username}
            </span>
            {session.role !== "superadmin" && (
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="hover:text-blue-200 transition-colors underline flex items-center gap-1 cursor-pointer font-bold text-[10px]"
              >
                Ganti Password
              </button>
            )}
            <button
              onClick={handleLogout}
              className="hover:text-white transition-colors underline flex items-center gap-1 cursor-pointer font-bold text-[10px] ml-2"
            >
              <LogOut className="w-3 h-3" /> Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center text-white shadow-sm shadow-blue-100">
              <FileText className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-black text-xl text-blue-950 tracking-tight leading-none uppercase">
                SIKEJORA
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium tracking-wide mt-1 uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[280px] sm:max-w-none">
                Sistem Informasi Pelaporan Kesehatan Kerja dan Olahraga
              </p>
            </div>
          </div>

          {/* Active User Session Role Badges & Switchers */}
          <div className="flex items-center gap-3 flex-wrap">
            {session.role === "superadmin" && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/40">
                <button
                  onClick={() => setSuperadminView("dashboard")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    superadminView === "dashboard"
                      ? "bg-white text-blue-900 shadow-xs border border-slate-200/50"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard Dinkes
                </button>
                <button
                  onClick={() => setSuperadminView("console")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    superadminView === "console"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Console Superadmin
                </button>
              </div>
            )}

            {session.role === "superadmin" ? (
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <Sliders className="w-3.5 h-3.5 text-purple-600" />
                <span>Super Administrator</span>
              </div>
            ) : session.role === "admin" ? (
              <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <LayoutDashboard className="w-3.5 h-3.5 text-indigo-600" />
                <span>Admin Dinas Kesehatan</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Operator Puskesmas</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Control Navigation Filters */}
      {!(session.role === "superadmin" && superadminView === "console") && (
        <section className="bg-slate-100 border-b border-gray-200 py-4 px-6 print:hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-end">
          {/* Report Type Selector */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Jenis Pelaporan
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-gray-200/50 p-1 rounded-lg">
              <button
                onClick={() => setReportType("kerja")}
                className={`py-1.5 text-center text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  reportType === "kerja" ? "bg-blue-900 text-white" : "text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                LBKP (Kesja)
              </button>
              <button
                onClick={() => setReportType("olahraga")}
                className={`py-1.5 text-center text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  reportType === "olahraga" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-200/50"
                }`}
              >
                LBKO (Kesla)
              </button>
            </div>
          </div>

          {/* Puskesmas Selector (Disabled in Admin view if they prefer rekap, but selectable) */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Puskesmas Pengirim
            </label>
            <select
              value={selectedPkmId}
              onChange={(e) => setSelectedPkmId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg py-2 px-3 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              disabled={userRole === "operator"}
            >
              {(userRole === "admin" || userRole === "superadmin") && (
                <option value="aggregate">-- REKAP KABUPATEN (AGREGAT) --</option>
              )}
              {(userRole === "operator" 
                ? LIST_PUSKESMAS.filter((p) => p.id === session?.puskesmasId)
                : LIST_PUSKESMAS
              ).map((pkm) => (
                <option key={pkm.id} value={pkm.id}>
                  {pkm.name}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg py-2 px-3 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Array.from({ length: Math.max(5, new Date().getFullYear() - 2024 + 3) }, (_, i) => {
                const yearOption = 2024 + i;
                return (
                  <option key={yearOption} value={yearOption}>
                    Tahun {yearOption}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Month Selector */}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Bulan Pelaporan
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full text-xs font-semibold bg-white border border-gray-200 rounded-lg py-2 px-3 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh & Print */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-200 py-2 rounded-lg text-xs font-bold text-gray-700 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Print
            </button>
            <button
              onClick={() => handleDownloadExcel(false)}
              className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-2 rounded-lg text-xs font-bold text-emerald-800 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Excel
            </button>
          </div>
          </div>
        </section>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Connection Failure Alert */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-800 border border-red-150 rounded-xl flex items-center gap-3 shadow-sm print:hidden">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <div className="text-xs font-medium">{errorMsg}</div>
          </div>
        )}

        {loading ? (
          <div className="h-96 bg-white border border-gray-100 rounded-2xl flex flex-col justify-center items-center gap-3">
            <span className="w-10 h-10 border-4 border-blue-900/20 border-t-blue-900 rounded-full animate-spin"></span>
            <p className="text-xs text-gray-500 font-semibold">Mengambil data real-time...</p>
          </div>
        ) : (
          <>
            {/* 1. OPERATOR VIEW */}
            {session.role === "operator" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start animate-fade-in">
                {/* Left Side: Interactive Input Forms */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-white rounded-xl p-4 shadow-sm flex items-center justify-between border border-blue-900/30">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider opacity-85 uppercase">OPERATOR MODE</span>
                      <h2 className="font-bold text-base mt-0.5 leading-none">
                        {selectedPkm.name}
                      </h2>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase border border-white/10">
                      Bulan {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                    </div>
                  </div>

                  {/* Form Component Selection */}
                  {reportType === "kerja" ? (
                    <ReportFormKerja
                      key={`${currentReportId}_form_kerja`}
                      initialValues={(activeReport?.values as KerjaValues) || INITIAL_KERJA_VALUES}
                      onSave={(vals, submit) => handleSaveReport(vals, submit)}
                      isSubmitting={saving}
                      isSubmitted={activeReport?.submitted || false}
                    />
                  ) : (
                    <ReportFormOlahraga
                      key={`${currentReportId}_form_olah`}
                      initialValues={(activeReport?.values as OlahragaValues) || INITIAL_OLAHRAGA_VALUES}
                      onSave={(vals, submit) => handleSaveReport(vals, submit)}
                      isSubmitting={saving}
                      isSubmitted={activeReport?.submitted || false}
                    />
                  )}

                  {/* Draft State Options */}
                  {!activeReport?.submitted && activeReport && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex gap-2 text-amber-800">
                        <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold">Laporan ini masih berstatus DRAF</p>
                          <p className="text-[10px] text-amber-600 mt-0.5">Sudah disimpan otomatis di database namun belum diserahkan ke Dinas Kabupaten.</p>
                        </div>
                      </div>
                      <button
                        onClick={handleResetReport}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 underline shrink-0 cursor-pointer"
                      >
                        Hapus Draf
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Side: Real-time Sheet Preview */}
                <div className="space-y-4 lg:sticky lg:top-24">
                  <div className="bg-blue-950 text-blue-100 rounded-xl px-4 py-3 shadow-xs flex items-center justify-between print:hidden border border-blue-900/30">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Pratinjau Lembar Formulir Resmi
                    </span>
                    <span className="text-[10px] text-blue-300">Sesuai Format Dinas Kesehatan</span>
                  </div>

                   {reportType === "kerja" ? (
                    <OfficialTableKerja
                      title="Laporan Bulanan Kesehatan Kerja / Pekerja (LBKP)"
                      puskesmasName={selectedPkm.name}
                      year={selectedYear}
                      month={selectedMonth}
                      data={(activeReport?.values as KerjaValues) || INITIAL_KERJA_VALUES}
                    />
                  ) : (
                    <OfficialTableOlahraga
                      title="Laporan Bulanan Kesehatan Olahraga (LBKO)"
                      puskesmasName={selectedPkm.name}
                      year={selectedYear}
                      month={selectedMonth}
                      data={(activeReport?.values as OlahragaValues) || INITIAL_OLAHRAGA_VALUES}
                    />
                  )}
                </div>
              </div>
            )}

            {/* 2. ADMIN/KABUPATEN DASHBOARD VIEW */}
            {(session.role === "admin" || (session.role === "superadmin" && superadminView === "dashboard")) && (
              <div className="space-y-8 animate-fade-in">
                {/* Dashboard Summary & Recharts */}
                <DashboardStats
                  reports={reports}
                  selectedYear={selectedYear}
                  reportType={reportType}
                  selectedMonth={selectedMonth}
                />

                {/* Real-time Submission Grid Map */}
                <SubmissionGrid
                  reports={reports}
                  selectedYear={selectedYear}
                  reportType={reportType}
                  onSelectPuskesmasMonth={(pkmId, monthIdx) => {
                    setSelectedPkmId(pkmId);
                    setSelectedMonth(monthIdx + 1);
                    // Selection triggers preview updates automatically
                  }}
                />

                {/* Compiled Kabupaten / Specific Puskesmas Report Sheet */}
                <div className="space-y-4">
                  {selectedPkmId === "aggregate" ? (
                    (() => {
                      const submittedCount = reports.filter(
                        (r) => r.year === selectedYear && r.month === selectedMonth && r.reportType === reportType && r.submitted
                      ).length;
                      return (
                        <>
                          <div className="bg-gradient-to-r from-blue-950 to-blue-900 text-blue-100 rounded-xl px-5 py-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-blue-900/30">
                            <div>
                              <span className="text-[10px] font-bold tracking-wider opacity-85 uppercase text-blue-300">
                                REKAPITULASI RESMI KABUPATEN (SUMMED DATA)
                              </span>
                              <h3 className="font-sans font-bold text-md text-white mt-1 flex flex-wrap items-center gap-2">
                                <span>Capaian Gabungan {submittedCount} dari 31 Puskesmas — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
                                {submittedCount < 31 ? (
                                  <span className="inline-block bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded shadow-sm">
                                    Belum Lengkap
                                  </span>
                                ) : (
                                  <span className="inline-block bg-emerald-500 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded shadow-sm">
                                    Lengkap
                                  </span>
                                )}
                              </h3>
                              <p className="text-[10px] text-blue-200 mt-1">
                                {submittedCount < 31 
                                  ? `⚠️ Data belum lengkap (baru ${submittedCount} dari 31 Puskesmas yang melapor). Gunakan filter/grid kepatuhan di atas untuk memantau Puskesmas yang belum melapor.`
                                  : `✅ Seluruh 31 Puskesmas telah sukses mengirimkan Laporan Final.`}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDownloadExcel(true)}
                              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-950 font-bold py-2 px-4 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" /> Unduh Rekap Excel (XLSX)
                            </button>
                          </div>

                          {reportType === "kerja" ? (
                            <OfficialTableKerja
                              title="Laporan Bulanan Kesehatan Kerja / Pekerja Gabungan (Rekap LBKP)"
                              puskesmasName="REKAP KABUPATEN"
                              year={selectedYear}
                              month={selectedMonth}
                              data={getAggregateValues() as KerjaValues}
                              isAggregate={true}
                            />
                          ) : (
                            <OfficialTableOlahraga
                              title="Laporan Bulanan Kesehatan Olahraga Gabungan (Rekap LBKO)"
                              puskesmasName="REKAP KABUPATEN"
                              year={selectedYear}
                              month={selectedMonth}
                              data={getAggregateValues() as OlahragaValues}
                              isAggregate={true}
                            />
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-blue-100 rounded-xl px-5 py-4 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-blue-800/30">
                        <div>
                          <span className="text-[10px] font-bold tracking-wider opacity-85 uppercase text-indigo-300">
                            LAPORAN BULANAN PUSKESMAS SELEKTIF
                          </span>
                          <h3 className="font-sans font-bold text-md text-white mt-1">
                            {selectedPkm.name} — {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                          </h3>
                          <p className="text-[10px] text-blue-200 mt-1 flex items-center gap-2">
                            <span>Status laporan: <span className="font-semibold uppercase bg-white/10 px-1.5 py-0.5 rounded text-white">{activeReport?.submitted ? "Terkirim (Final)" : "Belum Terkirim / Draf"}</span></span>
                            {activeReport?.submitted && (session.role === "admin" || session.role === "superadmin") && (
                              <button
                                onClick={() => handleRevertReport(activeReport.id, selectedPkm.name, reportType)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-2 py-0.5 rounded text-[10px] uppercase shadow-sm transition-colors cursor-pointer ml-2"
                              >
                                Batal Final
                              </button>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDownloadExcel(false)}
                          className="flex items-center gap-2 bg-white hover:bg-slate-50 text-blue-950 font-bold py-2 px-4 rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Unduh Laporan Puskesmas (XLSX)
                        </button>
                      </div>

                      {reportType === "kerja" ? (
                        <OfficialTableKerja
                          title="Laporan Bulanan Kesehatan Kerja / Pekerja (LBKP)"
                          puskesmasName={selectedPkm.name}
                          year={selectedYear}
                          month={selectedMonth}
                          data={(activeReport?.values as KerjaValues) || INITIAL_KERJA_VALUES}
                        />
                      ) : (
                        <OfficialTableOlahraga
                          title="Laporan Bulanan Kesehatan Olahraga (LBKO)"
                          puskesmasName={selectedPkm.name}
                          year={selectedYear}
                          month={selectedMonth}
                          data={(activeReport?.values as OlahragaValues) || INITIAL_OLAHRAGA_VALUES}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 3. SUPERADMIN CONSOLE PANEL VIEW */}
            {session.role === "superadmin" && superadminView === "console" && (
              <SuperadminPanel
                reports={reports}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                auditLogs={auditLogs}
                onClearAllReports={handleClearAllReports}
                customUsers={customUsers}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                onEditUser={handleEditUser}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs text-center py-6 border-t border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Portal SIKEJORA Kabupaten Sumenep © 2026. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
          <div className="flex gap-4 font-medium">
            <a href="#about" className="hover:text-slate-200">Tentang Sistem</a>
            <span>•</span>
            <a href="#docs" className="hover:text-slate-200">Petunjuk Pelaporan</a>
          </div>
        </div>
      </footer>

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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-zoom-in">
            <div className="bg-blue-950 p-4 border-b border-blue-900">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" /> Ganti Password
              </h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username Saat Ini</label>
                <input
                  type="text"
                  readOnly
                  value={session.username}
                  className="w-full text-sm bg-gray-100 border border-gray-200 rounded-lg py-2 px-3 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password Baru <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  value={newOperatorPassword}
                  onChange={(e) => setNewOperatorPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full text-sm bg-white border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || newOperatorPassword.trim().length < 4}
                  className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {isChangingPassword ? "Menyimpan..." : "Simpan Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { doc, writeBatch, collection } from "firebase/firestore";
import { db, OperationType, handleFirestoreError } from "../firebase";
import { LIST_PUSKESMAS, MONTH_NAMES, MonthlyReport, INITIAL_KERJA_VALUES, INITIAL_OLAHRAGA_VALUES, KerjaValues, OlahragaValues, LIST_DISEASES } from "../types";
import { Database, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

interface MockDataGeneratorProps {
  onRefresh: () => void;
  selectedYear: number;
}

export default function MockDataGenerator({ onRefresh, selectedYear }: MockDataGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Generate randomized but realistic values
  const generateRandomKerja = (): KerjaValues => {
    const pos = Math.floor(Math.random() * 8) + 2; // 2-9
    const active = Math.floor(Math.random() * (pos - 1)) + 2; // 2 to pos

    const randomDiseases: Record<string, { pak: number; terduga: number; rujukan: number }> = {};
    LIST_DISEASES.forEach((d) => {
      const hasPak = Math.random() > 0.9;
      const hasTerduga = Math.random() > 0.85;
      const hasRujukan = Math.random() > 0.92;
      randomDiseases[d.id] = {
        pak: hasPak ? Math.floor(Math.random() * 3) : 0,
        terduga: hasTerduga ? Math.floor(Math.random() * 4) : 0,
        rujukan: hasRujukan ? Math.floor(Math.random() * 2) : 0,
      };
    });

    return {
      posUkk_jumlah: pos,
      posUkk_aktif: active,
      k3_puskesmas: Math.random() > 0.3 ? 1 : 0,
      k3_tim: Math.random() > 0.4 ? 1 : 0,
      k3_pemeriksaanPegawai: Math.floor(Math.random() * 40) + 10,
      k3_sarpras: Math.floor(Math.random() * 5) + 3,
      k3_limbah: Math.floor(Math.random() * 12) + 5,
      k3_imunisasi: Math.floor(Math.random() * 15) + 2,
      gp2sp_perusahaan: Math.floor(Math.random() * 4),
      gp2sp_periksaPekerja: Math.floor(Math.random() * 120) + 20,
      gp2sp_kieGizi: Math.floor(Math.random() * 6) + 1,
      formal_binaan: Math.floor(Math.random() * 6) + 2,
      informal_binaan: Math.floor(Math.random() * 12) + 5,
      informal_dilayani: Math.floor(Math.random() * 200) + 50,
      diseases: randomDiseases,
      kk_jarum: Math.random() > 0.8 ? 1 : 0,
      kk_kimia: 0,
      kk_cedera: Math.random() > 0.75 ? Math.floor(Math.random() * 3) : 0,
      kk_lainnya: 0,
    };
  };

  const generateRandomOlahraga = (): OlahragaValues => {
    const peregangan = Math.floor(Math.random() * 40) + 10;
    const senam = Math.floor(Math.random() * 6) + 2;
    const edukasi = Math.floor(Math.random() * 10) + 2;
    const skrining = Math.floor(Math.random() * 150) + 30;

    const rawKebugaran = {
      baikSekali: Math.floor(Math.random() * 15) + 2,
      baik: Math.floor(Math.random() * 45) + 15,
      cukup: Math.floor(Math.random() * 40) + 10,
      kurang: Math.floor(Math.random() * 20) + 5,
      kurangSekali: Math.floor(Math.random() * 8),
    };

    return {
      alkes_peregangan: peregangan,
      alkes_senam: senam,
      alkes_edukasi: edukasi,
      alkes_skrining: skrining,
      alkes_penyelenggara: 1,
      pustu_penyelenggara: Math.floor(Math.random() * 4) + 1,
      pustu_jumlah: 5,
      bina_mil_sasaran: Math.floor(Math.random() * 3) + 1,
      bina_mil_dibina: Math.floor(Math.random() * 2) + 1,
      bina_mil_ang_sasaran: Math.floor(Math.random() * 30) + 10,
      bina_mil_ang_dibina: Math.floor(Math.random() * 20) + 5,
      bina_lan_sasaran: Math.floor(Math.random() * 8) + 4,
      bina_lan_dibina: Math.floor(Math.random() * 6) + 2,
      bina_lan_ang_sasaran: Math.floor(Math.random() * 120) + 40,
      bina_lan_ang_dibina: Math.floor(Math.random() * 90) + 30,
      bina_lain_sasaran: Math.floor(Math.random() * 5) + 2,
      bina_lain_dibina: Math.floor(Math.random() * 4) + 1,
      bina_lain_ang_sasaran: Math.floor(Math.random() * 80) + 20,
      bina_lain_ang_dibina: Math.floor(Math.random() * 60) + 15,
      keb_cjh_terdaftar: Math.floor(Math.random() * 40) + 10,
      keb_cjh_diukur: Math.floor(Math.random() * 35) + 5,
      keb_cjh_baik_sekali: Math.floor(rawKebugaran.baikSekali * 0.2),
      keb_cjh_baik: Math.floor(rawKebugaran.baik * 0.2),
      keb_cjh_cukup: Math.floor(rawKebugaran.cukup * 0.2),
      keb_cjh_kurang: Math.floor(rawKebugaran.kurang * 0.2),
      keb_cjh_kurang_sekali: Math.floor(rawKebugaran.kurangSekali * 0.2),
      keb_sek_sd_jumlah: 12,
      keb_sek_sd_diukur: Math.floor(Math.random() * 6) + 3,
      keb_sek_siswa_diukur: Math.floor(Math.random() * 80) + 30,
      keb_sek_siswa_10_12: Math.floor(Math.random() * 150) + 50,
      keb_sek_baik_sekali: Math.floor(rawKebugaran.baikSekali * 0.3),
      keb_sek_baik: Math.floor(rawKebugaran.baik * 0.3),
      keb_sek_cukup: Math.floor(rawKebugaran.cukup * 0.3),
      keb_sek_kurang: Math.floor(rawKebugaran.kurang * 0.3),
      keb_sek_kurang_sekali: Math.floor(rawKebugaran.kurangSekali * 0.3),
      keb_pek_sasaran: Math.floor(Math.random() * 150) + 50,
      keb_pek_diukur: Math.floor(Math.random() * 100) + 20,
      keb_pek_tempat_kerja: Math.floor(Math.random() * 4) + 1,
      keb_pek_baik_sekali: Math.floor(rawKebugaran.baikSekali * 0.3),
      keb_pek_baik: Math.floor(rawKebugaran.baik * 0.3),
      keb_pek_cukup: Math.floor(rawKebugaran.cukup * 0.3),
      keb_pek_kurang: Math.floor(rawKebugaran.kurang * 0.3),
      keb_pek_kurang_sekali: Math.floor(rawKebugaran.kurangSekali * 0.3),
      keb_kel_jumlah: Math.floor(Math.random() * 10) + 2,
      keb_kel_diukur: Math.floor(Math.random() * 8) + 1,
      keb_kel_baik_sekali: Math.floor(rawKebugaran.baikSekali * 0.2),
      keb_kel_baik: Math.floor(rawKebugaran.baik * 0.2),
      keb_kel_cukup: Math.floor(rawKebugaran.cukup * 0.2),
      keb_kel_kurang: Math.floor(rawKebugaran.kurang * 0.2),
      keb_kel_kurang_sekali: Math.floor(rawKebugaran.kurangSekali * 0.2),
      eval_cedera: Math.floor(Math.random() * 5),
      eval_risiko: Math.floor(Math.random() * 3),
      eval_bbtt: Math.floor(Math.random() * 40) + 10,
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      // We will generate data for the first 6 months of the selected year
      // For all 31 Puskesmas, generating both 'kerja' and 'olahraga' types
      // To prevent massive batch sizes (Firestore allows max 500 writes in one batch),
      // we can do it in multiple batches sequentially or choose a subset.
      // Let's populate months: 1 (Jan), 2 (Feb), 3 (Mar), 4 (Apr), 5 (Mei), 6 (Jun).
      // Let's randomise submission states: 80% submitted, 20% drafts to look realistic.

      const monthsToGenerate = [1, 2, 3, 4, 5, 6];
      let writeCount = 0;
      let batch = writeBatch(db);

      for (const month of monthsToGenerate) {
        for (const pkm of LIST_PUSKESMAS) {
          // 1. Laporan Kesehatan Kerja
          const reportKerjaId = `${pkm.id}_${selectedYear}_${month}_kerja`;
          const valuesKerja = generateRandomKerja();
          const isSubmittedKerja = Math.random() > 0.2; // 80% submitted

          const reportKerja: MonthlyReport = {
            id: reportKerjaId,
            puskesmasId: pkm.id,
            puskesmasName: pkm.name,
            year: selectedYear,
            month: month,
            reportType: "kerja",
            submitted: isSubmittedKerja,
            updatedAt: new Date(selectedYear, month - 1, 24, 15, 30, 0).toISOString(),
            updatedBy: "operator_pkm",
            values: valuesKerja,
          };

          if (isSubmittedKerja) {
            reportKerja.submittedAt = new Date(selectedYear, month - 1, 25, 10, 0, 0).toISOString();
            reportKerja.submittedBy = "operator_pkm";
          }

          batch.set(doc(db, "reports", reportKerjaId), reportKerja);
          writeCount++;

          if (writeCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            writeCount = 0;
          }

          // 2. Laporan Kesehatan Olahraga
          const reportOlahId = `${pkm.id}_${selectedYear}_${month}_olahraga`;
          const valuesOlah = generateRandomOlahraga();
          const isSubmittedOlah = Math.random() > 0.25; // 75% submitted

          const reportOlah: MonthlyReport = {
            id: reportOlahId,
            puskesmasId: pkm.id,
            puskesmasName: pkm.name,
            year: selectedYear,
            month: month,
            reportType: "olahraga",
            submitted: isSubmittedOlah,
            updatedAt: new Date(selectedYear, month - 1, 25, 14, 10, 0).toISOString(),
            updatedBy: "operator_pkm",
            values: valuesOlah,
          };

          if (isSubmittedOlah) {
            reportOlah.submittedAt = new Date(selectedYear, month - 1, 26, 11, 20, 0).toISOString();
            reportOlah.submittedBy = "operator_pkm";
          }

          batch.set(doc(db, "reports", reportOlahId), reportOlah);
          writeCount++;

          if (writeCount >= 400) {
            await batch.commit();
            batch = writeBatch(db);
            writeCount = 0;
          }
        }
      }

      if (writeCount > 0) {
        await batch.commit();
      }

      setSuccess(true);
      onRefresh();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "reports/batch_generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 text-sm">Mode Simulasi Dinas Kesehatan</h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Isi otomatis data bulanan untuk 31 Puskesmas selama semester 1 ({selectedYear}) untuk melihat kekuatan visual dashboard.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors shadow-md shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Menghubungkan & Menulis ke DB...
            </>
          ) : (
            <>
              <Database className="w-4 h-4" />
              Isi Demo Data Real-Time
            </>
          )}
        </button>
      </div>

      {success && (
        <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Berhasil mempopulasi data ke dalam Firestore! Dashboard, peta kepatuhan, dan grafik visual sekarang aktif.
        </div>
      )}
    </div>
  );
}

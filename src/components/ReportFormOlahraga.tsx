import React, { useState } from "react";
import { OlahragaValues } from "../types";
import { Plus, Minus, Info } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface ReportFormOlahragaProps {
  key?: string;
  initialValues: OlahragaValues;
  onSave: (values: OlahragaValues, submit: boolean) => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

export default function ReportFormOlahraga({
  initialValues,
  onSave,
  isSubmitting,
  isSubmitted,
}: ReportFormOlahragaProps) {
  const [values, setValues] = useState<OlahragaValues>({ ...initialValues });
  const [activeTab, setActiveTab] = useState<"aktivitas" | "pembinaan" | "skrining_cjh_sd" | "skrining_pek_kel" | "evaluasi">("aktivitas");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (key: keyof OlahragaValues, val: number) => {
    if (isSubmitted) return;
    setValues((prev) => ({
      ...prev,
      [key]: Math.max(0, val),
    }));
  };

  const handleToggle = (key: "alkes_penyelenggara") => {
    if (isSubmitted) return;
    setValues((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));
  };

  const tabs = [
    { id: "aktivitas", name: "Aktivitas Fisik" },
    { id: "pembinaan", name: "Binaan Kelompok" },
    { id: "skrining_cjh_sd", name: "Skrining (Haji & Anak)" },
    { id: "skrining_pek_kel", name: "Skrining (Pekerja & Klub)" },
    { id: "evaluasi", name: "Evaluasi & Cedera" },
  ] as const;

  const renderNumberInput = (label: string, key: keyof OlahragaValues, tooltip?: string) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border-b border-gray-100 hover:bg-slate-50/50 transition-colors">
      <div className="flex flex-col pr-4 mb-2 sm:mb-0">
        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
          {label}
          {tooltip && (
            <div className="group relative inline-block cursor-help text-slate-400 hover:text-slate-600">
              <Info className="w-4 h-4" />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg text-center font-normal z-20">
                {tooltip}
              </span>
            </div>
          )}
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isSubmitted || values[key] <= 0}
          onClick={() => handleChange(key, values[key] - 1)}
          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg active:scale-95 disabled:opacity-50 transition-all font-bold"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          disabled={isSubmitted}
          value={values[key]}
          onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
          className="w-20 text-center font-bold text-gray-800 border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="button"
          disabled={isSubmitted}
          onClick={() => handleChange(key, values[key] + 1)}
          className="w-10 h-10 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg active:scale-95 disabled:opacity-50 transition-all font-bold"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-slate-50/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex-1 text-center cursor-pointer ${
              activeTab === tab.id
                ? "border-blue-900 text-blue-900 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-6">
        {isSubmitted && (
          <div className="mb-6 p-4 bg-blue-50/70 text-blue-900 border border-blue-200/50 rounded-lg text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            Laporan ini sudah dikirim (FINAL) ke Kabupaten. Anda tidak dapat melakukan pengeditan lagi.
          </div>
        )}

        {activeTab === "aktivitas" && (
          <div className="space-y-4">
            <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              A. Aktivitas Fisik di Puskesmas
            </h4>
            {renderNumberInput("Jumlah Peregangan Internal (Kali)", "alkes_peregangan", "Peregangan 10-15 menit di sela-sela jam kerja")}
            {renderNumberInput("Jumlah Senam / Olahraga Bersama (Kali)", "alkes_senam", "Olahraga mingguan bersama staf/masyarakat")}
            {renderNumberInput("Jumlah Edukasi Aktivitas Fisik (Kali)", "alkes_edukasi", "Penyuluhan, brosur, info kesehatan olahraga")}
            {renderNumberInput("Jumlah Skrining Kebugaran Jasmani (Orang)", "alkes_skrining", "Skrining mengukur kapasitas paru/jantung nakes/warga")}

            <div className="flex items-center justify-between p-3 border-b border-gray-100">
              <div>
                <label className="text-sm font-semibold text-gray-700">Puskesmas menyelenggarakan Aktivitas Fisik?</label>
                <p className="text-xs text-gray-400 italic">Memiliki program rutin pembinaan aktivitas fisik</p>
              </div>
              <button
                type="button"
                disabled={isSubmitted}
                onClick={() => handleToggle("alkes_penyelenggara")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                  values.alkes_penyelenggara ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    values.alkes_penyelenggara ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <h4 className="font-bold text-blue-900 text-sm mt-6 mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              B. Aktivitas Fisik di Pustu
            </h4>
            {renderNumberInput("Jumlah Pustu Menyelenggarakan Aktivitas Fisik", "pustu_penyelenggara", "Pustu yang melaksanakan senam/edukasi")}
            {renderNumberInput("Jumlah Seluruh Pustu di Wilayah Kerja", "pustu_jumlah", "Total unit Pustu di wilayah kerja Puskesmas")}
          </div>
        )}

        {activeTab === "pembinaan" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                1. Kelompok Olahraga Ibu Hamil
              </h4>
              {renderNumberInput("Jumlah Kelompok Sasaran (Ada)", "bina_mil_sasaran")}
              {renderNumberInput("Jumlah Kelompok Dibina (Aktif)", "bina_mil_dibina")}
              {renderNumberInput("Anggota Kelompok Sasaran (Orang)", "bina_mil_ang_sasaran")}
              {renderNumberInput("Anggota Kelompok Dibina (Orang)", "bina_mil_ang_dibina")}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                2. Kelompok Olahraga Lansia
              </h4>
              {renderNumberInput("Jumlah Kelompok Sasaran (Ada)", "bina_lan_sasaran")}
              {renderNumberInput("Jumlah Kelompok Dibina (Aktif)", "bina_lan_dibina")}
              {renderNumberInput("Anggota Kelompok Sasaran (Orang)", "bina_lan_ang_sasaran")}
              {renderNumberInput("Anggota Kelompok Dibina (Orang)", "bina_lan_ang_dibina")}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                3. Kelompok Olahraga Lainnya (Prolanis, Klub Senam, dll)
              </h4>
              {renderNumberInput("Jumlah Kelompok Sasaran (Ada)", "bina_lain_sasaran")}
              {renderNumberInput("Jumlah Kelompok Dibina (Aktif)", "bina_lain_dibina")}
              {renderNumberInput("Anggota Kelompok Sasaran (Orang)", "bina_lain_ang_sasaran")}
              {renderNumberInput("Anggota Kelompok Dibina (Orang)", "bina_lain_ang_dibina")}
            </div>
          </div>
        )}

        {activeTab === "skrining_cjh_sd" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                1. Calon Jamaah Haji (CJH)
              </h4>
              {renderNumberInput("Jumlah CJH Terdaftar (Sasaran)", "keb_cjh_terdaftar")}
              {renderNumberInput("Jumlah CJH Diukur Kebugaran", "keb_cjh_diukur")}
              
              <div className="bg-slate-50 p-4 rounded-xl mt-3 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Distribusi Hasil Kebugaran CJH</span>
                {renderNumberInput("Hasil: Baik Sekali", "keb_cjh_baik_sekali")}
                {renderNumberInput("Hasil: Baik", "keb_cjh_baik")}
                {renderNumberInput("Hasil: Cukup", "keb_cjh_cukup")}
                {renderNumberInput("Hasil: Kurang", "keb_cjh_kurang")}
                {renderNumberInput("Hasil: Kurang Sekali", "keb_cjh_kurang_sekali")}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                2. Anak Usia Sekolah (SD/Sederajat) Kelas 4, 5, 6
              </h4>
              {renderNumberInput("Jumlah Total SD/Sederajat di Wilayah Kerja", "keb_sek_sd_jumlah")}
              {renderNumberInput("Jumlah SD yang Diukur Kebugaran", "keb_sek_sd_diukur")}
              {renderNumberInput("Jumlah Total Siswa Diukur Kebugaran", "keb_sek_siswa_diukur")}
              {renderNumberInput("Jumlah Siswa Usia 10-12 Tahun", "keb_sek_siswa_10_12")}

              <div className="bg-slate-50 p-4 rounded-xl mt-3 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Distribusi Hasil Kebugaran Siswa</span>
                {renderNumberInput("Hasil: Baik Sekali", "keb_sek_baik_sekali")}
                {renderNumberInput("Hasil: Baik", "keb_sek_baik")}
                {renderNumberInput("Hasil: Cukup", "keb_sek_cukup")}
                {renderNumberInput("Hasil: Kurang", "keb_sek_kurang")}
                {renderNumberInput("Hasil: Kurang Sekali", "keb_sek_kurang_sekali")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "skrining_pek_kel" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                3. Pekerja (Sektor Formal / Informal / ASN)
              </h4>
              {renderNumberInput("Jumlah Pekerja Sasaran", "keb_pek_sasaran")}
              {renderNumberInput("Jumlah Pekerja Diukur Kebugaran", "keb_pek_diukur")}
              {renderNumberInput("Jumlah Tempat Kerja yang Melakukan Pengukuran", "keb_pek_tempat_kerja")}

              <div className="bg-slate-50 p-4 rounded-xl mt-3 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Distribusi Hasil Kebugaran Pekerja</span>
                {renderNumberInput("Hasil: Baik Sekali", "keb_pek_baik_sekali")}
                {renderNumberInput("Hasil: Baik", "keb_pek_baik")}
                {renderNumberInput("Hasil: Cukup", "keb_pek_cukup")}
                {renderNumberInput("Hasil: Kurang", "keb_pek_kurang")}
                {renderNumberInput("Hasil: Kurang Sekali", "keb_pek_kurang_sekali")}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
                4. Kelompok / Klub Olahraga
              </h4>
              {renderNumberInput("Jumlah Kelompok Olahraga Terdaftar", "keb_kel_jumlah")}
              {renderNumberInput("Jumlah Kelompok Olahraga Diukur Kebugaran", "keb_kel_diukur")}

              <div className="bg-slate-50 p-4 rounded-xl mt-3 space-y-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Distribusi Hasil Kebugaran Kelompok</span>
                {renderNumberInput("Hasil: Baik Sekali", "keb_kel_baik_sekali")}
                {renderNumberInput("Hasil: Baik", "keb_kel_baik")}
                {renderNumberInput("Hasil: Cukup", "keb_kel_cukup")}
                {renderNumberInput("Hasil: Kurang", "keb_kel_kurang")}
                {renderNumberInput("Hasil: Kurang Sekali", "keb_kel_kurang_sekali")}
              </div>
            </div>
          </div>
        )}

        {activeTab === "evaluasi" && (
          <div className="space-y-4">
            <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              E. Evaluasi Faktor Risiko & Pelayanan Kesehatan Olahraga
            </h4>
            {renderNumberInput("Jumlah Orang Dilayani Cedera Olahraga (Orang)", "eval_cedera", "Kasus terkilir, kram, atau cedera sendi")}
            {renderNumberInput("Jumlah Kegiatan Penilaian Faktor Risiko Lingkungan", "eval_risiko", "Analisis faktor risiko sarana olahraga")}
            {renderNumberInput("Jumlah Orang Diberikan Latihan Fisik BBTT (Orang)", "eval_bbtt", "Latihan Baik, Benar, Teratur, & Terukur")}
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitted || isSubmitting}
            onClick={() => onSave(values, false)}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors shadow-sm disabled:opacity-50"
          >
            Simpan Sementara (Draft)
          </button>
          <button
            type="button"
            disabled={isSubmitted || isSubmitting}
            onClick={() => setShowConfirmModal(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Memproses..." : "Kirim Laporan (Final)"}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => onSave(values, true)}
        title="Kirim Laporan Final"
        message="Apakah Anda yakin ingin mengirim laporan ini? Laporan yang dikirim final dan tidak dapat diubah lagi."
        confirmText="Ya, Kirim Laporan"
        cancelText="Batal"
        type="warning"
      />
    </div>
  );
}

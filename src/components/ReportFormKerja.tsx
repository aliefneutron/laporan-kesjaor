import React, { useState } from "react";
import { KerjaValues, LIST_DISEASES, DiseaseDefinition } from "../types";
import { Plus, Minus, Info } from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

interface ReportFormKerjaProps {
  key?: string;
  initialValues: KerjaValues;
  onSave: (values: KerjaValues, submit: boolean) => void;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

export default function ReportFormKerja({
  initialValues,
  onSave,
  isSubmitting,
  isSubmitted,
}: ReportFormKerjaProps) {
  const [values, setValues] = useState<KerjaValues>({ ...initialValues });
  const [activeTab, setActiveTab] = useState<"pos_k3" | "gp2sp_binaan" | "pak_ptk" | "kk">("pos_k3");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleChange = (key: keyof KerjaValues, val: number) => {
    if (isSubmitted) return; // Prevent edits if already submitted
    setValues((prev) => ({
      ...prev,
      [key]: Math.max(0, val), // Ensure positive values
    }));
  };

  const handleDiseaseChange = (diseaseId: string, field: "pak" | "terduga" | "rujukan", val: number) => {
    if (isSubmitted) return;
    setValues((prev) => {
      const prevDiseases = prev.diseases || {};
      const prevDisease = prevDiseases[diseaseId] || { pak: 0, terduga: 0, rujukan: 0 };
      return {
        ...prev,
        diseases: {
          ...prevDiseases,
          [diseaseId]: {
            ...prevDisease,
            [field]: Math.max(0, val),
          },
        },
      };
    });
  };

  const handleToggle = (key: "pak_dokter") => {
    if (isSubmitted) return;
    setValues((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) === 1 ? 0 : 1,
    }));
  };

  const tabs = [
    { id: "pos_k3", name: "Pos UKK & K3 Perkantoran" },
    { id: "gp2sp_binaan", name: "GP2SP & RPJMN (Kesehatan Kerja)" },
    { id: "pak_ptk", name: "Penyakit (PAK, Terduga, Rujukan)" },
    { id: "kk", name: "Kecelakaan Kerja" },
  ] as const;

  const renderNumberInput = (label: string, key: keyof KerjaValues, tooltip?: string) => (
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
          disabled={isSubmitted || (values[key] || 0) <= 0}
          onClick={() => handleChange(key, (values[key] || 0) - 1)}
          className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg active:scale-95 disabled:opacity-50 transition-all font-bold"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          disabled={isSubmitted}
          value={values[key] === undefined ? "" : values[key]}
          onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
          className="w-20 text-center font-bold text-gray-800 border border-gray-200 rounded-lg py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          disabled={isSubmitted}
          onClick={() => handleChange(key, (values[key] || 0) + 1)}
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

        {activeTab === "pos_k3" && (
          <div className="space-y-4">
            <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              A. POS UKK (Upaya Kesehatan Kerja)
            </h4>
            {renderNumberInput("Jumlah Pos UKK Terbentuk", "posUkk_jumlah", "Jumlah keseluruhan Pos UKK binaan")}
            {renderNumberInput("Jumlah Pos UKK Aktif", "posUkk_aktif", "Pos UKK yang rutin melakukan pelayanan bulanan")}

            <h4 className="font-bold text-blue-900 text-sm mt-6 mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
            <h4 className="font-bold text-blue-900 text-sm mt-6 mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              A. K3 PERKANTORAN
            </h4>
            
            {renderNumberInput("Kantor Kec, POLSEK, KORAMIL, KUA", "k3_kantor_jumlah", "Jumlah Kantor Pemerintah Tingkat Kecamatan")}
            {renderNumberInput("Kantor Dinilai & Rekomendasi K3", "k3_kantor_dinilai", "Telah dilakukan penilaian & rekomendasi K3 Perkantoran")}
            {renderNumberInput("Kantor Kategori Cukup Min 40%", "k3_kantor_cukup", "Jumlah Kantor Kec, POLSEK, KORAMIL, KUA")}
            {renderNumberInput("Tempat Kerja Lain (≤100 pekerja) Melaksanakan K3", "k3_lain_kurang_100", "Kategori cukup min. 40%")}
            {renderNumberInput("Tempat Kerja Lain (>100 pekerja) Melaksanakan K3", "k3_lain_lebih_100", "Kategori cukup min. 40%")}
          </div>
        )}

        {activeTab === "gp2sp_binaan" && (
          <div className="space-y-4">
            <h4 className="font-bold text-blue-900 text-sm mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              B. GP2SP
            </h4>
            <div className="pl-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">1. Tempat Kerja Formal yang dibina GP2SP</label>
              {renderNumberInput("A. Memiliki ≤ 50 pekerja perempuan", "gp2sp_formal_bina_kurang_50")}
              {renderNumberInput("B. Memiliki > 50 pekerja perempuan", "gp2sp_formal_bina_lebih_50")}
            </div>
            {renderNumberInput("2. Tempat Kerja Formal melaksanakan GP2SP", "gp2sp_formal_laksana", "Minimal 40% instrumen GP2SP")}

            <h4 className="font-bold text-blue-900 text-sm mt-6 mb-2 border-l-4 border-blue-700 pl-2 uppercase tracking-wide">
              C. Kesehatan Kerja Tempat Kerja Formal (RPJMN)
            </h4>
            {renderNumberInput("Jumlah tempat kerja sektor formal", "formal_jumlah", "Memiliki > 100 pekerja dan/atau risiko tinggi")}
            {renderNumberInput("Tempat kerja formal melaksanakan kesja", "formal_kesja", "Sesuai instrumen kesja")}
          </div>
        )}

        {activeTab === "pak_ptk" && (
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-red-700 text-sm mb-1 border-l-4 border-red-500 pl-2 uppercase tracking-wide">
                E. Kasus Penyakit Akibat Kerja, Terduga PAK, & Rujukan PAK
              </h4>
              <p className="text-xs text-gray-500 ml-3">
                Isi jumlah kasus untuk masing-masing penyakit akibat kerja, terduga penyakit akibat kerja, dan rujukan penyakit akibat kerja (jika ada).
              </p>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 border-t border-b border-gray-100 py-4">
              {LIST_DISEASES.map((disease) => {
                const val = (values.diseases && values.diseases[disease.id]) || { pak: 0, terduga: 0, rujukan: 0 };
                
                const renderSubInput = (field: "pak" | "terduga" | "rujukan", label: string, bgClass: string, textClass: string, btnClass: string) => {
                  const currentVal = val[field] || 0;
                  return (
                    <div className={`flex items-center justify-between p-2.5 rounded-lg border ${bgClass} gap-2`}>
                      <span className={`text-[11px] font-semibold ${textClass} ml-1`}>{label}</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isSubmitted || currentVal <= 0}
                          onClick={() => handleDiseaseChange(disease.id, field, currentVal - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-600 rounded border border-gray-200 active:scale-95 disabled:opacity-50 transition-all font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          disabled={isSubmitted}
                          value={currentVal}
                          onChange={(e) => handleDiseaseChange(disease.id, field, parseInt(e.target.value) || 0)}
                          className="w-11 text-center font-bold text-gray-800 border border-gray-200 rounded bg-white py-0.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={isSubmitted}
                          onClick={() => handleDiseaseChange(disease.id, field, currentVal + 1)}
                          className={`w-7 h-7 flex items-center justify-center bg-white ${btnClass} rounded border border-gray-200 active:scale-95 disabled:opacity-50 transition-all font-bold`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                };

                return (
                  <div key={disease.id} className="p-3.5 border border-gray-150 rounded-xl bg-slate-50/55 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2.5 gap-1">
                      <div>
                        <h5 className="font-bold text-gray-800 text-xs sm:text-sm">{disease.name}</h5>
                        {disease.icd && (
                          <span className="inline-block bg-slate-200 text-slate-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold mt-1">
                            ICD-10: {disease.icd}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {renderSubInput("pak", "PAK (Penyakit Akibat Kerja)", "bg-red-50/40 border-red-100/50", "text-red-700", "hover:bg-red-50 text-red-600")}
                      {renderSubInput("terduga", "Terduga PAK", "bg-amber-50/40 border-amber-100/50", "text-amber-700", "hover:bg-amber-50 text-amber-600")}
                      {renderSubInput("rujukan", "Rujukan PAK", "bg-blue-50/40 border-blue-100/50", "text-blue-700", "hover:bg-blue-50 text-blue-600")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl mt-4">
              <div>
                <label className="text-sm font-semibold text-gray-800">Apakah memiliki dokter PAK (Ya/Tidak)</label>
                <p className="text-xs text-gray-500 italic">Ketersediaan dokter Penyakit Akibat Kerja di wilayah kerja</p>
              </div>
              <button
                type="button"
                disabled={isSubmitted}
                onClick={() => handleToggle("pak_dokter")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
                  values.pak_dokter ? "bg-red-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    values.pak_dokter ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {activeTab === "kk" && (
          <div className="space-y-4">
            <h4 className="font-bold text-rose-800 text-sm mb-2 border-l-4 border-rose-500 pl-2 uppercase tracking-wide">
              G. Kasus Kecelakaan Kerja (KK)
            </h4>
            {renderNumberInput("a. Tertusuk Jarum Suntik / Benda Tajam", "kk_jarum", "Biasa dialami nakes atau CS medis")}
            {renderNumberInput("b. Terpapar Bahan Kimia Berbahaya", "kk_kimia", "Terkena asam, uap zat, reagen laboratorium")}
            {renderNumberInput("c. Cedera Fisik (Terjatuh, Luka robek, dll)", "kk_cedera")}
            {renderNumberInput("d. Kecelakaan Kerja Lainnya", "kk_lainnya")}
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
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
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

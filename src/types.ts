export type ReportType = "kerja" | "olahraga";

export interface Puskesmas {
  id: string;
  name: string;
  kecamatan: string;
}

export const LIST_PUSKESMAS: Puskesmas[] = [
  { id: "pkm_01", name: "Puskesmas Pragaan", kecamatan: "Pragaan" },
  { id: "pkm_02", name: "Puskesmas Bluto", kecamatan: "Bluto" },
  { id: "pkm_03", name: "Puskesmas Saronggi", kecamatan: "Saronggi" },
  { id: "pkm_04", name: "Puskesmas Giligenting", kecamatan: "Giligenting" },
  { id: "pkm_05", name: "Puskesmas Talango", kecamatan: "Talango" },
  { id: "pkm_06", name: "Puskesmas Kalianget", kecamatan: "Kalianget" },
  { id: "pkm_07", name: "Puskesmas Pandian", kecamatan: "Sumenep" },
  { id: "pkm_08", name: "Puskesmas Pamolokan", kecamatan: "Sumenep" },
  { id: "pkm_09", name: "Puskesmas Batuan", kecamatan: "Batuan" },
  { id: "pkm_10", name: "Puskesmas Lenteng", kecamatan: "Lenteng" },
  { id: "pkm_11", name: "Puskesmas Moncek", kecamatan: "Lenteng" },
  { id: "pkm_12", name: "Puskesmas Ganding", kecamatan: "Ganding" },
  { id: "pkm_13", name: "Puskesmas Guluk-Guluk", kecamatan: "Guluk-Guluk" },
  { id: "pkm_14", name: "Puskesmas Pasongsongan", kecamatan: "Pasongsongan" },
  { id: "pkm_15", name: "Puskesmas Ambunten", kecamatan: "Ambunten" },
  { id: "pkm_16", name: "Puskesmas Rubaru", kecamatan: "Rubaru" },
  { id: "pkm_17", name: "Puskesmas Dasuk", kecamatan: "Dasuk" },
  { id: "pkm_18", name: "Puskesmas Manding", kecamatan: "Manding" },
  { id: "pkm_19", name: "Puskesmas Batuputih", kecamatan: "Batuputih" },
  { id: "pkm_20", name: "Puskesmas Gapura", kecamatan: "Gapura" },
  { id: "pkm_21", name: "Puskesmas Batang-Batang", kecamatan: "Batang-Batang" },
  { id: "pkm_22", name: "Puskesmas Legung", kecamatan: "Batang-Batang" },
  { id: "pkm_23", name: "Puskesmas Dungkek", kecamatan: "Dungkek" },
  { id: "pkm_24", name: "Puskesmas Nonggunong", kecamatan: "Nonggunong" },
  { id: "pkm_25", name: "Puskesmas Gayam", kecamatan: "Gayam" },
  { id: "pkm_26", name: "Puskesmas Raas", kecamatan: "Raas" },
  { id: "pkm_27", name: "Puskesmas Sapeken", kecamatan: "Sapeken" },
  { id: "pkm_28", name: "Puskesmas Arjasa", kecamatan: "Arjasa" },
  { id: "pkm_29", name: "Puskesmas Kangayan", kecamatan: "Kangayan" },
  { id: "pkm_30", name: "Puskesmas Masalembu", kecamatan: "Masalembu" },
  { id: "pkm_31", name: "Puskesmas Pagerungan", kecamatan: "Sapeken" }
];

export interface DiseaseDefinition {
  id: string;
  name: string;
  icd?: string;
}

export const LIST_DISEASES: DiseaseDefinition[] = [
  { id: "d1", name: "TB Paru Akibat Kerja", icd: "A15.0" },
  { id: "d2", name: "Mesothelioma Akibat Kerja", icd: "C45.0" },
  { id: "d3", name: "Asbestosis Akibat Kerja", icd: "J61" },
  { id: "d4", name: "Asma akibat Kerja", icd: "J45.9" },
  { id: "d5", name: "Dermatitis Kontak iritan akibat kerja", icd: "L.24" },
  { id: "d6", name: "Dermatitis kontak alergi akibat kerja", icd: "L.23" },
  { id: "d7", name: "Varicella Akibat Kerja", icd: "B01" },
  { id: "d8", name: "Carpal Tunnel Syndrome Akibat Kerja", icd: "G.56.0" },
  { id: "d9", name: "Nyeri Punggung Bawah Sederhana Akibat Kerja", icd: "M54.5" },
  { id: "d10", name: "HNP Akibat Kerja", icd: "M51.1" },
  { id: "d11", name: "Katarak Juvenilis Akibat Kerja", icd: "H.26.8" },
  { id: "d12", name: "Keratitis Exposure", icd: "H16.1" },
  { id: "d13", name: "Tuli Sensori neural akibat bising di tempat kerja (Noise Induced Hearing Loss)", icd: "H83.3" },
  { id: "d14", name: "Sinus baro trauma akibat kerja", icd: "T70.1" },
  { id: "d15", name: "Barotrauma (Mata, Saluran Cerna Saluran Napas, Kulit, Gigi) Akibat Kerja", icd: "T70.9" },
  { id: "d16", name: "Penyakit Dekompresi Akibat Kerja (Caisson Disease)", icd: "T70.3" },
  { id: "d17", name: "Hepatitis B Akibat Kerja", icd: "B16" },
  { id: "d18", name: "Hepatitis C Akibat Kerja", icd: "B17.0" },
  { id: "d19", name: "Rhinitis dan Rhinosinusitis Akibat Kerja", icd: "J00" },
  { id: "d20", name: "Laryngitis Akut Akibat Kerja", icd: "J04.0" },
  { id: "d21", name: "Covid 19", icd: "B34.2" },
];

export interface KerjaValues {
  // POS UKK
  posUkk_jumlah: number;
  posUkk_aktif: number;
  // K3 PUSKESMAS
  k3_puskesmas: number; // 1 = ya, 0 = tidak
  k3_tim: number;        // 1 = ya, 0 = tidak
  k3_pemeriksaanPegawai: number;
  k3_sarpras: number;
  k3_limbah: number;
  k3_imunisasi: number;
  // GP2SP
  gp2sp_perusahaan: number;
  gp2sp_periksaPekerja: number;
  gp2sp_kieGizi: number;
  // KESEHATAN KERJA BINAAN
  formal_binaan: number;
  informal_binaan: number;
  informal_dilayani: number;
  // NEW DISEASE STRUCTURE (PAK, TERDUGA PAK, RUJUKAN PAK)
  diseases: Record<string, { pak: number; terduga: number; rujukan: number }>;
  // KECELAKAAN KERJA (KK)
  kk_jarum: number;
  kk_kimia: number;
  kk_cedera: number;
  kk_lainnya: number;
}

export interface OlahragaValues {
  // AKTIVITAS FISIK DI PUSKESMAS
  alkes_peregangan: number;
  alkes_senam: number;
  alkes_edukasi: number;
  alkes_skrining: number;
  alkes_penyelenggara: number; // 1 = ya, 0 = tidak
  // AKTIVITAS FISIK DI PUSTU
  pustu_penyelenggara: number;
  pustu_jumlah: number;
  // PEMBINAAN KELOMPOK OLAHRAGA
  bina_mil_sasaran: number;
  bina_mil_dibina: number;
  bina_mil_ang_sasaran: number;
  bina_mil_ang_dibina: number;
  
  bina_lan_sasaran: number;
  bina_lan_dibina: number;
  bina_lan_ang_sasaran: number;
  bina_lan_ang_dibina: number;

  bina_lain_sasaran: number;
  bina_lain_dibina: number;
  bina_lain_ang_sasaran: number;
  bina_lain_ang_dibina: number;
  // SKRINING KEBUGARAN JASMANI
  // Calon Jamaah Haji
  keb_cjh_diukur: number;
  keb_cjh_terdaftar: number;
  keb_cjh_baik_sekali: number;
  keb_cjh_baik: number;
  keb_cjh_cukup: number;
  keb_cjh_kurang: number;
  keb_cjh_kurang_sekali: number;
  // Anak Sekolah (SD)
  keb_sek_sd_jumlah: number;
  keb_sek_sd_diukur: number;
  keb_sek_siswa_diukur: number;
  keb_sek_siswa_10_12: number;
  keb_sek_baik_sekali: number;
  keb_sek_baik: number;
  keb_sek_cukup: number;
  keb_sek_kurang: number;
  keb_sek_kurang_sekali: number;
  // Pekerja
  keb_pek_sasaran: number;
  keb_pek_diukur: number;
  keb_pek_tempat_kerja: number;
  keb_pek_baik_sekali: number;
  keb_pek_baik: number;
  keb_pek_cukup: number;
  keb_pek_kurang: number;
  keb_pek_kurang_sekali: number;
  // Kelompok Olahraga
  keb_kel_diukur: number;
  keb_kel_jumlah: number;
  keb_kel_baik_sekali: number;
  keb_kel_baik: number;
  keb_kel_cukup: number;
  keb_kel_kurang: number;
  keb_kel_kurang_sekali: number;
  // EVALUASI FAKTOR RISIKO
  eval_cedera: number;
  eval_risiko: number;
  eval_bbtt: number;
}

export interface MonthlyReport {
  id: string; // format: {puskesmasId}_{year}_{month}_{reportType}
  puskesmasId: string;
  puskesmasName: string;
  year: number;
  month: number;
  reportType: ReportType;
  submitted: boolean;
  submittedAt?: string;
  submittedBy?: string;
  updatedAt: string;
  updatedBy: string;
  values: KerjaValues | OlahragaValues;
}

export const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const initialDiseases: Record<string, { pak: number; terduga: number; rujukan: number }> = {};
LIST_DISEASES.forEach((d) => {
  initialDiseases[d.id] = { pak: 0, terduga: 0, rujukan: 0 };
});

export const INITIAL_KERJA_VALUES: KerjaValues = {
  posUkk_jumlah: 0,
  posUkk_aktif: 0,
  k3_puskesmas: 0,
  k3_tim: 0,
  k3_pemeriksaanPegawai: 0,
  k3_sarpras: 0,
  k3_limbah: 0,
  k3_imunisasi: 0,
  gp2sp_perusahaan: 0,
  gp2sp_periksaPekerja: 0,
  gp2sp_kieGizi: 0,
  formal_binaan: 0,
  informal_binaan: 0,
  informal_dilayani: 0,
  diseases: initialDiseases,
  kk_jarum: 0,
  kk_kimia: 0,
  kk_cedera: 0,
  kk_lainnya: 0
};

export const INITIAL_OLAHRAGA_VALUES: OlahragaValues = {
  alkes_peregangan: 0,
  alkes_senam: 0,
  alkes_edukasi: 0,
  alkes_skrining: 0,
  alkes_penyelenggara: 0,
  pustu_penyelenggara: 0,
  pustu_jumlah: 0,
  bina_mil_sasaran: 0,
  bina_mil_dibina: 0,
  bina_mil_ang_sasaran: 0,
  bina_mil_ang_dibina: 0,
  bina_lan_sasaran: 0,
  bina_lan_dibina: 0,
  bina_lan_ang_sasaran: 0,
  bina_lan_ang_dibina: 0,
  bina_lain_sasaran: 0,
  bina_lain_dibina: 0,
  bina_lain_ang_sasaran: 0,
  bina_lain_ang_dibina: 0,
  keb_cjh_diukur: 0,
  keb_cjh_terdaftar: 0,
  keb_cjh_baik_sekali: 0,
  keb_cjh_baik: 0,
  keb_cjh_cukup: 0,
  keb_cjh_kurang: 0,
  keb_cjh_kurang_sekali: 0,
  keb_sek_sd_jumlah: 0,
  keb_sek_sd_diukur: 0,
  keb_sek_siswa_diukur: 0,
  keb_sek_siswa_10_12: 0,
  keb_sek_baik_sekali: 0,
  keb_sek_baik: 0,
  keb_sek_cukup: 0,
  keb_sek_kurang: 0,
  keb_sek_kurang_sekali: 0,
  keb_pek_sasaran: 0,
  keb_pek_diukur: 0,
  keb_pek_tempat_kerja: 0,
  keb_pek_baik_sekali: 0,
  keb_pek_baik: 0,
  keb_pek_cukup: 0,
  keb_pek_kurang: 0,
  keb_pek_kurang_sekali: 0,
  keb_kel_diukur: 0,
  keb_kel_jumlah: 0,
  keb_kel_baik_sekali: 0,
  keb_kel_baik: 0,
  keb_kel_cukup: 0,
  keb_kel_kurang: 0,
  keb_kel_kurang_sekali: 0,
  eval_cedera: 0,
  eval_risiko: 0,
  eval_bbtt: 0
};

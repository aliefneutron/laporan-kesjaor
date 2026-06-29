import React from "react";
import { OlahragaValues, MONTH_NAMES } from "../types";

interface OfficialTableOlahragaProps {
  title: string;
  puskesmasName: string;
  year: number;
  month: number;
  data: OlahragaValues;
  isAggregate?: boolean;
}

export default function OfficialTableOlahraga({
  title,
  puskesmasName,
  year,
  month,
  data,
  isAggregate = false,
}: OfficialTableOlahragaProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6" id="official-table-olahraga">
      {/* Header Form */}
      <div className="text-center mb-6">
        <h2 className="font-sans font-bold text-lg text-gray-800 tracking-tight uppercase">
          LAPORAN BULANAN KESEHATAN OLAHRAGA (LBKO)
        </h2>
        <h3 className="font-sans font-semibold text-md text-gray-700 uppercase">
          PROVINSI JAWA TIMUR TAHUN {year}
        </h3>
        <div className="mt-4 flex flex-col sm:flex-row justify-between text-left text-sm text-gray-600 max-w-xl mx-auto border-t border-b border-gray-100 py-2">
          <div>
            <span className="font-medium">KABUPATEN / KOTA:</span> KABUPATEN SUMENEP
          </div>
          <div>
            <span className="font-medium">PUSKESMAS:</span> {isAggregate ? "REKAPITULASI KABUPATEN (31 PUSKESMAS)" : puskesmasName.toUpperCase()}
          </div>
          <div>
            <span className="font-medium">BULAN:</span> {MONTH_NAMES[month - 1]?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <table className="w-full text-left text-xs border-collapse border border-gray-300">
        <thead>
          <tr className="bg-slate-100 text-slate-900 font-bold text-center">
            <th className="border border-gray-300 px-2 py-2 w-12" rowSpan={2}>NO</th>
            <th className="border border-gray-300 px-2 py-2" rowSpan={2}>INDIKATOR KINERJA KESEHATAN OLAHRAGA</th>
            <th className="border border-gray-300 px-2 py-2 w-24" rowSpan={2}>SATUAN</th>
            <th className="border border-gray-300 px-2 py-2 w-24" rowSpan={2}>CAPAIAN</th>
            <th className="border border-gray-300 px-2 py-2 w-32" colSpan={5}>DISTRIBUSI HASIL KEBUGARAN (JIKA ADA)</th>
          </tr>
          <tr className="bg-slate-100/50 text-slate-800 font-semibold text-center text-[10px]">
            <th className="border border-gray-300 px-1 py-1 w-10">BS</th>
            <th className="border border-gray-300 px-1 py-1 w-10">B</th>
            <th className="border border-gray-300 px-1 py-1 w-10">C</th>
            <th className="border border-gray-300 px-1 py-1 w-10">K</th>
            <th className="border border-gray-300 px-1 py-1 w-10">KS</th>
          </tr>
        </thead>
        <tbody>
          {/* A. AKTIVITAS FISIK DI PUSKESMAS */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">A</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={7}>AKTIVITAS FISIK DI PUSKESMAS</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Peregangan (Internal) yang Dilakukan</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kali</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.alkes_peregangan}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Senam / Olahraga Bersama yang Dilakukan</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kali</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.alkes_senam}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">3</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Edukasi Aktivitas Fisik (Dalam/Luar Gedung)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kali</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.alkes_edukasi}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">4</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Pelayanan Skrining Kebugaran Jasmani</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Orang</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-bold text-blue-900">{data.alkes_skrining}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">5</td>
            <td className="border border-gray-300 px-3 py-1.5">Puskesmas menyelenggarakan Aktivitas Fisik</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Puskesmas</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">
              {isAggregate ? `${data.alkes_penyelenggara} PKM` : (data.alkes_penyelenggara ? "YA" : "TIDAK")}
            </td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>

          {/* B. AKTIVITAS FISIK DI PUSTU */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">B</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={7}>AKTIVITAS FISIK DI PUSTU</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Pustu yang Menyelenggarakan Aktivitas Fisik</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Pustu</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.pustu_penyelenggara}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Seluruh Pustu di Wilayah Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Pustu</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.pustu_jumlah}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>

          {/* C. PEMBINAAN KELOMPOK OLAHRAGA */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">C</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={7}>PEMBINAAN KELOMPOK OLAHRAGA (IBU HAMIL, LANSIA, KEL. LAIN)</td>
          </tr>
          {/* Ibu Hamil */}
          <tr>
            <td className="border border-gray-300 px-3 py-1 text-center font-medium" rowSpan={4}>1</td>
            <td className="border border-gray-300 px-3 py-1 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Kelompok Olahraga Ibu Hamil</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah Kelompok Sasaran / Kelompok yang ada</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_mil_sasaran}</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={3}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Kelompok yang Aktif Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-medium text-blue-900">{data.bina_mil_dibina}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">c. Jumlah Anggota Kelompok yang Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_mil_ang_dibina} / {data.bina_mil_ang_sasaran} sasaran</td>
          </tr>
          {/* Lansia */}
          <tr>
            <td className="border border-gray-300 px-3 py-1 text-center font-medium" rowSpan={4}>2</td>
            <td className="border border-gray-300 px-3 py-1 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Kelompok Olahraga Lansia</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah Kelompok Sasaran / Kelompok yang ada</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_lan_sasaran}</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={3}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Kelompok yang Aktif Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-medium text-blue-900">{data.bina_lan_dibina}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">c. Jumlah Anggota Kelompok yang Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_lan_ang_dibina} / {data.bina_lan_ang_sasaran} sasaran</td>
          </tr>
          {/* Kelompok Lain */}
          <tr>
            <td className="border border-gray-300 px-3 py-1 text-center font-medium" rowSpan={4}>3</td>
            <td className="border border-gray-300 px-3 py-1 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Kelompok Olahraga Lainnya (Klub Jantung Sehat, Prolanis, dll)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah Kelompok Sasaran / Kelompok yang ada</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_lain_sasaran}</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={3}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Kelompok yang Aktif Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-medium text-blue-900">{data.bina_lain_dibina}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">c. Jumlah Anggota Kelompok yang Dibina</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.bina_lain_ang_dibina} / {data.bina_lain_ang_sasaran} sasaran</td>
          </tr>

          {/* D. SKRINING KEBUGARAN JASMANI */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">D</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={7}>SKRINING KEBUGARAN JASMANI</td>
          </tr>
          {/* Calon Jamaah Haji */}
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-medium" rowSpan={3}>1</td>
            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Calon Jamaah Haji (CJH)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah CJH Terdaftar (Sasaran)</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.keb_cjh_terdaftar}</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={2}>
              <div className="flex justify-around text-[10px] font-mono text-gray-600">
                <span>BS: {data.keb_cjh_baik_sekali}</span>
                <span>B: {data.keb_cjh_baik}</span>
                <span>C: {data.keb_cjh_cukup}</span>
                <span>K: {data.keb_cjh_kurang}</span>
                <span>KS: {data.keb_cjh_kurang_sekali}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah CJH Diukur Kebugaran Jasmani</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-900">{data.keb_cjh_diukur}</td>
          </tr>

          {/* Anak Sekolah */}
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-medium" rowSpan={4}>2</td>
            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Anak Usia Sekolah (SD/Sederajat) Kelas 4, 5, 6</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah SD/Sederajat di Wilayah Kerja / yang Diukur</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Sekolah</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.keb_sek_sd_diukur} / {data.keb_sek_sd_jumlah} SD</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={3}>
              <div className="flex justify-around text-[10px] font-mono text-gray-600">
                <span>BS: {data.keb_sek_baik_sekali}</span>
                <span>B: {data.keb_sek_baik}</span>
                <span>C: {data.keb_sek_cukup}</span>
                <span>K: {data.keb_sek_kurang}</span>
                <span>KS: {data.keb_sek_kurang_sekali}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Siswa yang Diukur Kebugaran (Orang)</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-900">{data.keb_sek_siswa_diukur}</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">c. Jumlah Siswa Usia 10-12 Tahun di Wilayah Kerja</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.keb_sek_siswa_10_12}</td>
          </tr>

          {/* Pekerja */}
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-medium" rowSpan={3}>3</td>
            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Pekerja (Sektor Formal / Informal / ASN)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah Pekerja Sasaran / Jumlah Tempat Kerja Mengukur</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Campur</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.keb_pek_sasaran} sasaran / {data.keb_pek_tempat_kerja} tempat</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={2}>
              <div className="flex justify-around text-[10px] font-mono text-gray-600">
                <span>BS: {data.keb_pek_baik_sekali}</span>
                <span>B: {data.keb_pek_baik}</span>
                <span>C: {data.keb_pek_cukup}</span>
                <span>K: {data.keb_pek_kurang}</span>
                <span>KS: {data.keb_pek_kurang_sekali}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Pekerja yang Diukur Kebugaran Jasmani</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Orang</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-900">{data.keb_pek_diukur}</td>
          </tr>

          {/* Kelompok Olahraga */}
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-medium" rowSpan={3}>4</td>
            <td className="border border-gray-300 px-3 py-1.5 font-semibold text-gray-700 bg-slate-50/40" colSpan={7}>Kelompok / Klub Olahraga</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">a. Jumlah Kelompok Olahraga Terdaftar di Wilayah Kerja</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center">{data.keb_kel_jumlah}</td>
            <td className="border border-gray-300 px-2 py-1 text-center bg-gray-50" colSpan={5} rowSpan={2}>
              <div className="flex justify-around text-[10px] font-mono text-gray-600">
                <span>BS: {data.keb_kel_baik_sekali}</span>
                <span>B: {data.keb_kel_baik}</span>
                <span>C: {data.keb_kel_cukup}</span>
                <span>K: {data.keb_kel_kurang}</span>
                <span>KS: {data.keb_kel_kurang_sekali}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-5 py-1 text-gray-600">b. Jumlah Kelompok Olahraga Diukur Kebugaran</td>
            <td className="border border-gray-300 px-2 py-1 text-center">Kelompok</td>
            <td className="border border-gray-300 px-2 py-1 text-center font-bold text-blue-900">{data.keb_kel_diukur}</td>
          </tr>

          {/* E. EVALUASI FAKTOR RISIKO */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">E</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={7}>EVALUASI FAKTOR RISIKO & PELAYANAN KESJAOR</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Orang yang Dilayani Penanganan Cedera Olahraga</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Orang</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.eval_cedera}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Penilaian Faktor Risiko Lingkungan Kesehatan Olahraga</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kegiatan</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.eval_risiko}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">3</td>
            <td className="border border-gray-300 px-3 py-1.5 font-medium">Jumlah Orang yang Diberikan Latihan Fisik BBTT</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Orang</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-bold text-blue-900">{data.eval_bbtt}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center bg-gray-50" colSpan={5}>-</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

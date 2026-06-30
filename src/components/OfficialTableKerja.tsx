import React from "react";
import { KerjaValues, MONTH_NAMES, LIST_DISEASES } from "../types";

interface OfficialTableKerjaProps {
  title: string;
  puskesmasName: string;
  year: number;
  month: number;
  data: KerjaValues;
  isAggregate?: boolean;
}

export default function OfficialTableKerja({
  title,
  puskesmasName,
  year,
  month,
  data,
  isAggregate = false,
}: OfficialTableKerjaProps) {
  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm p-6" id="official-table-kerja">
      {/* Header Form */}
      <div className="text-center mb-6">
        <h2 className="font-sans font-bold text-lg text-gray-800 tracking-tight uppercase">
          LAPORAN BULANAN KESEHATAN KERJA / PEKERJA (LBKP)
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
          <tr className="bg-slate-100 text-slate-900 font-bold">
            <th className="border border-gray-300 px-3 py-2 text-center w-12" rowSpan={2}>NO</th>
            <th className="border border-gray-300 px-3 py-2 text-center" rowSpan={2}>INDIKATOR KINERJA</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-28" rowSpan={2}>SATUAN</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-28" rowSpan={2}>CAPAIAN</th>
            <th className="border border-gray-300 px-3 py-2 text-center w-40" rowSpan={2}>KETERANGAN</th>
          </tr>
          <tr className="bg-slate-100/50 text-slate-800 text-center font-semibold"></tr>
        </thead>
        <tbody>
          {/* A. POS UKK */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">A</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>POS UKK (UPAYA KESEHATAN KERJA)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Pos UKK Terbentuk</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Pos</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.posUkk_jumlah}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Total Pos binaan yang ada</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5 font-medium">Jumlah Pos UKK Aktif</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Pos</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-bold text-blue-900">{data.posUkk_aktif}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Pos dengan kegiatan rutin</td>
          </tr>

          {/* B. K3 PERKANTORAN */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">B</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>K3 PERKANTORAN</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Kantor Pemerintah Tingkat Kecamatan, yaitu Kantor Kec, POLSEK, KORAMIL, KUA</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kantor</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.k3_kantor_jumlah}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Kantor Kec, POLSEK, KORAMIL, KUA</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Kantor Kec, POLSEK, KORAMIL, KUA yang telah dilakukan penilaian & rekomendasi K3 Perkantoran</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kantor</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.k3_kantor_dinilai}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Telah dinilai K3</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">3</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Kantor Kec, POLSEK, KORAMIL, KUA dengan kategori cukup min. 40%</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Kantor</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.k3_kantor_cukup}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Kategori cukup min. 40%</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">4</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Tempat Kerja lainnya (≤ 100 pekerja) melaksanakan K3 Perkantoran (kategori cukup min. 40%)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.k3_lain_kurang_100}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">≤ 100 pekerja</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">5</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Tempat Kerja lainnya (&gt; 100 pekerja) melaksanakan K3 Perkantoran (kategori cukup min. 40%)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.k3_lain_lebih_100}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">&gt; 100 pekerja</td>
          </tr>

          {/* C. GP2SP */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">C</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>GP2SP</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5 font-bold" colSpan={4}>Jumlah Tempat Kerja Formal yang dibina GP2SP (sosialisasi, skrining, dsb)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center"></td>
            <td className="border border-gray-300 px-3 py-1.5 pl-8">A. Jumlah tempat kerja yang memiliki ≤ 50 pekerja perempuan</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.gp2sp_formal_bina_kurang_50}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">≤ 50 pekerja perempuan</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center"></td>
            <td className="border border-gray-300 px-3 py-1.5 pl-8">B. Jumlah tempat kerja yang memiliki &gt; 50 pekerja perempuan</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.gp2sp_formal_bina_lebih_50}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">&gt; 50 pekerja perempuan</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah Tempat Kerja Formal melaksanakan GP2SP (min. 40% instrumen GP2SP)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.gp2sp_formal_laksana}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Melaksanakan min. 40%</td>
          </tr>

          {/* D. KESEHATAN KERJA TEMPAT KERJA FORMAL (RPJMN) */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">D</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>KESEHATAN KERJA TEMPAT KERJA FORMAL (RPJMN)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">1</td>
            <td className="border border-gray-300 px-3 py-1.5">Jumlah tempat kerja sektor formal (memiliki &gt; 100 pekerja dan/atau risiko tinggi)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.formal_jumlah}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Sektor formal</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center">2</td>
            <td className="border border-gray-300 px-3 py-1.5">Tempat kerja sektor formal (memiliki &gt; 100 pekerja dan/atau risiko tinggi) yang melaksanakan kesehatan kerja sesuai instrumen kesja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center">Tempat Kerja</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-semibold">{data.formal_kesja}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Melaksanakan kesja</td>
          </tr>

          {/* E. PENYAKIT AKIBAT KERJA (PAK) */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">E</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>KASUS PENYAKIT AKIBAT KERJA (PAK), TERDUGA PAK, DAN RUJUKAN PAK</td>
          </tr>
          {LIST_DISEASES.map((disease, index) => {
            const val = (data.diseases && data.diseases[disease.id]) || { pak: 0, terduga: 0, rujukan: 0 };
            return (
              <tr key={disease.id}>
                <td className="border border-gray-300 px-3 py-1 text-center font-mono">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-1 bg-slate-50/40">
                  <div className="font-semibold text-gray-900">{disease.name}</div>
                  {disease.icd && <span className="inline-block bg-slate-200 text-slate-800 text-[10px] font-mono px-1.5 py-0.5 rounded-sm mt-0.5 font-bold">ICD-10: {disease.icd}</span>}
                </td>
                <td className="border border-gray-300 px-3 py-1 text-center text-gray-500 italic">Kasus</td>
                <td className="border border-gray-300 px-3 py-1">
                  <div className="flex flex-col gap-1 py-1 font-mono">
                    <div className="flex justify-between items-center bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold border border-red-100/50">
                      <span>PAK:</span>
                      <span>{val.pak || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100/50">
                      <span>Terduga PAK:</span>
                      <span>{val.terduga || 0}</span>
                    </div>
                    <div className="flex justify-between items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100/50">
                      <span>Rujukan PAK:</span>
                      <span>{val.rujukan || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-1 text-gray-400 italic">
                  {disease.name} Terlapor
                </td>
              </tr>
            );
          })}
          <tr>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-bold" colSpan={3}>Apakah memiliki dokter PAK (Ya/Tidak)</td>
            <td className="border border-gray-300 px-3 py-1.5 text-center font-bold text-red-700">{isAggregate ? `${data.pak_dokter} PKM` : (data.pak_dokter ? "Ya" : "Tidak")}</td>
            <td className="border border-gray-300 px-3 py-1.5 text-gray-500 italic">Ketersediaan dokter PAK</td>
          </tr>

          {/* F. KECELAKAAN KERJA (KK) */}
          <tr className="bg-gray-100 font-bold text-gray-800">
            <td className="border border-gray-300 px-3 py-1.5 text-center">F</td>
            <td className="border border-gray-300 px-3 py-1.5" colSpan={4}>KASUS KECELAKAAN KERJA (KK)</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3. py-1 text-center" rowSpan={4}>1</td>
            <td className="border border-gray-300 px-3 py-1 font-medium bg-slate-50/40">a. Tertusuk Jarum Suntik / Benda Tajam</td>
            <td className="border border-gray-300 px-3 py-1 text-center">Kasus</td>
            <td className="border border-gray-300 px-3 py-1 text-center text-rose-600 font-semibold">{data.kk_jarum}</td>
            <td className="border border-gray-300 px-3 py-1 text-gray-400 italic">Nakes / petugas kebersihan</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1 font-medium bg-slate-50/40">b. Terpapar Bahan Kimia Berbahaya</td>
            <td className="border border-gray-300 px-3 py-1 text-center">Kasus</td>
            <td className="border border-gray-300 px-3 py-1 text-center text-rose-600 font-semibold">{data.kk_kimia}</td>
            <td className="border border-gray-300 px-3 py-1 text-gray-400 italic">Cairan laboratorium, disinfektan</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1 font-medium bg-slate-50/40">c. Cedera Fisik (Terjatuh, Luka robek, dll)</td>
            <td className="border border-gray-300 px-3 py-1 text-center">Kasus</td>
            <td className="border border-gray-300 px-3 py-1 text-center text-rose-600 font-semibold">{data.kk_cedera}</td>
            <td className="border border-gray-300 px-3 py-1 text-gray-400 italic">Di tempat kerja/lapangan</td>
          </tr>
          <tr>
            <td className="border border-gray-300 px-3 py-1 font-medium bg-slate-50/40">d. Kecelakaan Kerja Lainnya</td>
            <td className="border border-gray-300 px-3 py-1 text-center">Kasus</td>
            <td className="border border-gray-300 px-3 py-1 text-center text-rose-600 font-semibold">{data.kk_lainnya}</td>
            <td className="border border-gray-300 px-3 py-1 text-gray-400 italic">Lain-lain</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

import React from "react";
import { LIST_PUSKESMAS, MONTH_NAMES, MonthlyReport, ReportType, KerjaValues, OlahragaValues } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Activity, ShieldAlert, Award, TrendingUp, Sparkles, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface DashboardStatsProps {
  reports: MonthlyReport[];
  selectedYear: number;
  reportType: ReportType;
  selectedMonth: number; // 1-indexed
}

const COLORS = ["#1e3a8a", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

export default function DashboardStats({
  reports,
  selectedYear,
  reportType,
  selectedMonth,
}: DashboardStatsProps) {
  const [showMissing, setShowMissing] = React.useState(false);

  // Filter reports matching selected year, month, and reportType
  const activeReports = reports.filter(
    (r) => r.year === selectedYear && r.reportType === reportType
  );

  const monthReports = activeReports.filter((r) => r.month === selectedMonth);
  const submittedMonthReports = monthReports.filter((r) => r.submitted);

  // Calculate aggregates
  let totalPosUkk = 0;
  let totalPosUkkAktif = 0;
  let totalPakCases = 0;
  let totalPtkCases = 0;
  let totalKecelakaanKerja = 0;

  // Olahraga aggregates
  let totalSkriningKebugaran = 0;
  let totalKelompokBinaan = 0;
  let totalLatihanBbtt = 0;
  let distKebugaran = {
    baikSekali: 0,
    baik: 0,
    cukup: 0,
    kurang: 0,
    kurangSekali: 0,
  };

  submittedMonthReports.forEach((r) => {
    if (reportType === "kerja") {
      const v = r.values as KerjaValues;
      totalPosUkk += v.posUkk_jumlah || 0;
      totalPosUkkAktif += v.posUkk_aktif || 0;
      
      let pakSum = 0;
      let terdugaSum = 0;
      if (v.diseases) {
        Object.values(v.diseases).forEach((d) => {
          pakSum += d.pak || 0;
          terdugaSum += d.terduga || 0;
        });
      }
      totalPakCases += pakSum;
      totalPtkCases += terdugaSum; // mapping to terduga pak
      totalKecelakaanKerja +=
        (v.kk_jarum || 0) + (v.kk_kimia || 0) + (v.kk_cedera || 0) + (v.kk_lainnya || 0);
    } else {
      const v = r.values as OlahragaValues;
      totalSkriningKebugaran += (v.alkes_skrining || 0) + (v.keb_cjh_diukur || 0) + (v.keb_sek_siswa_diukur || 0) + (v.keb_pek_diukur || 0) + (v.keb_kel_diukur || 0);
      totalKelompokBinaan += (v.bina_mil_dibina || 0) + (v.bina_lan_dibina || 0) + (v.bina_lain_dibina || 0);
      totalLatihanBbtt += v.eval_bbtt || 0;

      // Sum up physical fitness distributions
      distKebugaran.baikSekali += (v.keb_cjh_baik_sekali || 0) + (v.keb_sek_baik_sekali || 0) + (v.keb_pek_baik_sekali || 0) + (v.keb_kel_baik_sekali || 0);
      distKebugaran.baik += (v.keb_cjh_baik || 0) + (v.keb_sek_baik || 0) + (v.keb_pek_baik || 0) + (v.keb_kel_baik || 0);
      distKebugaran.cukup += (v.keb_cjh_cukup || 0) + (v.keb_sek_cukup || 0) + (v.keb_pek_cukup || 0) + (v.keb_kel_cukup || 0);
      distKebugaran.kurang += (v.keb_cjh_kurang || 0) + (v.keb_sek_kurang || 0) + (v.keb_pek_kurang || 0) + (v.keb_kel_kurang || 0);
      distKebugaran.kurangSekali += (v.keb_cjh_kurang_sekali || 0) + (v.keb_sek_kurang_sekali || 0) + (v.keb_pek_kurang_sekali || 0) + (v.keb_kel_kurang_sekali || 0);
    }
  });

  // KPI Bento cards
  const rateSubmission = Math.round((submittedMonthReports.length / LIST_PUSKESMAS.length) * 100) || 0;

  // Chart data 1: Kepatuhan per bulan
  const trendKepatuhanData = Array.from({ length: 12 }).map((_, idx) => {
    const monthNum = idx + 1;
    const submittedCount = activeReports.filter((r) => r.month === monthNum && r.submitted).length;
    const draftCount = activeReports.filter((r) => r.month === monthNum && !r.submitted).length;
    return {
      name: MONTH_NAMES[idx].substring(0, 3),
      Terkirim: submittedCount,
      Draft: draftCount,
    };
  });

  // Chart data 2: Penyakit / Kebugaran top puskesmas (Top 8 PKM)
  const pkmPerformanceData = LIST_PUSKESMAS.map((pkm) => {
    const pkmReport = submittedMonthReports.find((r) => r.puskesmasId === pkm.id);
    let value1 = 0;
    let value2 = 0;

    if (pkmReport) {
      if (reportType === "kerja") {
        const v = pkmReport.values as KerjaValues;
        value1 = v.posUkk_aktif || 0;
        let diseasesSum = 0;
        if (v.diseases) {
          Object.values(v.diseases).forEach((d) => {
            diseasesSum += (d.pak || 0) + (d.terduga || 0) + (d.rujukan || 0);
          });
        }
        value2 = diseasesSum;
      } else {
        const v = pkmReport.values as OlahragaValues;
        value1 = v.alkes_skrining || 0;
        value2 = (v.bina_mil_dibina || 0) + (v.bina_lan_dibina || 0) + (v.bina_lain_dibina || 0);
      }
    }

    return {
      name: pkm.name.replace("Puskesmas ", ""),
      Label1: value1,
      Label2: value2,
    };
  })
    .filter((d) => d.Label1 > 0 || d.Label2 > 0)
    .slice(0, 8);

  const dataPieKebugaran = [
    { name: "Baik Sekali", value: distKebugaran.baikSekali },
    { name: "Baik", value: distKebugaran.baik },
    { name: "Cukup", value: distKebugaran.cukup },
    { name: "Kurang", value: distKebugaran.kurang },
    { name: "Kurang Sekali", value: distKebugaran.kurangSekali },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Incomplete Data warning banner */}
      {submittedMonthReports.length < LIST_PUSKESMAS.length && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 shadow-sm transition-all" id="banner-rekap-tidak-lengkap">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-bold text-amber-950 text-sm">Capaian Kabupaten Belum Lengkap (31 Puskesmas)</p>
                <p className="text-amber-800 mt-0.5">
                  Baru <strong>{submittedMonthReports.length} dari 31 Puskesmas</strong> yang mengirimkan Laporan Final untuk bulan <strong>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</strong>.
                  Data Capaian Pos UKK Aktif dan Kasus PAK di bawah belum mencakup kondisi riil seluruh kabupaten Sumenep.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMissing(!showMissing)}
              className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-950 font-semibold px-3 py-1.5 rounded-lg border border-amber-200/50 transition self-start sm:self-center shrink-0"
              id="btn-toggle-missing-pkm"
            >
              <span>{showMissing ? "Sembunyikan" : "Lihat"} Puskesmas Belum Melapor</span>
              {showMissing ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          
          {showMissing && (
            <div className="mt-3 pt-3 border-t border-amber-200/50">
              <p className="font-semibold text-amber-950 mb-1.5">Berikut daftar {LIST_PUSKESMAS.length - submittedMonthReports.length} Puskesmas yang belum mengirim laporan:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {LIST_PUSKESMAS.filter(p => !submittedMonthReports.some(r => r.puskesmasId === p.id)).map(p => (
                  <div key={p.id} className="bg-white/60 px-2.5 py-1 rounded border border-amber-200/40 font-medium text-amber-950">
                    • {p.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bento Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Rasio Kepatuhan</p>
            <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{rateSubmission}%</h4>
            <p className="text-[10px] text-gray-400">
              {submittedMonthReports.length} dari {LIST_PUSKESMAS.length} Puskesmas mengirim
            </p>
          </div>
        </div>

        {reportType === "kerja" ? (
          <>
            {/* Metric 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Pos UKK Aktif</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">
                  {totalPosUkkAktif} <span className="text-xs font-normal text-gray-400">/ {totalPosUkk}</span>
                </h4>
                <p className="text-[10px] text-gray-400">Total Pos UKK terdata aktif</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Kasus PAK</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{totalPakCases}</h4>
                <p className="text-[10px] text-gray-400">Penyakit Akibat Kerja teridentifikasi</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Kecelakaan Kerja</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{totalKecelakaanKerja}</h4>
                <p className="text-[10px] text-gray-400">Kasus kecelakaan kerja dilaporkan</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Metric 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Skrining Kebugaran</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{totalSkriningKebugaran}</h4>
                <p className="text-[10px] text-gray-400">Siswa, CJH, & Pekerja diukur</p>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Kelompok Olahraga</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{totalKelompokBinaan}</h4>
                <p className="text-[10px] text-gray-400">Kelompok olahraga aktif dibina</p>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Latihan BBTT</p>
                <h4 className="text-2xl font-bold text-gray-800 font-mono mt-0.5">{totalLatihanBbtt}</h4>
                <p className="text-[10px] text-gray-400">Konseling latihan fisik teratur</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Kepatuhan */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-4">Tren Kepatuhan Pelaporan Bulanan ({selectedYear})</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendKepatuhanData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="Terkirim" fill="#1e3a8a" radius={[4, 4, 0, 0]} name="Terkirim (Final)" />
                <Bar dataKey="Draft" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Draft (Belum Kirim)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Puskesmas Comparison */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h4 className="font-bold text-gray-800 text-sm mb-4">
            {reportType === "kerja"
              ? `Capaian Pos UKK Aktif & Kasus PAK (Bulan ${MONTH_NAMES[selectedMonth - 1]})`
              : `Pelayanan Skrining & Kelompok Olahraga (Bulan ${MONTH_NAMES[selectedMonth - 1]})`}
          </h4>
          {pkmPerformanceData.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
              <Activity className="w-10 h-10 mb-2 stroke-1" />
              <p className="text-xs">Belum ada Puskesmas yang melaporkan data di bulan ini</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pkmPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} interval={0} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    dataKey="Label1"
                    fill={reportType === "kerja" ? "#2563eb" : "#1d4ed8"}
                    name={reportType === "kerja" ? "Pos UKK Aktif" : "Skrining Kebugaran"}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Label2"
                    fill={reportType === "kerja" ? "#ef4444" : "#7c3aed"}
                    name={reportType === "kerja" ? "Kasus Penyakit" : "Kelompok Binaan"}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Fitness Distribution & Info */}
      {reportType === "olahraga" && dataPieKebugaran.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h4 className="font-bold text-gray-800 text-sm mb-2">Distribusi Hasil Kebugaran Jasmani</h4>
            <p className="text-xs text-gray-500 mb-4">
              Akumulasi hasil pengukuran kebugaran jasmani di seluruh target (Calon Jamaah Haji, Anak Sekolah, Pekerja, & Kelompok Olahraga) untuk bulan {MONTH_NAMES[selectedMonth - 1]}.
            </p>
            <div className="space-y-2">
              {dataPieKebugaran.map((item, index) => (
                <div key={item.name} className="flex justify-between text-xs items-center p-2 rounded-lg bg-slate-50 border border-gray-100/50">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-bold text-gray-950 font-mono">{item.value} Orang</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-64 flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPieKebugaran}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dataPieKebugaran.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { LIST_PUSKESMAS, MONTH_NAMES, MonthlyReport, ReportType } from "../types";
import { Check, Edit2, AlertCircle } from "lucide-react";

interface SubmissionGridProps {
  reports: MonthlyReport[];
  selectedYear: number;
  reportType: ReportType;
  onSelectPuskesmasMonth: (puskesmasId: string, monthIndex: number) => void;
}

export default function SubmissionGrid({
  reports,
  selectedYear,
  reportType,
  onSelectPuskesmasMonth,
}: SubmissionGridProps) {
  // Create a map for quick report lookup: key = {puskesmasId}_{month} -> MonthlyReport
  const reportMap = new Map<string, MonthlyReport>();
  reports.forEach((report) => {
    if (report.year === selectedYear && report.reportType === reportType) {
      reportMap.set(`${report.puskesmasId}_${report.month}`, report);
    }
  });

  // Calculate submission stats
  const totalPuskesmas = LIST_PUSKESMAS.length;
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="font-sans font-bold text-lg text-gray-800 tracking-tight">
            Matriks Pelaporan Puskesmas ({selectedYear})
          </h3>
          <p className="text-xs text-gray-500">
            Daftar kepatuhan pelaporan bulanan untuk jenis laporan:{" "}
            <span className="font-semibold text-blue-900 uppercase">
              {reportType === "kerja" ? "LBKP (Laporan Bulanan Kesehatan Kerja/Pekerja)" : "LBKO (Laporan Bulanan Kesehatan Olahraga)"}
            </span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-3 md:mt-0 text-[11px] font-medium text-gray-600 bg-slate-50 p-2.5 rounded-lg border border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">✓</span>
            <span>Terkirim (Final)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 text-white flex items-center justify-center text-[8px] font-bold">✎</span>
            <span>Draft (Simpan)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-200"></span>
            <span>Belum Isi</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 sticky top-0 z-10">
            <tr>
              <th className="border-b border-gray-200 p-3 font-bold text-gray-700 bg-slate-50 sticky left-0 z-20 shadow-[2px_0_5px_rgba(0,0,0,0.05)] w-56">
                Nama Puskesmas
              </th>
              {MONTH_NAMES.map((month, idx) => (
                <th key={month} className="border-b border-gray-200 p-2 font-semibold text-gray-600 text-center min-w-[50px]">
                  {month.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIST_PUSKESMAS.map((pkm) => {
              return (
                <tr key={pkm.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Puskesmas Name Sticky Column */}
                  <td className="border-b border-gray-150 p-3 font-semibold text-gray-800 bg-white sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)] flex flex-col">
                    <span>{pkm.name}</span>
                    <span className="text-[10px] font-normal text-gray-400 font-mono">Kec. {pkm.kecamatan}</span>
                  </td>

                  {/* 12 Months Cells */}
                  {Array.from({ length: 12 }).map((_, mIdx) => {
                    const monthNum = mIdx + 1;
                    const report = reportMap.get(`${pkm.id}_${monthNum}`);

                    let cellBg = "bg-white hover:bg-slate-100";
                    let content = null;
                    let tooltip = "Belum Mengisi Data";

                    if (report) {
                      if (report.submitted) {
                        cellBg = "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700";
                        content = <Check className="w-3.5 h-3.5 mx-auto" />;
                        tooltip = `Status: Terkirim (Final)\nDiperbarui: ${new Date(report.updatedAt).toLocaleDateString()}`;
                      } else {
                        cellBg = "bg-amber-400/15 hover:bg-amber-400/25 text-amber-700";
                        content = <Edit2 className="w-3 h-3 mx-auto" />;
                        tooltip = `Status: Draft (Belum Kirim)\nDiperbarui: ${new Date(report.updatedAt).toLocaleDateString()}`;
                      }
                    }

                    return (
                      <td
                        key={mIdx}
                        onClick={() => onSelectPuskesmasMonth(pkm.id, mIdx)}
                        className={`border-b border-gray-150 p-2 text-center cursor-pointer transition-colors relative group border-r border-gray-100 ${cellBg}`}
                      >
                        {content}
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-[10px] p-2 rounded shadow-xl whitespace-pre text-center z-30 pointer-events-none">
                          {tooltip}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
          <AlertCircle className="w-4 h-4 text-sky-600" />
          <span>Klik cell di atas untuk melihat detail data atau mengedit laporan terkait.</span>
        </div>
        <div>
          Total Puskesmas: <span className="font-bold text-gray-800">{totalPuskesmas}</span>
        </div>
      </div>
    </div>
  );
}

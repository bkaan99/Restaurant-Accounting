"use client";

import { useMemo, useState } from "react";
import { AuditLog } from "@/lib/types";

type EventFilter = "all" | "record_created" | "record_updated" | "record_deleted" | "role_changed";

export function AuditLogsTab({
  panelClass,
  darkMode,
  auditLogs,
}: {
  panelClass: string;
  darkMode?: boolean;
  auditLogs: AuditLog[];
}) {
  const dm = darkMode ?? false;
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [tableFilter, setTableFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<20 | 50 | 100>(20);

  const tableOptions = useMemo(() => {
    const unique = new Set(auditLogs.map((log) => log.tableName));
    return ["all", ...Array.from(unique).sort()];
  }, [auditLogs]);

  const actorOptions = useMemo(() => {
    const unique = new Set(auditLogs.map((log) => log.actorName));
    return ["all", ...Array.from(unique).sort()];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const eventMatch = eventFilter === "all" ? true : log.eventType === eventFilter;
      const tableMatch = tableFilter === "all" ? true : log.tableName === tableFilter;
      const actorMatch = actorFilter === "all" ? true : log.actorName === actorFilter;
      const text = `${log.eventType} ${log.tableName} ${log.recordId} ${log.actorName}`.toLowerCase();
      const searchMatch = searchTerm.trim() ? text.includes(searchTerm.trim().toLowerCase()) : true;

      const changedAtMs = new Date(log.changedAt).getTime();
      const afterStart = startDate ? changedAtMs >= new Date(`${startDate}T00:00:00`).getTime() : true;
      const beforeEnd = endDate ? changedAtMs <= new Date(`${endDate}T23:59:59`).getTime() : true;

      return eventMatch && tableMatch && actorMatch && searchMatch && afterStart && beforeEnd;
    });
  }, [auditLogs, eventFilter, tableFilter, actorFilter, searchTerm, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedLog = filteredLogs.find((log) => log.id === selectedLogId) ?? null;

  return (
    <section className={`${panelClass} ${dm ? "border-white/10 bg-white/5" : "border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-white"}`}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-indigo-400">Audit Log</p>
          <h2 className={`mt-1 text-lg font-semibold ${dm ? "text-slate-100" : "text-slate-900"}`}>Tüm Sistem Kayıtları</h2>
          <p className={`mt-1 text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>Oluşturma, güncelleme, silme ve rol değişikliği kayıtlarını buradan inceleyin.</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${dm ? "border-indigo-400/30 bg-indigo-500/10 text-indigo-300" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
          Toplam {filteredLogs.length} kayıt
        </span>
      </div>

      <div className={`mb-4 flex flex-wrap items-end gap-2 rounded-2xl border px-3 py-2.5 shadow-sm ${dm ? "border-white/10 bg-white/5" : "border-indigo-100 bg-white"}`}>
        <div className="min-w-[220px]">
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>Arama</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Kullanıcı, tablo, kayıt id..."
            className={`w-full rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200 placeholder:text-slate-500" : "border-slate-300 bg-white text-slate-700 placeholder:text-slate-400"}`}
          />
        </div>
        <div>
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>İşlem</label>
          <select
            value={eventFilter}
            onChange={(e) => { setEventFilter(e.target.value as EventFilter); setPage(1); }}
            className={`rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-300 bg-white text-slate-700"}`}
          >
            <option value="all">Tümü</option>
            <option value="record_created">Oluşturma</option>
            <option value="record_updated">Güncelleme</option>
            <option value="record_deleted">Silme</option>
            <option value="role_changed">Rol Değişikliği</option>
          </select>
        </div>
        <div>
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>Tablo</label>
          <select
            value={tableFilter}
            onChange={(e) => { setTableFilter(e.target.value); setPage(1); }}
            className={`rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-300 bg-white text-slate-700"}`}
          >
            {tableOptions.map((table) => (
              <option key={table} value={table}>
                {table === "all" ? "Tüm Tablolar" : table}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>Kullanıcı</label>
          <select
            value={actorFilter}
            onChange={(e) => { setActorFilter(e.target.value); setPage(1); }}
            className={`rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-300 bg-white text-slate-700"}`}
          >
            {actorOptions.map((actor) => (
              <option key={actor} value={actor}>
                {actor === "all" ? "Tüm Kullanıcılar" : actor}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>Başlangıç</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className={`rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-300 bg-white text-slate-700"}`}
          />
        </div>
        <div>
          <label className={`mb-1 block text-[11px] font-semibold uppercase tracking-[0.14em] ${dm ? "text-slate-400" : "text-slate-400"}`}>Bitiş</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className={`rounded-xl border px-2.5 py-1.5 text-xs outline-none focus:border-indigo-400 ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-300 bg-white text-slate-700"}`}
          />
        </div>
        <button
          onClick={() => {
            setEventFilter("all");
            setTableFilter("all");
            setActorFilter("all");
            setSearchTerm("");
            setStartDate("");
            setEndDate("");
            setPage(1);
          }}
          className={`h-[34px] rounded-xl border px-3 text-xs font-medium transition ${dm ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"}`}
        >
          Filtreleri Temizle
        </button>
        <div className={`ml-auto flex items-center gap-1 rounded-full border px-2 py-1 ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
          <span className={`text-[11px] ${dm ? "text-slate-400" : "text-slate-500"}`}>Sayfa Boyutu</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value) as 20 | 50 | 100); setPage(1); }}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold outline-none ${dm ? "border-white/10 bg-white/10 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}
            aria-label="Audit log sayfa boyutu"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[860px] text-xs">
          <thead className={dm ? "bg-white/5" : "bg-slate-50/90"}>
            <tr className={`text-left uppercase tracking-wide ${dm ? "text-slate-400" : "text-slate-500"}`}>
              <th className="rounded-l-xl px-3 py-2.5">Zaman</th>
              <th className="px-3 py-2.5">İşlem</th>
              <th className="px-3 py-2.5">Kullanıcı</th>
              <th className="px-3 py-2.5">Tablo</th>
              <th className="px-3 py-2.5">Kayıt ID</th>
              <th className="rounded-r-xl px-3 py-2.5 text-right">Detay</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className={`px-3 py-10 text-center text-sm ${dm ? "text-slate-400" : "text-slate-500"}`}>
                  Bu filtrede audit kaydı bulunamadı.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`border-b transition ${dm ? "border-white/5 hover:bg-white/5" : "border-slate-100 hover:bg-indigo-50/40"} ${selectedLogId === log.id ? (dm ? "bg-white/10" : "bg-indigo-50/60") : ""}`}
                >
                  <td className={`px-3 py-2 ${dm ? "text-slate-300" : "text-slate-700"}`}>{new Date(log.changedAt).toLocaleString("tr-TR")}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      log.eventType === "role_changed"
                        ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-300"
                        : log.eventType === "record_created"
                        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                        : log.eventType === "record_deleted"
                        ? "border-rose-400/40 bg-rose-500/15 text-rose-300"
                        : "border-amber-400/40 bg-amber-500/15 text-amber-300"
                    }`}>
                      {log.eventType}
                    </span>
                  </td>
                  <td className={`px-3 py-2 ${dm ? "text-slate-300" : "text-slate-700"}`}>{log.actorName}</td>
                  <td className={`px-3 py-2 ${dm ? "text-slate-400" : "text-slate-500"}`}>{log.tableName}</td>
                  <td className={`px-3 py-2 ${dm ? "text-slate-400" : "text-slate-500"}`}>{log.recordId}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => setSelectedLogId((prev) => (prev === log.id ? null : log.id))}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${dm ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
                    >
                      {selectedLogId === log.id ? "Kapat" : "Detay"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className={`mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-2 ${dm ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"}`}>
        <p className={`text-xs ${dm ? "text-slate-400" : "text-slate-500"}`}>
          Sayfa {currentPage} / {totalPages} - Toplam {filteredLogs.length} kayıt
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${dm ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
          >
            Önceki
          </button>
          <button
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${dm ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-300 text-slate-700 hover:bg-slate-100"}`}
          >
            Sonraki
          </button>
        </div>
      </div>

      {selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className={`absolute inset-0 backdrop-blur-sm transition-all duration-500 ${
              dm ? "bg-slate-950/60" : "bg-white/40"
            }`} 
            onClick={() => setSelectedLogId(null)} 
          />
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] border shadow-2xl animate-in fade-in zoom-in duration-300 ${
            dm ? "border-white/10 bg-slate-900 shadow-slate-950" : "border-slate-200 bg-white shadow-slate-200"
          }`}>
            <div className="flex items-center justify-between border-b px-6 py-5 dark:border-white/5">
              <div>
                <h3 className={`text-xl font-black tracking-tight ${dm ? "text-white" : "text-slate-900"}`}>Kayıt Detayları</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">Audit Log #{selectedLog.id}</p>
              </div>
              <button 
                onClick={() => setSelectedLogId(null)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${
                  dm ? "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto p-6 md:p-8 max-h-[calc(90vh-80px)]">
              <div className="grid gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "İşlem", value: selectedLog.eventType },
                    { label: "Tablo", value: selectedLog.tableName },
                    { label: "Kayıt ID", value: selectedLog.recordId },
                    { label: "Zaman", value: new Date(selectedLog.changedAt).toLocaleString("tr-TR") }
                  ].map((stat, i) => (
                    <div key={i} className={`p-4 rounded-3xl border ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                      <p className={`text-xs font-black ${dm ? "text-slate-200" : "text-slate-800"}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-indigo-500">Eski Veri (Old Data)</p>
                    <div className={`rounded-3xl border p-5 overflow-auto max-h-[300px] ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                      <pre className={`text-[11px] font-medium leading-relaxed ${dm ? "text-slate-300" : "text-slate-600"}`}>
                        {selectedLog.oldData ? JSON.stringify(selectedLog.oldData, null, 2) : "--- Değişiklik yok ---"}
                      </pre>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-black uppercase tracking-widest text-emerald-500">Yeni Veri (New Data)</p>
                    <div className={`rounded-3xl border p-5 overflow-auto max-h-[300px] ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                      <pre className={`text-[11px] font-medium leading-relaxed ${dm ? "text-slate-300" : "text-slate-600"}`}>
                        {selectedLog.newData ? JSON.stringify(selectedLog.newData, null, 2) : "--- Veri yok ---"}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Metadata & Sistem Bilgisi</p>
                  <div className={`rounded-3xl border p-5 ${dm ? "border-white/5 bg-white/5" : "border-slate-100 bg-slate-50"}`}>
                    <pre className={`text-[11px] font-medium leading-relaxed ${dm ? "text-slate-300" : "text-slate-600"}`}>
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { useState } from "react";
import VirtualizedTable from "./VirtualizedTable";

interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

interface SkippedRecord {
  row_number: number;
  original_data: Record<string, string>;
  reason: string;
}

interface ResultTableProps {
  records: CRMRecord[];
  skipped: SkippedRecord[];
  totalRows: number;
  totalImported: number;
  totalSkipped: number;
  onStartOver: () => void;
}

const COLUMNS: (keyof CRMRecord)[] = [
  "created_at",
  "name",
  "email",
  "country_code",
  "mobile_without_country_code",
  "company",
  "city",
  "state",
  "country",
  "crm_status",
  "data_source",
  "crm_note",
];

export default function ResultTable({
  records,
  skipped,
  totalRows,
  totalImported,
  totalSkipped,
  onStartOver,
}: ResultTableProps) {
  const [activeTab, setActiveTab] = useState<"imported" | "skipped">("imported");

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900 px-4 py-4 text-center shadow-[0_1px_2px_rgba(18,19,28,0.04)]">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-slate-400">Total Rows</p>
          <p className="font-display text-2xl font-semibold mt-1 text-ink dark:text-white">{totalRows}</p>
        </div>
        <div className="rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900 px-4 py-4 text-center shadow-[0_1px_2px_rgba(18,19,28,0.04)]">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-slate-400">Imported</p>
          <p className="font-display text-2xl font-semibold mt-1 text-limeDeep">{totalImported}</p>
        </div>
        <div className="rounded-xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900 px-4 py-4 text-center shadow-[0_1px_2px_rgba(18,19,28,0.04)]">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-slate-400">Skipped</p>
          <p className="font-display text-2xl font-semibold mt-1 text-red-500">{totalSkipped}</p>
        </div>
      </div>

      <div className="flex gap-1 mb-3">
        <button
          onClick={() => setActiveTab("imported")}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-colors ${
            activeTab === "imported" ? "bg-indigo text-white" : "text-muted dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          }`}
        >
          Imported ({totalImported})
        </button>
        <button
          onClick={() => setActiveTab("skipped")}
          className={`px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wide transition-colors ${
            activeTab === "skipped" ? "bg-red-500 text-white" : "text-muted dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800"
          }`}
        >
          Skipped ({totalSkipped})
        </button>
      </div>

      {activeTab === "imported" && (
        <VirtualizedTable
          columns={COLUMNS}
          rowCount={records.length}
          getCell={(r, c) => records[r][COLUMNS[c]] || <span className="text-muted/50">&mdash;</span>}
          headerColorClass="bg-indigoDeep"
          emptyMessage="Koi record import nahi hua."
        />
      )}

      {activeTab === "skipped" && (
        <VirtualizedTable
          columns={["Row #", "Reason", "Original Data"]}
          rowCount={skipped.length}
          colWidth={260}
          getCell={(r, c) => {
            const item = skipped[r];
            if (c === 0) return item.row_number;
            if (c === 1) return <span className="text-red-600">{item.reason}</span>;
            return JSON.stringify(item.original_data);
          }}
          headerColorClass="bg-red-500"
          emptyMessage="Koi row skip nahi hui — sab records import ho gaye."
        />
      )}

      <div className="mt-5 flex justify-end">
        <button onClick={onStartOver} className="rounded-lg border border-line dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-ink dark:text-white hover:bg-white dark:hover:bg-slate-800">
          Nayi CSV import karein
        </button>
      </div>
    </div>
  );
}

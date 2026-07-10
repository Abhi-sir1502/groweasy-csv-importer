"use client";

import VirtualizedTable from "./VirtualizedTable";

interface CSVPreviewTableProps {
  headers: string[];
  rows: string[][];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CSVPreviewTable({
  headers,
  rows,
  fileName,
  onConfirm,
  onCancel,
}: CSVPreviewTableProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-ink dark:text-white">{fileName}</p>
          <p className="font-mono text-[11px] text-muted dark:text-slate-400 uppercase tracking-wide">
            {rows.length} rows &middot; {headers.length} columns
          </p>
        </div>
        <button onClick={onCancel} className="text-xs text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white underline underline-offset-2">
          Alag file choose karein
        </button>
      </div>

      <VirtualizedTable
        columns={headers.map((h, i) => h || `Column ${i + 1}`)}
        rowCount={rows.length}
        getCell={(r, c) => rows[r][c] ?? ""}
        headerColorClass="bg-indigoDeep"
      />

      <div className="mt-5 flex items-center justify-end gap-3">
        <button onClick={onCancel} className="rounded-lg border border-line dark:border-slate-700 px-5 py-2.5 text-sm font-medium text-ink dark:text-white hover:bg-white dark:hover:bg-slate-800">
          Cancel
        </button>
        <button onClick={onConfirm} className="rounded-lg bg-indigo px-5 py-2.5 text-sm font-medium text-white hover:bg-indigoDeep transition-colors">
          Confirm
        </button>
      </div>
    </div>
  );
}

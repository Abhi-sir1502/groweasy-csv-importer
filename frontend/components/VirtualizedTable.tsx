"use client";

import { FixedSizeList } from "react-window";

interface VirtualizedTableProps {
  columns: string[];
  rowCount: number;
  getCell: (rowIndex: number, colIndex: number) => React.ReactNode;
  headerColorClass?: string;
  colWidth?: number;
  rowHeight?: number;
  maxHeight?: number;
  emptyMessage?: string;
}

export default function VirtualizedTable({
  columns,
  rowCount,
  getCell,
  headerColorClass = "bg-indigoDeep",
  colWidth = 180,
  rowHeight = 40,
  maxHeight = 420,
  emptyMessage = "Koi data nahi hai.",
}: VirtualizedTableProps) {
  const totalWidth = columns.length * colWidth;
  const listHeight = Math.min(maxHeight, rowCount * rowHeight) || rowHeight;

  function Row({ index, style }: { index: number; style: React.CSSProperties }) {
    return (
      <div
        style={{ ...style, width: totalWidth }}
        className={`flex font-mono text-[13px] ${
          index % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-paper dark:bg-slate-800/50"
        }`}
      >
        {columns.map((_, colIndex) => (
          <div
            key={colIndex}
            style={{ width: colWidth }}
            className="shrink-0 px-4 py-2.5 text-ink/80 dark:text-slate-300 border-t border-line dark:border-slate-700 truncate flex items-center"
          >
            {getCell(index, colIndex)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900 overflow-hidden shadow-[0_1px_2px_rgba(18,19,28,0.04)]">
      <div className="overflow-x-auto">
        {/* Header — List ke bahar hai, isliye scroll karne pe automatically upar hi rehta hai */}
        <div style={{ width: totalWidth }} className={`flex ${headerColorClass} text-white`}>
          {columns.map((col, i) => (
            <div
              key={i}
              style={{ width: colWidth }}
              className="shrink-0 px-4 py-3 text-left font-mono text-[11px] font-medium tracking-wide uppercase truncate"
            >
              {col}
            </div>
          ))}
        </div>

        {rowCount === 0 ? (
          <div
            style={{ width: totalWidth }}
            className="px-4 py-6 text-center text-muted dark:text-slate-400 font-mono text-sm"
          >
            {emptyMessage}
          </div>
        ) : (
          <FixedSizeList height={listHeight} itemCount={rowCount} itemSize={rowHeight} width={totalWidth}>
            {Row}
          </FixedSizeList>
        )}
      </div>
    </div>
  );
}

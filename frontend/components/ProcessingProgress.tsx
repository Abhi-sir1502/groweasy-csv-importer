"use client";

interface ProcessingProgressProps {
  currentBatch: number;
  totalBatches: number;
  importedSoFar: number;
  skippedSoFar: number;
}

export default function ProcessingProgress({
  currentBatch,
  totalBatches,
  importedSoFar,
  skippedSoFar,
}: ProcessingProgressProps) {
  const percent = totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="rounded-2xl border border-line dark:border-slate-700 bg-panel dark:bg-slate-900 p-6 shadow-[0_1px_2px_rgba(18,19,28,0.04)]">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs uppercase tracking-wide text-muted dark:text-slate-400">
            {totalBatches > 0
              ? `Batch ${currentBatch} of ${totalBatches}`
              : "Shuru ho raha hai..."}
          </span>
          <span className="font-mono text-xs font-semibold text-indigo dark:text-lime">{percent}%</span>
        </div>

        <div className="h-2 w-full rounded-full bg-line dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo to-lime rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex justify-center gap-6 mt-4">
          <span className="font-mono text-[11px] text-muted dark:text-slate-400">
            Imported: <span className="text-limeDeep dark:text-lime font-medium">{importedSoFar}</span>
          </span>
          <span className="font-mono text-[11px] text-muted dark:text-slate-400">
            Skipped: <span className="text-red-500 font-medium">{skippedSoFar}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

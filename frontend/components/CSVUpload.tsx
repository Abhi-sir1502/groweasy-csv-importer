"use client";

import { useCallback, useRef, useState } from "react";

interface CSVUploadProps {
  onFileSelected: (file: File) => void;
}

export default function CSVUpload({ onFileSelected }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  function validateAndSetFile(file: File) {
    const isCsv =
      file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      setError("Sirf .csv file allowed hai. Kripya ek valid CSV upload karein.");
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setError("Yeh file khaali hai. Kripya ek valid CSV upload karein.");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("File 5MB se badi hai. Chhoti CSV file upload karein.");
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelected(file);
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const openFilePicker = () => inputRef.current?.click();

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-2xl bg-panel dark:bg-slate-900 border border-line dark:border-slate-700 shadow-[0_1px_2px_rgba(18,19,28,0.04)] p-8">
        <div
          onClick={openFilePicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openFilePicker();
          }}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-8 py-12 text-center transition-colors
            ${isDragging ? "border-indigo bg-indigo/5" : "border-line dark:border-slate-700 hover:border-indigo/40"}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="mx-auto mb-4 h-11 w-11 rounded-full bg-lime flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#252361" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>

          <p className="font-display text-base font-semibold text-ink dark:text-white">
            Drop your CSV file here
          </p>
          <p className="mt-1 text-sm text-muted dark:text-slate-400">
            ya <span className="text-indigo dark:text-lime underline underline-offset-2">browse karke choose karein</span>
          </p>
          <p className="mt-4 font-mono text-[11px] text-muted/70 dark:text-slate-500 uppercase tracking-wide">
            .csv &middot; max 5MB
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

        {selectedFile && !error && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-line dark:border-slate-700 bg-paper dark:bg-slate-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-indigo/10 dark:bg-lime/10 flex items-center justify-center font-mono text-[10px] font-semibold text-indigo dark:text-lime">
                CSV
              </div>
              <div>
                <p className="text-sm font-medium text-ink dark:text-white">{selectedFile.name}</p>
                <p className="font-mono text-[11px] text-muted dark:text-slate-400">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wide text-limeDeep dark:text-lime font-medium">Ready</span>
          </div>
        )}
      </div>
    </div>
  );
}

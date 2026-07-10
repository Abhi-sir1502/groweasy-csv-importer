"use client";

import { useState } from "react";
import Papa from "papaparse";
import CSVUpload from "@/components/CSVUpload";
import CSVPreviewTable from "@/components/CSVPreviewTable";
import ResultTable from "@/components/ResultTable";
import StepRail from "@/components/StepRail";
import ThemeToggle from "@/components/ThemeToggle";
import ProcessingProgress from "@/components/ProcessingProgress";

const BACKEND_URL = "http://localhost:8000";

type Stage = "upload" | "preview" | "processing" | "result";

export default function Home() {
  const [stage, setStage] = useState<Stage>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [progress, setProgress] = useState({
    currentBatch: 0,
    totalBatches: 0,
    importedSoFar: 0,
    skippedSoFar: 0,
  });
  const [result, setResult] = useState<{
    records: any[];
    skipped: any[];
    total_rows: number;
    total_imported: number;
    total_skipped: number;
  } | null>(null);

  function handleFileSelected(selectedFile: File) {
    setFile(selectedFile);
    setParseError(null);

    Papa.parse<string[]>(selectedFile, {
      skipEmptyLines: true,
      complete: (parsed) => {
        const allRows = parsed.data;

        if (allRows.length === 0) {
          setParseError("CSV file mein koi data nahi mila.");
          return;
        }

        const [headerRow, ...dataRows] = allRows;
        setHeaders(headerRow);
        setRows(dataRows);
        setStage("preview");
      },
      error: () => {
        setParseError("CSV parse karte waqt error aayi. File format check karein.");
      },
    });
  }

  function handleReset() {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setParseError(null);
    setApiError(null);
    setResult(null);
    setProgress({ currentBatch: 0, totalBatches: 0, importedSoFar: 0, skippedSoFar: 0 });
    setStage("upload");
  }

  async function handleConfirm() {
    setStage("processing");
    setApiError(null);
    setProgress({ currentBatch: 0, totalBatches: 0, importedSoFar: 0, skippedSoFar: 0 });

    try {
      const response = await fetch(`${BACKEND_URL}/api/extract-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headers, rows }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Backend se connect nahi ho paaya. Kya backend chal raha hai?");
      }

      // SSE stream ko manually parse karte hain (EventSource sirf GET support karta hai,
      // isliye fetch + ReadableStream use kar rahe hain kyunki humein POST bhejna hai)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          if (!rawEvent.trim()) continue;

          let eventType = "message";
          let dataStr = "";
          for (const line of rawEvent.split("\n")) {
            if (line.startsWith("event:")) eventType = line.slice(6).trim();
            if (line.startsWith("data:")) dataStr = line.slice(5).trim();
          }

          if (!dataStr) continue;
          const data = JSON.parse(dataStr);

          if (eventType === "start") {
            setProgress((p) => ({ ...p, totalBatches: data.totalBatches }));
          } else if (eventType === "progress") {
            setProgress({
              currentBatch: data.batchNumber,
              totalBatches: data.totalBatches,
              importedSoFar: data.importedSoFar,
              skippedSoFar: data.skippedSoFar,
            });
          } else if (eventType === "complete") {
            setResult(data);
            setStage("result");
          }
        }
      }
    } catch (err: any) {
      setApiError(
        err.message || "Backend se connect nahi ho paaya. Kya backend chal raha hai?"
      );
      setStage("preview");
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <ThemeToggle />

      <div className="text-center mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-indigo dark:text-lime mb-2">
          GrowEasy &middot; Lead Import Engine
        </p>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-white">
          CSV Importer
        </h1>
      </div>

      <StepRail currentStage={stage} />

      {stage === "upload" && <CSVUpload onFileSelected={handleFileSelected} />}

      {parseError && <p className="mt-4 text-sm text-red-600">{parseError}</p>}

      {stage === "preview" && file && (
        <>
          <CSVPreviewTable
            headers={headers}
            rows={rows}
            fileName={file.name}
            onConfirm={handleConfirm}
            onCancel={handleReset}
          />
          {apiError && <p className="mt-4 text-sm text-red-600 text-center">{apiError}</p>}
        </>
      )}

      {stage === "processing" && (
        <ProcessingProgress
          currentBatch={progress.currentBatch}
          totalBatches={progress.totalBatches}
          importedSoFar={progress.importedSoFar}
          skippedSoFar={progress.skippedSoFar}
        />
      )}

      {stage === "result" && result && (
        <ResultTable
          records={result.records}
          skipped={result.skipped}
          totalRows={result.total_rows}
          totalImported={result.total_imported}
          totalSkipped={result.total_skipped}
          onStartOver={handleReset}
        />
      )}
    </main>
  );
}

"use client";

interface StepRailProps {
  currentStage: "upload" | "preview" | "processing" | "result";
}

const STEPS = [
  { key: "upload", label: "Upload" },
  { key: "preview", label: "Preview" },
  { key: "processing", label: "AI Mapping" },
  { key: "result", label: "Result" },
] as const;

export default function StepRail({ currentStage }: StepRailProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStage);

  return (
    <div className="w-full max-w-xl mx-auto mb-14">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-medium transition-colors
                    ${
                      isDone
                        ? "bg-indigo text-white"
                        : isActive
                        ? "bg-lime text-indigoDeep"
                        : "bg-white dark:bg-slate-800 border border-line dark:border-slate-700 text-muted dark:text-slate-500"
                    }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <span
                  className={`font-mono text-[10px] uppercase tracking-wider whitespace-nowrap
                    ${isActive ? "text-ink dark:text-white font-medium" : "text-muted dark:text-slate-500"}`}
                >
                  {step.label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px mx-2 -mt-5 bg-line dark:bg-slate-700 relative overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 bg-indigo dark:bg-lime transition-all duration-500 ${
                      i < currentIndex ? "w-full" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { Database, Download, FileJson, HardDrive, Upload } from "lucide-react";

interface DataManagementProps {
  onExport: () => void;
  onImportClick: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  importLoading: boolean;
  importProgressPct: number;
}

export function DataManagement({
  onExport,
  onImportClick,
  onFileChange,
  importLoading,
  importProgressPct,
}: DataManagementProps) {
  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm group relative overflow-hidden">
      <div className="absolute -top-4 -right-4 p-4 text-primary opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
        <Database size={120} />
      </div>
      <h3 className="text-lg font-black tracking-tight mb-2 flex items-center justify-between relative z-10">
        Manajemen Data
        <Database size={18} className="text-primary" />
      </h3>
      <p className="text-xs text-muted-foreground font-medium mb-6 relative z-10 leading-relaxed">
        Pindah device? Kamu bisa ekspor progresmu sekarang dan memuatnya kembali di perangkat atau browser baru. Datamu adalah milikmu sepenuhnya.
      </p>

      <div className="space-y-3 relative z-10">
        {/* Export Button */}
        <button
          onClick={onExport}
          className="w-full flex items-center justify-between gap-3 p-4 bg-muted hover:bg-muted/80 hover:border-primary/30 border border-border/20 rounded-xl transition-all duration-200 group/btn active:scale-95"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-blue-500/10 text-blue-500 p-2.5 rounded-lg group-hover/btn:scale-110 transition-transform">
              <Download size={18} />
            </div>
            <div className="text-left">
              <div className="text-[11px] font-bold leading-tight">Ekspor Progres</div>
              <div className="text-[10px] text-muted-foreground">Unduh file .json</div>
            </div>
          </div>
          <div className="text-muted-foreground group-hover/btn:text-primary transition-colors">
            <FileJson size={16} />
          </div>
        </button>

        {/* Import Button */}
        <button
          onClick={onImportClick}
          disabled={importLoading}
          className="w-full flex flex-col gap-3 p-4 bg-muted hover:bg-muted/80 disabled:hover:bg-muted disabled:opacity-60 hover:border-green-500/30 border border-border/20 rounded-xl transition-all duration-200 group/btn disabled:cursor-not-allowed active:scale-95"
        >
          {importLoading ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-green-500/10 text-green-500 p-2.5 rounded-lg animate-pulse">
                    <Upload size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold leading-tight">Mengimpor...</div>
                    <div className="text-[10px] text-muted-foreground">{Math.round(importProgressPct)}% Selesai</div>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted-foreground/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-300" style={{ width: `${importProgressPct}%` }} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-green-500/10 text-green-600 dark:text-green-500 p-2.5 rounded-lg group-hover/btn:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold leading-tight">Impor Progres</div>
                    <div className="text-[10px] text-muted-foreground">Muat ulang file .json</div>
                  </div>
                </div>
                <div className="text-muted-foreground group-hover/btn:text-green-600 dark:group-hover/btn:text-green-500 transition-colors">
                  <HardDrive size={16} />
                </div>
              </div>
            </>
          )}
        </button>

        <input
          type="file"
          accept=".json"
          id="import-file-input"
          className="hidden"
          onChange={onFileChange}
          disabled={importLoading}
        />
      </div>
    </div>
  );
}

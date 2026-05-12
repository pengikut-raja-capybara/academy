import { memo } from "react";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { AttachmentsSection } from "../content/AttachmentsSection";
import type { Attachment } from "../../../types";

interface ModuleOverviewScreenProps {
  moduleTitle: string;
  moduleDescription?: string;
  submissionUrl?: string;
  submissionDescription?: string;
  submissionAttachments?: Attachment[];
  totalLessons: number;
  averageScore: number | null;
  exerciseCount: number;
}

export const ModuleOverviewScreen = memo(function ModuleOverviewScreen({
  moduleTitle,
  moduleDescription,
  submissionUrl,
  submissionDescription,
  submissionAttachments,
  totalLessons,
  averageScore,
  exerciseCount,
}: ModuleOverviewScreenProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="w-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl shadow-purple-500/30 mb-2">
            {submissionUrl ? <ExternalLink size={28} className="text-white" /> : <CheckCircle2 size={28} className="text-white" />}
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-purple-500">Selamat 🎉 — Semua Materi Selesai</p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{moduleTitle}</h1>
          {moduleDescription && <p className="text-muted-foreground font-medium text-sm sm:text-base max-w-xl mx-auto leading-relaxed">{moduleDescription}</p>}
        </div>

        {/* Stats */}
        <div className={`grid gap-3 sm:gap-4 mb-10 sm:mb-14 ${exerciseCount > 0 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{totalLessons}</div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Materi Diselesaikan</p>
          </div>
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm">
            <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">100%</div>
            <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Progres Modul</p>
          </div>
          {exerciseCount > 0 && averageScore !== null && (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center sm:text-left space-y-1 shadow-sm border-purple-500/20">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {averageScore % 1 === 0 ? averageScore.toFixed(0) : averageScore.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Rata-rata Nilai latihan</p>
            </div>
          )}
        </div>

        {/* Submission CTA — hanya tampil jika ada submissionUrl */}
        {submissionUrl ? (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-purple-500/20 bg-gradient-to-br from-blue-500/5 via-purple-500/10 to-pink-500/5 p-6 sm:p-10 space-y-5">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative space-y-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">Kumpulkan Tugas Akhir</h2>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">Kamu telah menyelesaikan seluruh materi. Pastikan tugasmu sudah siap sebelum submit.</p>
            </div>

            {/* Detail tugas */}
            {submissionDescription && (
              <div className="relative bg-background/60 border border-border rounded-xl p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 text-xs">Detail Tugas</span>
                </div>
                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap text-foreground/80">{submissionDescription}</p>
              </div>
            )}

            {/* Lampiran Tugas */}
            {submissionAttachments && submissionAttachments.length > 0 && (
              <div className="mt-4">
                <AttachmentsSection attachments={submissionAttachments} title="Lampiran Tugas" />
              </div>
            )}

            <a
              href={submissionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 py-3.5 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white rounded-xl font-bold text-sm hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200"
            >
              Kumpulkan Tugas
              <ExternalLink size={15} />
            </a>
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-green-500/20 bg-green-500/5 p-6 sm:p-8 text-center space-y-2">
            <CheckCircle2 size={32} className="text-green-500 mx-auto" />
            <h2 className="text-lg font-black tracking-tight">Modul Ini Telah Selesai!</h2>
            <p className="text-sm text-muted-foreground font-medium">Tidak ada tugas yang perlu dikumpulkan untuk modul ini. Lanjutkan ke modul berikutnya.</p>
          </div>
        )}
      </div>
    </div>
  );
});

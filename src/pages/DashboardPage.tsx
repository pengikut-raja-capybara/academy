import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { calculateModuleProgress } from "../utils/progress";
import type { Module } from "../types";
import { importProgress as importProgressAction, fetchModuleDetail } from "../features/learning/learningSlice";
import { Trophy, BookOpen, Clock, Star, Target, Flame, ArrowUpRight, Activity, Play, CheckCircle2, Bookmark, Download, Upload, Database, HardDrive, FileJson } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { ToastContainer } from "../components/common/Toast";
import type { Toast } from "../components/common/Toast";

export default function DashboardPage() {
  const allModules = useAppSelector((state) => state.learning.allModules);
  const progress = useAppSelector((state) => state.learning.progress);
  const userName = useAppSelector((state) => state.learning.userName);
  const navigate = useNavigate();

  const hasAnyProgress = useMemo(() => {
    return Object.values(progress).some((p) => p && (p.completed || (p.lastWatchedSec ?? 0) > 0 || Object.keys(p.checklist || {}).length > 0));
  }, [progress]);

  useEffect(() => {
    if (!hasAnyProgress) {
      // Jika tidak ada progres sama sekali (user baru/stranger), lempar ke Landing Page
      navigate("/", { replace: true });
    } else if (!userName) {
      // Jika ada progres (hasil impor/lama) tapi belum ada nama, minta isi nama dulu
      navigate(`/welcome?redirect=${encodeURIComponent("/dashboard")}`, { replace: true });
    }
  }, [userName, hasAnyProgress, navigate]);

  const dispatch = useAppDispatch();

  // Auto-fetch module details for modules without lessons to ensure stats calculation works
  useEffect(() => {
    allModules.forEach((mod) => {
      if (!mod.lessons || mod.lessons.length === 0) {
        dispatch(fetchModuleDetail(mod.slug));
      }
    });
  }, [allModules, dispatch]);

  // Toast state
  const [toasts, setToasts] = useState<(Toast & { id: string })[]>([]);

  // Dialog states
  const [exportDialog, setExportDialog] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgressPct, setImportProgressPct] = useState(0);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // ─── Data Calculation ───────────────────────────────────────────────────────

  const stats = useMemo(() => {
    let totalCompletedLessons = 0;
    let totalLessonsCount = 0;
    let totalWatchTimeSec = 0;
    const moduleStats: (Module & { progress: number; completedLessons: number; totalLessons: number; watchSec: number })[] = [];
    const completedModules: Module[] = [];
    let activeModulesCount = 0;
    let overallProgressSum = 0;

    for (const module of allModules) {
      const { percentage, completedCount, totalCount, hasStarted } = calculateModuleProgress(module.lessons || [], progress, !!module.submissionUrl);

      totalCompletedLessons += completedCount;
      totalLessonsCount += totalCount;

      if (hasStarted) {
        activeModulesCount++;
        overallProgressSum += percentage;
      }

      let modWatchSec = 0;
      module.lessons?.forEach((lesson) => {
        const lp = progress[lesson.id] || (lesson.video ? progress[lesson.video] : undefined);
        if (lp) modWatchSec += lp.lastWatchedSec || 0;
      });
      totalWatchTimeSec += modWatchSec;

      if (hasStarted || percentage > 0) {
        moduleStats.push({
          ...module,
          progress: percentage,
          completedLessons: completedCount,
          totalLessons: totalCount,
          watchSec: modWatchSec,
        });
      }

      if (percentage >= 100) {
        completedModules.push(module);
      }
    }

    moduleStats.sort((a, b) => b.progress - a.progress);

    return {
      totalCompletedLessons,
      totalLessonsCount,
      totalWatchTimeSec,
      moduleStats,
      completedModules,
      activeModulesCount,
      overallProgress: activeModulesCount > 0 ? Math.round(overallProgressSum / activeModulesCount) : 0,
    };
  }, [allModules, progress]);

  // ─── Render Helpers ───────────────────────────────────────────────────────

  const formatSec = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast helper
  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, description, duration: type === "error" ? 6000 : 4000, onClose: () => {} }]);
    setTimeout(
      () => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      },
      type === "error" ? 6000 : 4000,
    );
  };

  const handleExport = () => {
    setExportDialog(true);
  };

  const confirmExport = () => {
    const exportData = {
      _info: "Backup file progres belajar PRC Academy. Jangan ubah isi file ini.",
      _website: "https://pengikut-raja-capybara.github.io/academy",
      progress,
      userName,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData));
    const dt = new Date();
    const nameTag = userName ? `${userName.toLowerCase()}-` : "";
    const dateStr = dt.toISOString().split("T")[0];
    const filename = `backup-${nameTag}prc-academy-${dateStr}.json`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    setExportDialog(false);
    addToast("success", "Ekspor Berhasil!", `File ${filename} telah diunduh ke perangkatmu.`);
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportProgressPct(0);

    const reader = new FileReader();

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgressPct((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 30;
      });
    }, 100);

    reader.onload = (event) => {
      clearInterval(progressInterval);

      try {
        const importedProgress = JSON.parse(event.target?.result as string);

        if (typeof importedProgress === "object" && importedProgress !== null) {
          setImportProgressPct(100);

          setTimeout(() => {
            dispatch(importProgressAction(importedProgress));
            setImportLoading(false);
            setImportProgressPct(0);
            addToast("success", "Impor Berhasil!", "Progres berhasil dimuat. Memuat ulang halaman...");
            setTimeout(() => window.location.reload(), 1000);
          }, 500);
        } else {
          clearInterval(progressInterval);
          setImportLoading(false);
          setImportProgressPct(0);
          addToast("error", "Format File Tidak Valid", "Pastikan file yang dipilih adalah file JSON progress yang benar.");
        }
      } catch {
        clearInterval(progressInterval);
        setImportLoading(false);
        setImportProgressPct(0);
        addToast("error", "Gagal Membaca File", "Ada kesalahan saat membaca file. Coba file lain atau buat file baru.");
      }
    };

    reader.onerror = () => {
      clearInterval(progressInterval);
      setImportLoading(false);
      setImportProgressPct(0);
      addToast("error", "Gagal Membaca File", "Terjadi kesalahan saat membaca file. Silakan coba lagi.");
    };

    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 pb-20">
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Export Confirmation Dialog */}
      <ConfirmDialog
        isOpen={exportDialog}
        title="Konfirmasi Ekspor"
        description="Unduh progres belajarmu sebagai file JSON. File ini berisi semua data progres dan dapat dimuat kembali di perangkat lain."
        confirmText="Ekspor Sekarang"
        cancelText="Batal"
        icon={<Download size={24} />}
        onConfirm={confirmExport}
        onCancel={() => setExportDialog(false)}
      />
      {/* Import Confirmation Dialog */}
      <ConfirmDialog
        isOpen={importDialogOpen}
        title="Impor Progres"
        description="Pilih file JSON progress untuk memuat progres belajarmu kembali ke aplikasi."
        confirmText="Pilih File"
        cancelText="Batal"
        icon={<Upload size={24} />}
        onConfirm={() => {
          setImportDialogOpen(false);
          fileInputRef.current?.click();
        }}
        onCancel={() => setImportDialogOpen(false)}
        isLoading={importLoading}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
            <Activity size={14} /> {userName ? `Halo, ${userName.split(" ")[0]}! ` : ""}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
            Dashboard <span className="text-muted-foreground/30">Personal</span>
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Pantau progres, lanjutkan materi, dan rayakan pencapaian belajarmu.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
            <div className="w-5 h-5 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Sedang Aktif</div>
              <div className="text-lg font-black text-primary">{stats.activeModulesCount} Modul</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Trophy className="text-yellow-500" />}
          label="Total Progress"
          value={`${stats.overallProgress}%`}
          subtext="Rata-rata modul aktif"
          color="border-yellow-500/50 hover:bg-yellow-500/5"
          badge="Akurasi"
        />
        <StatCard
          icon={<BookOpen className="text-blue-500" />}
          label="Materi Selesai"
          value={stats.totalCompletedLessons.toString()}
          subtext={`Dari ${stats.totalLessonsCount} total materi`}
          color="border-blue-500/50 hover:bg-blue-500/5"
          badge="Modul"
        />
        <StatCard
          icon={<Clock className="text-purple-500" />}
          label="Waktu Belajar"
          value={formatSec(stats.totalWatchTimeSec)}
          subtext="Total menonton video"
          color="border-purple-500/50 hover:bg-purple-500/5"
          badge="Aktivitas"
        />
        <StatCard
          icon={<Star className="text-pink-500" />}
          label="Terselesaikan"
          value={stats.completedModules.length.toString()}
          subtext="Modul Selesai"
          color="border-pink-500/50 hover:bg-pink-500/5"
          badge="Pencapaian"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Module List */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
              <Bookmark className="text-primary" size={24} />
              Progres Modul Aktif
            </h2>
            <Link to="/learning" className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg">
              Lihat Katalog <ArrowUpRight size={14} />
            </Link>
          </div>

          {stats.moduleStats.length > 0 ? (
            <div className="grid gap-4">
              {stats.moduleStats.map((mod) => (
                <div key={mod.id} className="bg-card border border-border/50 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  {mod.progress >= 100 && (
                    <div className="absolute top-0 right-0 p-4 text-green-500/10 pointer-events-none group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={80} />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-5 relative z-10">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md tracking-wider">{mod.category || "General"}</span>
                        {mod.progress >= 100 && (
                          <span className="text-[10px] font-black uppercase text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-1 rounded-md tracking-wider flex items-center gap-1">
                            <CheckCircle2 size={12} /> Selesai
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold leading-tight">{mod.title}</h3>

                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">{mod.progress}% Selesai</span>
                          <span>
                            {mod.completedLessons} / {mod.totalLessons} Materi
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/20">
                          <div
                            className={`h-full transition-all duration-1000 ${mod.progress >= 100 ? "bg-green-500" : "bg-gradient-to-r from-blue-500 to-purple-500"}`}
                            style={{ width: `${mod.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-border/50 pt-4 sm:pt-0 sm:pl-5">
                      <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Clock size={14} /> {formatSec(mod.watchSec)}
                      </div>
                      <Link
                        to={`/learning/${mod.slug}`}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${
                          mod.progress >= 100 ? "bg-muted text-foreground hover:bg-muted/80 border border-border" : "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5"
                        }`}
                      >
                        {mod.progress >= 100 ? "Ulas Materi" : "Lanjutkan"}
                        {!mod.progress || mod.progress < 100 ? <Play size={12} fill="currentColor" /> : null}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-dashed border-border rounded-3xl p-8 sm:p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Belum ada progres</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">Kamu belum memulai mempelajari modul apapun. Pilih materi dari katalog untuk mulai perjalananmu.</p>
              <Link
                to="/learning"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20"
              >
                Lihat Katalog Modul <ArrowUpRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Space - Statistik Global */}
        <div className="space-y-8">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-black tracking-tight mb-6 flex items-center justify-between">
              Statistik Global
              <Target size={18} className="text-primary" />
            </h3>
            <div className="space-y-6">
              <WeeklyGoal label="Materi Diselesaikan" current={stats.totalCompletedLessons} target={stats.totalLessonsCount || 1} targetDisplay={stats.totalLessonsCount} color="bg-blue-500" />
              <WeeklyGoal label="Modul Selesai" current={stats.completedModules.length} target={allModules.length || 1} targetDisplay={allModules.length} color="bg-purple-500" />
            </div>
          </div>

          {/* Manajemen Data */}
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
                onClick={handleExport}
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
                onClick={handleImportClick}
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

              <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleFileChange} disabled={importLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext, color, badge }: { icon: React.ReactNode; label: string; value: string; subtext: string; color: string; badge: string }) {
  return (
    <div className={`bg-card p-6 border-b-4 ${color} rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 relative group`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform duration-300">{icon}</div>
        <div className="px-2 py-1 bg-primary/5 rounded-lg text-[10px] font-black text-primary uppercase">{badge}</div>
      </div>
      <div>
        <h4 className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{label}</h4>
        <div className="text-3xl font-black tracking-tight mb-1">{value}</div>
        <p className="text-muted-foreground text-[10px] font-medium">{subtext}</p>
      </div>
    </div>
  );
}

function WeeklyGoal({
  label,
  current,
  target,
  targetDisplay,
  color,
  labelSuffix = "",
}: {
  label: string;
  current: number;
  target: number;
  targetDisplay?: number;
  color: string;
  labelSuffix?: string;
}) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-end">
        <span className="text-[11px] font-bold text-muted-foreground uppercase">{label}</span>
        <span className="text-[11px] font-black">
          {current}{" "}
          <span className="text-muted-foreground/50">
            / {targetDisplay ?? target}
            {labelSuffix}
          </span>
        </span>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
        <div className={`h-full rounded-full ${color} shadow-lg shadow-black/5 transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

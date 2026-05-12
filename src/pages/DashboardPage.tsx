import { useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppSelector } from "../store/hooks";
import { useModulePreloader } from "../hooks/useModulePreloader";
import { Trophy, BookOpen, Clock, Star, Target, Flame, ArrowUpRight, Activity, Bookmark, Download, Upload } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";

// Custom Hooks
import { useDashboardStats, formatSeconds } from "../hooks/useDashboardStats";
import { useDataManagement } from "../hooks/useDataManagement";

// Modular Components
import { StatCard, WeeklyGoal } from "../components/dashboard/DashboardStats";
import { ModuleProgressCard } from "../components/dashboard/ModuleProgressCard";
import { DataManagement } from "../components/dashboard/DataManagement";

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
      navigate("/", { replace: true });
    } else if (!userName) {
      navigate(`/welcome?redirect=${encodeURIComponent("/dashboard")}`, { replace: true });
    }
  }, [userName, hasAnyProgress, navigate]);

  useModulePreloader();

  // Stats Logic
  const stats = useDashboardStats();

  // Data Management Logic
  const {
    exportDialog,
    setExportDialog,
    importLoading,
    importProgressPct,
    importDialogOpen,
    setImportDialogOpen,
    confirmExport,
    handleFileImport,
  } = useDataManagement();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    if (e.target) e.target.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12 pb-20">
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
          document.getElementById("import-file-input")?.click();
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
          value={formatSeconds(stats.totalWatchTimeSec)}
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
                <ModuleProgressCard key={mod.id} mod={mod} />
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
          <DataManagement
            onExport={() => setExportDialog(true)}
            onImportClick={() => setImportDialogOpen(true)}
            onFileChange={handleFileChange}
            importLoading={importLoading}
            importProgressPct={importProgressPct}
          />
        </div>
      </div>
    </div>
  );
}

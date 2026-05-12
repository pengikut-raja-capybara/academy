import { useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, BookOpen, Zap, BarChart3, Lock, Smile, Sparkles, Upload, FolderSync } from "lucide-react";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { importProgress as importProgressAction } from "../features/learning/learningSlice";
import { useToast } from "../context/ToastContext";

export default function LandingPage() {
  const progress = useAppSelector((state) => state.learning.progress);
  const userName = useAppSelector((state) => state.learning.userName);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();
  const [importLoading, setImportLoading] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);

  const hasAnyProgress = Object.values(progress).some((p) => p && (p.completed || (p.lastWatchedSec ?? 0) > 0 || Object.keys(p.checklist || {}).length > 0));

  const ctaBase = "inline-flex items-center gap-2 font-extrabold py-4 sm:py-5 px-8 sm:px-10 rounded-2xl w-full sm:w-auto justify-center transition transform active:scale-95";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportLoading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (imported && typeof imported === "object" && !Array.isArray(imported)) {
          dispatch(importProgressAction(imported as any));
          addToast("success", "Restore Berhasil", "Progres berhasil dimuat. Halaman akan dimuat ulang...");
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1000);
        } else {
          addToast("error", "Format File Tidak Valid", "Pastikan file .json berisi data progres yang benar.");
        }
      } catch {
        addToast("error", "Gagal Membaca File", "Ada kesalahan saat membaca file. Coba lagi.");
      } finally {
        setImportLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.onerror = () => {
      addToast("error", "Gagal Membaca File", "Terjadi kesalahan saat membaca file.");
      setImportLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-0 pb-20">
      {/* Banner moved below hero (see below) */}
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 bg-background">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-blue-500/25 rounded-full filter blur-[120px] animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-purple-500/25 rounded-full filter blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-pink-500/25 rounded-full filter blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 text-center max-w-5xl px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-400/30 text-sm font-bold mb-8 text-purple-600 dark:text-purple-400">
            <Sparkles size={15} /> Platform Belajar Gratis & Open Source
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 sm:mb-6 tracking-tight leading-tight">
            {userName ? (
              <>
                Halo, <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">{userName.split(" ")[0]}!</span>
              </>
            ) : (
              <>
                Belajar <span className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">Jadi Lebih Seru</span>
              </>
            )}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed max-w-3xl mx-auto font-medium px-2">
            PRC Academy membantu Anda menguasai teknologi dengan materi terstruktur dan tracking progress otomatis.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {/* Primary CTA - changes text/target when progress exists */}
            <Link
              to={!userName ? "/welcome" : hasAnyProgress ? "/dashboard" : "/learning"}
              className={`${ctaBase} bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/40 hover:opacity-95`}
            >
              {!userName || !hasAnyProgress ? "Mulai Belajar Sekarang" : "Lanjutkan Belajar"} <ChevronRight size={22} />
            </Link>

            {/* Secondary CTA - restore modal (same base styles) */}
            <button
              type="button"
              onClick={() => setRestoreDialogOpen(true)}
              disabled={importLoading}
              className={`${ctaBase} cursor-pointer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-white shadow-2xl shadow-purple-500/40 hover:opacity-95`}
            >
              Restore Progres <FolderSync size={22} />
            </button>
          </div>

          {/* Hidden file input for direct restore */}
          <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" aria-hidden />

          {/* Restore confirmation dialog */}
          <ConfirmDialog
            isOpen={restoreDialogOpen}
            title="Restore Progres"
            description="Pilih file JSON progress yang telah Anda simpan sebelumnya untuk melanjutkan belajar dari mana Anda terakhir kali berhenti."
            confirmText="Pilih File"
            cancelText="Batal"
            onConfirm={() => {
              setRestoreDialogOpen(false);
              fileInputRef.current?.click();
            }}
            onCancel={() => setRestoreDialogOpen(false)}
            icon={<Upload size={24} />}
            isLoading={importLoading}
          />
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="px-4 sm:px-6 mb-20 sm:mb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 text-center">
          <div className="p-8 sm:p-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300 text-white">
            <h3 className="text-3xl sm:text-4xl font-black mb-2 drop-shadow">100%</h3>
            <p className="font-bold uppercase tracking-widest text-xs text-blue-100">Gratis Selamanya</p>
          </div>
          <div className="p-8 sm:p-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-3xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1 transition-all duration-300 text-white">
            <h3 className="text-3xl sm:text-4xl font-black mb-2 drop-shadow">No-Account</h3>
            <p className="font-bold uppercase tracking-widest text-xs text-purple-100">Mulai Belajar Instan</p>
          </div>
          <div className="p-8 sm:p-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl shadow-xl shadow-pink-500/30 hover:shadow-pink-500/50 hover:-translate-y-1 transition-all duration-300 text-white">
            <h3 className="text-3xl sm:text-4xl font-black mb-2 drop-shadow">Local Sync</h3>
            <p className="font-bold uppercase tracking-widest text-xs text-pink-100">Progres di Browser Anda</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-muted/10 to-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-5xl font-black mb-4 sm:mb-6 tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Kenapa Harus Kami?</h2>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium px-4">Kami merancang platform ini khusus untuk kenyamanan belajar Anda</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BookOpen className="w-7 h-7" />}
              title="Alur Terstruktur"
              description="Kurikulum disusun secara sistematis dengan sistem modul sequential untuk bimbingan belajar yang terarah."
              gradient="from-blue-500 to-cyan-500"
              glow="shadow-blue-500/20"
            />
            <FeatureCard
              icon={<Zap className="w-7 h-7" />}
              title="Fokus Maksimal"
              description="Belajar di lingkungan yang bersih tanpa gangguan iklan atau rekomendasi video yang membuyarkan konsentrasi."
              gradient="from-yellow-400 to-orange-500"
              glow="shadow-orange-500/20"
            />
            <FeatureCard
              icon={<BarChart3 className="w-7 h-7" />}
              title="Auto-Resume"
              description="Aplikasi secara otomatis menyimpan posisi terakhir tontonan Anda, memungkinkan transisi belajar yang mulus."
              gradient="from-purple-500 to-violet-600"
              glow="shadow-purple-500/20"
            />
            <FeatureCard
              icon={<Lock className="w-7 h-7" />}
              title="Akses Mandiri"
              description="Mulai belajar kapan saja tanpa perlu mendaftar akun. Seluruh progres tersimpan aman di browser lokal Anda."
              gradient="from-green-500 to-emerald-600"
              glow="shadow-green-500/20"
            />
            <FeatureCard
              icon={<Smile className="w-7 h-7" />}
              title="Bebas Hambatan"
              description="Antarmuka ringan dan responsif yang dirancang untuk menghilangkan segala kendala teknis saat proses belajar."
              gradient="from-pink-500 to-rose-500"
              glow="shadow-pink-500/20"
            />
            <FeatureCard
              icon={<Sparkles className="w-7 h-7" />}
              title="Modern UX"
              description="Desain premium dengan dukungan Dark Mode yang nyaman, dioptimalkan untuk sesi belajar durasi panjang."
              gradient="from-indigo-500 to-blue-600"
              glow="shadow-indigo-500/20"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  glow: string;
}

function FeatureCard({ icon, title, description, gradient, glow }: FeatureCardProps) {
  return (
    <div className={`bg-card p-8 rounded-3xl border border-border hover:shadow-2xl ${glow} transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden`}>
      {/* Subtle gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
      <div className={`bg-gradient-to-br ${gradient} w-14 h-14 flex items-center justify-center rounded-2xl text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}

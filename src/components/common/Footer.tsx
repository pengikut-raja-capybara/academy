import { useState } from "react";
import { X, Globe, Zap, Users, Scale, ShieldCheck, Info, ChartNoAxesColumnIncreasing, Mail } from "lucide-react";

import { Link } from "react-router";

export default function Footer() {
  const [showCredits, setShowCredits] = useState(false);

  return (
    <>
      <footer className="py-5 sm:py-6 border-t border-border bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-500/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 sm:gap-3 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">PRC Academy</span>


            <span className="hidden sm:inline text-muted-foreground">&bull;</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider font-bold">&copy; {new Date().getFullYear()} Pengikut Raja Capybara</span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <span>Lisensi MIT</span>
            <span>&bull;</span>
            <Link to="/about" className="hover:text-primary flex items-center gap-1 transition-colors">
              <Info size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Tentang Platform</span>
            </Link>
            <Link to="/roadmap" className="hover:text-primary flex items-center gap-1 transition-colors">
              <ChartNoAxesColumnIncreasing size={10} className="sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">Roadmap</span>
            </Link>
            <Link to="/privacy" className="hover:text-primary transition-colors flex items-center gap-1">
              <ShieldCheck size={10} className="sm:w-3 sm:h-3" />
              Kebijakan Privasi
            </Link>
            <span className="sm:hidden">&bull;</span>

            <button
              onClick={() => setShowCredits(true)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity font-black"
            >
              DI BALIK LAYAR ✦
            </button>
          </div>
        </div>
      </footer>

      {/* Credits Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCredits(false)}>
          <div
            className="relative w-full max-w-lg border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl m-0 sm:m-4 p-6 sm:p-8 space-y-5 sm:space-y-6 overflow-hidden"
            style={{ backgroundColor: "hsl(var(--card))" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">Tentang Platform</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Kredit dan ekosistem di balik layar.</p>
              </div>


              <button onClick={() => setShowCredits(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="h-px bg-border" />

            {/* Credit Items */}
            <div className="space-y-3 sm:space-y-4">
              <CreditRow icon={<Users size={16} />} label="Dikembangkan Oleh" value="Mahasiswa PJJ Sistem Informasi UNSIA" color="from-pink-500 to-rose-500" />
              <CreditRow icon={<Globe size={16} />} label="Komunitas Penggerak" value="Pengikut Raja Capybara" color="from-blue-500 to-cyan-500" />
              <CreditRow icon={<Zap size={16} />} label="Didukung Oleh" value="Angsa Cyber Custodian & Angsa Development Studio" color="from-yellow-400 to-orange-500" />
              <CreditRow icon={<Scale size={16} />} label="Lisensi" value="MIT" color="from-green-500 to-emerald-500" />
              <CreditRow icon={<Mail size={16} />} label="Kontak Resmi" value="rajacapybara275@gmail.com" color="from-purple-500 to-indigo-500" />
            </div>

            <div className="h-px bg-border" />

            <div className="text-[11px] text-muted-foreground text-center leading-relaxed space-y-1">
              <p>Platform edukasi mandiri yang mengutamakan privasimu.</p>
              <p className="font-medium text-foreground/70">100% data progres belajar disimpan secara lokal di perangkat ini.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CreditRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className={`bg-gradient-to-br ${color} w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-white shadow-md`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}

import { CheckCircle2, Rocket, Flame, Globe, ArrowRight, Milestone } from "lucide-react";

export default function RoadmapPage() {
  const phases = [
    {
      title: "Fase 1: Fondasi Ekosistem",
      status: "Selesai / Berjalan",
      icon: <CheckCircle2 className="text-green-500" />,
      color: "border-green-500/20",
      items: [
        { title: "Sistem Pembelajaran Inti", desc: "Halaman Belajar interaktif dengan dukungan modul video, teks, dan evaluasi (kuis)." },
        { title: "Katalog Modul", desc: "Halaman daftar modul untuk kurasi materi edukasi terbuka." },
        { title: "Transparansi & Legalitas", desc: "Halaman Kebijakan Privasi dan Informasi Platform." },
      ],
    },
    {
      title: "Fase 2: Ekspansi & Kedaulatan Data",
      status: "Fokus Saat Ini",
      icon: <Rocket className="text-blue-500 animate-pulse" />,
      color: "border-blue-500/30",
      isCurrent: true,
      items: [
        { title: "Dashboard Personal", desc: "Ruang kendali pribadi untuk melihat statistik belajar, riwayat penyelesaian, dan hall of fame secara visual." },
        { title: "Backup & Pindah Device", desc: "Mau lanjut belajar di laptop lain? Cukup ekspor progresmu ke JSON dan impor di perangkat baru. Datamu adalah milikmu sepenuhnya." },
        { title: "10+ Modul Belajar", desc: "Memperluas katalog materi dari berbagai sumber open-source terbaik." },
      ],
    },
    {
      title: "Fase 3: Otoritas Akademis",
      status: "Jangka Menengah",
      icon: <Flame className="text-orange-500" />,
      color: "border-orange-500/20",
      items: [{ title: "Materi Original (PRCA Originals)", desc: "Perilisan modul eksklusif buatan internal Pengikut Raja Capybara Academy, berfokus pada topik spesialisasi dan studi kasus nyata." }],
    },
    {
      title: "Fase 4: Desentralisasi Pembelajaran",
      status: "Jangka Panjang",
      icon: <Globe className="text-purple-500" />,
      color: "border-purple-500/20",
      items: [
        { title: "Custom Modul", desc: "Fitur yang memungkinkan pengguna meracik kurikulum mereka sendiri menggunakan antarmuka pembuat modul statis." },
        { title: "Ekspor/Impor Custom Modul", desc: "Bagikan modul racikanmu ke teman atau komunitas lain hanya dengan bertukar satu file JSON." },
        { title: "Self Cloud Integration", desc: "Sinkronisasi progres dan modul kustom langsung ke penyimpanan awan pribadi pengguna (G-Drive, Nextcloud, dll)." },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 pb-20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <Milestone size={14} />
            Peta Jalan Pengembangan
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Membangun Masa Depan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Pendidikan Terbuka</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Visi kami adalah menciptakan ekosistem belajar yang mandiri, menghargai privasi, dan memberikan kedaulatan data penuh kepada pengguna.
          </p>
        </div>

        <div className="space-y-12 relative animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-purple-500 to-transparent hidden lg:block opacity-20" />

          {phases.map((phase, i) => (
            <div key={i} className="relative lg:pl-24">
              {/* Desktop Node */}
              <div className={`absolute left-4 top-0 w-8 h-8 rounded-full bg-background border-4 ${phase.color} hidden lg:flex items-center justify-center z-10 shadow-lg`}>
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>

              <div
                className={`
                bg-card/40 backdrop-blur-xl border ${phase.color} rounded-3xl p-8 sm:p-10 shadow-xl transition-all duration-500
                ${phase.isCurrent ? "ring-2 ring-primary/20 scale-[1.02]" : "hover:scale-[1.01] hover:bg-card/60"}
              `}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-muted/50">{phase.icon}</div>
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">{phase.title}</h2>
                      <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${phase.isCurrent ? "text-primary" : "text-muted-foreground"}`}>{phase.status}</p>
                    </div>
                  </div>
                  {phase.isCurrent && (
                    <div className="px-4 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 w-fit">Sedang Dikerjakan</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {phase.items.map((item, j) => (
                    <div key={j} className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border/40 hover:border-primary/30 transition-colors group">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                        <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </div>
                      <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-20 text-center p-10 rounded-3xl bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent border border-border/40 backdrop-blur-sm">
          <h3 className="text-xl font-bold mb-3">Ingin Berkontribusi?</h3>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed mb-6">
            Platform ini dibangun dengan semangat keterbukaan. Kami mengundang pengembang, kreator konten, dan pembelajar untuk ikut membentuk masa depan PRC Academy.
          </p>
          <a
            href="https://github.com/pengikut-raja-capybara/academy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-foreground text-background text-sm font-black hover:opacity-90 transition-all active:scale-95"
          >
            Buka Repositori GitHub
            <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

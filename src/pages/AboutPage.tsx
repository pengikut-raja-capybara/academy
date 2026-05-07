import { Info, ShieldCheck, Heart, Code2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <Info size={14} />
            Tentang Platform
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Teman Belajar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tanpa Batas</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            PRC Academy adalah platform edukasi yang dirancang sebagai "wrapper" dan alat bantu belajar mandiri untuk membantu siapa saja menguasai teknologi dengan lebih terstruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          {/* Disclaimer Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck size={120} />
            </div>

            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <ShieldCheck className="text-blue-500" />
              Pernyataan Konten
            </h2>
            <div className="space-y-4 text-muted-foreground font-medium leading-relaxed">
              <p>
                Penting untuk diketahui bahwa <span className="text-foreground font-bold underline decoration-blue-500/30">semua materi video</span> yang ada di dalam platform ini{" "}
                <strong>bukanlah milik kami</strong>. Platform ini berfungsi sebagai wadah untuk mengorganisir konten berkualitas yang tersedia secara publik.
              </p>
              <p>
                Kami sangat menghargai hak cipta dan jerih payah para kreator konten. Seluruh video bersumber dari platform pihak ketiga (seperti YouTube) dan kami selalu berupaya mencantumkan kredit
                kepada pemilik aslinya melalui tautan langsung ke saluran mereka.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Our Goal */}
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
                <Code2 size={24} />
              </div>
              <h3 className="text-xl font-black mb-4">Tujuan Kami</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Membantu pemula menavigasi materi belajar yang luas dengan kurikulum yang terarah, fitur pelacakan progres, dan latihan yang relevan.
              </p>
            </div>

            {/* Respect to Creators */}
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6">
                <Heart size={24} />
              </div>
              <h3 className="text-xl font-black mb-4">Apresiasi Kreator</h3>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                Kami mendukung ekosistem pembelajaran terbuka. Jika Anda adalah pemilik konten dan merasa keberatan konten Anda ditampilkan di sini, silakan hubungi kami.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Lock, Eye, Database, MousePointer2, Mail, Info, ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
            <ShieldCheck size={14} />
            Kebijakan Privasi
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight mb-6">
            Data Anda Adalah <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Privasi Anda</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
            Kami sangat menghargai privasi Anda. Halaman ini menjelaskan bagaimana kami mengelola data Anda di platform PRC Academy secara transparan.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Terakhir Diperbarui: 7 Mei 2026
          </div>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <PolicyCard
              icon={<Eye size={24} />}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
              title="Transparansi Data"
              description="Kami tidak mengumpulkan, menyimpan, atau menjual data pribadi Anda ke server pihak ketiga manapun."
            />

            <PolicyCard
              icon={<Database size={24} />}
              color="text-purple-500"
              bgColor="bg-purple-500/10"
              title="Penyimpanan Lokal"
              description="Seluruh progres belajar Anda disimpan secara eksklusif di penyimpanan lokal perangkat Anda (LocalStorage)."
            />

            <PolicyCard
              icon={<Lock size={24} />}
              color="text-pink-500"
              bgColor="bg-pink-500/10"
              title="Keamanan & Kontrol"
              description="Anda memiliki kendali penuh. Anda dapat menghapus data progres belajar Anda kapan saja melalui browser."
            />

            <PolicyCard
              icon={<MousePointer2 size={24} />}
              color="text-orange-500"
              bgColor="bg-orange-500/10"
              title="Interaksi Analitik"
              description="Elemen interaktif mungkin menggunakan analitik anonim hanya untuk peningkatan performa platform."
            />
          </div>

          {/* Detailed Content */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500">
              <Info size={120} />
            </div>

            <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
              <Info className="text-blue-500" />
              Informasi Tambahan
            </h2>
            <div className="space-y-6 text-muted-foreground font-medium leading-relaxed">
              <p>
                PRC Academy adalah inisiatif pendidikan open-source. Kode sumber kami tersedia secara transparan bagi siapa saja yang ingin melakukan audit keamanan atau privasi. Dengan menggunakan
                platform ini, Anda setuju dengan metode penyimpanan lokal yang kami gunakan.
              </p>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-600/5 to-purple-600/5 border border-primary/10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Punya pertanyaan tentang privasi?</h4>
                    <p className="text-sm text-muted-foreground">Hubungi tim pengembang kami melalui repositori GitHub resmi atau komunitas Pengikut Raja Capybara.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ icon, color, bgColor, title, description }: { icon: React.ReactNode; color: string; bgColor: string; title: string; description: string }) {
  return (
    <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-lg hover:border-primary/20 transition-all duration-300">
      <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center mb-6`}>{icon}</div>
      <h3 className="text-xl font-black mb-4">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
  );
}

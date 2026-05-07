# Dokumentasi Arsitektur, Routing, & Deployment

Dokumentasi ini menjelaskan infrastruktur teknis, strategi pengambilan data, dan konfigurasi deployment platform Capybara Academy.

## 1. Sumber Data (CMS Berbasis GitHub JSON)

Platform ini tidak menggunakan database tradisional. Seluruh konten materi disimpan sebagai file **JSON** di repositori GitHub terpisah.

### A. Repositori Konten
- **Repo:** `pengikut-raja-capybara/academy-content`
- **Branch:** `main`
- **Folder Utama:** `content/`

### B. Mekanisme Pengambilan Data
Sistem menggunakan `CmsFetcher` untuk berkomunikasi dengan GitHub melalui penyedia CDN:
1.  **Penyedia Utama (jsDelivr):** Digunakan untuk kecepatan akses tinggi dan caching global (`https://cdn.jsdelivr.net/gh/`).
2.  **Penyedia Cadangan (GitHub Raw):** Jika CDN gagal, sistem otomatis beralih ke `https://raw.githubusercontent.com/`.
3.  **Optimalisasi Gambar:** Seluruh aset gambar diproses melalui proxy **weserv** (`https://wsrv.nl/`) untuk konversi otomatis ke format WebP dan optimasi ukuran.

## 2. Arsitektur Data & Pengambilan Modul (Data Fetching)


Sistem menggunakan strategi **Lazy Loading** dan **Progressive Enrichment** untuk meminimalkan beban bandwidth dan mempercepat akses awal:

### A. Pengambilan Indeks Modul (`fetchModules`)

Saat pertama kali membuka aplikasi (Landing atau Daftar Modul), sistem memanggil `fetchModuleIndex()`.

- **Output:** Daftar ringkas seluruh modul (ID, Slug, Judul, Deskripsi, Thumbnail).
- **Tujuan:** Menampilkan katalog modul dengan cepat tanpa mendownload konten materi yang berat.
- **Merge Logic:** Redux akan menggabungkan data indeks ini dengan data detail yang mungkin sudah ada di memori agar materi (`lessons`) yang sudah ter-fetch tidak hilang.

### B. Pengambilan Detail Modul (`fetchModuleDetail`)

Dijalankan secara otomatis saat pengguna memasuki halaman belajar (`/learning/:slug`).

- **Output:** Objek modul lengkap termasuk array `lessons`, `attachments`, dan instruksi submisi.
- **UI Guard:** Selama proses fetch, layar belajar akan menampilkan _Skeleton Loader_ atau spinner "Memuat Materi...".
- **Caching:** Jika detail modul sudah pernah di-fetch dalam sesi yang sama, sistem akan menggunakan data dari _store_ terlebih dahulu sebelum memperbaruinya di latar belakang.

## 2. Konfigurasi Routing & Navigation

Platform ini dikelola menggunakan `react-router` dengan beberapa konfigurasi khusus untuk mendukung lingkungan hosting yang variatif.

### A. Basename (Sub-direktori)

- Navigasi internal (`<Link>`) mengarah ke jalur yang benar di GitHub Pages.
- Asset (JS/CSS) dapat dimuat dengan jalur relatif yang tepat.

### B. Strategi 404 (Redirect to Home)

Untuk menjaga alur pengguna agar tidak terjebak di halaman error, sistem menerapkan _wildcard route_:

```tsx
<Route path="*" element={<Navigate to="/" replace />} />
```

Setiap rute yang tidak dikenali akan secara otomatis dialihkan kembali ke Landing Page.

## 3. SEO & Deployment Optimization

### A. Meta Tags & Social Sharing

Platform mendukung Open Graph (OG) dan Twitter Cards di `index.html`.

- **Image Preview:** Menggunakan `/images/default-modul.png` sebagai standar visual saat link dibagikan.
- **Generalisasi:** Metadata dirancang bersifat umum (multi-topic) agar relevan untuk berbagai jenis materi di luar teknologi.

### B. GitHub Pages (Actions)

Konfigurasi `vite.config.ts` menggunakan deteksi otomatis untuk `base` path:

```typescript
base: process.env.GITHUB_ACTIONS ? "/academy/" : "/";
```

## 4. Redux Async Actions

Daftar perintah asinkron yang mengelola siklus hidup data:

| Action              | Fungsi                                                 |
| :------------------ | :----------------------------------------------------- |
| `fetchModules`      | Mengambil daftar seluruh modul yang tersedia dari CMS. |
| `fetchModuleDetail` | Mengambil detail lengkap satu modul berdasarkan slug.  |

# 🎓 PRC Academy
> **Platform Belajar Gratis & Open Source untuk Masa Depan Digital.**

[![Deploy to GitHub Pages](https://github.com/pengikut-raja-capybara/academy/actions/workflows/deploy.yml/badge.svg)](https://github.com/pengikut-raja-capybara/academy/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**PRC Academy** adalah platform pembelajaran mandiri yang dirancang untuk memberikan pengalaman belajar yang seru, bersih, dan tanpa gangguan. Dibangun dengan fokus pada kedaulatan data pengguna dan transparansi konten.

[**Mulai Belajar Sekarang →**](https://pengikut-raja-capybara.github.io/academy/)

---

## ✨ Fitur Unggulan

- 🚀 **Zero Account Needed**: Mulai belajar secara instan tanpa perlu mendaftar atau login.
- 💾 **Local Progress Sync**: Seluruh progres belajar tersimpan aman secara lokal di browser Anda.
- 📺 **Distraction-Free Learning**: UI yang bersih, dioptimalkan untuk fokus maksimal tanpa iklan atau algoritma rekomendasi.
- 🌑 **Premium Dark Mode**: Desain modern dengan dukungan mode gelap yang nyaman untuk sesi belajar durasi panjang.
- 📦 **PWA Ready**: Dapat diinstal di perangkat mobile atau desktop layaknya aplikasi native.
- 🗺️ **Interactive Roadmap**: Pantau arah pengembangan platform dan kontribusi komunitas secara transparan.

---

## 🛠️ Tech Stack

Platform ini menggunakan teknologi modern untuk memastikan performa yang cepat dan pengalaman pengguna yang premium:

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Vibrant & Minimalist Design)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) (Persistent Progress & Theme)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Runtime**: [Bun](https://bun.sh/)

---

## 🏗️ Arsitektur Konten (Git-based CMS)

PRC Academy tidak menggunakan database tradisional. Konten materi dikelola sebagai file JSON di repositori terpisah:

- **Data Source**: [academy-content](https://github.com/pengikut-raja-capybara/academy-content)
- **Fetching**: Menggunakan strategi *Lazy Loading* via jsDelivr CDN untuk kecepatan maksimal.
- **Image Proxy**: Optimasi gambar otomatis melalui `wsrv.nl`.

> [!TIP]
> Detail teknis mengenai alur data dapat dibaca di [Dokumentasi Arsitektur](./docs/architecture-and-deployment.md).

---

## 🚀 Memulai (Lokal)

Pastikan Anda sudah menginstal [Bun](https://bun.sh/) di sistem Anda.

1. **Clone repositori**:
   ```bash
   git clone https://github.com/pengikut-raja-capybara/academy.git
   ```

2. **Install dependensi**:
   ```bash
   bun install
   ```

3. **Jalankan mode pengembangan**:
   ```bash
   bun run dev
   ```

---

## 📖 Dokumentasi Internal

Untuk pengembangan lebih lanjut, silakan merujuk pada dokumen berikut:
- 📊 [**Sistem Progres Belajar**](./docs/learning-progress.md) - Detail logika pelacakan dan validasi materi.
- 🌐 [**Arsitektur & Deployment**](./docs/architecture-and-deployment.md) - Detail mengenai CMS GitHub JSON dan konfigurasi routing.

---

## 📜 Lisensi & Atribusi

Proyek ini dilisensikan di bawah **MIT License**.
Dikembangkan dengan penuh dedikasi oleh komunitas **Pengikut Raja Capybara**.

*Dukung kami dengan memberikan ⭐ di repositori ini!*

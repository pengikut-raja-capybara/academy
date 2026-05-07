# Dokumentasi Sistem Progres Belajar (Learning Progress)

Dokumentasi ini menjelaskan bagaimana sistem melacak, menyimpan, dan memvalidasi progres belajar pengguna di platform Capybara Academy.

## 1. Struktur Data (State Management)

Data progres belajar disimpan dalam *Redux Store* (`learningSlice`) dan di-persist ke `localStorage` dengan key `capybara_academy_state`. Struktur data utamanya adalah `ProgressMap` yang memetakan ID Materi (atau ID Video) ke detail progresnya.

```typescript
export type Attachment = {
  title: string;
  url: string;
  type?: 'pdf' | 'zip' | 'image' | 'code' | 'link' | string;
};

type ProgressMap = Record<string, {
  seen: Record<number, boolean>; // Detik video yang sudah ditonton
  lastWatchedSec: number;        // Posisi terakhir video (dalam detik)
  duration?: number;             // Total durasi video (dalam detik)
  completed: boolean;            // Status kelulusan/selesai materi
  checklist: Record<number, boolean>; // Status item TO DO (index -> boolean)
  quizAnswers?: Record<number, number>; // Jawaban kuis (index pertanyaan -> index opsi terpilih)
  quizScore?: number;            // Skor raw terakhir yang didapatkan
}>;
```

> [!NOTE]
> Properti `attachments?: Attachment[]` sekarang juga dapat disisipkan baik di tingkat materi individual (`Lesson`) maupun di tingkat akhir modul (`Module.submissionAttachments`) untuk menyediakan lampiran materi yang bisa diunduh.

## 2. Logika Kelulusan per Tipe Materi (Completion Logic)

Sistem membedakan syarat kelulusan berdasarkan tipe materi:

### A. Materi Video (`lesson.video` eksis)
* **Syarat 1 (Tonton Video):** Pengguna harus menonton persentase tertentu dari video (diatur oleh `lesson.minWatchPercentage`, default 90%). Nilai persentase video akan dinormalisasi (contoh: jika min 90%, menonton 90% akan dianggap 100% progres video).
* **Syarat 2 (TO DO / Checklist):** Jika materi memiliki daftar "TO DO", maka seluruh *item* di dalamnya wajib dicentang (100%).
* Sistem otomatis mencentang item checklist "Tonton video sampai selesai" jika syarat 1 terpenuhi.

### B. Materi Latihan / Kuis (`lesson.type === "exercise"`)
* Validasi sangat ketat: status `completed` **harus** `true` secara eksplisit dari dalam *state*.
* Status ini hanya berubah menjadi `true` ketika pengguna menekan tombol **"Simpan & Lanjut"** (yang akan men-dispatch *action* `completeExercise`) setelah mendapat skor di atas batas minimal lulus (diatur oleh `lesson.minScorePercentage`, default 80%).

### C. Materi Teks (Tanpa Video & Bukan Latihan)
* **Jika ada TO DO:** Harus mencentang semua item TO DO (100%).
* **Jika tidak ada TO DO:** Materi akan otomatis dianggap selesai saat diakses.

## 3. Sistem Penguncian Materi (Locking System)

Sistem menggunakan alur pembelajaran terurut (*Sequential Learning*). Evaluasi dilakukan secara *real-time* di UI (seperti `LessonSidebar`):

> [!IMPORTANT]
> Materi ke-*N* akan **Terkunci (Locked)** apabila materi ke-*(N-1)* (materi sebelumnya) belum memenuhi syarat kelulusan di atas. Pengguna tidak bisa melompati materi yang terkunci.

## 4. Alur Penyelesaian Modul (Module Overview & Submission)

Saat seluruh materi dalam suatu modul telah memenuhi syarat kelulusan (status `allLessonsCompleted === true`), sebuah item navigasi spesial akan terbuka di akhir daftar sidebar:

* **Modul Selesai / Ringkasan:** Jika modul tidak memiliki tugas akhir (tidak ada `submissionUrl`), layar akan menampilkan ucapan selamat dan ringkasan progres 100%.
* **Kumpulkan Tugas Akhir / Submisi Modul:** Jika objek `Module` menyediakan `submissionUrl`, layar akan memunculkan komponen *Call to Action* (CTA) untuk submit tugas akhir. 
* Tampilan ini juga dapat memuat instruksi spesifik di properti `submissionDescription` dan kumpulan file pelengkap di `submissionAttachments`.

## 5. Logika Penilaian (Scoring Logic)

Sistem menghitung nilai rata-rata modul secara otomatis untuk ditampilkan pada layar ringkasan akhir:

1. **Perhitungan Persentase:** Nilai setiap latihan (`exercise`) dihitung dengan rumus: `(Jawaban Benar / Total Soal) * 100`.
2. **Rata-rata Modul:** Mengambil rata-rata dari seluruh persentase latihan yang ada dalam modul tersebut.
3. **Format Tampilan:**
   - **Angka Bulat:** Ditampilkan tanpa desimal (contoh: `100`, `80`).
   - **Angka Pecahan:** Ditampilkan dengan **2 digit** desimal dan pemisah koma (contoh: `75,50`, `40,25`).
   - Tanda persen (`%`) dihilangkan pada tampilan statistik utama sesuai preferensi desain.

## 6. Redux Actions Utama

Berikut adalah daftar perintah (actions) yang mengontrol data belajar pengguna di dalam `learningSlice.ts`:

| Action | Fungsi |
| :--- | :--- |
| `updateProgress` | Dijalankan terus menerus saat video diputar. Mengupdate `lastWatchedSec`, mengecek apakah video sudah mencapai batas tonton minimum, dan mengubah `completed` menjadi `true` jika seluruh syarat terpenuhi. |
| `toggleChecklistItem` | Mencentang/batal mencentang item TO DO. Fungsi ini juga akan mengevaluasi ulang status `completed` dari keseluruhan materi (berguna untuk materi berjenis teks). |
| `completeExercise` | Dipanggil saat pengguna lulus kuis. Secara paksa mencentang semua item TO DO yang ada di kuis tersebut dan mengubah status `completed` menjadi `true`. |
| `resetExercise` | Digunakan saat pengguna menekan "Coba Lagi". Menghapus seluruh status TO DO dan mereset `completed` menjadi `false`. |

## 7. Ringkasan Perbaikan Bug (Log Historis)
* **Kasus:** Kuis langsung terbuka dan dianggap 100% selesai padahal belum dikerjakan, dan materi di bawahnya langsung terbuka (*unlocked*).
* **Solusi:** Memberikan pengecualian eksplisit (pengecekan `lesson.type === 'exercise'`) di dalam `calcCompletion` (pada `LearningPage.tsx`) serta logika *lock* (pada `LessonSidebar.tsx`). Perbaikan ini memastikan sistem tidak lagi menganggap kuis selesai berdasarkan kondisi otomatis (seperti `lesson.video` yang bernilai *undefined*).

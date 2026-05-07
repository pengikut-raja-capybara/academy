import type { Module } from "../types";

export const SAMPLE_MODULES: Module = {
  id: "mod-html",
  slug: "html-dasar",
  title: "🚀 HTML Dasar",
  description: "Pelajari fondasi utama pembuatan halaman web menggunakan HTML tingkat dasar hingga menengah.",
  submissionUrl: "https://forms.google.com", // Ganti dengan link Google Form yang sebenarnya
  submissionDescription: `Buat sebuah halaman web sederhana menggunakan HTML dengan ketentuan berikut:

• Halaman memiliki struktur HTML5 yang benar (<!DOCTYPE html>, <html>, <head>, <body>)
• Terdapat minimal 1 heading utama (<h1>) dan 2 sub-heading (<h2>)
• Berisi minimal 3 paragraf teks yang informatif
• Terdapat 1 gambar dengan atribut alt yang sesuai
• Terdapat sebuah tabel dengan minimal 3 baris dan 3 kolom
• Terdapat sebuah form dengan minimal 3 jenis input berbeda
• Semua file dikumpulkan dalam format .zip

Upload hasil tugasmu melalui form di bawah ini.`,
  submissionAttachments: [
    { title: "Template HTML Dasar (Starter Kit)", url: "https://example.com/starter.zip", type: "zip" },
    { title: "Referensi Desain Web", url: "https://example.com/reference.pdf", type: "pdf" },
  ],
  lessons: [
    {
      id: "html-intro",
      title: "Apa itu Web Development?",
      type: "text",
      description: "Baca artikel ini sebelum memulai praktek coding.",
      content: `
          Web development adalah proses membangun dan memelihara situs web. 
          Ini melibatkan segala hal mulai dari desain visual hingga logika di balik layar.
          
          Dalam kursus ini, kita akan fokus pada **Frontend Development** menggunakan HTML.
          HTML (HyperText Markup Language) adalah bahasa standar untuk membuat halaman web.
        `,
      attachments: [
        { title: "Silabus Pembelajaran Web Dev", url: "https://example.com/syllabus.pdf", type: "pdf" },
        { title: "Cheat Sheet HTML5", url: "https://example.com/cheatsheet.image", type: "image" },
      ],
      checklist: ["Pahami definisi Web Development", "Ketahui perbedaan Frontend dan Backend", "Siapkan mental untuk belajar coding"],
    },
    {
      id: "html-latihan-1",
      title: "Latihan: Struktur Dasar HTML",
      type: "exercise",
      description: "Uji pemahamanmu tentang struktur dasar HTML5.",
      minScorePercentage: 50,
      exercise: {
        type: "quiz",
        questions: [
          {
            id: "q1",
            question: "Tag manakah yang digunakan untuk mendefinisikan judul utama sebuah halaman?",
            options: ["<p>", "<h1>", "<title>", "<head>"],
            correctAnswer: 1,
          },
          {
            id: "q2",
            question: "Elemen apa yang membungkus seluruh konten yang terlihat di browser?",
            options: ["<head>", "<html>", "<body>", "<section>"],
            correctAnswer: 2,
          },
        ],
      },
    },
    {
      id: "html-1",
      title: "Pendahuluan HTML (1/13)",
      type: "video",
      description: "Pengenalan tentang apa itu HTML, sejarahnya, dan mengapa kita perlu mempelajarinya.",
      video: "NBZ9Ro6UKV8",
      minWatchPercentage: 90,
      checklist: ["Pahami sejarah HTML", "Instal browser Google Chrome"],
    },
    // {
    //   id: "html-2",
    //   moduleId: "mod-html",
    //   title: "Hello World! (2/13)",
    //   type: "video",
    //   description: "Langkah pertama membuat dan menjalankan file HTML sederhana di browser.",
    //   video: "1NicaVOCXHA",
    //   minWatchPercentage: 90,
    //   checklist: ["Praktekkan pembuatan file index.html", "Jalankan file di browser"],
    // },
    // {
    //   id: "html-3",
    //   moduleId: "mod-html",
    //   title: "Code Editor (3/13)",
    //   type: "video",
    //   description: "Pemilihan dan instalasi code editor yang tepat untuk menulis kode HTML dengan lebih efisien.",
    //   video: "3sLSi9L5nWE",
    //   minWatchPercentage: 90,
    //   checklist: ["Instal Extension HTML pendukung", "Setup workspace pertama kamu"],
    // },
    // {
    //   id: "html-4",
    //   moduleId: "mod-html",
    //   title: "Tag (4/13)",
    //   type: "video",
    //   description: "Memahami anatomi HTML, cara kerja tag, elemen, and atribut dalam menstrukturkan halaman web.",
    //   video: "cUWBYzA6M-8",
    //   minWatchPercentage: 90,
    //   checklist: ["Pelajari elemen dan atribut dasar", "Buat struktur HTML5 minimalis"],
    // },
    // {
    //   id: "html-5",
    //   moduleId: "mod-html",
    //   title: "Paragraf (5/13)",
    //   type: "video",
    //   description: "Cara menulis, memformat, dan merapikan teks paragraf menggunakan tag HTML.",
    //   video: "Dl_bIYBc9gM",
    //   minWatchPercentage: 90,
    //   checklist: ["Pahami whitespace di HTML", "Coba tag <br> dan <hr>"],
    // },
    // {
    //   id: "html-6",
    //   moduleId: "mod-html",
    //   title: "Heading (6/13)",
    //   type: "video",
    //   description: "Penggunaan tag heading (H1 hingga H6) untuk membuat hierarki judul dan subjudul.",
    //   video: "SMetRBdIh-8",
    //   minWatchPercentage: 90,
    //   checklist: ["Pahami pentingnya H1 untuk SEO", "Buat artikel dengan struktur judul yang benar"],
    // },
    // {
    //   id: "html-7",
    //   moduleId: "mod-html",
    //   title: "List (7/13)",
    //   type: "video",
    //   description: "Membuat daftar item menggunakan Ordered List (ol), Unordered List (ul), dan List Item (li).",
    //   video: "gLHEoeupIZs",
    //   minWatchPercentage: 90,
    //   checklist: ["Buat langkah-langkah dengan <ol>", "Custom bullet point sederhana"],
    // },
    // {
    //   id: "html-8",
    //   moduleId: "mod-html",
    //   title: "Hyperlink (8/13)",
    //   type: "video",
    //   description: "Menghubungkan antar halaman web menggunakan tag anchor (a) atau hyperlink.",
    //   video: "QIlBOI-hTuA",
    //   minWatchPercentage: 90,
    //   checklist: ["Gunakan target='_blank'", "Buat navigasi antar file lokal"],
    // },
    // {
    //   id: "html-9",
    //   moduleId: "mod-html",
    //   title: "Image (9/13)",
    //   type: "video",
    //   description: "Menambahkan, menampilkan, dan mengatur gambar di dalam halaman web menggunakan tag img.",
    //   video: "yb_emYhY3Pc",
    //   minWatchPercentage: 90,
    //   checklist: ["Pahami penggunaan atribut alt", "Atur lebar dan tinggi gambar"],
    // },
    // {
    //   id: "html-10",
    //   moduleId: "mod-html",
    //   title: "Table (10/13)",
    //   type: "video",
    //   description: "Membangun struktur tabel dasar untuk menampilkan data dalam bentuk baris dan kolom.",
    //   video: "7-QNafrXigs",
    //   minWatchPercentage: 90,
    //   checklist: ["Isi data dengan <td>", "Berikan header tabel dengan <th>"],
    // },
    // {
    //   id: "html-11",
    //   moduleId: "mod-html",
    //   title: "Table Merging (11/13)",
    //   type: "video",
    //   description: "Teknik menggabungkan baris (rowspan) dan kolom (colspan) pada tabel HTML.",
    //   video: "qs8G2XWf7Yk",
    //   minWatchPercentage: 90,
    //   checklist: ["Praktekkan rowspan untuk gabung baris", "Buat jadwal pelajaran menggunakan tabel"],
    // },
    // {
    //   id: "html-12",
    //   moduleId: "mod-html",
    //   title: "Form (12/13)",
    //   type: "video",
    //   description: "Mengenal elemen form dasar untuk mengumpulkan input data dari pengguna.",
    //   video: "LQf_Jj7jbCI",
    //   minWatchPercentage: 90,
    //   checklist: ["Pahami atribut name dan id", "Buat tombol submit sederhana"],
    // },
    // {
    //   id: "html-13",
    //   moduleId: "mod-html",
    //   title: "Form (lanjutan) (13/13)",
    //   type: "video",
    //   description: "Eksplorasi lebih lanjut mengenai berbagai tipe input, radio button, checkbox, dan tombol submit pada form.",
    //   video: "_CNkLKU-LoE",
    //   minWatchPercentage: 90,
    //   checklist: ["Buat pilihan dengan radio button", "Gunakan checkbox untuk persetujuan"],
  ],
};

export const CSS_MODULE: Module = {
  id: "mod-css",
  slug: "css-dasar",
  title: "🎨 CSS Dasar",
  description: "Percantik halaman webmu dengan gaya, warna, dan tata letak yang menarik menggunakan CSS modern.",
  submissionUrl: "https://forms.google.com",
  submissionDescription: "Buatlah sebuah layout kartu profil yang responsif menggunakan CSS Grid atau Flexbox.",
  lessons: [
    {
      id: "css-intro",
      title: "Mengenal CSS",
      type: "video",
      description: "Apa itu CSS dan bagaimana cara menghubungkannya dengan HTML?",
      video: "1PnVor36_40",
      minWatchPercentage: 90,
      checklist: ["Pahami Selector", "Gunakan Property dan Value"],
    },
    {
      id: "css-latihan-1",
      title: "Latihan: Warna & Font",
      type: "exercise",
      description: "Uji pengetahuanmu tentang pewarnaan dan tipografi di CSS.",
      minScorePercentage: 70,
      exercise: {
        type: "quiz",
        questions: [
          {
            id: "css-q1",
            question: "Properti mana yang digunakan untuk mengubah warna teks?",
            options: ["text-color", "color", "font-style", "background-color"],
            correctAnswer: 1,
          },
          {
            id: "css-q2",
            question: "Apa singkatan dari CSS?",
            options: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
            correctAnswer: 1,
          },
        ],
      },
    },
  ],
};

export const ALL_MODULES: Module[] = [SAMPLE_MODULES, CSS_MODULE];

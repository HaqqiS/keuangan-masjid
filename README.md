# Aplikasi Akuntansi Masjid

Sebuah aplikasi web modern untuk mengelola dan mencatat keuangan masjid secara transparan dan efisien. Dibangun dengan T3 Stack, aplikasi ini menyediakan alur kerja yang lengkap mulai dari pencatatan pemasukan, proses pengajuan dan persetujuan pengeluaran, hingga dashboard statistik keuangan.

![Dashboard Aplikasi](https://newofxgrkewndmnxubzi.supabase.co/storage/v1/object/public/image-transaction/Screenshot%202025-09-12%20171017.png)

---

## ✨ Fitur Utama

- **🔐 Autentikasi & Peran Pengguna**: Sistem login dan register yang aman menggunakan Auth.js, dengan tiga level peran pengguna:
  - **Ketua**: Akses penuh.
  - **Bendahara**: Mengelola pemasukan, pengeluaran, dan persetujuan.
  - **Pengurus**: Dapat melihat data dan membuat pengajuan pengeluaran.

- **📊 Dashboard Interaktif**: Tampilan ringkasan keuangan masjid secara visual, meliputi:
  - Saldo kas akhir.
  - Total pemasukan dan pengeluaran bulan ini.
  - Perbandingan performa (kenaikan/penurunan) dengan bulan sebelumnya.
  - Rincian status pengajuan yang membutuhkan perhatian.
  - Insight mengenai sumber pemasukan dan kategori pengeluaran terbesar.

- **💰 Manajemen Pemasukan**: Fitur CRUD (Create, Read, Update, Delete) penuh untuk mencatat semua dana yang masuk ke kas masjid.

- **💸 Alur Kerja Pengajuan & Pengeluaran**:
  - Pengurus dapat membuat **Pengajuan** dana untuk suatu keperluan.
  - Bendahara dapat meninjau, **menyetujui (approve)**, atau **menolak (reject)** pengajuan.
  - Pengajuan yang disetujui akan difinalisasi menjadi catatan **Pengeluaran** resmi.

- **🖼️ Unggah Bukti Transaksi**: Pengguna dapat mengunggah bukti transaksi (gambar) saat membuat/mengedit data. File disimpan dengan aman di Supabase Storage menggunakan _Signed URLs_.

- **🗂️ Manajemen Kategori**: Fitur CRUD untuk mengelola kategori pemasukan dan pengeluaran agar pencatatan lebih terstruktur.

- **📄 Paginasi Sisi Server**: Semua tabel data menggunakan paginasi sisi server, memastikan aplikasi tetap cepat dan responsif meskipun data sudah mencapai ribuan baris.

---

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Database & ORM**: [Supabase](https://supabase.com/) (PostgreSQL) & [Prisma](https://www.prisma.io/)
- **API & Tipe**: [tRPC](https://trpc.io/) (End-to-end typesafe API)
- **Autentikasi**: [Auth.js](https://authjs.dev/) (sebelumnya NextAuth.js)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Komponen UI**: [Shadcn/UI](https://ui.shadcn.com/)
- **Manajemen Form**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **State Management (Global)**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Notifikasi**: [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Memulai Proyek Secara Lokal

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

1.  **Clone repositori:**

    ```bash
    git clone https://github.com/HaqqiS/keuangan-masjid.git
    cd keuangan-masjid
    ```

2.  **Install dependensi:**

    ```bash
    pnpm install
    ```

3.  **Setup Supabase:**
    - Buat proyek baru di [Supabase](https://supabase.com/).
    - Pergi ke **Project Settings > Database** dan salin **Connection String** URI.
    - Pergi ke **Project Settings > API** dan dapatkan `URL`, `anon (public) key`, dan `service_role (secret) key`.
    - Buat sebuah _Bucket_ baru di **Storage** (misalnya, `image-transaction`) dan atur RLS Policies-nya.

4.  **Konfigurasi Environment Variables:**
    - Salin file `.env.example` menjadi `.env.local`:
      ```bash
      cp .env.example .env.local
      ```
    - Buka file `.env.local` dan isi semua variabel yang dibutuhkan dengan nilai dari Supabase dan rahasia Anda sendiri.

5.  **Sinkronisasi Skema Database:**
    - Jalankan perintah Prisma untuk menerapkan skema ke database Supabase Anda.
      ```bash
      pnpm prisma db push
      ```

6.  **Jalankan server pengembangan:**
    ```bash
    pnpm dev
    ```
    Aplikasi sekarang seharusnya berjalan di `http://localhost:3000`.

---

### `.env.example`

Pastikan Anda mengisi variabel-variabel berikut di file `.env.local` Anda:

```env
# Database (dari Supabase > Project Settings > Database)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres"

# NextAuth.js (buat secret sendiri, contoh: `openssl rand -base64 32`)
AUTH_SECRET="your-auth-secret"
AUTH_URL="http://localhost:3000"

# Supabase (dari Supabase > Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL="[https://your-project-id.supabase.co](https://your-project-id.supabase.co)"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
```

---

## 📂 Struktur Proyek (Ringkasan)

```
src/
├── app/                  # Routing & Halaman (App Router)
│   ├── auth/           # Grup rute untuk autentikasi
│   ├── dashboard/        # Grup rute untuk area yang dilindungi
│   └── _components/      # Komponen React
│       ├── features/     # Komponen cerdas dengan logika (misal: CreatePengajuanDrawer)
│       ├── layouts/      # Komponen layout (Sidebar, Header)
│       ├── shared/       # Komponen "bodoh" yang reusable (Button, DataTable)
│       └── views/        # Komponen level halaman (PemasukanViewPage)
├── lib/                  # Fungsi-fungsi helper (misal: koneksi Supabase klien)
├── server/               # Semua kode backend
│   ├── api/              # Definisi tRPC router
│   ├── auth/             # Konfigurasi Auth.js
│   └── db.ts             # Inisialisasi Prisma Client
├── stores/               # Global state management (Zustand)
├── types/                # Definisi tipe TypeScript & skema Zod
└── utils/                # Fungsi-fungsi utility umum (formatter, dll.)
```

---

## 🤝 Kontribusi

Kontribusi, isu, dan permintaan fitur sangat diterima! Jangan ragu untuk membuka _issue_ baru untuk mendiskusikan perubahan yang ingin Anda buat.

## 📜 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.

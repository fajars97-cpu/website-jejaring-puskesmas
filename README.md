# Website Jejaring Puskesmas Jagakarsa

Portal direktori fasilitas kesehatan, peta jejaring, perizinan, pengajuan/perpanjangan MoU, dan administrasi akun.

## Pengembangan lokal

Gunakan Node.js 22.12+ dan npm.

1. Jalankan npm ci.
2. Salin .env.example ke .env dan isi konfigurasi publik Supabase, Mapbox, serta Cloudinary.
3. Jalankan npm run dev.

Perintah pemeriksaan:

- npm test: regresi pagination, URL pemulihan, dan fungsi SQL pencabutan sesi (Postgres lokal dalam memori/PGlite).
- npm run lint: ESLint dan aturan runtime React Hooks. React Compiler belum diaktifkan.
- npm run build: build produksi ke dist/.
- npm run preview: pratinjau build produksi.

## Struktur

- src/app: route dan pembatas akses; halaman dimuat secara lazy.
- src/context: sesi Supabase dan peran pengguna.
- src/pages: halaman publik, pemohon, dan admin.
- src/features/admin-jejaring: formulir, CRUD, unggah foto, dan ekspor Excel.
- src/lib: klien Supabase, repository jejaring, pagination, dan pemulihan akun.
- supabase/functions: endpoint administrasi akun.
- supabase/migrations: perubahan database tambahan.

Peran aplikasi: pemohon, admin, dan super_admin. Akses database tetap perlu kebijakan RLS di Supabase; guard React mengatur navigasi UI.

## Database dan logout paksa

Repository belum memuat skema awal database. Migrasi 20260911000100_admin_revoke_sessions.sql adalah tambahan untuk project yang sudah memiliki profiles (user_id, role) dan admin_audit_logs (actor_id, target_id, action, meta). Jangan menganggap repository ini dapat membangun ulang seluruh database dari kosong.

Terapkan migrasi tersebut pada project Supabase yang sesuai sebelum memperbarui Edge Function admin-force-logout. Jika project sudah ditautkan dan riwayat migrasinya cocok, gunakan supabase db push, lalu supabase functions deploy admin-force-logout. Jika database lama dikelola lewat SQL Editor, jalankan isi migrasi di sana sesuai proses deployment project.

Fungsi SQL hanya dapat dipanggil service_role, memeriksa super_admin, mencabut sesi target, dan menulis audit dalam transaksi yang sama. Refresh token ikut dihapus melalui foreign key auth.sessions. JWT yang sudah diterbitkan tetap dapat berlaku sampai kedaluwarsa; pencabutan sesi tidak menjamin browser langsung tertutup. Rujukan: https://supabase.com/docs/guides/auth/sessions

## Reset password

1. Set secret APP_URL pada Edge Function ke URL dasar aplikasi, termasuk subdirektori dan garis miring terakhir. Contoh: https://USERNAME.github.io/website-jejaring-puskesmas/.
2. Di Supabase Authentication > URL Configuration, izinkan URL redirect lengkap: https://USERNAME.github.io/website-jejaring-puskesmas/?recovery=1. Untuk lokal: http://localhost:5173/?recovery=1.
3. Deploy fungsi: supabase functions deploy admin-send-reset.
4. Uji dengan akun uji: kirim tautan reset, buka email, isi password baru, lalu pastikan login menggunakan password baru berhasil. Pengiriman email memerlukan konfigurasi email Supabase.

Endpoint mengambil email dari Auth berdasarkan target_user_id. Callback memakai query recovery=1 agar fragmen URL tersedia untuk token Supabase; aplikasi memproses sesi terlebih dahulu lalu membuka #/reset-password. Rujukan: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Hosting

Vite memakai base /website-jejaring-puskesmas/ untuk build dan HashRouter untuk route. Workflow .github/workflows menggunakan GitHub Pages pada push ke main. Sesuaikan base di vite.config.js jika lokasi hosting berubah. Variabel VITE_* disisipkan saat build; gunakan nilai publik, bukan service-role key. Pastikan lingkungan CI menyediakan variabel yang sama.

Daftar dan opsi filter diambil bertahap dengan urutan id; ekspor berhenti saat respons kosong meskipun jumlah awal lebih besar. Pengambilan beberapa halaman bukan snapshot transaksi: perubahan data selama proses dapat memengaruhi hasil.

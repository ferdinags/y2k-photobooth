# Product Requirements Document (PRD)
## PIXEL POP — Y2K Scrapbook Photobooth

**Versi:** 1.0  
**Status:** Draft untuk validasi dan implementasi  
**Tanggal:** 23 Oktober 2026  
**Jenis produk:** Web application  
**Tujuan dokumen:** Merangkum hasil brainstorming produk, UX, scope MVP, acceptance criteria, dan backlog.

---

## 1. Ringkasan Produk

PIXEL POP adalah web photobooth publik yang memungkinkan pengguna mengambil foto melalui webcam atau mengunggah foto yang sudah ada, lalu mengubahnya menjadi photostrip personal dengan gaya visual Y2K scrapbook. Pengguna dapat memilih layout, menerapkan filter, menambahkan stiker dan teks, melakukan retake, lalu mengunduh hasil akhir sebagai PNG tanpa membuat akun.

**Core experience:** Capture → Create → Export.

**Prinsip produk:** Interface boleh ekspresif dan dekoratif, tetapi alur utama harus mudah dipahami. Desktop menjadi pengalaman editing utama; HP tetap harus mendukung seluruh alur inti.

Nama **PIXEL POP** masih merupakan nama kerja dan belum final.

## 2. Tujuan Produk

1. Menyediakan pengalaman photobooth yang menyenangkan, personal, dan mudah digunakan.
2. Menghasilkan photostrip bergaya Y2K scrapbook yang layak dibagikan secara digital.
3. Menyatukan alur webcam dan upload dalam editor yang sama.
4. Menyediakan pengalaman dari awal sampai download tanpa login.
5. Menjadi proyek portfolio yang menunjukkan product thinking, UI/UX, pemrosesan media, pengelolaan state, dan QA.

### Indikator keberhasilan awal

- Dalam pengujian awal dengan minimal 5 pengguna, setidaknya 4 orang dapat menyelesaikan satu sesi tanpa bantuan.
- Pengguna dapat menyelesaikan alur capture/upload, edit, dan download di laptop serta HP.
- File ekspor memuat foto, filter, layout, frame, teks, dan stiker sesuai preview.
- Tidak ada upload foto ke server secara otomatis dalam alur normal MVP.
- Kegagalan kamera atau ekspor tidak menyebabkan aplikasi macet atau menghapus desain tanpa sengaja.

Angka di atas adalah target validasi awal, bukan standar industri.

## 3. Target Pengguna

Pengguna kasual yang ingin membuat kenangan visual bersama teman atau pasangan, mendekorasi foto, dan membagikan hasilnya tanpa harus membuat akun atau memasang aplikasi.

## 4. Identitas Visual dan Branding

### Arah visual

- Tema utama: Y2K scrapbook / retro digital.
- Palet eksplorasi: pink pastel, baby blue, putih, silver/chrome.
- Elemen visual: glossy buttons, bintang, hati, smiley, bunga, sparkles, doodle, dan tekstur scrapbook.
- Tipografi: ekspresif untuk headline, tetap mudah dibaca untuk kontrol dan instruksi.
- UI harus memiliki karakter visual kuat tanpa mengorbankan hierarki informasi dan keterbacaan.

### Nama kerja

- PIXEL POP — pilihan sementara.
- Alternatif brainstorm: CLICK CLUB, MYSPACE STUDIO, FLASHBACK.exe, gloss.jpg.

Nama final perlu diperiksa ketersediaan dan kesesuaiannya sebelum publikasi.

## 5. Scope MVP

### Fitur yang termasuk

1. Landing page dan CTA untuk memulai.
2. Pilihan sumber foto: webcam atau upload.
3. Pengambilan empat foto berurutan dengan countdown 3–2–1.
4. Upload maksimal empat foto, dengan validasi format/ukuran dan pengaturan urutan.
5. Retake satu foto atau seluruh sesi.
6. Tiga layout awal:
   - 4-frame vertical strip.
   - 2×2 collage.
   - 3-frame mini strip.
7. Empat preset filter awal:
   - Original.
   - Soft Pink.
   - Cool Blue.
   - Vintage Flash.
8. Sticker tray awal sekitar 12–20 stiker.
9. Penambahan dan pengeditan teks.
10. Pengaturan posisi, ukuran, dan rotasi stiker; hapus elemen; pengaturan layer dasar.
11. Undo, redo, dan reset desain.
12. Preview hasil akhir dan ekspor PNG.
13. UI responsif untuk laptop, desktop, tablet, dan HP.
14. Error handling untuk izin kamera, kamera terputus, file tidak valid, dan ekspor gagal.
15. Informasi privasi yang jelas.

### Tidak termasuk MVP

- Login dan profil pengguna.
- Database atau cloud gallery foto.
- Shareable session link dan QR code.
- AI background removal.
- Filter video atau animasi video.
- Kolaborasi multi-user.
- Marketplace template atau monetisasi.
- Aplikasi native.
- Sinkronisasi antardevice dan penyimpanan otomatis antarsesi.

## 6. User Flow

### Alur utama

1. Pengguna membuka landing page.
2. Pengguna menekan **Start Creating**.
3. Pengguna memilih **Use Camera** atau **Upload Photos**.
4. Webcam: pengguna memberi izin, melihat preview, menjalankan countdown, lalu mengambil empat foto. Upload: pengguna memilih hingga empat foto dan mengatur urutannya.
5. Pengguna meninjau foto, melakukan retake atau mengganti foto jika perlu.
6. Pengguna masuk ke editor dengan empat slot foto yang sama untuk kedua metode input.
7. Pengguna memilih layout, filter, stiker, dan teks.
8. Pengguna melihat preview hasil akhir.
9. Pengguna mengunduh PNG, kembali mengedit, atau memulai sesi baru.

### Prinsip alur

- Webcam dan upload harus bermuara pada model sesi/editor yang sama.
- Izin kamera diminta setelah pengguna memilih webcam, bukan saat landing page dibuka.
- Jika izin ditolak atau kamera gagal, tampilkan penjelasan dan tawarkan upload.
- Foto yang sudah berhasil diambil tidak boleh hilang ketika kamera terputus.
- Memulai sesi baru membersihkan data sesi sebelumnya agar tidak tercampur.

## 7. Struktur Halaman

### 7.1 Home — `/`

- Logo dan navigasi sederhana.
- Hero headline dan preview photostrip.
- CTA **Start Creating**.
- Contoh hasil dan instruksi singkat.
- Penjelasan singkat bahwa pengguna tidak perlu membuat akun.

### 7.2 Studio — `/studio`

- Pilihan webcam atau upload.
- Live camera preview dan countdown.
- Empat slot/thumbnail foto.
- Retake satu foto atau seluruh sesi.
- Penggantian dan pengurutan foto.
- Status izin kamera dan pesan error yang jelas.

### 7.3 Editor — `/editor`

- Top bar: kembali, nama desain, undo/redo, reset, download.
- Tool rail: layout, filter, sticker, text, frame.
- Canvas photostrip di area utama.
- Properties panel yang berubah mengikuti tool aktif.
- Photo tray berisi empat foto sumber dan opsi mengganti/retake.

### 7.4 Result

- Preview final.
- Tombol **Download PNG**.
- Tombol **Edit Again**.
- Tombol **Start New Session**.

Result dapat berupa modal/panel, bukan harus route terpisah.

## 8. Spesifikasi UX Editor

### Desktop

- Canvas besar di tengah.
- Tool rail di kiri.
- Properties panel di kanan.
- Photo tray di bawah.
- Top bar berisi kontrol sesi dan ekspor.

### HP

- Canvas tetap menjadi fokus utama.
- Tools berada di toolbar bawah.
- Properties ditampilkan melalui bottom sheet atau panel yang sesuai layar.
- Satu panel aktif pada satu waktu untuk menjaga ruang canvas.
- Interaksi sentuh harus mendukung pemindahan dan manipulasi elemen.
- Semua langkah inti, termasuk capture/upload, editing, dan download, tetap dapat diselesaikan.

### Perilaku editor

- Stiker dapat ditambahkan, dipilih, dipindahkan, diubah ukuran, dirotasi, dan dihapus.
- Elemen terpilih menampilkan bounding box dan kontrol yang sesuai.
- Teks dapat ditambahkan, diedit, dan diposisikan.
- Filter dapat diterapkan per foto atau ke semua foto.
- Foto asli harus tetap tersedia agar filter tidak diterapkan berulang pada gambar yang sudah terfilter.
- Layout dapat diganti tanpa mengambil foto ulang.
- Posisi elemen disimpan dalam koordinat relatif terhadap canvas agar komposisi tetap konsisten saat ukuran layar berubah.
- Undo/redo mengembalikan perubahan sesuai urutan.
- Reset meminta konfirmasi sebelum menghapus dekorasi atau mengembalikan desain ke keadaan awal.
- Export harus merender komposisi final pada dimensi yang ditentukan, bukan mengambil screenshot UI editor.

## 9. Aturan Foto, State, dan Privasi

- Satu sesi berisi empat slot foto untuk alur utama.
- Upload mendukung maksimal empat foto pada MVP.
- Format file yang didukung dan batas ukuran harus ditentukan saat implementasi; file tidak valid harus ditolak dengan pesan yang membantu.
- Foto, pengaturan filter, layout, teks, dan dekorasi harus dikelola terpisah agar bisa diedit tanpa merusak sumber foto.
- Dalam alur normal MVP, pemrosesan foto dilakukan secara lokal di browser dan foto tidak dikirim ke server secara otomatis.
- Pengguna perlu diberi tahu bahwa webcam membutuhkan izin browser.
- Data sesi bersifat sementara; jangan menjanjikan penyimpanan lintas sesi atau perangkat.
- Jika diperlukan telemetry/analytics, hindari mengumpulkan gambar atau data pribadi yang tidak diperlukan dan jelaskan penggunaannya.

## 10. Ekspor

- Format default: PNG.
- Ekspor harus mencakup semua foto, filter, layout, frame, teks, dan stiker.
- Ukuran ekspor menggunakan dimensi tetap yang cukup untuk berbagi digital dan cetak sederhana; dimensi final ditentukan saat desain teknis.
- Nama file contoh: `pixel-pop-20261023.png`.
- Tampilkan status proses jika render memerlukan waktu.
- Jika ekspor gagal, pertahankan desain aktif dan sediakan opsi mencoba lagi.
- Preview dan file hasil ekspor harus konsisten secara visual.

## 11. Acceptance Criteria

### Landing dan sesi

- **AC-01:** Pengguna dapat memulai sesi tanpa akun; CTA membuka pilihan sumber foto.
- **AC-02:** Sesi baru tidak membawa foto dari sesi sebelumnya.

### Kamera dan upload

- **AC-03:** Pengguna dapat mengambil empat foto melalui webcam dan keempat slot terisi setelah pengambilan berhasil.
- **AC-04:** Countdown berlangsung sebelum pengambilan otomatis.
- **AC-05:** Pengguna dapat retake satu foto atau seluruh sesi; foto lain tetap dipertahankan saat retake satu frame.
- **AC-06:** Pengguna dapat mengunggah maksimal empat foto; format/file tidak didukung ditolak dengan pesan jelas.
- **AC-07:** Penolakan izin atau kegagalan kamera tidak membuat aplikasi macet dan pengguna mendapat opsi upload.

### Editor

- **AC-08:** Tiga layout dapat dipilih dan foto tetap terhubung ke slot yang benar.
- **AC-09:** Empat preset filter tersedia; preview diperbarui dan foto asli tetap dipertahankan.
- **AC-10:** Stiker dapat dipindahkan, dirotasi, diubah ukuran, dan dihapus; perubahan masuk ke ekspor.
- **AC-11:** Teks dapat ditambahkan dan diedit; isi, posisi, dan gaya masuk ke ekspor.
- **AC-12:** Undo/redo memulihkan perubahan desain sesuai urutan.
- **AC-13:** Perubahan ukuran layar tidak merusak komposisi atau posisi relatif elemen.

### Ekspor dan kualitas

- **AC-14:** PNG final memuat semua elemen desain sesuai preview.
- **AC-15:** Kegagalan ekspor tidak menghapus desain dan pengguna dapat mencoba kembali.
- **AC-16:** Alur inti dapat diselesaikan di laptop dan HP.
- **AC-17:** Foto tidak dikirim ke server secara otomatis dalam alur normal MVP.

### Definition of Done

Sebuah fitur dianggap selesai ketika acceptance criteria terkait telah diverifikasi, alur normal dan gagal telah diuji, UI responsif, state preview dan ekspor konsisten, tidak ada kehilangan foto yang tidak disengaja, dan perubahan tidak merusak fitur yang sudah berjalan.

## 12. Backlog dan Estimasi

Estimasi awal untuk satu developer yang mengerjakan desain, implementasi, dan testing. Estimasi dapat berubah setelah prototipe editor diuji.

| ID | Task | Prioritas | Estimasi |
|---|---|---|---:|
| PP-01 | Finalisasi scope dan user flow | P0 | 0,5 hari |
| PP-02 | Wireframe dan design system Y2K | P0 | 1,5 hari |
| PP-03 | Landing page responsif | P0 | 1 hari |
| PP-04 | Manajemen sesi dan empat slot foto | P0 | 1 hari |
| PP-05 | Webcam dan countdown | P0 | 1,5 hari |
| PP-06 | Upload, validasi, dan penggantian foto | P0 | 1 hari |
| PP-07 | Canvas photostrip dan tiga layout | P0 | 2 hari |
| PP-08 | Empat preset filter | P0 | 1 hari |
| PP-09 | Sticker tray dan manipulasi elemen | P0 | 2 hari |
| PP-10 | Penambahan dan pengeditan teks | P1 | 1 hari |
| PP-11 | Undo, redo, dan reset | P1 | 1,5 hari |
| PP-12 | Render dan download PNG | P0 | 1,5 hari |
| PP-13 | Responsive editor desktop dan HP | P0 | 2 hari |
| PP-14 | Error handling dan privacy messaging | P0 | 0,5 hari |
| PP-15 | QA, perbaikan bug, dan deployment | P0 | 2 hari |

**Total estimasi kasar: 20 hari kerja**, sekitar empat minggu dengan pengerjaan konsisten. Penghematan waktu mungkin terjadi melalui pengerjaan bertahap, tetapi waktu QA tidak sebaiknya dihilangkan.

### Fase implementasi

1. **Phase 1 — Design & foundation (hari 1–3):** user flow, wireframe, design system, dan model sesi.
2. **Phase 2 — Capture flow (hari 4–7):** landing, webcam, countdown, upload, slot foto, retake.
3. **Phase 3 — Creative editor (hari 8–13):** canvas, layout, filter, stiker, teks, undo/redo.
4. **Phase 4 — Export & responsive (hari 14–17):** render PNG, optimasi HP, dan error handling.
5. **Phase 5 — QA & launch (hari 18–20):** acceptance testing, bug fixing, pemeriksaan privasi, dan deployment.

## 13. Risiko dan Mitigasi

| Risiko | Mitigasi |
|---|---|
| Izin webcam ditolak | Sediakan upload sebagai fallback dan pesan yang jelas |
| Kamera terputus | Pertahankan foto yang sudah diambil dan sediakan retry |
| File upload terlalu besar/tidak valid | Validasi format dan ukuran sebelum diproses |
| Editor terasa rumit | Tampilkan panel sesuai tool aktif dan utamakan hierarki UI |
| Komposisi rusak saat resize | Simpan posisi elemen relatif terhadap canvas |
| Hasil ekspor berbeda dari preview | Gunakan renderer final yang konsisten dan uji tiap elemen |
| Performa turun pada HP | Batasi jumlah foto/stiker, optimalkan ukuran gambar, dan uji perangkat nyata |
| Foto hilang saat error | Kelola state sesi dengan hati-hati dan jangan menghapus sumber foto saat proses gagal |
| Scope membesar | Tunda login, cloud gallery, AI, QR, dan fitur premium sampai MVP tervalidasi |

## 14. Keputusan yang Sudah Dibuat

- Nama kerja: PIXEL POP.
- Tujuan: project portfolio pribadi.
- Visual: Y2K scrapbook.
- Akses: publik tanpa login.
- Input: webcam dan upload.
- Kamera: countdown dan empat foto berurutan.
- Editor: desktop creative studio dengan canvas besar dan panel tools.
- Kebebasan desain: scrapbook bebas, berbasis template sebagai fondasi bila diperlukan.
- Fitur inti: filter, layout, download, stiker, retake; teks dan undo/redo termasuk peningkatan editor yang direncanakan.
- Target: laptop dan HP.
- Ekspor: PNG.
- Foto diproses lokal di browser pada alur normal MVP.
- Stack teknologi, library canvas, database, dan hosting **belum ditentukan**.

## 15. Keputusan yang Masih Terbuka

Sebelum menentukan stack, spesifikasi teknis perlu menjawab:

1. Ukuran canvas dan rasio ekspor final.
2. Apakah pengguna dapat memilih ukuran canvas selain photostrip.
3. Apakah stiker dapat diletakkan di area border di luar foto.
4. Apakah filter selalu per foto, global, atau keduanya.
5. Model data/state untuk elemen, layer, dan riwayat undo/redo.
6. Batas ukuran dan format upload.
7. Perilaku sesi saat refresh atau tab ditutup.
8. Dukungan browser dan perangkat minimum yang akan diuji.

Keputusan ini sebaiknya dibuat setelah prototipe UX editor, lalu digunakan untuk membandingkan opsi teknologi berdasarkan kebutuhan nyata—bukan berdasarkan popularitas framework.

---

**Dokumen ini adalah PRD draft v1.0.** Scope dan estimasi merupakan baseline awal dan dapat direvisi setelah wireframe diuji dengan pengguna serta risiko teknis editor divalidasi.

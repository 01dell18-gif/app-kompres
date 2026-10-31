# FJY Channel Kompres (Aplikasi Kompres PDF, Gabung PDF & Restorasi Foto Lokal)

<p align="center">
  <img src="public/logo.png" width="120" height="120" alt="FJY Channel Logo" style="border-radius: 50%;" />
</p>

Aplikasi web terpadu untuk **Kompresi PDF**, **Penggabungan Banyak PDF**, **Kompresi Citra Massal (Batch)**, dan **Restorasi Foto (Image Enhancement & Super Resolution)** yang **100% berjalan langsung di peramban (client-side) tanpa mengunggah berkas apa pun ke server**. Dioptimalkan untuk penggunaan desktop maupun **perangkat seluler (mobile)**.

---

## 🌟 4 Modul Unggulan

### 1. 📄 Modul Kompres PDF (Adaptasi & Peningkatan dari TepiLayar)

* **100% Client-Side Processing**: Memanfaatkan kombinasi `pdfjs-dist` dan `pdf-lib` langsung di memori browser.
* **Preset Kompresi Praktis**:
  * **Ekstrem / Maksimum**: Resolusi ~97 DPI, ideal untuk syarat ketat portal pendaftaran (<200 KB atau <500 KB). Teks pindaian KTP & ijazah tetap terbaca jelas.
  * **Seimbang (Rekomendasi)**: Resolusi ~126 DPI, teks stempel & angka sangat tajam dengan penghematan 50%–75%.
  * **Ringan / Kualitas Cetak**: Resolusi ~158 DPI studio, mempertahankan detail halus, siap dicetak fisik tanpa blur.
* **Target Batas Ukuran Otomatis**: Mendukung target batas instansi resmi (`< 200 KB`, `< 500 KB`, `< 1000 KB`).
* **Mode Skala Abu-Abu (Grayscale)**: Menghapus kanal warna untuk memangkas ukuran dokumen pindaian/ijazah berwarna hingga 40% tambahan.
* **Before / After Split-View Inspector**: Membandingkan ketajaman visual sebelum dan sesudah kompresi dengan slider interaktif.
* **Tindakan Terpadu (Chaining)**: Mengalirkan hasil kompresi langsung ke menu penggabungan dokumen tanpa unduh-unggah manual.

---

### 2. 📑 Modul Gabung PDF (PDF Merger)

* **Multi-Berkas Instan**: Menggabungkan 2 atau lebih berkas PDF menjadi 1 file terpadu secara langsung dalam memori biner.
* **Pratinjau Sampul Visual**: Merender thumbnail halaman pertama setiap dokumen secara otomatis.
* **Penataan Urutan Fleksibel**: Tombol navigasi urutan naik/turun (`Move Up` / `Move Down`) responsif di desktop & ponsel.
* **Kustomisasi Nama File**: Menentukan nama berkas luaran (contoh: `Dokumen_Lampiran_CASN.pdf`).
* **Pintasan Alur Lanjutan ("Lanjut Kompres Hasil Gabungan")**: Jika hasil penggabungan melebihi batas kuota portal unggah, berkas dapat langsung diteruskan ke modul Kompres PDF dengan satu klik.

---

### 3. 🖼️ Modul Kompres Citra Massal (Batch Image Compressor)

* **Akselerasi Multi-Utas**: Memanfaatkan konkurensi hardware peramban (`navigator.hardwareConcurrency - 1`) untuk memproses puluhan foto secara paralel tanpa membekukan UI.
* **Fleksibilitas Format Luaran**: WebP (modern & hemat kapasitas), JPEG (standar pendaftaran resmi CASN/BUMN), dan PNG (lossless).
* **Pembatasan Dimensi (Dimension Clamping)**: Pilihan resolusi Full HD (1920px), HD (1280px), atau Pasfoto (800px).
* **Penggeser Kualitas Responsif**: Kendali kualitas 10%–100% (bawaan 75%).
* **Unduh Semua Sekaligus (.ZIP)**: Seluruh foto yang berhasil dikompresi dapat diunduh dalam satu arsip ZIP tunggal via `JSZip`.

---

### 4. ✨ Modul Restorasi Foto (Image Enhancement & Super Resolution)

* **Image Enhancement**: Peningkatan visual otomatis untuk ketajaman, kontras, saturasi, dan pencahayaan (Auto-Enhance).
* **AI Image Upscaler / Super Resolution**: Pembesaran resolusi 2x dan 4x dengan sintesis detail tepi agar gambar tidak pecah saat dicetak.
* **De-blur / Menjernihkan Foto Buram**: Filter unsharp masking untuk memulihkan detail tepi dan teks buram akibat pergerakan kamera.
* **Denoise / Pengurangan Bintik Noise**: Menghilangkan bintik kasar (grain) pada foto pencahayaan rendah tanpa menghilangkan garis kontur objek.
* **Photo Restoration (Pemulihan Foto Lama)**: Dynamic range stretch & auto-level untuk memperbaiki foto jadul yang pudar atau menguning.
* **Color Correction & Grading**: Penyesuaian suhu warna (hangat/dingin), vibrance, dan keseimbangan tone.
* **Pratinjau Split-View Real-Time**: Geser garis pemisah sebelum/sesudah secara interaktif dengan dukungan sentuhan jari pada layar ponsel.

---

### 5. 🌓 Fitur Tema Terang & Gelap (Light / Dark Mode) & Mode Ponsel

* **Pilihan Tema Fleksibel**: Tombol toggle instan (Matahari / Bulan) di bilah navigasi atas untuk berpindah antara tampilan tema Gelap (*Dark Mode*) dan Terang (*Light Mode*).
* **Penyimpanan Preferensi Lokal**: Pilihan tema pengguna disimpan di `localStorage` peramban sehingga otomatis aktif saat aplikasi dibuka kembali.
* **100% Responsif & Mobile-Friendly**: Antarmuka dioptimalkan secara mendalam untuk perangkat Android, iOS, tablet, maupun layar desktop, dengan tombol sentuh berukuran proporsional, grid adaptif 2x2, dan geseran sentuh (*touch gestures*).

---

## 🔒 Privasi & Keamanan Data (Zero Egress)

* **Nol Upload Peladen (0 KB)**: Dokumen sensitif seperti KTP, Kartu Keluarga, SKCK, Transkrip Nilai, dan Ijazah **tidak pernah meninggalkan perangkat Anda**.
* **Manajemen Memori Bersih**: Objek URL Blob dibersihkan secara sistematis melalui `URL.revokeObjectURL()` guna mencegah kebocoran RAM.
* **Dukungan Luring Penuh (Offline Ready)**: Memuat worker PDF lokal (`/pdf.worker.min.js`) dan Service Worker cache sehingga aplikasi tetap dapat digunakan tanpa koneksi internet.

---

## 🚀 Cara Menjalankan Proyek

### Cara Paling Praktis (Khusus Pengguna Windows)

Cukup **klik ganda (double-click)** pada berkas:
👉 **`jalankan.bat`** (atau **`start.bat`**)

Skrip ini akan secara otomatis:

1. Memeriksa keberadaan Node.js di komputer.
2. Memasang dependensi (`npm install`) secara otomatis jika belum ada.
3. Menjalankan server aplikasi lokal dengan mode `--host` (dapat diakses juga dari perangkat lain/HP dalam satu jaringan Wi-Fi).
4. Membuka peramban secara otomatis ke alamat `http://localhost:5173/`.

---

### Cara Manual via Terminal / Command Prompt

```bash
# 1. Pasang dependensi jika baru mengunduh proyek
cmd /c npm install

# 2. Jalankan mode pengembangan
cmd /c npm run dev
```

---

## 🛠️ Arsitektur Teknologi

* **Frontend**: React 18, TypeScript, Tailwind CSS
* **Manipulasi Dokumen PDF**: `pdf-lib` (v1.17.1)
* **Rendering & Rasterisasi Halaman**: `pdfjs-dist` (v3.11.174) dengan worker lokal mandiri
* **Restorasi Citra & Super Resolution**: Algoritma Canvas 2D Digital Signal Processing (Unsharp Masking, Bilateral Denoise, Dynamic Range Stretch, Lanczos/Bicubic Resampling)
* **Arsip ZIP**: `JSZip` (v3.10.1)
* **Ikonografi**: `lucide-react`
* **Bundler & Build Tool**: Vite 5

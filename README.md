# FJY Channel Kompres (Aplikasi Kompres PDF, Gabung PDF & Kompres Foto Lokal)

<p align="center">
  <img src="public/logo.png" width="120" height="120" alt="FJY Channel Logo" style="border-radius: 50%;" />
</p>

Aplikasi web terpadu untuk **Kompresi PDF**, **Penggabungan Banyak PDF**, dan **Kompresi Citra Massal (Batch)** yang **100% berjalan langsung di peramban (client-side) tanpa mengunggah berkas apa pun ke server**. Dioptimalkan untuk penggunaan desktop maupun **perangkat seluler (mobile)**.

---

## 🌟 Fitur Utama

### 1. 📄 Modul Kompres PDF (Adaptasi & Peningkatan dari TepiLayar)
* **100% Client-Side Processing**: Memanfaatkan kombinasi `pdfjs-dist` dan `pdf-lib` langsung di memori browser.
* **Preset Kompresi Praktis**:
  * **Ekstrem / Maksimum**: Resolusi ~72 DPI (Skala 0.95, Kualitas 42%), ideal untuk syarat ketat portal pendaftaran (<200 KB atau <500 KB).
  * **Seimbang (Rekomendasi)**: Resolusi ~150 DPI (Skala 1.3, Kualitas 63%), teks tetap tajam dengan penghematan 50%–80%.
  * **Ringan / Kualitas Cetak**: Resolusi ~300 DPI (Skala 1.7, Kualitas 82%), mempertahankan detail cetak tinggi.
* **Target Batas Ukuran Otomatis**: Mendukung target batas instansi resmi (`< 200 KB`, `< 500 KB`, `< 1000 KB`).
* **Mode Skala Abu-Abu (Grayscale)**: Menghapus kanal warna untuk memangkas ukuran dokumen pindaian/ijazah berwarna hingga 40% tambahan.
* **Before / After Split-View Inspector**: Fitur interaktif untuk membandingkan ketajaman visual sebelum dan sesudah kompresi dengan slider geser.
* **Tindakan Terpadu (Chaining)**: Kemudahan mengirimkan hasil kompresi langsung ke menu penggabungan dokumen tanpa repot unduh-unggah ulang.

---

### 2. 📑 Modul Gabung PDF (PDF Merger)
* **Multi-Berkas Instan**: Menggabungkan 2 atau lebih berkas PDF menjadi 1 file terpadu secara langsung dalam memori biner.
* **Pratinjau Sampul Visual**: Merender thumbnail halaman pertama setiap dokumen secara otomatis.
* **Penataan Urutan Fleksibel**: Tombol navigasi urutan naik/turun (`Move Up` / `Move Down`) yang akurat dan responsif di perangkat desktop maupun ponsel.
* **Kustomisasi Nama File**: Menentukan nama berkas luaran (contoh: `Dokumen_Lampiran_CASN.pdf`).
* **Pintasan Alur Lanjutan ("Lanjut Kompres Hasil Gabungan")**: Jika hasil penggabungan melebihi batas kuota portal unggah, berkas dapat langsung diteruskan ke modul Kompres PDF dengan satu klik.

---

### 3. 🖼️ Modul Kompres Citra Massal (Batch Image Compressor)
* **Akselerasi Multi-Utas**: Memanfaatkan konkurensi hardware peramban (`navigator.hardwareConcurrency - 1`) untuk memproses puluhan foto secara paralel tanpa membuat antarmuka membeku.
* **Fleksibilitas Format Luaran**:
  * **WebP**: Kompresi efisiensi tinggi untuk web modern & media sosial.
  * **JPEG**: Standar dokumen resmi dan portal pendaftaran instansi.
  * **PNG**: Lossless dan mendukung transparansi.
* **Pembatasan Dimensi (Dimension Clamping)**: Pilihan resolusi Full HD (1920px), HD (1280px), atau Pasfoto (800px) dengan preservasi rasio aspek tanpa pembesaran artifisial.
* **Penggeser Kualitas Responsif**: Kendali kualitas 10%–100% (bawaan 75%).
* **Split-View Visual Comparison**: Inspeksi piksel foto sebelum dan sesudah kompresi.
* **Unduh Semua Sekaligus (.ZIP)**: Seluruh foto yang berhasil dikompresi dapat diunduh dalam satu arsip ZIP tunggal via `JSZip`.

---

## 🔒 Privasi & Keamanan Data (Zero Egress)
* **Nol Upload Peladen (0 KB)**: Dokumen sensitif seperti KTP, Kartu Keluarga, SKCK, Transkrip Nilai, dan Ijazah **tidak pernah meninggalkan perangkat Anda**.
* **Manajemen Memori Bersih**: Objek URL Blob dibersihkan secara sistematis melalui `URL.revokeObjectURL()` guna mencegah kebocoran RAM.
* **Dukungan Luring Penuh (Offline Ready)**: Memuat worker PDF lokal (`/pdf.worker.min.js`) dan Service Worker cache sehingga aplikasi tetap dapat digunakan tanpa koneksi internet.

---

## 🚀 Cara Menjalankan Proyek

### Cara Paling Praktis (Khusus Pengguna Windows):
Cukup **klik ganda (double-click)** pada berkas:
👉 **`jalankan.bat`** (atau **`start.bat`**)

Skrip ini akan secara otomatis:
1. Memeriksa keberadaan Node.js di komputer.
2. Memasang dependensi (`npm install`) secara otomatis jika belum ada.
3. Menjalankan server aplikasi lokal dengan mode `--host` (dapat diakses juga dari perangkat lain/HP dalam satu jaringan Wi-Fi).
4. Membuka peramban secara otomatis ke alamat `http://localhost:5173/`.

---

### Cara Manual via Terminal / Command Prompt:
```bash
# 1. Pasang dependensi jika baru mengunduh proyek
cmd /c npm install

# 2. Jalankan mode pengembangan
cmd /c npm run dev
```

### 2. Membangun Proyek untuk Produksi (Build):
```bash
cmd /c npm run build
```
Hasil kompilasi siap disajikan dari folder `dist/`.

### 3. Menjalankan Pratinjau Hasil Build (Preview Mode):
```bash
cmd /c npm run preview
```
Buka browser pada alamat `http://localhost:4173/`.

---

## 🛠️ Arsitektur Teknologi
* **Frontend**: React 18, TypeScript, Tailwind CSS
* **Manipulasi Dokumen PDF**: `pdf-lib` (v1.17.1)
* **Rendering & Rasterisasi Halaman**: `pdfjs-dist` (v3.11.174) dengan worker lokal mandiri
* **Arsip ZIP**: `JSZip` (v3.10.1)
* **Ikonografi**: `lucide-react`
* **Bundler & Build Tool**: Vite 5


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
* **Kualitas Resolusi DPI Kustom**: Slider & pilihan instan (72 DPI Layar, 96 DPI Kantor, 150 DPI Standar CASN, 200 DPI Sangat Jernih, 300 DPI Studio Cetak Fisik).
* **Target Batas Ukuran Fleksibel (Bisa Diketik Permintaan Size-nya)**: Pengguna dapat langsung mengetik angka target ukuran dokumen yang diinginkan dalam satuan KB atau MB (misal: 250 KB, 350 KB, 1.5 MB), disertai tombol pintas cepat instansi (<200 KB, <500 KB, 1 MB, 2 MB).
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
* **AI Image Upscaler / Super Resolution (Hingga 10x)**: Pembesaran resolusi 2x, 4x, 6x, 8x, hingga 10x (Maks. Baliho/Banner) dengan rekonstruksi detail cascading & unsharp masking agar gambar tetap tajam dan tidak pecah saat dicetak dalam format besar.
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

## 🚀 Cara Menjalankan Proyek di Komputer Lokal

### Cara Praktis & Otomatis (Cukup Klik Ganda):
Cukup **klik ganda (double-click)** pada berkas peluncur tunggal:
👉 **`jalankan.bat`**

Skrip cerdas ini dirancang khusus untuk mendeteksi perangkat baru secara otomatis:
1. **Instalasi Otomatis dari Folder `installers/`**:
   - Jika komputer baru belum terpasang Node.js, skrip akan **otomatis memasang Node.js LTS** dari berkas instalasi resmi di dalam folder `installers/node-v24.22.2-x64.msi` tanpa perlu mencari atau mengunduh manual.
   - Jika berkas installer belum ada, skrip akan otomatis mengunduh installer resmi ke folder `installers/`.
2. **Server Mandiri 100% Offline (`server.js`)**:
   - Begitu terpasang, aplikasi langsung berjalan secara instan (*under 1 second*) menggunakan server lokal mandiri tanpa perlu menunggu unduhan `npm install`.
3. **Membuka Peramban Seketika**: Membuka browser bawaan secara otomatis ke alamat: **`http://localhost:5173/`**.
4. **Dukungan Jaringan / Mode HP**: Menampilkan alamat IP lokal Wi-Fi sehingga aplikasi juga dapat diakses langsung dari layar smartphone atau tablet dalam satu jaringan Wi-Fi.
5. **Mematikan Server dengan Bersih (Ctrl + C)**:
   - Saat jendela ditutup atau pengguna menekan `Ctrl + C` (lalu `Y`), server langsung ditutup dan port 5173 dibebaskan sepenuhnya tanpa menyisakan proses di latar belakang.

---

### Cara Manual via Terminal / Command Prompt:
```bash
# 1. Pasang dependensi jika baru mengunduh proyek
cmd /c npm install

# 2. Jalankan mode pengembangan
cmd /c npm run dev -- --host
```

---

## 🌐 Panduan Mengunggah ke Hosting / Domain Pribadi

Aplikasi ini telah dirancang dengan arsitektur **Relative Base (`base: './'`)** dan **Zero Egress**, sehingga dapat diunggah ke domain apa pun, baik domain utama (`https://domainanda.com`), subdomain (`https://alat.domainanda.com`), maupun sub-direktori folder (`https://domainanda.com/app-kompres/`).

### 1. Kompilasi Berkas Produksi
Jalankan perintah build di terminal:
```bash
cmd /c npm run build
```
Hasil kompilasi siap saji akan dibuat di dalam folder **`dist/`**.

### 2. Opsi Pengunggahan ke Berbagai Layanan Hosting:

* **cPanel / DirectAdmin / Shared Hosting (Apache / LiteSpeed)**:
  * Unggah seluruh isi file dan folder yang ada di dalam direktori `dist/` ke direktori `public_html/` (atau folder sub-direktori pilihan Anda).
  * Berkas `.htaccess` sudah disediakan secara otomatis di dalam `dist/` untuk menangani routing SPA, MIME types modern (`.js`, `.wasm`, `.webp`), dan kompresi Gzip.

* **Vercel**:
  * Hubungkan repositori GitHub Anda ke dashboard Vercel.
  * Berkas konfigurasi `vercel.json` sudah tersedia di repositori sehingga deployment langsung berjalan otomatis (*1-Click Deploy*).

* **Netlify**:
  * Hubungkan repositori GitHub ke Netlify atau seret folder `dist/` ke Netlify Drop.
  * Berkas konfigurasi `netlify.toml` sudah tersedia dengan aturan redirect SPA otomatis.

* **Nginx (VPS / Cloud Server)**:
  * Arahkan direktori root Nginx ke folder `dist` dan tambahkan blok routing SPA:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
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

---

## 📌 Repositori Resmi & Lisensi

- **Repositori GitHub**: [https://github.com/01dell18-gif/app-kompres.git](https://github.com/01dell18-gif/app-kompres.git)
- **Pengembang / Channel**: **FJY Channel**
- **Privasi**: 100% Client-Side Processing (0 KB Egress / Tidak ada data yang diunggah ke internet).


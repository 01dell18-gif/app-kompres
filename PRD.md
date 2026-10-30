Dokumen Kebutuhan Produk (PRD): Sistem Aplikasi Web FJY Channel Kompres (Kompresi Dokumen, Penggabungan PDF, Kompresi Citra Massal, dan Restorasi Foto Berbasis Klien)
Landasan Konseptual dan Arsitektur Rekayasa Perangkat Lunak
Kebutuhan optimalisasi berkas digital berkembang pesat seiring dengan pengetatan regulasi ukuran berkas unggahan pada portal layanan publik, sistem rekrutmen pegawai, dan platform manajemen dokumen institusional1. Layanan manipulasi berkas generasi awal umumnya mengadopsi model pemrosesan terpusat pada peladen (server-side processing), di mana berkas pengguna diunggah secara penuh melintasi jaringan internet, dimanipulasi oleh utilitas sistem operasi peladen, lalu diunduh kembali oleh peramban pengguna4. Paradigma komputasi terpusat ini menghadirkan beban biaya transmisi data (bandwidth egress) yang eksponensial, kerentanan latensi jaringan, antrean antarmuka pada jam sibuk, serta risiko pelanggaran privasi data identitas sensitif seperti KTP, ijazah, dan dokumen finansial3.
Mengacu pada kesederhanaan utilitas fungsional seperti yang ditampilkan pada layanan utilitas TepiLayar8, aplikasi web ini dirancang dengan pendekatan arsitektur eksekusi lokal pada peramban (client-side execution)4. Pendekatan ini mengeliminasi kebutuhan peladen perantara untuk pemrosesan konten dengan memanfaatkan teknologi WebAssembly (WASM) untuk kompresi PDF, pustaka manipulasi biner JavaScript murni (pdf-lib) untuk penggabungan dokumen PDF, serta kombinasi OffscreenCanvas dan pustaka pengodean citra modern untuk kompresi foto massal10.
Penerapan arsitektur komputasi di sisi klien menghasilkan efisiensi biaya infrastruktur peladen hingga mendekati nol, memungkinkan platform beroperasi secara berkelanjutan tanpa batasan kuota pemrosesan pengguna5. Dari sudut pandang tata kelola data, ketiadaan transmisi berkas ke infrastruktur eksternal secara intrinsik memenuhi prinsip privasi sejak perancangan (privacy-by-design), sehingga risiko kebocoran data dokumen resmi sepenuhnya termitigasi5.

Parameter Arsitektur
Pemrosesan Peladen Tradisional
Pemrosesan Klien Berbasis WebAssembly/Worker
Lokasi Eksekusi Komputasi
Peladen Cloud / Virtual Machine4
Memori Peramban Lokal Klien (Sandbox)4
Konsumsi Bandwidth Jaringan
Dua arah penuh (Unggah berkas + Unduh hasil)4
Sekali unduh untuk modul statis (JS & WASM)5
Kerahasiaan Dokumen
Berkas singgah sementara pada disk/RAM peladen5
Berkas tidak pernah meninggalkan perangkat lokal5
Dukungan Operasi Nirnet
Membutuhkan koneksi internet aktif secara konstan18
Mendukung operasi luring via Service Worker dan Cache API1
Skalabilitas Biaya Operasional
Linier terhadap volume pengguna aktif11
Statis (biaya hosting aset statis/CDN minimal)11
Bottleneck Performa
Kecepatan unggah internet dan antrean antarmuka peladen4
Kapasitas CPU dan RAM pada perangkat klien1

Analisis Kebutuhan Pengguna dan Skenario Operasional Dokumen
Perancangan fungsionalitas sistem didasarkan pada penelusuran friksi administratif yang dialami oleh berbagai kelompok pengguna di lingkungan operasional nyata.
Kelompok pengguna pertama terkonsentrasi pada pelamar seleksi administrasi, seperti CASN, BUMN, dan beasiswa pendidikan, yang diwajibkan mengunggah pindaian berkas KTP, surat lamaran, transkrip nilai, dan pasfoto dalam batas kapasitas kaku, umumnya berpatokan pada ambang batas 200 KB, 500 KB, atau 1.000 KB3. Selain itu, seleksi administrasi kerap mewajibkan beberapa dokumen lampiran (seperti ijazah asli, transkrip nilai, sertifikat akreditasi, dan sertifikat kompetensi) disatukan menjadi satu dokumen PDF tunggal sebelum diunggah22. Kelompok ini memerlukan fitur penargetan ukuran luaran yang pasti serta fitur penggabungan berkas instan tanpa merusak keterbacaan data numerik maupun stempel legalitas1.
Kelompok pengguna kedua mencakup tenaga pendidik, administrator sekolah, dan staf perkantoran yang menangani arsip dokumen digital secara berkala8. Karakteristik operasional kelompok ini didominasi oleh penanganan berkas buku modul, laporan kegiatan, dan bundel formulir yang membengkak hingga puluhan megabita akibat penyisipan gambar kamera resolusi tinggi ke dalam dokumen PDF, serta kebutuhan mengolaborasikan beberapa laporan bab terpisah menjadi satu dokumen arsip terpadu1.
Kelompok pengguna ketiga melibatkan fotografer, pengelola katalog e-commerce, dan kreator konten web yang rutin menghadapi tumpukan ratusan foto mentah berukuran besar19. Kebutuhan utama mereka adalah pemrosesan citra massal simultan dengan kecepatan tinggi untuk mempercepat alur kerja pengiriman bukti kerja atau pengunggahan aset ke situs web12.
Kebutuhan umum yang melintasi seluruh kelompok pengguna berakar dari ketatnya gerbang unggah portal instansi penerima berkas3. Pindaian dokumen beresolusi 300 hingga 600 DPI sering kali menghasilkan berkas PDF berukuran antara 3 MB hingga 8 MB. Pengguna membutuhkan konversi terarah yang menurunkan kerapatan piksel citra tertanam (embedded images) ke batas toleransi keterbacaan (72 hingga 150 DPI) tanpa merusak vektor karakter tulisan5. Pada skenario citra, pengguna sering kali mengunggah berkas terkompresi dalam jumlah puluhan secara bertahap, sehingga penggabungan otomatis seluruh luaran ke dalam satu arsip terkompresi ZIP menjadi titik efisiensi kerja yang mutlak19.

Tipologi Pengguna
Karakteristik Berkas Input
Kebutuhan Solusi Fungsional
Batasan Teknis Kritis
Pelamar CASN / BUMN
Pindaian ijazah, KTP, berkas lampiran, dan pasfoto tunggal3
Penargetan ukuran berkas instan (<200 KB, <500 KB) dan penggabungan banyak PDF lampiran menjadi satu berkas20
Keterbacaan teks dan angka tanda pengenal tidak boleh kabur, urutan halaman harus akurat3
Staf Administrasi & Pendidik
Bundel dokumen laporan bab terpisah dan modul puluhan halaman9
Reduksi rasio tinggi dengan preset seimbang serta fusi beberapa bab PDF menjadi dokumen terpadu11
Integritas susunan halaman dan tautan dokumen tetap utuh29
Pengelola Web & Kreator
Puluhan hingga ratusan foto produk resolusi tinggi19
Kompresi massal multithread dan unduhan tunggal ZIP4
Waktu proses per berkas cepat dan UI tetap responsif4

Spesifikasi Rekayasa Fungsional Modul Kompresi Dokumen PDF
Modul kompresi PDF berfungsi mengecilkan ukuran fisik berkas dokumen tunggal maupun jamak dengan merestrukturisasi elemen tipografi, vektor, dan data raster citra yang tersimpan di dalam berkas28.
Pemrosesan dokumen mengandalkan pustaka Ghostscript yang dikompilasi ke format biner WebAssembly (gs.wasm), dijalankan di dalam lingkungan terisolasi Web Worker untuk mencegah pemblokiran utas utama antarmuka pengguna (main UI thread)5. Alur kerja internal dimulai saat berkas input biner dituliskan ke sistem berkas memori virtual Emscripten (MEMFS)7. Mesin kemudian mengeksekusi parameter pencetakan maya -sDEVICE=pdfwrite dengan versi kompatibilitas PDF 1.4 -dCompatibilityLevel=1.4 guna memastikan keterbukaan berkas pada pembaca dokumen generasi lama7. Optimalisasi dilakukan melalui kompresi aliran (stream recompression) berbasis algoritma Flate/Deflate tanpa mengubah instruksi karakter font dan vektor teks5. Setelah eksekusi tuntas, luaran dibaca dari MEMFS ke objek Blob memori lokal dan sistem segera membersihkan ruang alokasi virtual7.
Aplikasi menyediakan konfigurasi preset Ghostscript yang disesuaikan dengan kebutuhan pengguna non-teknis11:
Mode Kompresi Maksimum: Menerapkan parameter -dPDFSETTINGS=/screen yang menurunkan resolusi seluruh citra di dalam dokumen menjadi 72 DPI serta mengaplikasikan kuantisasi agresif untuk kebutuhan layar monitor dan ponsel11.
Mode Kompresi Seimbang (Bawaan): Menerapkan -dPDFSETTINGS=/ebook yang menahan kerapatan citra pada 150 DPI, menghasilkan keseimbangan optimal antara kejernihan diagram pindaian dan penurunan ukuran berkas antara 50% hingga 85%11.
Mode Kompresi Ringan: Menerapkan -dPDFSETTINGS=/printer dengan kerapatan citra 300 DPI untuk mempertahankan kualitas cetak fisik resolusi tinggi11.
Mode Skala Abu-abu (Grayscale): Menjalankan argumen -sColorConversionStrategy=Gray yang mengubah representasi warna kanal RGB menjadi 8-bit gray, memotong volume byte citra berwarna hingga 60% tambahan29.
Untuk mengakomodasi portal pendaftaran yang menetapkan batas ukuran berkas tertentu secara ketat, sistem menyediakan mode aproksimasi ukuran target (target size approximation)20. Mesin menjalankan evaluasi ukuran luaran awal; jika ukuran berkas hasil preset bawaan masih melampaui batas yang diinginkan pengguna, algoritma secara adaptif menyesuaikan nilai parameter -dColorImageResolution dan faktor kualitas JPEG internal Ghostscript hingga ukuran berkas berhasil ditekan tepat di bawah ambang batas yang ditargetkan24.

Konfigurasi Kompresi PDF
Parameter Inti Ghostscript WASM
Resolusi Citra Target
Karakteristik Luaran
Maksimum (Screen/Web)
-dPDFSETTINGS=/screen11
72 DPI11
Ukuran terkecil, teks tajam, citra terkompresi kuat5
Seimbang (Ebook - Bawaan)
-dPDFSETTINGS=/ebook29
150 DPI11
Keseimbangan visual optimal untuk dokumen arsip dan pindaian11
Ringan (Print Ready)
-dPDFSETTINGS=/printer11
300 DPI11
Penurunan ukuran moderat, siap cetak tanpa artefak visual11
Monokrom (Grayscale)
-sColorConversionStrategy=Gray29
Sesuai preset pilihan29
Menghapus kanal warna, mereduksi byte dokumen pindaian drastis29
Target Spesifik (<200/500 KB)
Resolusi adaptif via skrip pengatur4
Dinamis (72–150 DPI)29
Disesuaikan dengan batas sistem registrasi daring3

Spesifikasi Rekayasa Fungsional Modul Penggabungan Dokumen PDF (PDF Merger)
Modul penggabungan PDF (PDF Merger) dirancang untuk menyatukan dua atau lebih berkas dokumen PDF yang terpisah menjadi satu dokumen PDF berurutan secara terstruktur tanpa mengirim data dokumen ke peladen luar22.
Modul ini diimplementasikan menggunakan pustaka JavaScript murni berkinerja tinggi, yaitu pdf-lib14. pdf-lib beroperasi langsung di lingkungan peramban pada tingkat objek biner (ArrayBuffer dan Uint8Array) tanpa dependensi mesin Node.js terpisah14. Modul rendering pdfjs-dist digunakan secara berdampingan untuk merender representasi visual halaman pertama setiap dokumen sebagai thumbnail pratinjau di antarmuka pengguna16.
Alur komputasi penggabungan PDF berjalan sebagai berikut14:
Pemuatan Berkas Lokal: Pengguna memilih atau menyeret beberapa dokumen PDF. Masing-masing berkas dibaca ke memori peramban sebagai ArrayBuffer22.
Inisialisasi Dokumen Induk: Sistem menginisiasi instans dokumen baru kosong melalui pemanggilan const mergedPdf = await PDFDocument.create()14.
Iterasi dan Penyalinan Halaman: Berdasarkan urutan berkas yang ditentukan pengguna di antarmuka, sistem memuat setiap donor berkas (PDFDocument.load(fileBuffer)), menyalin seluruh indeks halaman dokumen tersebut menggunakan mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices()), kemudian menambahkan seluruh halaman salinan ke dalam dokumen baru menggunakan mergedPdf.addPage(page)14.
Penyimpanan dan Serialisasi: Dokumen akhir dikompilasi ke bentuk biner melalui pemanggilan await mergedPdf.save(), menghasilkan Uint8Array yang siap dikonversi ke objek Blob untuk diunduh langsung15.
Fitur penyusunan interaktif diintegrasikan menggunakan pustaka manipulasi gestur @dnd-kit/*16. Fitur ini memungkinkan pengguna menyeret (drag-and-drop) kartu dokumen secara bebas untuk menukar urutan penggabungan sebelum eksekusi dilakukan22. Pengguna juga dapat menghapus berkas yang keliru dimasukkan, melihat rincian jumlah halaman per berkas, serta menentukan nama berkas luaran akhir22.
Setelah proses penggabungan selesai, antarmuka menyediakan tombol pintas alur terpadu (chained action): "Kompres PDF Hasil Gabungan". Fitur ini langsung meneruskan berkas hasil penggabungan ke Modul Kompresi PDF tanpa meminta pengguna mengunduh dan mengunggah ulang berkas secara manual23.

Komponen Fungsional Merger
Pustaka / Teknologi Pendukung
Peran dan Tanggung Jawab Teknis
Manipulasi Struktur Dokumen
pdf-lib14
Pemuatan berkas, penyalinan referensi halaman, fusi struktur, dan serialisasi biner14.
Thumbnail & Page Count Preview
pdfjs-dist16
Rendering halaman sampul berkas masukan sebagai thumbnail pratinjau kanvas16.
Interaksi Susunan Berkas
@dnd-kit/core & @dnd-kit/sortable16
Menangani interaksi seret-dan-lepas kartu berkas secara mulus di antarmuka pengguna22.
Pengalihan Terpadu (Chaining)
In-memory Blob Transfer7
Mengalirkan berkas hasil merger langsung ke modul kompresor Ghostscript WASM11.

Spesifikasi Rekayasa Fungsional Modul Kompresi Citra Massal
Modul kompresi citra dirancang untuk menyelesaikan masalah kelambanan pemrosesan foto dalam jumlah banyak dengan memanfaatkan kemampuan perangkat keras klien secara maksimal4.
Guna menjaga kelancaran antarmuka pengguna selama pemrosesan banyak berkas berlangsung, sistem mengimplementasikan arsitektur Worker Pool paralel4. Sistem secara otomatis memeriksa ketersediaan inti prosesor logis perangkat melalui antarmuka peramban navigator.hardwareConcurrency4. Jumlah utas Web Worker yang dialokasikan ditentukan melalui persamaan matematis:

Formula tersebut menjamin tersedianya satu utas prosesor bebas yang bertugas menangani rendering antarmuka pengguna pada 60 frame per detik dan mencegah terjadinya browser freezing4. Manajer antrean (Queue Manager) mendistribusikan berkas secara berurutan (First-In-First-Out)4. Setiap worker yang berstatus bebas akan mengambil satu berkas dari antrean, membaca data citra melalui antarmuka createImageBitmap, melakukan kalkulasi penyesuaian dimensi, dan menjalankan re-encoding pada kanvas terisolasi OffscreenCanvas4.
Modul ini menyediakan kendali penyesuaian yang dapat diaplikasikan secara massal maupun individual1:
Penggeser Kualitas (Quality Slider): Beroperasi pada rentang 1% hingga 100%, dengan konfigurasi standar pada nilai 75% yang secara empiris terbukti memangkas ukuran fisik citra sebesar 40% hingga 70% tanpa penurunan visual yang disadari mata manusia pada layar umum12.
Konversi Format Luaran: Memungkinkan pengguna mempertahankan format asli berkas atau mengonversinya secara massal ke format WebP untuk efisiensi web modern, format JPEG untuk pemenuhan regulasi portal administrasi resmi, atau format PNG teroptimasi kuantisasi palet3.
Pembatasan Dimensi Piksel (Dimension Clamping): Membatasi batas dimensi lebar atau tinggi citra (misalnya resolusi maksimal 1920 piksel), di mana sistem secara otomatis mempertahankan rasio aspek asli berkas tanpa melakukan pembesaran artifisial (upscaling) pada citra kecil38.
Setelah seluruh berkas dalam antrean selesai diproses, modul pengarsipan berbasis pustaka JSZip secara otomatis menyusun dan mengompres seluruh Blob citra teroptimasi ke dalam satu berkas arsip .zip di dalam memori peramban16. Pengguna dapat mengunduh seluruh luaran dengan satu tindakan klik, memangkas friksi persetujuan dialog unduhan peramban berkali-kali19.

Parameter Citra
Format WebP
Format JPEG
Format PNG
Metode Kompresi
Lossy / Lossless prediktif12
Lossy DCT (Discrete Cosine Transform)39
Lossless kuantisasi palet warna12
Preset Nilai Kualitas Bawaan
75%12
75%39
Optimasi kompresi lossless12
Kesesuaian Penggunaan
Aset web modern dan media sosial19
Formulir pendaftaran resmi (CASN/BUMN)3
Tangkapan layar, diagram, logo transparan19
Dukungan Transparansi Alpha
Ya12
Tidak39
Ya39
Rata-rata Reduksi Ukuran
60% – 85%19
50% – 75%38
30% – 50%38

Desain Pengalaman Pengguna dan Pola Interaksi Antarmuka
Antarmuka web dibangun di atas filosofi desain yang bersih, lugas, dan bebas hambatan kognitif bagi pengguna baru1.
Pengguna disambut oleh halaman depan yang memuat komponen pemilih modul terpadu berupa segmented tab control untuk berpindah di antara tiga menu utama:
Kompres PDF: Pengoptimalan ukuran berkas dokumen tunggal atau jamak secara lokal1.
Gabung PDF: Fusi beberapa dokumen PDF menjadi satu berkas terpadu dengan penyusunan visual seret-dan-lepas22.
Kompres Foto (Massal): Pengurangan kapasitas puluhan foto secara simultan berbasis multithreading worker4.
Area penyeretan berkas (Hero Dropzone) diletakkan di posisi tengah dengan batas visual putus-putus (dashed border), dilengkapi tipografi instruktif dan ikon grafis yang jelas24. Pengguna dapat langsung menyeret dokumen atau memilih tombol jelajah berkas lokal12. Sistem secara otomatis memvalidasi tipe MIME berkas untuk mencegah masukan format yang tidak sesuai44.
Setiap berkas yang dimasukkan ke dalam aplikasi ditampilkan dalam bentuk kartu status (Status Card) interaktif di dalam wadah kisi responsif41:
Pada Menu Kompresi (PDF / Citra): Kartu menyajikan informasi nama berkas, ukuran awal, indikator status dinamis (Queued, Compressing, Done, Error), pratinjau thumbnail, ukuran berkas baru, persentase penghematan ruang penyimpanan secara transparan, serta tombol unduh individual4.
Pada Menu Gabung PDF: Kartu menampilkan thumbnail halaman sampul dokumen, total jumlah halaman, pegangan seret (drag handle) untuk reordering interaktif, tombol hapus dari antrean, serta indikator nomor urutan berkas (misal: "Berkas 1 dari 4")16.
Ketika terdapat lebih dari satu berkas yang selesai diproses pada mode kompresi citra, antarmuka memunculkan bilah aksi global (Global Batch Action Bar) pada bagian bawah layar yang memuat ringkasan agregat penghematan total kapasitas serta tombol aksi utama untuk mengunduh seluruh luaran dalam format arsip ZIP19. Pada menu Gabung PDF, bilah aksi bawah memuat tombol utama "Gabungkan PDF Sekarang" dan tombol "Lanjut Kompres Hasil Gabungan"22.
Untuk memberikan keyakinan visual terhadap kualitas hasil kompresi, aplikasi menyediakan modal pemeriksa pratinjau (Before-After Split View Inspector)4. Pengguna dapat menggeser garis pembagi interaktif untuk membandingkan piksel berkas asli dengan berkas terkompresi secara berdampingan sebelum memutuskan untuk mengunduh4.

Keadaan Sistem (State)
Pemicu Peristiwa (Event Trigger)
Manifestasi Visual dan Komponen UI
Initial / Idle
Halaman dimuat pertama kali
Dropzone aktif, navigasi 3 tab terlihat jelas, instruksi format berkas24.
Drag-Over
Kursor menyeret berkas di atas dropzone
Animasi kontur batas dropzone menyala terang, skala kartu sedikit membesar.
Parsing & WASM Init
Berkas dilepas ke dalam dropzone
Skeleton loading kartu berkas, pengunduhan latar modul WASM jika belum ter-cache11.
Reordering (Merge Tab)
Pengguna menggeser kartu berkas PDF
Kartu bergeser secara halus (smooth transition) via @dnd-kit, nomor urutan terbarui otomatis16.
Batch Processing
Pengguna menekan tombol kompresi / gabung
Kartu memunculkan bilah progres individual, tombol utama dinonaktifkan dengan spinner4.
Error Handling
Sandi terdeteksi, korupsi berkas, atau batas OOM
Kartu bertanda merah, teks penyebab kesalahan muncul, tombol lewati berkas otomatis4.
Batch / Merge Completed
Seluruh antrean tuntas diproses
Kartu berubah hijau, bilah aksi bawah muncul memuat ringkasan hasil serta tombol unduh / unduh ZIP19.

Kebutuhan Non-Fungsional, Manajemen Memori, dan Keamanan Berkas
Pengoperasian utilitas manipulasi berkas intensif di dalam memori peramban menuntut rekayasa keandalan sistem yang ketat guna mencegah tab peramban terhenti akibat lonjakan alokasi memori (out-of-memory crash)1.
Penguraian dokumen PDF berukuran 50 MB dengan Ghostscript WASM dapat memicu konsumsi RAM hingga 200 MB sampai 300 MB akibat alokasi memori kerja virtual sementara5. Sementara itu, penggabungan banyak dokumen PDF menggunakan pdf-lib memerlukan ruang alokasi setara gabungan ukuran seluruh berkas biner di dalam memori kerja sebelum serialisasi final15. Oleh karena itu, aplikasi menetapkan mekanisme penyaringan awal (pre-flight sizing check): berkas PDF individual dibatasi maksimal 100 MB, batas total kumpulan berkas untuk penggabungan dibatasi maksimal 200 MB, dan berkas citra dibatasi maksimal 50 MB per berkas5.
Siklus komputasi Ghostscript WASM mewajibkan pembersihan memori secara eksplisit melalui perintah FS.unlink() pada sistem berkas virtual Emscripten segera setelah Blob luaran berhasil diekstraksi7. Objek URL memori lokal juga harus dibersihkan secara sistematis melalui fungsi URL.revokeObjectURL() ketika berkas dihapus dari antrean oleh pengguna guna mencegah akumulasi kebocoran memori (memory leak)5. Selain itu, setiap tugas pemrosesan individual diawasi oleh penghitung batas waktu (watchdog timer) 60 detik; berkas yang gagal diselesaikan dalam kurun waktu tersebut akan dibatalkan secara terisolasi tanpa menghentikan pemrosesan berkas lainnya4.
Kerahasiaan dokumen dijamin secara mutlak melalui isolasi sandboxing peramban5. Berkas masukan maupun luaran tidak pernah ditransmisikan melintasi jaringan internet, sebuah karakteristik privasi yang dapat dibuktikan secara independen melalui panel jaringan pada konsol peramban5. Berkat penerapan Service Worker, seluruh pustaka inti (pdf-lib, pdfjs-dist), skrip pengodean, dan file biner WASM disimpan dalam penyimpanan lokal peramban, memungkinkan aplikasi berfungsi secara penuh tanpa sambungan internet setelah pemuatan pertama selesai1.
Kompatibilitas peramban dijamin pada mesin modern berbasis Chromium (Chrome, Edge, Brave versi 88 ke atas), Mozilla Gecko (Firefox versi 85 ke atas), dan WebKit (Safari versi 14.5 ke atas) yang telah mendukung standar WebAssembly SIMD, OffscreenCanvas, dan Web Workers secara stabil11.

Kategori Kebutuhan
Parameter Teknis
Ambang Batas Toleransi
Mekanisme Pemenuhan Rekayasa
Manajemen Memori
Alokasi RAM per tab
Maksimal 500 MB penggunaan aktif5
Pembersihan berkas virtual MEMFS via FS.unlink() dan URL.revokeObjectURL()5
Ukuran Berkas Masukan
Batas tunggal & kumulatif
100 MB (PDF tunggal), 200 MB (Kumulatif gabung PDF), 50 MB (Citra)5
Pemeriksaan ukuran awal sebelum dimasukkan antrean5
Ketahanan Proses
Batas waktu per tugas
60 detik per operasi4
Pembatalan terisolasi via watchdog timer4
Kerahasiaan Berkas
Transmisi jaringan berkas
0 KB ditransfer ke luar5
Pemrosesan lokal pada sandbox peramban5
Dukungan Luring
Ketersediaan sistem
100% operasional tanpa internet1
Caching aset statis, pustaka JS, dan WASM via Service Worker5

Rencana Tahapan Rilis dan Metrik Evaluasi Kinerja Produk
Pengembangan produk dibagi ke dalam tiga tahap peluncuran yang terstruktur untuk menguji stabilitas fungsi sebelum ekspansi ke fitur lanjutan.
Tahap awal difokuskan pada pembangunan fondasi aplikasi web (Minimal Viable Product) menggunakan pustaka React, TypeScript, dan Tailwind CSS12. Lingkungan Ghostscript WASM diintegrasikan ke dalam satu Web Worker untuk melayani kompresi PDF berkas tunggal menggunakan preset /ebook dan /screen11. Bersamaan dengan itu, modul penggabungan dokumen PDF dasar dibangun menggunakan pustaka pdf-lib tanpa fitur reordering lanjutan14. Modul kompresi citra tunggal diimplementasikan menggunakan antarmuka Canvas standar19. Tahap ini bertujuan memvalidasi keakuratan fusi berkas serta rasio reduksi dokumen21.
Tahap kedua memperluas kemampuan sistem ke ranah pemrosesan massal dan interaktivitas tingkat lanjut:
Pembangunan arsitektur Worker Pool konkuren untuk modul citra bersama manajer antrean berkas dan pengarsipan ZIP via JSZip4.
Integrasi pustaka @dnd-kit/* pada modul Gabung PDF untuk memungkinkan penataan urutan dokumen secara visual disertai thumbnail halaman depan berbasis pdfjs-dist16.
Implementasi algoritma pencarian ukuran target pada modul kompresi PDF untuk mendukung standar portal pendaftaran kerja atau seleksi administrasi (misal tepat di bawah 200 KB dan 500 KB)3.
Pengaktifan tombol pintas alur "Lanjut Kompres Hasil Gabungan"23.
Tahap ketiga mematangkan aspek antarmuka dan keandalan sistem secara menyeluruh. Komponen modal perbandingan kualitas berkas (Split View Inspector) diaktifkan agar pengguna dapat memverifikasi ketajaman visual sebelum pengunduhan4. Dukungan Service Worker dipasang penuh untuk menjamin operasionalitas luring berstandar Progressive Web App (PWA)1. Tahap ini juga mencakup implementasi sistem isolasi galat per berkas dan pembersihan menyeluruh alokasi memori virtual4.

Parameter Kinerja
Target Kuantitatif
Metode Pengukuran dan Evaluasi
Kelancaran Antarmuka Pengguna
Konsisten 60 FPS selama proses kompresi & drag reordering4
Pemantauan frame rate DevTools saat interaksi batch dan seret kartu4
Kecepatan Penggabungan PDF
<2 detik untuk menggabungkan 5 berkas PDF (total 30 halaman)22
Benchmark waktu eksekusi pdf-lib di peramban pengguna14
Rasio Keberhasilan Pemrosesan
Minimal 98% berkas valid tuntas tanpa gagal1
Pengujian otomatis (automated testing) pada sampel uji berkas
Tingkat Reduksi Dokumen PDF
Rata-rata penghematan 50% – 80% pada mode /ebook11
Perbandingan ukuran byte awal terhadap byte akhir4
Kecepatan Kompresi Citra Massal
<1,5 detik per citra resolusi 12 MP
Waktu kalkulasi antrean worker pada perangkat laptop standar4
Ketepatan Mode Ukuran Target
Luaran berkas berada pada rentang 90%–99% batas target20
Validasi ukuran berkas luaran terhadap ambang 200/500 KB20
Kepatuhan Privasi Data
0 permintaan jaringan keluar (zero egress)5
Audit otomatis pada DevTools Network log saat berkas diproses5

Spesifikasi Rekayasa Fungsional Modul Restorasi Citra & AI Upscaler
Modul Restorasi Foto melengkapi alur kerja dokumen dan citra dengan kapabilitas pemulihan kualitas visual berbasis komputasi Canvas Digital Signal Processing (DSP) 100% lokal di sisi klien:
1. Image Enhancement (Peningkatan Gambar): Peningkatan ketajaman, penyesuaian kontras dinamis, saturasi warna, dan eksposur pencahayaan secara cerdas dan terkalibrasi.
2. AI Image Upscaler / Super Resolution: Pembesaran dimensi 2x dan 4x dengan interpolasi tingkat tinggi dan sintesis frekuensi detail tepi untuk mencegah distorsi piksel saat pencetakan fisik atau penayangan resolusi tinggi.
3. De-blur / Menjernihkan Foto Buram: Algoritma true separable unsharp masking dengan filtering Gaussian dan ambang batas (noise threshold) untuk menajamkan tepi tulisan pada dokumen/kartu identitas dan mengatasi motion blur tanpa memicu artefak halo kasar.
4. Denoise / Pengurangan Noise: Filter bilateral adaptif yang mereduksi bintik kasar (sensor noise / high-ISO grain) pada latar belakang dengan tetap mempertahankan ketegasan garis tepi kontur objek utama.
5. Photo Restoration (Pemulihan Foto Pudar): Dynamic range expansion histogram equalization dan auto-level curve untuk memulihkan foto cetak kuno/ijazah lama yang menguning dan pudar.
6. Color Correction & Grading: Keseimbangan temperatur warna (warm/cool), vibrance kanal Rec. 709, dan kendali kontras berbasis Lookup Tables (LUT) 256-elemen berkecepatan tinggi.
7. Antarmuka Komparasi Split-View: Peninjauan interaktif perbandingan sebelum/sesudah dengan kendali slider sentuh (touch-friendly) untuk perangkat seluler dan desktop.

Spesifikasi Sistem Tema & Aksesibilitas Antarmuka
1. Tema Terang & Gelap (Light / Dark Mode): Dukungan pergantian tema visual instan via pemilih tema (Sun/Moon toggle) di bilah navigasi atas, dengan persistensi preferensi di localStorage (fjy_theme).
2. Responsivitas Seluler Penuh (Mobile-First Architecture): Grid adaptif, kontrol slider yang mendukung event sentuhan jari (onTouchStart, onTouchMove), dropzone sentuh kompak, serta tipografi proporsional untuk kemudahan pengoperasian di layar smartphone dan tablet.

@echo off
setlocal
title FJY Channel Kompres - Sistem Pemrosesan Berkas Lokal
color 0B
cls

:: Pindah ke direktori tempat berkas script berada
cd /d "%~dp0"

echo ========================================================================
echo                   FJY CHANNEL KOMPRES (100%% LOKAL)
echo     Kompres PDF ^| Gabung PDF ^| Kompres Foto Massal ^| Restorasi Foto
echo ========================================================================
echo.

:: --------------------------------------------------------------------------
:: 1. Pemeriksaan Node.js & NPM pada perangkat
:: --------------------------------------------------------------------------
echo [1/3] Memeriksa ketersediaan aplikasi dan komponen sistem...

where node >nul 2>nul
if errorlevel 1 goto :no_node

for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
for /f "delims=" %%v in ('cmd /c npm -v 2^>nul') do set "NPM_VER=%%v"

echo   [OK] Node.js terdeteksi : %NODE_VER%
echo   [OK] NPM terdeteksi     : %NPM_VER%
echo.

:: --------------------------------------------------------------------------
:: 2. Pemeriksaan dan Pemasangan Pustaka / Dependensi Aplikasi
:: --------------------------------------------------------------------------
echo [2/3] Memeriksa pustaka aplikasi (node_modules)...

if not exist "node_modules\vite\bin\vite.js" goto :install_deps
echo   [OK] Seluruh pustaka aplikasi sudah terpasang dan siap digunakan.
echo.
goto :start_app

:install_deps
echo.
echo [INFO] Pustaka aplikasi belum lengkap.
echo [INFO] Memasang seluruh dependensi yang diperlukan: npm install...
echo        Proses ini hanya berlangsung satu kali saat awal. Mohon tunggu...
echo.
cmd /c npm install
if errorlevel 1 goto :install_failed
echo.
echo [OK] Pustaka aplikasi berhasil dipasang dengan lengkap.
echo.
goto :start_app

:install_failed
echo.
echo ========================================================================
echo [ERROR] Pemasangan dependensi gagal!
echo Pastikan komputer terhubung ke internet saat pemasangan awal pustaka.
echo ========================================================================
echo.
pause
exit /b 1

:: --------------------------------------------------------------------------
:: 3. Menjalankan Server Lokal & Membuka di Peramban
:: --------------------------------------------------------------------------
:start_app
echo [3/3] Menjalankan server aplikasi web lokal...
echo.
echo ========================================================================
echo   Aplikasi Web FJY Channel Kompres siap digunakan!
echo.
echo   * URL Komputer Lokal : http://localhost:5173/
echo   * URL Perangkat HP   : Lihat IP Network yang ditampilkan di bawah
echo.
echo   [TIPS] Tekan Ctrl + C pada jendela ini jika ingin menghentikan web.
echo ========================================================================
echo.

:: Buka browser secara otomatis
start "" http://localhost:5173/

:: Jalankan server Vite dengan mode host terbuka untuk akses jaringan lokal/HP
cmd /c npm run dev -- --host

if errorlevel 1 (
    echo.
    echo Server dihentikan.
)
pause
exit /b 0

:: --------------------------------------------------------------------------
:: Penanganan jika Node.js belum terpasang
:: --------------------------------------------------------------------------
:no_node
echo.
echo ========================================================================
echo [PERINGATAN] Node.js belum terpasang di perangkat ini!
echo.
echo Aplikasi web lokal ini membutuhkan runtime Node.js LTS.
echo Anda dapat mengunduhnya secara gratis di situs resmi:
echo   https://nodejs.org/
echo ========================================================================
echo.
set /p "BukaWeb=Apakah Anda ingin membuka halaman unduh Node.js sekarang? [Y/T]: "
if /i "%BukaWeb%"=="Y" start "" https://nodejs.org/
echo.
echo Silakan unduh dan pasang Node.js, lalu jalankan kembali berkas ini.
echo Tekan tombol apa saja untuk keluar...
pause >nul
exit /b 1

@echo off
setlocal enabledelayedexpansion
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
:: 1. Pemeriksaan Node.js & NPM pada perangkat baru
:: --------------------------------------------------------------------------
echo [1/3] Memeriksa ketersediaan aplikasi dan komponen sistem...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ========================================================================
    echo [PERINGATAN] Node.js belum terpasang di perangkat ini!
    echo.
    echo Aplikasi web lokal ini membutuhkan runtime Node.js (versi LTS direkomendasikan).
    echo Anda dapat mengunduhnya secara gratis di situs resmi:
    echo   https://nodejs.org/
    echo ========================================================================
    echo.
    set /p "BukaWeb=Apakah Anda ingin membuka halaman unduh Node.js sekarang? (Y/T): "
    if /i "!BukaWeb!"=="Y" (
        start "" https://nodejs.org/
    )
    echo.
    echo Silakan pasang Node.js, lalu jalankan kembali berkas start.bat ini.
    echo Tekan tombol apa saja untuk keluar...
    pause >nul
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set "NODE_VER=%%v"
for /f "tokens=*" %%v in ('call npm -v 2^>nul') do set "NPM_VER=%%v"

echo   [OK] Node.js terdeteksi : !NODE_VER!
echo   [OK] NPM terdeteksi     : !NPM_VER!
echo.

:: --------------------------------------------------------------------------
:: 2. Pemeriksaan dan Pemasangan Pustaka / Dependensi Aplikasi
:: --------------------------------------------------------------------------
echo [2/3] Memeriksa pustaka aplikasi (node_modules)...

if not exist "node_modules\vite\bin\vite.js" (
    echo.
    echo [INFO] Perangkat baru terdeteksi: Pustaka aplikasi belum lengkap.
    echo [INFO] Sedang memasang seluruh dependensi yang diperlukan (npm install)...
    echo        Proses ini hanya berlangsung satu kali saat awal. Mohon tunggu...
    echo.
    call npm install
    if !errorlevel! neq 0 (
        echo.
        echo [ERROR] Pemasangan dependensi gagal!
        echo Pastikan komputer terhubung ke internet saat pemasangan awal pustaka.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Pustaka aplikasi berhasil dipasang dengan lengkap.
) else (
    echo   [OK] Seluruh pustaka aplikasi sudah terpasang dan siap digunakan.
)
echo.

:: --------------------------------------------------------------------------
:: 3. Menjalankan Server Lokal & Membuka di Peramban
:: --------------------------------------------------------------------------
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
call npm run dev -- --host

pause

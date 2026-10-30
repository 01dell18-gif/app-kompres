@echo off
title FJY Channel Kompres - PDF & Foto Lokal
color 0B
cls

echo ========================================================
echo        FJY CHANNEL KOMPRES - 100%% CLIENT-SIDE
echo   Kompres PDF, Gabung PDF, dan Kompres Citra Massal
echo ========================================================
echo.

:: 1. Periksa apakah Node.js terpasang
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer ini!
    echo Silakan unduh dan pasang Node.js terlebih dahulu dari:
    echo https://nodejs.org/
    echo.
    echo Tekan tombol apa saja untuk keluar...
    pause >nul
    exit /b 1
)

echo [1/3] Node.js terdeteksi:
node -v
echo.

:: 2. Periksa dependensi node_modules
if not exist "node_modules\" (
    echo [2/3] Mengunduh & memasang dependensi proyek (npm install)...
    echo Mohon tunggu sebentar, proses ini hanya berjalan sekali...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Gagal memasang dependensi npm!
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependensi node_modules sudah terpasang.
)
echo.

:: 3. Jalankan server lokal dan buka browser otomatis
echo [3/3] Menjalankan server aplikasi lokal...
echo Aplikasi dapat diakses langsung pada browser Anda.
echo Tekan Ctrl+C pada jendela terminal ini jika ingin menghentikan aplikasi.
echo.

:: Jalankan browser otomatis ke localhost:5173
start "" http://localhost:5173/

:: Jalankan Vite dengan host terbuka agar bisa diakses HP/perangkat lain di Wi-Fi yang sama
call npm run dev -- --host

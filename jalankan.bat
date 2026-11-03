@echo off
setlocal EnableExtensions EnableDelayedExpansion
title FJY Channel Kompres - Sistem Pemrosesan Berkas Lokal
color 0B
cls

:: Pindah ke direktori tempat berkas script berada
cd /d "%~dp0"

echo ========================================================================
echo                   FJY CHANNEL KOMPRES [100%% LOKAL]
echo     Kompres PDF ^| Gabung PDF ^| Kompres Foto Massal ^| Restorasi Foto
echo ========================================================================
echo.

:: --------------------------------------------------------------------------
:: 1. Pemeriksaan Node.js pada perangkat
:: --------------------------------------------------------------------------
echo [1/3] Memeriksa ketersediaan aplikasi dan komponen sistem...

set "NODE_CMD="

:: Prioritas 1: Portable node.exe langsung di folder installers (Zero-Install, Cepat, Offline)
if exist "%~dp0installers\node.exe" (
    set "NODE_CMD=%~dp0installers\node.exe"
    goto :node_ready
)
if exist "%~dp0installer\node.exe" (
    set "NODE_CMD=%~dp0installer\node.exe"
    goto :node_ready
)

:: Prioritas 2: Ekstrak node.exe otomatis dari paket zip jika ada di installers
if exist "%~dp0installers\node-v20.18.3-win-x64.zip" (
    echo [INFO] Menyiapkan Node.js portable dari paket offline...
    tar -xf "%~dp0installers\node-v20.18.3-win-x64.zip" --strip-components=1 -C "%~dp0installers" "node-v20.18.3-win-x64/node.exe" >nul 2>nul
    if exist "%~dp0installers\node.exe" (
        set "NODE_CMD=%~dp0installers\node.exe"
        goto :node_ready
    )
)

:: Prioritas 3: Cek apakah node sudah terpasang di sistem (PATH)
where node >nul 2>nul
if not errorlevel 1 (
    set "NODE_CMD=node"
    goto :node_ready
)

:: Prioritas 4: Cek lokasi instalasi standar Windows
if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto :node_ready
)
if exist "C:\Program Files (x86)\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files (x86)\nodejs\node.exe"
    goto :node_ready
)
if exist "%LocalAppData%\Programs\node\node.exe" (
    set "NODE_CMD=%LocalAppData%\Programs\node\node.exe"
    goto :node_ready
)

:: Prioritas 5: Jalankan instalasi dari paket MSI di folder installers
goto :install_node_msi

:install_node_msi
echo.
echo ========================================================================
echo [INFO] Perangkat baru terdeteksi: Node.js belum terpasang di sistem.
echo [INFO] Memeriksa paket instalasi offline di folder installers...
echo ========================================================================
echo.

set "INSTALLER_MSI="
if exist "%~dp0installers\node-v24.22.2-x64.msi" set "INSTALLER_MSI=%~dp0installers\node-v24.22.2-x64.msi"
if exist "%~dp0installer\node-v24.22.2-x64.msi" set "INSTALLER_MSI=%~dp0installer\node-v24.22.2-x64.msi"

if not defined INSTALLER_MSI (
    for %%f in ("%~dp0installers\node*.msi") do set "INSTALLER_MSI=%%~ff"
)
if not defined INSTALLER_MSI (
    for %%f in ("%~dp0installer\node*.msi") do set "INSTALLER_MSI=%%~ff"
)

if not defined INSTALLER_MSI goto :node_not_found

echo [INFO] Memulai instalasi Node.js dari !INSTALLER_MSI!...
echo        Mohon izinkan hak administrator jika muncul prompt konfirmasi.
echo.
start /wait msiexec /i "!INSTALLER_MSI!" /qb
echo.
echo [OK] Proses instalasi selesai.

if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
    goto :node_ready
)
where node >nul 2>nul
if not errorlevel 1 (
    set "NODE_CMD=node"
    goto :node_ready
)

:node_not_found
echo.
echo ========================================================================
echo [ERROR] Komponen Node.js tidak dapat dipersiapkan secara otomatis.
echo         Pastikan file installers\node.exe atau installer MSI tersedia.
echo ========================================================================
echo.
pause
exit /b 1

:node_ready
set "NODE_VER="
for /f "usebackq delims=" %%v in (`"!NODE_CMD!" -v 2^>nul`) do set "NODE_VER=%%v"
if not defined NODE_VER set "NODE_VER=Aktif"
echo   [OK] Node.js aktif     : !NODE_VER!
echo.

:: --------------------------------------------------------------------------
:: 2. Pemeriksaan Berkas Aplikasi & Kesiapan Produksi
:: --------------------------------------------------------------------------
echo [2/3] Memeriksa kesiapan berkas aplikasi...

if exist "%~dp0dist\index.html" goto :app_ready

:: Jika dist belum ada, persiapkan dari arsip offline
echo [INFO] Berkas kompilasi (dist) belum tersedia. Mempersiapkan aset...
if not exist "%~dp0node_modules\vite\bin\vite.js" (
    if exist "%~dp0installers\node_modules_offline.zip" (
        echo [INFO] Mengekstrak paket pustaka offline (node_modules)...
        tar -xf "%~dp0installers\node_modules_offline.zip" -C "%~dp0"
    )
)

if exist "%~dp0node_modules\vite\bin\vite.js" (
    echo [INFO] Mengompilasi aplikasi web...
    "!NODE_CMD!" "%~dp0node_modules\vite\bin\vite.js" build
    if exist "%~dp0dist\index.html" goto :app_ready
)

echo.
echo ========================================================================
echo [ERROR] Berkas web (dist\index.html) tidak ditemukan.
echo ========================================================================
echo.
pause
exit /b 1

:app_ready
echo   [OK] Berkas produksi siap pakai - 100%% Offline Ready.
echo.

:: --------------------------------------------------------------------------
:: 3. Menjalankan Server Lokal & Membuka Peramban
:: --------------------------------------------------------------------------
echo [3/3] Menjalankan server aplikasi web lokal...
echo.

:: Bersihkan proses sisa di port 5173 jika ada
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul

:: Buka browser secara otomatis ke localhost:5173 dengan parameter anti-cache
start "" "http://localhost:5173/?v=!RANDOM!"

:: Jalankan server lokal mandiri
"!NODE_CMD!" "%~dp0server.js"

:: Ketika server dihentikan (misal pengguna tekan Ctrl+C)
echo.
echo ========================================================================
echo [INFO] Membersihkan port dan proses server...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
echo [OK] Aplikasi web telah berhasil dinonaktifkan sepenuhnya.
echo ========================================================================
echo.
pause
exit /b 0

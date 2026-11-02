@echo off
setlocal enabledelayedexpansion
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

:: Cek apakah command node sudah ada di PATH
where node >nul 2>nul
if not errorlevel 1 goto :node_ready

:: Cek apakah Node.js terpasang di lokasi standar Windows
if exist "C:\Program Files\nodejs\node.exe" goto :found_pf
if exist "C:\Program Files (x86)\nodejs\node.exe" goto :found_pfx86
if exist "%LocalAppData%\Programs\node\node.exe" goto :found_local
goto :install_node

:found_pf
set "PATH=C:\Program Files\nodejs;%AppData%\npm;!PATH!"
goto :node_ready

:found_pfx86
set "PATH=C:\Program Files (x86)\nodejs;%AppData%\npm;!PATH!"
goto :node_ready

:found_local
set "PATH=%LocalAppData%\Programs\node;!PATH!"
goto :node_ready

:install_node
echo.
echo ========================================================================
echo [INFO] Perangkat baru terdeteksi: Node.js belum terpasang di sistem.
echo [INFO] Memasang Node.js secara otomatis dari folder installers...
echo ========================================================================
echo.

set "INSTALLER_MSI="
if exist "installers\node-v24.22.2-x64.msi" set "INSTALLER_MSI=installers\node-v24.22.2-x64.msi"

if not defined INSTALLER_MSI for %%f in ("installers\node*.msi") do set "INSTALLER_MSI=%%~ff"

if defined INSTALLER_MSI goto :run_installer

echo [INFO] Mengunduh berkas installer Node.js ke folder installers...
if not exist "installers" mkdir "installers"
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v24.22.2/node-v24.22.2-x64.msi' -OutFile 'installers\node-v24.22.2-x64.msi'"
set "INSTALLER_MSI=installers\node-v24.22.2-x64.msi"

:run_installer
echo [INFO] Memulai instalasi Node.js dari !INSTALLER_MSI!...
echo        Mohon izinkan hak administrator jika muncul prompt konfirmasi.
echo.
start /wait msiexec /i "%~dp0!INSTALLER_MSI!" /qb
echo.
echo [OK] Proses instalasi selesai.

:: Perbarui PATH di sesi saat ini setelah instalasi
set "PATH=C:\Program Files\nodejs;%AppData%\npm;!PATH!"

where node >nul 2>nul
if errorlevel 1 goto :node_fail
goto :node_ready

:node_fail
echo.
echo [ERROR] Node.js belum berhasil dikenali. Silakan buka kembali start.bat.
pause
exit /b 1

:node_ready
for /f "delims=" %%v in ('node -v 2^>nul') do set "NODE_VER=%%v"
echo   [OK] Node.js aktif     : !NODE_VER!
echo.

:: --------------------------------------------------------------------------
:: 2. Pemeriksaan Pustaka & Mode Peluncuran
:: --------------------------------------------------------------------------
echo [2/3] Memeriksa kesiapan berkas aplikasi...

if exist "dist\index.html" goto :has_dist
if not exist "node_modules\vite\bin\vite.js" goto :install_deps
goto :launch_production

:has_dist
echo   [OK] Berkas produksi siap pakai - 100%% Offline Ready.
goto :launch_production

:install_deps
echo.
echo [INFO] Memasang dependensi aplikasi yang diperlukan: npm install...
echo        Proses ini hanya berlangsung satu kali saat awal. Mohon tunggu...
echo.
cmd /c npm install
if errorlevel 1 goto :deps_failed
echo [INFO] Mengompilasi aplikasi: npm run build...
cmd /c npm run build
goto :launch_production

:deps_failed
echo.
echo [ERROR] Gagal memasang dependensi. Pastikan terhubung ke internet saat awal.
pause
exit /b 1

:launch_production
echo.
:: --------------------------------------------------------------------------
:: 3. Menjalankan Server Lokal & Membuka Peramban
:: --------------------------------------------------------------------------
echo [3/3] Menjalankan server aplikasi web lokal...
echo.

:: Buka browser secara otomatis ke localhost:5173
start "" http://localhost:5173/

:: Prioritaskan server.js jika tersedia
if exist "server.js" goto :run_server_js
cmd /c npm run dev -- --host
goto :server_end

:run_server_js
node server.js
goto :server_end

:server_end
echo.
echo Server selesai atau ditutup.
pause
exit /b 0

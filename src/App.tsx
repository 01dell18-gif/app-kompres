import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabNavigation } from './components/TabNavigation';
import { PdfCompressor } from './components/PdfCompressor/PdfCompressor';
import { PdfMerger } from './components/PdfMerger/PdfMerger';
import { ImageCompressor } from './components/ImageCompressor/ImageCompressor';
import { PhotoRestoration } from './components/PhotoRestoration/PhotoRestoration';
import { ActiveTab } from './types';
import { Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('compress-pdf');

  // Theme Management (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('fjy_theme') : null;
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('fjy_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Chained file passing across modules
  const [chainedFileForCompressor, setChainedFileForCompressor] = useState<File | null>(null);
  const [chainedFileForMerger, setChainedFileForMerger] = useState<File | null>(null);

  const handleTransferToCompressor = (file: File) => {
    setChainedFileForCompressor(file);
    setActiveTab('compress-pdf');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleTransferToMerger = (file: File) => {
    setChainedFileForMerger(file);
    setActiveTab('merge-pdf');
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#060608] text-slate-800 dark:text-slate-100 bg-radial-glow selection:bg-sky-500 selection:text-white overflow-x-hidden transition-colors duration-200">
      {/* Top Navbar with Theme Switcher */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-[11px] sm:text-xs font-semibold">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Pemrosesan Berkas & Restorasi 100% Lokal di Browser</span>
          </div>

          {activeTab === 'compress-pdf' && (
            <>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Kompres <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-600 dark:from-sky-400 dark:via-cyan-300 dark:to-sky-500">PDF Online</span>
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
                Perkecil ukuran PDF administrasi (CASN, BUMN, SK, Ijazah, RPP) secara cepat, tajam, dan aman tanpa unggah ke server.
              </p>
            </>
          )}

          {activeTab === 'merge-pdf' && (
            <>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Gabung <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-500 dark:from-cyan-400 dark:via-teal-300 dark:to-sky-400">Banyak PDF</span> Jadi 1
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
                Satukan berkas lampiran, ijazah, transkrip, dan sertifikat menjadi satu dokumen urut dengan pratinjau halaman visual.
              </p>
            </>
          )}

          {activeTab === 'compress-image' && (
            <>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Kompres <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-emerald-400 to-teal-500 dark:from-sky-400 dark:via-emerald-300 dark:to-teal-400">Banyak Foto</span> Sekaligus
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
                Optimalkan puluhan hingga ratusan foto secara simultan berbasis multi-threading. Unduh rapi dalam satu arsip ZIP.
              </p>
            </>
          )}

          {activeTab === 'restore-image' && (
            <>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Restorasi & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-400 to-sky-500 dark:from-amber-400 dark:via-orange-300 dark:to-sky-400">Tingkatkan Foto</span>
              </h2>
              <p className="text-xs sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed px-2">
                Perbaiki ketajaman foto buram (de-blur), hilangkan bintik noise, pulihkan foto pudar, dan perbesar resolusi (upscaler 2x/4x) secara lokal.
              </p>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Active Module Screen */}
        <div className="mt-4 sm:mt-6">
          {activeTab === 'compress-pdf' && (
            <PdfCompressor
              initialFile={chainedFileForCompressor}
              onClearInitialFile={() => setChainedFileForCompressor(null)}
              onTransferToMerger={handleTransferToMerger}
            />
          )}

          {activeTab === 'merge-pdf' && (
            <PdfMerger
              initialFile={chainedFileForMerger}
              onClearInitialFile={() => setChainedFileForMerger(null)}
              onTransferToCompressor={handleTransferToCompressor}
            />
          )}

          {activeTab === 'compress-image' && <ImageCompressor />}

          {activeTab === 'restore-image' && (
            <PhotoRestoration onTransferToCompressor={handleTransferToCompressor} />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;

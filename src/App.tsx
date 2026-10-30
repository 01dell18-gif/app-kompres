import React, { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TabNavigation } from './components/TabNavigation';
import { PdfCompressor } from './components/PdfCompressor/PdfCompressor';
import { PdfMerger } from './components/PdfMerger/PdfMerger';
import { ImageCompressor } from './components/ImageCompressor/ImageCompressor';
import { ActiveTab } from './types';
import { Sparkles, FileText, Layers, Image as ImageIcon } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('compress-pdf');

  // Chained file passing across modules
  const [chainedFileForCompressor, setChainedFileForCompressor] = useState<File | null>(null);
  const [chainedFileForMerger, setChainedFileForMerger] = useState<File | null>(null);

  const handleTransferToCompressor = (file: File) => {
    setChainedFileForCompressor(file);
    setActiveTab('compress-pdf');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleTransferToMerger = (file: File) => {
    setChainedFileForMerger(file);
    setActiveTab('merge-pdf');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060608] text-slate-100 bg-radial-glow selection:bg-sky-500 selection:text-white">
      {/* Top Navbar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pemrosesan Berkas 100% Berjalan Lokal di Browser</span>
          </div>

          {activeTab === 'compress-pdf' && (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Kompres <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500">PDF Online</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Perkecil ukuran PDF administrasi (CASN, BUMN, SK, Ijazah, RPP) secara cepat dan aman tanpa unggah ke server.
              </p>
            </>
          )}

          {activeTab === 'merge-pdf' && (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Gabung <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">Banyak PDF</span> Jadi 1
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Satukan berkas lampiran, ijazah, transkrip, dan sertifikat menjadi satu dokumen urut dengan pratinjau halaman visual.
              </p>
            </>
          )}

          {activeTab === 'compress-image' && (
            <>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                Kompres <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-300 to-teal-400">Banyak Foto</span> Sekaligus
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
                Optimalkan puluhan hingga ratusan foto secara simultan berbasis multi-threading. Unduh rapi dalam satu arsip ZIP.
              </p>
            </>
          )}
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Active Module Screen */}
        <div className="mt-6">
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
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;


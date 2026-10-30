import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';

interface SplitViewerProps {
  isOpen: boolean;
  onClose: () => void;
  originalUrl: string;
  compressedUrl: string;
  originalLabel?: string;
  compressedLabel?: string;
  title?: string;
}

export const SplitViewer: React.FC<SplitViewerProps> = ({
  isOpen,
  onClose,
  originalUrl,
  compressedUrl,
  originalLabel = 'Asli (Sebelum)',
  compressedLabel = 'Hasil Kompresi',
  title = 'Bandingkan Kualitas (Before / After)',
}) => {
  const [sliderPos, setSliderPos] = useState(50); // percentage (0 - 100)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPos(percentage);
    },
    []
  );

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-[#101016] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 bg-[#14141c]">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-xs sm:text-base truncate">{title}</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">Geser garis untuk memeriksa piksel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Comparison Stage */}
        <div
          ref={containerRef}
          onMouseDown={() => setIsDragging(true)}
          onTouchStart={() => setIsDragging(true)}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          className="relative flex-1 min-h-[300px] sm:min-h-[420px] max-h-[65vh] sm:max-h-[70vh] bg-[#09090d] select-none overflow-hidden cursor-ew-resize flex items-center justify-center p-2 sm:p-4"
        >
          {/* Compressed Image (Background) */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <img
              src={compressedUrl}
              alt="Compressed"
              className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain pointer-events-none rounded-lg"
            />
            {/* Compressed Label */}
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-sky-500/90 text-white text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
              {compressedLabel}
            </div>

            {/* Original Image (Clipped Overlay on the Left) */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              <img
                src={originalUrl}
                alt="Original"
                className="max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-black/80 border border-white/20 text-slate-200 text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                {originalLabel}
              </div>
            </div>

            {/* Draggable Divider Line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-500 text-white border-2 border-white shadow-xl flex items-center justify-center cursor-ew-resize pointer-events-auto">
                <SlidersHorizontal className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 border-t border-white/10 bg-[#14141c] text-[10px] sm:text-xs text-slate-400 flex items-center justify-between">
          <span className="truncate">Kiri: Asli • Kanan: Terkompresi</span>
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium transition-colors flex-shrink-0"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

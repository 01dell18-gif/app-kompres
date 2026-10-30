import React from 'react';
import { FileText, FilePlus, Image as ImageIcon } from 'lucide-react';
import { ActiveTab } from '../types';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'compress-pdf' as ActiveTab,
      label: 'Kompres PDF',
      sub: 'Perkecil ukuran dokumen',
      icon: FileText,
      badge: 'Populer',
    },
    {
      id: 'merge-pdf' as ActiveTab,
      label: 'Gabung PDF',
      sub: 'Satukan banyak PDF jadi 1',
      icon: FilePlus,
      badge: 'Multi-berkas',
    },
    {
      id: 'compress-image' as ActiveTab,
      label: 'Kompres Foto',
      sub: 'Optimasi massal + ZIP',
      icon: ImageIcon,
      badge: 'Batch',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="bg-[#101016]/90 p-1.5 rounded-2xl border border-white/10 grid grid-cols-3 gap-1.5 shadow-2xl shadow-black/50">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-xl font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-b from-sky-500/20 to-sky-600/10 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors ${
                  isActive ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-center sm:text-left">
                <div className="text-xs sm:text-sm font-semibold tracking-tight">{tab.label}</div>
                <div className="text-[10px] text-slate-500 hidden md:block">{tab.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};


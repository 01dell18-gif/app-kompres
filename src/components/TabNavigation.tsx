import React from 'react';
import { FileText, FilePlus, Image as ImageIcon, Wand2 } from 'lucide-react';
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
      sub: 'Perkecil dokumen',
      icon: FileText,
    },
    {
      id: 'merge-pdf' as ActiveTab,
      label: 'Gabung PDF',
      sub: 'Banyak PDF jadi 1',
      icon: FilePlus,
    },
    {
      id: 'compress-image' as ActiveTab,
      label: 'Kompres Foto',
      sub: 'Batch multi-foto',
      icon: ImageIcon,
    },
    {
      id: 'restore-image' as ActiveTab,
      label: 'Restorasi Foto',
      sub: 'Perbaiki & Jernihkan',
      icon: Wand2,
      badge: 'Baru',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-3 sm:my-6 px-1 sm:px-4">
      <div className="bg-slate-100/90 dark:bg-[#101016]/90 p-1 sm:p-1.5 rounded-2xl border border-slate-200 dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-1.5 shadow-md dark:shadow-2xl dark:shadow-black/50 transition-colors">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center justify-center sm:justify-start gap-2 py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl font-medium transition-all duration-200 group active:scale-[0.98] ${
                isActive
                  ? 'bg-white dark:bg-gradient-to-b dark:from-sky-500/20 dark:to-sky-600/10 text-sky-600 dark:text-sky-300 border border-sky-400/80 dark:border-sky-500/40 shadow-sm dark:shadow-lg dark:shadow-sky-500/10 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-white/[0.03]'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300'
                    : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-tight truncate">
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.2 rounded-full hidden sm:inline shadow-sm">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-500 hidden md:block truncate">
                  {tab.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

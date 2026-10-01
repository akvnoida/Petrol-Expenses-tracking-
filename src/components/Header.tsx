import React from 'react';
import { Download, Smartphone, Code2, BookOpen, Fuel, Sparkles, CheckCircle2 } from 'lucide-react';
import { exportAndroidStudioProjectZip } from '../utils/zipExporter';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

interface HeaderProps {
  activeTab: 'simulator' | 'code' | 'guide';
  setActiveTab: (tab: 'simulator' | 'code' | 'guide') => void;
  isTracking: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isTracking }) => {
  const [downloading, setDownloading] = React.useState(false);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await exportAndroidStudioProjectZip(ANDROID_PROJECT_FILES);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand info */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Fuel className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Fuel Tracker Pro
              </h1>
              <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Kotlin • Jetpack Compose
              </span>
              {isTracking && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                  GPS Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Production Android Architecture • Room DB • Foreground Service • Geofence Petrol Detection
            </p>
          </div>
        </div>

        {/* Navigation Tabs and Download Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'simulator'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android Studio Code ({ANDROID_PROJECT_FILES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Architecture Guide</span>
            </button>
          </div>

          {/* Download Android Studio Project Zip */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
            title="Download full Android Studio project ready to build and run"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                <span>Downloaded!</span>
              </>
            ) : downloading ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Zipping...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Project (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

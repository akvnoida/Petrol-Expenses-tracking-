import React, { useState } from 'react';
import { AndroidFile } from '../../types';
import { ANDROID_PROJECT_FILES } from '../../data/androidProjectFiles';
import {
  FileCode,
  Copy,
  Check,
  Download,
  FolderTree,
  Search,
  Sparkles,
  Layers,
  Database,
  Radio,
  FileText,
} from 'lucide-react';
import { exportAndroidStudioProjectZip } from '../../utils/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_PROJECT_FILES[5]); // Default to LocationTrackingService or FuelDao
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  const filteredFiles = ANDROID_PROJECT_FILES.filter((file) => {
    const matchesFilter = filter === 'all' || file.category === filter;
    const matchesSearch =
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await exportAndroidStudioProjectZip(ANDROID_PROJECT_FILES);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[780px]">
      {/* 1. Left Project File Hierarchy Explorer */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/60">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span>Android Project Tree</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
              {filteredFiles.length} files
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file, entity, service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {[
              { id: 'all', label: 'All' },
              { id: 'service', label: 'Service/GPS' },
              { id: 'room', label: 'Room DB' },
              { id: 'compose', label: 'Compose UI' },
              { id: 'gradle', label: 'Gradle' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors ${
                  filter === cat.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 group ${
                  isSelected
                    ? 'bg-emerald-950/40 border border-emerald-500/40 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div
                  className={`mt-0.5 p-1 rounded-md ${
                    isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-mono text-xs truncate ${
                      isSelected ? 'font-bold text-emerald-300' : 'text-slate-300'
                    }`}
                  >
                    {file.filename}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5">{file.path}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Download Zip button at bottom of sidebar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 active:scale-95 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Preparing ZIP...' : 'Export Complete Project (.ZIP)'}</span>
          </button>
        </div>
      </div>

      {/* 2. Right Code Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* Code Viewer Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-semibold">
              {selectedFile.language}
            </span>
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-white truncate block">
                {selectedFile.path}
              </span>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedFile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300 bg-slate-950 select-text">
          <pre className="whitespace-pre">
            <code>{selectedFile.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

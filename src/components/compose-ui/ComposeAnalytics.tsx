import React, { useState } from 'react';
import { Trip } from '../../types';
import { BarChart3, TrendingUp, AlertTriangle, Zap, Fuel, Award } from 'lucide-react';

interface ComposeAnalyticsProps {
  trips: Trip[];
}

export const ComposeAnalytics: React.FC<ComposeAnalyticsProps> = ({ trips }) => {
  const [activeMetric, setActiveMetric] = useState<'costPerKm' | 'mileage'>('costPerKm');

  if (trips.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <BarChart3 className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-xs font-semibold">No Chart Data Available</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Log at least one trip to render MPAndroidChart.</p>
      </div>
    );
  }

  // Reverse chronological to chronological for chart
  const chronTrips = [...trips].reverse();
  const maxCostPerKm = Math.max(...trips.map((t) => t.costPerKm), 15);
  const maxMileage = Math.max(...trips.map((t) => t.mileage), 25);

  const bestMileageTrip = [...trips].sort((a, b) => b.mileage - a.mileage)[0];
  const lowestCostTrip = [...trips].sort((a, b) => a.costPerKm - b.costPerKm)[0];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-3.5 space-y-3.5 text-white">
      {/* MPAndroidChart Header Pill */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
            MPAndroidChart Engine
          </span>
          <h3 className="text-sm font-bold text-white">Cost &amp; Efficiency Trends</h3>
        </div>

        {/* Metric Selector Toggle */}
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveMetric('costPerKm')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              activeMetric === 'costPerKm'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ₹ / km
          </button>
          <button
            onClick={() => setActiveMetric('mileage')}
            className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
              activeMetric === 'mileage'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            km / L
          </button>
        </div>
      </div>

      {/* Interactive Chart Container */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
          <span>
            {activeMetric === 'costPerKm' ? 'Cost Per KM (Target: < ₹7.00)' : 'Mileage (km/L)'}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {chronTrips.length} data points
          </span>
        </div>

        {/* SVG Rendered Line/Bar Chart mimicking MPAndroidChart */}
        <div className="h-44 w-full relative flex items-end justify-between gap-2 pt-6 pb-4 px-2 border-b border-l border-slate-800">
          {chronTrips.map((trip, idx) => {
            const val = activeMetric === 'costPerKm' ? trip.costPerKm : trip.mileage;
            const maxVal = activeMetric === 'costPerKm' ? maxCostPerKm : maxMileage;
            const heightPercent = Math.min(Math.max((val / maxVal) * 100, 10), 100);

            const isSpike = activeMetric === 'costPerKm' && trip.costPerKm > 9.0;

            return (
              <div
                key={trip.id}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-white px-1.5 py-0.5 rounded-md pointer-events-none whitespace-nowrap border border-slate-700 z-10">
                  Trip #{idx + 1}: {val.toFixed(1)} {activeMetric === 'costPerKm' ? '₹/km' : 'km/L'}
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-500 ${
                    activeMetric === 'costPerKm'
                      ? isSpike
                        ? 'bg-gradient-to-t from-red-600 to-rose-400 shadow-sm shadow-red-500/30'
                        : 'bg-gradient-to-t from-blue-600 to-cyan-400'
                      : 'bg-gradient-to-t from-emerald-600 to-teal-400'
                  }`}
                />

                {/* X axis label */}
                <span className="text-[9px] text-slate-500 mt-1 font-mono">T{idx + 1}</span>
              </div>
            );
          })}
        </div>

        {/* Chart Legend */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-xs ${
                activeMetric === 'costPerKm' ? 'bg-blue-500' : 'bg-emerald-500'
              }`}
            />
            <span>{activeMetric === 'costPerKm' ? 'Normal Trips' : 'Mileage (km/L)'}</span>
          </div>
          {activeMetric === 'costPerKm' && (
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500" />
              <span>Abnormal Cost Spike</span>
            </div>
          )}
        </div>
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Best Mileage</span>
          </div>
          <div className="text-base font-bold text-white">
            {bestMileageTrip ? `${bestMileageTrip.mileage.toFixed(1)} km/L` : '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {bestMileageTrip ? `${bestMileageTrip.distanceKm.toFixed(0)} km trip` : ''}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Lowest Cost/KM</span>
          </div>
          <div className="text-base font-bold text-white">
            {lowestCostTrip ? `₹${lowestCostTrip.costPerKm.toFixed(2)}/km` : '--'}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">High efficiency driving</p>
        </div>
      </div>

      {/* Smart Alert Anomaly Info */}
      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-300 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Smart Cost Anomaly Detection</span>
        </div>
        <p className="text-[11px] text-amber-200/80 leading-relaxed">
          The app calculates a rolling 5-trip baseline. If current cost-per-km exceeds 130% of the
          average, an alert triggers advising tire pressure check or driving efficiency review.
        </p>
      </div>
    </div>
  );
};

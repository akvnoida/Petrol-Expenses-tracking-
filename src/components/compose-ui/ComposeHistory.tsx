import React from 'react';
import { Trip } from '../../types';
import { Calendar, Trash2, Fuel, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { formatCurrencyINR, formatKm } from '../../utils/geoUtils';

interface ComposeHistoryProps {
  trips: Trip[];
  onDeleteTrip: (id: string) => void;
  onClearAll: () => void;
}

export const ComposeHistory: React.FC<ComposeHistoryProps> = ({ trips, onDeleteTrip, onClearAll }) => {
  if (trips.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-3 text-slate-500">
          <Fuel className="w-7 h-7" />
        </div>
        <p className="font-semibold text-sm text-slate-300">No Trips Logged Yet</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px]">
          Start a trip on the Dashboard, drive to accumulate GPS distance, then save your trip!
        </p>
      </div>
    );
  }

  const totalDist = trips.reduce((acc, t) => acc + t.distanceKm, 0);
  const totalCost = trips.reduce((acc, t) => acc + t.fuelCost, 0);
  const avgCostPerKm = totalDist > 0 ? totalCost / totalDist : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 text-white">
      {/* Quick Summary Pill */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Room DB • {trips.length} Trips Saved
          </span>
          <button
            onClick={onClearAll}
            className="text-[10px] text-red-400 hover:text-red-300 font-medium px-2 py-0.5 rounded-md hover:bg-red-950/40"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="text-[10px] text-slate-400">Total Distance</div>
            <div className="text-xs font-bold text-emerald-400">{formatKm(totalDist)}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="text-[10px] text-slate-400">Total Spent</div>
            <div className="text-xs font-bold text-amber-400">{formatCurrencyINR(totalCost)}</div>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <div className="text-[10px] text-slate-400">Avg Cost/km</div>
            <div className="text-xs font-bold text-blue-400">₹{avgCostPerKm.toFixed(2)}/km</div>
          </div>
        </div>
      </div>

      {/* Trips list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {trips.map((trip) => {
          const dateStr = new Date(trip.startTime).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={trip.id}
              className={`rounded-2xl border transition-all ${
                trip.isAnomaly
                  ? 'bg-red-950/20 border-red-800/60'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
              } p-3.5`}
            >
              {/* Top row: Date & Anomaly Badge */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 mb-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{dateStr}</span>
                </div>
                <div className="flex items-center gap-2">
                  {trip.isAnomaly && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                      <AlertTriangle className="w-3 h-3" />
                      Cost Spike
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteTrip(trip.id)}
                    className="p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                    title="Delete from Room DB"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Route */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2.5">
                <span className="truncate max-w-[110px]">{trip.startLocationName}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate max-w-[110px]">{trip.endLocationName}</span>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-4 gap-1.5 py-1 text-center bg-slate-950/60 rounded-xl p-2">
                <div>
                  <div className="text-[10px] text-slate-400">Dist</div>
                  <div className="text-xs font-bold text-white">{trip.distanceKm.toFixed(1)} km</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Cost</div>
                  <div className="text-xs font-bold text-amber-400">₹{trip.fuelCost.toFixed(0)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Cost/km</div>
                  <div
                    className={`text-xs font-bold ${
                      trip.isAnomaly ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    ₹{trip.costPerKm.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Mileage</div>
                  <div className="text-xs font-bold text-blue-400">{trip.mileage.toFixed(1)} km/L</div>
                </div>
              </div>

              {/* Station refueled tag */}
              {trip.petrolPumpName && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Fuel className="w-3 h-3 text-amber-400" />
                  <span className="truncate">{trip.petrolPumpName}</span>
                </div>
              )}

              {/* Anomaly note */}
              {trip.isAnomaly && trip.anomalyReason && (
                <div className="mt-2 text-[10px] text-red-300 bg-red-950/40 p-1.5 rounded-lg border border-red-900/50">
                  {trip.anomalyReason}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

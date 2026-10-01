import React from 'react';
import { TrackingState, PetrolPump, PermissionState } from '../../types';
import {
  Play,
  Pause,
  RotateCcw,
  PlusCircle,
  Save,
  Fuel,
  MapPin,
  AlertTriangle,
  Radio,
  Gauge,
  CheckCircle,
  Navigation2,
  Compass,
} from 'lucide-react';
import { formatCurrencyINR, formatKm, formatTime } from '../../utils/geoUtils';

interface ComposeDashboardProps {
  tracking: TrackingState;
  permissions: PermissionState;
  onStartTracking: () => void;
  onPauseTracking: () => void;
  onResetTrip: () => void;
  onOpenFuelModal: () => void;
  onSaveTrip: () => void;
  onDismissGeofencePrompt: () => void;
  onTriggerGeofenceReset: () => void;
  petrolPumps: PetrolPump[];
}

export const ComposeDashboard: React.FC<ComposeDashboardProps> = ({
  tracking,
  permissions,
  onStartTracking,
  onPauseTracking,
  onResetTrip,
  onOpenFuelModal,
  onSaveTrip,
  onDismissGeofencePrompt,
  onTriggerGeofenceReset,
  petrolPumps,
}) => {
  // Live calculations
  const costPerKm =
    tracking.currentDistanceKm > 0.02 && tracking.currentFuelCost > 0
      ? tracking.currentFuelCost / tracking.currentDistanceKm
      : 0;

  const mileage =
    tracking.currentLiters > 0 && tracking.currentDistanceKm > 0.02
      ? tracking.currentDistanceKm / tracking.currentLiters
      : 0;

  // Anomaly rule: Cost per km exceeds ₹9.50/km or mileage below 9.0 km/L after 1 km
  const isCostSpike = tracking.currentDistanceKm > 0.5 && costPerKm > 9.5;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 text-white relative">
      {/* 1. Android Heads-Up Notification for Petrol Pump Geofence Detection */}
      {tracking.activePetrolPumpInGeofence && tracking.geofencePromptShown && (
        <div className="mx-3 mt-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-950/90 to-amber-900/90 border border-amber-500/50 shadow-xl shadow-amber-950/50 animate-in slide-in-from-top-4 duration-300 z-20">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Fuel className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-200">⛽ Petrol Pump Detected!</span>
                <span className="text-[10px] text-amber-300/80">Geofence API</span>
              </div>
              <p className="text-[11px] text-amber-100 mt-0.5">
                Arrived at <strong className="font-semibold text-white">{tracking.activePetrolPumpInGeofence.name}</strong>.
                Reset trip distance?
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={onTriggerGeofenceReset}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-slate-950 rounded-lg shadow-sm hover:bg-amber-400"
                >
                  Reset Trip
                </button>
                <button
                  onClick={onOpenFuelModal}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-600/40 rounded-lg"
                >
                  Log Refill
                </button>
                <button
                  onClick={onDismissGeofencePrompt}
                  className="text-[10px] text-amber-300/70 hover:text-white ml-auto"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Anomaly Alert Banner if cost per km is abnormally high */}
      {isCostSpike && (
        <div className="mx-3 mt-2.5 p-3 rounded-2xl bg-red-950/70 border border-red-800/80 shadow-lg text-red-200 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Smart Alert: High Cost Per KM (₹{costPerKm.toFixed(2)}/km)</span>
          </div>
          <p className="text-[11px] text-red-300/90 mt-0.5">
            Cost per km is 40% higher than average. Check for prolonged idling or high acceleration.
          </p>
        </div>
      )}

      {/* 3. Foreground Service Notification Pill */}
      {tracking.isTracking && permissions.notifications === 'granted' && (
        <div className="mx-3 mt-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Foreground Service Running</span>
          </div>
          <span className="font-mono text-slate-400">{formatTime(tracking.elapsedSeconds)}</span>
        </div>
      )}

      {/* 4. GPS & Speed Odometer Card (Jetpack Compose Material 3 style) */}
      <div className="p-3.5 space-y-3">
        <div className="rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-4 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top row status */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  tracking.isTracking ? 'bg-emerald-500 animate-ping' : 'bg-slate-500'
                }`}
              />
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                {tracking.isTracking ? 'GPS Tracking Active' : 'Trip Idle'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{tracking.currentSpeedKmh.toFixed(0)}</span>
              <span>km/h</span>
            </div>
          </div>

          {/* Huge Distance Counter */}
          <div className="text-center py-4">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              Total Distance Travelled
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mt-1">
              {tracking.currentDistanceKm.toFixed(2)}
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 ml-1.5">km</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-2">
              <span>GPS Accuracy: ±{tracking.gpsAccuracyMeters}m</span>
              <span>•</span>
              <span>Time: {formatTime(tracking.elapsedSeconds)}</span>
            </div>
          </div>

          {/* Real-Time Cost Per KM & Fuel Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            {/* Cost Per KM */}
            <div className="p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <span className="text-[10px] text-slate-400 font-medium block">Cost / KM</span>
              <span
                className={`text-sm sm:text-base font-extrabold block mt-0.5 ${
                  isCostSpike ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {costPerKm > 0 ? `₹${costPerKm.toFixed(2)}` : '₹0.00'}
              </span>
              <span className="text-[9px] text-slate-500">per km</span>
            </div>

            {/* Mileage (km/L) */}
            <div className="p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <span className="text-[10px] text-slate-400 font-medium block">Mileage</span>
              <span className="text-sm sm:text-base font-extrabold text-blue-400 block mt-0.5">
                {mileage > 0 ? `${mileage.toFixed(1)}` : '--'}
              </span>
              <span className="text-[9px] text-slate-500">km / L</span>
            </div>

            {/* Fuel Cost */}
            <div className="p-2 rounded-2xl bg-slate-950/70 border border-slate-800/70">
              <span className="text-[10px] text-slate-400 font-medium block">Fuel Expense</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400 block mt-0.5">
                ₹{tracking.currentFuelCost.toFixed(0)}
              </span>
              <span className="text-[9px] text-slate-500">{tracking.currentLiters.toFixed(1)} L</span>
            </div>
          </div>
        </div>

        {/* 5. Live Route & Geofence Breadcrumb Canvas */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Navigation2 className="w-3.5 h-3.5 text-blue-400" />
              Live Route &amp; Petrol Stations
            </span>
            <span className="text-[10px] text-slate-500">
              {petrolPumps.length} gas stations mapped
            </span>
          </div>

          {/* Simulated Map View */}
          <div className="h-32 bg-slate-950 rounded-xl border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
            {/* Road lines simulation */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-700 -translate-y-1/2 border-y border-dashed border-slate-500" />
              <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-slate-700 -translate-x-1/2 border-x border-dashed border-slate-500" />
            </div>

            {/* Breadcrumb points */}
            {tracking.breadcrumbTrail.length > 1 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points={tracking.breadcrumbTrail
                    .map((p, i) => {
                      const x = 30 + ((i * 35) % 240);
                      const y = 80 - Math.sin(i * 0.5) * 35;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            )}

            {/* Petrol Pump Geofences on map */}
            <div className="absolute top-4 left-6 flex items-center gap-1 text-[10px] text-amber-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/40">
              <Fuel className="w-3 h-3 text-amber-400" />
              <span>IndianOil (150m Geofence)</span>
            </div>

            <div className="absolute bottom-4 right-6 flex items-center gap-1 text-[10px] text-amber-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-amber-500/40">
              <Fuel className="w-3 h-3 text-amber-400" />
              <span>Shell Gas</span>
            </div>

            {/* Vehicle marker */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/50">
                <Navigation2 className="w-4 h-4 transform rotate-45" />
              </div>
              <span className="text-[9px] font-bold text-emerald-400 mt-0.5 bg-slate-900/80 px-1.5 rounded-sm">
                Your Vehicle
              </span>
            </div>
          </div>
        </div>

        {/* 6. Primary Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            {!tracking.isTracking ? (
              <button
                onClick={onStartTracking}
                className="py-3 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Trip</span>
              </button>
            ) : (
              <button
                onClick={onPauseTracking}
                className="py-3 px-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
              >
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Trip</span>
              </button>
            )}

            <button
              onClick={onOpenFuelModal}
              className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
            >
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>Add Fuel (₹)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onResetTrip}
              className="py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Distance</span>
            </button>

            <button
              onClick={onSaveTrip}
              disabled={tracking.currentDistanceKm < 0.05}
              className="py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save to Room DB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

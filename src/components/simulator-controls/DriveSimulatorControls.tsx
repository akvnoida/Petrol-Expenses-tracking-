import React from 'react';
import {
  TrackingState,
  PermissionState,
  PetrolPump,
} from '../../types';
import {
  Play,
  Pause,
  Zap,
  MapPin,
  AlertTriangle,
  Radio,
  Sliders,
  Database,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Compass,
} from 'lucide-react';

interface DriveSimulatorControlsProps {
  tracking: TrackingState;
  permissions: PermissionState;
  petrolPumps: PetrolPump[];
  onStartTracking: () => void;
  onPauseTracking: () => void;
  onAddSimulatedDistance: (km: number) => void;
  onTriggerGeofenceEnter: (pump: PetrolPump) => void;
  onTriggerAnomaly: () => void;
  onResetDistance: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
  useRealGps: boolean;
  onToggleRealGps: () => void;
}

export const DriveSimulatorControls: React.FC<DriveSimulatorControlsProps> = ({
  tracking,
  permissions,
  petrolPumps,
  onStartTracking,
  onPauseTracking,
  onAddSimulatedDistance,
  onTriggerGeofenceEnter,
  onTriggerAnomaly,
  onResetDistance,
  speed,
  setSpeed,
  useRealGps,
  onToggleRealGps,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl text-white space-y-5">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-bold tracking-tight text-white">
              Android Service &amp; Sensor Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test Foreground Service, FusedLocation, Geofencing &amp; Alerts in real time.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
          FusedLocation API
        </span>
      </div>

      {/* 1. Drive Speed & Simulation Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Simulated Driving Speed</span>
          </label>
          <span className="text-xs font-bold text-emerald-400 font-mono">{speed} km/h</span>
        </div>

        <input
          type="range"
          min="10"
          max="120"
          step="5"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          disabled={!tracking.isTracking}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>City (25 km/h)</span>
          <span>Arterial (50 km/h)</span>
          <span>Highway (100 km/h)</span>
        </div>

        {/* Quick Distance Increments */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAddSimulatedDistance(2.5)}
            className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>+2.5 km</span>
          </button>
          <button
            onClick={() => onAddSimulatedDistance(10.0)}
            className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>+10.0 km</span>
          </button>
          <button
            onClick={() => onAddSimulatedDistance(25.0)}
            className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 rounded-xl text-xs font-medium text-slate-300 transition-colors flex items-center justify-center gap-1"
          >
            <Zap className="w-3 h-3 text-blue-400" />
            <span>+25.0 km</span>
          </button>
        </div>
      </div>

      {/* 2. Geofence Petrol Pump Trigger */}
      <div className="space-y-2.5 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Petrol Pump Geofence Trigger</span>
          </label>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            Geofence Event
          </span>
        </div>
        <p className="text-[11px] text-slate-400">
          Simulate vehicle entering a 150-meter radius around a gas station to test the heads-up
          reset notification.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {petrolPumps.slice(0, 2).map((pump) => (
            <button
              key={pump.id}
              onClick={() => onTriggerGeofenceEnter(pump)}
              className="p-2.5 bg-slate-800/90 hover:bg-amber-950/40 hover:border-amber-500/50 border border-slate-700/80 rounded-xl text-left transition-all group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-amber-300 truncate">
                {pump.name}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Trigger Geofence Enter &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Smart Anomaly Alert Trigger */}
      <div className="space-y-2 pt-3 border-t border-slate-800">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span>Smart Cost Anomaly Test</span>
        </label>
        <p className="text-[11px] text-slate-400">
          Simulate an abnormal traffic jam or high fuel spend causing cost-per-km to spike above
          ₹11.00/km.
        </p>
        <button
          onClick={onTriggerAnomaly}
          className="w-full py-2 px-3 bg-red-950/40 hover:bg-red-900/60 border border-red-800/80 rounded-xl text-xs font-semibold text-red-200 transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span>Simulate Abnormal Cost Spike</span>
        </button>
      </div>

      {/* 4. Real Browser GPS Toggle */}
      <div className="space-y-2 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs font-semibold text-slate-300">Live Device GPS</span>
          </div>
          <button
            onClick={onToggleRealGps}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              useRealGps
                ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {useRealGps ? 'GPS Connected' : 'Use Device GPS'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          {useRealGps
            ? 'Connected to physical device GPS stream via navigator.geolocation. Distance increments as you move.'
            : 'Using synthetic realistic city driving simulator.'}
        </p>
      </div>

      {/* 5. Room Database Status */}
      <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 font-medium text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            Room SQLite Status
          </span>
          <span className="text-emerald-400 font-mono text-[11px]">FLOW_CONNECTED</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Database: <span className="text-slate-200">fuel_tracker_database</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Entity: <span className="text-slate-200">TripEntity (Room 2.6.1)</span>
        </div>
      </div>
    </div>
  );
};

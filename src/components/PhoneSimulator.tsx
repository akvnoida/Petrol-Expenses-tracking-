import React, { useState } from 'react';
import {
  TrackingState,
  PermissionState,
  Trip,
  PetrolPump,
} from '../types';
import { ComposeDashboard } from './compose-ui/ComposeDashboard';
import { ComposeHistory } from './compose-ui/ComposeHistory';
import { ComposeAnalytics } from './compose-ui/ComposeAnalytics';
import { ComposePermissionsModal } from './compose-ui/ComposePermissionsModal';
import { ComposeFuelModal } from './compose-ui/ComposeFuelModal';
import {
  Home,
  History,
  BarChart3,
  Shield,
  Wifi,
  Signal,
  Battery,
  Fuel,
  Sparkles,
} from 'lucide-react';

interface PhoneSimulatorProps {
  tracking: TrackingState;
  permissions: PermissionState;
  trips: Trip[];
  petrolPumps: PetrolPump[];
  onStartTracking: () => void;
  onPauseTracking: () => void;
  onResetTrip: () => void;
  onSaveFuel: (amount: number, liters: number, stationName?: string) => void;
  onSaveTrip: () => void;
  onDeleteTrip: (id: string) => void;
  onClearTrips: () => void;
  onTogglePermission: (key: keyof PermissionState) => void;
  onDismissGeofencePrompt: () => void;
  onTriggerGeofenceReset: () => void;
}

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  tracking,
  permissions,
  trips,
  petrolPumps,
  onStartTracking,
  onPauseTracking,
  onResetTrip,
  onSaveFuel,
  onSaveTrip,
  onDeleteTrip,
  onClearTrips,
  onTogglePermission,
  onDismissGeofencePrompt,
  onTriggerGeofenceReset,
}) => {
  const [activeBottomNav, setActiveBottomNav] = useState<'dashboard' | 'history' | 'analytics' | 'permissions'>('dashboard');
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);

  // Time formatted for Android status bar
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative mx-auto flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Outer Phone Shell */}
      <div className="w-[360px] sm:w-[380px] h-[780px] bg-slate-900 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 shadow-slate-950/80 border-4 border-slate-700/80 relative flex flex-col overflow-hidden">
        {/* Physical hardware volume rocker buttons simulation */}
        <div className="absolute -left-5 top-28 w-1.5 h-16 bg-slate-700 rounded-l-md" />
        <div className="absolute -left-5 top-48 w-1.5 h-12 bg-slate-700 rounded-l-md" />
        {/* Power button */}
        <div className="absolute -right-5 top-36 w-1.5 h-20 bg-slate-700 rounded-r-md" />

        {/* Screen bezel & display container */}
        <div className="w-full h-full bg-slate-950 rounded-[38px] overflow-hidden flex flex-col border border-slate-800 relative shadow-inner">
          {/* 1. Android Status Bar with Camera Punch-Hole */}
          <div className="h-10 px-6 flex items-center justify-between bg-slate-950 text-slate-400 text-xs font-semibold select-none z-30 shrink-0">
            {/* Clock */}
            <span className="text-[12px] text-white font-medium">{currentTime}</span>

            {/* Camera Punch Hole */}
            <div className="w-4 h-4 rounded-full bg-black ring-1 ring-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* System Status Icons */}
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5 text-[11px]">
                <span className="font-mono">88%</span>
                <Battery className="w-4 h-4 fill-slate-300" />
              </div>
            </div>
          </div>

          {/* 2. Compose Top App Bar */}
          <div className="h-12 px-4 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Fuel className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">Fuel Tracker Pro</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveBottomNav('permissions')}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
                title="Android Permissions"
              >
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3. Main Screen View Switching (Jetpack Compose View Container) */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {activeBottomNav === 'dashboard' && (
              <ComposeDashboard
                tracking={tracking}
                permissions={permissions}
                onStartTracking={onStartTracking}
                onPauseTracking={onPauseTracking}
                onResetTrip={onResetTrip}
                onOpenFuelModal={() => setIsFuelModalOpen(true)}
                onSaveTrip={onSaveTrip}
                onDismissGeofencePrompt={onDismissGeofencePrompt}
                onTriggerGeofenceReset={onTriggerGeofenceReset}
                petrolPumps={petrolPumps}
              />
            )}

            {activeBottomNav === 'history' && (
              <ComposeHistory
                trips={trips}
                onDeleteTrip={onDeleteTrip}
                onClearAll={onClearTrips}
              />
            )}

            {activeBottomNav === 'analytics' && (
              <ComposeAnalytics trips={trips} />
            )}

            {activeBottomNav === 'permissions' && (
              <ComposePermissionsModal
                permissions={permissions}
                onTogglePermission={onTogglePermission}
              />
            )}

            {/* Fuel Input Dialog Bottom Sheet */}
            <ComposeFuelModal
              isOpen={isFuelModalOpen}
              onClose={() => setIsFuelModalOpen(false)}
              onSaveFuel={onSaveFuel}
              availablePumps={petrolPumps}
              preselectedPump={tracking.activePetrolPumpInGeofence}
            />
          </div>

          {/* 4. Jetpack Compose Material 3 Navigation Bar */}
          <div className="h-14 bg-slate-900 border-t border-slate-800/80 px-4 flex items-center justify-around z-20 shrink-0">
            <button
              onClick={() => setActiveBottomNav('dashboard')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeBottomNav === 'dashboard'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="text-[10px]">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveBottomNav('history')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all relative ${
                activeBottomNav === 'history'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="text-[10px]">Trips ({trips.length})</span>
            </button>

            <button
              onClick={() => setActiveBottomNav('analytics')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeBottomNav === 'analytics'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-[10px]">Analytics</span>
            </button>

            <button
              onClick={() => setActiveBottomNav('permissions')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeBottomNav === 'permissions'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span className="text-[10px]">Permissions</span>
            </button>
          </div>

          {/* 5. Android Gesture Navigation Bar Pill */}
          <div className="h-4 bg-slate-900 flex items-center justify-center shrink-0">
            <div className="w-24 h-1 bg-slate-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

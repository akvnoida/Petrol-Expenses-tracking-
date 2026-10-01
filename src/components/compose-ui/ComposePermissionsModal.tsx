import React from 'react';
import { PermissionState } from '../../types';
import { ShieldCheck, MapPin, Bell, BatteryCharging, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ComposePermissionsModalProps {
  permissions: PermissionState;
  onTogglePermission: (key: keyof PermissionState) => void;
}

export const ComposePermissionsModal: React.FC<ComposePermissionsModalProps> = ({
  permissions,
  onTogglePermission,
}) => {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950 p-3.5 space-y-3.5 text-white">
      <div>
        <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
          Android 14+ Runtime Permissions
        </span>
        <h3 className="text-sm font-bold text-white">Permission &amp; Battery State</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Simulates granting or revoking native Android OS permissions to test fallback handling.
        </p>
      </div>

      <div className="space-y-2.5">
        {/* Fine Location */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ACCESS_FINE_LOCATION</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Enables GPS satellite fix via FusedLocationProviderClient for high-precision distance.
              </p>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission('fineLocation')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              permissions.fineLocation === 'granted'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-red-600/30 text-red-400 border border-red-500/40'
            }`}
          >
            {permissions.fineLocation === 'granted' ? 'Granted' : 'Denied'}
          </button>
        </div>

        {/* Background Location */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">ACCESS_BACKGROUND_LOCATION</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Allows distance calculation and petrol station geofences when app is minimized or screen is locked.
              </p>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission('backgroundLocation')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              permissions.backgroundLocation === 'granted'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-red-600/30 text-red-400 border border-red-500/40'
            }`}
          >
            {permissions.backgroundLocation === 'granted' ? 'Granted' : 'Denied'}
          </button>
        </div>

        {/* Notifications */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">POST_NOTIFICATIONS (Android 13+)</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Displays persistent foreground service notification &amp; petrol pump geofence heads-up popups.
              </p>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission('notifications')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              permissions.notifications === 'granted'
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-red-600/30 text-red-400 border border-red-500/40'
            }`}
          >
            {permissions.notifications === 'granted' ? 'Granted' : 'Denied'}
          </button>
        </div>

        {/* Battery Optimization */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 shrink-0 mt-0.5">
              <BatteryCharging className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Battery Optimization Whitelist</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Prevents Android Doze mode from restricting GPS intervals during long road trips.
              </p>
            </div>
          </div>
          <button
            onClick={() => onTogglePermission('batteryOptimizationIgnored')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              permissions.batteryOptimizationIgnored
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {permissions.batteryOptimizationIgnored ? 'Whitelisted' : 'Optimized'}
          </button>
        </div>
      </div>

      {/* Developer note */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
        💡 <strong className="text-slate-300">Android Best Practice:</strong> In modern Android (API 30+),
        never request Foreground and Background location simultaneously. Google Play will reject the app.
        Always request foreground first, explain why background is needed, then route the user to
        Android Settings to select "Allow all the time".
      </div>
    </div>
  );
};

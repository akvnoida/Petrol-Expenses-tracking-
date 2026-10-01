import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  MapPin,
  Fuel,
  Calculator,
  ShieldCheck,
  BatteryCharging,
  Bell,
  Code2,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('overview');

  const sections = [
    { id: 'overview', title: '1. Architecture & System Overview', icon: Layers },
    { id: 'distance', title: '2. GPS Tracking & Haversine Distance', icon: MapPin },
    { id: 'foreground', title: '3. Foreground Service & Screen-Off Tracking', icon: Cpu },
    { id: 'room', title: '4. Room Database & Reactive Flow', icon: BookOpen },
    { id: 'calculations', title: '5. Cost/KM & Mileage Formulas', icon: Calculator },
    { id: 'geofence', title: '6. Petrol Pump Geofencing & Places API', icon: Fuel },
    { id: 'alerts', title: '7. Smart Anomaly Spike Detection', icon: AlertTriangle },
    { id: 'battery', title: '8. Battery Optimization & Permissions', icon: BatteryCharging },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[780px]">
      {/* Table of contents sidebar */}
      <div className="w-full md:w-72 border-b md:border-b-0 md:border-r border-slate-800 p-3 bg-slate-950/60 overflow-y-auto shrink-0">
        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Architecture Chapters
        </div>
        <div className="space-y-1">
          {sections.map((s) => {
            const Icon = s.icon;
            const isSelected = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span className="truncate">{s.title}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Content Display */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950 text-slate-300 space-y-6">
        {activeSection === 'overview' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">System Architecture &amp; Pattern</h2>
                <p className="text-xs text-slate-400">
                  Modern Android MVVM (Model-View-ViewModel) + Repository Pattern + Clean Architecture
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400">Why MVVM for Fuel Tracking?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When tracking high-frequency GPS coordinates while updating fuel figures, the UI must
                never block the main thread. We decouple data collection from presentation:
              </p>
              <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                <li>
                  <strong className="text-white">Model:</strong> Room Database (
                  <code className="text-emerald-300">TripEntity</code>,{' '}
                  <code className="text-emerald-300">FuelDao</code>) storing trips locally in SQLite.
                </li>
                <li>
                  <strong className="text-white">Foreground Service:</strong> Autonomous background
                  worker (<code className="text-emerald-300">LocationTrackingService</code>) reading
                  from <code className="text-emerald-300">FusedLocationProviderClient</code>.
                </li>
                <li>
                  <strong className="text-white">ViewModel:</strong>{' '}
                  <code className="text-emerald-300">FuelTrackerViewModel</code> exposes reactive
                  Kotlin <code className="text-emerald-300">StateFlow</code> to Jetpack Compose.
                </li>
                <li>
                  <strong className="text-white">View (Jetpack Compose):</strong> Declarative UI
                  re-renders automatically whenever distance or cost values update.
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <h4 className="text-xs font-bold text-white mb-2">Data Flow Pipeline</h4>
              <div className="font-mono text-[11px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 space-y-1">
                <div>[GPS Satellites] ──&gt; FusedLocationProviderClient</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ (onLocationResult every 3s)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;LocationTrackingService (WakeLock active)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;│ Location.distanceBetween()</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▼</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;FuelTrackerViewModel (Calculates Cost/Km)</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&gt; Jetpack Compose Dashboard</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&gt; Room Database (Trips Table)</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'distance' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Distance Tracking with GPS</h2>
                <p className="text-xs text-slate-400">
                  Using Google Play Services FusedLocationProviderClient &amp; Haversine Distance
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-blue-400">High Precision &amp; Noise Filtering</h3>
              <p className="text-xs leading-relaxed">
                Raw GPS signals jitter. When standing at a traffic light, raw coordinates wobble by
                3-10 meters every second. If you naively add this up, a stationary vehicle would log 1.5 km
                per hour of fake distance!
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <strong className="text-white block font-semibold">How our code eliminates noise:</strong>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>
                    <strong>Accuracy threshold:</strong> Discard any GPS fix where{' '}
                    <code className="text-emerald-300">location.accuracy &gt; 25 meters</code>.
                  </li>
                  <li>
                    <strong>Displacement threshold:</strong> Only register movement if{' '}
                    <code className="text-emerald-300">deltaDistance &gt; 2.0 meters</code>.
                  </li>
                  <li>
                    <strong>Speed sanity check:</strong> Discard improbable coordinate teleportation
                    exceeding highway limits (&gt; 150 km/h).
                  </li>
                </ol>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white">Native Haversine Implementation</h4>
              <p className="text-xs text-slate-400">
                Instead of slow trigonometric JavaScript approximations, Android provides a native
                C++ optimized WGS84 ellipsoid calculation:
              </p>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-emerald-300 font-mono overflow-x-auto">
{`val distanceResults = FloatArray(1)
Location.distanceBetween(
    previousLocation.latitude,
    previousLocation.longitude,
    newLocation.latitude,
    newLocation.longitude,
    distanceResults
)
val distanceMeters = distanceResults[0]`}
              </pre>
            </div>
          </div>
        )}

        {activeSection === 'foreground' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Foreground Service &amp; Screen-Off Tracking</h2>
                <p className="text-xs text-slate-400">
                  How to prevent Android OS from killing tracking when the phone is locked
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-purple-400">The Screen-Off Problem in Android</h3>
              <p className="text-xs leading-relaxed">
                Android 8.0+ aggressively kills background background apps to preserve battery.
                Furthermore, Android 14+ introduces mandatory foreground service types. Without a
                Foreground Service of type <code className="text-emerald-300">location</code>:
              </p>
              <ul className="text-xs space-y-1.5 list-disc list-inside text-slate-300">
                <li>Location updates throttle to once every 15-30 minutes.</li>
                <li>The CPU goes to deep sleep (Doze mode) turning off GPS chipsets.</li>
                <li>Android Low Memory Killer (LMK) terminates your app after 60 seconds.</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">The Production Solution</h3>
              <div className="space-y-2 text-xs">
                <p>
                  1. <strong>Foreground Service:</strong> Call{' '}
                  <code className="text-emerald-300">startForeground(NOTIFICATION_ID, notification)</code>{' '}
                  within 5 seconds of launch.
                </p>
                <p>
                  2. <strong>WakeLock:</strong> Acquire a{' '}
                  <code className="text-emerald-300">PowerManager.PARTIAL_WAKE_LOCK</code> with a safe
                  4-hour timeout to keep the CPU calculating while the display is powered down.
                </p>
                <p>
                  3. <strong>Foreground Service Type:</strong> In AndroidManifest.xml, declare{' '}
                  <code className="text-emerald-300">android:foregroundServiceType="location"</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'room' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Room Database &amp; Reactive Flow</h2>
                <p className="text-xs text-slate-400">
                  SQLite persistence, TypeConverters, and real-time Kotlin Flow observables
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-amber-400">Local Persistence Without Network</h3>
              <p className="leading-relaxed">
                Fuel logs and trip metrics must never require an active internet connection. Room
                provides an abstraction over SQLite with compile-time SQL verification via KSP.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                <span className="text-emerald-400">@Dao</span>
                <br />
                interface FuelDao &#123;
                <br />
                &nbsp;&nbsp;@Query("SELECT * FROM trips ORDER BY startTimeMillis DESC")
                <br />
                &nbsp;&nbsp;fun getAllTrips(): <strong>Flow&lt;List&lt;TripEntity&gt;&gt;</strong>
                <br />
                &#125;
              </div>
              <p className="text-slate-400">
                By returning <code className="text-emerald-300">Flow&lt;List&lt;TripEntity&gt;&gt;</code>,
                any new trip saved in the database instantly pushes a new state to the Jetpack
                Compose UI without manual refresh calls!
              </p>
            </div>
          </div>
        )}

        {activeSection === 'calculations' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cost Per KM &amp; Mileage Calculations</h2>
                <p className="text-xs text-slate-400">
                  Real-time mathematical formulas and zero-division guards
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-emerald-400 text-sm">1. Cost Per KM (₹/km)</h3>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-center text-white">
                  cost_per_km = total_fuel_cost / total_distance
                </div>
                <p className="text-slate-400">
                  Guarded with <code className="text-emerald-300">distance &gt; 0.05 km</code> to prevent
                  division-by-zero or infinite values during initial trip departure.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <h3 className="font-bold text-blue-400 text-sm">2. Mileage (km/L)</h3>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-center text-white">
                  mileage = total_distance / liters_consumed
                </div>
                <p className="text-slate-400">
                  Computes realistic fuel consumption efficiency based on actual GPS distance and liters
                  pumped into the tank.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'geofence' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Petrol Pump Geofence &amp; Places API</h2>
                <p className="text-xs text-slate-400">
                  Detecting arrival at gas stations &amp; triggering the "Reset Trip?" dialog
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-rose-400">The Two-Phase Hybrid Approach</h3>
              <p className="leading-relaxed">
                Constantly polling the Google Places API every 5 seconds drains user battery and burns
                API quota credits. The professional Android approach uses a hybrid strategy:
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-1">
                    Phase 1: Places API Search (Low Frequency)
                  </strong>
                  Query gas stations of type <code className="text-emerald-300">gas_station</code> once
                  every 15-20 kilometers or on major corridor changes.
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-1">
                    Phase 2: Android Hardware Geofencing (Zero-Battery)
                  </strong>
                  Register a 150m circular geofence with{' '}
                  <code className="text-emerald-300">GeofencingClient</code>. The hardware GPS baseband
                  wakes up <code className="text-emerald-300">GeofenceBroadcastReceiver</code> only when
                  crossing the perimeter, consuming zero CPU cycles while driving on the highway!
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'alerts' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Smart Anomaly Detection Algorithm</h2>
                <p className="text-xs text-slate-400">
                  Detecting abnormal spikes in cost-per-km before they waste fuel
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-amber-400">Rolling Baseline Thresholding</h3>
              <p className="leading-relaxed">
                The app executes a Room query for the last 5 trips:{' '}
                <code className="text-emerald-300">SELECT AVG(costPerKm) FROM trips LIMIT 5</code>.
              </p>
              <p className="leading-relaxed">
                If the active trip cost per km exceeds{' '}
                <code className="text-emerald-300">recentAverage * 1.30</code> (30% above normal):
              </p>
              <div className="p-3 bg-red-950/40 rounded-xl border border-red-800/60 text-red-200">
                🚨 <strong>Heads-Up Warning:</strong> "High fuel cost detected: ₹11.65/km (Spike above normal
                avg ₹6.70/km). Check tire pressure or reduce high-RPM acceleration."
              </div>
            </div>
          </div>
        )}

        {activeSection === 'battery' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <BatteryCharging className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Battery Optimization &amp; Permissions</h2>
                <p className="text-xs text-slate-400">
                  Compliant Android 10+ background location flow &amp; Doze mode handling
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-teal-400">Google Play Policy Compliance</h3>
              <p className="leading-relaxed">
                Starting with Android 10 (API 29), Google prohibits apps from requesting foreground and
                background location at the same time. Doing so results in automatic Play Store
                rejection.
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-0.5">Step 1:</strong> Request{' '}
                  <code className="text-emerald-300">ACCESS_FINE_LOCATION</code> and{' '}
                  <code className="text-emerald-300">ACCESS_COARSE_LOCATION</code>.
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-0.5">Step 2:</strong> Once granted, show an
                  in-app explanation dialog explaining why background tracking is required when the screen
                  is off.
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <strong className="text-white block mb-0.5">Step 3:</strong> Request{' '}
                  <code className="text-emerald-300">ACCESS_BACKGROUND_LOCATION</code>, directing the
                  user to system settings to pick "Allow all the time".
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

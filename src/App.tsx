import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PhoneSimulator } from './components/PhoneSimulator';
import { DriveSimulatorControls } from './components/simulator-controls/DriveSimulatorControls';
import { CodeExplorer } from './components/code-explorer/CodeExplorer';
import { ArchitectureGuide } from './components/guide/ArchitectureGuide';
import {
  TrackingState,
  PermissionState,
  Trip,
  PetrolPump,
} from './types';
import { INITIAL_PETROL_PUMPS, INITIAL_TRIPS } from './data/mockData';
import { calculateHaversineDistanceKm } from './utils/geoUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'guide'>('simulator');

  // Tracking state mimicking Android LocationTrackingService
  const [tracking, setTracking] = useState<TrackingState>({
    isTracking: false,
    isPaused: false,
    currentDistanceKm: 14.8,
    currentSpeedKmh: 48,
    elapsedSeconds: 1140, // 19 minutes
    currentLat: 28.6139,
    currentLng: 77.209,
    gpsAccuracyMeters: 4,
    currentFuelCost: 350,
    currentLiters: 3.62,
    breadcrumbTrail: [
      { lat: 28.601, lng: 77.2 },
      { lat: 28.608, lng: 77.205 },
      { lat: 28.6139, lng: 77.209 },
    ],
    activePetrolPumpInGeofence: null,
    geofencePromptShown: false,
  });

  // Driving speed setting (km/h) for the simulation
  const [simulatedSpeed, setSimulatedSpeed] = useState<number>(50);

  // Android OS runtime permissions state
  const [permissions, setPermissions] = useState<PermissionState>({
    fineLocation: 'granted',
    backgroundLocation: 'granted',
    notifications: 'granted',
    batteryOptimizationIgnored: true,
  });

  // Simulated Room Database persistent table for trips
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [petrolPumps] = useState<PetrolPump[]>(INITIAL_PETROL_PUMPS);
  const [useRealGps, setUseRealGps] = useState<boolean>(false);

  const realGpsWatchId = useRef<number | null>(null);
  const lastRealCoords = useRef<{ lat: number; lng: number } | null>(null);

  // 1. Simulation Timer: Advances distance & time when tracking is active
  useEffect(() => {
    if (!tracking.isTracking || tracking.isPaused) return;

    const interval = setInterval(() => {
      setTracking((prev) => {
        // Distance increment: (speed km/h / 3600 seconds)
        const kmPerSecond = simulatedSpeed / 3600;
        const newDist = prev.currentDistanceKm + kmPerSecond;
        const newSeconds = prev.elapsedSeconds + 1;

        // Slight speed fluctuation (+/- 3 km/h for realism)
        const jitter = (Math.random() - 0.5) * 4;
        const actualSpeed = Math.max(15, Math.min(130, simulatedSpeed + jitter));

        // Coordinate drift simulation (heading northeast)
        const newLat = prev.currentLat + 0.00015;
        const newLng = prev.currentLng + 0.00018;

        const newTrail = [
          ...prev.breadcrumbTrail.slice(-25),
          { lat: newLat, lng: newLng },
        ];

        return {
          ...prev,
          currentDistanceKm: newDist,
          currentSpeedKmh: actualSpeed,
          elapsedSeconds: newSeconds,
          currentLat: newLat,
          currentLng: newLng,
          breadcrumbTrail: newTrail,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tracking.isTracking, tracking.isPaused, simulatedSpeed]);

  // 2. Real Browser GPS watcher (optional toggle)
  useEffect(() => {
    if (useRealGps && tracking.isTracking && 'geolocation' in navigator) {
      realGpsWatchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed } = position.coords;
          if (lastRealCoords.current) {
            const deltaKm = calculateHaversineDistanceKm(
              lastRealCoords.current.lat,
              lastRealCoords.current.lng,
              latitude,
              longitude
            );
            // Only register movement above 3 meters
            if (deltaKm > 0.003) {
              setTracking((prev) => ({
                ...prev,
                currentDistanceKm: prev.currentDistanceKm + deltaKm,
                currentLat: latitude,
                currentLng: longitude,
                gpsAccuracyMeters: Math.round(accuracy),
                currentSpeedKmh: speed ? speed * 3.6 : prev.currentSpeedKmh,
                breadcrumbTrail: [
                  ...prev.breadcrumbTrail.slice(-25),
                  { lat: latitude, lng: longitude },
                ],
              }));
            }
          }
          lastRealCoords.current = { lat: latitude, lng: longitude };
        },
        (err) => console.warn('Real GPS Error:', err.message),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    } else {
      if (realGpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(realGpsWatchId.current);
        realGpsWatchId.current = null;
      }
      lastRealCoords.current = null;
    }

    return () => {
      if (realGpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(realGpsWatchId.current);
      }
    };
  }, [useRealGps, tracking.isTracking]);

  // Start Trip tracking
  const handleStartTracking = () => {
    setTracking((prev) => ({
      ...prev,
      isTracking: true,
      isPaused: false,
    }));
  };

  // Pause Trip tracking
  const handlePauseTracking = () => {
    setTracking((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  };

  // Reset Trip Distance
  const handleResetTrip = () => {
    setTracking((prev) => ({
      ...prev,
      currentDistanceKm: 0.0,
      currentFuelCost: 0,
      currentLiters: 0,
      elapsedSeconds: 0,
      breadcrumbTrail: [],
      activePetrolPumpInGeofence: null,
      geofencePromptShown: false,
    }));
  };

  // Add Simulated Distance
  const handleAddSimulatedDistance = (km: number) => {
    setTracking((prev) => ({
      ...prev,
      currentDistanceKm: prev.currentDistanceKm + km,
      breadcrumbTrail: [
        ...prev.breadcrumbTrail,
        { lat: prev.currentLat + 0.002, lng: prev.currentLng + 0.002 },
      ],
    }));
  };

  // Trigger Petrol Pump Geofence event
  const handleTriggerGeofenceEnter = (pump: PetrolPump) => {
    setTracking((prev) => ({
      ...prev,
      activePetrolPumpInGeofence: pump,
      geofencePromptShown: true,
    }));
  };

  // Trigger abnormal cost anomaly
  const handleTriggerAnomaly = () => {
    setTracking((prev) => ({
      ...prev,
      // Add high fuel cost relative to a short distance to produce spike > ₹11/km
      currentFuelCost: prev.currentFuelCost + 450,
      currentLiters: prev.currentLiters + 4.65,
      currentDistanceKm: Math.max(prev.currentDistanceKm, 1.2),
    }));
  };

  // Save active fuel entry from modal
  const handleSaveFuel = (amount: number, liters: number, stationName?: string) => {
    setTracking((prev) => ({
      ...prev,
      currentFuelCost: prev.currentFuelCost + amount,
      currentLiters: prev.currentLiters + liters,
      activePetrolPumpInGeofence: stationName
        ? {
            id: 'refueled',
            name: stationName,
            brand: 'IndianOil',
            lat: prev.currentLat,
            lng: prev.currentLng,
            address: 'Recent Refuel Station',
            fuelPrice: 96.72,
          }
        : prev.activePetrolPumpInGeofence,
      geofencePromptShown: false,
    }));
  };

  // Save current trip to Room DB
  const handleSaveTrip = () => {
    if (tracking.currentDistanceKm < 0.05) return;

    const costPerKm =
      tracking.currentDistanceKm > 0 && tracking.currentFuelCost > 0
        ? tracking.currentFuelCost / tracking.currentDistanceKm
        : 6.5;

    const mileage =
      tracking.currentLiters > 0 && tracking.currentDistanceKm > 0
        ? tracking.currentDistanceKm / tracking.currentLiters
        : 14.5;

    const isAnomaly = costPerKm > 9.5;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      startTime: Date.now() - tracking.elapsedSeconds * 1000,
      endTime: Date.now(),
      distanceKm: tracking.currentDistanceKm,
      fuelCost: tracking.currentFuelCost > 0 ? tracking.currentFuelCost : 250,
      litersFilled: tracking.currentLiters > 0 ? tracking.currentLiters : 2.58,
      costPerKm,
      mileage,
      fuelPricePerLiter: 96.72,
      startLocationName: 'Central Point',
      endLocationName: 'Outer Ring Bypass',
      petrolPumpName: tracking.activePetrolPumpInGeofence?.name,
      isAnomaly,
      anomalyReason: isAnomaly
        ? `Abnormal cost: ₹${costPerKm.toFixed(2)}/km (Exceeded threshold ₹9.50/km)`
        : undefined,
      coordinates: [],
    };

    setTrips((prev) => [newTrip, ...prev]);

    // Reset current active trip after storing to Room DB
    handleResetTrip();
  };

  // Delete trip from simulated Room DB
  const handleDeleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearTrips = () => {
    setTrips([]);
  };

  // Toggle permission
  const handleTogglePermission = (key: keyof PermissionState) => {
    setPermissions((prev) => {
      if (typeof prev[key] === 'boolean') {
        return { ...prev, [key]: !prev[key] };
      }
      return {
        ...prev,
        [key]: prev[key] === 'granted' ? 'denied' : 'granted',
      };
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Navigation & Status Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isTracking={tracking.isTracking}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: Interactive Android Phone Simulator */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <PhoneSimulator
                tracking={tracking}
                permissions={permissions}
                trips={trips}
                petrolPumps={petrolPumps}
                onStartTracking={handleStartTracking}
                onPauseTracking={handlePauseTracking}
                onResetTrip={handleResetTrip}
                onSaveFuel={handleSaveFuel}
                onSaveTrip={handleSaveTrip}
                onDeleteTrip={handleDeleteTrip}
                onClearTrips={handleClearTrips}
                onTogglePermission={handleTogglePermission}
                onDismissGeofencePrompt={() =>
                  setTracking((p) => ({ ...p, geofencePromptShown: false }))
                }
                onTriggerGeofenceReset={handleResetTrip}
              />
            </div>

            {/* Right 5 Columns: Sensor, Drive & Geofence Simulator Panel */}
            <div className="lg:col-span-5 space-y-6">
              <DriveSimulatorControls
                tracking={tracking}
                permissions={permissions}
                petrolPumps={petrolPumps}
                onStartTracking={handleStartTracking}
                onPauseTracking={handlePauseTracking}
                onAddSimulatedDistance={handleAddSimulatedDistance}
                onTriggerGeofenceEnter={handleTriggerGeofenceEnter}
                onTriggerAnomaly={handleTriggerAnomaly}
                onResetDistance={handleResetTrip}
                speed={simulatedSpeed}
                setSpeed={setSimulatedSpeed}
                useRealGps={useRealGps}
                onToggleRealGps={() => setUseRealGps(!useRealGps)}
              />

              {/* Quick Android Studio Integration Card */}
              <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Full Kotlin Codebase Included</span>
                  <button
                    onClick={() => setActiveTab('code')}
                    className="text-emerald-400 font-semibold hover:underline"
                  >
                    Open IDE View &rarr;
                  </button>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Includes complete Room database entities, DAO, singleton, Location Foreground
                  Service with Wakelock, and Jetpack Compose screens. Click &quot;Export Project (.ZIP)&quot; to download the complete Android Studio project!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="w-full">
            <CodeExplorer />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="w-full">
            <ArchitectureGuide />
          </div>
        )}
      </main>
    </div>
  );
}

export interface Trip {
  id: string;
  startTime: number;
  endTime?: number;
  distanceKm: number;
  fuelCost: number; // in ₹
  litersFilled: number; // in L
  costPerKm: number; // ₹ / km
  mileage: number; // km / L
  fuelPricePerLiter: number; // ₹ / L
  startLocationName: string;
  endLocationName: string;
  petrolPumpName?: string;
  isAnomaly: boolean;
  anomalyReason?: string;
  coordinates: Array<{ lat: number; lng: number; timestamp: number; speed: number }>;
}

export interface PetrolPump {
  id: string;
  name: string;
  brand: 'IndianOil' | 'Shell' | 'Bharat Petroleum' | 'HP' | 'Nayara';
  lat: number;
  lng: number;
  address: string;
  fuelPrice: number; // ₹ per liter
  distanceMeters?: number;
}

export interface TrackingState {
  isTracking: boolean;
  isPaused: boolean;
  currentDistanceKm: number;
  currentSpeedKmh: number;
  elapsedSeconds: number;
  currentLat: number;
  currentLng: number;
  gpsAccuracyMeters: number;
  currentFuelCost: number;
  currentLiters: number;
  breadcrumbTrail: Array<{ lat: number; lng: number }>;
  activePetrolPumpInGeofence: PetrolPump | null;
  geofencePromptShown: boolean;
}

export interface PermissionState {
  fineLocation: 'granted' | 'denied' | 'not_requested';
  backgroundLocation: 'granted' | 'denied' | 'not_requested';
  notifications: 'granted' | 'denied' | 'not_requested';
  batteryOptimizationIgnored: boolean;
}

export interface AndroidFile {
  path: string;
  filename: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown' | 'properties';
  category: 'manifest' | 'gradle' | 'room' | 'service' | 'viewmodel' | 'compose' | 'doc';
  description: string;
  code: string;
}

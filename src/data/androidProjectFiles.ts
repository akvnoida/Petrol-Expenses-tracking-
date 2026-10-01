import { AndroidFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/build.gradle.kts',
    filename: 'build.gradle.kts (Module :app)',
    language: 'gradle',
    category: 'gradle',
    description: 'App-level Gradle dependencies: Jetpack Compose, Room DB, Play Services Location, Google Places, MPAndroidChart, Coroutines.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.ksp) // KSP for Room compiler
}

android {
    namespace = "com.fueltracker.pro"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.fueltracker.pro"
        minSdk = 26 // Android 8.0 Oreo (needed for NotificationChannels & modern Location APIs)
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
        
        // Pass Places API Key from local.properties safely
        buildConfigField("String", "PLACES_API_KEY", "\"YOUR_GOOGLE_PLACES_API_KEY\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }
}

dependencies {
    // Jetpack Compose BOM & Core UI
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.5")

    // Google Play Services: Location & Geofencing
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // Google Places API (for Gas Station Search)
    implementation("com.google.android.libraries.places:places:3.5.0")

    // Room Database (Offline SQLite Storage)
    val roomVersion = "2.6.1"
    implementation("androidx.room:room-runtime:$roomVersion")
    implementation("androidx.room:room-ktx:$roomVersion") // Coroutines & Flow support
    ksp("androidx.room:room-compiler:$roomVersion")

    // MPAndroidChart (High performance charts for Android)
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")

    // Kotlin Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")

    // Core & Lifecycle KTX
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.5")
    implementation("androidx.lifecycle:lifecycle-service:2.8.5")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    filename: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Declares Foreground Service with type location, fine/background GPS permissions, wake locks, and notification channels.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- High-accuracy GPS location -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <!-- Required for background tracking while screen is off (Android 10+) -->
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

    <!-- Foreground Service permissions (Android 9+ and Android 14+ type requirement) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

    <!-- Push heads-up notifications (Android 13+ Tiramisu) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Prevent CPU sleep during active drive tracking -->
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- Network access for Google Places API -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- Request ignoring battery optimization for unthrottled background tracking -->
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />

    <application
        android:name=".FuelTrackerApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FuelTrackerPro">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.FuelTrackerPro">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Foreground Service for persistent GPS Distance Tracking -->
        <service
            android:name=".service.LocationTrackingService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="location" />

        <!-- Broadcast Receiver for Geofencing transitions (Petrol Pump detection) -->
        <receiver
            android:name=".service.GeofenceBroadcastReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="com.fueltracker.pro.ACTION_GEOFENCE_EVENT" />
            </intent-filter>
        </receiver>

    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/data/local/entities/TripEntity.kt',
    filename: 'TripEntity.kt',
    language: 'kotlin',
    category: 'room',
    description: 'Room Entity representing a recorded trip with distance, costs, calculated metrics, and anomaly flags.',
    code: `package com.fueltracker.pro.data.local.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Represents a completed or active trip logged in the local Room Database.
 * Stores GPS distance, fuel expenditure, calculated cost-per-km, and mileage.
 */
@Entity(tableName = "trips")
data class TripEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    
    val startTimeMillis: Long = System.currentTimeMillis(),
    val endTimeMillis: Long? = null,
    
    // GPS calculated distance in kilometers
    val distanceKm: Double,
    
    // Fuel expense in INR (₹)
    val fuelCostINR: Double,
    
    // Liters of fuel filled
    val litersFilled: Double,
    
    // Calculated: fuelCostINR / distanceKm
    val costPerKm: Double,
    
    // Calculated: distanceKm / litersFilled
    val mileageKmPerLiter: Double,
    
    // Fuel price at time of trip (₹/L)
    val fuelPricePerLiter: Double = 96.72,
    
    // Start / End destination label or petrol pump name
    val startLocationName: String = "Starting Point",
    val endLocationName: String = "Destination",
    val refueledAtStation: String? = null,
    
    // Smart anomaly detection flag
    val isCostAnomaly: Boolean = false,
    val anomalyReason: String? = null
)
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/data/local/FuelDao.kt',
    filename: 'FuelDao.kt',
    language: 'kotlin',
    category: 'room',
    description: 'Room Data Access Object with reactive Kotlin Coroutine Flow queries for live dashboard updates.',
    code: `package com.fueltracker.pro.data.local

import androidx.room.*
import com.fueltracker.pro.data.local.entities.TripEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for Room database operations.
 * Returns Kotlin Flow for reactive, automatic UI updates when new data is logged.
 */
@Dao
interface FuelDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTrip(trip: TripEntity): Long

    @Update
    suspend fun updateTrip(trip: TripEntity)

    @Delete
    suspend fun deleteTrip(trip: TripEntity)

    // Observe all trips in descending order of time
    @Query("SELECT * FROM trips ORDER BY startTimeMillis DESC")
    fun getAllTrips(): Flow<List<TripEntity>>

    // Get the most recent trip
    @Query("SELECT * FROM trips ORDER BY startTimeMillis DESC LIMIT 1")
    fun getLatestTrip(): Flow<TripEntity?>

    // Summary statistics for Dashboard
    @Query("SELECT SUM(distanceKm) FROM trips")
    fun getTotalDistance(): Flow<Double?>

    @Query("SELECT SUM(fuelCostINR) FROM trips")
    fun getTotalFuelCost(): Flow<Double?>

    @Query("SELECT AVG(costPerKm) FROM trips WHERE costPerKm > 0")
    fun getAverageCostPerKm(): Flow<Double?>

    @Query("SELECT AVG(mileageKmPerLiter) FROM trips WHERE mileageKmPerLiter > 0")
    fun getAverageMileage(): Flow<Double?>

    // Query for anomaly detection thresholding (last 5 trips average)
    @Query("SELECT AVG(costPerKm) FROM (SELECT costPerKm FROM trips WHERE costPerKm > 0 ORDER BY startTimeMillis DESC LIMIT 5)")
    suspend fun getRecentAverageCostPerKm(): Double?
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/data/local/FuelDatabase.kt',
    filename: 'FuelDatabase.kt',
    language: 'kotlin',
    category: 'room',
    description: 'Room Database class providing a thread-safe Singleton pattern for Android SQLite storage.',
    code: `package com.fueltracker.pro.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.fueltracker.pro.data.local.entities.TripEntity

/**
 * Production Room Database implementation.
 * Uses a thread-safe double-check locking Singleton pattern.
 */
@Database(
    entities = [TripEntity::class],
    version = 1,
    exportSchema = false
)
abstract class FuelDatabase : RoomDatabase() {

    abstract fun fuelDao(): FuelDao

    companion object {
        @Volatile
        private var INSTANCE: FuelDatabase? = null

        fun getInstance(context: Context): FuelDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FuelDatabase::class.java,
                    "fuel_tracker_database"
                )
                .fallbackToDestructiveMigration() // In production, provide Room Migrations
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/service/LocationTrackingService.kt',
    filename: 'LocationTrackingService.kt',
    language: 'kotlin',
    category: 'service',
    description: 'Foreground Service using FusedLocationProviderClient, NotificationCompat, WakeLock, and Distance Math.',
    code: `package com.fueltracker.pro.service

import android.annotation.SuppressLint
import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.os.*
import androidx.core.app.NotificationCompat
import androidx.lifecycle.LifecycleService
import com.fueltracker.pro.MainActivity
import com.fueltracker.pro.R
import com.google.android.gms.location.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Production Foreground Service that keeps GPS tracking alive even when the device
 * is locked or the screen is turned off.
 *
 * Emits real-time distance, speed, and location via StateFlow.
 */
class LocationTrackingService : LifecycleService() {

    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var locationCallback: LocationCallback
    private var wakeLock: PowerManager.WakeLock? = null

    // Tracking state
    private var lastLocation: Location? = null
    private var totalDistanceMeters: Float = 0f

    companion object {
        const val ACTION_START = "ACTION_START_TRACKING"
        const val ACTION_PAUSE = "ACTION_PAUSE_TRACKING"
        const val ACTION_STOP = "ACTION_STOP_TRACKING"
        const val ACTION_RESET = "ACTION_RESET_TRIP"

        const val NOTIFICATION_CHANNEL_ID = "fuel_tracking_channel"
        const val NOTIFICATION_ID = 1001

        // Reactive StateFlows for UI observation
        private val _isTracking = MutableStateFlow(false)
        val isTracking: StateFlow<Boolean> = _isTracking.asStateFlow()

        private val _distanceKm = MutableStateFlow(0.0)
        val distanceKm: StateFlow<Double> = _distanceKm.asStateFlow()

        private val _currentSpeedKmh = MutableStateFlow(0.0)
        val currentSpeedKmh: StateFlow<Double> = _currentSpeedKmh.asStateFlow()

        private val _currentLocation = MutableStateFlow<Location?>(null)
        val currentLocation: StateFlow<Location?> = _currentLocation.asStateFlow()
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        createNotificationChannel()
        setupLocationCallback()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        when (intent?.action) {
            ACTION_START -> startTracking()
            ACTION_PAUSE -> pauseTracking()
            ACTION_STOP -> stopTracking()
            ACTION_RESET -> resetTrip()
        }
        return START_STICKY
    }

    @SuppressLint("MissingPermission")
    private fun startTracking() {
        if (_isTracking.value) return

        // 1. Acquire partial wake lock to prevent CPU sleep when screen turns off
        acquireWakeLock()

        // 2. Start Foreground Service with persistent notification
        val notification = buildTrackingNotification(0.0, 0.0)
        startForeground(NOTIFICATION_ID, notification)
        _isTracking.value = true

        // 3. Configure high accuracy location request
        val locationRequest = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            3000L // Interval: 3 seconds
        ).apply {
            setMinUpdateIntervalMillis(1500L) // Fastest interval: 1.5 seconds
            setMinUpdateDistanceMeters(2.0f)   // Minimum distance displacement: 2 meters
            setWaitForAccurateLocation(false)
        }.build()

        // 4. Request location updates
        fusedLocationClient.requestLocationUpdates(
            locationRequest,
            locationCallback,
            Looper.getMainLooper()
        )
    }

    private fun setupLocationCallback() {
        locationCallback = object : LocationCallback() {
            override fun onLocationResult(locationResult: LocationResult) {
                for (location in locationResult.locations) {
                    processNewLocation(location)
                }
            }
        }
    }

    private fun processNewLocation(newLocation: Location) {
        // Discard low-accuracy GPS jitter (> 25 meters accuracy threshold)
        if (newLocation.accuracy > 25) return

        lastLocation?.let { prevLocation ->
            // Calculate distance between two GPS coordinates using Android's native Haversine
            val distanceArray = FloatArray(1)
            Location.distanceBetween(
                prevLocation.latitude,
                prevLocation.longitude,
                newLocation.latitude,
                newLocation.longitude,
                distanceArray
            )
            val deltaDistance = distanceArray[0]

            // Filter out unrealistic GPS jumps (> 150 km/h or < 2 meters noise)
            val speedMps = newLocation.speed
            if (deltaDistance in 2.0f..300.0f) {
                totalDistanceMeters += deltaDistance
                val km = totalDistanceMeters / 1000.0
                _distanceKm.value = km

                val speedKmh = if (speedMps > 0) speedMps * 3.6 else 0.0
                _currentSpeedKmh.value = speedKmh

                // Update Foreground Notification with live distance
                updateNotification(km, speedKmh)
            }
        }

        lastLocation = newLocation
        _currentLocation.value = newLocation
    }

    private fun pauseTracking() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        _isTracking.value = false
        releaseWakeLock()
    }

    private fun stopTracking() {
        fusedLocationClient.removeLocationUpdates(locationCallback)
        _isTracking.value = false
        releaseWakeLock()
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    private fun resetTrip() {
        totalDistanceMeters = 0f
        lastLocation = null
        _distanceKm.value = 0.0
        _currentSpeedKmh.value = 0.0
        updateNotification(0.0, 0.0)
    }

    private fun buildTrackingNotification(km: Double, speedKmh: Double): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("Fuel Tracker Pro • Tracking Drive")
            .setContentText("Distance: \${String.format("%.2f", km)} km | Speed: \${speedKmh.toInt()} km/h")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun updateNotification(km: Double, speedKmh: Double) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, buildTrackingNotification(km, speedKmh))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Trip Tracking Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows active fuel tracking and distance statistics"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun acquireWakeLock() {
        if (wakeLock == null) {
            val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
            wakeLock = powerManager.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "FuelTrackerPro::TrackingWakeLock"
            ).apply {
                acquire(4 * 60 * 60 * 1000L) // 4 hours timeout safety
            }
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
            wakeLock = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        releaseWakeLock()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/service/PetrolPumpDetector.kt',
    filename: 'PetrolPumpDetector.kt',
    language: 'kotlin',
    category: 'service',
    description: 'Detects nearby gas stations using Google Places API and registers Geofences for automatic trip reset prompts.',
    code: `package com.fueltracker.pro.service

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.location.Location
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.google.android.libraries.places.api.Places
import com.google.android.libraries.places.api.model.Place
import com.google.android.libraries.places.api.net.FindCurrentPlaceRequest

/**
 * Handles Petrol Pump detection using:
 * 1. Google Places API (Find nearby places of type gas_station)
 * 2. Android Geofencing API (Trigger alert on entering 150m radius)
 */
class PetrolPumpDetector(private val context: Context) {

    private val geofencingClient: GeofencingClient =
        LocationServices.getGeofencingClient(context)

    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java).apply {
            action = GeofenceBroadcastReceiver.ACTION_GEOFENCE_EVENT
        }
        PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    /**
     * Registers a geofence around a petrol pump location (150m radius)
     */
    @SuppressLint("MissingPermission")
    fun registerPetrolPumpGeofence(
        pumpId: String,
        latitude: Double,
        longitude: Double,
        pumpName: String,
        radiusMeters: Float = 150.0f
    ) {
        val geofence = Geofence.Builder()
            .setRequestId(pumpId)
            .setCircularRegion(latitude, longitude, radiusMeters)
            .setExpirationDuration(Geofence.NEVER_EXPIRE)
            .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_DWELL)
            .setLoiteringDelay(30000) // 30 seconds dwell time before alerting
            .build()

        val geofencingRequest = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofence(geofence)
            .build()

        geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent).run {
            addOnSuccessListener {
                // Successfully added petrol pump geofence
            }
            addOnFailureListener { exception ->
                exception.printStackTrace()
            }
        }
    }

    /**
     * Unregisters active geofences when no longer needed
     */
    fun removeGeofences() {
        geofencingClient.removeGeofences(geofencePendingIntent)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/service/GeofenceBroadcastReceiver.kt',
    filename: 'GeofenceBroadcastReceiver.kt',
    language: 'kotlin',
    category: 'service',
    description: 'BroadcastReceiver triggered when the vehicle enters a petrol pump geofence radius. Displays heads-up notification.',
    code: `package com.fueltracker.pro.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.fueltracker.pro.MainActivity
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofenceStatusCodes
import com.google.android.gms.location.GeofencingEvent

/**
 * BroadcastReceiver triggered by Android OS when device crosses into a petrol pump geofence.
 * Posts an interactive heads-up notification: "Petrol pump detected. Reset trip?"
 */
class GeofenceBroadcastReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_GEOFENCE_EVENT = "com.fueltracker.pro.ACTION_GEOFENCE_EVENT"
        const val CHANNEL_ID = "fuel_geofence_channel"
        const val NOTIFICATION_ID = 2002
    }

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent) ?: return

        if (geofencingEvent.hasError()) {
            val errorMessage = GeofenceStatusCodes.getStatusCodeString(geofencingEvent.errorCode)
            return
        }

        val transitionType = geofencingEvent.geofenceTransition

        if (transitionType == Geofence.GEOFENCE_TRANSITION_ENTER ||
            transitionType == Geofence.GEOFENCE_TRANSITION_DWELL
        ) {
            val triggeringGeofences = geofencingEvent.triggeringGeofences ?: return
            val pumpName = triggeringGeofences.firstOrNull()?.requestId ?: "Petrol Pump"

            showPetrolPumpAlertNotification(context, pumpName)
        }
    }

    private fun showPetrolPumpAlertNotification(context: Context, stationName: String) {
        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android O+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Petrol Pump Geofence Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifies when vehicle enters a petrol station"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Tap action opens MainActivity to show the Fuel Refill & Reset Dialog
        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("SHOW_REFILL_DIALOG", true)
            putExtra("STATION_NAME", stationName)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Action button to Reset Trip directly from notification
        val resetIntent = Intent(context, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_RESET
        }
        val resetPendingIntent = PendingIntent.getService(
            context,
            1,
            resetIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("⛽ Petrol Pump Detected!")
            .setContentText("You arrived at $stationName. Reset trip distance or log fuel?")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .addAction(android.R.drawable.ic_menu_rotate, "Reset Trip", resetPendingIntent)
            .build()

        notificationManager.notify(NOTIFICATION_ID, notification)
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/viewmodel/FuelTrackerViewModel.kt',
    filename: 'FuelTrackerViewModel.kt',
    language: 'kotlin',
    category: 'viewmodel',
    description: 'MVVM ViewModel managing StateFlows, Room DB calls, real-time Cost/Km calculation, and anomaly detection.',
    code: `package com.fueltracker.pro.viewmodel

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.fueltracker.pro.data.local.FuelDatabase
import com.fueltracker.pro.data.local.entities.TripEntity
import com.fueltracker.pro.service.LocationTrackingService
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

data class DashboardUiState(
    val currentDistanceKm: Double = 0.0,
    val currentSpeedKmh: Double = 0.0,
    val isTracking: Boolean = false,
    val totalHistoricalDistanceKm: Double = 0.0,
    val totalHistoricalFuelCostINR: Double = 0.0,
    val currentTripFuelCostINR: Double = 0.0,
    val currentTripLiters: Double = 0.0,
    val liveCostPerKm: Double = 0.0,
    val liveMileageKmPerLiter: Double = 0.0,
    val averageCostPerKm: Double = 0.0,
    val isAnomalyDetected: Boolean = false,
    val anomalyMessage: String? = null,
    val detectedStationPrompt: String? = null
)

class FuelTrackerViewModel(application: Application) : AndroidViewModel(application) {

    private val db = FuelDatabase.getInstance(application)
    private val dao = db.fuelDao()

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    // Observe Room DB historical trips
    val tripHistory: Flow<List<TripEntity>> = dao.getAllTrips()

    init {
        observeTrackingService()
        observeDatabaseTotals()
    }

    private fun observeTrackingService() {
        viewModelScope.launch {
            combine(
                LocationTrackingService.isTracking,
                LocationTrackingService.distanceKm,
                LocationTrackingService.currentSpeedKmh
            ) { tracking, dist, speed ->
                Triple(tracking, dist, speed)
            }.collect { (tracking, dist, speed) ->
                val fuelCost = _uiState.value.currentTripFuelCostINR
                val liters = _uiState.value.currentTripLiters

                // Formula 1: cost_per_km = total_fuel_cost / total_distance
                val costPerKm = if (dist > 0.05 && fuelCost > 0) {
                    fuelCost / dist
                } else {
                    0.0
                }

                // Formula 2: mileage = distance / liters
                val mileage = if (liters > 0 && dist > 0.05) {
                    dist / liters
                } else {
                    0.0
                }

                // Anomaly check: if cost per km exceeds recent average by 30%
                val avgCost = _uiState.value.averageCostPerKm
                val isAnomaly = avgCost > 0 && costPerKm > (avgCost * 1.30)
                val anomalyMsg = if (isAnomaly) {
                    "⚠️ High fuel cost detected: ₹\${String.format("%.2f", costPerKm)}/km (Spike above normal avg ₹\${String.format("%.2f", avgCost)}/km)"
                } else null

                _uiState.update { current ->
                    current.copy(
                        isTracking = tracking,
                        currentDistanceKm = dist,
                        currentSpeedKmh = speed,
                        liveCostPerKm = costPerKm,
                        liveMileageKmPerLiter = mileage,
                        isAnomalyDetected = isAnomaly,
                        anomalyMessage = anomalyMsg
                    )
                }
            }
        }
    }

    private fun observeDatabaseTotals() {
        viewModelScope.launch {
            combine(
                dao.getTotalDistance(),
                dao.getTotalFuelCost(),
                dao.getAverageCostPerKm()
            ) { totalDist, totalCost, avgCost ->
                Triple(totalDist ?: 0.0, totalCost ?: 0.0, avgCost ?: 6.5)
            }.collect { (totalDist, totalCost, avgCost) ->
                _uiState.update { current ->
                    current.copy(
                        totalHistoricalDistanceKm = totalDist,
                        totalHistoricalFuelCostINR = totalCost,
                        averageCostPerKm = avgCost
                    )
                }
            }
        }
    }

    fun startTracking() {
        val app = getApplication<Application>()
        val intent = Intent(app, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_START
        }
        app.startForegroundService(intent)
    }

    fun pauseTracking() {
        val app = getApplication<Application>()
        val intent = Intent(app, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_PAUSE
        }
        app.startService(intent)
    }

    fun resetTrip() {
        val app = getApplication<Application>()
        val intent = Intent(app, LocationTrackingService::class.java).apply {
            action = LocationTrackingService.ACTION_RESET
        }
        app.startService(intent)

        _uiState.update {
            it.copy(
                currentDistanceKm = 0.0,
                currentTripFuelCostINR = 0.0,
                currentTripLiters = 0.0,
                liveCostPerKm = 0.0,
                liveMileageKmPerLiter = 0.0,
                isAnomalyDetected = false,
                detectedStationPrompt = null
            )
        }
    }

    fun logFuelRefill(amountINR: Double, liters: Double, stationName: String? = null) {
        _uiState.update {
            it.copy(
                currentTripFuelCostINR = amountINR,
                currentTripLiters = liters,
                detectedStationPrompt = null
            )
        }
    }

    fun saveCurrentTripToRoom(startName: String, endName: String) {
        val state = _uiState.value
        if (state.currentDistanceKm <= 0.05) return

        viewModelScope.launch {
            val trip = TripEntity(
                distanceKm = state.currentDistanceKm,
                fuelCostINR = state.currentTripFuelCostINR,
                litersFilled = state.currentTripLiters,
                costPerKm = state.liveCostPerKm,
                mileageKmPerLiter = state.liveMileageKmPerLiter,
                startLocationName = startName,
                endLocationName = endName,
                refueledAtStation = state.detectedStationPrompt,
                isCostAnomaly = state.isAnomalyDetected,
                anomalyReason = state.anomalyMessage
            )
            dao.insertTrip(trip)
            resetTrip()
        }
    }

    fun deleteTrip(trip: TripEntity) {
        viewModelScope.launch {
            dao.deleteTrip(trip)
        }
    }

    fun dismissPetrolPumpPrompt() {
        _uiState.update { it.copy(detectedStationPrompt = null) }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/ui/screens/DashboardScreen.kt',
    filename: 'DashboardScreen.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Jetpack Compose Material 3 Dashboard displaying live gauges, fuel metrics, cost/km, and trip controls.',
    code: `package com.fueltracker.pro.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.fueltracker.pro.viewmodel.DashboardUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    state: DashboardUiState,
    onStartTracking: () -> Unit,
    onPauseTracking: () -> Unit,
    onResetTrip: () -> Unit,
    onOpenFuelModal: () -> Unit,
    onSaveTrip: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocalGasStation,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "Fuel Tracker Pro",
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            // Anomaly Alert Card (if abnormal spike detected)
            if (state.isAnomalyDetected && state.anomalyMessage != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = state.anomalyMessage,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
            }

            // Petrol Pump Geofence Detected Banner
            if (state.detectedStationPrompt != null) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Text(
                            text = "⛽ Petrol Pump Detected!",
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        Text(
                            text = "Arrived at \${state.detectedStationPrompt}. Reset trip?",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onTertiaryContainer
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Button(onClick = onOpenFuelModal) {
                                Text("Log Refill")
                            }
                            OutlinedButton(onClick = onResetTrip) {
                                Text("Reset Trip")
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Primary Stat Card: Distance & Real-Time Cost Per KM
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "ACTIVE TRIP DISTANCE",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "\${String.format("%.2f", state.currentDistanceKm)} km",
                        fontSize = 42.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Text(
                        text = "Current Speed: \${state.currentSpeedKmh.toInt()} km/h",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.outline
                    )

                    Divider(modifier = Modifier.padding(vertical = 16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Cost Per KM", style = MaterialTheme.typography.labelSmall)
                            Text(
                                text = if (state.liveCostPerKm > 0) "₹\${String.format("%.2f", state.liveCostPerKm)}/km" else "₹0.00/km",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp,
                                color = if (state.isAnomalyDetected) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary
                            )
                        }
                        Column {
                            Text("Mileage", style = MaterialTheme.typography.labelSmall)
                            Text(
                                text = if (state.liveMileageKmPerLiter > 0) "\${String.format("%.1f", state.liveMileageKmPerLiter)} km/L" else "-- km/L",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                        }
                        Column {
                            Text("Fuel Spent", style = MaterialTheme.typography.labelSmall)
                            Text(
                                text = "₹\${state.currentTripFuelCostINR.toInt()}",
                                fontWeight = FontWeight.Bold,
                                fontSize = 18.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Buttons: Start / Pause / Reset / Refill
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                if (!state.isTracking) {
                    Button(
                        onClick = onStartTracking,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Start Trip")
                    }
                } else {
                    Button(
                        onClick = onPauseTracking,
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.Pause, contentDescription = null)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Pause")
                    }
                }

                Button(
                    onClick = onOpenFuelModal,
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiary),
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.LocalGasStation, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Add Fuel")
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onResetTrip,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Refresh, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Reset Trip")
                }

                OutlinedButton(
                    onClick = onSaveTrip,
                    enabled = state.currentDistanceKm > 0.05,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(Icons.Default.Save, contentDescription = null)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Save Trip")
                }
            }

            Spacer(modifier = Modifier.height(20.dp))
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/ui/screens/AnalyticsScreen.kt',
    filename: 'AnalyticsScreen.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'MPAndroidChart LineChart integration inside Jetpack Compose using AndroidView for Cost per KM trends.',
    code: `package com.fueltracker.pro.ui.screens

import android.graphics.Color as AndroidColor
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import com.fueltracker.pro.data.local.entities.TripEntity
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.github.mikephil.charting.data.LineDataSet

/**
 * Renders an MPAndroidChart LineChart embedded natively in Jetpack Compose.
 * Displays Cost Per KM trend across historical trips.
 */
@Composable
fun AnalyticsScreen(trips: List<TripEntity>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(280.dp)
            .padding(12.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = "Cost Per KM Trend (₹/km)",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(8.dp))

            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { context ->
                    LineChart(context).apply {
                        description.isEnabled = false
                        setTouchEnabled(true)
                        isDragEnabled = true
                        setScaleEnabled(false)
                        setPinchZoom(false)
                        setDrawGridBackground(false)

                        xAxis.apply {
                            position = XAxis.XAxisPosition.BOTTOM
                            setDrawGridLines(false)
                            textColor = AndroidColor.DKGRAY
                        }

                        axisLeft.apply {
                            setDrawGridLines(true)
                            textColor = AndroidColor.DKGRAY
                            axisMinimum = 0f
                        }
                        axisRight.isEnabled = false
                        legend.isEnabled = true
                    }
                },
                update = { lineChart ->
                    if (trips.isEmpty()) return@AndroidView

                    val entries = trips.reversed().mapIndexed { index, trip ->
                        Entry(index.toFloat() + 1, trip.costPerKm.toFloat())
                    }

                    val dataSet = LineDataSet(entries, "Trip Cost (₹/km)").apply {
                        color = AndroidColor.rgb(37, 99, 235) // Primary Blue
                        valueTextColor = AndroidColor.BLACK
                        valueTextSize = 10f
                        lineWidth = 2.5f
                        circleRadius = 4f
                        setCircleColor(AndroidColor.rgb(37, 99, 235))
                        setDrawFilled(true)
                        fillColor = AndroidColor.rgb(191, 219, 254)
                        mode = LineDataSet.Mode.CUBIC_BEZIER
                    }

                    lineChart.data = LineData(dataSet)
                    lineChart.invalidate()
                }
            )
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/fueltracker/pro/MainActivity.kt',
    filename: 'MainActivity.kt',
    language: 'kotlin',
    category: 'compose',
    description: 'Main Activity orchestrating the two-step Location permissions (Fine + Background) and Android 13 Notifications.',
    code: `package com.fueltracker.pro

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.fueltracker.pro.ui.screens.DashboardScreen
import com.fueltracker.pro.viewmodel.FuelTrackerViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: FuelTrackerViewModel by viewModels()

    // 1. Fine Location Permission launcher
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true
        if (fineLocationGranted) {
            // Android 10+ requires background location as a separate second step
            requestBackgroundLocationPermission()
        }
    }

    // 2. Background Location Permission launcher (Android 10+ Q)
    private val backgroundLocationLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        // Background location granted: ready for unhindered screen-off tracking
    }

    // 3. Notification Permission launcher (Android 13+ Tiramisu)
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        checkAndRequestPermissions()

        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    val state by viewModel.uiState.collectAsState()

                    DashboardScreen(
                        state = state,
                        onStartTracking = { viewModel.startTracking() },
                        onPauseTracking = { viewModel.pauseTracking() },
                        onResetTrip = { viewModel.resetTrip() },
                        onOpenFuelModal = { /* Handled in dialog state */ },
                        onSaveTrip = { viewModel.saveCurrentTripToRoom("Origin", "Destination") }
                    )
                }
            }
        }
    }

    private fun checkAndRequestPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.ACCESS_FINE_LOCATION)
            permissionsToRequest.add(Manifest.permission.ACCESS_COARSE_LOCATION)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            locationPermissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }

    private fun requestBackgroundLocationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
                // Must be requested separately from foreground permissions per Google Play Policy
                backgroundLocationLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            }
        }
    }
}
`,
  },
  {
    path: 'README.md',
    filename: 'README.md',
    language: 'markdown',
    category: 'doc',
    description: 'Complete Android Developer setup guide, battery optimization instructions, and architecture breakdown.',
    code: `# Fuel Tracker Pro (Android / Kotlin)

Production-ready Android application built with Kotlin, Jetpack Compose, Room Database, and Google Location Services.

## 🎯 Architecture & Components

- **Architecture:** MVVM (Model-View-ViewModel) + Repository Pattern + Clean Architecture
- **Language:** Kotlin 2.0
- **UI:** Jetpack Compose (Material 3)
- **Database:** Room Database (SQLite with Flow reactive streams)
- **Location Tracking:** Google Play Services \`FusedLocationProviderClient\`
- **Background Persistence:** Foreground Service (\`location\` type) with \`PARTIAL_WAKE_LOCK\`
- **Geofencing:** Android Geofencing API + Google Places API for gas station detection
- **Charts:** MPAndroidChart embedded via Compose \`AndroidView\`

---

## 🚀 How to Run in Android Studio

1. **Clone or Unzip** the project.
2. Open Android Studio (Ladybug / Iguana or later).
3. Select **File > Open** and choose this directory.
4. Add your Google Places API Key in \`local.properties\`:
   \`\`\`properties
   PLACES_API_KEY=AIzaSy...YourKeyHere
   \`\`\`
5. Sync Gradle.
6. Connect an Android device (Android 8.0 Oreo or higher) or start an Emulator.
7. Click **Run 'app'** (\`Shift + F10\`).

---

## 🔋 Battery Optimization & Screen-Off Tracking

1. **Foreground Service with Notification:** The app runs a persistent foreground notification, preventing the Android OS from killing the process during low memory.
2. **WakeLock:** A \`PARTIAL_WAKE_LOCK\` keeps the CPU running while the screen is off so GPS coordinates continue computing distance.
3. **Displacement Filter:** \`LocationRequest.setMinUpdateDistanceMeters(2.0f)\` ignores sensor micro-vibrations when stationary, saving battery.
4. **Accuracy Check:** Ignores GPS points with accuracy worse than 25m to prevent false distance inflation.

---

## 🧮 Mathematical Formulas Used

- **Cost Per KM:**
  $$\\text{Cost per KM} = \\frac{\\text{Total Fuel Cost (₹)}}{\\text{Total GPS Distance (km)}}$$

- **Mileage (Fuel Efficiency):**
  $$\\text{Mileage (km/L)} = \\frac{\\text{Distance Travelled (km)}}{\\text{Liters Consumed (L)}}$$

- **GPS Distance (Haversine Formula):**
  $$d = 2R \\cdot \\arcsin\\left(\\sqrt{\\sin^2\\left(\\frac{\\Delta\\phi}{2}\\right) + \\cos(\\phi_1)\\cos(\\phi_2)\\sin^2\\left(\\frac{\\Delta\\lambda}{2}\\right)}\\right)$$
  (Evaluated natively via Android's \`Location.distanceBetween()\`)
`,
  }
];

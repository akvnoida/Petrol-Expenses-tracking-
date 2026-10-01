import JSZip from 'jszip';
import { AndroidFile } from '../types';

export async function exportAndroidStudioProjectZip(files: AndroidFile[]) {
  const zip = new JSZip();

  // Root gradle wrappers and standard files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = java.net.URI("https://jitpack.io") }
    }
}

rootProject.name = "FuelTrackerPro"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.ksp) apply false
}
`
  );

  zip.file(
    'local.properties.example',
    `## This file must NOT be checked into Version Control Systems,
# as it contains information specific to your local configuration.
#
# Location of the SDK. This is only used by Gradle.
# For customization when using a Version Control System, please read the
# header note.
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY_HERE
`
  );

  // Add all project files
  files.forEach((file) => {
    zip.file(file.path, file.code);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FuelTrackerPro-Android-Studio-Kotlin.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

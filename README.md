# Cora Mobile App - Staff Portal

A React Native (Expo) mobile application for Cora Cora Resorts staff to access company resources, manage leave requests, view events, and more.

## Features

- **Authentication**: Secure login with employee credentials
- **Feed**: Company announcements and trip listings
- **City Ledger**: Track spending and limits
- **Directory**: Employee directory (Admin/HOD/HR only)
- **Calendar**: Roster and shift schedules
- **Notifications**: Real-time push notifications
- **Leave Requests**: Submit and track leave applications
- **Gate Passes**: Request and manage gate passes
- **Exit Passes**: Exit pass management workflow
- **Events**: Company events and RSVP
- **Tasks**: Assigned tasks management
- **Transport**: Transport trip schedules

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query (TanStack Query)
- **Styling**: React Native StyleSheet
- **Icons**: Material Community Icons, Ionicons
- **API**: Laravel Sanctum (Backend)

## Recent Fixes

### Hook Order Fixes (React Rules of Hooks)
Fixed "Rendered more hooks than during the previous render" errors in:
- `app/(tabs)/calendar.tsx` - Moved useCallback above early returns
- `app/notifications/index.tsx` - Moved useCallback above early returns  
- `app/(tabs)/directory.tsx` - Moved useCallback and useMemo above early returns

### API Improvements
- `src/hooks/useDirectory.ts` - Added retry logic to prevent repeated 403 errors

## Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Java JDK 17

## Installation

```bash
# Install dependencies
cd cora-mobile-app
npm install

# Start development server
npx expo start
```

## Running the App

### Development with Expo Go
```bash
npx expo start
# Scan QR code with Expo Go app on mobile
```

### Development Build (Recommended for full testing)
```bash
# Generate native Android project
npx expo prebuild --platform android

# Run on Android device/emulator
npx expo run:android
```

## Building APK for Testing

### Option 1: Android Studio (Recommended)

1. **Generate Native Project**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Open in Android Studio**
   - Open Android Studio
   - Click "Open an existing project"
   - Select `cora-mobile-app/android`

3. **Build Debug APK**
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - Wait for build to complete
   - APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option 2: Command Line

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Important Notes

- The APK includes bundled JavaScript - it works WITHOUT Metro bundler
- This is a development build (uses `expo-dev-client`)
- Install the APK directly on your Android device to test

## Project Structure

```
cora-mobile-app/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── admin/             # Admin panel
│   ├── approvals/         # Approval workflows
│   ├── events/            # Events
│   ├── exit-passes/       # Exit pass management
│   ├── gate-passes/       # Gate pass management
│   ├── leaves/            # Leave requests
│   ├── notifications/     # Notifications
│   ├── tasks/             # Task management
│   └── ...
├── src/
│   ├── components/        # Reusable components
│   ├── context/           # React Context (Auth)
│   ├── hooks/             # React Query hooks
│   ├── theme/             # Theme configuration
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── assets/                # Images, fonts
└── components/            # Entertainment features
```

## API Configuration

The app connects to: `https://portal.coracoraresorts.com/api`

Configuration is in `app.json` under `extra.apiBaseUrl`.

## Troubleshooting

### Hook Order Errors
If you see "React has detected a change in the order of Hooks", ensure:
- All hooks (useState, useEffect, useCallback, useMemo) are called at the top level
- No conditional returns before hook declarations
- Hooks are never called inside loops, conditions, or nested functions

### Build Errors
- Ensure JAVA_HOME is set to JDK 17
- Clear cache: `npx expo start --clear`
- Delete `android/` folder and re-run `npx expo prebuild`

### Push Notifications Not Working
- Check that `expo-dev-client` is installed
- Verify device token is being registered
- Check backend notification settings

## License

Proprietary - Cora Cora Resorts

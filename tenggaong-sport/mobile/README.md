# Tenggaong Sport — Mobile App

A React Native (Expo) mobile app for Tenggaong Sport, a multi-owner sports field booking platform.

## Prerequisites

- Node.js 18+
- Expo CLI: `npx expo --version`
- Expo Go app on phone (or emulator)
- Backend running at `http://192.168.100.34:3001/`

## Quick Start

```bash
cd tenggaong-sport/mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android/iOS) or press `a` for Android emulator / `i` for iOS simulator.

## Environment

Backend URL is hardcoded in `src/api/index.js`:
```
http://192.168.100.34:3001/api
```

Change to your backend IP if different.

## Project Structure

```
mobile/
├── App.js                  # Entry point
├── app.json                # Expo config
├── package.json
├── babel.config.js
├── src/
│   ├── api/
│   │   └── index.js        # API client (axios-like fetch wrapper)
│   ├── context/
│   │   └── AuthContext.js   # Auth state, login/logout, token storage
│   ├── navigation/
│   │   └── AppNavigator.js  # Role-based navigation
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── CustomerHomeScreen.js
│   │   ├── BookFieldScreen.js
│   │   ├── MyBookingsScreen.js
│   │   ├── CustomerMembershipScreen.js
│   │   ├── AdminScreen.js
│   │   ├── OwnerScreen.js
│   │   └── SuperAdminScreen.js
│   └── theme.js            # Colors, spacing, typography
└── README.md
```

## Quick Login

| Role        | Email                  | Password   |
|-------------|------------------------|------------|
| Customer    | customer@tng.com       | password   |
| Kasir       | kasir@tng.com          | password   |
| Owner       | owner@tng.com          | password   |
| Superadmin  | superadmin@tng.com     | password   |

## Tech Stack

- Expo SDK 52
- React Navigation (Stack + Bottom Tabs)
- expo-secure-store (token persistence)
- Dark theme (#1a1a2e / #6C5CE7 / #00CEC9)

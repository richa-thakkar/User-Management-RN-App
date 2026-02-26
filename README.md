# React Native User Management App

A premium, fully-featured user management application built with React Native, Expo, Redux Toolkit, and Tailwind-inspired custom vanilla CSS styling.

## Features Included

- **Core Functionality**: Login, View Paginated Users, View User Detail, Add User, Edit User, Delete User.
- **Bonus: Image Upload**: Uses `expo-image-picker` to select an avatar from the device gallery when creating or editing a user.
- **Bonus: Offline Caching**: Uses `@react-native-async-storage/async-storage` and `expo-network` to cache the user list for offline viewing.
- **Bonus: Unit Testing**: Includes Jest tests for Redux slices.
- **Architecture**: Redux Toolkit (State), React Navigation / Expo Router (Routing), Axios via `reqres.in` API.

## Setup & Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npx expo start
   ```
3. **Run on a physical phone (Free & Recommended):**
   - Download the **Expo Go** app from the iOS App Store or Android Play Store.
   - Scan the QR code shown in your terminal with your phone's camera (iOS) or the Expo Go app itself (Android).
   - This works instantly for both iPhone and Android, without needing a Mac or Android Studio!

4. **Testing Credentials:**
   - **Email:** `eve.holt@reqres.in`
   - **Password:** `cityslicka`

.



### Build Android APK (Free)
```bash
eas build --platform android --profile preview


```
This builds an `.app` directory on an Expo cloud Mac. You can download and drag this into an iOS Simulator on a Mac.

### Build iOS App Store (.ipa)
*(Requires a $99/yr Apple Developer Account)*
```bash
eas build --platform ios --profile production
```

## Running Tests
```bash
npm run test
```

# React Native User Management App

A premium, fully-featured user management application built with React Native, Expo, Redux Toolkit, and Tailwind-inspired custom vanilla CSS styling.

## Features Included

- **Core Functionality**: Login, View Paginated Users, View User Detail, Add User, Edit User, Delete User.
- **Image Upload**: Uses `expo-image-picker` to select an avatar from the device gallery when creating or editing a user.
- **Offline Caching**: Uses `@react-native-async-storage/async-storage` and `expo-network` to cache the user list for offline viewing.
- **Unit Testing**: Includes Jest tests for Redux slices.
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
3. **Run on a physical phone:**
   - Download the **Expo Go** app from the iOS App Store or Android Play Store.
   - Scan the QR code shown in your terminal with your phone's camera (iOS) or the Expo Go app itself (Android).
   

4. **Testing Credentials:**
   - **Email:** `test@gmail.com`
   - **Password:** `test@123!`

.





## Running Tests
```bash
npm run test
```

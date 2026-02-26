import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { store } from '../store';
import { restoreToken } from '../store/authSlice';

function RootLayoutNav() {
  useEffect(() => {
    store.dispatch(restoreToken());
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
      <Toast />
    </>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

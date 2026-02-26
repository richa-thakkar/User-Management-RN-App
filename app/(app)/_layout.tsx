import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '../../hooks/useAppHooks';

export default function AppLayout() {
  const token = useAppSelector((state) => state.auth.token);
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0F172A' },
        headerTintColor: '#F1F5F9',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    />
  );
}

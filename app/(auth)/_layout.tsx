import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '../../hooks/useAppHooks';

export default function AuthLayout() {
  const token = useAppSelector((state) => state.auth.token);
  if (token) return <Redirect href="/(app)/users" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

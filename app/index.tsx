import { Redirect } from 'expo-router';
import { useAppSelector } from '../hooks/useAppHooks';

export default function Index() {
  const token = useAppSelector((state) => state.auth.token);
  return token ? <Redirect href="/(app)/users" /> : <Redirect href="/(auth)/login" />;
}

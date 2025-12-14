import { Redirect } from 'expo-router';

// Redirect to tabs
export default function Index() {
  return <Redirect href="/(tabs)" />;
}

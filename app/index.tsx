import { Redirect } from "expo-router";

export default function Index() {
  // TODO: Check auth state and role, redirect accordingly
  // For now, redirect to auth
  return <Redirect href="/(auth)/login" />;
}

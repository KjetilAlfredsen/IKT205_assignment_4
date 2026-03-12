import { NoteProvider } from "@/context/NoteContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import { useAuthContext } from "../hooks/auth-context";
import AuthProvider from "../providers/auth-provider";
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isLoading, isLoggedIn, session } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = isLoggedIn && session;

    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isLoggedIn, session]);

  if (isLoading) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ title: "New Note", presentation: "modal" }}
      />
      <Stack.Screen name="note/[id]" options={{ title: "Details" }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
    </Stack>
  );
}

function RootLayoutNav() {
  return (
    <KeyboardProvider>
      <AuthProvider>
        <NoteProvider>
          <RootNavigator />
        </NoteProvider>
      </AuthProvider>
    </KeyboardProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

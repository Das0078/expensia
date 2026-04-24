import { parseClerkError } from "@/lib/auth";
import { useAuth, useUser } from "@clerk/expo";
import { clsx } from "clsx";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { styled } from "nativewind";

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user } = useUser();

  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const displayName =
    user?.fullName?.trim() ||
    [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(" ") ||
    "Expensia member";
  const emailAddress = user?.primaryEmailAddress?.emailAddress ?? "No primary email";

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setErrorMessage("");

    try {
      await signOut();
      router.replace("/(auth)/SignIn");
    } catch (error) {
      const parsed = parseClerkError(error, "We couldn't log you out. Please try again.");
      setErrorMessage(parsed.message);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-6">
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-sm font-sans-semibold uppercase tracking-[1px] text-muted-foreground">
          Account
        </Text>
        <Text className="mt-2 text-2xl font-sans-bold text-primary">{displayName}</Text>
        <Text className="mt-1 text-base font-sans-medium text-muted-foreground">{emailAddress}</Text>
      </View>

      <View className="mt-4 rounded-3xl border border-border bg-card p-5">
        <Text className="text-base font-sans-semibold text-primary">Security</Text>
        <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
          Your sign-in uses encrypted session storage and verification-based protection to keep
          billing insights private.
        </Text>
      </View>

      {errorMessage ? (
        <Text className="mt-4 text-sm font-sans-medium text-destructive">{errorMessage}</Text>
      ) : null}

      <Pressable
        className={clsx("mt-6 items-center rounded-2xl bg-primary py-4", isSigningOut && "opacity-50")}
        onPress={() => void handleSignOut()}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <ActivityIndicator color="#fff9e3" />
        ) : (
          <Text className="text-base font-sans-bold text-background">Log out</Text>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

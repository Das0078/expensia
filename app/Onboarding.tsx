import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { styled } from "nativewind";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function Onboarding() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/SignIn" />;
  }

  return (
    <SafeAreaView className="flex-1 bg-background px-5 pt-6">
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-xl font-sans-bold text-primary">Final account setup</Text>
        <Text className="mt-2 text-sm font-sans-medium leading-6 text-muted-foreground">
          Your account is active. Complete any remaining setup steps here before using all features.
        </Text>
      </View>
    </SafeAreaView>
  );
}

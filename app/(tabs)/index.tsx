import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind';
const SafeAreaView = styled(RNSafeAreaView); // by tled wrap us nativewind can style it with className to safe area view and use it in app.tsx without importing nativewind in app.tsx and also can use className for styling it with nativewind

export default function App() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href='/Onboarding' className="mt-4 px-4 py-2 bg-primary rounded">
        <Text className="text-white text-center">Get Started</Text>
      </Link>

      <Link href='/(auth)/SignIn' className="mt-4 px-4 py-2 bg-primary rounded">
        <Text className="text-white text-center">Log In</Text>
      </Link>

      <Link href='/(auth)/SignUp' className="mt-4 px-4 py-2 bg-primary rounded">
        <Text className="text-white text-center">Create Account</Text>
      </Link>

        <Link href={'/SubscriptionDetails/spotify' as any} className="mt-4 px-4 py-2 bg-primary rounded">
          <Text className="text-white text-center">Spotify</Text>
        </Link>

            <Link href={{
              pathname: '/SubscriptionDetails/[id]',
              params: {id: 'Claude max'}
            }} className="mt-4 px-4 py-2 bg-primary rounded">
          <Text className="text-white text-center">Claude Max</Text>
        </Link>

    </SafeAreaView>
  );
}
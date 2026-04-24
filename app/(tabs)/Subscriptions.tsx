import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import {styled} from 'nativewind';
const SafeAreaView = styled(RNSafeAreaView); // by tled wrap us nativewind can style it with className to safe area view and use it in app.tsx without importing nativewind in app.tsx and also can use className for styling it with nativewind


const Subscriptions = () => {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <Text>Subscriptions</Text>
    </SafeAreaView>
  )
}

export default Subscriptions

const styles = StyleSheet.create({})
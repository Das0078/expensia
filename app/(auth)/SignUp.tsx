import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'

const SignUp = () => {
  return (
    <View>
      <Text>Sign-up</Text>
            <Link href='/(auth)/SignIn' className="mt-4 px-4 py-2 bg-primary rounded">
              <Text className="text-white text-center">Log In</Text>
            </Link>
    </View>
  )
}

export default SignUp

const styles = StyleSheet.create({})
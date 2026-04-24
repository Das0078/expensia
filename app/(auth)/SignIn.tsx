import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import SignUp from './SignUp'

const SignIn = () => {
  return (
    <View>
      <Text>Sign In</Text>
            <Link href='/(auth)/SignUp' className="mt-4 px-4 py-2 bg-primary rounded">
              <Text className="text-white text-center">Create Account</Text>
            </Link>
    </View>
  )
}

export default SignIn

const styles = StyleSheet.create({})
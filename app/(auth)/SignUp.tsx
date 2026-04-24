import { normalizeEmail, parseClerkError, validateSignUpInput, validateVerificationCode, type AuthFieldErrors } from "@/lib/auth";
import { useSignUp } from "@clerk/expo";
import { clsx } from "clsx";
import { type Href, Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const SIGN_IN_ROUTE = "/(auth)/SignIn" as Href;
const TABS_ROUTE = "/(tabs)" as Href;
const ONBOARDING_ROUTE = "/Onboarding" as Href;

export default function SignUp() {
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formMessage, setFormMessage] = useState("");

  const isBusy = fetchStatus === "fetching";

  const needsEmailVerification =
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0;

  const hookError = useMemo(() => parseClerkError(errors, ""), [errors]);
  const mergedFieldErrors = {
    ...hookError.fieldErrors,
    ...fieldErrors,
  };
  const visibleMessage = formMessage || hookError.message;

  const finalizeSignUp = async () => {
    await signUp.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          router.replace(ONBOARDING_ROUTE);
          return;
        }

        router.replace(TABS_ROUTE);
      },
    });
  };

  const handleCreateAccount = async () => {
    const validation = validateSignUpInput({ email, password, confirmPassword });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormMessage("");
      return;
    }

    setFieldErrors({});
    setFormMessage("");

    try {
      const result = await signUp.password({
        emailAddress: normalizeEmail(email),
        password,
      });

      if (result.error) {
        const parsed = parseClerkError(result.error, "We couldn't create your account. Please try again.");
        setFieldErrors(parsed.fieldErrors);
        setFormMessage(parsed.message);
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      if (
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address")
      ) {
        await signUp.verifications.sendEmailCode();
        setCode("");
        setFormMessage("Account created. Check your inbox for a 6-digit verification code.");
        return;
      }

      setFormMessage("Your account needs an additional setup step before it can be completed.");
    } catch (error) {
      const parsed = parseClerkError(error, "We couldn't create your account. Please try again.");
      setFieldErrors(parsed.fieldErrors);
      setFormMessage(parsed.message);
    }
  };

  const handleVerifyEmail = async () => {
    const validation = validateVerificationCode(code);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormMessage("");
      return;
    }

    setFieldErrors({});
    setFormMessage("");

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });

      if (result.error) {
        const parsed = parseClerkError(result.error, "That code is invalid or expired. Try again.");
        setFieldErrors(parsed.fieldErrors);
        setFormMessage(parsed.message);
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      setFormMessage("Verification is in progress. Please complete the remaining steps.");
    } catch (error) {
      const parsed = parseClerkError(error, "That code is invalid or expired. Try again.");
      setFieldErrors(parsed.fieldErrors);
      setFormMessage(parsed.message);
    }
  };

  const handleResendCode = async () => {
    setFieldErrors({});
    setFormMessage("");

    try {
      await signUp.verifications.sendEmailCode();
      setFormMessage("A new verification code is on the way.");
    } catch (error) {
      const parsed = parseClerkError(error, "We couldn't resend the code. Please try again.");
      setFormMessage(parsed.message);
    }
  };

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="auth-screen"
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">E</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Expensia</Text>
                <Text className="auth-wordmark-sub">Smart Billing</Text>
              </View>
            </View>

            <Text className="auth-title">Create your account</Text>
            <Text className="auth-subtitle">
              Start tracking every subscription with clarity, confidence, and secure access.
            </Text>
          </View>

          <View className="auth-card">
            {needsEmailVerification ? (
              <View className="auth-form">
                <View className="auth-status-chip">
                  <Text className="auth-status-chip-text">Verify email</Text>
                </View>

                <Text className="auth-helper">
                  Enter the 6-digit code we sent to {normalizeEmail(email) || "your email"}.
                </Text>

                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="123456"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="number-pad"
                    maxLength={6}
                    className={clsx("auth-input", mergedFieldErrors.code && "auth-input-error")}
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                  />
                  {mergedFieldErrors.code ? (
                    <Text className="auth-error">{mergedFieldErrors.code}</Text>
                  ) : null}
                </View>

                {visibleMessage ? <Text className="auth-status-text">{visibleMessage}</Text> : null}

                <Pressable
                  className={clsx("auth-button", isBusy && "auth-button-disabled")}
                  onPress={() => void handleVerifyEmail()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Verify & continue</Text>
                  )}
                </Pressable>

                <Pressable
                  className={clsx("auth-secondary-button", isBusy && "auth-button-disabled")}
                  onPress={() => void handleResendCode()}
                  disabled={isBusy}
                >
                  <Text className="auth-secondary-button-text">Resend code</Text>
                </Pressable>
              </View>
            ) : (
              <View className="auth-form">
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    textContentType="emailAddress"
                    className={clsx("auth-input", mergedFieldErrors.email && "auth-input-error")}
                  />
                  {mergedFieldErrors.email ? (
                    <Text className="auth-error">{mergedFieldErrors.email}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View className={clsx("auth-inline-input", mergedFieldErrors.password && "auth-input-error")}>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      className="auth-inline-input-control"
                    />
                    <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
                      <Text className="auth-inline-input-action">
                        {showPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {mergedFieldErrors.password ? (
                    <Text className="auth-error">{mergedFieldErrors.password}</Text>
                  ) : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <View
                    className={clsx(
                      "auth-inline-input",
                      mergedFieldErrors.confirmPassword && "auth-input-error"
                    )}
                  >
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      className="auth-inline-input-control"
                    />
                    <Pressable onPress={() => setShowConfirmPassword((current) => !current)} hitSlop={8}>
                      <Text className="auth-inline-input-action">
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Text>
                    </Pressable>
                  </View>
                  {mergedFieldErrors.confirmPassword ? (
                    <Text className="auth-error">{mergedFieldErrors.confirmPassword}</Text>
                  ) : null}
                </View>

                {visibleMessage ? <Text className="auth-status-text">{visibleMessage}</Text> : null}

                <Pressable
                  className={clsx("auth-button", isBusy && "auth-button-disabled")}
                  onPress={() => void handleCreateAccount()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>

                <Text className="auth-helper">
                  Use at least 8 characters with letters and numbers for stronger protection.
                </Text>
              </View>
            )}

            <View nativeID="clerk-captcha" />

            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Link href={SIGN_IN_ROUTE} className="auth-link">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

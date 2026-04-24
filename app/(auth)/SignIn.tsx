import { normalizeEmail, parseClerkError, validateSignInInput, validateVerificationCode, type AuthFieldErrors } from "@/lib/auth";
import { useSignIn } from "@clerk/expo";
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

const SIGN_UP_ROUTE = "/(auth)/SignUp" as Href;
const TABS_ROUTE = "/(tabs)" as Href;
const ONBOARDING_ROUTE = "/Onboarding" as Href;

export default function SignIn() {
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [formMessage, setFormMessage] = useState("");

  const isBusy = fetchStatus === "fetching";

  const supportsEmailCodeMfa =
    signIn.status === "needs_client_trust" ||
    (signIn.status === "needs_second_factor" &&
      signIn.supportedSecondFactors?.some((factor) => factor.strategy === "email_code"));

  const hookError = useMemo(() => parseClerkError(errors, ""), [errors]);
  const mergedFieldErrors = {
    ...hookError.fieldErrors,
    ...fieldErrors,
  };
  const visibleMessage = formMessage || hookError.message;

  const finalizeSignIn = async () => {
    await signIn.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          router.replace(ONBOARDING_ROUTE);
          return;
        }

        router.replace(TABS_ROUTE);
      },
    });
  };

  const handlePrimarySignIn = async () => {
    const validation = validateSignInInput({ email, password });
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormMessage("");
      return;
    }

    setFieldErrors({});
    setFormMessage("");

    try {
      const result = await signIn.password({
        emailAddress: normalizeEmail(email),
        password,
      });

      if (result.error) {
        const parsed = parseClerkError(result.error, "We couldn't sign you in. Please try again.");
        setFieldErrors(parsed.fieldErrors);
        setFormMessage(parsed.message);
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (
        signIn.status === "needs_client_trust" ||
        (signIn.status === "needs_second_factor" &&
          signIn.supportedSecondFactors?.some((factor) => factor.strategy === "email_code"))
      ) {
        await signIn.mfa.sendEmailCode();
        setCode("");
        setFormMessage("We sent a verification code to your email.");
        return;
      }

      setFormMessage("Additional verification is required before sign in can be completed.");
    } catch (error) {
      const parsed = parseClerkError(error, "We couldn't sign you in. Please try again.");
      setFieldErrors(parsed.fieldErrors);
      setFormMessage(parsed.message);
    }
  };

  const handleVerifyCode = async () => {
    const validation = validateVerificationCode(code);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setFormMessage("");
      return;
    }

    setFieldErrors({});
    setFormMessage("");

    try {
      const result = await signIn.mfa.verifyEmailCode({ code: code.trim() });

      if (result.error) {
        const parsed = parseClerkError(result.error, "That code is invalid or expired. Try again.");
        setFieldErrors(parsed.fieldErrors);
        setFormMessage(parsed.message);
        return;
      }

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      setFormMessage("Your sign in needs one more verification step.");
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
      await signIn.mfa.sendEmailCode();
      setFormMessage("A fresh verification code is on the way.");
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

            <Text className="auth-title">Welcome back</Text>
            <Text className="auth-subtitle">
              Sign in to keep renewals under control and stay ahead of every charge.
            </Text>
          </View>

          <View className="auth-card">
            {supportsEmailCodeMfa ? (
              <View className="auth-form">
                <View className="auth-status-chip">
                  <Text className="auth-status-chip-text">Verify sign in</Text>
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
                  onPress={() => void handleVerifyCode()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Continue</Text>
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
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="password"
                      textContentType="password"
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

                {visibleMessage ? <Text className="auth-status-text">{visibleMessage}</Text> : null}

                <Pressable
                  className={clsx("auth-button", isBusy && "auth-button-disabled")}
                  onPress={() => void handlePrimarySignIn()}
                  disabled={isBusy}
                >
                  {isBusy ? (
                    <ActivityIndicator color="#081126" />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>

                <Text className="auth-helper">
                  Bank-grade encryption keeps your account and billing data protected.
                </Text>
              </View>
            )}

            <View nativeID="clerk-captcha" />

            <View className="auth-link-row">
              <Text className="auth-link-copy">New to Expensia?</Text>
              <Link href={SIGN_UP_ROUTE} className="auth-link">
                Create an account
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

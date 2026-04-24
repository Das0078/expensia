export type AuthFieldName = "email" | "password" | "confirmPassword" | "code";

export type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

type ValidationResult = {
  isValid: boolean;
  errors: AuthFieldErrors;
};

type ClerkErrorItem = {
  message?: string;
  longMessage?: string;
  meta?: {
    paramName?: string;
  };
};

type ClerkErrorShape = {
  message?: string;
  errors?: ClerkErrorItem[];
  fields?: Record<string, unknown>;
  global?: unknown;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_REGEX = /^\d{6}$/;

const FIELD_BY_PARAM_NAME: Record<string, AuthFieldName> = {
  emailAddress: "email",
  email_address: "email",
  identifier: "email",
  password: "password",
  code: "code",
  verification_code: "code",
};

const hasValue = (value: string) => value.trim().length > 0;

const readErrorText = (value: unknown): string => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = readErrorText(item);
      if (text) return text;
    }

    return "";
  }

  if (typeof value === "object") {
    const maybeObject = value as { message?: unknown; longMessage?: unknown };
    const longMessage = typeof maybeObject.longMessage === "string" ? maybeObject.longMessage : "";
    const message = typeof maybeObject.message === "string" ? maybeObject.message : "";
    return longMessage || message;
  }

  return "";
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const validateSignInInput = (params: {
  email: string;
  password: string;
}): ValidationResult => {
  const errors: AuthFieldErrors = {};

  if (!hasValue(params.email)) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(normalizeEmail(params.email))) {
    errors.email = "Enter a valid email address.";
  }

  if (!hasValue(params.password)) {
    errors.password = "Password is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateSignUpInput = (params: {
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const errors: AuthFieldErrors = {};

  if (!hasValue(params.email)) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(normalizeEmail(params.email))) {
    errors.email = "Enter a valid email address.";
  }

  if (!hasValue(params.password)) {
    errors.password = "Password is required.";
  } else {
    const hasMinLength = params.password.length >= 8;
    const hasLetter = /[A-Za-z]/.test(params.password);
    const hasNumber = /\d/.test(params.password);

    if (!hasMinLength || !hasLetter || !hasNumber) {
      errors.password = "Use at least 8 characters with letters and numbers.";
    }
  }

  if (!hasValue(params.confirmPassword)) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (params.password !== params.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateVerificationCode = (code: string): ValidationResult => {
  const errors: AuthFieldErrors = {};

  if (!hasValue(code)) {
    errors.code = "Verification code is required.";
  } else if (!CODE_REGEX.test(code.trim())) {
    errors.code = "Enter the 6-digit code sent to your email.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const parseClerkError = (
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again."
): { message: string; fieldErrors: AuthFieldErrors } => {
  const maybeError = (error ?? {}) as ClerkErrorShape;
  const fieldErrors: AuthFieldErrors = {};
  let message = "";

  if (Array.isArray(maybeError.errors)) {
    for (const item of maybeError.errors) {
      const text = item.longMessage ?? item.message;
      const paramName = item.meta?.paramName ?? "";
      const field = FIELD_BY_PARAM_NAME[paramName];

      if (text && !message) {
        message = text;
      }

      if (field && text && !fieldErrors[field]) {
        fieldErrors[field] = text;
      }
    }
  }

  if (maybeError.fields && typeof maybeError.fields === "object") {
    for (const [key, value] of Object.entries(maybeError.fields)) {
      const field = FIELD_BY_PARAM_NAME[key];
      const text = readErrorText(value);

      if (field && text && !fieldErrors[field]) {
        fieldErrors[field] = text;
      }

      if (!message && text) {
        message = text;
      }
    }
  }

  if (!message) {
    message = readErrorText(maybeError.global);
  }

  if (!message && typeof maybeError.message === "string" && maybeError.message.trim()) {
    message = maybeError.message.trim();
  }

  return {
    message: message || fallbackMessage,
    fieldErrors,
  };
};

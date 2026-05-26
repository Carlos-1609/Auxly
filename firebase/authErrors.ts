// Maps Firebase Auth error codes to user-facing messages.
// Codes: https://firebase.google.com/docs/auth/admin/errors
const MESSAGES: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/operation-not-allowed": "This sign-in method is disabled.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed":
    "Network error. Check your connection and try again.",
  "auth/missing-password": "Please enter your password.",
};

export const mapAuthError = (error: unknown): string => {
  const code = (error as { code?: string })?.code;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Something went wrong. Please try again.";
};

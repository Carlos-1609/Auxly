import { Stack } from "expo-router";

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="SignIn" />
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="VerifyCode" />
      <Stack.Screen name="ResetPassword" />
    </Stack>
  );
};
export default AuthLayout;

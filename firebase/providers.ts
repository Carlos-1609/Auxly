import { SignupData } from "@/types/auth";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { FirebaseAuth } from "./firebaseConfig";

export const userSignUpFirebase = async (data: SignupData) => {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const { user } = await createUserWithEmailAndPassword(
    FirebaseAuth,
    data.email,
    data.password
  );
  await updateProfile(user, { displayName: fullName });
  return user;
};

export const userSignInFirebase = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(
    FirebaseAuth,
    email,
    password
  );
  return user;
};

export const userPasswordResetFirebase = async (email: string) => {
  await sendPasswordResetEmail(FirebaseAuth, email);
};

export const userLogoutFirebase = async () => await signOut(FirebaseAuth);

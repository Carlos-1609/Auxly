import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { FirebaseAuth } from "./firebaseConfig";

export const userSignUpFirebase = async (data: any) => {
  try {
    console.log(data);
    let fullName = `${data.firstName} ${data.lastName}`.trim();
    const userCredential = await createUserWithEmailAndPassword(
      FirebaseAuth,
      data.email,
      data.password
    );
    const user = userCredential.user;
    await updateProfile(user, {
      displayName: fullName,
    });

    return user;
  } catch (error) {
    console.error(error);
  }
};

export const userSignInFirebase = async (email: string, password: string) => {
  try {
    const response = await signInWithEmailAndPassword(
      FirebaseAuth,
      email,
      password
    );
    // console.log("User was logged In!!!");
    // console.log(JSON.stringify(response, null, 2));
    return response.user;
  } catch (error) {
    console.error(error);
  }
};

export const userPasswordResetFirebase = async (email: string) => {
  try {
    const response = await sendPasswordResetEmail(FirebaseAuth, email);
    return {
      ok: true,
      response: response,
    };
  } catch (error: any) {
    const errorCode = error.code;
    const errorMessage = error.message;

    return {
      ok: false,
      errorMessage: errorMessage,
      errorCode: errorCode,
    };
  }
};

export const userLogoutFirebase = async () => await signOut(FirebaseAuth);

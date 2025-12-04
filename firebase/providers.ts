import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FirebaseAuth } from "./firebaseConfig";

const googleProvider = new GoogleAuthProvider();

// export const signInWithGoogle = async (
//   idToken: string,
//   accessToken?: string
// ) => {
//   try {
//     const credential = GoogleAuthProvider.credential(idToken, accessToken);

//     const result = await signInWithCredential(FirebaseAuth, credential);
//     // result.user is the logged-in Firebase user
//     return result;
//   } catch (error) {
//     console.error(error);
//   }
// };

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
    console.log("User was logged In!!!");
    console.log(JSON.stringify(response, null, 2));
    return response.user;
  } catch (error) {
    console.error(error);
  }
};

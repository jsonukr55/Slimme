import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebase';

export const GOOGLE_WEB_CLIENT_ID = '700414448678-pgp9hp237fslg3p4rl2tc9t2bpvmd7ii.apps.googleusercontent.com';

export async function registerWithEmail(name: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function loginWithGoogle() {
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  await GoogleSignin.hasPlayServices();
  const signInResult = await GoogleSignin.signIn();
  const idToken = signInResult.data?.idToken;
  if (!idToken) throw new Error('Google Sign-In failed: no ID token');
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth, credential);
  return cred.user;
}

export async function signOut() {
  try { await GoogleSignin.signOut(); } catch {}
  await firebaseSignOut(auth);
}

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
    getAuth,
    initializeAuth,
    browserLocalPersistence,
    browserSessionPersistence,
    indexedDBLocalPersistence,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut as firebaseAuthSignOut,
    onAuthStateChanged,
    type User as FirebaseSdkUser,
    type Auth,
} from "firebase/auth";

export interface FirebaseUser {
    uid: string;
    email: string;
    displayName: string;
    photoUrl?: string;
    authProvider: "google" | "password";
    idToken?: string;
}

const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const validEnvApiKey = rawApiKey && !rawApiKey.includes("your_firebase_api_key") ? rawApiKey : "";

const firebaseConfig = {
    apiKey: validEnvApiKey || "AIzaSyAzj_FAhCvviBYi1rGYEU6U7GSTrnSj5X8",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "resqlink-67dda.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "resqlink-67dda",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "resqlink-67dda.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "664037442105",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:664037442105:web:da43b12abdbc4b312683e8",
};

export const isFirebaseConfigured = true;

// Initialize Firebase App
let app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Resilient Auth initialization with fallback to localStorage and sessionStorage
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence, browserSessionPersistence],
    });
} catch {
    auth = getAuth(app);
}

let googleProvider: GoogleAuthProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { auth };

/**
 * Format Firebase Auth errors into clear, friendly messages
 */
export function formatFirebaseAuthError(error: any): string {
    const code = error?.code || "";
    const rawMessage = error?.message || "";

    if (code === "auth/api-key-not-valid" || code === "auth/invalid-api-key" || rawMessage.includes("api-key-not-valid")) {
        return "Invalid Firebase API Key. Please copy your Web API Key (AIzaSy...) from your open Firebase Console tab (Project Settings > General > Web Apps) and paste it into frontend/.env as VITE_FIREBASE_API_KEY.";
    }

    switch (code) {
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
            return "Incorrect email or password. Please check and try again.";
        case "auth/email-already-in-use":
            return "An account with this email address already exists. Please sign in instead.";
        case "auth/weak-password":
            return "Password should be at least 6 characters long.";
        case "auth/popup-closed-by-user":
            return "Google sign-in was closed before completion. Please try again.";
        case "auth/popup-blocked":
            return "Pop-up was blocked by your browser. Please allow pop-ups for this site.";
        case "auth/network-request-failed":
            return "Network error. Please check your internet connection.";
        case "auth/too-many-requests":
            return "Too many failed attempts. Please try again later or reset your password.";
        default:
            return rawMessage || "Authentication failed. Please try again.";
    }
}

/**
 * Convert Firebase SDK User to App User format
 */
export async function mapFirebaseUser(sdkUser: FirebaseSdkUser, provider: "google" | "password" = "google"): Promise<FirebaseUser> {
    const token = await sdkUser.getIdToken().catch(() => "");
    const photoUrl = sdkUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(sdkUser.displayName || sdkUser.email || "User")}&background=0891b2&color=fff&bold=true`;

    return {
        uid: sdkUser.uid,
        email: sdkUser.email || "",
        displayName: sdkUser.displayName || (sdkUser.email ? sdkUser.email.split("@")[0] : "User"),
        photoUrl,
        authProvider: provider,
        idToken: token,
    };
}

/**
 * Sign up with Email & Password
 */
export async function firebaseSignUpWithEmail(
    email: string,
    pass: string,
    displayName: string
): Promise<FirebaseUser> {
    if (!auth) {
        throw new Error("Firebase Authentication failed to initialize.");
    }

    try {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        if (displayName && credential.user) {
            await updateProfile(credential.user, { displayName });
        }
        return await mapFirebaseUser(credential.user, "password");
    } catch (err: any) {
        throw new Error(formatFirebaseAuthError(err));
    }
}

/**
 * Sign in with Email & Password
 */
export async function firebaseSignInWithEmail(
    email: string,
    pass: string
): Promise<FirebaseUser> {
    if (!auth) {
        throw new Error("Firebase Authentication failed to initialize.");
    }

    try {
        const credential = await signInWithEmailAndPassword(auth, email, pass);
        return await mapFirebaseUser(credential.user, "password");
    } catch (err: any) {
        throw new Error(formatFirebaseAuthError(err));
    }
}

/**
 * Sign In with Google OAuth (Real Google Account Popup)
 */
export async function firebaseSignInWithGoogle(): Promise<FirebaseUser> {
    if (!auth || !googleProvider) {
        throw new Error("Firebase Google Authentication is not ready. Please refresh the page.");
    }

    try {
        const credential = await signInWithPopup(auth, googleProvider);
        return await mapFirebaseUser(credential.user, "google");
    } catch (err: any) {
        const code = err?.code || "";
        if (code === "auth/popup-closed-by-user") {
            throw new Error("Google sign-in was cancelled before completion. Please click again to sign in.");
        }
        if (code === "auth/popup-blocked") {
            throw new Error("Google sign-in popup was blocked by your browser. Please allow popups for localhost:5173 and try again.");
        }
        throw new Error(formatFirebaseAuthError(err));
    }
}

/**
 * Sign Out
 */
export async function firebaseSignOut(): Promise<void> {
    if (auth) {
        await firebaseAuthSignOut(auth);
    }
}

/**
 * Listen to Auth State Changes
 */
export function onFirebaseAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    if (!auth) {
        return () => {};
    }

    return onAuthStateChanged(auth, async (sdkUser) => {
        if (sdkUser) {
            const user = await mapFirebaseUser(sdkUser);
            callback(user);
        } else {
            callback(null);
        }
    });
}


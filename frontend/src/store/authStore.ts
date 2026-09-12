import { create } from "zustand";
import {
    type FirebaseUser,
    firebaseSignInWithGoogle,
    firebaseSignOut,
    onFirebaseAuthStateChanged,
} from "../config/firebase";

const API_BASE_URL = "http://localhost:8080";
const AUTH_STORAGE_KEY = "nexcure_auth_user_v1";

interface AuthState {
    user: FirebaseUser | null;
    loading: boolean;
    syncing: boolean;
    error: string | null;
    isAuthModalOpen: boolean;

    openAuthModal: () => void;
    closeAuthModal: () => void;
    clearError: () => void;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    initAuthListener: () => () => void;
}

const loadSavedUser = (): FirebaseUser | null => {
    try {
        const saved = localStorage.getItem(AUTH_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch {
        // Fallback
    }
    return null;
};

const inFlightSyncs = new Map<string, Promise<void>>();

// Sync and store user with backend PostgreSQL DB
export async function syncUserWithBackend(user: FirebaseUser): Promise<void> {
    if (!user || !user.uid) return;

    if (inFlightSyncs.has(user.uid)) {
        return inFlightSyncs.get(user.uid);
    }

    const syncPromise = (async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/sync`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(user.idToken ? { Authorization: `Bearer ${user.idToken}` } : {}),
                },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoUrl: user.photoUrl,
                    authProvider: user.authProvider || "google",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(
                    `Failed to store user profile in PostgreSQL database (Status: ${response.status}). ${errorText || "Please ensure the backend service and database are active."}`
                );
            }
        } finally {
            inFlightSyncs.delete(user.uid);
        }
    })();

    inFlightSyncs.set(user.uid, syncPromise);
    return syncPromise;
}

const safeSaveUser = (user: FirebaseUser | null) => {
    try {
        if (user) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    } catch {
        // Safe fallback if storage quota exceeded
    }
};

export const useAuthStore = create<AuthState>((set) => ({
    user: loadSavedUser(),
    loading: false,
    syncing: false,
    error: null,
    isAuthModalOpen: false,

    openAuthModal: () => set({ isAuthModalOpen: true, error: null }),
    closeAuthModal: () => set({ isAuthModalOpen: false, error: null }),
    clearError: () => set({ error: null }),

    loginWithGoogle: async () => {
        set({ loading: true, syncing: false, error: null });
        try {
            // 1. Google Authentication (Real OAuth popup)
            const user = await firebaseSignInWithGoogle();

            // 2. Persist user into PostgreSQL database
            set({ syncing: true });
            await syncUserWithBackend(user);

            // 3. Only allow user into the app once PostgreSQL successfully stores their profile
            safeSaveUser(user);
            set({ user, loading: false, syncing: false, isAuthModalOpen: false, error: null });
        } catch (err: any) {
            safeSaveUser(null);
            set({
                user: null,
                loading: false,
                syncing: false,
                error: err.message || "Failed to sign in with Google or store user in database.",
            });
            throw err;
        }
    },

    logout: async () => {
        try {
            await firebaseSignOut();
        } catch {
            // Ignore sign out error
        }
        safeSaveUser(null);
        set({ user: null, loading: false, syncing: false, error: null });
    },

    initAuthListener: () => {
        return onFirebaseAuthStateChanged(async (user) => {
            if (user) {
                try {
                    await syncUserWithBackend(user);
                    safeSaveUser(user);
                    set({ user, error: null });
                } catch (err) {
                    console.warn("Session user sync check skipped or offline:", err);
                }
            }
        });
    },
}));


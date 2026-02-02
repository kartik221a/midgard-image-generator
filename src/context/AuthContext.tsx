// Imports need updating too, but I'll do it in a separate block if needed or here if I can match safely.
// Actually, I can replace the whole file content since I have it all. It is safer to rewrite the context to include the new methods properly.

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: "admin" | "user" | null;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    role: null,
    loginWithGoogle: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"admin" | "user" | null>(null);

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (rawError: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = rawError as any;
            console.error("Login failed:", error);
            if (error?.message?.includes("network") || error?.code === "auth/network-request-failed") {
                alert("Login failed due to a network error. Please disable any Ad Blockers or Privacy Extensions (like uBlock Origin) for this site and try again.");
            } else if (error?.code === "auth/popup-closed-by-user") {
                // User closed popup, verify if it was intentional or forced
                console.warn("Popup closed by user");
            } else {
                alert(`Login failed: ${error.message}`);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setRole(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                try {
                    // Fetch role from Firestore
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role as "admin" | "user");
                    } else {
                        // Create user doc if not exists
                        await setDoc(doc(db, "users", user.uid), {
                            email: user.email,
                            role: "user",
                            createdAt: new Date(),
                        });
                        setRole("user");
                    }
                } catch (rawError: unknown) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const error = rawError as any;
                    console.error("Error fetching user role:", error);
                    if (error?.message?.includes("offline") || error?.code === "unavailable") {
                        console.warn("Firestore appears offline or blocked. This is likely an Ad-Blocker.");
                        // We could set a global error state here if desired
                    }
                    // Default to user role if firestore fails (e.g. permissions or block)
                    setRole("user");
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, role, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

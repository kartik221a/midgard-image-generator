"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/");
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-500 font-medium">Loading session...</span>
            </div>
        );
    }

    if (!user) return null; // Will redirect

    return <>{children}</>;
}

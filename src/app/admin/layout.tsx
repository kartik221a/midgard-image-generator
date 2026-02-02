"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user || role !== "admin") {
                router.push("/");
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!user || role !== "admin") {
        return null; // or a forbidden message
    }

    return <div className="p-8">{children}</div>;
}

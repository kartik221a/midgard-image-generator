"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, LogOut, User as UserIcon } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
    const { user, loginWithGoogle, logout, loading } = useAuth();

    return (
        <nav className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">StoryGen</span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/studio" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Studio
                            </Link>
                            <Link href="/library" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Library
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:items-center">
                        {loading ? (
                            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                        ) : user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-sm text-gray-700">Hi, {user.displayName || "User"}</span>
                                {user.photoURL && (
                                    <img className="h-8 w-8 rounded-full border border-gray-200" src={user.photoURL} alt="" />
                                )}
                                <button
                                    onClick={() => logout()}
                                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                                    title="Logout"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => loginWithGoogle()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Login with Google
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

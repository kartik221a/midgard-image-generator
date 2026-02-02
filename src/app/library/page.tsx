/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Book as BookIcon, Calendar, Image as ImageIcon, Trash2 } from "lucide-react";
import Link from "next/link";

interface Book {
    id: string;
    title: string;
    createdAt: { toDate: () => Date; toMillis?: () => number };
    totalPages: number;
    status: string;
    config: { model: string; aspectRatio: string };
    coverImageUrl?: string;
}

export default function LibraryPage() {
    const { user, loading: authLoading } = useAuth();
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            const fetchBooks = async () => {
                try {
                    const q = query(
                        collection(db, "books"),
                        where("userId", "==", user.uid)
                    );
                    const querySnapshot = await getDocs(q);
                    const booksList: Book[] = [];
                    querySnapshot.forEach((doc) => {
                        booksList.push({ id: doc.id, ...doc.data() } as Book);
                    });

                    // Client-side sort to avoid index issues
                    booksList.sort((a, b) => {
                        const dateA = a.createdAt?.toMillis?.() || 0;
                        const dateB = b.createdAt?.toMillis?.() || 0;
                        return dateB - dateA;
                    });

                    setBooks(booksList);
                } catch (error) {
                    console.error("Error fetching books:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchBooks();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const handleDelete = async (book: Book) => {
        if (!confirm(`Are you sure you want to delete "${book.title}"? This cannot be undone.`)) return;

        try {
            // 1. Delete Pages Subcollection (Client-side batch)
            const pagesRef = collection(db, "books", book.id, "pages");
            const snapshot = await getDocs(pagesRef);
            const batch = writeBatch(db);

            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // 2. Delete Book Document
            await deleteDoc(doc(db, "books", book.id));

            // 3. Delete Cloudinary Images (Background/Async via API)
            fetch("/api/books/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bookId: book.id, totalPages: book.totalPages }),
            });

            // 4. Update UI
            setBooks((prev) => prev.filter((b) => b.id !== book.id));

        } catch (error) {
            console.error("Error deleting book:", error);
            alert("Failed to delete book. Please try again.");
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center">Loading Library...</div>;

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p>Please log in to view your library.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
                </div>

                {books.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <BookIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700">No books found</h2>
                        <p className="text-gray-500 mt-2 mb-6">Create your first storybook in the Studio.</p>
                        <Link href="/studio" className="text-blue-600 hover:underline">
                            Go to Studio &rarr;
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {books.map((book) => (
                            <div
                                key={book.id}
                                className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative"
                            >
                                <Link href={`/library/${book.id}`} className="block">
                                    <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                        {book.coverImageUrl ? (
                                            <img
                                                src={book.coverImageUrl}
                                                alt={book.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <BookIcon className="w-12 h-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        )}
                                        <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 rounded text-xs font-semibold uppercase text-gray-600 shadow-sm z-10">
                                            {book.status}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900 truncate mb-1 pr-6">{book.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                            <Calendar className="w-3 h-3 mr-1" />
                                            {book.createdAt?.toDate?.().toLocaleDateString() || "Unknown Date"}
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                                                <ImageIcon className="w-3 h-3 mr-1" />
                                                {book.totalPages} Pages
                                            </span>
                                            <span className="text-xs text-gray-400">{book.config?.model}</span>
                                        </div>
                                    </div>
                                </Link>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDelete(book);
                                    }}
                                    className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                    title="Delete Book"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

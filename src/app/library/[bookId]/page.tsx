"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Image as ImageIcon } from "lucide-react";
import JSZip from "jszip";

interface PageData {
    id: string;
    imageUrl: string;
    pageNumber: number;
    originalPrompt: string;
}

interface BookData {
    title: string;
    totalPages: number;
}

export default function BookDetailPage({ params }: { params: { bookId: string } }) {
    const { bookId } = params;
    const [book, setBook] = useState<BookData | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [loading, setLoading] = useState(true);
    const [zipping, setZipping] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Book Info
                const bookSnap = await getDoc(doc(db, "books", bookId));
                if (bookSnap.exists()) {
                    setBook(bookSnap.data() as BookData);
                }

                // Fetch Pages
                const q = query(collection(db, "books", bookId, "pages"), orderBy("pageNumber"));
                const pagesSnap = await getDocs(q);
                const pagesList: PageData[] = [];
                pagesSnap.forEach((doc) => {
                    pagesList.push({ id: doc.id, ...doc.data() } as PageData);
                });
                setPages(pagesList);
            } catch (error) {
                console.error("Error fetching details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [bookId]);

    const downloadSingle = async (url: string, filename: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (e) {
            console.error("Download failed", e);
            window.open(url, '_blank'); // Fallback
        }
    };

    const downloadZip = async () => {
        if (!book) return;
        setZipping(true);
        try {
            const zip = new JSZip();
            const folder = zip.folder(book.title.replace(/[^a-z0-9]/gi, '_'));

            if (!folder) return;

            // Fetch all images
            const promises = pages.map(async (page) => {
                try {
                    const response = await fetch(page.imageUrl);
                    const blob = await response.blob();
                    const filename = `${page.pageNumber}_${book.title.replace(/[^a-z0-9]/gi, '_')}.jpg`;
                    folder.file(filename, blob);
                } catch (e) {
                    console.error(`Failed to fetch page ${page.pageNumber}`, e);
                    folder.file(`error_page_${page.pageNumber}.txt`, "Failed to download image");
                }
            });

            await Promise.all(promises);

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (e) {
            console.error("Zip generation failed", e);
            alert("Failed to create zip file");
        } finally {
            setZipping(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Loading Book Details...</div>;
    if (!book) return <div className="p-12 text-center">Book not found.</div>;

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8 border-b pb-6">
                    <Link href="/library" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Library
                    </Link>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
                            <p className="text-gray-500 mt-1">{pages.length} Pages Generated</p>
                        </div>
                        <button
                            onClick={downloadZip}
                            disabled={zipping || pages.length === 0}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 flex items-center font-medium disabled:opacity-50"
                        >
                            {zipping ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Compressing...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download All (ZIP)
                                </>
                            )}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {pages.map((page) => (
                        <div key={page.id} className="group relative bg-gray-50 rounded-lg border overflow-hidden hover:shadow-md transition-all">
                            <div className="aspect-square relative flex items-center justify-center bg-gray-200">
                                {/* Use standard img tag for external Cloudinary URLs to simplify */}
                                <img
                                    src={page.imageUrl}
                                    alt={`Page ${page.pageNumber}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => downloadSingle(page.imageUrl, `${page.pageNumber}_${book.title}.jpg`)}
                                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                                        title="Download Image"
                                    >
                                        <Download className="w-5 h-5 text-gray-700" />
                                    </button>
                                </div>
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
                                    Page {page.pageNumber}
                                </div>
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-gray-500 line-clamp-3" title={page.originalPrompt}>
                                    {page.originalPrompt}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

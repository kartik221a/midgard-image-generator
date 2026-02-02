import Link from "next/link";
import { ArrowRight, Wand2, Library, Download } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
          Turn your stories into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Beautiful Books
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          The ultimate AI-powered storybook generator. Create consistent characters, generate unlimited pages, and download your masterpiece in minutes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/studio"
            className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-bold hover:bg-blue-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
          >
            <Wand2 className="w-5 h-5 mr-2" />
            Create Your Book
          </Link>
          <Link
            href="/library"
            className="flex items-center px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl text-lg font-bold hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Library className="w-5 h-5 mr-2" />
            View Gallery
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Character Consistency</h3>
            <p className="text-gray-600">
              Upload a reference image and our AI ensures your characters look the same on every page.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600">
              <ArrowRight className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Generation</h3>
            <p className="text-gray-600">
              Paste your entire story. We generate up to 100 pages in one go while you watch.
            </p>
          </div>
          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 text-purple-600">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Download</h3>
            <p className="text-gray-600">
              Get your book as a ZIP file with high-quality images ready for publishing.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 text-center text-gray-500 bg-gray-50">
        <p>&copy; {new Date().getFullYear()} StoryGen. Powered by Infip & OpenRouter.</p>
      </footer>
    </div>
  );
}


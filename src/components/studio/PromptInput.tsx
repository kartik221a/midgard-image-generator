"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, ClipboardPaste } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromptInputProps {
    onPromptsAdded: (prompts: string[]) => void;
}

export default function PromptInput({ onPromptsAdded }: PromptInputProps) {
    const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
    const [pasteContent, setPasteContent] = useState("");

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onabort = () => console.log("file reading was aborted");
                reader.onerror = () => console.log("file reading has failed");
                reader.onload = () => {
                    const binaryStr = reader.result as string;
                    // Split by newline and filter empty lines
                    const prompts = binaryStr.split(/\r?\n/).filter((line) => line.trim() !== "");
                    onPromptsAdded(prompts);
                };
                reader.readAsText(file);
            });
        },
        [onPromptsAdded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "text/plain": [".txt"] },
        maxFiles: 1,
    });

    const handlePasteSubmit = () => {
        if (!pasteContent.trim()) return;
        const prompts = pasteContent.split(/\r?\n/).filter((line) => line.trim() !== "");
        onPromptsAdded(prompts);
        setPasteContent("");
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab("paste")}
                    className={cn(
                        "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                        activeTab === "paste"
                            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                >
                    <ClipboardPaste className="w-4 h-4 mr-2" />
                    Paste Text
                </button>
                <button
                    onClick={() => setActiveTab("upload")}
                    className={cn(
                        "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                        activeTab === "upload"
                            ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                </button>
            </div>

            <div className="p-6">
                {activeTab === "paste" ? (
                    <div className="space-y-4">
                        <textarea
                            value={pasteContent}
                            onChange={(e) => setPasteContent(e.target.value)}
                            placeholder="Paste your story lines here (one line per page)..."
                            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handlePasteSubmit}
                                disabled={!pasteContent.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                Parse & Add Prompts
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                            isDragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        )}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center text-gray-500">
                            <FileText className="w-12 h-12 mb-4 text-gray-400" />
                            {isDragActive ? (
                                <p>Drop the file here ...</p>
                            ) : (
                                <p>Drag &apos;n&apos; drop a .txt file here, or click to select file</p>
                            )}
                            <p className="text-xs mt-2 text-gray-400">.txt files only</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

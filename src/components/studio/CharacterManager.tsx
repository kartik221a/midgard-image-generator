"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { User, Plus, X, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Character {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
}

interface CharacterManagerProps {
    characters: Character[];
    setCharacters: (chars: Character[]) => void;
}

export default function CharacterManager({ characters, setCharacters }: CharacterManagerProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            // Mock upload and analysis
            acceptedFiles.forEach((file) => {
                setIsAnalyzing(true);
                // Simulate analysis delay
                setTimeout(() => {
                    const newChar: Character = {
                        id: Date.now().toString(),
                        name: "New Character",
                        description: "A character with features parsed from the image...",
                        imageUrl: URL.createObjectURL(file), // Temporary preview
                    };
                    setCharacters([...characters, newChar]);
                    setIsAnalyzing(false);
                }, 1500);
            });
        },
        [characters, setCharacters]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
        maxFiles: 5,
    });

    const updateCharacter = (id: string, field: keyof Character, value: string) => {
        setCharacters(
            characters.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    const removeCharacter = (id: string) => {
        setCharacters(characters.filter((c) => c.id !== id));
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                <User className="w-5 h-5 mr-2" />
                Character Consistency
            </h3>

            <div className="space-y-4">
                <div
                    {...getRootProps()}
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                        isDragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    )}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        {isAnalyzing ? (
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                        ) : (
                            <Plus className="w-8 h-8 mb-2 text-gray-400" />
                        )}
                        <p className="text-sm">
                            {isAnalyzing ? "Analyzing Character..." : "Drop character reference image"}
                        </p>
                    </div>
                </div>

                <div className="grid gap-4">
                    {characters.map((char) => (
                        <div key={char.id} className="relative flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            {char.imageUrl && (
                                <img src={char.imageUrl} alt={char.name} className="w-16 h-16 object-cover rounded-md" />
                            )}
                            <div className="flex-grow space-y-2">
                                <input
                                    type="text"
                                    value={char.name}
                                    onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm font-medium"
                                    placeholder="Character Name"
                                />
                                <div className="relative">
                                    <textarea
                                        value={char.description}
                                        onChange={(e) => updateCharacter(char.id, 'description', e.target.value)}
                                        className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs resize-none h-16"
                                        placeholder="Visual description..."
                                    />
                                    <Wand2 className="w-3 h-3 absolute bottom-2 right-2 text-purple-400" />
                                </div>
                            </div>
                            <button
                                onClick={() => removeCharacter(char.id)}
                                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

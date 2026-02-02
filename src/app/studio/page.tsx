"use client";

import { useState } from "react";
import PromptInput from "@/components/studio/PromptInput";
import PromptList from "@/components/studio/PromptList";
import ConfigPanel from "@/components/studio/ConfigPanel";
import CharacterManager from "@/components/studio/CharacterManager";
import { useBulkGenerator } from "@/hooks/useBulkGenerator";

interface Character {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
}

export default function StudioPage() {
    const [prompts, setPrompts] = useState<string[]>([]);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [model, setModel] = useState("z-image-turbo");
    const [aspectRatio, setAspectRatio] = useState("1:1");
    const [bookTitle, setBookTitle] = useState("");

    const { startGeneration, pauseGeneration, resumeGeneration, reset, status, currentIndex, logs, bookId } = useBulkGenerator();

    const handlePromptsAdded = (newPrompts: string[]) => {
        setPrompts([...prompts, ...newPrompts]);
    };

    const handleEditPrompt = (index: number, newText: string) => {
        const newPrompts = [...prompts];
        newPrompts[index] = newText;
        setPrompts(newPrompts);
    };

    const handleDeletePrompt = (index: number) => {
        setPrompts(prompts.filter((_, i) => i !== index));
    };

    const handleStart = () => {
        startGeneration({
            prompts,
            characters,
            config: { model, aspectRatio },
            title: bookTitle || "Untitled Story"
        });
    };

    const handleReset = () => {
        reset();
        setPrompts([]);
        setBookTitle("");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex-1 mr-8">
                        <label className="block text-xs font-medium text-gray-500 mb-1">BOOK TITLE</label>
                        <input
                            type="text"
                            placeholder="Enter a magical title..."
                            value={bookTitle}
                            onChange={(e) => setBookTitle(e.target.value)}
                            className="w-full text-2xl font-bold text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-300"
                        />
                    </div>
                    <div className="flex gap-2">
                        {status === 'running' ? (
                            <button
                                onClick={pauseGeneration}
                                className="px-6 py-3 bg-yellow-500 text-white rounded-lg shadow-lg hover:bg-yellow-600 font-semibold"
                            >
                                Pause
                            </button>
                        ) : status === 'paused' ? (
                            <button
                                onClick={resumeGeneration}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 font-semibold"
                            >
                                Resume
                            </button>
                        ) : status === 'completed' ? (
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-50 font-semibold"
                            >
                                Start New Project
                            </button>
                        ) : (
                            <button
                                onClick={handleStart}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={prompts.length === 0}
                            >
                                {`Start Generation (${prompts.length} Pages)`}
                            </button>
                        )}
                    </div>
                </header>

                {/* Completion Card */}
                {status === 'completed' && bookId && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <span className="text-3xl">🎉</span>
                        </div>
                        <h2 className="text-2xl font-bold text-green-900 mb-2">Book Generated Automatically!</h2>
                        <p className="text-green-700 mb-6">Your storybook is ready to read in the library.</p>
                        <a
                            href={`/library/${bookId}`}
                            className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-green-700 hover:scale-105 transition-all"
                        >
                            Read Book Now &rarr;
                        </a>
                    </div>
                )}

                {/* Status Area */}
                {(status === 'running' || status === 'paused') && (
                    <div className="bg-white border rounded-lg p-4 mb-8 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700">Generation Progress</span>
                            <span className="text-sm text-gray-500">{currentIndex} / {prompts.length} Completed</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${(currentIndex / prompts.length) * 100}%` }}
                            ></div>
                        </div>
                        <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-xs h-32 overflow-y-auto">
                            {logs.map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-100 transition-opacity">
                    {/* Left Sidebar: Controls & Characters */}
                    <div className={`space-y-6 ${status !== 'idle' ? 'pointer-events-none opacity-50' : ''}`}>
                        <ConfigPanel
                            model={model}
                            setModel={setModel}
                            aspectRatio={aspectRatio}
                            setAspectRatio={setAspectRatio}
                        />
                        <CharacterManager
                            characters={characters}
                            setCharacters={setCharacters}
                        />
                    </div>

                    {/* Main Area: Prompts */}
                    <div className="lg:col-span-2 space-y-6">
                        <PromptInput onPromptsAdded={handlePromptsAdded} /> {/* Should probably disable input during gen too */}
                        <PromptList
                            prompts={prompts}
                            onDelete={handleDeletePrompt}
                            onEdit={handleEditPrompt}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

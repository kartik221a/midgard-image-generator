"use client";

import { Edit2, Trash2, X, Check } from "lucide-react";
import { useState } from "react";

interface PromptListProps {
    prompts: string[];
    onDelete: (index: number) => void;
    onEdit: (index: number, newText: string) => void;
}

export default function PromptList({ prompts, onDelete, onEdit }: PromptListProps) {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const startEdit = (index: number, text: string) => {
        setEditingIndex(index);
        setEditValue(text);
    };

    const saveEdit = () => {
        if (editingIndex !== null) {
            onEdit(editingIndex, editValue);
            setEditingIndex(null);
            setEditValue("");
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue("");
    };

    if (prompts.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No prompts yet. Add some above!</p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Prompt Queue ({prompts.length})</h3>
                <button
                    onClick={() => { if (confirm('Clear all prompts?')) prompts.forEach(() => onDelete(0)) }} // Naive clear
                    className="text-xs text-red-500 hover:text-red-700"
                >
                    Clear All
                </button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {prompts.map((prompt, index) => (
                    <div
                        key={index}
                        className="group flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm"
                    >
                        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-xs font-medium text-gray-500">
                            {index + 1}
                        </div>

                        <div className="flex-grow min-w-0">
                            {editingIndex === index ? (
                                <div className="flex gap-2">
                                    <textarea
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="w-full p-2 text-sm border border-blue-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                                        rows={2}
                                        autoFocus
                                    />
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={saveEdit}
                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                            title="Save"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            title="Cancel"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {prompt}
                                </p>
                            )}
                        </div>

                        {editingIndex !== index && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => startEdit(index, prompt)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => onDelete(index)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

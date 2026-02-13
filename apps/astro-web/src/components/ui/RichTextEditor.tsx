"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, List, ListOrdered, Underline as UnderlineIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    disabled?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeight = '150px',
    disabled = false,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-stone prose-sm max-w-none focus:outline-none min-h-[100px] p-3',
            },
        },
    });

    // Keep editor content in sync with external value if needed
    // Note: Only update if content is drastically different to avoid cursor jumping
    // Usually for controlled inputs this is tricky with Tiptap, but for simple use cases:
    useEffect(() => {
        if (!editor) return;

        // If the value form prop is different from editor content
        if (value !== editor.getHTML()) {
            // If editor is empty and value has content (Initial load)
            if (editor.isEmpty && value) {
                editor.commands.setContent(value);
            }
            // If value is empty (Form reset)
            else if (!value) {
                editor.commands.setContent('');
            }
            // Optional: sync external changes even if not empty, but carefully
            // For now, handling initial load and reset is sufficient for our modals
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("border border-stone-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-stone-400 focus-within:border-transparent transition-all", className)}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-1 border-b border-stone-100 bg-stone-50/50">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    disabled={disabled}
                >
                    <Bold size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    disabled={disabled}
                >
                    <Italic size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    disabled={disabled}
                >
                    <UnderlineIcon size={16} />
                </ToolbarButton>
                <div className="w-[1px] h-4 bg-stone-200 mx-1" />
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    disabled={disabled}
                >
                    <List size={16} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    disabled={disabled}
                >
                    <ListOrdered size={16} />
                </ToolbarButton>
            </div>

            {/* Editor Area */}
            <div
                className="max-h-[300px] overflow-y-auto cursor-text"
                onClick={() => editor.chain().focus().run()}
                style={{ minHeight }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function ToolbarButton({ onClick, isActive, disabled, children }: { onClick: () => void, isActive: boolean, disabled: boolean, children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "p-1.5 rounded-md hover:bg-stone-200 transition-colors text-stone-500 hover:text-stone-900",
                isActive && "bg-stone-200 text-stone-900",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {children}
        </button>
    );
}

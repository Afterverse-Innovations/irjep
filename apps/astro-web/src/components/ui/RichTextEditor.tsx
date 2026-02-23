"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
    Bold, Italic, Underline as UnderlineIcon,
    List, ListOrdered, Heading1, Heading2, Heading3,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Highlighter, Subscript as SubIcon, Superscript as SupIcon,
    Table as TableIcon, Undo2, Redo2, Minus, Quote, Code,
    Strikethrough, Plus, Trash2, Scissors,
} from 'lucide-react';
import { PageBreak } from './PageBreakExtension';
import { cn } from '@/lib/utils';
import { useEffect, useCallback } from 'react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    minHeight?: string;
    maxHeight?: string;
    disabled?: boolean;
    /** Compact mode hides some toolbar options */
    compact?: boolean;
}

export function RichTextEditor({
    value,
    onChange,
    placeholder,
    className,
    minHeight = '200px',
    maxHeight = '500px',
    disabled = false,
    compact = false,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            Highlight.configure({ multicolor: false }),
            Subscript,
            Superscript,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Table.configure({ resizable: true }),
            TableRow,
            TableCell,
            TableHeader,
            PageBreak,
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-stone prose-sm max-w-none focus:outline-none p-4',
                style: `min-height: ${minHeight}`,
            },
        },
    });

    useEffect(() => {
        if (!editor) return;
        if (value !== editor.getHTML()) {
            if (editor.isEmpty && value) {
                editor.commands.setContent(value);
            } else if (!value) {
                editor.commands.setContent('');
            }
        }
    }, [value, editor]);

    const insertTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    const addColAfter = useCallback(() => editor?.chain().focus().addColumnAfter().run(), [editor]);
    const addRowAfter = useCallback(() => editor?.chain().focus().addRowAfter().run(), [editor]);
    const deleteTable = useCallback(() => editor?.chain().focus().deleteTable().run(), [editor]);

    if (!editor) return null;

    return (
        <div className={cn("border border-stone-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400/40 focus-within:border-emerald-300 transition-all", className)}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-stone-100 bg-stone-50/70">
                {/* Undo / Redo */}
                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={disabled || !editor.can().undo()} title="Undo">
                    <Undo2 size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={disabled || !editor.can().redo()} title="Redo">
                    <Redo2 size={14} />
                </ToolbarBtn>

                <Sep />

                {/* Headings */}
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} disabled={disabled} title="Heading 1">
                    <Heading1 size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} disabled={disabled} title="Heading 2">
                    <Heading2 size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} disabled={disabled} title="Heading 3">
                    <Heading3 size={14} />
                </ToolbarBtn>

                <Sep />

                {/* Inline formatting */}
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} disabled={disabled} title="Bold">
                    <Bold size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} disabled={disabled} title="Italic">
                    <Italic size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} disabled={disabled} title="Underline">
                    <UnderlineIcon size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} disabled={disabled} title="Strikethrough">
                    <Strikethrough size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} disabled={disabled} title="Highlight">
                    <Highlighter size={14} />
                </ToolbarBtn>

                {!compact && (
                    <>
                        <ToolbarBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} disabled={disabled} title="Subscript">
                            <SubIcon size={14} />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} disabled={disabled} title="Superscript">
                            <SupIcon size={14} />
                        </ToolbarBtn>
                    </>
                )}

                <Sep />

                {/* Lists */}
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} disabled={disabled} title="Bullet List">
                    <List size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} disabled={disabled} title="Numbered List">
                    <ListOrdered size={14} />
                </ToolbarBtn>

                {!compact && (
                    <>
                        <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} disabled={disabled} title="Blockquote">
                            <Quote size={14} />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} disabled={disabled} title="Code Block">
                            <Code size={14} />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} disabled={disabled} title="Horizontal Rule">
                            <Minus size={14} />
                        </ToolbarBtn>
                        <ToolbarBtn onClick={() => editor.chain().focus().setPageBreak().run()} disabled={disabled} title="Page Break">
                            <Scissors size={14} />
                        </ToolbarBtn>
                    </>
                )}

                <Sep />

                {/* Text Alignment */}
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} disabled={disabled} title="Align Left">
                    <AlignLeft size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} disabled={disabled} title="Align Center">
                    <AlignCenter size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} disabled={disabled} title="Align Right">
                    <AlignRight size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} disabled={disabled} title="Justify">
                    <AlignJustify size={14} />
                </ToolbarBtn>

                {!compact && (
                    <>
                        <Sep />
                        {/* Table controls */}
                        <ToolbarBtn onClick={insertTable} disabled={disabled} title="Insert Table">
                            <TableIcon size={14} />
                        </ToolbarBtn>
                        {editor.isActive('table') && (
                            <>
                                <ToolbarBtn onClick={addColAfter} disabled={disabled} title="Add Column">
                                    <Plus size={12} />
                                    <span className="text-[9px] ml-0.5">Col</span>
                                </ToolbarBtn>
                                <ToolbarBtn onClick={addRowAfter} disabled={disabled} title="Add Row">
                                    <Plus size={12} />
                                    <span className="text-[9px] ml-0.5">Row</span>
                                </ToolbarBtn>
                                <ToolbarBtn onClick={deleteTable} disabled={disabled} title="Delete Table" className="text-red-500 hover:text-red-700">
                                    <Trash2 size={12} />
                                </ToolbarBtn>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Editor Area */}
            <div
                className="overflow-y-auto cursor-text"
                onClick={() => editor.chain().focus().run()}
                style={{ minHeight, maxHeight }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

/* ─── Shared toolbar button ──────────────────────────────────── */
function ToolbarBtn({
    onClick, active, disabled, children, title, className: extraClassName
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-1.5 rounded-md hover:bg-stone-200 transition-colors text-stone-500 hover:text-stone-900 flex items-center",
                active && "bg-emerald-100 text-emerald-700",
                disabled && "opacity-40 cursor-not-allowed",
                extraClassName,
            )}
        >
            {children}
        </button>
    );
}

function Sep() {
    return <div className="w-[1px] h-4 bg-stone-200 mx-1" />;
}

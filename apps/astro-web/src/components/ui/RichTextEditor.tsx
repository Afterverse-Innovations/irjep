"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Image from '@tiptap/extension-image';
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
    Columns2, Rows2, ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
    Merge, Split, ToggleLeft, Grid2x2, Wrench,
    ChevronRight, ChevronLeft, Image as ImageIcon,
    Layout
} from 'lucide-react';
import { PageBreak } from './PageBreakExtension';
import { cn } from '@/lib/utils';
import { useEffect, useCallback, useState, useRef } from 'react';

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
    const [showTableMenu, setShowTableMenu] = useState(false);
    const [tableCaption, setTableCaption] = useState('');
    const [showCaptionInput, setShowCaptionInput] = useState(false);
    const tableMenuRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4] },
            }),
            Underline,
            Highlight.configure({ multicolor: false }),
            Subscript,
            Superscript,
            TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'tiptap-table',
                },
            }),
            TableRow,
            TableCell,
            TableHeader,
            PageBreak,
            Image.configure({
                allowBase64: true,
                // @ts-ignore - resize is available in v3.0+
                resize: true,
                HTMLAttributes: {
                    class: 'rounded-lg border border-stone-200 shadow-sm max-w-full h-auto my-4',
                },
            }),
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

    // Close table menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
                setShowTableMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const insertTableWithCaption = useCallback(() => {
        if (!editor) return;
        const caption = tableCaption.trim() || 'Table Caption';
        editor
            .chain()
            .focus()
            .insertContent(`<p class="table-caption"><strong>${caption}</strong></p>`)
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run();
        setTableCaption('');
        setShowCaptionInput(false);
    }, [editor, tableCaption]);

    const insertTableNoCaption = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
        setShowTableMenu(false);
    }, [editor]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editor) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                editor.chain().focus().setImage({ src: base64 }).run();
            };
            reader.readAsDataURL(file);
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (!editor) return null;

    const isInTable = editor.isActive('table');

    return (
        <div className={cn("border border-stone-200 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-emerald-400/40 focus-within:border-emerald-300 transition-all", className)}>
            {/* ─── Main Toolbar ─────────────────────────────────────── */}
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
                        <Sep />
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={disabled}
                            />
                            <ToolbarBtn
                                onClick={() => fileInputRef.current?.click()}
                                disabled={disabled}
                                title="Insert Image"
                                active={false}
                            >
                                <ImageIcon size={14} />
                            </ToolbarBtn>
                        </label>
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
                        {/* Table insert button with dropdown */}
                        <div className="relative" ref={tableMenuRef}>
                            <ToolbarBtn
                                onClick={() => setShowTableMenu(!showTableMenu)}
                                disabled={disabled}
                                title="Insert Table"
                                active={showTableMenu}
                            >
                                <TableIcon size={14} />
                            </ToolbarBtn>

                            {showTableMenu && (
                                <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-stone-200 rounded-lg shadow-lg p-3 w-64">
                                    <div className="text-xs font-semibold text-stone-600 mb-2">Insert Table</div>
                                    <div className="space-y-2">
                                        <button
                                            onClick={insertTableNoCaption}
                                            className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-stone-100 text-stone-700 flex items-center gap-2"
                                        >
                                            <Grid2x2 size={12} /> Table without caption
                                        </button>
                                        <div className="border-t border-stone-100 pt-2">
                                            <label className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Table with caption</label>
                                            <div className="flex gap-1 mt-1">
                                                <input
                                                    type="text"
                                                    value={tableCaption}
                                                    onChange={(e) => setTableCaption(e.target.value)}
                                                    placeholder="Enter caption…"
                                                    className="flex-1 text-xs px-2 py-1 border border-stone-200 rounded"
                                                    onKeyDown={(e) => { if (e.key === 'Enter') insertTableWithCaption(); }}
                                                />
                                                <button
                                                    onClick={insertTableWithCaption}
                                                    className="text-xs px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ─── Table Context Toolbar (visible when cursor is in a table) ── */}
            {isInTable && !compact && (
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-emerald-100 bg-emerald-50/50">
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mr-2">Table</span>

                    {/* Column operations */}
                    <ToolbarBtn onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={disabled} title="Add Column Before">
                        <ArrowLeft size={11} /><Columns2 size={11} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={disabled} title="Add Column After">
                        <Columns2 size={11} /><ArrowRight size={11} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().deleteColumn().run()} disabled={disabled} title="Delete Column" className="text-red-500 hover:text-red-700">
                        <Columns2 size={11} /><Trash2 size={10} />
                    </ToolbarBtn>

                    <Sep />

                    {/* Row operations */}
                    <ToolbarBtn onClick={() => editor.chain().focus().addRowBefore().run()} disabled={disabled} title="Add Row Before">
                        <ArrowUp size={11} /><Rows2 size={11} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().addRowAfter().run()} disabled={disabled} title="Add Row After">
                        <Rows2 size={11} /><ArrowDown size={11} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().deleteRow().run()} disabled={disabled} title="Delete Row" className="text-red-500 hover:text-red-700">
                        <Rows2 size={11} /><Trash2 size={10} />
                    </ToolbarBtn>

                    <Sep />

                    {/* Merge / Split */}
                    <ToolbarBtn onClick={() => editor.chain().focus().mergeCells().run()} disabled={disabled} title="Merge Cells">
                        <Merge size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().splitCell().run()} disabled={disabled} title="Split Cell">
                        <Split size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().mergeOrSplit().run()} disabled={disabled} title="Merge or Split">
                        <Merge size={10} /><span className="text-[8px] mx-0.5">/</span><Split size={10} />
                    </ToolbarBtn>

                    <Sep />

                    {/* Header toggles */}
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeaderRow().run()} disabled={disabled} title="Toggle Header Row">
                        <span className="text-[9px] font-bold">H-Row</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeaderColumn().run()} disabled={disabled} title="Toggle Header Column">
                        <span className="text-[9px] font-bold">H-Col</span>
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().toggleHeaderCell().run()} disabled={disabled} title="Toggle Header Cell">
                        <span className="text-[9px] font-bold">H-Cell</span>
                    </ToolbarBtn>

                    <Sep />

                    {/* Navigation */}
                    <ToolbarBtn onClick={() => editor.chain().focus().goToNextCell().run()} disabled={disabled} title="Go to Next Cell">
                        <ChevronRight size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().goToPreviousCell().run()} disabled={disabled} title="Go to Previous Cell">
                        <ChevronLeft size={12} />
                    </ToolbarBtn>

                    <Sep />

                    {/* Fix / Delete */}
                    <ToolbarBtn onClick={() => editor.chain().focus().fixTables().run()} disabled={disabled} title="Fix Tables">
                        <Wrench size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn onClick={() => editor.chain().focus().deleteTable().run()} disabled={disabled} title="Delete Table" className="text-red-500 hover:text-red-700">
                        <Trash2 size={12} />
                    </ToolbarBtn>
                </div>
            )}

            {/* ─── Image Context Toolbar (visible when an image is selected) ── */}
            {editor.isActive('image') && (
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b border-blue-100 bg-blue-50/50">
                    <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider mr-2 uppercase">Image</span>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        active={editor.isActive({ textAlign: 'left' })}
                        title="Align Left"
                    >
                        <AlignLeft size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        active={editor.isActive({ textAlign: 'center' })}
                        title="Align Center"
                    >
                        <AlignCenter size={12} />
                    </ToolbarBtn>
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        active={editor.isActive({ textAlign: 'right' })}
                        title="Align Right"
                    >
                        <AlignRight size={12} />
                    </ToolbarBtn>
                    <Sep />
                    <ToolbarBtn
                        onClick={() => editor.chain().focus().deleteSelection().run()}
                        title="Delete Image"
                        className="text-red-500 hover:text-red-700"
                    >
                        <Trash2 size={12} />
                    </ToolbarBtn>
                </div>
            )}

            {/* ─── Editor Area ──────────────────────────────────────── */}
            <div
                className="overflow-y-auto cursor-text rte-editor-area"
                onClick={() => editor.chain().focus().run()}
                style={{ minHeight, maxHeight }}
            >
                <EditorContent editor={editor} />
            </div>

            <style>{`
                /* Image Resize Handles */
                .ProseMirror .image-resizer {
                    display: inline-block;
                    line-height: 0;
                    position: relative;
                }
                .ProseMirror .image-resizer .image-resizer__handler {
                    position: absolute;
                    width: 10px;
                    height: 10px;
                    background: #10b981;
                    border: 1px solid white;
                    z-index: 100;
                }
                .ProseMirror .image-resizer .image-resizer__handler--top-left { top: -5px; left: -5px; cursor: nw-resize; }
                .ProseMirror .image-resizer .image-resizer__handler--top-right { top: -5px; right: -5px; cursor: ne-resize; }
                .ProseMirror .image-resizer .image-resizer__handler--bottom-left { bottom: -5px; left: -5px; cursor: sw-resize; }
                .ProseMirror .image-resizer .image-resizer__handler--bottom-right { bottom: -5px; right: -5px; cursor: se-resize; }
                
                .ProseMirror img.ProseMirror-selectednode {
                    outline: 3px solid #10b981;
                }

                /* Override Tailwind prose table resets */
                .rte-editor-area .ProseMirror table,
                .rte-editor-area .tiptap table {
                    border-collapse: collapse !important;
                    width: auto !important;
                    max-width: 100% !important;
                    margin: 6px 0 !important;
                    font-size: 11px !important;
                    line-height: 1.2 !important;
                }
                .rte-editor-area .ProseMirror table td,
                .rte-editor-area .ProseMirror table th,
                .rte-editor-area .tiptap table td,
                .rte-editor-area .tiptap table th {
                    border: 1px solid #d1d5db !important;
                    padding: 2px 4px !important;
                    min-width: 40px;
                    position: relative;
                    vertical-align: top;
                    line-height: 1.2 !important;
                }
                .rte-editor-area .ProseMirror table th,
                .rte-editor-area .tiptap table th {
                    background: #f3f4f6 !important;
                    font-weight: 600 !important;
                    text-align: left;
                }
                .rte-editor-area .ProseMirror table td.selectedCell,
                .rte-editor-area .ProseMirror table th.selectedCell {
                    background: #d1fae5 !important;
                    outline: 2px solid #10b981;
                }
                .rte-editor-area .ProseMirror .column-resize-handle {
                    position: absolute;
                    right: -2px;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: #10b981;
                    cursor: col-resize;
                    z-index: 20;
                }
                .rte-editor-area .ProseMirror.resize-cursor {
                    cursor: col-resize;
                }
                .rte-editor-area .ProseMirror .tableWrapper,
                .rte-editor-area .tableWrapper {
                    overflow-x: auto;
                    margin: 6px 0;
                    display: inline-block;
                    max-width: 100%;
                }
                .rte-editor-area p.table-caption {
                    text-align: center;
                    font-size: 12px;
                    color: #374151;
                    margin: 4px 0 2px;
                }
                .rte-editor-area .page-break {
                    border-top: 2px dashed #d1d5db;
                    margin: 12px 0;
                    position: relative;
                }
                .rte-editor-area .page-break::after {
                    content: 'Page Break';
                    position: absolute;
                    top: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 0 8px;
                    font-size: 10px;
                    color: #9ca3af;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
            `}</style>
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

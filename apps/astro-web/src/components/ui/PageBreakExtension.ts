import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        pageBreak: {
            setPageBreak: () => ReturnType;
        };
    }
}

/**
 * TipTap extension for inserting a manual page break.
 * Renders as <div class="page-break" data-page-break="true"></div>
 * In the editor, it appears as a visible dashed line.
 */
export const PageBreak = Node.create({
    name: 'pageBreak',

    group: 'block',

    atom: true, // non-editable, single unit

    parseHTML() {
        return [
            {
                tag: 'div[data-page-break]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, {
            'data-page-break': 'true',
            'class': 'page-break',
            'style': 'border-top: 2px dashed #d1d5db; margin: 12px 0; position: relative;',
        })];
    },

    addCommands() {
        return {
            setPageBreak: () => ({ chain }) => {
                return chain()
                    .insertContent({ type: this.name })
                    .run();
            },
        };
    },
});

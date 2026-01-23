import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DataTableNodeView } from './DataTableNodeView';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        dataTable: {
            /**
             * Insert a Data Table node
             */
            insertDataTable: () => ReturnType;
        };
    }
}

export const DataTable = Node.create({
    name: 'dataTable',
    group: 'block',
    atom: true, // Leaf node, no content
    draggable: true,

    addAttributes() {
        return {
            data: {
                default: null,
            },
            columns: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="data-table"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'data-table' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(DataTableNodeView);
    },

    addCommands() {
        return {
            insertDataTable:
                () =>
                    ({ commands }) => {
                        return commands.insertContent({
                            type: this.name,
                            attrs: {
                                data: null,
                            },
                        });
                    },
        };
    },
});

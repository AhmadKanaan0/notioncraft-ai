'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { DataTableComponent } from '../components/DataTable';

export function DataTableNodeView({ node, updateAttributes }: NodeViewProps) {
    const handleDataChange = (data: unknown, columns: unknown) => {
        updateAttributes({ data, columns });
    };

    return (
        <NodeViewWrapper className="data-table-wrapper">
            <DataTableComponent
                initialData={node.attrs.data}
                initialColumns={node.attrs.columns}
                onDataChange={handleDataChange}
            />
        </NodeViewWrapper>
    );
}

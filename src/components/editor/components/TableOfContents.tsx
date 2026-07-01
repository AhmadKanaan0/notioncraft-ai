'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { TextSelection } from '@tiptap/pm/state';

export interface ToCItem {
    id: string;
    level: number;
    textContent: string;
    isActive: boolean;
    isScrolledOver: boolean;
    itemIndex: number;
}

interface TableOfContentsProps {
    items: ToCItem[];
    editor: Editor | null;
    className?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ items, editor, className }) => {
    if (items.length === 0) {
        return (
            <div className={cn("text-sm text-muted-foreground p-4 italic", className)}>
                Start typing headings (H1, H2, H3) to see the table of contents.
            </div>
        );
    }

    const onItemClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();

        if (editor) {
            const element = editor.view.dom.querySelector(`[data-toc-id="${id}"]`);
            if (element) {
                const pos = editor.view.posAtDOM(element, 0);

                // Set selection
                const tr = editor.view.state.tr;
                tr.setSelection(TextSelection.create(tr.doc, pos));
                editor.view.dispatch(tr);
                editor.view.focus();

                // Update URL hash without jumping
                if (window.history.pushState) {
                    window.history.pushState(null, '', `#${id}`);
                }

                // Smooth scroll
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                });
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-1 overflow-y-auto max-h-full py-2 px-1", className)}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                On this page
            </h3>
            {items.map((item) => (
                <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => onItemClick(e, item.id)}
                    className={cn(
                        "group flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors relative",
                        "hover:bg-accent hover:text-accent-foreground",
                        item.isActive && !item.isScrolledOver
                            ? "text-primary font-medium bg-primary/5"
                            : "text-muted-foreground",
                        item.isScrolledOver && "opacity-60"
                    )}
                    style={{
                        paddingLeft: `${(item.level - 1) * 1.25 + 0.75}rem`
                    }}
                >
                    {item.isActive && !item.isScrolledOver && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/5 bg-primary rounded-r-full" />
                    )}
                    <span className="truncate">{item.textContent}</span>
                </a>
            ))}
        </div>
    );
};

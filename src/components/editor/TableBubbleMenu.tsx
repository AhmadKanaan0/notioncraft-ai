'use client';

import { Editor } from '@tiptap/react';
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Trash2,
    Columns,
    Rows,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Combine,
    Split,
    LayoutTemplate
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';

interface TableBubbleMenuProps {
    editor: Editor;
}

export function TableBubbleMenu({ editor }: TableBubbleMenuProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const updatePosition = useCallback(() => {
        if (!editor) return;

        if (!editor.isActive('table')) {
            setIsVisible(false);
            return;
        }

        const { from } = editor.state.selection;
        const view = editor.view;

        try {
            const start = view.coordsAtPos(from);
            // Position BELOW the cursor/selection to avoid collision with BubbleToolbar (which is ABOVE)
            setPosition({
                top: start.bottom + 45,
                left: start.left
            });
            setIsVisible(true);
        } catch {
            setIsVisible(false);
        }
    }, [editor]);

    useEffect(() => {
        if (!editor) return;

        editor.on('selectionUpdate', updatePosition);
        editor.on('transaction', updatePosition);
        editor.on('blur', () => setIsVisible(false));

        return () => {
            editor.off('selectionUpdate', updatePosition);
            editor.off('transaction', updatePosition);
            editor.off('blur', () => setIsVisible(false));
        };
    }, [editor, updatePosition]);

    if (!editor || !isVisible) {
        return null;
    }

    const ToolbarButton = ({
        onClick,
        isActive,
        children,
        title,
        disabled,
    }: {
        onClick: () => void;
        isActive?: boolean;
        children: React.ReactNode;
        title: string;
        disabled?: boolean;
    }) => (
        <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            className={cn(
                'h-8 w-8 p-0 hover:bg-accent',
                isActive && 'bg-accent text-accent-foreground'
            )}
            title={title}
        >
            {children}
        </Button>
    );

    const Divider = () => <div className="w-px h-5 bg-border mx-0.5" />;

    return (
        <div
            className="fixed z-50 flex items-center gap-0.5 p-1 rounded-lg bg-popover border border-border shadow-lg animate-fade-in"
            style={{
                top: position.top,
                left: position.left,
                transform: 'translateX(-50%)', // Center it
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent taking focus from editor
        >
            {/* Column Actions */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Columns"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Columns className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnBefore().run()} className="justify-start">
                            <ArrowLeft className="h-4 w-4 mr-2" /> Add Column Before
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()} className="justify-start">
                            <ArrowRight className="h-4 w-4 mr-2" /> Add Column After
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()} className="justify-start text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Column
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Row Actions */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Rows"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <Rows className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowBefore().run()} className="justify-start">
                            <ArrowUp className="h-4 w-4 mr-2" /> Add Row Before
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()} className="justify-start">
                            <ArrowDown className="h-4 w-4 mr-2" /> Add Row After
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().deleteRow().run()} className="justify-start text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete Row
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Divider />

            {/* Cell Merge/Split */}
            <ToolbarButton
                onClick={() => editor.chain().focus().mergeCells().run()}
                disabled={!editor.can().mergeCells()}
                title="Merge Cells"
            >
                <Combine className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
                onClick={() => editor.chain().focus().splitCell().run()}
                disabled={!editor.can().splitCell()}
                title="Split Cell"
            >
                <Split className="h-4 w-4" />
            </ToolbarButton>

            <Divider />

            {/* Toggle Headers */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Table Layout"
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        <LayoutTemplate className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-1" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
                            className={cn("justify-start", editor.isActive('tableHeaderColumn') && "bg-accent")}
                        >
                            Toggle Header Column
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                            className={cn("justify-start", editor.isActive('tableHeaderRow') && "bg-accent")}
                        >
                            Toggle Header Row
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editor.chain().focus().toggleHeaderCell().run()}
                            className={cn("justify-start", editor.isActive('tableHeaderCell') && "bg-accent")}
                        >
                            Toggle Header Cell
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>

            <Divider />

            {/* Delete Table */}
            <ToolbarButton
                onClick={() => {
                    if (window.confirm('Are you sure you want to delete the table?')) {
                        editor.chain().focus().deleteTable().run();
                    }
                }}
                title="Delete Table"
                isActive={false}
            >
                <Trash2 className="h-4 w-4 text-destructive" />
            </ToolbarButton>

        </div>
    );
}

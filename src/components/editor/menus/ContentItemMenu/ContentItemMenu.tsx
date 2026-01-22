import { Editor } from '@tiptap/react'
import DragHandle from '@tiptap/extension-drag-handle-react'
import { Plus, GripVertical, Ban, Clipboard, Copy, Trash2, MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

import { useData } from './hooks/useData'
import { useContentItemActions } from './hooks/useContentItemActions'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ContentItemMenuProps = {
    editor: Editor
}

export const ContentItemMenu = ({ editor }: ContentItemMenuProps) => {
    const [menuOpen, setMenuOpen] = useState(false)
    const isMobile = useMediaQuery('(max-width: 640px)')
    const data = useData()
    const actions = useContentItemActions(editor, data.currentNode, data.currentNodePos)

    useEffect(() => {
        if (menuOpen) {
            editor.commands.setMeta('lockDragHandle', true)
        } else {
            editor.commands.setMeta('lockDragHandle', false)
        }
    }, [editor, menuOpen])

    return (
        <DragHandle
            editor={editor}
            className="flex items-center z-[99999]"
            onNodeChange={data.handleNodeChange}
        >
            <div className={cn(
                "flex items-center gap-0 bg-background border border-border/50 shadow-md rounded-lg overflow-hidden p-0.5",
                "z-[99999] transition-all",
                isMobile ? "translate-x-1" : "-translate-x-1"
            )}>
                {!isMobile && (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            onClick={actions.handleAdd}
                            title="Add block below"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                        <div className="w-px h-4 bg-border/20 mx-0.5" />
                    </>
                )}

                {/* DEDICATED DRAG HANDLE AREA */}
                <div
                    className="drag-handle h-7 w-6 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-grab active:cursor-grabbing transition-colors"
                    title="Drag to reorder"
                    draggable="true"
                    data-drag-handle
                >
                    <GripVertical className="h-4 w-4" />
                </div>


                {/* DEDICATED MENU TRIGGER */}
                <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Block menu"
                        >
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="bottom" sideOffset={8} className="w-48 z-[999999] max-w-[calc(100vw-2rem)]">
                        <DropdownMenuItem onClick={actions.resetTextFormatting}>
                            <Ban className="h-4 w-4 mr-2" />
                            Clear formatting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={actions.copyNodeToClipboard}>
                            <Clipboard className="h-4 w-4 mr-2" />
                            Copy to clipboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={actions.duplicateNode}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            onClick={actions.deleteNode}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </DragHandle>
    )
}

'use client';

import { useState } from 'react';
import { Editor } from '@tiptap/react';
import {
  GripVertical,
  Trash2,
  Copy,
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BlockHandleProps {
  editor: Editor;
  position: { top: number; left: number };
  onClose: () => void;
}

const TURN_INTO_OPTIONS = [
  {
    title: 'Text',
    icon: Type,
    action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    title: 'Heading 1',
    icon: Heading1,
    action: (editor: Editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    title: 'Heading 2',
    icon: Heading2,
    action: (editor: Editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    title: 'Heading 3',
    icon: Heading3,
    action: (editor: Editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    title: 'Bullet List',
    icon: List,
    action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    title: 'Numbered List',
    icon: ListOrdered,
    action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    title: 'To-do List',
    icon: CheckSquare,
    action: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  },
  {
    title: 'Quote',
    icon: Quote,
    action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    title: 'Code Block',
    icon: Code,
    action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
];

export function BlockHandle({ editor, position, onClose }: BlockHandleProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      onClose();
    }
  };

  const handleDelete = () => {
    editor.chain().focus().deleteNode(editor.state.selection.$anchor.parent.type.name).run();
    onClose();
  };

  const handleDuplicate = () => {
    const { state } = editor;
    const { selection } = state;
    const { $anchor } = selection;
    
    // Get the current node
    const node = $anchor.parent;
    const pos = $anchor.before($anchor.depth);
    const endPos = $anchor.after($anchor.depth);
    
    // Insert a copy after the current node
    editor.chain()
      .focus()
      .insertContentAt(endPos, node.toJSON())
      .run();
    
    onClose();
  };

  const handleTurnInto = (action: (editor: Editor) => void) => {
    action(editor);
    onClose();
  };

  return (
    <div
      className="fixed z-50"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {/* Turn Into Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center">
              <Type className="h-4 w-4 mr-2" />
              Turn into
              <ChevronRight className="h-4 w-4 ml-auto" />
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="w-48">
                {TURN_INTO_OPTIONS.map((option) => (
                  <DropdownMenuItem
                    key={option.title}
                    onClick={() => handleTurnInto(option.action)}
                  >
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {/* Duplicate */}
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete */}
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

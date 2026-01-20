'use client';

import { useState } from 'react';
import { GripVertical, Plus, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface BlockHandleProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onAddBlockAbove: () => void;
  onAddBlockBelow: () => void;
}

export function BlockHandle({
  onDelete,
  onDuplicate,
  onAddBlockAbove,
  onAddBlockBelow,
}: BlockHandleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        'absolute -left-10 top-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
        isOpen && 'opacity-100'
      )}
    >
      {/* Add block button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
        onClick={onAddBlockBelow}
        title="Add block below"
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>

      {/* Drag handle with menu */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-accent cursor-grab active:cursor-grabbing"
            title="Drag to move · Click for options"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={onAddBlockAbove}>
            <Plus className="h-4 w-4 mr-2" />
            Add block above
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onAddBlockBelow}>
            <Plus className="h-4 w-4 mr-2" />
            Add block below
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

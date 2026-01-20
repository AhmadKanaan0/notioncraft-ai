import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tag, useTags } from '@/hooks/useTags';
import { TagBadge } from './TagBadge';

interface TagSelectorProps {
  pageId: string;
  selectedTags: Tag[];
  onAddTag: (pageId: string, tagId: string) => void;
  onRemoveTag: (pageId: string, tagId: string) => void;
  onCreateTag: (name: string) => Promise<Tag | null>;
  allTags: Tag[];
}

export function TagSelector({
  pageId,
  selectedTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  allTags,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const selectedTagIds = selectedTags.map(t => t.id);
  const availableTags = allTags.filter(t => !selectedTagIds.includes(t.id));

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    setIsCreating(true);
    const tag = await onCreateTag(newTagName.trim());
    if (tag) {
      onAddTag(pageId, tag.id);
      setNewTagName('');
    }
    setIsCreating(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selectedTags.map(tag => (
        <TagBadge
          key={tag.id}
          name={tag.name}
          color={tag.color}
          onRemove={() => onRemoveTag(pageId, tag.id)}
        />
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-muted-foreground">
            <Plus className="h-3 w-3 mr-1" />
            Add tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            <div className="flex gap-1">
              <Input
                placeholder="New tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateTag();
                }}
                className="h-8 text-sm"
              />
              <Button
                size="sm"
                className="h-8"
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || isCreating}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {availableTags.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground px-1">Existing tags</p>
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md hover:bg-muted transition-colors text-left"
                    onClick={() => {
                      onAddTag(pageId, tag.id);
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="text-sm">{tag.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

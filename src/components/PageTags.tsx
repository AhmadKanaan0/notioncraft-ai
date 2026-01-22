"use client";

import { useState } from 'react';
import { Plus, X, Tag as TagIcon, Check, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { useTags, Tag } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PageTagsProps {
    pageId: string;
}

export function PageTags({ pageId }: PageTagsProps) {
    const {
        tags,
        getTagsForPage,
        addTagToPage,
        removeTagFromPage,
        createTag,
        updateTag,
        deleteTag,
        loading,
        TAG_COLORS
    } = useTags();

    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('');

    const currentPageTags = getTagsForPage(pageId);
    const availableTags = tags.filter(
        tag => !currentPageTags.some(pt => pt.id === tag.id)
    );

    const filteredTags = availableTags.filter(tag =>
        tag.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleCreateTag = async () => {
        if (!search.trim()) return;
        const newTag = await createTag(search.trim(), selectedColor);
        if (newTag) {
            await addTagToPage(pageId, newTag.id);
            setSearch('');
            setSelectedColor(TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]);
        }
    };

    const handleToggleTag = async (tag: Tag) => {
        const isAssigned = currentPageTags.some(t => t.id === tag.id);
        if (isAssigned) {
            await removeTagFromPage(pageId, tag.id);
        } else {
            await addTagToPage(pageId, tag.id);
        }
    };

    const startEditing = (tag: Tag) => {
        setEditingTag(tag);
        setEditName(tag.name);
        setEditColor(tag.color);
    };

    const handleUpdateTag = async () => {
        if (!editingTag || !editName.trim()) return;
        await updateTag(editingTag.id, { name: editName.trim(), color: editColor });
        setEditingTag(null);
    };

    const handleDeleteTag = async (tagId: string) => {
        if (confirm('Are you sure you want to delete this tag globally?')) {
            await deleteTag(tagId);
            setEditingTag(null);
        }
    };

    if (loading) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mt-4">
            {currentPageTags.map((tag) => (
                <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1 pl-2 pr-1 py-0.5 group"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: `${tag.color}40` }}
                >
                    <span className="text-xs font-medium">{tag.name}</span>
                    <button
                        onClick={() => removeTagFromPage(pageId, tag.id)}
                        className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </Badge>
            ))}

            <Popover open={isOpen} onOpenChange={(open) => {
                setIsOpen(open);
                if (!open) {
                    setEditingTag(null);
                    setSearch('');
                }
            }}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 border-dashed"
                    >
                        <Plus className="h-3 w-3" />
                        Add tag
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 overflow-hidden" align="start">
                    {editingTag ? (
                        <div className="p-3 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingTag(null)}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Edit Tag</span>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <Input
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-9 text-sm"
                                        placeholder="Tag name"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tight">Select Color</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {TAG_COLORS.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setEditColor(color)}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2 transition-all hover:scale-110",
                                                    editColor === color ? "border-foreground scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <Button size="sm" className="flex-1 h-8" onClick={handleUpdateTag}>
                                        Save Changes
                                    </Button>
                                    <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleDeleteTag(editingTag.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="p-2 border-b">
                                <Input
                                    placeholder="Search or create tag..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-8 text-xs border-none focus-visible:ring-0 shadow-none bg-muted/50"
                                    autoFocus
                                />
                            </div>

                            <div className="max-h-64 overflow-y-auto p-1">
                                {search && !filteredTags.some(t => t.name.toLowerCase() === search.toLowerCase()) && (
                                    <div className="p-2 space-y-3 mb-2 bg-muted/30 rounded-md border border-dashed">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium truncate">Create <span className="font-bold text-primary">"{search}"</span></span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {TAG_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setSelectedColor(color)}
                                                    className={cn(
                                                        "w-5 h-5 rounded-full border-2 transition-all",
                                                        selectedColor === color ? "border-foreground scale-110" : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                        <Button size="sm" className="w-full h-8 gap-2" onClick={handleCreateTag}>
                                            <Plus className="h-3 w-3" /> Create Tag
                                        </Button>
                                    </div>
                                )}

                                <div className="space-y-0.5">
                                    {(search ? filteredTags : tags).length > 0 ? (
                                        (search ? filteredTags : tags).map((tag) => {
                                            const isAssigned = currentPageTags.some(t => t.id === tag.id);
                                            return (
                                                <div key={tag.id} className="group flex items-center px-1">
                                                    <button
                                                        onClick={() => handleToggleTag(tag)}
                                                        className="flex-1 flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-muted text-left text-xs transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: tag.color }} />
                                                            <span className={cn(isAssigned && "font-semibold")}>{tag.name}</span>
                                                        </div>
                                                        {isAssigned && <Check className="h-3 w-3 text-primary shrink-0" />}
                                                    </button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => startEditing(tag)}
                                                    >
                                                        <Edit2 className="h-3 w-3 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            );
                                        })
                                    ) : !search && (
                                        <div className="px-2 py-8 text-center text-xs text-muted-foreground">
                                            No tags found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}

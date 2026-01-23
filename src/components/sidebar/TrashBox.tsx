import { useState } from 'react';
import { Page } from '@/hooks/usePages';
import { Trash2, RotateCcw, X, Search, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ResponsivePopover,
    ResponsivePopoverContent,
    ResponsivePopoverTrigger,
} from '@/components/ui/responsive-popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface TrashBoxProps {
    trash: Page[];
    onRestore: (id: string) => Promise<void>;
    onDeleteForever: (id: string) => Promise<void>;
}

export function TrashBox({ trash, onRestore, onDeleteForever }: TrashBoxProps) {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const filteredTrash = trash.filter(page =>
        page.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ResponsivePopover open={isOpen} onOpenChange={setIsOpen}>
            <ResponsivePopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground group"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span className="flex-1 text-left">Trash</span>
                </Button>
            </ResponsivePopoverTrigger>
            <ResponsivePopoverContent className="w-full sm:w-80 p-0" align="start" side="right">
                <div className="p-3 border-b">
                    <div className='flex items-center gap-2 mb-2'>
                        <h3 className="font-medium text-sm">Trash</h3>
                        <span className="text-xs text-muted-foreground ml-auto">{trash.length} pages</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search trash..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 pl-8 text-xs bg-background"
                        />
                    </div>
                </div>
                <ScrollArea className="h-[300px]">
                    {filteredTrash.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                            <p className="text-xs">No pages in trash</p>
                        </div>
                    ) : (
                        <div className="p-1">
                            {filteredTrash.map((page) => (
                                <div
                                    key={page.id}
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 group"
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="flex h-5 w-5 items-center justify-center rounded border bg-background">
                                            {page.icon ? <span className='text-xs'>{page.icon}</span> : <FileText className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm truncate text-foreground">{page.title || 'Untitled'}</span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                Deleted {formatDistanceToNow(new Date(page.updated_at), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-muted hover:text-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRestore(page.id);
                                            }}
                                            title="Restore"
                                        >
                                            <RotateCcw className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteForever(page.id);
                                            }}
                                            title="Delete permanently"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </ResponsivePopoverContent>
        </ResponsivePopover>
    );
}

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { Page } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import { PageTags } from './PageTags';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface PageHeaderProps {
  page: Page;
  onUpdatePage: (id: string, updates: Partial<Page>) => void;
}

const commonEmojis = ['📄', '📝', '📋', '📌', '⭐', '🎯', '💡', '🔥', '✨', '🚀', '📊', '📈', '🏠', '💻', '🎨', '📚', '🎵', '🎮', '💼', '🔧'];

export function PageHeader({ page, onUpdatePage }: PageHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(page.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(page.title);
  }, [page.title]);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== page.title) {
      onUpdatePage(page.id, { title: title || 'Untitled' });
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    }
    if (e.key === 'Escape') {
      setTitle(page.title);
      setIsEditingTitle(false);
    }
  };

  const handleIconSelect = (emoji: string) => {
    onUpdatePage(page.id, { icon: emoji });
  };

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="flex items-start gap-2 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto p-2 text-4xl hover:bg-muted"
            >
              {page.icon || '📄'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="grid grid-cols-5 gap-1">
              {commonEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant="ghost"
                  className="h-10 w-10 p-0 text-xl hover:bg-muted"
                  onClick={() => handleIconSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {isEditingTitle ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          className="text-4xl font-bold w-full bg-transparent border-none outline-none placeholder:text-muted-foreground/50"
          placeholder="Untitled"
        />
      ) : (
        <h1
          className="text-4xl font-bold cursor-text hover:bg-muted/50 rounded px-1 -mx-1 transition-colors"
          onClick={() => setIsEditingTitle(true)}
        >
          {page.title || 'Untitled'}
        </h1>
      )}
      <PageTags pageId={page.id} />
    </div>
  );
}

import { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, MoreHorizontal, Trash2, Copy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Page } from '@/hooks/usePages';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageTreeProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentId?: string | null) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onToggleFavorite: (pageId: string) => void;
  getChildPages: (parentId: string | null) => Page[];
  showFavoriteOnly?: boolean;
}

interface PageItemProps {
  page: Page;
  level: number;
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentId?: string | null) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onToggleFavorite: (pageId: string) => void;
  getChildPages: (parentId: string | null) => Page[];
  showFavoriteOnly?: boolean;
}

function PageItem({
  page,
  level,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onDuplicatePage,
  onToggleFavorite,
  getChildPages,
  showFavoriteOnly,
}: PageItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const children = showFavoriteOnly ? [] : getChildPages(page.id);
  const hasChildren = children.length > 0;
  const isActive = currentPageId === page.id;

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-colors',
          isActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent/50',
          level > 0 && 'ml-4'
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!showFavoriteOnly && (
          <button
            className="p-0.5 rounded hover:bg-sidebar-accent"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground/60" />
              )
            ) : (
              <span className="w-3.5" />
            )}
          </button>
        )}

        <div
          className="flex-1 flex items-center gap-2 min-w-0"
          onClick={() => onSelectPage(page.id)}
        >
          <span className="text-base">{page.icon || '📄'}</span>
          <span className="text-sm truncate text-sidebar-foreground">
            {page.title || 'Untitled'}
          </span>
        </div>

        {(isHovered || isDropdownOpen) && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 hover:bg-sidebar-accent",
                page.is_favorite ? "text-yellow-500" : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(page.id);
              }}
            >
              <Star className={cn("h-3.5 w-3.5", page.is_favorite && "fill-current")} />
            </Button>
            
            {!showFavoriteOnly && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreatePage(page.id);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            
            <DropdownMenu onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(page.id);
                  }}
                >
                  <Star className={cn("h-4 w-4 mr-2", page.is_favorite && "fill-current text-yellow-500")} />
                  {page.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(page.id);
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(page.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {children.map((child) => (
            <PageItem
              key={child.id}
              page={child}
              level={level + 1}
              currentPageId={currentPageId}
              onSelectPage={onSelectPage}
              onCreatePage={onCreatePage}
              onDeletePage={onDeletePage}
              onDuplicatePage={onDuplicatePage}
              onToggleFavorite={onToggleFavorite}
              getChildPages={getChildPages}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function PageTree({
  pages,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onDuplicatePage,
  onToggleFavorite,
  getChildPages,
  showFavoriteOnly,
}: PageTreeProps) {
  const rootPages = showFavoriteOnly ? pages : getChildPages(null);

  return (
    <div className="space-y-0.5">
      {rootPages.map((page) => (
        <PageItem
          key={page.id}
          page={page}
          level={0}
          currentPageId={currentPageId}
          onSelectPage={onSelectPage}
          onCreatePage={onCreatePage}
          onDeletePage={onDeletePage}
          onDuplicatePage={onDuplicatePage}
          onToggleFavorite={onToggleFavorite}
          getChildPages={getChildPages}
          showFavoriteOnly={showFavoriteOnly}
        />
      ))}
    </div>
  );
}

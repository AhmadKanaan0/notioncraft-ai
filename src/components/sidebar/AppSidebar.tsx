import { Plus, Search, LogOut, FileText, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { PageTree } from './PageTree';
import { Page } from '@/hooks/usePages';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AppSidebarProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onCreatePage: (parentId?: string | null) => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onToggleFavorite: (pageId: string) => void;
  getChildPages: (parentId: string | null) => Page[];
  getFavoritePages: () => Page[];
}

export function AppSidebar({
  pages,
  currentPageId,
  onSelectPage,
  onCreatePage,
  onDeletePage,
  onDuplicatePage,
  onToggleFavorite,
  getChildPages,
  getFavoritePages,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const favoritePages = getFavoritePages();

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
            N
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.email?.split('@')[0]}'s Workspace
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <Separator className="mx-3" />

        {favoritePages.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2 px-2">
              <Star className="h-3 w-3" />
              <span className="text-xs font-medium text-muted-foreground">Favorites</span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <PageTree
                pages={favoritePages}
                currentPageId={currentPageId}
                onSelectPage={onSelectPage}
                onCreatePage={onCreatePage}
                onDeletePage={onDeletePage}
                onDuplicatePage={onDuplicatePage}
                onToggleFavorite={onToggleFavorite}
                getChildPages={() => []}
                showFavoriteOnly
              />
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-muted-foreground">Pages</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => onCreatePage(null)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {pages.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground mb-3">No pages yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCreatePage(null)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New page
                </Button>
              </div>
            ) : (
              <PageTree
                pages={pages}
                currentPageId={currentPageId}
                onSelectPage={onSelectPage}
                onCreatePage={onCreatePage}
                onDeletePage={onDeletePage}
                onDuplicatePage={onDuplicatePage}
                onToggleFavorite={onToggleFavorite}
                getChildPages={getChildPages}
              />
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

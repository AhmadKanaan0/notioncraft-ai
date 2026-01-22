import { Plus, SearchIcon, LogOut, FileText, Star, X, Settings } from 'lucide-react';
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
import { TrashBox } from './TrashBox';
import { Page } from '@/hooks/usePages';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '../ui/input-group';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';

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
  trash: Page[];
  onRestorePage: (id: string) => Promise<void>;
  onDeletePagePermanently: (id: string) => Promise<void>;
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
  trash,
  onRestorePage,
  onDeletePagePermanently,
}: AppSidebarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const favoritePages = getFavoritePages();
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = profile?.displayName || user?.email?.split('@')[0];

  const filteredPages = searchQuery
    ? pages.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : [];

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-3">
        <Link href="/workspace/profile" className="flex items-center gap-2 px-2 hover:bg-accent rounded-md p-1 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatarUrl || undefined} className="object-cover" />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {displayName?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>

        <div className="px-3 py-3">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search pages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton size="icon-xs" onClick={() => setSearchQuery('')}>
                  <X className="h-4 w-4" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>

        <Separator className="mx-3" />

        {favoritePages.length > 0 && !searchQuery && (
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
            <span className="text-xs font-medium text-muted-foreground">{searchQuery ? 'Search Results' : 'Pages'}</span>
            {!searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => onCreatePage(null)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {searchQuery ? (
              filteredPages.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">No matching pages</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear search
                  </Button>
                </div>
              ) : (
                <PageTree
                  pages={filteredPages}
                  currentPageId={currentPageId}
                  onSelectPage={(pageId) => {
                    onSelectPage(pageId);
                    setSearchQuery('');
                  }}
                  onCreatePage={onCreatePage}
                  onDeletePage={onDeletePage}
                  onDuplicatePage={onDuplicatePage}
                  onToggleFavorite={onToggleFavorite}
                  getChildPages={getChildPages}
                  isSearch
                />
              )
            ) : (
              getChildPages(null).length === 0 ? (
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
              )
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <TrashBox
              trash={trash}
              onRestore={onRestorePage}
              onDeleteForever={onDeletePagePermanently}
            />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/workspace/profile" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings & Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
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

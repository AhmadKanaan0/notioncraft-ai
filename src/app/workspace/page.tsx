"use client";
import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { usePages } from '@/hooks/usePages';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { NotionEditor } from '@/components/editor/NotionEditor';
import { PageHeader } from '@/components/PageHeader';
import { AIChatSidebar } from '@/components/ai/AIChatSidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Loader2, ListTree } from 'lucide-react';
import { TableOfContents, ToCItem } from '@/components/editor/components/TableOfContents';
import type { Editor } from '@tiptap/react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function Workspace() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const {
    pages,
    loading: pagesLoading,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    toggleFavorite,
    getPageById,
    getChildPages,
    getFavoritePages,
    trash,
    restorePage,
    deletePagePermanently
  } = usePages();

  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const [isToCOpen, setIsToCOpen] = useState(true);
  const [tocItems, setTocItems] = useState<ToCItem[]>([]);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const outlineAsideRef = useRef<HTMLElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Fall back to the first root page when none has been explicitly selected yet.
  const rootPages = getChildPages(null);
  const activePageId = currentPageId ?? rootPages[0]?.id ?? null;
  const currentPage = activePageId ? getPageById(activePageId) : null;

  // Listen for AI sidebar open events
  useEffect(() => {
    const handleOpenAI = () => setIsAISidebarOpen(true);
    window.addEventListener('open-ai-sidebar', handleOpenAI);
    return () => window.removeEventListener('open-ai-sidebar', handleOpenAI);
  }, []);

  useGSAP(() => {
    if (authLoading || pagesLoading) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const header = mainRef.current?.querySelector('header');
      if (!header) return;

      gsap.timeline()
        .from(header, { opacity: 0, y: -12, duration: 0.4, ease: 'power2.out' })
        .from(contentRef.current, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' }, '-=0.25');
    });

    return () => mm.revert();
  }, { dependencies: [authLoading, pagesLoading], scope: mainRef });

  useGSAP(() => {
    if (!activePageId) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    });

    return () => mm.revert();
  }, { dependencies: [activePageId], scope: mainRef });

  useGSAP(() => {
    if (!isDesktop || !isToCOpen || !currentPage) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(outlineAsideRef.current, { x: 24, opacity: 0, duration: 0.3, ease: 'power2.out' });
    });

    return () => mm.revert();
  }, { dependencies: [isToCOpen, currentPage, isDesktop], scope: mainRef });

  const handleCreatePage = async (parentId?: string | null) => {
    const newPage = await createPage(parentId);
    if (newPage) {
      setCurrentPageId(newPage.id);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    if (activePageId === pageId) {
      const remainingRootPages = getChildPages(null);
      if (remainingRootPages.length > 0) {
        const remainingPage = remainingRootPages.find(p => p.id !== pageId);
        setCurrentPageId(remainingPage?.id || null);
      } else {
        setCurrentPageId(null);
      }
    }
    toast.success('Page deleted', {
      description: 'The page has been moved to trash.',
    });
  };

  const handleDuplicatePage = async (pageId: string) => {
    const newPage = await duplicatePage(pageId);
    if (newPage) {
      setCurrentPageId(newPage.id);
      toast.success('Page duplicated', {
        description: 'A copy of the page has been created.',
      });
    }
  };

  const handleInsertContent = (content: string) => {
    // This will be passed to the editor to insert AI-generated content
    if (editorRef.current) {
      editorRef.current.commands.focus();
      editorRef.current.commands.insertContent(content);
    }
  };

  const pulseButton = (el: HTMLElement | null) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  };

  if (authLoading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-screen overflow-hidden flex w-full">
        <AppSidebar
          pages={pages}
          currentPageId={activePageId}
          onSelectPage={setCurrentPageId}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onToggleFavorite={toggleFavorite}
          getChildPages={getChildPages}
          getFavoritePages={getFavoritePages}
          trash={trash}
          onRestorePage={restorePage}
          onDeletePagePermanently={deletePagePermanently}
        />

        <main ref={mainRef} className="flex-1 flex flex-col min-w-0 relative z-20">
          <header className="h-12 flex items-center justify-between px-4 border-b bg-background">
            <SidebarTrigger />
            <div className="flex items-center gap-2">
              <Button
                ref={aiButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAISidebarOpen(!isAISidebarOpen);
                  pulseButton(aiButtonRef.current);
                }}
                className={cn("gap-2", isAISidebarOpen && "bg-accent")}
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
              <Button
                ref={tocButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsToCOpen(!isToCOpen);
                  pulseButton(tocButtonRef.current);
                }}
                className={cn("gap-2", isToCOpen && "bg-accent")}
              >
                <ListTree className="h-4 w-4" />
                <span className="hidden sm:inline">Outline</span>
              </Button>
            </div>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div ref={contentRef} className="flex-1 overflow-y-auto">
              {currentPage ? (
                <div className="max-w-3xl mx-auto px-10 sm:px-4 md:px-0">
                  <PageHeader page={currentPage} onUpdatePage={updatePage} />
                  <NotionEditor
                    ref={(instance: Editor | null) => {
                      editorRef.current = instance;
                      setEditorInstance(instance);
                    }}
                    content={currentPage.content}
                    onUpdate={(content) => updatePage(currentPage.id, { content })}
                    onToCUpdate={setTocItems}
                    pageId={currentPage.id}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <FileText className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h2 className="text-xl font-semibold mb-2">No page selected</h2>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Create your first page to start writing. Use the sidebar to manage your pages.
                  </p>
                  <Button onClick={() => handleCreatePage(null)}>
                    Create your first page
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop Outline Sidebar */}
            {isDesktop && isToCOpen && currentPage && (
              <aside ref={outlineAsideRef} className="w-64 border-l bg-background shrink-0 overflow-y-auto">
                <TableOfContents items={tocItems} editor={editorInstance} />
              </aside>
            )}

            {/* Mobile Outline Drawer */}
            {!isDesktop && (
              <Drawer open={isToCOpen} onOpenChange={setIsToCOpen} direction="right">
                <DrawerContent className="w-3/4 max-w-sm">
                  <DrawerHeader className="flex flex-row items-center justify-between">
                    <DrawerTitle className="flex items-center gap-2">
                      <ListTree className="h-5 w-5 text-primary" />
                      Outline
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button variant="ghost" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto">
                    <TableOfContents items={tocItems} editor={editorInstance} />
                  </div>
                </DrawerContent>
              </Drawer>
            )}

            <AIChatSidebar
              isOpen={isAISidebarOpen}
              onClose={() => setIsAISidebarOpen(false)}
              onInsertContent={handleInsertContent}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}


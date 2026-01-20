"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePages } from '@/hooks/usePages';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { NotionEditor } from '@/components/editor/NotionEditor';
import { PageHeader } from '@/components/PageHeader';
import { AIChatSidebar } from '@/components/ai/AIChatSidebar';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function Workspace() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
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
    getFavoritePages
  } = usePages();

  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [isAISidebarOpen, setIsAISidebarOpen] = useState(false);
  const editorRef = useRef<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Listen for AI sidebar open events
  useEffect(() => {
    const handleOpenAI = () => setIsAISidebarOpen(true);
    window.addEventListener('open-ai-sidebar', handleOpenAI);
    return () => window.removeEventListener('open-ai-sidebar', handleOpenAI);
  }, []);

  // Set first page as current if none selected
  useEffect(() => {
    if (!pagesLoading && pages.length > 0 && !currentPageId) {
      const rootPages = getChildPages(null);
      if (rootPages.length > 0) {
        setCurrentPageId(rootPages[0].id);
      }
    }
  }, [pages, pagesLoading, currentPageId, getChildPages]);

  const handleCreatePage = async (parentId?: string | null) => {
    const newPage = await createPage(parentId);
    if (newPage) {
      setCurrentPageId(newPage.id);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    await deletePage(pageId);
    if (currentPageId === pageId) {
      const rootPages = getChildPages(null);
      if (rootPages.length > 0) {
        const remainingPage = rootPages.find(p => p.id !== pageId);
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
      editorRef.current.commands.insertContent(content);
    }
  };

  const currentPage = currentPageId ? getPageById(currentPageId) : null;

  if (authLoading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar
          pages={pages}
          currentPageId={currentPageId}
          onSelectPage={setCurrentPageId}
          onCreatePage={handleCreatePage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onToggleFavorite={toggleFavorite}
          getChildPages={getChildPages}
          getFavoritePages={getFavoritePages}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center justify-between px-4 border-b bg-background">
            <SidebarTrigger />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAISidebarOpen(!isAISidebarOpen)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Assistant
            </Button>
          </header>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {currentPage ? (
                <div className="max-w-3xl mx-auto">
                  <PageHeader page={currentPage} onUpdatePage={updatePage} />
                  <NotionEditor
                    content={currentPage.content}
                    onUpdate={(content) => updatePage(currentPage.id, { content })}
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

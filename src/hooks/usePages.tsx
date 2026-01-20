import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Page {
  id: string;
  user_id: string;
  title: string;
  content: any;
  icon: string | null;
  cover_image: string | null;
  parent_id: string | null;
  position: number;
  is_archived: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export function usePages() {
  const { user } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    if (!user) {
      setPages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('is_archived', false)
        .order('position', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const createPage = async (parentId?: string | null) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          user_id: user.id,
          title: 'Untitled',
          content: {},
          parent_id: parentId || null,
          position: pages.length,
        })
        .select()
        .single();

      if (error) throw error;
      
      setPages(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
      return null;
    }
  };

  const updatePage = async (id: string, updates: Partial<Page>) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setPages(prev =>
        prev.map(page => (page.id === id ? { ...page, ...updates } : page))
      );
    } catch (error: any) {
      console.error('Error updating page:', error);
      toast.error('Failed to update page');
    }
  };

  const deletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;

      setPages(prev => prev.filter(page => page.id !== id));
    } catch (error: any) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const duplicatePage = async (pageId: string) => {
    if (!user) return null;

    const pageToDuplicate = pages.find(p => p.id === pageId);
    if (!pageToDuplicate) return null;

    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          user_id: user.id,
          title: `${pageToDuplicate.title} (Copy)`,
          icon: pageToDuplicate.icon,
          cover_image: pageToDuplicate.cover_image,
          content: pageToDuplicate.content,
          parent_id: pageToDuplicate.parent_id,
          position: pages.length,
        })
        .select()
        .single();

      if (error) throw error;
      setPages(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error('Error duplicating page:', error);
      toast.error('Failed to duplicate page');
      return null;
    }
  };

  const toggleFavorite = async (pageId: string) => {
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const newValue = !page.is_favorite;
    
    try {
      const { error } = await supabase
        .from('pages')
        .update({ is_favorite: newValue })
        .eq('id', pageId);

      if (error) throw error;

      setPages(prev =>
        prev.map(p => (p.id === pageId ? { ...p, is_favorite: newValue } : p))
      );

      toast.success(newValue ? 'Added to favorites' : 'Removed from favorites');
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const getPageById = (id: string) => {
    return pages.find(page => page.id === id);
  };

  const getChildPages = (parentId: string | null) => {
    return pages.filter(page => page.parent_id === parentId);
  };

  const getFavoritePages = () => {
    return pages.filter(page => page.is_favorite);
  };

  return {
    pages,
    loading,
    createPage,
    updatePage,
    deletePage,
    duplicatePage,
    toggleFavorite,
    getPageById,
    getChildPages,
    getFavoritePages,
    refetch: fetchPages,
  };
}

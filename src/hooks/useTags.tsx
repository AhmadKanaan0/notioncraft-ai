import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface PageTag {
  page_id: string;
  tag_id: string;
}

const TAG_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#6B7280', // gray
];

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [pageTags, setPageTags] = useState<PageTag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!user) {
      setTags([]);
      setPageTags([]);
      setLoading(false);
      return;
    }

    try {
      const [tagsResult, pageTagsResult] = await Promise.all([
        supabase.from('tags').select('*').order('name'),
        supabase.from('page_tags').select('*'),
      ]);

      if (tagsResult.error) throw tagsResult.error;
      if (pageTagsResult.error) throw pageTagsResult.error;

      setTags(tagsResult.data || []);
      setPageTags(pageTagsResult.data || []);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = async (name: string, color?: string) => {
    if (!user) return null;

    const tagColor = color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: user.id,
          name,
          color: tagColor,
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      return null;
    }
  };

  const updateTag = async (tagId: string, updates: { name?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', tagId)
        .select()
        .single();

      if (error) throw error;

      setTags(prev => prev.map(t => (t.id === tagId ? data : t)));
      return data;
    } catch (error: any) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
      return null;
    }
  };

  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase.from('tags').delete().eq('id', tagId);

      if (error) throw error;

      setTags(prev => prev.filter(t => t.id !== tagId));
      setPageTags(prev => prev.filter(pt => pt.tag_id !== tagId));
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  };

  const addTagToPage = async (pageId: string, tagId: string) => {
    try {
      const { error } = await supabase.from('page_tags').insert({ page_id: pageId, tag_id: tagId });

      if (error) throw error;

      setPageTags(prev => [...prev, { page_id: pageId, tag_id: tagId }]);
    } catch (error: any) {
      console.error('Error adding tag to page:', error);
      toast.error('Failed to add tag');
    }
  };

  const removeTagFromPage = async (pageId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('page_tags')
        .delete()
        .eq('page_id', pageId)
        .eq('tag_id', tagId);

      if (error) throw error;

      setPageTags(prev => prev.filter(pt => !(pt.page_id === pageId && pt.tag_id === tagId)));
    } catch (error: any) {
      console.error('Error removing tag from page:', error);
      toast.error('Failed to remove tag');
    }
  };

  const getTagsForPage = (pageId: string) => {
    const pageTagIds = pageTags.filter(pt => pt.page_id === pageId).map(pt => pt.tag_id);
    return tags.filter(t => pageTagIds.includes(t.id));
  };

  return {
    tags,
    pageTags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    addTagToPage,
    removeTagFromPage,
    getTagsForPage,
    refetch: fetchTags,
    TAG_COLORS,
  };
}

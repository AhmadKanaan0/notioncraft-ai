"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Profile {
    id: string;
    userId: string;
    displayName: string | null;
    avatarUrl: string | null;
    updatedAt: string;
}

export function useProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
        } else {
            setProfile(null);
            setLoading(false);
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile doesn't exist, create one
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                user_id: user?.id,
                                display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0],
                            },
                        ])
                        .select()
                        .single();

                    if (createError) throw createError;
                    setProfile(mapProfile(newProfile));
                } else {
                    throw error;
                }
            } else {
                setProfile(mapProfile(data));
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user) return;

        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update({
                    display_name: updates.displayName,
                    avatar_url: updates.avatarUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', user.id);

            if (error) throw error;

            // Update Supabase Auth metadata for consistency
            if (updates.displayName) {
                await supabase.auth.updateUser({
                    data: { display_name: updates.displayName }
                });
            }

            setProfile((prev) => prev ? { ...prev, ...updates } : null);
            toast.success('Profile updated successfully');
            return true;
        } catch (error: any) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const mapProfile = (data: any): Profile => ({
        id: data.id,
        userId: data.user_id,
        displayName: data.display_name,
        avatarUrl: data.avatar_url,
        updatedAt: data.updated_at,
    });

    return { profile, loading, updateProfile, refreshProfile: fetchProfile };
}

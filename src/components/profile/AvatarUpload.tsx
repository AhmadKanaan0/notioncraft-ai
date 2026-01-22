"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
    url: string | null;
    onUpload: (url: string) => void;
    userId: string;
}

export function AvatarUpload({ url, onUpload, userId }: AvatarUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${userId}/${Math.random()}.${fileExt}`;

            // Upload the file to "avatars" bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onUpload(publicUrl);
            toast.success('Avatar updated');
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            toast.error(error.message || 'Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="group relative cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <div className="absolute inset-0 z-10 flex hidden items-center justify-center rounded-full bg-black/60 text-white transition-all group-hover:flex">
                    {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <Camera className="h-6 w-6 transform transition-transform group-hover:scale-110" />
                    )}
                </div>

                <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-muted/50 transition-all group-hover:ring-primary/50">
                    <AvatarImage src={url || undefined} className="object-cover" />
                    <AvatarFallback className="bg-muted">
                        <User className="h-10 w-10 text-muted-foreground" />
                    </AvatarFallback>
                </Avatar>

                {uploading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-background/40 backdrop-blur-[1px]">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                disabled={uploading}
                className="hidden"
            />

            <div className="text-center space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-xs text-muted-foreground">
                    Click image to upload. JPG, PNG or GIF.
                </p>
            </div>
        </div>
    );
}

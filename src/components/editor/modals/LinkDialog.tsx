"use client";

import { useState, useEffect } from "react";
import {
    ResponsiveModal,
    ResponsiveModalContent,
    ResponsiveModalHeader,
    ResponsiveModalTitle,
    ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link as LinkIcon, Image as ImageIcon } from "lucide-react";

interface LinkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (url: string) => void;
    title?: string;
    initialValue?: string;
    type?: 'link' | 'image';
}

export function LinkDialog({
    open,
    onOpenChange,
    onConfirm,
    title = "Insert Link",
    initialValue = "",
    type = 'link'
}: LinkDialogProps) {
    const [url, setUrl] = useState(initialValue);

    useEffect(() => {
        if (open) {
            setUrl(initialValue);
        }
    }, [open, initialValue]);

    const handleConfirm = () => {
        if (url.trim()) {
            onConfirm(url.trim());
            onOpenChange(false);
            setUrl("");
        }
    };

    return (
        <ResponsiveModal open={open} onOpenChange={onOpenChange}>
            <ResponsiveModalContent className="sm:max-w-md">
                <ResponsiveModalHeader>
                    <ResponsiveModalTitle className="flex items-center gap-2">
                        {type === 'link' ? <LinkIcon className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                        {title}
                    </ResponsiveModalTitle>
                </ResponsiveModalHeader>
                <div className="space-y-4 py-4 px-4 sm:px-0">
                    <div className="space-y-2">
                        <Label htmlFor="url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {type === 'link' ? "Destination URL" : "Image Source URL"}
                        </Label>
                        <Input
                            id="url"
                            placeholder={type === 'link' ? "https://example.com" : "https://example.com/image.jpg"}
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleConfirm();
                                }
                            }}
                            autoFocus
                        />
                    </div>
                </div>
                <ResponsiveModalFooter className="sm:justify-end gap-2 px-4 pb-4 sm:px-0 sm:pb-0">
                    <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleConfirm} disabled={!url.trim()}>
                        {initialValue ? "Update" : "Insert"}
                    </Button>
                </ResponsiveModalFooter>
            </ResponsiveModalContent>
        </ResponsiveModal>
    );
}

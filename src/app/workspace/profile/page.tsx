"use client";

import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ChevronLeft, Loader2, Save, Mail, User as UserIcon, ShieldCheck, KeyRound, Eye, EyeOff, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function ProfilePage() {
    const { user, updatePassword, signIn } = useAuth();
    const { profile, loading, updateProfile } = useProfile();
    const [displayName, setDisplayName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ currentPassword?: string; newPassword?: string; confirmPassword?: string }>({});

    const pageRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (profile) {
            setDisplayName(profile.displayName || '');
            setAvatarUrl(profile.avatarUrl);
        }
    }, [profile]);

    useGSAP(() => {
        if (loading) return;
        const mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const cards = pageRef.current?.querySelectorAll('[data-animate-card]');
            const tl = gsap.timeline();
            tl.from(heroRef.current, { opacity: 0, y: -16, duration: 0.4, ease: 'power2.out' });
            if (cards && cards.length) {
                tl.from(cards, { opacity: 0, y: 16, duration: 0.4, stagger: 0.08, ease: 'power2.out' }, '-=0.2');
            }
        });

        return () => mm.revert();
    }, { dependencies: [loading], scope: pageRef });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await updateProfile({ displayName, avatarUrl });
        setSaving(false);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrors({});

        // Validate current password is provided
        if (!currentPassword) {
            setPasswordErrors({ currentPassword: 'Please enter your current password' });
            return;
        }

        const passwordResult = passwordSchema.safeParse(newPassword);
        if (!passwordResult.success) {
            setPasswordErrors({ newPassword: passwordResult.error.issues[0].message });
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrors({ confirmPassword: 'Passwords do not match' });
            return;
        }

        if (newPassword === currentPassword) {
            setPasswordErrors({ newPassword: 'New password must be different from current password' });
            return;
        }

        setPasswordSaving(true);

        // First verify the current password by attempting to sign in
        const { error: signInError } = await signIn(user?.email || '', currentPassword);

        if (signInError) {
            setPasswordSaving(false);
            setPasswordErrors({ currentPassword: 'Current password is incorrect' });
            return;
        }

        // Now update to the new password
        const { error } = await updatePassword(newPassword);
        setPasswordSaving(false);

        if (error) {
            toast.error('Password update failed', {
                description: error.message,
            });
        } else {
            toast.success('Password updated!', {
                description: 'Your password has been changed successfully.',
            });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    if (loading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background/50 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div ref={pageRef} className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
            <div className="container max-w-3xl py-12 px-4 sm:px-6 lg:px-8 space-y-10">
                {/* Header Navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="hover:bg-background shadow-sm border border-transparent hover:border-border transition-all">
                        <Link href="/workspace">
                            <ChevronLeft className="h-4 w-4 mr-1.5" />
                            Back to workspace
                        </Link>
                    </Button>
                </div>

                {/* Hero section */}
                <div ref={heroRef} className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Account Settings</h1>
                    <p className="text-lg text-muted-foreground max-w-xl">
                        Customize your profile, manage your account preferences, and how others see you.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Sidebar Info */}
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold">Public Profile</h2>
                            <p className="text-sm text-muted-foreground">
                                This information will be displayed publicly so be careful what you share.
                            </p>
                        </div>

                        {/* Right Content Card */}
                        <div data-animate-card className="md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-8 space-y-8">
                                <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
                                    <AvatarUpload
                                        url={avatarUrl}
                                        onUpload={setAvatarUrl}
                                        userId={user?.id || ''}
                                    />
                                    <div className="flex-1 space-y-4 pt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="displayName" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <UserIcon className="h-3.5 w-3.5" />
                                                Display Name
                                            </Label>
                                            <Input
                                                id="displayName"
                                                placeholder="Enter your display name"
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="h-11 px-4 text-base focus-visible:ring-primary/20 transition-all font-medium"
                                            />
                                            <p className="text-[13px] text-muted-foreground leading-relaxed">
                                                People on the platform will see this name. It's how you'll be identified across pages and comments.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t">
                        {/* Left Sidebar Info */}
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold tracking-tight">Email & Security</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Manage your primary account details and security settings.
                            </p>
                        </div>

                        {/* Right Content Card */}
                        <div data-animate-card className="md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Mail className="h-3.5 w-3.5" />
                                        Primary Email
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            type="email"
                                            disabled
                                            value={user?.email || ''}
                                            className="h-11 px-4 bg-muted/30 border-dashed text-muted-foreground cursor-not-allowed italic"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <ShieldCheck className="h-4 w-4 text-muted-foreground/50" />
                                        </div>
                                    </div>
                                    <p className="text-[13px] text-muted-foreground italic">
                                        Your primary email address is verified and cannot be changed here.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end pt-8 sticky bottom-8 z-30 pointer-events-none">
                        <Button
                            type="submit"
                            disabled={saving}
                            className="h-12 px-8 gap-2.5 text-base font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 pointer-events-auto rounded-full active:scale-95"
                        >
                            {saving ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Save className="h-5 w-5" />
                            )}
                            {saving ? 'Saving changes...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>

                {/* Password Change Section */}
                <form onSubmit={handlePasswordChange} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t">
                        {/* Left Sidebar Info */}
                        <div className="space-y-1">
                            <h2 className="text-lg font-semibold tracking-tight">Change Password</h2>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Update your password to keep your account secure.
                            </p>
                        </div>

                        {/* Right Content Card */}
                        <div data-animate-card className="md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <Lock className="h-3.5 w-3.5" />
                                        Current Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            placeholder="Enter your current password"
                                            value={currentPassword}
                                            onChange={(e) => {
                                                setCurrentPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, currentPassword: undefined }));
                                            }}
                                            className="h-11 px-4 pr-12 text-base focus-visible:ring-primary/20 transition-all"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, newPassword: undefined }));
                                            }}
                                            className="h-11 px-4 pr-12 text-base focus-visible:ring-primary/20 transition-all"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        <KeyRound className="h-3.5 w-3.5" />
                                        Confirm New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                setPasswordErrors(prev => ({ ...prev, confirmPassword: undefined }));
                                            }}
                                            className="h-11 px-4 pr-12 text-base focus-visible:ring-primary/20 transition-all"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                                    )}
                                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                                        Password must be at least 6 characters long.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                                        className="h-11 px-6 gap-2 font-semibold"
                                    >
                                        {passwordSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="h-4 w-4" />
                                                Update Password
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}


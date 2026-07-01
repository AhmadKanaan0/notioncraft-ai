# GSAP Entrance Animations — Workspace & Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add subtle GSAP entrance/transition animations to the Workspace and Profile pages, matching a professional productivity-app feel.

**Architecture:** Use `@gsap/react`'s `useGSAP` hook with `gsap.context()` scoping per component (auto-cleanup on unmount). Wrap every animation in `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)` breakpoint so reduced-motion users get an instant/no-op state. No new dependencies — `gsap` and `@gsap/react` are already in `package.json`.

**Tech Stack:** Next.js (App Router) client components, TypeScript, GSAP 3 + `@gsap/react`, Tailwind, shadcn/ui.

## Global Constraints

- Do not modify `useAuth`, `usePages`, `useProfile`, or Tiptap/`NotionEditor` internals — animations are additive only.
- Do not animate the shadcn `<Sidebar>` primitive itself (`src/components/sidebar/AppSidebar.tsx`) — it manages its own collapse/expand/mobile-sheet transforms via `SidebarProvider`; wrapping it in a competing GSAP timeline risks fighting that state. Animate the `<main>` region (header + content) in `page.tsx` instead.
- Every animation must be wrapped in `gsap.matchMedia()` with a reduced-motion breakpoint — no exceptions.
- No new npm dependencies.
- This repo has no test runner configured (`package.json` has no `test` script). Verification per task is: (1) `npx tsc --noEmit` for type safety, (2) `npm run lint`, (3) manual visual check via `npm run dev` in the browser. Do not invent a testing framework for this plan.

---

### Task 1: Workspace mount + page-switch animation

**Files:**
- Modify: `src/app/workspace/page.tsx`

**Interfaces:**
- Produces: no new exports; purely internal refs (`mainRef`, `contentRef`) and a `useGSAP` call inside the `Workspace` component.

- [ ] **Step 1: Add refs and `useGSAP` import**

At the top of `src/app/workspace/page.tsx`, update imports (line 1-2 area):

```tsx
"use client";
import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
```

Inside `export default function Workspace()`, alongside the existing `editorRef` declaration (around line 50), add:

```tsx
  const mainRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: Wire `mainRef` and `contentRef` onto the JSX**

Change the `<main>` opening tag (currently `<main className="flex-1 flex flex-col min-w-0 relative z-20">`) to:

```tsx
        <main ref={mainRef} className="flex-1 flex flex-col min-w-0 relative z-20">
```

Change the inner content wrapper (currently `<div className="flex-1 overflow-y-auto">` that wraps the `currentPage ? (...) : (...)` block) to:

```tsx
            <div ref={contentRef} className="flex-1 overflow-y-auto">
```

- [ ] **Step 3: Add the mount timeline**

Add this `useGSAP` call inside the component body, after the other `useEffect` hooks and before `handleCreatePage` (around line 76):

```tsx
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const header = mainRef.current?.querySelector('header');
      if (!header) return;

      gsap.timeline()
        .from(header, { opacity: 0, y: -12, duration: 0.4, ease: 'power2.out' })
        .from(contentRef.current, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' }, '-=0.25');
    });

    return () => mm.revert();
  }, { scope: mainRef });
```

- [ ] **Step 4: Add the page-switch fade**

Add a second `useGSAP` call right after the one from Step 3, so switching `currentPageId` re-fades the content area:

```tsx
  useGSAP(() => {
    if (!currentPageId) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    });

    return () => mm.revert();
  }, { dependencies: [currentPageId], scope: mainRef });
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors (pre-existing errors, if any, are out of scope).

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open `/workspace` in the browser.
Expected: on load, header fades down then content fades up right after; clicking a different page in the sidebar produces a quick fade on the content area (no layout jump).

- [ ] **Step 7: Commit**

```bash
git add src/app/workspace/page.tsx
git commit -m "feat(workspace): add GSAP mount and page-switch entrance animation"
```

---

### Task 2: Workspace interactive polish (toggle buttons, outline panel)

**Files:**
- Modify: `src/app/workspace/page.tsx`

**Interfaces:**
- Consumes: `mainRef` from Task 1 (already scoping the component's `useGSAP` context).
- Produces: `aiButtonRef`, `tocButtonRef`, `outlineAsideRef` refs; a `handleToggleClick` helper.

- [ ] **Step 1: Add refs for the toggle buttons and outline panel**

Alongside `contentRef` from Task 1, add:

```tsx
  const aiButtonRef = useRef<HTMLButtonElement>(null);
  const tocButtonRef = useRef<HTMLButtonElement>(null);
  const outlineAsideRef = useRef<HTMLElement>(null);
```

- [ ] **Step 2: Add a shared press-feedback helper**

Add this function near `handleInsertContent` (it's a plain GSAP call, not a hook, since it runs on click, not on mount):

```tsx
  const pulseButton = (el: HTMLElement | null) => {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: 'back.out(3)' });
  };
```

- [ ] **Step 3: Wire the refs and pulse calls onto the toggle buttons**

Update the AI Assistant button (around line 149-157):

```tsx
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
```

Update the Outline button (around line 158-166):

```tsx
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
```

Note: `Button` from `@/components/ui/button` forwards refs to the underlying `<button>` (shadcn buttons use `React.forwardRef`) — no changes needed there.

- [ ] **Step 4: Slide in the desktop outline `<aside>` when it opens**

Update the desktop outline block (around line 198-202) to attach the ref:

```tsx
            {isDesktop && isToCOpen && currentPage && (
              <aside ref={outlineAsideRef} className="w-64 border-l bg-background shrink-0 overflow-y-auto">
                <TableOfContents items={tocItems} editor={editorRef.current} />
              </aside>
            )}
```

Add a `useGSAP` call after the Task 1 hooks that animates it in whenever it mounts (React re-mounts this `<aside>` each time `isToCOpen && currentPage` flips true, so a mount-timed animation is enough — no need to track open/close manually):

```tsx
  useGSAP(() => {
    if (!isDesktop || !isToCOpen || !currentPage) return;
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.from(outlineAsideRef.current, { x: 24, opacity: 0, duration: 0.3, ease: 'power2.out' });
    });

    return () => mm.revert();
  }, { dependencies: [isToCOpen, currentPage, isDesktop], scope: mainRef });
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open `/workspace` in the browser (desktop width).
Expected: clicking "AI Assistant" or "Outline" gives a quick scale-pulse on the button; opening the Outline panel slides it in from the right. Resize below `1024px` and confirm the mobile drawer (already has its own open/close animation from `vaul`/Drawer) still works unaffected.

- [ ] **Step 7: Commit**

```bash
git add src/app/workspace/page.tsx
git commit -m "feat(workspace): add press feedback and outline panel entrance animation"
```

---

### Task 3: Profile page hero + cards stagger entrance

**Files:**
- Modify: `src/app/workspace/profile/page.tsx`

**Interfaces:**
- Produces: `pageRef`, `heroRef` refs; no exports change.

- [ ] **Step 1: Add imports and refs**

Update the imports at the top of `src/app/workspace/profile/page.tsx` (line 1-3 area):

```tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
```

Inside `export default function ProfilePage()`, alongside the existing state declarations (around line 25), add:

```tsx
    const pageRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);
```

- [ ] **Step 2: Wire the refs onto the JSX**

Change the outer container (currently `<div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">`) to:

```tsx
        <div ref={pageRef} className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50">
```

Change the hero section (currently `<div className="space-y-2">` containing the `<h1>Account Settings</h1>`) to:

```tsx
                <div ref={heroRef} className="space-y-2">
```

- [ ] **Step 3: Add a `data-animate-card` marker to each settings card**

There are three card containers with class `md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden` (Public Profile, Email & Security, Change Password). Add `data-animate-card` to each, e.g. the first one becomes:

```tsx
                        <div data-animate-card className="md:col-span-2 bg-background rounded-2xl border shadow-sm overflow-hidden">
```

Apply the same `data-animate-card` attribute to the other two matching `div`s (Email & Security card, Change Password card).

- [ ] **Step 4: Add the entrance timeline**

Add this `useGSAP` call in the component body, after the existing `useEffect` (around line 43), guarded on `!loading` so it only runs once profile data (and therefore the full form) has rendered:

```tsx
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
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 6: Manual visual check**

Run: `npm run dev`, open `/workspace/profile` in the browser.
Expected: hero fades/slides down first, then the three cards stagger in from below shortly after.

- [ ] **Step 7: Commit**

```bash
git add src/app/workspace/profile/page.tsx
git commit -m "feat(profile): add hero and card stagger entrance animation"
```

---

### Task 4: Avatar + save-feedback + password-eye polish

**Files:**
- Modify: `src/components/profile/AvatarUpload.tsx`
- Modify: `src/app/workspace/profile/page.tsx`

**Interfaces:**
- Consumes: `pageRef` from Task 3 (for scoping password-eye animations already inside that component).
- Produces: no new exports; internal refs only.

- [ ] **Step 1: Avatar entrance + upload-success pulse in `AvatarUpload.tsx`**

Update imports at the top of `src/components/profile/AvatarUpload.tsx` (line 1-8):

```tsx
"use client";

import { useState, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { supabase } from '@/lib/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
```

Add an `avatarRef` alongside `fileInputRef` (line 18):

```tsx
    const avatarRef = useRef<HTMLDivElement>(null);
```

Add a mount-in animation and export a small pulse helper, right after the existing state/ref declarations:

```tsx
    useGSAP(() => {
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            gsap.from(avatarRef.current, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'back.out(1.7)' });
        });
        return () => mm.revert();
    }, { scope: avatarRef });

    const pulseAvatarSuccess = () => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.fromTo(avatarRef.current, { scale: 1 }, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    };
```

In `handleUpload`, call `pulseAvatarSuccess()` right after `toast.success('Avatar updated')` (around line 47):

```tsx
            onUpload(publicUrl);
            toast.success('Avatar updated');
            pulseAvatarSuccess();
```

Attach `avatarRef` to the wrapping div that currently reads `<div className="group relative cursor-pointer" ...>` (around line 58):

```tsx
            <div
                ref={avatarRef}
                className="group relative cursor-pointer"
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Manual visual check**

Run: `npm run dev`, open `/workspace/profile`.
Expected: avatar pops in with a slight scale-bounce on page load; uploading a new image pulses the avatar right after the "Avatar updated" toast appears.

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/AvatarUpload.tsx
git commit -m "feat(profile): add avatar entrance and upload-success pulse"
```

- [ ] **Step 5: Save-button success pulse in `src/app/workspace/profile/page.tsx`**

Add refs for the two submit buttons alongside `pageRef`/`heroRef` from Task 3:

```tsx
    const saveButtonRef = useRef<HTMLButtonElement>(null);
    const passwordButtonRef = useRef<HTMLButtonElement>(null);
```

Add a shared pulse helper near `handleSubmit`:

```tsx
    const pulseSuccess = (el: HTMLElement | null) => {
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        gsap.fromTo(el, { scale: 1 }, { scale: 1.05, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    };
```

In `handleSubmit`, call it after `await updateProfile(...)` succeeds (around line 47-48):

```tsx
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await updateProfile({ displayName, avatarUrl });
        setSaving(false);
        pulseSuccess(saveButtonRef.current);
    };
```

In `handlePasswordChange`, call it in the success branch (currently the `else` branch that shows `toast.success('Password updated!'...)`, around line 96-103):

```tsx
        } else {
            toast.success('Password updated!', {
                description: 'Your password has been changed successfully.',
            });
            pulseSuccess(passwordButtonRef.current);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
```

Attach the refs to the two `<Button type="submit">` elements: the Save Changes button (around line 216) gets `ref={saveButtonRef}`, and the Update Password button (around line 345) gets `ref={passwordButtonRef}`.

- [ ] **Step 6: Password eye-icon swap transition**

Add a small helper that cross-fades the eye/eye-off icon instead of an instant swap. Since the three toggle buttons (`showCurrentPassword`, `showNewPassword`, `showConfirmPassword`) share the same pattern, add one reusable inline handler used by all three `onClick`s. Replace each of the three toggle `onClick` handlers (e.g. `onClick={() => setShowCurrentPassword(!showCurrentPassword)}`) with a version that grabs the icon via `e.currentTarget` and fades it:

```tsx
                                            onClick={(e) => {
                                                const icon = e.currentTarget.querySelector('svg');
                                                if (icon && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                                                    gsap.fromTo(icon, { opacity: 0, rotate: -45 }, { opacity: 1, rotate: 0, duration: 0.2, ease: 'power1.out' });
                                                }
                                                setShowCurrentPassword(!showCurrentPassword);
                                            }}
```

Apply the analogous version (swap `setShowCurrentPassword`/`showCurrentPassword` for `setShowNewPassword`/`showNewPassword` and `setShowConfirmPassword`/`showConfirmPassword`) to the other two eye-toggle buttons.

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 8: Manual visual check**

Run: `npm run dev`, open `/workspace/profile`.
Expected: saving the profile or password form gives a quick scale-pulse on the corresponding submit button right when the success toast appears; clicking any eye icon fades/rotates the icon in instead of an instant swap.

- [ ] **Step 9: Lint the whole change set**

Run: `npm run lint`
Expected: no new lint errors introduced by these changes.

- [ ] **Step 10: Commit**

```bash
git add src/app/workspace/profile/page.tsx
git commit -m "feat(profile): add save-button success pulse and password-eye transition"
```

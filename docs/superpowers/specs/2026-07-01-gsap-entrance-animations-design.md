# GSAP Entrance Animations — Workspace & Profile Pages

## Goal
Add subtle, professional entrance/transition animations to the Workspace and Profile pages using GSAP (`gsap` + `@gsap/react`, already installed), matching a productivity-app feel (not playful/bouncy).

## Approach
Use `@gsap/react`'s `useGSAP` hook with `gsap.context()` scoping per component for automatic cleanup on unmount. Wrap animations in `gsap.matchMedia()` so `prefers-reduced-motion: reduce` disables/shortens motion. No new files unless an animation grows complex enough to warrant its own hook (`useEntranceAnimation`) — start inline in each page component.

## Scope

### Workspace (`src/app/workspace/page.tsx`)
- Mount: sidebar slides in from left, header fades down, editor content fades+slides up. Staggered ~0.05–0.08s apart, ~0.4s duration, 8–16px travel.
- Page switch (`currentPageId` change): quick fade/slide on the content area to avoid a jump-cut feel.
- Outline panel (desktop aside + mobile drawer): slide-in on open.
- AI Assistant / Outline toggle buttons: subtle press/hover scale feedback.

### Profile (`src/app/workspace/profile/page.tsx`)
- Hero header (title + subtitle) fades/slides in first, cards (Public Profile, Email & Security, Change Password) stagger in after.
- `AvatarUpload.tsx`: entrance pop/scale-in; success pulse on the avatar ring after a successful upload.
- Save Changes / Update Password buttons: scale/success pulse on successful save, complementing existing toast — not fighting existing hover/active CSS transitions.
- Password visibility eye-icon toggle: icon rotate/fade swap instead of instant swap.

## Out of scope
- No changes to data/logic hooks (`useAuth`, `usePages`, `useProfile`) or Tiptap editor internals.
- No new animation library; GSAP only.
- No scroll-driven (ScrollTrigger) effects — entrance/transition polish only.

## Testing
- Manual verification in-browser: page load, page switching, outline toggle, avatar upload, password save flows, and with `prefers-reduced-motion` simulated.

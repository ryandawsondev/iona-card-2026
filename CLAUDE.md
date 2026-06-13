# CLAUDE.md — Iona Card 2026

## Project

Digital birthday card for Iona (sister). Single-page React app. Two phases:
- **Phase 1**: Fullscreen animated text intro → CTA button → (Phase 2)
- **Phase 2**: Flip-through birthday card component (2–3 pages)

## Tech Stack

| Layer | Library |
|---|---|
| Framework | TanStack Start + TanStack Router (file-based, `src/routes/`) |
| Animation | `motion` v12 (Framer Motion) — use `motion/react` import |
| Styling | Tailwind v4 + `tw-animate-css` |
| Particles/confetti | `canvas-confetti` + `partycles` |
| Sketch annotations | `rough-notation` |
| Theme | `next-themes` (system default, toggle available) |
| Package manager | `pnpm` |

## UI Components (src/components/ui/)

Pre-built — use these, don't reinvent:

| Component | File | Use for |
|---|---|---|
| `TextAnimate` | `text-animate.tsx` | Sentence-by-sentence intro animation |
| `AuroraText` | `aurora-text.tsx` | Gradient shimmer on "Iona" |
| `BlurFade` | `blur-fade.tsx` | Fade-in orchestration |
| `AnimatedGradientText` | `animated-gradient-text.tsx` | Gradient wrapper for key phrases |
| `Confetti` | `confetti.tsx` | Confetti burst trigger |
| `MagicCard` | `magic-card.tsx` | Card surface with hover glow |
| `ShineBorder` | `shine-border.tsx` | Animated border on card |
| `CoolMode` | `cool-mode.tsx` | Particle trail on button |

## Design Decisions

- **Aesthetic**: Playful & Fun — bright colors, bouncy spring physics, celebratory energy
- **Color mode**: System default + toggle (next-themes already wired)
- **Entry point**: `src/routes/index.tsx` — replace starter template entirely
- **Copy**: Placeholder sentences editable in one place (constants file or top of component)
- **Fonts**: Use what Tailwind provides; can layer a display font via CSS var if needed

## Conventions

- Components in `src/components/` (feature components, not ui primitives)
- Shared types in `src/types/` if needed
- No new packages without asking — animation needs are already covered
- `motion/react` not `framer-motion` — this is Motion v12
- Tailwind v4 syntax — no `@apply`, use utility classes directly

## Key Files

```
src/routes/index.tsx          ← main page (currently starter template, will be replaced)
src/components/ui/            ← pre-built UI primitives
src/styles.css                ← CSS tokens / global styles
```

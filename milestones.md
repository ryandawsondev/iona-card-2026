# Milestones — Iona Card 2026

Status key: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## Phase 1 — Animated Text Intro

### M1.1 — Clear starter template
**Status:** `[x]`
Replace `src/routes/index.tsx` with a blank fullscreen canvas. Remove all TanStack Start boilerplate (globe, feature cards, quick-start section). Keep the route export wrapper.

---

### M1.2 — Fullscreen centered stage
**Status:** `[x]`
Create a fullscreen `section` (100dvh, flex center) that acts as the stage for the text intro. Dark/light responsive via Tailwind. No scroll during intro.

---

### M1.3 — Sentence-by-sentence text animation
**Status:** `[x]`
Animate 4–5 placeholder sentences in sequence, one at a time, centered on screen.

**Sentences (placeholder — edit freely):**
1. "Hey Iona 👋"
2. "Another year around the sun..."
3. "And you keep getting cooler."
4. "We made you something."
5. "Happy Birthday 🎉"

**Implementation notes:**
- Use `TextAnimate` (`src/components/ui/text-animate.tsx`) for per-sentence entrance
- Each sentence waits for the previous to finish before appearing (staggered with `motion` `delay`)
- Previous sentences fade out OR stack — decide at implementation time (fading out feels cleaner for fullscreen)
- Spring physics on entrance: `type: "spring", stiffness: 300, damping: 24`

---

### M1.4 — Aurora gradient on "Iona" and key words
**Status:** `[x]`
Wrap the name "Iona" (and optionally "Happy Birthday") in `AuroraText` (`aurora-text.tsx`) to give them the animated shimmer/gradient treatment.

**Notes:**
- Only apply to 1–2 words max — overuse kills the effect
- Confirm `AuroraText` accepts `className` for size override

---

### M1.5 — CTA button after final sentence
**Status:** `[x]`
After the last sentence finishes animating, a button fades in: **"Open your card →"**

**Implementation notes:**
- Use `BlurFade` or `motion` `AnimatePresence` to reveal button
- Button uses `CoolMode` wrapper (`cool-mode.tsx`) for particle trail on hover/click
- On click: transitions to Phase 2 card view (stub for now — can scroll, route change, or state toggle)
- Keyboard accessible (focus ring, Enter triggers)

---

### M1.6 — Confetti burst
**Status:** `[x]`
Fire a confetti burst when the final sentence appears (or when the CTA button appears).

**Implementation notes:**
- Use `canvas-confetti` directly (more control than the `Confetti` component wrapper)
- Colors: match playful palette — pinks, purples, yellows, greens
- One-shot burst, not looping
- Trigger via `useEffect` watching animation state

---

### M1.7 — Theme toggle
**Status:** `[x]`
Wire up `AnimatedThemeToggler` (`animated-theme-toggler.tsx`) in a fixed top-right corner. `next-themes` is already installed — just needs the provider and toggle component placed.

**Notes:**
- System default on first load
- Should not interrupt or restart the text animation

---

## Phase 2 — Birthday Card Component

### M2.1 — Card flip mechanic
**Status:** `[ ]`
3D flip animation between pages using `motion` `rotateY`. The card has a front face and back face per spread.

**Implementation notes:**
- CSS `perspective` on wrapper, `transform-style: preserve-3d` on card
- Use `motion` `animate={{ rotateY: ... }}` driven by page index state
- `backfaceVisibility: "hidden"` on each face
- Transition: `type: "spring", stiffness: 200, damping: 30`

---

### M2.2 — Card page 1 — Cover
**Status:** `[ ]`
Front cover of the card. Design: bold "Happy Birthday Iona" with decorative elements. Wrap card surface in `MagicCard` + `ShineBorder`.

---

### M2.3 — Card page 2 — Inner message
**Status:** `[ ]`
Inside spread: personal message / content (placeholder text for now). Can include photos, drawings, or more text reveals.

---

### M2.4 — Card page 3 — Back / outro (optional)
**Status:** `[ ]`
Optional back page — could be a fun sign-off, photos, or a final confetti trigger. Scope TBD.

---

### M2.5 — Page navigation
**Status:** `[ ]`
Prev/Next controls to flip between pages. Arrow buttons or swipe gesture (pointer events).

**Notes:**
- Disable "prev" on first page, "next" on last
- Accessible: keyboard left/right arrow support

---

## Out of Scope (for now)

- Audio / music
- Backend / persistence
- Sharing / hosting setup
- Mobile swipe gestures (nice to have for M2.5)

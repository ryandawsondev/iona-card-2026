import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { AuroraText } from '#/components/ui/aurora-text.tsx'
import { LightRays } from '#/components/ui/light-rays.tsx'
import { cn } from '#/lib/utils.ts'

const AURORA_COLORS = ['#ff6b9d', '#c44dff', '#ff8c42', '#ffd700']
const PAGES = 2

export function BirthdayCard({ onGiftReveal }: { onGiftReveal?: () => void }) {
  const [page, setPage] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isRightHalf = e.clientX - rect.left > rect.width / 2
    if (isRightHalf && page < PAGES - 1) setPage((p) => p + 1)
    if (!isRightHalf && page > 0) setPage((p) => p - 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) < 40) return
    if (diff < 0 && page < PAGES - 1) setPage((p) => p + 1)
    if (diff > 0 && page > 0) setPage((p) => p - 1)
    touchStartX.current = null
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative w-[min(760px,92vw)] aspect-[3/4] sm:aspect-[16/10]"
        style={{ perspective: '1400px', cursor: 'none' }}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Split-flip: each face only rotates 90°, no backface ever shown.
            Avoids preserve-3d + backface-visibility which break on iOS Safari
            when any ancestor has filter/opacity/overflow-hidden stacking contexts. */}
        <motion.div
          animate={{ rotateY: page === 0 ? 0 : -90 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ zIndex: page === 0 ? 1 : 0, pointerEvents: page === 0 ? 'auto' : 'none' }}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_0_0_1.5px_rgba(196,77,255,0.7),0_0_35px_rgba(196,77,255,0.4),0_0_70px_rgba(255,107,157,0.2),0_20px_60px_rgba(0,0,0,0.8)]"
        >
          <Cover />
        </motion.div>

        <motion.div
          animate={{ rotateY: page === 1 ? 0 : 90 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ zIndex: page === 1 ? 1 : 0, pointerEvents: page === 1 ? 'auto' : 'none' }}
          className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
        >
          <Message onGiftReveal={onGiftReveal} />
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: PAGES }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              page === i ? 'w-6 bg-purple-400' : 'w-1.5 bg-purple-400/30',
            )}
          />
        ))}
      </div>

      <p className="text-xs text-[var(--sea-ink-soft)] tracking-widest uppercase opacity-50 select-none">
        {page === 0
          ? 'swipe or tap right to open'
          : 'swipe or tap left to go back'}
      </p>
    </div>
  )
}

function Cover() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#1a0533] via-[#2d0a4e] to-[#0a1a3d] flex flex-col items-center justify-center gap-2">
      <div className="pointer-events-none absolute -top-[15%] -left-[8%] h-56 w-56 rounded-full bg-pink-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-[15%] -right-[8%] h-64 w-64 rounded-full bg-purple-600/25 blur-3xl" />
      <div className="pointer-events-none absolute top-[25%] right-[12%] h-36 w-36 rounded-full bg-indigo-400/20 blur-2xl" />

      <svg
        className="pointer-events-none absolute bottom-5 right-6 w-12 h-12 text-pink-300/25 z-10"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="22"
          cy="25"
          r="16"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 18 Q22 12 36 20"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M6 25 Q22 18 38 26"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M8 32 Q22 26 36 32"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <line
          x1="33"
          y1="8"
          x2="44"
          y2="19"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="33" cy="8" r="2.5" fill="currentColor" />
      </svg>

      <LightRays
        count={5}
        color="rgba(196, 77, 255, 0.35)"
        blur={24}
        speed={12}
        length="85%"
      />

      <p className="text-purple-300/50 text-[clamp(0.55rem,1.2vw,0.75rem)] tracking-[0.35em] uppercase font-semibold z-10">
        Happy Birthday
      </p>
      <h1
        className="z-10 font-bold leading-none"
        style={{ fontFamily: 'Fraunces, Georgia, serif' }}
      >
        <AuroraText
          colors={AURORA_COLORS}
          className="text-[clamp(3.5rem,11vw,7rem)]"
        >
          Iona
        </AuroraText>
      </h1>
      <p className="text-purple-300/35 text-[clamp(0.6rem,1.4vw,0.85rem)] tracking-[0.4em] z-10">
        2026
      </p>
    </div>
  )
}

function Message({ onGiftReveal }: { onGiftReveal?: () => void }) {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4 sm:p-[clamp(1.5rem,5vw,3rem)]">
      <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-bl-[80px] bg-gradient-to-bl from-pink-100 to-transparent opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-tr-[60px] bg-gradient-to-tr from-purple-100 to-transparent opacity-60" />

      <div className="max-w-[520px] text-center space-y-2 sm:space-y-3">
        <div className="w-10 h-px bg-gradient-to-r from-pink-300 to-purple-300 mx-auto" />
        <p
          className="text-stone-700 font-semibold text-sm sm:text-[clamp(0.8rem,1.7vw,1rem)]"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Dear Iona, Happy 22nd Birthday!
        </p>
        <p
          className="text-stone-600 leading-relaxed text-xs sm:text-[clamp(0.72rem,1.5vw,0.9rem)]"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Can't believe you're almost an old grandma. I know this is late but I
          hope the effort put into it was worth the wait; don't be expecting
          this quality every year!
        </p>
        <p
          className="text-stone-600 leading-relaxed text-xs sm:text-[clamp(0.72rem,1.5vw,0.9rem)]"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Hopefully you'll like the gift too. You are a wonderful sister and I
          wouldnt want anyone else as my sibling.
        </p>
        <div className="w-10 h-px bg-gradient-to-r from-purple-300 to-pink-300 mx-auto" />
        <p className="text-stone-400 text-[0.6rem] tracking-[0.3em] uppercase sm:text-[clamp(0.6rem,1.2vw,0.7rem)]">
          With love from Ryan
        </p>

        <AnimatePresence>
          {onGiftReveal && (
            <motion.button
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              onClick={onGiftReveal}
              className="mt-1 rounded-full border border-purple-200 px-4 py-1.5 text-xs font-semibold tracking-wide text-purple-600 transition hover:border-purple-400 hover:bg-purple-50 sm:px-5 sm:py-2 sm:text-[clamp(0.6rem,1.3vw,0.75rem)]"
              style={{ cursor: 'none' }}
            >
              🎁 Open your gift
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

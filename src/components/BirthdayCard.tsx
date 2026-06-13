import { useState } from 'react'
import { motion } from 'motion/react'
import { AuroraText } from '#/components/ui/aurora-text.tsx'
import { LightRays } from '#/components/ui/light-rays.tsx'
import { cn } from '#/lib/utils.ts'

const AURORA_COLORS = ['#ff6b9d', '#c44dff', '#ff8c42', '#ffd700']
const PAGES = 2

export function BirthdayCard() {
  const [page, setPage] = useState(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const isRightHalf = e.clientX - rect.left > rect.width / 2
    if (isRightHalf && page < PAGES - 1) setPage((p) => p + 1)
    if (!isRightHalf && page > 0) setPage((p) => p - 1)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{ perspective: '1400px' }}>
        <motion.div
          onClick={handleClick}
          animate={{ rotateY: page === 1 ? -180 : 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{ transformStyle: 'preserve-3d', cursor: 'none' }}
          className="relative w-[min(760px,92vw)] aspect-[16/10]"
        >
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_0_0_1.5px_rgba(196,77,255,0.7),0_0_35px_rgba(196,77,255,0.4),0_0_70px_rgba(255,107,157,0.2),0_20px_60px_rgba(0,0,0,0.8)]"
          >
            <Cover />
          </div>

          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
          >
            <Message />
          </div>
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

      <p className="text-xs text-[var(--sea-ink-soft)] tracking-widest uppercase opacity-50">
        {page === 0 ? 'tap right to open' : 'tap left to go back'}
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

function Message() {
  return (
    <div className="relative h-full w-full bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 flex items-center justify-center p-[clamp(1.5rem,5vw,3rem)]">
      <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-bl-[80px] bg-gradient-to-bl from-pink-100 to-transparent opacity-60" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-tr-[60px] bg-gradient-to-tr from-purple-100 to-transparent opacity-60" />

      <div className="max-w-[480px] text-center space-y-4">
        <div className="w-10 h-px bg-gradient-to-r from-pink-300 to-purple-300 mx-auto" />
        <p
          className="text-stone-600 leading-relaxed text-[clamp(0.85rem,2vw,1.1rem)]"
          style={{ fontFamily: 'Fraunces, Georgia, serif' }}
        >
          Write your message here. This is a placeholder for the heartfelt words
          you'll add for Iona's birthday.
        </p>
        <div className="w-10 h-px bg-gradient-to-r from-purple-300 to-pink-300 mx-auto" />
        <p className="text-stone-400 text-[clamp(0.6rem,1.2vw,0.7rem)] tracking-[0.3em] uppercase">
          With love from Ryan
        </p>
      </div>
    </div>
  )
}

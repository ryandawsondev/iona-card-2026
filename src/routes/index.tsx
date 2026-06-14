import { createFileRoute } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { AuroraText } from '#/components/ui/aurora-text.tsx'
import { CoolMode } from '#/components/ui/cool-mode.tsx'
import { AnimatedThemeToggler } from '#/components/ui/animated-theme-toggler.tsx'
import { RainbowButton } from '#/components/ui/rainbow-button.tsx'
import { Pointer } from '#/components/ui/pointer.tsx'
import { BirthdayCard } from '#/components/BirthdayCard.tsx'
import { CourseBackground } from '#/components/CourseBackground.tsx'
import backgroundMusicSrc from '../audio-file/01 First Light.mp3'

export const Route = createFileRoute('/')({ component: BirthdayIntro })


const PARTY_COLORS = ['#ff6b9d', '#c44dff', '#ff8c42', '#ffd700', '#4fb8b2']
const AURORA_COLORS = ['#ff6b9d', '#c44dff', '#ff8c42', '#ffd700']

const SENTENCES = [
  <>
    Hey <AuroraText colors={AURORA_COLORS}>Iona</AuroraText>
  </>,
  <>Another year around the sun...</>,
  <>And you just keep getting cooler.</>,
  <>We made you something special.</>,
  <>Happy Birthday.</>,
]

const DISPLAY_MS = 2400
const TRANSITION_MS = 500

function BirthdayIntro() {
  const [phase, setPhase] = useState<'intro' | 'card'>('intro')
  const [index, setIndex] = useState(0)
  const [showButton, setShowButton] = useState(false)
  const [muted, setMuted] = useState(false)
  const confettiFired = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (showButton) return
    const isLast = index >= SENTENCES.length - 1
    const timer = setTimeout(
      () => (isLast ? setShowButton(true) : setIndex((i) => i + 1)),
      isLast ? DISPLAY_MS : DISPLAY_MS + TRANSITION_MS,
    )
    return () => clearTimeout(timer)
  }, [index, showButton])

  useEffect(() => {
    if (phase !== 'card') return
    const audio = new Audio(backgroundMusicSrc)
    audio.loop = true
    audio.volume = 0.4
    audio.muted = muted
    audioRef.current = audio
    audio.play().catch(() => {})
    return () => { audio.pause(); audioRef.current = null }
  }, [phase])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    if (!showButton || confettiFired.current) return
    confettiFired.current = true
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.55 },
      colors: PARTY_COLORS,
      scalar: 1.1,
    })
  }, [showButton])

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center overflow-hidden px-6">
      <Pointer>
        <div className="h-3 w-3 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 shadow-[0_0_8px_rgba(196,77,255,0.8)]" />
      </Pointer>

      <AnimatedThemeToggler
        className="fixed right-4 top-4 z-50 rounded-full border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[var(--sea-ink)] shadow-sm transition hover:bg-[var(--surface-strong)]"
        style={{ cursor: 'none' }}
        variant="circle"
      />

      {phase === 'card' && (
        <button
          onClick={() => setMuted((m) => !m)}
          className="fixed left-4 top-4 z-50 rounded-full border border-[var(--line)] bg-[var(--surface)] p-2.5 text-[var(--sea-ink)] shadow-sm transition hover:bg-[var(--surface-strong)]"
          style={{ cursor: 'none' }}
          aria-label={muted ? 'Unmute music' : 'Mute music'}
        >
          {muted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      )}

      {phase === 'card' && <CourseBackground />}

      <AnimatePresence mode="wait">
        {phase === 'intro' ? (
          <motion.div
            key="intro"
            className="flex flex-col items-center gap-0"
            exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            transition={{ duration: 0.4, ease: 'easeIn' }}
          >
            <div className="flex min-h-24 w-full max-w-2xl items-center justify-center text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-3xl font-bold leading-snug tracking-tight text-[var(--sea-ink)] sm:text-5xl"
                >
                  {SENTENCES[index]}
                </motion.p>
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showButton && (
                <motion.div
                  initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.25, ease: 'easeOut' }}
                >
                  <motion.div
                    whileHover={{ y: -6 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <CoolMode options={{ particle: 'circle', particleCount: 6 }}>
                      <RainbowButton
                        size="lg"
                        className="rounded-full px-10 py-5 text-base"
                        style={{ cursor: 'none' }}
                        onClick={() => setPhase('card')}
                      >
                        Open your card
                      </RainbowButton>
                    </CoolMode>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="card"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <BirthdayCard />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

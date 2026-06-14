import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import { ShineBorder } from '#/components/ui/shine-border.tsx'
import manicureSongSrc from '../audio-file/06 MANiCURE.mp3'

type Stage = 'settling' | 'idle' | 'opening'

interface Props {
  onDone: () => void
  muted?: boolean
}

export function EnvelopeReveal({ onDone, muted = false }: Props) {
  const [stage, setStage] = useState<Stage>('settling')
  const [showCard, setShowCard] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setStage('idle'), 1400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted
  }, [muted])

  useEffect(() => {
    return () => { audioRef.current?.pause(); audioRef.current = null }
  }, [])

  const handleOpen = () => {
    setStage('opening')
    const audio = new Audio(manicureSongSrc)
    audio.loop = true
    audio.volume = 0.5
    audio.muted = muted
    audioRef.current = audio
    audio.play().catch(() => {
      const resume = () => { audio.play().catch(() => {}) }
      document.addEventListener('touchstart', resume, { once: true })
      document.addEventListener('click', resume, { once: true })
    })
    setTimeout(() => {
      setShowCard(true)
      const burst = (angle: number, x: number) =>
        confetti({
          particleCount: 60,
          angle,
          spread: 55,
          origin: { x, y: 0.55 },
          colors: ['#ff3d7f', '#ff7b2e', '#ffd700', '#c44dff', '#4fb8b2'],
          scalar: 1.2,
          startVelocity: 45,
        })
      burst(60, 0.35)
      burst(120, 0.65)
    }, 480)
  }

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ minHeight: 'min(460px, 95vw)', width: 'min(420px, 92vw)' }}
    >
      {/* Envelope — slides in on mount, shoots upward when card appears */}
      <motion.div
        className="absolute"
        initial={{ x: 1200, rotate: 10 }}
        animate={
          showCard
            ? { x: 0, rotate: -3, y: -380, opacity: 0, scale: 0.65 }
            : { x: 0, rotate: 0, y: 0, opacity: 1, scale: 1 }
        }
        transition={
          showCard
            ? { duration: 0.45, ease: [0.4, 0, 1, 1] }
            : { type: 'spring', stiffness: 65, damping: 8, mass: 1.1 }
        }
      >
        <EnvelopeBody stage={stage} onOpen={handleOpen} />
      </motion.div>

      {/* Card — rises up simultaneously as envelope exits */}
      <motion.div
        className="absolute"
        style={{ pointerEvents: showCard ? 'auto' : 'none' }}
        initial={{ y: 120, opacity: 0, scale: 0.9 }}
        animate={
          showCard
            ? { y: 0, opacity: 1, scale: 1 }
            : { y: 120, opacity: 0, scale: 0.9 }
        }
        transition={
          showCard
            ? { type: 'spring', stiffness: 110, damping: 14, delay: 0.08 }
            : { duration: 0 }
        }
      >
        <GiftCard onContinue={onDone} />
      </motion.div>
    </div>
  )
}

function EnvelopeBody({ stage, onOpen }: { stage: Stage; onOpen: () => void }) {
  const isOpening = stage === 'opening'

  return (
    <div
      className="relative select-none"
      style={{
        width: 'min(400px, 88vw)',
        height: 'min(260px, 58vw)',
        filter:
          'drop-shadow(0 8px 40px rgba(255,61,127,0.6)) drop-shadow(0 0 1px rgba(255,255,255,0.35))',
      }}
    >
      {/* Unified body — full rounded rectangle, no gap with flap */}
      <div
        className="absolute inset-0 rounded-2xl flex items-center justify-center overflow-hidden"
        style={{
          background:
            'linear-gradient(145deg, #ff3d7f 0%, #ff7b2e 55%, #ffd700 100%)',
          boxShadow:
            '0 14px 50px rgba(255,61,127,0.55), 0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)',
          zIndex: 1,
        }}
      >
        {/* Diamond fold lines — all 4 corners meeting at flap-tip center */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.18]"
          viewBox="0 0 400 260"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="200"
            y2="108"
            stroke="white"
            strokeWidth="1.2"
          />
          <line
            x1="400"
            y1="0"
            x2="200"
            y2="108"
            stroke="white"
            strokeWidth="1.2"
          />
          <line
            x1="0"
            y1="260"
            x2="200"
            y2="108"
            stroke="white"
            strokeWidth="1.2"
          />
          <line
            x1="400"
            y1="260"
            x2="200"
            y2="108"
            stroke="white"
            strokeWidth="1.2"
          />
        </svg>

        {/* Button */}
        <AnimatePresence>
          {stage === 'idle' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onClick={onOpen}
              className="relative overflow-hidden rounded-full bg-white px-7 py-3 text-sm font-bold text-pink-600 shadow-lg"
              style={{ cursor: 'none' }}
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.96 }}
            >
              <ShineBorder
                shineColor={['#ff3d7f', '#ff7b2e', '#ffd700']}
                duration={2.5}
                borderWidth={2}
              />
              Open me! ✨
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Flap — darker triangle that sits flush on body's top portion */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 'min(108px, 24vw)',
          perspective: '900px',
          zIndex: 2,
        }}
      >
        <motion.div
          animate={{ rotateX: isOpening ? -92 : 0 }}
          transition={{ duration: 0.38, ease: [0.4, 0, 0.6, 1] }}
          style={{
            transformOrigin: 'top center',
            width: '100%',
            height: '100%',
          }}
        >
          {/* Rounded-top wrapper clips flap corners to match envelope body */}
          <div
            style={{
              borderRadius: '16px 16px 0 0',
              overflow: 'hidden',
              width: '100%',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background:
                  'linear-gradient(160deg, #c8003a 0%, #c85000 55%, #c8a000 100%)',
                clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                backfaceVisibility: 'hidden',
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function GiftCard({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        width: 'min(280px, 68vw)',
        height: 'min(420px, 102vw)',
        boxShadow:
          '0 0 0 1.5px rgba(196,77,255,0.5), 0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,157,0.25)',
      }}
    >
      {/* Image area */}
      <div className="relative" style={{ height: '62%' }}>
        {/* Placeholder gradient — remove div below when using real image */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-rose-100 to-purple-200" />

        {/* Real photo: uncomment and set src */}
        <img
          src={`${import.meta.env.BASE_URL}manicure-experience.webp`}
          className="absolute inset-0 h-full w-full object-cover"
          alt="Manicure experience"
        />

        {/* Company logo badge — top right; replace span with <img src="/logo.png" /> */}
        <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl bg-white/85 px-2.5 py-1.5 shadow-md backdrop-blur-sm">
          <span className="text-sm">✨</span>
          <span className="text-xs font-bold tracking-tight text-stone-700">
            Manicure
          </span>
        </div>

        {/* Location badge — bottom left */}
        <div
          className="absolute bottom-3 left-3 rounded-lg px-2 py-1 backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.48)' }}
        >
          <p className="font-medium text-white" style={{ fontSize: '0.62rem' }}>
            📍 138 Lothian Rd, Edinburgh
          </p>
        </div>

        {/* Fade into info panel */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Info panel */}
      <div
        className="flex flex-col justify-between bg-white p-4"
        style={{ height: '38%' }}
      >
        <div>
          <p
            className="font-bold uppercase tracking-[0.18em] text-pink-500"
            style={{ fontSize: '0.58rem' }}
          >
            Gift Experience
          </p>
          <h2
            className="mt-1 font-bold leading-tight text-stone-800"
            style={{ fontSize: 'clamp(0.95rem, 3.5vw, 1.15rem)' }}
          >
            Manicure Experience
          </h2>
          <p className="mt-1 text-stone-500" style={{ fontSize: '0.72rem' }}>
            ⏱ 40 minutes · EH3 9BG
          </p>
        </div>

        <div className="border-t border-stone-100 pt-2">
          <button
            onClick={onContinue}
            className="w-full text-center font-semibold uppercase tracking-widest text-purple-500 transition-colors hover:text-purple-700"
            style={{ fontSize: '0.62rem', cursor: 'none' }}
          >
            See your birthday card →
          </button>
        </div>
      </div>
    </div>
  )
}

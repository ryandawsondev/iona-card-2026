import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'

const VW = 1000
const VH = 620
const HALF_TRACK = 24

const WAYPOINTS: [number, number][] = [
  [60, 580],
  [60, 60],
  [420, 60],
  [420, 160],
  [180, 160],
  [180, 460],
  [420, 460],
  [420, 540],
  [140, 540],
  [140, 580],
  [620, 580],
  [620, 540],
  [500, 540],
  [500, 460],
  [820, 460],
  [820, 160],
  [580, 160],
  [580, 60],
  [940, 60],
  [940, 580],
]

const PATH_D = WAYPOINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x},${y}`).join(' ')

interface Segment {
  ax: number; ay: number; bx: number; by: number; len: number
}

const SEGMENTS: Segment[] = WAYPOINTS.slice(0, -1).map(([ax, ay], i) => {
  const [bx, by] = WAYPOINTS[i + 1]
  return { ax, ay, bx, by, len: Math.hypot(bx - ax, by - ay) }
})

const TOTAL_LEN = SEGMENTS.reduce((s, seg) => s + seg.len, 0)

// Waypoint indices that must be visited in order before END unlocks
const CHECKPOINTS = [4, 9, 14, 17]

function nearestOnPath(px: number, py: number) {
  let minDist = Infinity
  let bestProgress = 0
  let accumulated = 0
  for (const seg of SEGMENTS) {
    const dx = seg.bx - seg.ax
    const dy = seg.by - seg.ay
    const lenSq = seg.len * seg.len
    const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1,
      ((px - seg.ax) * dx + (py - seg.ay) * dy) / lenSq
    ))
    const dist = Math.hypot(px - (seg.ax + t * dx), py - (seg.ay + t * dy))
    if (dist < minDist) {
      minDist = dist
      bestProgress = accumulated + t * seg.len
    }
    accumulated += seg.len
  }
  return { dist: minDist, progress: (bestProgress / TOTAL_LEN) * 100 }
}

export function CourseBackground({ onComplete }: { onComplete?: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const progressPathRef = useRef<SVGPathElement>(null)
  const completedRef = useRef(false)
  const cooldownRef = useRef(false)
  const maxProgressRef = useRef(0)
  const startedRef = useRef(false)
  const checkpointRef = useRef(0)

  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [hits, setHits] = useState(0)
  const [started, setStarted] = useState(false)
  const [checkpointIdx, setCheckpointIdx] = useState(0)

  const toSVG = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const r = svg.getBoundingClientRect()
    return { x: (clientX - r.left) / r.width * VW, y: (clientY - r.top) / r.height * VH }
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (completedRef.current) return
      const pt = toSVG(e.clientX, e.clientY)
      if (!pt) return

      if (!startedRef.current) {
        const [sx, sy] = WAYPOINTS[0]
        if (Math.hypot(pt.x - sx, pt.y - sy) < HALF_TRACK * 2) {
          startedRef.current = true
          setStarted(true)
        } else {
          return
        }
      }

      const { dist, progress: pct } = nearestOnPath(pt.x, pt.y)

      if (pct > maxProgressRef.current) {
        maxProgressRef.current = pct
        setProgress(pct)
        if (progressPathRef.current) {
          progressPathRef.current.style.strokeDashoffset = String(TOTAL_LEN * (1 - pct / 100))
        }
      }

      // Advance to next checkpoint if cursor is near it
      if (checkpointRef.current < CHECKPOINTS.length) {
        const [cx, cy] = WAYPOINTS[CHECKPOINTS[checkpointRef.current]]
        if (Math.hypot(pt.x - cx, pt.y - cy) < HALF_TRACK * 1.8) {
          checkpointRef.current++
          setCheckpointIdx(checkpointRef.current)
        }
      }

      // END only unlocks after all checkpoints visited
      const [fx, fy] = WAYPOINTS[WAYPOINTS.length - 1]
      if (checkpointRef.current >= CHECKPOINTS.length && Math.hypot(pt.x - fx, pt.y - fy) < 35) {
        completedRef.current = true
        setCompleted(true)
        confetti({ particleCount: 160, spread: 100, origin: { x: 0.93, y: 0.88 }, colors: ['#ff6b9d', '#c44dff', '#ffd700', '#4fb8b2'] })
        onComplete?.()
        return
      }

      if (cooldownRef.current) return
      if (dist > HALF_TRACK) {
        cooldownRef.current = true
        setHits(h => h + 1)
        setTimeout(() => { cooldownRef.current = false }, 400)
      }
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [toSVG, onComplete])

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-white/5 z-10">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      <AnimatePresence>
        {!started && !completed && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute bottom-6 left-6 text-[10px] tracking-widest uppercase text-stone-400/40 z-10 select-none"
          >
            navigate to GO ↙
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hits > 0 && (
          <motion.p
            key="hits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-3 right-4 text-[10px] tracking-widest uppercase text-stone-400/40 z-10 select-none"
          >
            {hits} {hits === 1 ? 'hit' : 'hits'}
          </motion.p>
        )}
      </AnimatePresence>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VW} ${VH}`}
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cgProgressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#c44dff" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        <path d={PATH_D} fill="none" stroke="rgba(148,163,184,0.09)" strokeWidth={HALF_TRACK * 2} strokeLinejoin="round" strokeLinecap="round" />

        <path ref={progressPathRef} d={PATH_D} fill="none" stroke="url(#cgProgressGrad)" strokeWidth={HALF_TRACK * 2 - 10} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={TOTAL_LEN} strokeDashoffset={TOTAL_LEN} />

        <path d={PATH_D} fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth={1} strokeDasharray="6 12" strokeLinejoin="round" strokeLinecap="round" />

        {CHECKPOINTS.map((wpIdx, i) => {
          const [cx, cy] = WAYPOINTS[wpIdx]
          const passed = checkpointIdx > i
          return (
            <circle
              key={wpIdx}
              cx={cx} cy={cy} r={8}
              fill={passed ? 'rgba(196,77,255,0.35)' : 'transparent'}
              stroke={passed ? 'rgba(196,77,255,0.65)' : 'rgba(148,163,184,0.25)'}
              strokeWidth={1.5}
              strokeDasharray={passed ? undefined : '4 3'}
            />
          )
        })}

        <circle cx={WAYPOINTS[0][0]} cy={WAYPOINTS[0][1]} r={16} fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.45)" strokeWidth={2} />
        <text x={WAYPOINTS[0][0]} y={WAYPOINTS[0][1] + 4} textAnchor="middle" fill="rgba(74,222,128,0.7)" fontSize={9} fontFamily="monospace" fontWeight="bold">GO</text>

        <circle cx={WAYPOINTS[WAYPOINTS.length - 1][0]} cy={WAYPOINTS[WAYPOINTS.length - 1][1]} r={16} fill="rgba(196,77,255,0.12)" stroke="rgba(196,77,255,0.45)" strokeWidth={2} />
        <text x={WAYPOINTS[WAYPOINTS.length - 1][0]} y={WAYPOINTS[WAYPOINTS.length - 1][1] + 4} textAnchor="middle" fill="rgba(196,77,255,0.7)" fontSize={8} fontFamily="monospace" fontWeight="bold">END</text>
      </svg>

      <AnimatePresence>
        {completed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 bg-purple-500/75 backdrop-blur-sm text-white text-sm font-semibold px-6 py-2.5 rounded-full z-20 whitespace-nowrap"
          >
            You made it!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

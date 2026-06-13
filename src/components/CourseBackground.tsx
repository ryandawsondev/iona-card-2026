import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import confetti from 'canvas-confetti'

const VW = 1000
const VH = 620
const HALF_TRACK = 24
// Max % of total path the cursor can jump forward in a single mouse event.
// Prevents cutting across the canvas and entering a later pipe from the side.
const MAX_FORWARD_JUMP = 8

const WAYPOINTS: [number, number][] = [
  [40, 590], // 0  START
  [40, 280], // 1
  [130, 280], // 2
  [130, 40], // 3  CHECKPOINT 1
  [210, 40], // 4
  [210, 490], // 5
  [500, 490], // 6  CHECKPOINT 2
  [500, 580], // 7
  [820, 580], // 8  CHECKPOINT 3
  [820, 490], // 9
  [880, 490], // 10
  [880, 40], // 11 CHECKPOINT 4
  [940, 40], // 12
  [940, 590], // 13 END
]

const CHECKPOINTS = [3, 6, 8, 11]

const PATH_D = WAYPOINTS.map(
  ([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x},${y}`,
).join(' ')

interface Segment {
  ax: number
  ay: number
  bx: number
  by: number
  len: number
}

const SEGMENTS: Segment[] = WAYPOINTS.slice(0, -1).map(([ax, ay], i) => {
  const [bx, by] = WAYPOINTS[i + 1]
  return { ax, ay, bx, by, len: Math.hypot(bx - ax, by - ay) }
})

const TOTAL_LEN = SEGMENTS.reduce((s, seg) => s + seg.len, 0)

function perpAt(wpIdx: number): [number, number] {
  const s = SEGMENTS[wpIdx - 1]
  const len = Math.hypot(s.bx - s.ax, s.by - s.ay)
  return [-(s.by - s.ay) / len, (s.bx - s.ax) / len]
}

function nearestOnPath(px: number, py: number) {
  let minDist = Infinity
  let bestProgress = 0
  let accumulated = 0
  for (const seg of SEGMENTS) {
    const dx = seg.bx - seg.ax
    const dy = seg.by - seg.ay
    const lenSq = seg.len * seg.len
    const t =
      lenSq === 0
        ? 0
        : Math.max(
            0,
            Math.min(1, ((px - seg.ax) * dx + (py - seg.ay) * dy) / lenSq),
          )
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
    return {
      x: ((clientX - r.left) / r.width) * VW,
      y: ((clientY - r.top) / r.height) * VH,
    }
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
      const onTrack = dist <= HALF_TRACK

      // Advance progress only when on-track and not jumping too far ahead
      if (
        onTrack &&
        pct > maxProgressRef.current &&
        pct - maxProgressRef.current <= MAX_FORWARD_JUMP
      ) {
        maxProgressRef.current = pct
        setProgress(pct)
        if (progressPathRef.current) {
          progressPathRef.current.style.strokeDashoffset = String(
            TOTAL_LEN * (1 - pct / 100),
          )
        }
      }

      // Checkpoints: on-track only, in sequence
      if (onTrack && checkpointRef.current < CHECKPOINTS.length) {
        const [cx, cy] = WAYPOINTS[CHECKPOINTS[checkpointRef.current]]
        if (Math.hypot(pt.x - cx, pt.y - cy) < HALF_TRACK * 1.8) {
          checkpointRef.current++
          setCheckpointIdx(checkpointRef.current)
        }
      }

      // END: on-track, all checkpoints cleared, near finish
      const [fx, fy] = WAYPOINTS[WAYPOINTS.length - 1]
      if (
        onTrack &&
        checkpointRef.current >= CHECKPOINTS.length &&
        Math.hypot(pt.x - fx, pt.y - fy) < 35
      ) {
        completedRef.current = true
        setProgress(100)
        if (progressPathRef.current)
          progressPathRef.current.style.strokeDashoffset = '0'
        setCompleted(true)
        confetti({
          particleCount: 160,
          spread: 110,
          origin: { x: 0.93, y: 0.9 },
          colors: ['#ff6b9d', '#c44dff', '#ffd700', '#4fb8b2'],
        })
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.07, y: 0.9 },
          colors: ['#ff6b9d', '#c44dff', '#ffd700'],
        })
        onComplete?.()
        return
      }

      // Wall hit (off-track)
      if (!onTrack && !cooldownRef.current) {
        cooldownRef.current = true
        setHits((h) => h + 1)
        setTimeout(() => {
          cooldownRef.current = false
        }, 400)
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
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-white/5 z-10">
        <div
          className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Top-centre: hint → stats → completion */}
      <div className="absolute top-4 inset-x-0 flex justify-center z-20">
        <AnimatePresence mode="wait">
          {completed ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-stone-700 dark:text-stone-100">
                Course complete!
              </p>
              <p className="text-xs tracking-widest uppercase text-stone-500 dark:text-stone-400 mt-1">
                {hits} {hits === 1 ? 'hit' : 'hits'} · {CHECKPOINTS.length}/
                {CHECKPOINTS.length} checkpoints
              </p>
            </motion.div>
          ) : !started ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.6 }}
              className="text-sm font-medium tracking-widest uppercase text-stone-500 dark:text-stone-400"
            >
              navigate to GO ↙ to start the course
            </motion.p>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-10"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-700 dark:text-stone-200 leading-none">
                  {hits}
                </p>
                <p className="text-[9px] tracking-widest uppercase text-stone-500 dark:text-stone-400 mt-0.5">
                  hits
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-700 dark:text-stone-200 leading-none">
                  {checkpointIdx}
                  <span className="text-stone-400 dark:text-stone-500 text-base font-normal">
                    /{CHECKPOINTS.length}
                  </span>
                </p>
                <p className="text-[9px] tracking-widest uppercase text-stone-500 dark:text-stone-400 mt-0.5">
                  checkpoints
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
          <filter id="cpGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(148,163,184,0.09)"
          strokeWidth={HALF_TRACK * 2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          ref={progressPathRef}
          d={PATH_D}
          fill="none"
          stroke="url(#cgProgressGrad)"
          strokeWidth={HALF_TRACK * 2 - 10}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={TOTAL_LEN}
          strokeDashoffset={TOTAL_LEN}
        />
        <path
          d={PATH_D}
          fill="none"
          stroke="rgba(148,163,184,0.06)"
          strokeWidth={1}
          strokeDasharray="6 12"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {CHECKPOINTS.map((wpIdx, i) => {
          const [cx, cy] = WAYPOINTS[wpIdx]
          const [px, py] = perpAt(wpIdx)
          const passed = checkpointIdx > i
          const gr = HALF_TRACK + 10
          const x1 = cx - px * gr,
            y1 = cy - py * gr
          const x2 = cx + px * gr,
            y2 = cy + py * gr
          return (
            <g key={wpIdx}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={
                  passed ? 'rgba(196,77,255,0.75)' : 'rgba(148,163,184,0.28)'
                }
                strokeWidth={passed ? 2.5 : 1.5}
                strokeDasharray={passed ? undefined : '6 3'}
                strokeLinecap="round"
              />
              <circle
                cx={x1}
                cy={y1}
                r={3.5}
                fill={
                  passed ? 'rgba(196,77,255,0.85)' : 'rgba(148,163,184,0.35)'
                }
              />
              <circle
                cx={x2}
                cy={y2}
                r={3.5}
                fill={
                  passed ? 'rgba(196,77,255,0.85)' : 'rgba(148,163,184,0.35)'
                }
              />
              {passed && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={18}
                  fill="rgba(196,77,255,0.45)"
                  filter="url(#cpGlow)"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill={
                  passed ? 'rgba(196,77,255,0.38)' : 'rgba(148,163,184,0.07)'
                }
                stroke={
                  passed ? 'rgba(196,77,255,0.95)' : 'rgba(148,163,184,0.35)'
                }
                strokeWidth={passed ? 2 : 1.5}
                strokeDasharray={passed ? undefined : '5 3'}
              />
              <text
                x={cx}
                y={cy + 4}
                textAnchor="middle"
                fill={
                  passed ? 'rgba(255,255,255,0.95)' : 'rgba(148,163,184,0.55)'
                }
                fontSize={passed ? 11 : 9}
                fontFamily="monospace"
                fontWeight="bold"
              >
                {passed ? '✓' : i + 1}
              </text>
            </g>
          )
        })}

        <circle
          cx={WAYPOINTS[0][0]}
          cy={WAYPOINTS[0][1]}
          r={16}
          fill="rgba(74,222,128,0.12)"
          stroke="rgba(74,222,128,0.45)"
          strokeWidth={2}
        />
        <text
          x={WAYPOINTS[0][0]}
          y={WAYPOINTS[0][1] + 4}
          textAnchor="middle"
          fill="rgba(74,222,128,0.7)"
          fontSize={9}
          fontFamily="monospace"
          fontWeight="bold"
        >
          GO
        </text>

        <circle
          cx={WAYPOINTS[WAYPOINTS.length - 1][0]}
          cy={WAYPOINTS[WAYPOINTS.length - 1][1]}
          r={16}
          fill="rgba(196,77,255,0.12)"
          stroke="rgba(196,77,255,0.45)"
          strokeWidth={2}
        />
        <text
          x={WAYPOINTS[WAYPOINTS.length - 1][0]}
          y={WAYPOINTS[WAYPOINTS.length - 1][1] + 4}
          textAnchor="middle"
          fill="rgba(196,77,255,0.7)"
          fontSize={8}
          fontFamily="monospace"
          fontWeight="bold"
        >
          END
        </text>
      </svg>
    </motion.div>
  )
}

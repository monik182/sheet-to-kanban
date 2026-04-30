import { useState, useEffect } from 'react'

const TOTAL_SEGMENTS = 14
const CYCLE_MS = 2000

export function PixelLoadingBar() {
  const [filled, setFilled] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setFilled(prev => (prev >= TOTAL_SEGMENTS ? 0 : prev + 1))
    }, CYCLE_MS / TOTAL_SEGMENTS)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6">
      <p className="font-pixel text-xs text-[var(--foreground)]">Loading...</p>
      <div
        style={{
          display: 'inline-flex',
          padding: '4px',
          background: '#fff',
          boxShadow: `
            -4px 0 0 0 var(--foreground),
            4px 0 0 0 var(--foreground),
            0 4px 0 0 var(--foreground),
            0 -4px 0 0 var(--foreground),
            -4px -4px 0 0 var(--foreground),
            4px -4px 0 0 var(--foreground),
            -4px 4px 0 0 var(--foreground),
            4px 4px 0 0 var(--foreground)
          `,
          borderRadius: 0,
          gap: '2px',
        }}
      >
        {Array.from({ length: TOTAL_SEGMENTS }).map((_, i) => (
          <div
            key={i}
            style={{
              width: '16px',
              height: '24px',
              imageRendering: 'pixelated',
              background: i < filled
                ? `linear-gradient(
                    180deg,
                    #ffd4da 0%,
                    #ffd4da 25%,
                    #ffb3ba 25%,
                    #ffb3ba 75%,
                    #ff9aa4 75%,
                    #ff9aa4 100%
                  )`
                : `linear-gradient(
                    180deg,
                    #f0eded 0%,
                    #f0eded 25%,
                    #e5e2e2 25%,
                    #e5e2e2 75%,
                    #d9d6d6 75%,
                    #d9d6d6 100%
                  )`,
              transition: 'background 0.05s step-end',
            }}
          />
        ))}
      </div>
    </div>
  )
}

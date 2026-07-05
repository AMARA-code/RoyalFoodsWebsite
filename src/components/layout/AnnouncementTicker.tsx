'use client'

interface AnnouncementTickerProps {
  text: string
}

export default function AnnouncementTicker({ text }: AnnouncementTickerProps) {
  return (
    <div
      className="announcement-ticker relative overflow-hidden bg-[#0a0a0a] border-b-2 border-[#D62828] h-[var(--rf-header-ticker-h)]"
      role="marquee"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10" />

      <div className="announcement-ticker-track flex w-max h-full items-center">
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="announcement-ticker-content flex shrink-0 items-center"
            aria-hidden={copy === 1}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={`${copy}-${i}`}
                className="inline-flex items-center gap-3 px-8 text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-white"
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[#D62828] shrink-0 shadow-[0_0_6px_#D62828]" />
                {text}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

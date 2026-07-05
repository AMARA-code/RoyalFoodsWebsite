import LogoMark from '@/components/brand/LogoMark'

interface BrandLoaderProps {
  size?: number
  label?: string
  fullscreen?: boolean
}

export default function BrandLoader({
  size = 112,
  label = 'Royal Foods',
  fullscreen = true,
}: BrandLoaderProps) {
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF7F2]'
          : 'flex flex-col items-center justify-center py-20'
      }
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
    >
      <div className="flex items-center justify-center overflow-hidden rounded-full bg-white/70 p-2 shadow-[0_8px_30px_rgba(26,34,56,0.08)]">
        <LogoMark size={size} priority animated />
      </div>
      <p className="mt-4 text-sm font-semibold tracking-wide text-[#1A2238]">{label}</p>
    </div>
  )
}

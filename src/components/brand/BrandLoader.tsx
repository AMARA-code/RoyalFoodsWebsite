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
      <LogoMark size={size} priority animated />
      <p className="mt-4 text-sm font-semibold tracking-wide text-[#1A2238]">{label}</p>
    </div>
  )
}

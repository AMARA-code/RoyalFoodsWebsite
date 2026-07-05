import LogoMark from '@/components/brand/LogoMark'

interface BrandLoaderProps {
  size?: number
  label?: string
  fullscreen?: boolean
}

export default function BrandLoader({
  size = 170,
  label = 'Royal Foods',
  fullscreen = true,
}: BrandLoaderProps) {
  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-[#FAF7F2] p-0'
          : 'flex flex-col items-center justify-center py-20'
      }
      role="status"
      aria-live="polite"
      aria-label={`Loading ${label}`}
    >
      <div className="flex min-h-screen w-full items-center justify-center px-6 py-10">
        <div className="w-full rounded-[2rem] border border-gray-200 bg-white/95 shadow-[0_32px_120px_rgba(26,34,56,0.18)] backdrop-blur-sm p-10 md:p-16">
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex h-[220px] w-full max-w-[380px] items-center justify-center rounded-[2.5rem] bg-[#F8F3EE] shadow-[0_20px_80px_rgba(26,34,56,0.12)] p-8 mx-auto">
              <LogoMark size={size} priority animated />
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-semibold text-[#1A2238]">{label}</p>
              <p className="mt-4 text-base text-[#5a5a5a] sm:text-lg">
                Preparing the Royal Foods experience for you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

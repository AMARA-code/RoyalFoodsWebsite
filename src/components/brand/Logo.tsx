import Link from 'next/link'
import LogoMark from '@/components/brand/LogoMark'
import { ROYAL_FOODS } from '@/lib/constants'

interface LogoProps {
  size?: number
  showText?: boolean
  showSubtitle?: boolean
  href?: string | null
  className?: string
}

export default function Logo({
  size = 30,
  showText = true,
  showSubtitle = true,
  href = '/',
  className = '',
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={size} priority />
      {showText && (
        <div className="hidden sm:block leading-tight">
          <span className="font-bold text-[#1A2238] text-[15px]">{ROYAL_FOODS.name}</span>
          {showSubtitle && (
            <span className="block text-[11px] text-gray-500">{ROYAL_FOODS.specialty}</span>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="shrink-0" aria-label={`${ROYAL_FOODS.name} — home`}>
        {content}
      </Link>
    )
  }

  return <div className="shrink-0">{content}</div>
}

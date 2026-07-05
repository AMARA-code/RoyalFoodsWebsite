import Image from 'next/image'
import { ROYAL_FOODS } from '@/lib/constants'

interface LogoMarkProps {
  size?: number
  className?: string
  priority?: boolean
  animated?: boolean
}

export default function LogoMark({
  size = 40,
  className = '',
  priority = false,
  animated = false,
}: LogoMarkProps) {
  return (
    <Image
      src="/images/royal-foods-logo.png"
      alt={ROYAL_FOODS.name}
      width={size}
      height={size}
      className={[
        'h-auto w-auto rounded-full object-contain shadow-sm',
        animated ? 'rf-logo-loader' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      priority={priority}
      style={{ width: size, height: size }}
    />
  )
}

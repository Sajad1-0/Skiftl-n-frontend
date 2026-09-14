import Image from 'next/image';
import Link from 'next/link';
import { BRAND_MARK_PATH, BRAND_NAME } from '@/lib/brand';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  href?: string | null;
  size?: 'sm' | 'md' | 'lg';
  /**
   * Visa “SkiftLön” bredvid ikonen.
   * `responsive` = text synlig från md och upp (desktop), dold på mobil.
   */
  showWordmark?: boolean | 'responsive';
}

const sizeMap = {
  sm: { box: 'size-8', px: 32, text: 'text-sm' },
  md: { box: 'size-9', px: 36, text: 'text-base' },
  lg: { box: 'size-11', px: 44, text: 'text-lg' },
} as const;

export function Logo({
  className,
  href = '/',
  size = 'md',
  showWordmark = false,
}: LogoProps) {
  const dims = sizeMap[size];

  const wordmarkClass =
    showWordmark === 'responsive'
      ? 'hidden md:inline'
      : showWordmark
        ? 'inline'
        : 'hidden';

  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src={BRAND_MARK_PATH}
        alt=""
        width={dims.px}
        height={dims.px}
        className={cn(dims.box, 'object-contain')}
        priority
        aria-hidden
      />
      <span className={cn('font-semibold tracking-tight', dims.text, wordmarkClass)}>
        <span className="text-foreground">Skift</span>
        <span className="text-primary">Lön</span>
      </span>
      <span className="sr-only">{BRAND_NAME}</span>
    </span>
  );

  if (href === null) return content;

  return (
    <Link
      href={href}
      className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={BRAND_NAME}
    >
      {content}
    </Link>
  );
}

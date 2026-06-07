import Image from "next/image";
import { cn } from "@/lib/utils";

// Tight, transparent mark (cropped from /logo.png). Natural ratio ≈ 0.75 (w/h).
const MARK_SRC = "/logo-mark.png";
const MARK_RATIO = 457 / 610;

interface LogoProps {
  /** Mark height in px (width derives from the natural aspect ratio). */
  size?: number;
  /** Render the "Zor İK" wordmark next to the mark. */
  showText?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  /** Preload the image (use in above-the-fold headers). */
  priority?: boolean;
}

/**
 * Zor İK brand logo. Use `showText` for full lockups (header/footer/auth) and
 * mark-only for tight spots (collapsed sidebar, avatars).
 */
export function Logo({
  size = 28,
  showText = true,
  className,
  markClassName,
  textClassName,
  priority = false,
}: LogoProps) {
  const width = Math.round(size * MARK_RATIO);
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={MARK_SRC}
        alt="Zor İK"
        width={width}
        height={size}
        priority={priority}
        className={cn("object-contain shrink-0", markClassName)}
      />
      {showText && (
        <span className={cn("font-bold tracking-tight leading-none", textClassName)}>
          Zor İK
        </span>
      )}
    </span>
  );
}

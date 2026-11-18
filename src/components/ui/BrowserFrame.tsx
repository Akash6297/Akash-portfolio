import Image from 'next/image';
import type { ImageAsset } from '@/data/types';
import { cn, hostname } from '@/lib/utils';

interface BrowserFrameProps {
  image: ImageAsset;
  url?: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}

/** Minimal browser chrome around a real screenshot. */
export function BrowserFrame({ image, url, priority, sizes = '(min-width: 1024px) 60vw, 100vw', className, imageClassName }: BrowserFrameProps) {
  return (
    <figure className={cn('overflow-hidden rounded-lg border border-line bg-surface', className)}>
      <div className="flex h-8 items-center gap-3 border-b border-line px-3" aria-hidden>
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
          <span className="size-2 rounded-full bg-line-strong" />
        </span>
        {url && (
          <span className="mx-auto max-w-[60%] truncate rounded-sm bg-bg/60 px-3 py-0.5 font-mono text-[11px] text-subtle">
            {hostname(url)}
          </span>
        )}
      </div>
      <div className="relative overflow-hidden bg-bg" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn('object-cover object-top', imageClassName)}
        />
      </div>
    </figure>
  );
}

/** Phone-shaped frame for mobile screenshots. */
export function PhoneFrame({ image, className }: { image: ImageAsset; className?: string }) {
  return (
    <figure className={cn('mx-auto w-full max-w-[260px] overflow-hidden rounded-[28px] border border-line-strong bg-surface p-2', className)}>
      <div className="relative overflow-hidden rounded-[20px] bg-bg" style={{ aspectRatio: '390 / 760' }}>
        <Image src={image.src} alt={image.alt} fill sizes="260px" className="object-cover object-top" />
      </div>
    </figure>
  );
}

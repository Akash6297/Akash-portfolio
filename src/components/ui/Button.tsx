import Link from 'next/link';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'group inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98] select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-white',
  secondary: 'border border-line-strong bg-surface text-fg hover:border-subtle hover:bg-raised',
  ghost: 'text-muted hover:text-fg',
};

export function buttonClass(variant: Variant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: Variant;
  external?: boolean;
}

/** Link styled as a button. External links open in a new tab with safe rel attributes. */
export function ButtonLink({ href, variant = 'primary', external, className, children, ...rest }: ButtonLinkProps) {
  const cls = buttonClass(variant, className);
  if (external || href.startsWith('http') || href.startsWith('mailto:') || href.endsWith('.pdf')) {
    return (
      <a href={href} className={cls} {...(external || href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}

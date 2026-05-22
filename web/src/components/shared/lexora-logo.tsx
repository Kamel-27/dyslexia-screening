'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DysTestLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  /** If true wraps in a Link to "/" */
  linked?: boolean;
  /** Kept for backward-compat — unused */
  animate?: boolean;
  showText?: boolean;
}

const sizes = {
  sm: { box: 'w-7 h-7 rounded-lg',  icon: 'w-3.5 h-3.5', text: 'text-base' },
  md: { box: 'w-9 h-9 rounded-xl',  icon: 'w-4.5 h-4.5', text: 'text-xl'  },
  lg: { box: 'w-12 h-12 rounded-2xl', icon: 'w-6 h-6',   text: 'text-2xl' },
} as const;

export function LexoraLogo({
  className,
  size = 'md',
  linked = true,
  showText = true,
}: DysTestLogoProps) {
  const s = sizes[size];

  const inner = (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className={cn('flex items-center justify-center bg-indigo-600 shadow-sm', s.box)}>
        <Gamepad2 className={cn('text-white', s.icon)} />
      </span>
      {showText && (
        <span className={cn('font-bold tracking-tight text-slate-800', s.text)}>
          DysTest
        </span>
      )}
    </span>
  );

  if (linked) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {inner}
      </Link>
    );
  }

  return inner;
}

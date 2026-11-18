'use client';

import { useState } from 'react';
import * as m from 'motion/react-m';
import { CalendarDays, MessageSquare } from 'lucide-react';
import { ContactForm } from './ContactForm';
import { BookingForm } from './BookingForm';
import { cn } from '@/lib/utils';

/** Switches between the message form and the discovery-call booking form. */
export function ContactPanel({ email, bookingEnabled }: { email: string; bookingEnabled: boolean }) {
  const [tab, setTab] = useState<'message' | 'booking'>('message');

  if (!bookingEnabled) return <ContactForm email={email} />;

  const tabs = [
    { id: 'message' as const, label: 'Send a message', icon: MessageSquare },
    { id: 'booking' as const, label: 'Book a call', icon: CalendarDays },
  ];

  return (
    <div>
      <div role="tablist" aria-label="How would you like to get in touch?" className="mb-4 inline-flex rounded-md border border-line bg-surface p-1">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              id={`contact-tab-${t.id}`}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={`contact-panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn('relative inline-flex min-h-10 items-center gap-2 rounded-[6px] px-4 text-sm transition-colors', active ? 'text-fg' : 'text-muted hover:text-fg')}
            >
              {active && <m.span layoutId="contact-tab" className="absolute inset-0 -z-10 rounded-[6px] bg-raised" aria-hidden />}
              <t.icon className="size-4" aria-hidden />
              {t.label}
            </button>
          );
        })}
      </div>
      <div id={`contact-panel-${tab}`} role="tabpanel" aria-labelledby={`contact-tab-${tab}`}>
        {tab === 'message' ? <ContactForm email={email} /> : <BookingForm email={email} />}
      </div>
    </div>
  );
}

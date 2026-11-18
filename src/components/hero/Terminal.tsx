'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { cn } from '@/lib/utils';

export interface TerminalData {
  name: string;
  role: string;
  location: string;
  statement: string;
  availability: string;
  email: string;
  resume: string;
  socials: Array<{ label: string; href: string; handle: string }>;
  skills: Array<{ title: string; items: string[] }>;
  projects: Array<{ slug: string; name: string; tagline: string; category: string }>;
  experience: Array<{ period: string; role: string; company: string }>;
}

type Line = { id: number; kind: 'input' | 'output'; content: React.ReactNode };

const COMMANDS = ['help', 'about', 'skills', 'projects', 'experience', 'contact', 'resume', 'github', 'open', 'clear'] as const;
const CHIPS = ['help', 'about', 'skills', 'projects', 'experience', 'contact'] as const;

const Prompt = () => (
  <span className="select-none text-accent-strong">
    ~<span className="text-subtle"> $</span>
  </span>
);

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,7.5rem)_1fr] gap-x-3 sm:grid-cols-[9rem_1fr]">
      <span className="truncate text-subtle">{k}</span>
      <span className="min-w-0 text-fg/90">{v}</span>
    </div>
  );
}

export function Terminal({ data }: { data: TerminalData }) {
  const router = useRouter();
  const inputId = useId();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [trace, setTrace] = useState<{ run: number; label: string } | null>(null);
  const nextId = useRef(1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const github = data.socials.find((s) => s.label === 'GitHub');

  const run = useCallback(
    (raw: string): { output: React.ReactNode; records?: number } | 'clear' => {
      const [cmd = '', ...args] = raw.trim().split(/\s+/);
      switch (cmd.toLowerCase()) {
        case '':
          return { output: null };
        case 'help':
          return {
            records: COMMANDS.length,
            output: (
              <div className="space-y-0.5">
                <Row k="about" v="Who I am" />
                <Row k="skills" v="Technologies, grouped" />
                <Row k="projects" v="Selected work" />
                <Row k="open <n|slug>" v="Open a case study" />
                <Row k="experience" v="Where I've worked" />
                <Row k="contact" v="How to reach me" />
                <Row k="resume" v="Download my CV" />
                <Row k="github" v="Open-source profile" />
                <Row k="clear" v="Clear the screen (Ctrl+L)" />
              </div>
            ),
          };
        case 'about':
        case 'whoami':
          return {
            records: 1,
            output: (
              <div className="space-y-2">
                <p>
                  <span className="text-fg">{data.name}</span> — {data.role}
                </p>
                <p className="text-muted">{data.statement}</p>
                <div className="space-y-0.5">
                  <Row k="location" v={data.location} />
                  <Row k="status" v={<span className="text-live">{data.availability}</span>} />
                </div>
              </div>
            ),
          };
        case 'skills':
          return {
            records: data.skills.reduce((n, g) => n + g.items.length, 0),
            output: (
              <div className="space-y-1.5">
                {data.skills.map((g) => (
                  <div key={g.title}>
                    <span className="text-accent-strong">{g.title}</span>
                    <p className="text-muted">{g.items.join(' · ')}</p>
                  </div>
                ))}
              </div>
            ),
          };
        case 'projects':
        case 'ls':
          return {
            records: data.projects.length,
            output: (
              <div className="space-y-1">
                {data.projects.map((p, i) => (
                  <div key={p.slug} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
                    <span className="text-subtle">{String(i + 1).padStart(2, '0')}</span>
                    <span className="min-w-0">
                      <Link href={`/work/${p.slug}`} className="text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        {p.name}
                      </Link>
                      <span className="text-subtle"> — {p.category}</span>
                    </span>
                  </div>
                ))}
                <p className="pt-1 text-subtle">
                  Run <span className="text-fg">open 1</span> or click a name.
                </p>
              </div>
            ),
          };
        case 'open': {
          const target = args[0]?.toLowerCase();
          const byIndex = data.projects[Number(target) - 1];
          const project = byIndex ?? data.projects.find((p) => p.slug === target || p.name.toLowerCase() === target);
          if (!project) return { output: <p className="text-muted">Usage: open &lt;number|slug&gt; — run <span className="text-fg">projects</span> for the list.</p> };
          router.push(`/work/${project.slug}`);
          return { records: 1, output: <p className="text-muted">Opening {project.name}…</p> };
        }
        case 'experience':
          return {
            records: data.experience.length,
            output: (
              <div className="space-y-1">
                {data.experience.map((e) => (
                  <Row key={e.company + e.period} k={e.period} v={<><span className="text-fg">{e.role}</span><span className="text-subtle"> @ {e.company}</span></>} />
                ))}
              </div>
            ),
          };
        case 'contact':
          return {
            records: data.socials.length,
            output: (
              <div className="space-y-0.5">
                {data.socials.map((s) => (
                  <Row
                    key={s.label}
                    k={s.label.toLowerCase()}
                    v={<a href={s.href} className="underline decoration-line-strong underline-offset-4 hover:decoration-accent" {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{s.handle}</a>}
                  />
                ))}
                <p className="pt-1 text-subtle">
                  Or use the <a href="#contact" className="text-fg underline decoration-line-strong underline-offset-4">contact form</a>.
                </p>
              </div>
            ),
          };
        case 'resume':
        case 'cv':
          return {
            records: 1,
            output: (
              <p>
                <a href={data.resume} download className="text-fg underline decoration-accent underline-offset-4">Akash-Mandal-Resume.pdf</a>
                <span className="text-subtle"> — PDF, 2 pages</span>
              </p>
            ),
          };
        case 'github':
          return {
            records: 1,
            output: github ? (
              <a href={github.href} target="_blank" rel="noopener noreferrer" className="text-fg underline decoration-accent underline-offset-4">{github.href.replace('https://', '')}</a>
            ) : null,
          };
        case 'clear':
          return 'clear';
        case 'sudo':
          return { output: <p className="text-muted">Nice try. Run <span className="text-fg">contact</span> instead — no root required.</p> };
        default: {
          const guess = COMMANDS.find((c) => c.startsWith(cmd.toLowerCase().slice(0, 2)));
          return {
            output: (
              <p className="text-muted">
                command not found: <span className="text-fg">{cmd}</span>
                {guess ? <> — did you mean <span className="text-fg">{guess}</span>?</> : <> — type <span className="text-fg">help</span>.</>}
              </p>
            ),
          };
        }
      }
    },
    [data, github, router],
  );

  const execute = useCallback(
    (raw: string) => {
      const result = run(raw);
      if (result === 'clear') {
        setLines([]);
        setTrace(null);
        return;
      }
      setLines((prev) => [
        ...prev,
        { id: nextId.current++, kind: 'input', content: raw },
        ...(result.output ? [{ id: nextId.current++, kind: 'output' as const, content: result.output }] : []),
      ]);
      if (raw.trim()) {
        setHistory((h) => [...h.filter((x) => x !== raw.trim()), raw.trim()].slice(-30));
        const cmd = raw.trim().split(/\s+/)[0].toLowerCase();
        setTrace({
          run: nextId.current,
          label: result.records !== undefined ? `${cmd} → ${result.records} record${result.records === 1 ? '' : 's'}` : `${cmd} → no match`,
        });
      }
      setCursor(-1);
    },
    [run],
  );

  // Keep the newest output in view — scroll the terminal only, never the page.
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      execute(value);
      setValue('');
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      const next = cursor === -1 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    } else if (e.key === 'ArrowDown' && cursor !== -1) {
      e.preventDefault();
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue('');
      } else {
        setCursor(next);
        setValue(history[next]);
      }
    } else if (e.key === 'Tab' && value.trim() && !value.includes(' ')) {
      // Complete only when there's something to complete, so Tab still moves focus otherwise.
      const match = COMMANDS.find((c) => c.startsWith(value.trim().toLowerCase()));
      if (match && match !== value) {
        e.preventDefault();
        setValue(match + (match === 'open' ? ' ' : ''));
      }
    } else if (e.key.toLowerCase() === 'l' && e.ctrlKey) {
      e.preventDefault();
      execute('clear');
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-surface shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
      {/* Title bar */}
      <div className="flex h-9 items-center justify-between border-b border-line px-3.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="font-mono text-[11px] text-subtle">akash@portfolio: ~</span>
        <span className="font-mono text-[11px] text-subtle">zsh</span>
      </div>

      {/* Output */}
      <div
        ref={scroller}
        onClick={() => input.current?.focus({ preventScroll: true })}
        className="scroll-thin h-[300px] cursor-text overflow-y-auto px-4 py-3.5 font-mono text-[12.5px] leading-relaxed text-muted sm:h-[340px] sm:text-[13px]"
      >
        <div role="log" aria-live="polite" aria-label="Terminal output" className="space-y-2.5">
          <div>
            <p><Prompt /> <span className="text-fg">whoami</span></p>
            <p className="mt-1"><span className="text-fg">{data.name}</span> — {data.role}</p>
            <p className="text-subtle">{data.location}</p>
          </div>
          <p className="text-subtle">
            Type <span className="text-fg">help</span>, or tap a command below.
          </p>
          {lines.map((line) =>
            line.kind === 'input' ? (
              <p key={line.id}>
                <Prompt /> <span className="text-fg">{line.content}</span>
              </p>
            ) : (
              <div key={line.id}>{line.content}</div>
            ),
          )}
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <label htmlFor={inputId} className="shrink-0">
            <span aria-hidden><Prompt /></span>
            <span className="sr-only">Terminal command</span>
          </label>
          <input
            ref={input}
            id={inputId}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            placeholder="type a command…"
            className="min-w-0 flex-1 bg-transparent font-mono text-base text-fg caret-accent outline-none placeholder:text-subtle/70 sm:text-[13px]"
          />
        </div>
      </div>

      {/* Request trace: the real path a command takes through this component. */}
      <div className="flex items-center gap-3 border-t border-line px-4 py-2.5 font-mono text-[11px] text-subtle">
        <span className="hidden sm:inline">trace</span>
        <div className="flex flex-1 items-center gap-1.5" aria-hidden>
          {['ui', 'router', 'data'].map((node, i) => (
            <div key={node} className="flex flex-1 items-center gap-1.5 last:flex-none">
              <span className={cn('rounded-sm border px-1.5 py-0.5 transition-colors duration-300', trace ? 'border-accent/50 text-fg' : 'border-line-strong')}>
                {node}
              </span>
              {i < 2 && (
                <span className="relative h-px flex-1 bg-line-strong">
                  {trace && (
                    <m.span
                      key={`${trace.run}-${i}`}
                      className="absolute -top-[2px] size-[5px] rounded-full bg-accent"
                      initial={{ left: '0%', opacity: 1 }}
                      animate={{ left: '100%', opacity: [1, 1, 0] }}
                      transition={{ duration: 0.45, delay: i * 0.4, ease: 'easeInOut' }}
                    />
                  )}
                </span>
              )}
            </div>
          ))}
        </div>
        <span className="min-w-0 truncate text-right" aria-live="off">{trace ? trace.label : 'idle'}</span>
      </div>

      {/* Tap targets for touch users */}
      <div className="flex flex-wrap gap-1.5 border-t border-line px-3 py-2.5" role="group" aria-label="Run a terminal command">
        {CHIPS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => execute(c)}
            className="min-h-8 shrink-0 rounded-sm border border-line-strong px-2.5 font-mono text-[12px] text-muted transition-colors hover:border-subtle hover:text-fg"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

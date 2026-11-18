import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { ResumeDocument } from '@/components/resume/ResumeDocument';
import { PrintButton } from '@/components/resume/PrintButton';
import { getResumeAdmin } from '@/lib/resume';
import { publicResume } from '@/lib/resume-shared';
import { getProfile } from '@/lib/content';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();
  return {
    title: 'Resume',
    description: `Resume of ${profile.name}, ${profile.role}.`,
    alternates: { canonical: '/resume' },
  };
}

export default async function ResumePage() {
  const [{ resume }, profile] = await Promise.all([getResumeAdmin(), getProfile()]);
  const safe = publicResume(resume);
  if (!safe.personalInfo.address) safe.personalInfo.address = profile.location.label;

  return (
    <div className="min-h-screen bg-[#18181b] print:bg-white">
      <div className="sticky top-0 z-10 border-b border-line bg-bg/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-14 max-w-[210mm] items-center justify-between gap-3 px-4">
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted hover:text-fg">
            <ArrowLeft className="size-4" aria-hidden /> Portfolio
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={profile.resume.href}
              download={profile.resume.fileName}
              className="inline-flex min-h-9 items-center gap-2 rounded-md border border-line-strong px-3 text-sm text-fg hover:bg-raised"
            >
              <Download className="size-3.5" aria-hidden /> PDF
            </a>
            <PrintButton />
          </div>
        </div>
      </div>
      <main id="main" className="px-0 py-0 sm:px-4 sm:py-8 print:p-0">
        <div className="resume-scroll mx-auto max-w-[210mm] overflow-x-auto bg-white shadow-2xl print:max-w-none print:shadow-none">
          <ResumeDocument resume={safe} />
        </div>
      </main>
    </div>
  );
}

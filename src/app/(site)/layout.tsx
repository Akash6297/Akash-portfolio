import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getEducation, getExperience, getProfile } from '@/lib/content';
import { personJsonLd, websiteJsonLd, jsonLdScript } from '@/lib/structured-data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [profile, experience, education] = await Promise.all([getProfile(), getExperience(), getEducation()]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript([personJsonLd(profile, experience, education), websiteJsonLd()])}
      />
      <Header name={profile.name} resumeHref="/resume" socials={profile.socials} />
      <main id="main">{children}</main>
      <Footer profile={profile} />
    </>
  );
}

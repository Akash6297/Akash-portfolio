// Social and external profile links. Add or remove entries here; the header,
// footer, contact section and structured data all read from this list.

export interface Social {
  id: 'github' | 'linkedin' | 'email';
  label: string;
  handle: string;
  href: string;
}

export const socials: Social[] = [
  { id: 'github', label: 'GitHub', handle: '@Akash6297', href: 'https://github.com/Akash6297' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'in/akash-mandal07', href: 'https://www.linkedin.com/in/akash-mandal07/' },
  { id: 'email', label: 'Email', handle: 'akashmandal6297@gmail.com', href: 'mailto:akashmandal6297@gmail.com' },
];

export const githubUsername = 'Akash6297';

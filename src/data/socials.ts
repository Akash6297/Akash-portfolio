// Social links live in profile.socials (editable in the admin panel).
import { profile } from './profile';
import type { Social } from './types';

export type { Social };
export const socials: Social[] = profile.socials;

/** GitHub account shown in the open-source section. */
export const githubUsername = 'Akash6297';

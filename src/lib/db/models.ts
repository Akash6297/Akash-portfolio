import 'server-only';
import mongoose, { Schema, type Model } from 'mongoose';

// Collections shared with the previous Express site keep their names and fields, so
// existing admin accounts, messages, bookings, email templates and resume data carry over.
// Site content uses new `site_*` collections.

// Schemas are given explicit generics so TypeScript never has to infer types from the
// schema literals (Mongoose's inference is expensive enough to exhaust tsc's memory).
function model<T>(name: string, schema: Schema<T>, collection: string): Model<T> {
  return (mongoose.models[name] as Model<T> | undefined) ?? (mongoose.model(name, schema as Schema, collection) as unknown as Model<T>);
}

// ── Shared with the previous site ────────────────────────────────────────────

export interface UserDoc { _id: mongoose.Types.ObjectId; username: string; email: string; password: string }
export const User = model<UserDoc>(
  'User',
  new Schema<UserDoc>({ username: { type: String, required: true }, email: { type: String, required: true }, password: { type: String, required: true } }),
  'users',
);

export interface MessageDoc {
  _id: mongoose.Types.ObjectId;
  name: string; email: string; subject?: string; message: string;
  source?: 'contact' | 'whatsapp';
  isRead: boolean; replied: boolean;
  replies?: Array<{ text: string; sentAt: Date }>;
  createdAt: Date; updatedAt: Date;
}
export const Message = model<MessageDoc>(
  'Message',
  new Schema<MessageDoc>(
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      subject: String,
      message: { type: String, required: true },
      source: { type: String, default: 'contact' },
      isRead: { type: Boolean, default: false },
      replied: { type: Boolean, default: false },
      replies: [{ text: String, sentAt: Date }],
    },
    { timestamps: true },
  ),
  'messages',
);

export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';
export interface BookingDoc {
  _id: mongoose.Types.ObjectId;
  name: string; email: string; date: string; time: string; message: string;
  status: BookingStatus; meetingLink?: string; createdAt: Date;
}
export const Booking = model<BookingDoc>(
  'Booking',
  new Schema<BookingDoc>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // "10:00 AM"
    message: { type: String, default: 'No message provided' },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'completed'], default: 'pending' },
    meetingLink: String,
    createdAt: { type: Date, default: Date.now },
  }),
  'bookings',
);

export interface DaySchedule { maxBookings: number; slots: string[] }
export interface BookingSettingDoc { _id: mongoose.Types.ObjectId; weeklySchedule: Map<string, DaySchedule> | Record<string, DaySchedule>; updatedAt: Date }
export const BookingSetting = model<BookingSettingDoc>(
  'BookingSetting',
  new Schema<BookingSettingDoc>({
    weeklySchedule: { type: Map, of: new Schema<DaySchedule>({ maxBookings: Number, slots: [String] }, { _id: false }) },
    updatedAt: { type: Date, default: Date.now },
  }),
  'bookingsettings',
);

export interface EmailTemplateDoc { _id: mongoose.Types.ObjectId; templateName: string; subject: string; htmlContent: string; variables?: string[] }
export const EmailTemplate = model<EmailTemplateDoc>(
  'EmailTemplate',
  new Schema<EmailTemplateDoc>({ templateName: { type: String, required: true }, subject: { type: String, required: true }, htmlContent: { type: String, required: true }, variables: [String] }),
  'emailtemplates',
);

// The resume keeps the previous builder's shape; `privacy` is new.
export const Resume = model<Record<string, unknown>>('Resume', new Schema<Record<string, unknown>>({}, { strict: false, timestamps: true }), 'resumes');

// ── New ──────────────────────────────────────────────────────────────────────

export interface OtpDoc { userId: string; codeHash: string; expiresAt: Date; attempts: number }
export const Otp = model<OtpDoc>(
  'Otp',
  new Schema<OtpDoc>({ userId: { type: String, required: true }, codeHash: String, expiresAt: Date, attempts: { type: Number, default: 0 } }),
  'admin_otps',
);

/** Flexible documents for site content; fields are validated by the admin schemas. */
const contentSchema = () => new Schema<Record<string, unknown>>({ order: { type: Number, default: 0 } }, { strict: false, timestamps: true, minimize: false });

export const SiteProfile = model<Record<string, unknown>>('SiteProfile', contentSchema(), 'site_profile');
export const SiteProject = model<Record<string, unknown>>('SiteProject', contentSchema(), 'site_projects');
export const SiteExperience = model<Record<string, unknown>>('SiteExperience', contentSchema(), 'site_experience');
export const SiteEducation = model<Record<string, unknown>>('SiteEducation', contentSchema(), 'site_education');
export const SiteCertification = model<Record<string, unknown>>('SiteCertification', contentSchema(), 'site_certifications');
export const SiteAchievement = model<Record<string, unknown>>('SiteAchievement', contentSchema(), 'site_achievements');
export const SiteSkillGroup = model<Record<string, unknown>>('SiteSkillGroup', contentSchema(), 'site_skill_groups');
export const SiteService = model<Record<string, unknown>>('SiteService', contentSchema(), 'site_services');

export const contentModels = {
  projects: SiteProject,
  experience: SiteExperience,
  education: SiteEducation,
  certifications: SiteCertification,
  achievements: SiteAchievement,
  skills: SiteSkillGroup,
  services: SiteService,
} as const;

export type ContentCollection = keyof typeof contentModels;

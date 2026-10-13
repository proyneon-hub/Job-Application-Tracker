/**
 * A resume version the user sends out, e.g. "Frontend focus – v3".
 * The app keeps a name and an optional link to wherever the file lives;
 * it never stores the file itself.
 */
export type Resume = {
  id: string;
  name: string;
  linkUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** The fields a user can set when creating or editing a resume. */
export type ResumeInput = Omit<Resume, "id" | "createdAt" | "updatedAt">;

export type AttachmentKind = "pdf" | "text" | "code" | "image";

export const jobStatuses = [
  "Suggested",
  "Applied",
  "Under review",
  "Interviewing",
  "Rejected",
  "Accepted",
] as const;

export type JobStatus = (typeof jobStatuses)[number];

export interface Job {
  company: string;
  description: string;
  id: string;
  location: string;
  rationale: string;
  salary: string;
  stack: string[];
  title: string;
}

export interface Attachment {
  id: number;
  kind: AttachmentKind;
  name: string;
  size: string;
  url?: string;
}

export interface UserTurn {
  attachment: Attachment | null;
  id: number;
  role: "user";
  text: string;
}

export interface AgentTurn {
  html: string;
  id: number;
  isStreaming: boolean;
  jobIds?: string[];
  role: "agent";
}

export interface ThinkingTurn {
  id: number;
  role: "thinking";
}

export type Turn = AgentTurn | ThinkingTurn | UserTurn;

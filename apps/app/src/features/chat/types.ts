export type AttachmentKind = "pdf" | "text" | "code" | "image";

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
  role: "agent";
}

export interface ThinkingTurn {
  id: number;
  role: "thinking";
}

export type Turn = AgentTurn | ThinkingTurn | UserTurn;

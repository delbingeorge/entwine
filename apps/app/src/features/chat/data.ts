import type { Attachment, Thread } from "./types";

export const agentName = "Ellie";

export const currentThreadId = "t1";

export const threads: Thread[] = [
  { id: "t1", title: "Senior backend roles, remote", preview: "Go and Postgres · today" },
  { id: "t2", title: "Is 32L realistic for my level?", preview: "salary check · yesterday" },
  { id: "t3", title: "Bengaluru vs fully remote", preview: "location trade-offs · 3 days ago" },
  { id: "t4", title: "Resume review before applying", preview: "Delbin_George.pdf · last week" },
];

export const seededAttachment: Attachment = {
  id: 1,
  name: "contract-agreement brief.pdf",
  kind: "pdf",
  size: "2.3MB",
};

export const replies: { on: RegExp; html: string }[] = [
  {
    on: /cart|persist/i,
    html:
      "<p>The write path is covered; the read path is not. Nothing rehydrates the reducer on boot, so a reload still starts empty.</p>" +
      "<p>Add a hydration step before first render, and treat a malformed payload as an empty cart rather than a crash.</p>",
  },
  {
    on: /auth|session|cookie/i,
    html:
      "<p>The cookie is read in three places, so sign-out clears one and leaves two stale.</p>" +
      "<ol><li>Move the read behind a single <code>useSession()</code>.</li><li>Have sign-out invalidate that one source.</li><li>Delete the two direct readers.</li></ol>",
  },
  {
    on: /design system|token|hex/i,
    html: "<p>About 40% of the surfaces still carry hardcoded hex. The cheapest order is: map the hexes to existing tokens, fail the build on a raw hex in <code>src/components</code>, then migrate the stragglers.</p>",
  },
  {
    on: /ship|left|remain/i,
    html:
      "<p>Three things, roughly in order of risk:</p>" +
      "<ol><li><strong>The cart has no persistence.</strong> Reload and it empties.</li>" +
      "<li><strong>Auth reads the cookie in three places</strong>, so signing out leaves stale UI behind.</li>" +
      "<li>The design system is half tokens and half hardcoded hex.</li></ol>" +
      "<p>The first two are user-visible. The third is only going to get more expensive to leave.</p>",
  },
];

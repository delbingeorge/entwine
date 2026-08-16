import type { CoachingTab } from "@/shared/lib/coaching-tabs";

export interface Scenario {
  id: string;
  isTailored?: boolean;
  subtitle: string;
  title: string;
}

export const scenariosByTab: Record<CoachingTab, Scenario[]> = {
  Negotiation: [
    {
      id: "raise",
      title: "Ask for a raise at your current job",
      subtitle: "Practise the internal conversation that most people botch.",
    },
    {
      id: "lowball",
      title: "Counter a lowball offer",
      subtitle: "The number is too low. Now what?",
    },
    {
      id: "equity",
      title: "Negotiate equity in your offer",
      subtitle: "RSUs, options, vesting. Get the equity right.",
    },
    {
      id: "salary",
      title: "Practise negotiating your salary",
      subtitle: "Got a new offer? Don't leave money on the table.",
    },
  ],
  "Interview practice": [
    {
      id: "from-post",
      title: "Mock interview from a job description",
      subtitle: "Paste the job description and Ellie tailors the interview to that exact role.",
      isTailored: true,
    },
    {
      id: "behavioural",
      title: "Practise tough behavioural questions",
      subtitle: "STAR drilling on the questions everyone fumbles.",
    },
    {
      id: "story",
      title: "Practise telling your story",
      subtitle: 'The "walk me through your CV" answer, tightened.',
    },
    {
      id: "hiring-manager",
      title: "Practise the hiring manager screen",
      subtitle: "Second-round style, deeper than the recruiter call.",
    },
    {
      id: "mock",
      title: "Take a mock interview",
      subtitle: "You finally got the interview. Now what?",
    },
  ],
  "Your own": [
    {
      id: "custom",
      title: "Create your own",
      subtitle: "Set up a custom session with your goal and your script.",
    },
  ],
};

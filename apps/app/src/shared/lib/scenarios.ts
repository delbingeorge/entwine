import type { CoachingTab } from "./coaching-tabs";

export interface Scenario {
  id: string;
  placeholder: string;
  isTailored?: boolean;
  subtitle: string;
  title: string;
}

export const scenariosByTab: Record<CoachingTab, Scenario[]> = {
  Negotiation: [
    {
      id: "raise",
      placeholder: "Open the way you would with your manager…",
      title: "Ask for a raise at your current job",
      subtitle: "Practise the internal conversation that most people botch.",
    },
    {
      id: "lowball",
      placeholder: "Tell Ellie what they offered, then push back…",
      title: "Counter a lowball offer",
      subtitle: "The number is too low. Now what?",
    },
    {
      id: "equity",
      placeholder: "Share the equity terms you were given…",
      title: "Negotiate equity in your offer",
      subtitle: "RSUs, options, vesting. Get the equity right.",
    },
    {
      id: "salary",
      placeholder: "Name your number, then defend it…",
      title: "Practise negotiating your salary",
      subtitle: "Got a new offer? Don't leave money on the table.",
    },
  ],
  "Interview practice": [
    {
      id: "from-post",
      placeholder: "Paste the job description to begin…",
      title: "Mock interview from a job description",
      subtitle: "Paste the job description and Ellie tailors the interview to that exact role.",
      isTailored: true,
    },
    {
      id: "behavioural",
      placeholder: "Answer as you would in the room…",
      title: "Practise tough behavioural questions",
      subtitle: "STAR drilling on the questions everyone fumbles.",
    },
    {
      id: "story",
      placeholder: "Walk Ellie through your CV…",
      title: "Practise telling your story",
      subtitle: 'The "walk me through your CV" answer, tightened.',
    },
    {
      id: "hiring-manager",
      placeholder: "Introduce yourself to the hiring manager…",
      title: "Practise the hiring manager screen",
      subtitle: "Second-round style, deeper than the recruiter call.",
    },
  ],
};

export const mainPlaceholder = "Attach your resume, or tell me what you're looking for…";

const byTitle = new Map(
  Object.values(scenariosByTab)
    .flat()
    .map((scenario) => [scenario.title, scenario.placeholder]),
);

export const placeholderFor = (isCoaching: boolean, title: string) => {
  if (!isCoaching) {
    return mainPlaceholder;
  }

  return byTitle.get(title) ?? "Say your opening line…";
};

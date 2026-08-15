import type { Job } from "./types";

export const jobs: Job[] = [
  {
    id: "j1",
    title: "Senior Product Engineer",
    company: "Ferrite",
    salary: "₹30–45L",
    location: "Remote",
    stack: ["TypeScript", "Go", "PostgreSQL"],
    rationale:
      "Fully remote, TypeScript and Go on real-time telemetry — matches your stack and your interest in systems where correctness matters. Salary clears your floor by a good margin.",
    description:
      "Ferrite builds telemetry infrastructure for industrial equipment. You would own the ingestion path end to end: a Go service taking several million events an hour, and the TypeScript dashboards operators watch. Seven engineers, no separate QA, everyone on call one week in seven. They care more about how you reason about failure than about which frameworks you have used.",
  },
  {
    id: "j2",
    title: "Backend Engineer",
    company: "Nilenso",
    salary: "₹28–38L",
    location: "Bengaluru · Hybrid",
    stack: ["Go", "PostgreSQL", "Kubernetes"],
    rationale:
      "A worker-owned consultancy that takes correctness seriously. Slightly under your ideal salary at the low end, but the ceiling clears it and the work is closest to what you said you want to build.",
    description:
      "Nilenso is an employee-owned software consultancy in Bengaluru. Backend engineers rotate across client projects, mostly Go and Postgres, with a strong testing culture and genuine pairing. Three days a week in the office. They publish their salary formula openly and there is no negotiation on it.",
  },
  {
    id: "j3",
    title: "Platform Engineer",
    company: "Hasura",
    salary: "₹32–50L",
    location: "Remote",
    stack: ["Go", "PostgreSQL", "Kubernetes", "GraphQL"],
    rationale:
      "The highest ceiling of the three and fully remote. Heavier Kubernetes than you listed, which is the one gap worth thinking about before you talk to them.",
    description:
      "Hasura's platform team runs the infrastructure behind their managed GraphQL offering. The work is Go services, Postgres at scale, and a large Kubernetes footprint across regions. Fully remote within India. Expect a systems-design interview that goes deep on data consistency.",
  },
];

export const jobById = (id: string) => jobs.find((job) => job.id === id);

export const jobReplies: { on: RegExp; html: string }[] = [
  {
    on: /salary|pay|comp|ctc|lpa/i,
    html: "<p>The band is what the company published, not a guess. The lower half usually goes to people who need visa or notice-period accommodation; you need neither, so plan to anchor above the midpoint.</p>",
  },
  {
    on: /remote|office|hybrid|location/i,
    html: "<p>Take the location line literally — where a company writes hybrid it means hybrid, and asking to bend it in the first conversation rarely lands well. Worth raising once you have an offer.</p>",
  },
  {
    on: /interview|process|round|prepare/i,
    html: "<p>Expect three or four rounds: a screen, something technical close to the day job, a systems conversation, and a values round. The technical round here tends to be a real problem rather than puzzles.</p>",
  },
  {
    on: /team|culture|people|manage/i,
    html: "<p>Small enough that you will know everyone within a month. Ask who reviews your code and how often they deploy — the answers tell you more about the culture than anything on the careers page.</p>",
  },
];

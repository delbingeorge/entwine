import { FileTextIcon } from "@solar-icons/react/linear/file-text";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";

import { PageHeading } from "@/shared/components/page-heading";

import { SourceOption } from "./source-option";

import type { ProfileSource } from "../types";
import type { Icon } from "@solar-icons/react/lib/types";

interface SourceStepProps {
  onChoose: (source: ProfileSource) => void;
}

const sources: { description: string; icon: Icon; label: string; source: ProfileSource }[] = [
  {
    source: "resume",
    icon: FileTextIcon,
    label: "Upload your resume",
    description: "Drop the file. We read it and fill everything in. About ten seconds.",
  },
  {
    source: "manual",
    icon: PenNewSquareIcon,
    label: "Fill it in yourself",
    description: "A few short questions. About two minutes.",
  },
];

export const SourceStep = ({ onChoose }: SourceStepProps) => (
  <section>
    <PageHeading subtitle="Whichever is quicker for you." title="Set up your profile" />
    <ul className="mt-8 flex flex-col gap-2">
      {sources.map((entry) => (
        <SourceOption
          description={entry.description}
          icon={entry.icon}
          key={entry.source}
          label={entry.label}
          onSelect={() => {
            onChoose(entry.source);
          }}
        />
      ))}
    </ul>
    <p className="mt-6 text-sm text-ink-muted">Importing this from LinkedIn is coming soon.</p>
  </section>
);

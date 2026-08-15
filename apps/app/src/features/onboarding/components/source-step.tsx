import { FileTextIcon } from "@solar-icons/react/linear/file-text";
import { PenNewSquareIcon } from "@solar-icons/react/linear/pen-new-square";

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
    description: "PDF or DOCX. We read it and fill this in for you.",
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
    <h1 className="text-3xl text-ink">LinkedIn sent us a headshot</h1>
    <p className="text-3xl text-ink-muted">
      We asked for your experience. That is all it would give us.
    </p>
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
  </section>
);

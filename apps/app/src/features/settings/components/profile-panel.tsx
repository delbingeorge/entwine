import { useEffect, useState } from "react";

import { getProfileDetail, emptyDetail, type ProfileDetail } from "@/shared/lib/profile-detail-api";

import { formatPeriod } from "../lib/format-period";

const SectionHeading = ({ children }: { children: string }) => (
  <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">{children}</h2>
);

const Empty = ({ children }: { children: string }) => (
  <p className="text-[12.5px] leading-relaxed text-composer-placeholder">{children}</p>
);

export const ProfilePanel = () => {
  const [detail, setDetail] = useState<ProfileDetail>(emptyDetail);
  const [isLoading, setIsLoading] = useState(true);
  const [failure, setFailure] = useState<string | null>(null);

  useEffect(() => {
    getProfileDetail()
      .then(setDetail)
      .catch(() => {
        setFailure("Could not load your profile.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <Empty>Loading…</Empty>;
  }

  if (failure !== null) {
    return (
      <p className="text-[12.5px] leading-relaxed text-composer-soft" role="alert">
        {failure}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <section>
        <SectionHeading>EXPERIENCE</SectionHeading>
        {detail.experiences.length === 0 ? (
          <Empty>Nothing here yet. Share your resume with Ellie and she will fill this in.</Empty>
        ) : (
          <div className="flex flex-col gap-5">
            {detail.experiences.map((experience) => (
              <div
                className="flex flex-col gap-1.5"
                key={`${experience.company}-${experience.startDate}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="min-w-0 text-[13.5px] text-composer-ink">
                    {experience.position} · {experience.company}
                  </p>
                  <p className="shrink-0 font-mono text-[11px] text-composer-placeholder">
                    {formatPeriod(experience.startDate, experience.endDate)}
                  </p>
                </div>
                {experience.location === undefined ? null : (
                  <p className="text-[12px] text-composer-soft">{experience.location}</p>
                )}
                {experience.highlights.length === 0 ? null : (
                  <ul className="flex list-disc flex-col gap-1 pl-4 text-[12.5px] leading-relaxed text-composer-soft">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                )}
                {experience.tech.length === 0 ? null : (
                  <p className="font-mono text-[11px] text-composer-placeholder">
                    {experience.tech.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-composer-line pt-7">
        <SectionHeading>EDUCATION</SectionHeading>
        {detail.educations.length === 0 ? (
          <Empty>No education on file.</Empty>
        ) : (
          <div className="flex flex-col gap-4">
            {detail.educations.map((education) => (
              <div
                className="flex items-baseline justify-between gap-3"
                key={education.institution}
              >
                <p className="min-w-0 text-[13.5px] text-composer-ink">
                  {education.institution}
                  {education.area === undefined ? "" : ` · ${education.area}`}
                </p>
                <p className="shrink-0 font-mono text-[11px] text-composer-placeholder">
                  {formatPeriod(education.startDate, education.endDate)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-composer-line pt-7">
        <SectionHeading>SKILLS</SectionHeading>
        {detail.skills.length === 0 ? (
          <Empty>No skills on file.</Empty>
        ) : (
          <div className="flex flex-wrap gap-2">
            {detail.skills.map((skill) => (
              <span
                className="rounded-full border border-composer-line px-3 py-1 text-[12px] text-composer-soft"
                key={skill.name}
              >
                {skill.name}
                {skill.years === undefined ? "" : ` · ${String(skill.years)}y`}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

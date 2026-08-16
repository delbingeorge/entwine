import entwineLogo from "@/assets/entwine-logo.svg";

const buildDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date(__APP_BUILT_AT__));

const canDo = [
  "Read your resume and keep your experience, education and skills up to date",
  "Talk through what you want next, and what a role is really offering",
  "Rehearse salary conversations and interviews, by voice or by typing",
];

const cannotDo = [
  "Apply to jobs on your behalf",
  "Introduce you to a company or speak to a recruiter for you",
  "See anything about you that you have not told her or shared in your resume",
];

const stored = [
  ["Your profile", "Level, stack, locations, salary floor and what you want to build"],
  ["Your resume", "The experience, education and skills read from the file you shared"],
  ["Your chats", "Every conversation with Ellie, so you can pick them up later"],
];

const Heading = ({ children }: { children: string }) => (
  <h2 className="pb-4 text-[11px] tracking-widest text-composer-placeholder">{children}</h2>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="flex list-disc flex-col gap-1.5 pl-4 text-[12.5px] leading-relaxed text-composer-soft">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export const AboutPanel = () => (
  <div className="flex flex-col gap-7">
    <section>
      <img alt="Entwine" className="h-8 w-auto dark:invert" src={entwineLogo} />
      <p className="pt-4 text-[13px] leading-relaxed text-composer-soft">
        Entwine is a job search you talk to. Ellie reads your resume, learns what you are actually
        looking for, and finds engineering roles across India and South-East Asia with the salary
        shown upfront.
      </p>
    </section>

    <section className="border-t border-composer-line pt-7">
      <Heading>WHAT ELLIE DOES</Heading>
      <Bullets items={canDo} />

      <p className="pt-5 pb-3 text-[11px] tracking-widest text-composer-placeholder">
        WHAT SHE DOES NOT
      </p>
      <Bullets items={cannotDo} />
    </section>

    <section className="border-t border-composer-line pt-7">
      <Heading>YOUR DATA</Heading>
      <div className="flex flex-col">
        {stored.map(([label, detail]) => (
          <div
            className="flex flex-col gap-0.5 border-b border-composer-line py-3 last:border-b-0"
            key={label}
          >
            <p className="text-[13px] text-composer-ink">{label}</p>
            <p className="text-[12.5px] leading-relaxed text-composer-soft">{detail}</p>
          </div>
        ))}
      </div>
      <p className="pt-4 text-[12.5px] leading-relaxed text-composer-soft">
        Your resume file is not kept after it is read. Deleting a chat deletes its messages with it.
      </p>
    </section>

    <section className="border-t border-composer-line pt-7">
      <Heading>BUILD</Heading>
      <div className="flex flex-col font-mono text-[12px]">
        {[
          ["VERSION", __APP_VERSION__],
          ["BUILT", buildDate],
        ].map(([label, value]) => (
          <div
            className="flex items-baseline justify-between gap-4 border-b border-composer-line py-2.5 last:border-b-0"
            key={label}
          >
            <span className="tracking-widest text-composer-placeholder">{label}</span>
            <span className="text-composer-ink">{value}</span>
          </div>
        ))}
      </div>
    </section>

    <section className="border-t border-composer-line pt-7">
      <p className="text-[12.5px] leading-relaxed text-composer-soft">
        An{" "}
        <a
          className="text-composer-ink underline decoration-composer-line decoration-2 underline-offset-4 transition-colors hover:decoration-composer-ink"
          href="https://octane.team/"
          rel="noreferrer"
          target="_blank"
        >
          Octane Innovations
        </a>{" "}
        product. Made with love in Kerala and India.
      </p>
    </section>
  </div>
);

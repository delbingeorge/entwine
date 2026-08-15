import { SplitLayout } from "@/shared/components/split-layout";

import { LinkedInButton } from "./linkedin-button";

export const EngineerSignIn = () => (
  <SplitLayout>
    <section>
      <h1 className="text-3xl text-ink">Find your next role</h1>
      <p className="text-3xl text-ink-muted">Salary upfront, and a reason for every match.</p>
      <div className="mt-10">
        <LinkedInButton />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        We read your experience from LinkedIn so you skip the form.
      </p>
    </section>
  </SplitLayout>
);

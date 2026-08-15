import { PageHeading } from "@/shared/components/page-heading";
import { SplitLayout } from "@/shared/components/split-layout";

import { LinkedInButton } from "./linkedin-button";

export const EngineerSignIn = () => (
  <SplitLayout>
    <section>
      <PageHeading
        subtitle="Salary upfront, and a reason for every match."
        title="Find your next role"
      />
      <div className="mt-10">
        <LinkedInButton />
      </div>
      <p className="mt-4 text-sm text-ink-muted">
        Sign in first. Setting up your profile takes about a minute after that.
      </p>
    </section>
  </SplitLayout>
);

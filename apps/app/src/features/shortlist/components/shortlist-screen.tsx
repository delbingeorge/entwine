import { PageHeading } from "@/shared/components/page-heading";
import { SplitLayout } from "@/shared/components/split-layout";

export const ShortlistScreen = () => (
  <SplitLayout>
    <section>
      <PageHeading subtitle="Nothing to show yet." title="Your shortlist" />
      <p className="mt-10 text-sm text-ink-muted">
        Your profile is saved. Roles start arriving once matching is switched on.
      </p>
    </section>
  </SplitLayout>
);

import { PageHeading } from "@/shared/components/page-heading";
import { SplitLayout } from "@/shared/components/split-layout";

export const CompanySignIn = () => (
  <SplitLayout>
    <section>
      <PageHeading subtitle="Not open yet." title="Hire with Entwine" />
      <p className="mt-10 text-sm text-ink-muted">
        Entwine is building the engineer side first. The hiring side opens once there are people
        worth introducing you to.
      </p>
    </section>
  </SplitLayout>
);

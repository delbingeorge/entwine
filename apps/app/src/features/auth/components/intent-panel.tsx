import { PageHeading } from "@/shared/components/page-heading";

import { IntentLink } from "./intent-link";

export const IntentPanel = () => (
  <section>
    <PageHeading
      subtitle={
        <>
          Are you <IntentLink to="/for-engineers">looking</IntentLink>, or{" "}
          <IntentLink to="/for-companies">hiring</IntentLink>?
        </>
      }
      title="Get started"
    />
  </section>
);

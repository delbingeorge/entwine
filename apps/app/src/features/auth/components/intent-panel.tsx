import { IntentLink } from "./intent-link";

export const IntentPanel = () => (
  <section>
    <h1 className="text-3xl text-ink">Get started</h1>
    <p className="text-3xl text-ink-muted">
      Are you <IntentLink to="/for-engineers">looking</IntentLink>, or{" "}
      <IntentLink to="/for-hirers">hiring</IntentLink>?
    </p>
  </section>
);

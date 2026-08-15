import { AuthLayout } from "./auth-layout";
import { LinkedInButton } from "./linkedin-button";

export const EngineerSignIn = () => (
  <AuthLayout>
    <section>
      <h1 className="text-3xl text-ink">Find your next role</h1>
      <p className="text-3xl text-ink-muted">We do the searching. You focus on what’s next.</p>
      <div className="mt-6">
        <LinkedInButton />
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        We read your experience from LinkedIn so you skip the form.
      </p>
    </section>
  </AuthLayout>
);

import { env } from "@/shared/lib/env";

const LandingPage = () => (
  <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-2 px-6">
    <a href={env.NEXT_PUBLIC_APP_URL} className="text-2xl font-medium">
      Entwine Landing Page
    </a>
  </main>
);

export default LandingPage;

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-2 px-6">
      <h1 className="text-2xl font-medium">Entwine</h1>
    </main>
  );
}

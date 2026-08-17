import { SolarProvider } from "@solar-icons/react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import { VoiceCallProvider } from "@/features/voice";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <SolarProvider color="currentColor" size={20} strokeWidth={1.5}>
      <div className="min-h-screen bg-surface text-ink">
        <VoiceCallProvider>
          <Outlet />
        </VoiceCallProvider>
      </div>
    </SolarProvider>
  );
}

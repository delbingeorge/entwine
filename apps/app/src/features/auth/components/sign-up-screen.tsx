import { AuthPlate } from "./auth-plate";
import { AuthTopBar } from "./auth-top-bar";
import { IntentPanel } from "./intent-panel";

export const SignUpScreen = () => (
  <div className="grid min-h-screen lg:grid-cols-2">
    <div className="flex flex-col px-8 lg:px-14">
      <AuthTopBar />
      <main className="flex flex-1 items-end pb-14">
        <div className="w-full max-w-md">
          <IntentPanel />
        </div>
      </main>
    </div>
    <AuthPlate />
  </div>
);

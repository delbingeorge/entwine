import { Suspense, lazy, useState } from "react";

import entwineLogo from "@/assets/entwine-logo.svg";

const LottiePlayer = lazy(() => import("lottie-react"));

const StaticMark = () => (
  <img alt="" className="h-9 w-auto hover:cursor-pointer dark:invert" src={entwineLogo} />
);

export const BrandMark = () => {
  const [animation, setAnimation] = useState<unknown>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = async () => {
    if (isPlaying) {
      return;
    }

    const data = animation ?? (await import("@/assets/entwine-write.lottie.json")).default;

    setAnimation(data);
    setIsPlaying(true);
  };

  return (
    <button
      aria-label="Entwine"
      className="flex h-8 w-fit items-center"
      onClick={() => {
        void play();
      }}
      type="button"
    >
      {isPlaying && animation !== null ? (
        <Suspense fallback={<StaticMark />}>
          <LottiePlayer
            animationData={animation}
            className="h-9 w-auto hover:cursor-pointer dark:invert"
            loop={false}
            onComplete={() => {
              setIsPlaying(false);
            }}
          />
        </Suspense>
      ) : (
        <StaticMark />
      )}
    </button>
  );
};

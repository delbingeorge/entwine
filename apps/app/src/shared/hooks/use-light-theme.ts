import { useLayoutEffect } from "react";

import { lockLightTheme, unlockTheme } from "@/shared/lib/theme";

export const useLightTheme = (isLocked: boolean) => {
  useLayoutEffect(() => {
    if (!isLocked) {
      return undefined;
    }

    lockLightTheme();

    return unlockTheme;
  }, [isLocked]);
};

export interface PlatePhotographer {
  name: string;
  profile: string;
}

interface PlateCreditProps {
  photographers: PlatePhotographer[];
}

const linkClass =
  "pointer-events-auto underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/70";

const unsplashLink = (
  <a className={linkClass} href="https://unsplash.com" rel="noreferrer" target="_blank">
    Unsplash
  </a>
);

export const PlateCredit = ({ photographers }: PlateCreditProps) => (
  <p className="pointer-events-none absolute inset-x-0 bottom-0 z-4 bg-gradient-to-t from-black/45 to-transparent px-6 pt-10 pb-5 text-right text-[11px] tracking-wide text-white/65 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
    {photographers.length === 0 ? (
      <>Photography from {unsplashLink}</>
    ) : (
      <>
        Photography by{" "}
        {photographers.map((photographer, index) => (
          <span key={photographer.profile}>
            {index === 0 ? "" : index === photographers.length - 1 ? " and " : ", "}
            <a className={linkClass} href={photographer.profile} rel="noreferrer" target="_blank">
              {photographer.name}
            </a>
          </span>
        ))}{" "}
        on {unsplashLink}
      </>
    )}
  </p>
);

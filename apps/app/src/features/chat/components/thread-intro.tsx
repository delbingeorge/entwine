import { useRiseIn } from "../hooks/use-rise-in";

interface ThreadIntroProps {
  eyebrow: string;
  title: string;
}

export const ThreadIntro = ({ eyebrow, title }: ThreadIntroProps) => {
  const riseRef = useRiseIn();

  return (
    <div
      className="max-h-48 overflow-hidden opacity-100 transition-all duration-500 ease-out"
      data-flip-id="intro"
    >
      <div className="flex flex-col items-start text-left font-ui" ref={riseRef}>
        <p className="text-[17px] text-composer-soft">{eyebrow}</p>
        <h1 className="text-[30px] leading-[1.15] font-medium tracking-tight text-composer-ink">
          {title}
        </h1>
      </div>
    </div>
  );
};

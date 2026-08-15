import { motion, useReducedMotion } from "motion/react";

interface BlurTextProps {
  as?: "h1" | "p" | "span";
  className?: string;
  delay?: number;
  text: string;
}

const container = (delay: number) => ({
  hidden: {},
  shown: { transition: { delayChildren: delay, staggerChildren: 0.045 } },
});

const word = {
  hidden: { filter: "blur(8px)", opacity: 0, y: 8 },
  shown: {
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export const BlurText = ({ as = "p", className, delay = 0, text }: BlurTextProps) => {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  if (prefersReducedMotion === true) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag animate="shown" className={className} initial="hidden" variants={container(delay)}>
      {text.split(" ").map((entry, index) => (
        <motion.span
          className="inline-block whitespace-pre"
          key={`${entry}-${String(index)}`}
          variants={word}
        >
          {entry}
          {index === text.split(" ").length - 1 ? "" : " "}
        </motion.span>
      ))}
    </Tag>
  );
};

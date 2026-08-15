import { useLayoutEffect, useRef } from "react";

import { gsap } from "gsap";

import { prefersReducedMotion } from "@/shared/lib/reduced-motion";

interface BlurTextProps {
  as?: "h1" | "p" | "span";
  className?: string;
  delay?: number;
  text: string;
}

export const BlurText = ({ as = "p", className, delay = 0, text }: BlurTextProps) => {
  const rootRef = useRef<HTMLHeadingElement & HTMLParagraphElement & HTMLSpanElement>(null);
  const Tag = as;
  const words = text.split(" ");

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (root === null || prefersReducedMotion()) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.from(root.querySelectorAll("span"), {
        autoAlpha: 0,
        filter: "blur(8px)",
        y: 8,
        delay,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.045,
      });
    }, root);

    return () => {
      context.revert();
    };
  }, [delay, text]);

  return (
    <Tag className={className} ref={rootRef}>
      {words.map((entry, index) => (
        <span className="inline-block whitespace-pre" key={`${entry}-${String(index)}`}>
          {entry}
          {index === words.length - 1 ? "" : " "}
        </span>
      ))}
    </Tag>
  );
};

"use client";

import { MotionConfig, motion } from "motion/react";

export const EASE = [0.22, 0.9, 0.28, 1];

export function rise(delay = 0, distance = 18) {
  return {
    initial: { opacity: 0, y: distance },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.1 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

export function Rise({ children, delay = 0, distance = 18, ...rest }) {
  return (
    <motion.div {...rest} {...rise(delay, distance)}>
      {children}
    </motion.div>
  );
}

export default function MotionRoot({ children }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

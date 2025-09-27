/* eslint-disable no-unused-vars */
// src/components/motion/PageTransition.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const variants = {
  initial: (reduced) => ({
    opacity: 0,
    y: reduced ? 0 : 8,
    scale: reduced ? 1 : 0.995,
  }),
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (reduced) => ({
    opacity: 0,
    y: reduced ? 0 : -6,
    scale: 1,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  }),
};

export default function PageTransition({ children, routeKey, className }) {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={routeKey}
        custom={reduced}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
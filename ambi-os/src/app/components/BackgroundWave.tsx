"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <motion.video
      src="/living-room.mp4"
      autoPlay
      muted
      loop
      controls={false}
      className="fixed object-cover bottom-0 z-[-1] pointer-events-none w-screen h-screen"
    />
  );
}; 
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Atom,
  Calculator,
  Code2,
  FileText,
  GraduationCap,
  Microscope,
  Pi,
  Binary,
  Globe,
} from "lucide-react";

const iconSet = [
  BookOpen,
  Atom,
  Calculator,
  Code2,
  FileText,
  GraduationCap,
  Microscope,
  Pi,
  Binary,
  Globe,
];

interface FloatingIcon {
  id: number;
  Icon: typeof BookOpen;
  size: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
}

function generateIcons(count: number, isLeftCluster: boolean): FloatingIcon[] {
  return Array.from({ length: count }, (_, i) => {
    const Icon = iconSet[Math.floor(Math.random() * iconSet.length)];
    const size = 24 + Math.random() * 40; // Random size between 24px and 64px
    const left = isLeftCluster
      ? Math.random() * 25 // 0% to 25%
      : 75 + Math.random() * 25; // 75% to 100%
    const delay = Math.random() * 8; // Stagger start times 0-8s (slower)
    const duration = 12 + Math.random() * 6; // Float duration 12-18s (more weightless)
    const drift = 20 + Math.random() * 40; // Horizontal drift 20-60px

    return {
      id: i,
      Icon,
      size,
      left,
      delay,
      duration,
      drift,
    };
  });
}

export default function FloatingCornerIcons() {
  const [allIcons, setAllIcons] = useState<FloatingIcon[]>([]);

  // Generate icons only on client-side to prevent hydration mismatch
  useEffect(() => {
    const leftIcons = generateIcons(15, true);
    const rightIcons = generateIcons(15, false);
    setAllIcons([...leftIcons, ...rightIcons]);
  }, []);

  // Don't render anything until icons are generated client-side
  if (allIcons.length === 0) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {allIcons.map((icon) => (
        <motion.div
          key={`icon-${icon.left}-${icon.id}`}
          className="absolute text-blue-500 will-change-transform"
          style={{
            left: `${icon.left}%`,
            bottom: "-100px",
            width: icon.size,
            height: icon.size,
            filter: "drop-shadow(0 0 10px rgba(59, 130, 246, 0.5))",
          }}
          animate={{
            y: [-100, -500 - Math.random() * 300], // Float upwards 500-800px (higher)
            x: [
              0,
              icon.drift * Math.sin(0),
              icon.drift * Math.sin(Math.PI / 2),
              icon.drift * Math.sin(Math.PI),
              icon.drift * Math.sin((3 * Math.PI) / 2),
              0,
            ], // Sine wave horizontal drift
            opacity: [0, 0.4, 0.3, 0.15, 0], // Brighter peak for glow visibility
            rotate: [0, 360], // Gentle rotation
          }}
          transition={{
            duration: icon.duration,
            delay: icon.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.5, 0.8, 1], // Keyframe timing for opacity
          }}
        >
          <icon.Icon className="w-full h-full" strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  );
}

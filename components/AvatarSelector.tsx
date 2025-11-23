"use client";

import { PRESET_AVATARS } from "@/utils/avatars";
import { motion } from "framer-motion";
import Image from "next/image";

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
}

export default function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-300 mb-2">
          Choose Your Avatar
        </h3>
        <p className="text-xs text-slate-500">
          Select from our curated collection of premium avatars
        </p>
      </div>

      {/* Avatar Grid - Compact with responsive columns */}
      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
        {PRESET_AVATARS.map((avatarUrl, index) => {
          const isSelected = selectedAvatar === avatarUrl;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(avatarUrl)}
              className={`
                relative w-16 h-16 rounded-full overflow-hidden cursor-pointer transition-all
                hover:scale-110
                ${
                  isSelected
                    ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
                    : "ring-1 ring-white/10 hover:ring-white/30"
                }
              `}
            >
              {/* Avatar Image */}
              <Image
                src={avatarUrl}
                alt={`Avatar ${index + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                unoptimized // DiceBear SVGs don't need Next.js optimization
              />

              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

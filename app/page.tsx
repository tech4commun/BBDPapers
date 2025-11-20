import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroSearch from "@/components/HeroSearch";
import FloatingCornerIcons from "@/components/FloatingCornerIcons";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 md:px-8 relative">
      {/* Floating Corner Icons - Behind Hero Text */}
      <FloatingCornerIcons />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Real-time Search */}
        <div className="flex justify-center mb-6 md:mb-8">
          <HeroSearch />
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight tracking-tight">
          Master Your Exams with{" "}
          <span className="text-blue-400">BBD's Best Resources</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 md:mb-12 max-w-2xl mx-auto">
          Access previous year question papers and topper notes instantly.
        </p>

        {/* CTA Button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-indigo-600 text-white text-base md:text-lg font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          Explore Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

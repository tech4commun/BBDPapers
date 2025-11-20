import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
          Master Your Exams with{" "}
          <span className="text-indigo-600">BBD's Best Resources</span>
        </h1>

        {/* Subtext */}
        <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-2xl mx-auto">
          Access previous year question papers and topper notes instantly.
        </p>

        {/* CTA Button */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          Explore Now
          <ArrowRight className="w-5 h-5" />
        </Link>

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        </div>
      </div>
    </div>
  );
}

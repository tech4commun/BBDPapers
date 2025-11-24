"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FileText, BookOpen } from "lucide-react";
import { logVisit } from "@/utils/analytics";

export default function ExplorePage() {
  // Log page visit on mount
  useEffect(() => {
    logVisit("explore");
  }, []);

  const resourceCards = [
    {
      title: "Previous Year Papers",
      description: "Access question papers from past exams to practice and prepare effectively.",
      icon: FileText,
      href: "/resources?type=pyq",
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "Lecture Notes",
      description: "Comprehensive notes from top students to help you master every subject.",
      icon: BookOpen,
      href: "/resources?type=notes",
      color: "from-indigo-500 to-purple-600",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-6 py-12 pt-32">
      <div className="max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Choose Your Resource Type
          </h1>
          <p className="text-lg md:text-xl text-slate-300">
            Select what you're looking for and start exploring
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {resourceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative"
              >
                {/* Dark Glass Card */}
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 h-full transition-all duration-300 hover:scale-105 hover:bg-slate-800/60 hover:border-blue-500/50 hover:shadow-blue-500/20">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 mb-6 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-100 mb-4">
                      {card.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-400 text-base md:text-lg leading-relaxed">
                      {card.description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className="mt-6 inline-flex items-center text-blue-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                      Get Started
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

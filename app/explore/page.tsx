import Link from "next/link";
import { FileText, BookOpen } from "lucide-react";

export default function ExplorePage() {
  const resourceCards = [
    {
      title: "Previous Year Papers",
      description: "Access question papers from past exams to practice and prepare effectively.",
      icon: FileText,
      href: "/resources?type=pyq",
      color: "from-indigo-500 to-purple-600",
    },
    {
      title: "Lecture Notes",
      description: "Comprehensive notes from top students to help you master every subject.",
      icon: BookOpen,
      href: "/resources?type=notes",
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl mx-auto w-full">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your Resource Type
          </h1>
          <p className="text-lg text-slate-600">
            Select what you're looking for and start exploring
          </p>
        </div>

        {/* Resource Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {resourceCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group relative"
              >
                {/* Glassmorphic Card */}
                <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-8 h-full transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-16 h-16 mb-6 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                      {card.title}
                    </h2>

                    {/* Description */}
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {card.description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className="mt-6 inline-flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
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

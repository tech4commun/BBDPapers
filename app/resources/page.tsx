"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, BookOpen, FileText } from "lucide-react";

// Mock data for dropdowns
const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
const branches = [
  { id: "cs", name: "Computer Science" },
  { id: "it", name: "Information Technology" },
  { id: "ece", name: "Electronics & Communication" },
  { id: "ee", name: "Electrical Engineering" },
  { id: "me", name: "Mechanical Engineering" },
  { id: "ce", name: "Civil Engineering" },
];

const subjectsByBranch: Record<string, string[]> = {
  cs: ["Data Structures", "Algorithms", "DBMS", "Operating Systems", "Computer Networks"],
  it: ["Web Development", "Software Engineering", "Cloud Computing", "Cyber Security"],
  ece: ["Digital Electronics", "Signal Processing", "Communication Systems", "VLSI Design"],
  ee: ["Power Systems", "Control Systems", "Electric Machines", "Power Electronics"],
  me: ["Thermodynamics", "Fluid Mechanics", "Manufacturing Processes", "Machine Design"],
  ce: ["Structural Analysis", "Geotechnical Engineering", "Transportation Engineering", "Hydraulics"],
};

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const resourceType = searchParams.get("type"); // 'pyq' or 'notes'

  const [semester, setSemester] = useState("");
  const [branch, setBranch] = useState("");
  const [subject, setSubject] = useState("");

  // Get subjects based on selected branch
  const availableSubjects = branch ? subjectsByBranch[branch] || [] : [];

  // Check if all fields are selected
  const isFormComplete = semester && branch && subject;

  const handleFindResources = () => {
    if (!isFormComplete) return;
    
    // TODO: Implement resource fetching logic
    console.log("Searching resources:", { semester, branch, subject, resourceType });
    alert(`Searching for ${resourceType === "pyq" ? "Previous Year Papers" : "Lecture Notes"}
Semester: ${semester}
Branch: ${branches.find(b => b.id === branch)?.name}
Subject: ${subject}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-4">
            {resourceType === "pyq" ? (
              <FileText className="w-8 h-8 text-indigo-600" />
            ) : (
              <BookOpen className="w-8 h-8 text-indigo-600" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Find {resourceType === "pyq" ? "Previous Year Papers" : "Lecture Notes"}
          </h1>
          <p className="text-lg text-slate-600">
            Configure your preferences to discover the perfect study materials
          </p>
        </div>

        {/* Configuration Card */}
        <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-8 md:p-12">
          <div className="space-y-6">
            {/* Semester Dropdown */}
            <div>
              <label htmlFor="semester" className="block text-sm font-semibold text-slate-700 mb-2">
                Select Semester
              </label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="">Choose semester...</option>
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown */}
            <div>
              <label htmlFor="branch" className="block text-sm font-semibold text-slate-700 mb-2">
                Select Branch
              </label>
              <select
                id="branch"
                value={branch}
                onChange={(e) => {
                  setBranch(e.target.value);
                  setSubject(""); // Reset subject when branch changes
                }}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                <option value="">Choose branch...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Dropdown */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-2">
                Select Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!branch}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <option value="">
                  {branch ? "Choose subject..." : "Select a branch first"}
                </option>
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Find Resources Button */}
            <button
              onClick={handleFindResources}
              disabled={!isFormComplete}
              className="w-full mt-8 px-6 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Find Resources
            </button>

            {/* Helper Text */}
            {!isFormComplete && (
              <p className="text-sm text-slate-500 text-center mt-4">
                Please select all three options to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

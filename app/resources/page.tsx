"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, BookOpen, FileText, GraduationCap, Download } from "lucide-react";
import Combobox from "@/components/Combobox";
import { searchResources } from "./actions";
import { toast } from "sonner";

// BBDU Syllabus Data Structure
const bbduCourses = [
  {
    id: "btech",
    name: "Bachelor of Technology (B.Tech)",
    branches: [
      {
        id: "cse",
        name: "Computer Science (CSE)",
        semesters: [
          {
            id: "sem1",
            name: "Semester 1",
            subjects: ["Matrices and Calculus", "Computer Concepts & Programming in C", "Engineering Physics", "Engineering Mechanics", "Basic Electronics Engineering", "Environmental Studies", "Basic Electrical Engineering", "Engineering Chemistry", "Basics of Artificial Intelligence", "Communicative English"]
          },
          {
            id: "sem2",
            name: "Semester 2",
            subjects: ["Differential Equations and Fourier Analysis", "Programming Concepts with Python", "Engineering Physics", "Engineering Mechanics", "Basic Electronics Engineering", "Environmental Studies", "Basic Electrical Engineering", "Engineering Chemistry", "Basics of Artificial Intelligence", "Communicative English"]
          },
          {
            id: "sem3",
            name: "Semester 3",
            subjects: ["Organizational Behavior", "Industrial Sociology", "Complex Analysis and Integral Transforms", "Discrete Mathematics", "Data Structure using 'C'", "Digital Logic Design", "Core and Advance Java", "Indian Constitution"]
          },
          {
            id: "sem4",
            name: "Semester 4",
            subjects: ["Statistical and Numerical Techniques", "Database Management Systems", "Operating Systems", "Software Engineering", "Computer Organization & Architecture"]
          },
          {
            id: "sem5",
            name: "Semester 5",
            subjects: ["Engineering & Managerial Economics", "Microprocessor and Interfacing", "Computer Networks", "Automata Theory and Formal Languages", "Computer Graphics", "Essence of Indian Knowledge Tradition"]
          },
          {
            id: "sem6",
            name: "Semester 6",
            subjects: ["Industrial Management", "Design & Analysis of Algorithms", "Compiler Design", "Professional Elective-I", "Professional Elective-II"]
          },
          {
            id: "sem7",
            name: "Semester 7",
            subjects: ["Distributed Systems", "Soft Computing", "Professional Elective-III", "Open Elective-I"]
          },
          {
            id: "sem8",
            name: "Semester 8",
            subjects: ["Essentials of Machine Learning", "Professional Elective-IV", "Open Elective-II"]
          }
        ]
      },
      {
        id: "me",
        name: "Mechanical Engineering",
        semesters: [
          {
            id: "sem3",
            name: "Semester 3",
            subjects: ["Thermodynamics", "Fluid Mechanics", "Material Science", "Mechanics of Solids", "Applied Math-III"]
          }
        ]
      }
    ]
  },
  {
    id: "bca",
    name: "Bachelor of Computer Apps (BCA)",
    branches: [
      {
        id: "regular",
        name: "Regular",
        semesters: [
          {
            id: "sem1",
            name: "Semester 1",
            subjects: ["Essentials of Professional Comm", "Principle of Management", "Mathematics-I", "Computer Fundamentals", "C Programming"]
          },
          {
            id: "sem2",
            name: "Semester 2",
            subjects: ["Organization Behavior", "Financial Accounting", "Mathematics-II", "Data Structures", "Digital Electronics"]
          }
        ]
      },
      {
        id: "ds_ai",
        name: "Data Science & AI (IBM)",
        semesters: [
          {
            id: "sem1",
            name: "Semester 1",
            subjects: ["Intro to AI", "Python Programming", "Mathematics for AI", "Comm Skills", "Operating Systems"]
          }
        ]
      }
    ]
  },
  {
    id: "bba",
    name: "Bachelor of Business Admin (BBA)",
    branches: [
      {
        id: "gen",
        name: "General",
        semesters: [
          {
            id: "sem1",
            name: "Semester 1",
            subjects: ["Principles of Management", "Microeconomics", "Business Accounting", "Business Comm", "Computer Apps in Mgmt"]
          }
        ]
      }
    ]
  }
];

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const resourceType = searchParams.get("type"); // 'pyq' or 'notes'

  // Cascading state management
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get available options based on selections
  const selectedCourse = bbduCourses.find(c => c.id === course);
  const availableBranches = selectedCourse?.branches || [];
  
  const selectedBranch = availableBranches.find(b => b.id === branch);
  const availableSemesters = selectedBranch?.semesters || [];
  
  const selectedSemester = availableSemesters.find(s => s.id === semester);
  const availableSubjects = selectedSemester?.subjects || [];

  // Check if all fields are selected
  const isFormComplete = course && branch && semester && subject;

  // Cascading handlers with reset logic
  const handleCourseChange = (newCourse: string) => {
    setCourse(newCourse);
    setBranch("");
    setSemester("");
    setSubject("");
  };

  const handleBranchChange = (newBranch: string) => {
    setBranch(newBranch);
    setSemester("");
    setSubject("");
  };

  const handleSemesterChange = (newSemester: string) => {
    setSemester(newSemester);
    setSubject("");
  };

  const handleFindResources = async () => {
    if (!isFormComplete || !resourceType) return;
    
    setIsSearching(true);
    try {
      const result = await searchResources({
        type: resourceType as "notes" | "pyq",
        branch: selectedBranch?.name || "",
        semester: selectedSemester?.name || "",
        subject: subject
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.results.length === 0) {
        toast.info("No resources found. Try different filters.");
      } else {
        // Store results in sessionStorage and navigate to results page
        sessionStorage.setItem('search_results', JSON.stringify({
          results: result.results,
          filters: {
            type: resourceType,
            branch: selectedBranch?.name || "",
            semester: selectedSemester?.name || "",
            subject: subject
          }
        }));
        window.location.href = '/results';
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-6 py-12 pt-32">
      <div className="max-w-4xl mx-auto">
        {/* Glassmorphic Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Find {resourceType === "pyq" ? "Previous Year Papers" : "Lecture Notes"}
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Select your course, branch, semester, and subject to access {resourceType === "pyq" ? "PYQ" : "Notes"}
          </p>
        </div>

        {/* Cascading Filter Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 lg:p-12">
          <div className="space-y-6">
            {/* Course Dropdown */}
            <div className="animate-fade-in">
              <label htmlFor="course" className="flex items-center gap-2 text-sm font-bold text-slate-100 mb-3 uppercase tracking-wide">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">1</span>
                Select Course
              </label>
              <select
                id="course"
                value={course}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-900 border border-white/20 rounded-2xl text-slate-100 font-medium text-base md:text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none hover:border-white/30"
              >
                <option value="" className="bg-slate-900 text-slate-400">Choose your course...</option>
                {bbduCourses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown - Fade in when course selected */}
            {course && (
              <div className="animate-fade-in">
                <label htmlFor="branch" className="flex items-center gap-2 text-sm font-bold text-slate-100 mb-3 uppercase tracking-wide">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">2</span>
                  Select Branch
                </label>
                <select
                  id="branch"
                  value={branch}
                  onChange={(e) => handleBranchChange(e.target.value)}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-900 border border-white/20 rounded-2xl text-slate-100 font-medium text-base md:text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none hover:border-white/30"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Choose your branch...</option>
                  {availableBranches.map((b) => (
                    <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Semester Dropdown - Fade in when branch selected */}
            {branch && (
              <div className="animate-fade-in">
                <label htmlFor="semester" className="flex items-center gap-2 text-sm font-bold text-slate-100 mb-3 uppercase tracking-wide">
                  <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">3</span>
                  Select Semester
                </label>
                <select
                  id="semester"
                  value={semester}
                  onChange={(e) => handleSemesterChange(e.target.value)}
                  className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-900 border border-white/20 rounded-2xl text-slate-100 font-medium text-base md:text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none hover:border-white/30"
                >
                  <option value="" className="bg-slate-900 text-slate-400">Choose semester...</option>
                  {availableSemesters.map((s) => (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject Combobox (Searchable) - Fade in when semester selected */}
            {semester && (
              <Combobox
                value={subject}
                onChange={setSubject}
                options={availableSubjects}
                placeholder="Search or select subject..."
                label="Select Subject"
                stepNumber={4}
              />
            )}

            {/* Search Resources Button - Pulsing animation when all selected */}
            {isFormComplete && (
              <div className="pt-6 animate-fade-in">
                <button
                  onClick={handleFindResources}
                  disabled={isSearching}
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                  {isSearching ? "Searching..." : "Search Resources"}
                </button>
              </div>
            )}

            {/* Progress Indicator */}
            <div className="pt-4 flex items-center justify-center gap-2">
              <div className={`w-3 h-3 rounded-full transition-all ${course ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-all ${branch ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-all ${semester ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
              <div className={`w-3 h-3 rounded-full transition-all ${subject ? 'bg-blue-500' : 'bg-slate-700'}`}></div>
            </div>

            {/* Helper Text */}
            {!isFormComplete && (
              <p className="text-sm text-slate-400 text-center pt-2">
                Complete all {4 - [course, branch, semester, subject].filter(Boolean).length} remaining step{[course, branch, semester, subject].filter(Boolean).length !== 3 ? 's' : ''} to search
              </p>
            )}
          </div>
        </div>

        {/* Results moved to /results page */}
      </div>
    </div>
  );
}

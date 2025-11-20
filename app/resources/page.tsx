"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search, BookOpen, FileText, GraduationCap } from "lucide-react";
import Combobox from "@/components/Combobox";

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
            subjects: ["Engineering Math-I", "Engineering Physics", "Basic Electrical Eng", "Professional Comm", "C Programming"]
          },
          {
            id: "sem2",
            name: "Semester 2",
            subjects: ["Engineering Math-II", "Engineering Chemistry", "Basic Electronics", "Environmental Science", "Data Structures (C)"]
          },
          {
            id: "sem3",
            name: "Semester 3",
            subjects: ["Discrete Structures", "Computer Org & Arch", "Digital Logic Design", "Object Oriented Prog (Java)", "Industrial Sociology"]
          },
          {
            id: "sem4",
            name: "Semester 4",
            subjects: ["Operating Systems", "Introduction to Microprocessor", "Software Engineering", "Graph Theory", "Universal Human Values"]
          },
          {
            id: "sem5",
            name: "Semester 5",
            subjects: ["Database Management Systems", "Design & Analysis of Algorithms", "Theory of Automata", "Web Technology", "Engineering Economics"]
          },
          {
            id: "sem6",
            name: "Semester 6",
            subjects: ["Compiler Design", "Computer Networks", "Data Warehousing & Mining", "Advanced Java", "Industrial Management"]
          },
          {
            id: "sem7",
            name: "Semester 7",
            subjects: ["Distributed Systems", "Artificial Intelligence", "Cryptography & Network Security", "Cloud Computing", "Project Phase-I"]
          },
          {
            id: "sem8",
            name: "Semester 8",
            subjects: ["Mobile Computing", "Machine Learning", "Digital Image Processing", "Project Phase-II", "Grand Viva"]
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

  const handleFindResources = () => {
    if (!isFormComplete) return;
    
    // TODO: Implement resource fetching logic
    console.log("Searching resources:", { course, branch, semester, subject, resourceType });
    alert(`Searching for ${resourceType === "pyq" ? "Previous Year Papers" : "Lecture Notes"}
Course: ${selectedCourse?.name}
Branch: ${selectedBranch?.name}
Semester: ${selectedSemester?.name}
Subject: ${subject}`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Glassmorphic Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-xl">
            {resourceType === "pyq" ? (
              <FileText className="w-10 h-10 text-white" />
            ) : (
              <BookOpen className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
              BBDU Student Portal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Find {resourceType === "pyq" ? "Previous Year Papers" : "Lecture Notes"}
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            Select your course, branch, semester, and subject to access study materials
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
                  className="w-full px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-lg md:text-xl font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 animate-pulse-slow"
                >
                  <Search className="w-5 h-5 md:w-6 md:h-6" />
                  Search Resources
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
      </div>
    </div>
  );
}

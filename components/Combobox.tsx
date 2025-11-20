"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  label: string;
  stepNumber: number;
}

export default function Combobox({ value, onChange, options, placeholder = "Search...", label, stepNumber }: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div ref={containerRef} className="relative animate-fade-in">
      <label className="flex items-center gap-2 text-sm font-bold text-slate-100 mb-3 uppercase tracking-wide">
        <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs">
          {stepNumber}
        </span>
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 md:px-5 py-3 md:py-4 bg-slate-900 border border-white/20 rounded-2xl text-slate-100 font-medium text-base md:text-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none hover:border-white/30 text-left flex items-center justify-between"
      >
        <span className={value ? "" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                No results found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center justify-between group ${
                    value === option ? "bg-blue-500/20" : ""
                  }`}
                >
                  <span className={`font-medium ${
                    value === option 
                      ? "text-blue-400" 
                      : "text-slate-200"
                  }`}>
                    {option}
                  </span>
                  {value === option && (
                    <Check className="w-5 h-5 text-blue-400" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

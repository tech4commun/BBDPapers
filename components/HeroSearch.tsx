"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Search, FileText, BookOpen } from "lucide-react";
import { getSearchSuggestions, getDownloadUrl } from "@/app/actions";

interface SearchSuggestion {
  id: string;
  title: string;
  type: "notes" | "pyq";
  subject: string;
  file_path: string;
}

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [rawSuggestions, setRawSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debounce the query with 300ms delay
  const [debouncedQuery] = useDebounce(query, 300);

  // Memoized filtered suggestions (limit to 5 results for performance)
  const suggestions = useMemo(() => {
    return rawSuggestions.slice(0, 5);
  }, [rawSuggestions]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsSearching(true);
      getSearchSuggestions(debouncedQuery)
        .then((results) => {
          setRawSuggestions(results);
          setIsOpen(results.length > 0);
          setSelectedIndex(-1);
        })
        .catch((error) => {
          console.error("Search failed:", error);
          setRawSuggestions([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setRawSuggestions([]);
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [debouncedQuery]);

  // Close dropdown on outside clicks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex].file_path);
        } else if (query.trim()) {
          router.push(`/resources?search=${encodeURIComponent(query)}`);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }

  // Handle suggestion click (using onMouseDown to prevent blur issues)
  async function handleSuggestionSelect(filePath: string) {
    const { url, error } = await getDownloadUrl(filePath);
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('Failed to get download URL:', error);
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for notes, PYQs, or subjects..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          className="w-full pl-12 pr-4 py-4 text-lg text-white rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 hover:border-white/20"
        />
        {isSearching && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          onMouseLeave={() => setSelectedIndex(-1)}
          className="absolute z-50 w-full mt-2 bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in"
        >
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.type === "notes" ? BookOpen : FileText;
            const isSelected = index === selectedIndex;

            return (
              <button
                key={suggestion.id}
                onMouseDown={() => handleSuggestionSelect(suggestion.file_path)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  isSelected
                    ? "bg-blue-500/20 text-white"
                    : "hover:bg-slate-800/50 text-slate-200"
                }`}
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 ${
                    isSelected ? "text-blue-400" : "text-slate-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.title}</div>
                  <div
                    className={`text-sm truncate ${
                      isSelected ? "text-blue-300" : "text-slate-400"
                    }`}
                  >
                    {suggestion.subject}
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {suggestion.type.toUpperCase()}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

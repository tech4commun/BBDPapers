"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  pdfUrl: string;
  width?: number;
}

export default function PdfPreview({ pdfUrl, width = 400 }: PdfPreviewProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("Failed to load PDF preview");
    setLoading(false);
  };

  return (
    <div className="relative w-full">
      {/* Preview Card Container */}
      <div className="relative bg-slate-900/50 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96 bg-slate-800/50">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-medium">
                Loading preview...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center h-96 bg-slate-800/50">
            <div className="text-center px-6">
              <p className="text-red-400 font-medium mb-2">Preview Unavailable</p>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* PDF Preview with Overlays */}
        {!error && (
          <div className="relative">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
              error=""
              className="flex justify-center"
            >
              <Page
                pageNumber={1}
                width={width}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-lg"
              />
            </Document>

            {/* Watermark Overlay (Center) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="transform -rotate-45 opacity-20">
                <p className="text-white text-4xl font-bold tracking-wider whitespace-nowrap">
                  PREVIEW ONLY
                </p>
                <p className="text-white text-2xl font-semibold text-center mt-2">
                  bbdpapers.in
                </p>
              </div>
            </div>

            {/* Bottom Gradient Overlay (Implies more content) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none">
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm font-medium">
                  Download to view {numPages ? `all ${numPages} pages` : "full document"}
                </p>
              </div>
            </div>

            {/* Top Badge */}
            <div className="absolute top-4 right-4 bg-indigo-600/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
              <p className="text-white text-xs font-bold uppercase tracking-wide">
                Preview - Page 1
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Document Info */}
      {numPages && !error && (
        <div className="mt-4 text-center">
          <p className="text-slate-400 text-sm">
            This document has <span className="text-white font-semibold">{numPages} pages</span>
          </p>
        </div>
      )}
    </div>
  );
}

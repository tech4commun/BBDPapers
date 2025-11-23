/**
 * Example: PDF Download Button with Watermark
 * 
 * This shows how to integrate the watermark utility into any download button.
 * Copy this pattern wherever you need to download PDFs with watermarks.
 */

"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { addWatermark, downloadBlob } from "@/utils/pdfWatermark";

interface PdfDownloadButtonProps {
  pdfUrl: string;
  filename: string;
}

export default function PdfDownloadButton({
  pdfUrl,
  filename,
}: PdfDownloadButtonProps) {
  const [isStamping, setIsStamping] = useState(false);

  const handleDownload = async () => {
    try {
      setIsStamping(true);

      // Show loading toast (if you have a toast library like sonner or react-hot-toast)
      // toast.loading("Stamping PDF with watermark...", { id: "pdf-stamp" });

      // 1. Add watermark to the PDF
      const watermarkedPdf = await addWatermark(pdfUrl);

      // 2. Trigger browser download
      downloadBlob(watermarkedPdf, filename);

      // Success toast
      // toast.success("PDF downloaded with watermark!", { id: "pdf-stamp" });
    } catch (error) {
      console.error("Download failed:", error);
      // Error toast
      // toast.error("Failed to download PDF. Please try again.", { id: "pdf-stamp" });
    } finally {
      setIsStamping(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isStamping}
      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      <Download className="w-5 h-5" />
      {isStamping ? "Stamping PDF..." : "Download PDF"}
    </button>
  );
}

/**
 * USAGE EXAMPLE:
 * 
 * In your resource display page (e.g., app/resources/[id]/page.tsx):
 * 
 * import PdfDownloadButton from "@/components/PdfDownloadButton";
 * 
 * export default function ResourceDetailPage({ params }) {
 *   const resource = {
 *     title: "Engineering Math - Semester 1",
 *     file_url: "https://your-supabase-storage.com/notes/file.pdf"
 *   };
 * 
 *   return (
 *     <div>
 *       <h1>{resource.title}</h1>
 *       <PdfDownloadButton 
 *         pdfUrl={resource.file_url}
 *         filename={`${resource.title}.pdf`}
 *       />
 *     </div>
 *   );
 * }
 */

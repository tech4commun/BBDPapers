/**
 * PDF Watermarking Utility
 * Adds footer watermark to PDFs before download using pdf-lib
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Adds a watermark to a PDF file
 * @param pdfUrl - URL of the PDF to watermark
 * @returns Blob of the watermarked PDF ready for download
 */
export async function addWatermark(pdfUrl: string): Promise<Blob> {
  try {
    // 1. Fetch the existing PDF buffer from URL
    const existingPdfBytes = await fetch(pdfUrl).then((res) =>
      res.arrayBuffer()
    );

    // 2. Load the PDF into PDFDocument
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // 3. Get Helvetica font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Watermark text
    const watermarkText = "For more PYQ/Notes Visit: bbdpapers.me";
    const fontSize = 10;
    const textColor = rgb(0.4, 0.4, 0.4); // Dark grey

    // 4. Loop through all pages and add watermark
    const pages = pdfDoc.getPages();
    pages.forEach((page) => {
      const { width, height } = page.getSize();

      // Calculate text width to position from right edge
      const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);

      // Draw text at bottom right corner
      page.drawText(watermarkText, {
        x: width - textWidth - 20, // 20px padding from right
        y: 20, // 20px from bottom
        size: fontSize,
        font: font,
        color: textColor,
      });
    });

    // 5. Save the modified PDF
    const pdfBytes = await pdfDoc.save();

    // 6. Return as Blob for browser download
    return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
  } catch (error) {
    console.error("Error adding watermark:", error);
    throw new Error("Failed to add watermark to PDF");
  }
}

/**
 * Triggers browser download of a Blob
 * @param blob - The blob to download
 * @param filename - Suggested filename for download
 */
export function downloadBlob(blob: Blob, filename: string) {
  // Create a temporary anchor element
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

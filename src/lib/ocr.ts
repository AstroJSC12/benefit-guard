/**
 * OCR Pipeline for Scanned PDFs
 *
 * When pdf-parse extracts little or no text from a PDF, it's likely
 * a scanned document (images of pages, not actual text). This module:
 *
 * 1. Converts PDF pages to images using pdf-to-img (pdfjs-dist + canvas)
 * 2. Runs Tesseract OCR on each page image to extract text
 * 3. Returns the combined text for the entire document
 *
 * Tesseract.js is the JavaScript port of Google's Tesseract OCR engine —
 * the same technology behind Google Lens text recognition. It runs entirely
 * in Node.js with no external services or API keys needed.
 */

import Tesseract from "tesseract.js";

// Minimum characters from pdf-parse before we consider a PDF "scanned"
// Insurance docs are typically 2000+ chars even for short ones
export const MIN_TEXT_THRESHOLD = 50;

/**
 * Detect whether a PDF is likely scanned (image-based) vs text-based.
 * Returns true if the extracted text is too short to be useful.
 */
export function isLikelyScanned(extractedText: string | null): boolean {
  if (!extractedText) return true;
  const cleaned = extractedText.replace(/\s+/g, " ").trim();
  return cleaned.length < MIN_TEXT_THRESHOLD;
}

/**
 * Run OCR on a PDF buffer that appears to be scanned.
 * Converts each page to an image, then runs Tesseract on each.
 *
 * Returns the combined extracted text from all pages.
 */
export async function ocrPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  // Dynamic import for pdf-to-img (ESM-only module)
  const { pdf } = await import("pdf-to-img");

  const pageTexts: string[] = [];
  let pageNum = 0;

  // pdf() returns an async iterable of page image buffers (PNG)
  const doc = await pdf(pdfBuffer, { scale: 2.0 });
  for await (const pageImage of doc) {
    pageNum++;
    console.log(`OCR: Processing page ${pageNum}...`);

    try {
      // Tesseract.recognize accepts Buffer, Uint8Array, or image path
      const result = await Tesseract.recognize(pageImage, "eng", {
        logger: () => {}, // Suppress progress logging
      });

      const pageText = result.data.text?.trim();
      if (pageText) {
        pageTexts.push(pageText);
      }
    } catch (err) {
      console.error(`OCR: Failed on page ${pageNum}:`, err);
      // Continue with other pages — don't let one bad page kill the whole doc
    }
  }

  if (pageTexts.length === 0) {
    throw new Error(
      "OCR could not extract any text from this document. " +
        "The scan quality may be too low, or the document may not contain readable text."
    );
  }

  console.log(
    `OCR: Extracted text from ${pageTexts.length}/${pageNum} pages ` +
      `(${pageTexts.join("").length} chars total)`
  );

  // Join pages with double newlines to preserve page boundaries
  return pageTexts.join("\n\n");
}

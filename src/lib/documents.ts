import prisma from "./db";
import { generateEmbedding } from "./openai";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

// Chunking parameters tuned for insurance documents
// CHUNK_SIZE: ~800 chars balances context window usage with retrieval precision
// CHUNK_OVERLAP: 200 chars ensures we don't lose context at chunk boundaries
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 200;

// Maximum file size we'll process (10MB) - larger files may timeout
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Process a PDF document: extract text, chunk it, generate embeddings, and store.
 * This runs asynchronously after upload - status is tracked in the database.
 * 
 * IMPORTANT: This function should be called in a fire-and-forget manner.
 * The caller should NOT await this - it updates the document status in the DB.
 */
export async function processDocument(
  documentId: string,
  fileBuffer: Buffer
): Promise<void> {
  try {
    // Validate file size before processing
    if (fileBuffer.length > MAX_FILE_SIZE) {
      throw new Error(`File too large (${Math.round(fileBuffer.length / 1024 / 1024)}MB). Maximum size is 10MB.`);
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "processing" },
    });

    let pdfData;
    try {
      pdfData = await pdfParse(fileBuffer);
    } catch (parseError) {
      throw new Error("Unable to read this PDF. It may be corrupted or password-protected.");
    }
    
    const rawText = pdfData.text;
    
    // Check if we actually extracted any text
    if (!rawText || rawText.trim().length < 50) {
      throw new Error("Could not extract text from this PDF. It may be a scanned image - we don't support OCR yet.");
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { rawText },
    });

    const chunks = chunkText(rawText);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      const embeddingStr = `[${embedding.join(",")}]`;

      await prisma.$executeRaw`
        INSERT INTO "DocumentChunk" (id, "documentId", content, embedding, "chunkIndex", "createdAt")
        VALUES (
          ${`chunk_${documentId}_${i}`},
          ${documentId},
          ${chunk},
          ${embeddingStr}::vector,
          ${i},
          NOW()
        )
      `;
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { status: "completed" },
    });
  } catch (error) {
    console.error("Document processing error:", error);
    // Store the error message for user visibility
    const errorMessage = error instanceof Error ? error.message : "Unknown processing error";
    await prisma.document.update({
      where: { id: documentId },
      data: { 
        status: "error",
        // Note: If you want to store error details, add an errorMessage field to the schema
      },
    });
    // Don't rethrow - this runs async and there's no caller to catch it
  }
}

function chunkText(text: string): string[] {
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const words = cleanedText.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;

  for (const word of words) {
    currentChunk.push(word);
    currentLength += word.length + 1;

    if (currentLength >= CHUNK_SIZE) {
      chunks.push(currentChunk.join(" "));
      
      const overlapWords = Math.floor(CHUNK_OVERLAP / 5);
      currentChunk = currentChunk.slice(-overlapWords);
      currentLength = currentChunk.join(" ").length;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

/**
 * Detect document type from filename.
 * This is a simple heuristic - could be improved with content analysis.
 * 
 * Known types: sbc, eob, denial_letter, medical_bill, formulary, other
 */
export function detectDocumentType(fileName: string): string {
  const lowerName = fileName.toLowerCase();
  
  // Summary of Benefits and Coverage - the key plan document
  if (lowerName.includes("sbc") || lowerName.includes("summary of benefits")) {
    return "sbc";
  }
  // Explanation of Benefits - shows what was billed/paid
  if (lowerName.includes("eob") || lowerName.includes("explanation of benefits")) {
    return "eob";
  }
  // Claim denial letters
  if (lowerName.includes("denial") || lowerName.includes("denied")) {
    return "denial_letter";
  }
  // Medical bills and statements
  if (lowerName.includes("bill") || lowerName.includes("statement") || lowerName.includes("invoice")) {
    return "medical_bill";
  }
  // Drug formularies
  if (lowerName.includes("formulary") || lowerName.includes("drug list")) {
    return "formulary";
  }
  
  // Default - user can still ask questions about any PDF
  return "other";
}

import * as Sentry from "@sentry/nextjs";

/**
 * Next.js Instrumentation — runs BEFORE any other server-side code.
 * 
 * This is critical for polyfilling browser APIs that pdfjs-dist (used by pdf-parse)
 * expects at module initialization time. On Vercel, external packages load before
 * our application code, so the polyfill in documents.ts runs too late.
 * 
 * By placing it here, DOMMatrix/Path2D/ImageData are defined before any module
 * tries to use them.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  if (typeof globalThis.DOMMatrix === "undefined") {
    // @ts-expect-error - stub for Node.js compatibility (text extraction only, no rendering)
    globalThis.DOMMatrix = class DOMMatrix {
      m: number[] = [1, 0, 0, 1, 0, 0];
      constructor() { this.m = [1, 0, 0, 1, 0, 0]; }
      isIdentity = true;
      translate() { return this; }
      scale() { return this; }
      transformPoint() { return { x: 0, y: 0 }; }
      inverse() { return this; }
    };
  }
  if (typeof globalThis.Path2D === "undefined") {
    // @ts-expect-error - stub for Node.js compatibility
    globalThis.Path2D = class Path2D {};
  }
  if (typeof globalThis.ImageData === "undefined") {
    // @ts-expect-error - stub for Node.js compatibility
    globalThis.ImageData = class ImageData {
      data: Uint8ClampedArray; width: number; height: number;
      constructor(w: number, h: number) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
    };
  }
}

export const onRequestError = Sentry.captureRequestError;

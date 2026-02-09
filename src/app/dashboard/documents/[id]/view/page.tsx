import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FileText, ArrowLeft, Quote } from "lucide-react";
import Link from "next/link";
import { ClientPdfViewer } from "@/components/documents/client-pdf-viewer";

export default async function DocumentViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chunk?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const { id } = await params;
  const { chunk: highlightChunkId } = await searchParams;

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, fileName: true, fileType: true, fileData: true, createdAt: true },
  });

  if (!document) redirect("/dashboard/documents");

  const hasPdf = !!document.fileData;

  // If a chunk ID is provided (linked from chat), fetch its content to show as excerpt
  let excerptContent: string | null = null;
  if (highlightChunkId) {
    const chunk = await prisma.$queryRaw<{ content: string }[]>`
      SELECT content FROM "DocumentChunk" WHERE id = ${highlightChunkId} LIMIT 1
    `;
    if (chunk.length > 0) {
      excerptContent = chunk[0].content;
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-muted/80 via-muted/40 to-muted/80 flex-shrink-0">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard/documents"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="w-px h-6 bg-border" />
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold truncate text-sm">{document.fileName}</h1>
            <p className="text-[11px] text-muted-foreground">
              {document.fileType.replace("_", " ").toUpperCase()} • {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Excerpt panel — only shown when linked from chat with a chunk reference */}
      {excerptContent && (
        <div className="border-b bg-primary/5 p-4 flex-shrink-0">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-start gap-3">
              <Quote className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-primary mb-1">
                  BenefitGuard referenced this section:
                </p>
                <p className="text-sm leading-relaxed bg-background border border-primary/20 rounded-lg p-3">
                  {excerptContent.length > 500
                    ? excerptContent.substring(0, 500) + "..."
                    : excerptContent}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF viewer */}
      <div className="flex-1 min-h-0">
        {hasPdf ? (
          <ClientPdfViewer
            url={`/api/documents/${document.id}/pdf`}
            fileName={document.fileName}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="p-8 text-center max-w-md">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-lg font-semibold mb-2">PDF not available</h2>
              <p className="text-sm text-muted-foreground">
                This document was uploaded before PDF viewing was enabled.
                Re-upload the document to view the original PDF.
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

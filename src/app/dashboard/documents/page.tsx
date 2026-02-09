import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { DocumentUpload } from "@/components/documents/document-upload";
import { DocumentList } from "@/components/documents/document-list";

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions);

  const documents = await prisma.document.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-4xl mx-auto pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">My Documents</h1>
          <p className="text-muted-foreground">
            Upload your insurance documents to get personalized guidance
          </p>
        </div>

        <DocumentUpload />

        {documents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Uploaded Documents</h2>
            <DocumentList documents={documents.map(doc => ({
              id: doc.id,
              fileName: doc.fileName,
              fileType: doc.fileType,
              status: doc.status,
              createdAt: doc.createdAt.toISOString(),
            }))} />
          </div>
        )}
      </div>
    </div>
  );
}

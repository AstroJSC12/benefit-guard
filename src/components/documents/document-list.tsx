"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface DocumentItem {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  createdAt: string;
}

export function DocumentList({ documents }: { documents: DocumentItem[] }) {
  const [deleting, setDeleting] = useState<Set<string>>(new Set());
  const router = useRouter();

  const handleDelete = async (docId: string) => {
    setDeleting((prev) => new Set(prev).add(docId));
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ready
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              {doc.status === "completed" ? (
                <a
                  href={`/dashboard/documents/${doc.id}/view`}
                  className="font-medium truncate block text-primary hover:underline"
                >
                  {doc.fileName}
                </a>
              ) : (
                <p className="font-medium truncate">{doc.fileName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {doc.fileType.replace("_", " ")} •{" "}
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(doc.status)}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(doc.id)}
                disabled={deleting.has(doc.id)}
              >
                {deleting.has(doc.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

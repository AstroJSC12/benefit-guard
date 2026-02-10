"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface UploadedDocument {
  id: string;
  fileName: string;
  fileType: string;
  status: "pending" | "processing" | "completed" | "error";
  errorMessage?: string;
}

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadedDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const allFiles = Array.from(e.dataTransfer.files);
    const pdfFiles = allFiles.filter((f) => f.type === "application/pdf");
    const nonPdfCount = allFiles.length - pdfFiles.length;
    
    if (nonPdfCount > 0) {
      toast.error(
        `${nonPdfCount} file${nonPdfCount > 1 ? "s" : ""} skipped. Only PDF files are supported.`
      );
    }
    
    if (pdfFiles.length > 0) {
      uploadFiles(pdfFiles);
    } else if (allFiles.length > 0 && pdfFiles.length === 0) {
      // User dropped files but none were PDFs - already showed toast above
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files || []);
    const pdfFiles = allFiles.filter((f) => f.type === "application/pdf");
    const nonPdfCount = allFiles.length - pdfFiles.length;
    
    if (nonPdfCount > 0) {
      toast.error(
        `${nonPdfCount} file${nonPdfCount > 1 ? "s" : ""} skipped. Only PDF files are supported.`
      );
    }
    
    if (pdfFiles.length > 0) {
      uploadFiles(pdfFiles);
    }
    
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);

    for (const file of files) {
      const tempId = `temp-${Date.now()}-${file.name}`;
      setUploads((prev) => [
        ...prev,
        {
          id: tempId,
          fileName: file.name,
          fileType: "other",
          status: "pending",
        },
      ]);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const document = await response.json();
          setUploads((prev) =>
            prev.map((u) =>
              u.id === tempId
                ? { ...document }
                : u
            )
          );

          if (document.status === "completed") {
            toast.success(`${document.fileName} processed successfully`);
            onUploadComplete?.();
          } else if (document.status === "error") {
            toast.error(`Failed to process ${file.name}: ${document.errorMessage || "Unknown error"}`);
          } else {
            // Still processing — poll for completion
            pollDocumentStatus(document.id, tempId);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || "Upload failed. Please try again.";
          setUploads((prev) =>
            prev.map((u) =>
              u.id === tempId
                ? { ...u, status: "error" as const, errorMessage: errorMsg }
                : u
            )
          );
          toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
        }
      } catch (error) {
        console.error("Upload error:", error);
        const errorMsg = "Network error. Please check your connection and try again.";
        setUploads((prev) =>
          prev.map((u) =>
            u.id === tempId
              ? { ...u, status: "error" as const, errorMessage: errorMsg }
              : u
          )
        );
        toast.error(`Failed to upload ${file.name}: ${errorMsg}`);
      }
    }

    setIsUploading(false);
  };

  const pollDocumentStatus = async (documentId: string, tempId: string) => {
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch("/api/documents");
        if (response.ok) {
          const documents = await response.json();
          const doc = documents.find(
            (d: UploadedDocument) => d.id === documentId
          );

          if (doc) {
            setUploads((prev) =>
              prev.map((u) =>
                u.id === tempId || u.id === documentId
                  ? { ...doc, id: documentId }
                  : u
              )
            );

            if (doc.status === "completed") {
              toast.success(`${doc.fileName} processed successfully`);
              onUploadComplete?.();
              return;
            }

            if (doc.status === "error") {
              toast.error(`Failed to process ${doc.fileName}`);
              return;
            }
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          // Processing timed out - update status to show user
          setUploads((prev) =>
            prev.map((u) =>
              u.id === tempId || u.id === documentId
                ? {
                    ...u,
                    id: documentId,
                    status: "error" as const,
                    errorMessage: "Processing timed out. The file may still be processing in the background.",
                  }
                : u
            )
          );
          toast.error("Document processing is taking longer than expected. Please check back later.");
        }
      } catch (error) {
        console.error("Poll error:", error);
        // Don't fail silently - let the user know
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        }
      }
    };

    setTimeout(poll, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Uploading
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
            Complete
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" title="Click file to see error details">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className={`p-8 border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Upload Your Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop PDF files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Supported: Summary of Benefits (SBC), Explanation of Benefits (EOB),
            denial letters, medical bills, formularies
          </p>
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button asChild disabled={isUploading}>
              <span>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </>
                )}
              </span>
            </Button>
          </label>
        </div>
      </Card>

      {uploads.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents</h4>
          {uploads.map((upload) => (
            <Card key={upload.id} className="p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{upload.fileName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {upload.fileType.replace("_", " ")}
                  </p>
                </div>
                {getStatusBadge(upload.status)}
              </div>
              {upload.status === "processing" && (
                <div className="mt-2">
                  <Progress value={undefined} className="animate-pulse" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Extracting text and analyzing document...
                  </p>
                </div>
              )}
              {upload.status === "error" && upload.errorMessage && (
                <div className="mt-2 flex items-start gap-2 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{upload.errorMessage}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

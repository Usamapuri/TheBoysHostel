"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Upload, Eye, X } from "lucide-react"
import type { Student } from "@/lib/types"

interface DocumentsSectionProps {
  student: Student
  onUpdate: (updates: Partial<Student>) => Promise<void>
}

export function DocumentsSection({ student, onUpdate }: DocumentsSectionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      // Mock upload - in production, upload to cloud storage (S3, Cloudinary, etc.)
      const mockUrl = `uploads/id_proofs/${Date.now()}_${file.name}`
      
      await onUpdate({
        idProofUrl: mockUrl,
      })

      setFile(null)
      // Reset the file input
      const fileInput = document.getElementById("id-proof-upload") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (error) {
      console.error("Failed to upload document:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove this document?")) {
      setIsUploading(true)
      try {
        await onUpdate({
          idProofUrl: undefined,
        })
      } catch (error) {
        console.error("Failed to remove document:", error)
      } finally {
        setIsUploading(false)
      }
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-foreground">Student ID Proof</Label>
          <p className="text-xs text-muted-foreground mb-3">
            Upload student identification document (Image or PDF)
          </p>

          {student.idProofUrl ? (
            <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {student.idProofUrl.split("/").pop()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded document
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(student.idProofUrl, "_blank")}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                  disabled={isUploading}
                  className="text-danger hover:text-danger"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                id="id-proof-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="bg-input border-border text-foreground"
              />
              {file && (
                <div className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                  <p className="text-sm text-foreground">
                    Selected: {file.name}
                  </p>
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    size="sm"
                    className="bg-primary text-primary-foreground"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

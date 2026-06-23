"use client";

import React, { useState, useEffect } from "react";
import { AssignmentLessonApi } from "@/services/api/course-api";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { InstructorTextarea } from "@/components/ui/shared/InstructorTextarea";
import { FileText, Loader2, UploadCloud, Trash2, Save, Paperclip } from "lucide-react";
import type { AssignmentLessonResponse } from "@/types";

interface AssignmentLessonEditorProps {
  courseId: string;
  lessonId: string;
}

interface TempAttachment {
  fileKey?: string;
  id?: string; // If loaded from server
  fileName: string;
  fileType: string;
  fileSize: number;
  attachmentUrl?: string;
}

export default function AssignmentLessonEditor({ courseId, lessonId }: AssignmentLessonEditorProps) {
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<TempAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchAssignmentDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AssignmentLessonApi.getAssigmentByLessonId(courseId, lessonId);
      if (res?.data) {
        setDescription(res.data.description || "");
        setAttachments(
          (res.data.attachments || []).map((att) => ({
            id: att.id,
            fileName: att.fileName || "attachment",
            fileType: att.fileType || "",
            fileSize: att.fileSize || 0,
            attachmentUrl: att.attachmentUrl,
          }))
        );
      } else {
        setDescription("");
        setAttachments([]);
      }
    } catch (err: any) {
      console.error("Failed to load assignment details:", err);
      setDescription("");
      setAttachments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [courseId, lessonId]);

  // Handle Attachment upload
  const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Upload to S3
      const fileKey = await uploadFileWithPresignedUrl(file, {
        prepareError: "Could not prepare file upload.",
        uploadError: "Failed to upload attachment file to S3.",
      });

      // 2. Append to local state list
      const newAtt: TempAttachment = {
        fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      };

      setAttachments((prev) => [...prev, newAtt]);
    } catch (err: any) {
      console.error("Failed to upload attachment:", err);
      setError(err?.message || "Could not upload attachment.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Remove attachment row
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setSuccess(false);
  };

  // Save Assignment
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError(null);
    setSuccess(false);

    const formattedAttachments = attachments.map((att) => ({
      fileKey: att.fileKey || "",
      fileName: att.fileName,
      fileType: att.fileType,
      fileSize: att.fileSize,
    }));

    try {
      try {
        await AssignmentLessonApi.updateAssignmentLesson(courseId, lessonId, {
          description,
          attachments: formattedAttachments,
        });
      } catch (updateErr) {
        await AssignmentLessonApi.createAssignmentLesson(courseId, lessonId, {
          description,
          attachments: formattedAttachments,
        });
      }

      setSuccess(true);
      await fetchAssignmentDetails();
    } catch (err: any) {
      console.error("Failed to save assignment:", err);
      setError(err?.message || "Could not save assignment details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 flex-col items-center justify-center space-y-2">
        <Loader2 className="size-6 animate-spin text-primary-600" />
        <span className="text-[11px] text-gray-400 font-bold">Fetching assignment details...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="rounded-lg border border-gray-200 p-6 bg-white space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900">Assignment Workbook Settings</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Outline specifications, constraints, submission expectations, and attach reference starter files.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 text-red-600 p-4 text-xs font-semibold border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 text-emerald-600 p-4 text-xs font-semibold border border-emerald-100">
          Assignment workbook saved successfully!
        </div>
      )}

      {/* Description Textarea */}
      <InstructorTextarea
        id="assignment-desc"
        label="Assignment Specifications"
        placeholder="Provide complete instructions, instructions on how to submit, grading criteria..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="text-sm font-medium py-3 px-4"
        rows={10}
        required
      />

      {/* Attachments Section */}
      <div className="space-y-4">
        <label className="block text-sm font-semibold text-gray-800">Resource Attachments</label>

        {attachments.length > 0 && (
          <div className="space-y-3.5 max-w-full">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50/50 p-3"
              >
                <div className="flex items-center space-x-3.5 truncate pr-4">
                  <Paperclip className="size-4 text-gray-500 shrink-0" />
                  <span className="text-sm font-semibold text-gray-900 truncate">{att.fileName}</span>
                  <span className="text-xs text-gray-500 mt-0.5">
                    ({(att.fileSize / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative inline-block">
          <input
            type="file"
            id="upload-attachment"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={handleUploadAttachment}
            disabled={uploading}
          />
          <InstructorButton
            size="md"
            variant="secondary"
            icon={uploading ? Loader2 : UploadCloud}
            disabled={uploading}
            className="px-3 py-2.5 text-sm font-medium"
          >
            {uploading ? "Uploading attachment..." : "Add Attachment File"}
          </InstructorButton>
        </div>
      </div>

      <div className="flex items-center justify-end pt-5 border-t border-gray-200">
        <InstructorButton type="submit" loading={saving} size="md" icon={Save} className="px-3 py-2.5 text-sm font-medium">
          Save Assignment Settings
        </InstructorButton>
      </div>
    </form>
  );
}

"use client";

import React, { useState } from "react";
import { uploadFileWithPresignedUrl } from "@/lib/presigned-upload";
import { CourseImageApi } from "@/services/api/course-api";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import type { CourseImageResponse } from "@/types";
import { UploadCloud, Trash2, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";

interface CourseImageUploadProps {
  courseId: string;
  images: CourseImageResponse[];
  onSuccess: () => void;
  onNext: () => void;
  onBack: () => void;
}

export default function CourseImageUpload({
  courseId,
  images,
  onSuccess,
  onNext,
  onBack,
}: CourseImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // File selection change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB) and type (image)
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size cannot exceed 5MB.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. Upload to S3 via Presigned URL
      const fileKey = await uploadFileWithPresignedUrl(file, {
        prepareError: "Could not retrieve upload slot from S3.",
        uploadError: "Failed to upload image to S3 storage bucket.",
        serviceType: "course",
      });

      // 2. Link image to course
      await CourseImageApi.uploadCourseImages(courseId, {
        images: [{ fileKey }],
      });

      // 3. Callback parent to refresh
      onSuccess();
    } catch (err: any) {
      console.error("Failed to upload course image:", err);
      setError(err?.message || "Could not upload image. Please try again.");
    } finally {
      setUploading(false);
      // Reset input value to allow uploading same file again
      e.target.value = "";
    }
  };

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    setDeletingId(imageId);
    setError(null);
    try {
      await CourseImageApi.deleteCourseImage(courseId, imageId);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to delete image:", err);
      setError(err?.message || "Could not delete image. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Course Cover Illustration</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload high-fidelity banner images for your course landing page. We recommend using
            ratio **16:9** (e.g. 1280x720 pixels, max 5MB). Accepted formats: JPG, PNG, WEBP.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Upload Box */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-primary-600 transition-all rounded-lg p-10 bg-gray-50/30 text-center relative group">
          <input
            type="file"
            id="cover-image-file"
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="size-8 animate-spin text-primary-600" />
              <p className="text-xs font-semibold text-primary-600">Uploading image to storage...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:scale-105 transition-transform">
                <UploadCloud className="size-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-700">
                  Drag and drop your file here, or <span className="text-primary-600 underline">browse</span>
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">PNG, JPG, or WEBP (Max 5MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Gallery / Cover Preview */}
        {images.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">Uploaded Illustrations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {images.map((img) => (
                <div
                  key={img.id}
                  className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-50 shadow-xs"
                >
                  <img
                    src={img.imageUrl}
                    alt="Course cover"
                    className="aspect-video w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <button
                      type="button"
                      disabled={deletingId === img.id}
                      onClick={() => img.id && handleDeleteImage(img.id)}
                      className="flex items-center justify-center size-9 rounded-lg bg-white text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow-md cursor-pointer"
                      title="Delete Image"
                    >
                      {deletingId === img.id ? (
                        <Loader2 className="size-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && !uploading && (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 rounded-lg border border-gray-100">
            <ImageIcon className="size-8 text-gray-300 mb-2" />
            <p className="text-xs font-bold text-gray-400">No images uploaded yet</p>
            <p className="text-[10px] text-gray-400 font-medium">Please upload at least one image to set as cover.</p>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between pt-4">
        <InstructorButton
          variant="outline"
          icon={ArrowLeft}
          onClick={onBack}
          className="px-3 py-2.5 text-sm font-medium"
        >
          Back
        </InstructorButton>
        <InstructorButton
          icon={ArrowRight}
          iconPosition="right"
          onClick={onNext}
          className="px-3 py-2.5 text-sm font-medium"
        >
          Save & Next
        </InstructorButton>
      </div>
    </div>
  );
}

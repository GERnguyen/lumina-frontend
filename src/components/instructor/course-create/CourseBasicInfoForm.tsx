"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Select } from "@/components/ui/shared";
import { InstructorTextarea } from "@/components/ui/shared/InstructorTextarea";
import { InstructorSwitch } from "@/components/ui/shared/InstructorSwitch";
import { InstructorButton } from "@/components/ui/shared/InstructorButton";
import { CourseApi } from "@/services/api/course-api";
import type { CategoryResponse, CourseResponse } from "@/types";
import { Save } from "lucide-react";

interface CourseBasicInfoFormProps {
  categories: CategoryResponse[];
  course: CourseResponse | null;
  onSuccess: (courseId: string) => void;
  onNext?: () => void;
}

export default function CourseBasicInfoForm({
  categories,
  course,
  onSuccess,
  onNext,
}: CourseBasicInfoFormProps) {
  // Input states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState<number | undefined>(undefined);
  const [isInSubscription, setIsInSubscription] = useState(true);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [certificateTitle, setCertificateTitle] = useState("");
  const [duration, setDuration] = useState<number | undefined>(undefined);

  // Status states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Populate data when course changes (edit mode)
  useEffect(() => {
    if (course) {
      setTitle(course.title || "");
      setDescription(course.description || "");
      setCategoryId(course.category?.id || "");
      setPrice(course.price || 0);
      setDiscountedPrice(course.discountedPrice);
      setIsInSubscription(course.isInSubscription ?? true);
      setHasCertificate(course.hasCertificate || false);
      setCertificateTitle(course.certificateTitle || "");
      setDuration(course.duration);
    }
  }, [course]);

  // Form options
  const categoryOptions = categories.map((c) => ({
    label: c.name || "",
    value: c.id || "",
  }));

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Course title is required.";
    if (title.length > 120) newErrors.title = "Title cannot exceed 120 characters.";
    if (!description.trim()) newErrors.description = "Course description is required.";
    if (!categoryId) newErrors.categoryId = "Please select a category.";
    if (price < 0) newErrors.price = "Price cannot be negative.";
    if (discountedPrice !== undefined && discountedPrice < 0) {
      newErrors.discountedPrice = "Discounted price cannot be negative.";
    }
    if (discountedPrice !== undefined && discountedPrice >= price && price > 0) {
      newErrors.discountedPrice = "Discounted price must be less than regular price.";
    }
    if (hasCertificate && !certificateTitle.trim()) {
      newErrors.certificateTitle = "Certificate title is required if certificate is enabled.";
    }
    if (duration !== undefined && duration <= 0) {
      newErrors.duration = "Duration must be positive.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError(null);

    const payload = {
      title,
      description,
      categoryId,
      price,
      discountedPrice: discountedPrice || undefined,
      isInSubscription,
      hasCertificate,
      certificateTitle: hasCertificate ? certificateTitle : undefined,
      duration: duration || undefined,
    };

    try {
      if (course?.id) {
        // Edit mode: Update course
        const response = await CourseApi.updateCourse(course.id, payload);
        if (response.data?.id) {
          onSuccess(response.data.id);
          if (onNext) onNext();
        }
      } else {
        // Create mode: Create course
        const response = await CourseApi.createCourse(payload);
        if (response.data?.id) {
          onSuccess(response.data.id);
        }
      }
    } catch (err: any) {
      console.error("Failed to save basic info:", err);
      setServerError(err?.message || "An error occurred while saving. Please check your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <h2 className="border-b border-gray-200 pb-3 text-base font-bold text-gray-900">
          Course Primary Metadata
        </h2>

        {serverError && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-xs font-semibold text-red-600">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <Input
              id="title"
              label="Course Title"
              placeholder="e.g. Next.js 15 Premium Course - Complete Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />
          </div>

          {/* Category */}
          <div>
            <Select
              label="Category"
              options={categoryOptions}
              value={categoryId}
              onValueChange={setCategoryId}
              className="w-full max-w-full"
            />
            {errors.categoryId && (
              <p className="mt-1.5 text-[11px] text-red-500 font-semibold">{errors.categoryId}</p>
            )}
          </div>

          {/* Duration */}
          <div>
            <Input
              id="duration"
              label="Total Duration (minutes, optional)"
              type="number"
              placeholder="e.g. 120"
              value={duration || ""}
              onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : undefined)}
              error={errors.duration}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <InstructorTextarea
              id="description"
              label="Course Description"
              placeholder="Provide a comprehensive introduction to your course, including key takeaways and student expectations..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              required
            />
          </div>

          {/* Price */}
          <div>
            <Input
              id="price"
              label="Price ($)"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              error={errors.price}
              required
            />
          </div>

          {/* Discounted Price */}
          <div>
            <Input
              id="discountedPrice"
              label="Discounted Price ($ - optional)"
              type="number"
              min="0"
              step="0.01"
              value={discountedPrice !== undefined ? discountedPrice : ""}
              placeholder="Leave empty if no discount"
              onChange={(e) =>
                setDiscountedPrice(e.target.value ? Number(e.target.value) : undefined)
              }
              error={errors.discountedPrice}
            />
          </div>
        </div>
      </div>

      {/* Course Toggles */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-6">
        <h2 className="border-b border-gray-200 pb-3 text-base font-bold text-gray-900">
          Course Features & Access
        </h2>

        <div className="grid grid-cols-1 gap-8">
          {/* Certification Toggle */}
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-4">
            <InstructorSwitch
              checked={hasCertificate}
              onChange={setHasCertificate}
              label="Enable Course Certificate"
              description="Grant students a custom-titled certification upon completing all curriculum units."
            />

            {hasCertificate && (
              <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                <Input
                  id="certificateTitle"
                  label="Certificate Title"
                  placeholder="e.g. Specialist Certificate in Advanced Next.js"
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  error={errors.certificateTitle}
                  required={hasCertificate}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        {course?.id && onNext && (
          <Button
            type="button"
            onClick={onNext}
            variant="outline"
          >
            Skip to next
          </Button>
        )}
        <InstructorButton
          type="submit"
          loading={loading}
          icon={Save}
          className="px-3 py-2.5 text-sm font-medium shadow-sm"
        >
          {course?.id ? "Save & Proceed" : "Create Course Draft"}
        </InstructorButton>
      </div>
    </form>
  );
}

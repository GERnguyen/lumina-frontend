import { PresignedUrlService } from "@/services";
import { CoursePresignedUrlApi } from "@/services/api/course-api";
import { LearningPresignedUrlApi } from "@/services/api/learning-api";

type UploadOptions = {
  fallbackContentType?: string;
  prepareError?: string;
  uploadError?: string;
  serviceType?: "user" | "course" | "learning";
};

export async function uploadFileWithPresignedUrl(file: File, options: UploadOptions = {}) {
  const contentType = file.type || options.fallbackContentType || "application/octet-stream";
  const serviceType = options.serviceType || "user";

  let response;
  if (serviceType === "course") {
    response = await CoursePresignedUrlApi.getPresignedUrl({
      fileName: file.name,
      contentType,
    });
  } else if (serviceType === "learning") {
    response = await LearningPresignedUrlApi.getPresignedUrl({
      fileName: file.name,
      contentType,
    });
  } else {
    response = await PresignedUrlService.getPresignedUrl({
      fileName: file.name,
      contentType,
    });
  }

  const presignedUrl = response.data?.presignedUrl;
  const fileKey = response.data?.fileKey;

  if (!presignedUrl || !fileKey) {
    throw new Error(response.message || options.prepareError || "Could not prepare file upload.");
  }


  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
      "x-amz-acl": "public-read",
    },
  });

  if (!uploadResponse.ok) {
    throw new Error(
      options.uploadError ||
        `File upload failed with status ${uploadResponse.status} ${uploadResponse.statusText}`.trim(),
    );
  }

  return fileKey;
}

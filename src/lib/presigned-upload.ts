import { PresignedUrlService } from "@/services";

type UploadOptions = {
  fallbackContentType?: string;
  prepareError?: string;
  uploadError?: string;
};

export async function uploadFileWithPresignedUrl(file: File, options: UploadOptions = {}) {
  const contentType = file.type || options.fallbackContentType || "application/octet-stream";
  const response = await PresignedUrlService.getPresignedUrl({
    fileName: file.name,
    contentType,
  });

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

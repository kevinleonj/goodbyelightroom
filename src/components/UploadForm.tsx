"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Album, CreatePhotoPayload, SignedUploadResponse } from "@/lib/types";

const formSchema = z.object({
  album_slug: z.string().min(1, "Please choose an album"),
  alt: z.string().max(160).optional(),
  publishNow: z.boolean().default(true)
});

type FormSchema = z.infer<typeof formSchema>;

interface UploadFormProps {
  albums: Album[];
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
});

/**
 * UploadForm handles drag-and-drop uploads and metadata submission.
 */
export function UploadForm({ albums }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { publishNow: true }
  });

  const { data: albumList } = useSWR<Album[]>("/api/albums", fetcher, {
    fallbackData: albums,
    revalidateOnFocus: false
  });

  const onDrop = useCallback((incomingFileList: FileList | null) => {
    if (!incomingFileList || incomingFileList.length === 0) {
      setStatus("No file selected yet.");
      return;
    }

    const candidate = incomingFileList[0];

    if (!candidate.type.includes("jpeg") && !candidate.type.includes("heic")) {
      setStatus("Only JPEG or HEIC files are allowed.");
      return;
    }

    if (candidate.size > 10 * 1024 * 1024) {
      setStatus("File is larger than the 10MB limit.");
      return;
    }

    setFile(candidate);
    setStatus(`Ready to upload: ${candidate.name}`);
  }, []);

  const onSubmit = useCallback(
    async (values: FormSchema) => {
      if (!file) {
        setStatus("Please pick a file before submitting.");
        return;
      }

      setIsUploading(true);

      try {
        const signedUploadResponse = await requestSignedUrl(file.name);

        await uploadToCloudflareImages(file, signedUploadResponse.uploadURL);

        const payload: CreatePhotoPayload = {
          album_slug: values.album_slug,
          alt: values.alt,
          cf_image_id: signedUploadResponse.cf_image_id,
          tags: [],
          filename_original: file.name
        };

        await savePhotoMetadata(payload, values.publishNow);

        setStatus("Upload completed successfully.");
        setFile(null);
        reset();
      } catch (error) {
        console.error(error);
        setStatus(error instanceof Error ? error.message : "Unexpected error during upload.");
      } finally {
        setIsUploading(false);
      }
    },
    [file, reset]
  );

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-white">1. Select an image</legend>
        <label
          htmlFor="file-upload"
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brand-400/50 bg-brand-500/5 p-10 text-center text-sm text-brand-100 transition hover:bg-brand-500/10"
        >
          <input
            id="file-upload"
            type="file"
            accept="image/jpeg,image/heic"
            className="sr-only"
            onChange={(event) => onDrop(event.target.files)}
          />
          <span className="text-base font-medium text-white">Drag a JPEG or HEIC here, or tap to browse</span>
          <span className="text-xs text-brand-100">Max size 10 MB · Location metadata removed automatically</span>
        </label>
        {status ? <p className="text-sm text-neutral-300">{status}</p> : null}
      </fieldset>

      <fieldset className="space-y-4 rounded-2xl border border-white/10 p-6">
        <legend className="text-lg font-semibold text-white">2. Describe it</legend>
        <label className="flex flex-col gap-2 text-sm">
          <span>Album</span>
          <select
            {...register("album_slug")}
            className="rounded-lg border border-white/10 bg-neutral-900 p-3 text-white"
            aria-invalid={formState.errors.album_slug ? "true" : "false"}
          >
            <option value="">Select an album</option>
            {albumList?.map((album) => (
              <option key={album.slug} value={album.slug}>
                {album.title}
              </option>
            ))}
          </select>
          {formState.errors.album_slug ? (
            <span className="text-xs text-red-300">{formState.errors.album_slug.message}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span>Alt text (optional but recommended for accessibility)</span>
          <input
            type="text"
            maxLength={160}
            {...register("alt")}
            className="rounded-lg border border-white/10 bg-neutral-900 p-3 text-white"
          />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" {...register("publishNow")}
            className="h-4 w-4 rounded border-white/20 bg-neutral-900 text-brand-400 focus:ring-brand-300" />
          <span>Publish immediately</span>
        </label>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold uppercase tracking-widest text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}

async function requestSignedUrl(filename: string): Promise<SignedUploadResponse> {
  const response = await fetch("/api/signed-upload", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filename })
  });

  if (!response.ok) {
    throw new Error(`Failed to request signed upload URL (${response.status}).`);
  }

  return response.json();
}

async function uploadToCloudflareImages(file: File, uploadUrl: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Image upload failed (${response.status}).`);
  }
}

async function savePhotoMetadata(payload: CreatePhotoPayload, publish: boolean) {
  const response = await fetch("/api/photos", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ ...payload, published: publish })
  });

  if (!response.ok) {
    throw new Error(`Failed to save photo metadata (${response.status}).`);
  }
}

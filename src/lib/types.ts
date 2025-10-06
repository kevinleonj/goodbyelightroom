/**
 * Shared TypeScript interfaces describing Albums and Photos.
 * Having explicit interfaces helps both the frontend and backend stay in sync.
 */
export interface Album {
  slug: string;
  title: string;
  subtitle?: string | null;
  cover_image_id?: string | null;
  order: number;
  created_at: string;
  published: boolean;
}

export interface Photo {
  id: string;
  album_slug: string;
  filename_original: string;
  cf_image_id: string;
  width: number;
  height: number;
  alt?: string | null;
  exif: PhotoExif;
  tags: string[];
  created_at: string;
  published: boolean;
}

export interface PhotoExif {
  make?: string | null;
  model?: string | null;
  lens?: string | null;
  iso?: number | null;
  fnumber?: number | null;
  exposure_time?: string | null;
  focal_length?: number | null;
  date_original?: string | null;
  gps_lat?: number | null;
  gps_lon?: number | null;
}

export interface SignedUploadResponse {
  uploadURL: string;
  cf_image_id: string;
}

export interface CreatePhotoPayload {
  album_slug: string;
  cf_image_id: string;
  alt?: string | null;
  exif?: Partial<PhotoExif> | null;
  width?: number;
  height?: number;
  tags?: string[];
  filename_original?: string;
}

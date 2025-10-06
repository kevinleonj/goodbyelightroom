"use client";

import Image from "next/image";
import { useState } from "react";
import { Photo } from "@/lib/types";
import { Lightbox } from "@/components/Lightbox";

interface MasonryGridProps {
  photos: Photo[];
}

/**
 * MasonryGrid renders a responsive set of images using CSS columns.
 * It includes a built-in lightbox with keyboard escape handling for accessibility.
 */
export function MasonryGrid({ photos }: MasonryGridProps) {
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);

  return (
    <div>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className="mb-4 w-full overflow-hidden rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-300"
            onClick={() => setActivePhoto(photo)}
          >
            <Image
              src={`https://imagedelivery.net/${photo.cf_image_id}/public`}
              alt={photo.alt ?? "Photo preview"}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="h-auto w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Lightbox photo={activePhoto} onClose={() => setActivePhoto(null)} />
    </div>
  );
}

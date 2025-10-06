"use client";

import { Dialog, Transition } from "@headlessui/react";
import Image from "next/image";
import { Fragment, useEffect } from "react";
import { Photo } from "@/lib/types";

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
}

/**
 * Lightbox displays a focused preview of a single photo with ESC to close.
 */
export function Lightbox({ photo, onClose }: LightboxProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <Transition.Root show={Boolean(photo)} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto p-6">
          <div className="flex min-h-full items-center justify-center">
            {photo ? (
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 translate-y-4"
                enterTo="opacity-100 translate-y-0"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-4"
              >
                <Dialog.Panel className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/20 bg-black/60 p-4 shadow-2xl backdrop-blur">
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-white/80 hover:bg-white/10"
                  >
                    Close
                  </button>
                  <Image
                    src={`https://imagedelivery.net/${photo.cf_image_id}/public`}
                    alt={photo.alt ?? "Selected photo"}
                    width={photo.width}
                    height={photo.height}
                    className="h-full w-full rounded-lg object-contain"
                    priority
                  />
                  {photo.alt ? (
                    <p className="mt-4 text-center text-sm text-neutral-300">{photo.alt}</p>
                  ) : null}
                </Dialog.Panel>
              </Transition.Child>
            ) : null}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

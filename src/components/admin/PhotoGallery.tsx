'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

interface Photo {
  id: string;
  blobUrl: string;
  uploadedAt?: Date;
}

interface PhotoGalleryProps {
  photos: Photo[];
  maxPreview?: number;
}

export function PhotoGallery({ photos, maxPreview = 4 }: PhotoGalleryProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="rounded-lg border border-brand-graphite/50 bg-brand-graphite/20 p-4 text-center">
        <p className="text-body-sm text-brand-silver">No photos uploaded</p>
      </div>
    );
  }

  const visiblePhotos = photos.slice(0, maxPreview);
  const remainingCount = Math.max(0, photos.length - maxPreview);

  return (
    <>
      <div className="grid grid-cols-4 gap-2">
        {visiblePhotos.map((photo, idx) => (
          <button
            key={photo.id}
            onClick={() => {
              setIndex(idx);
              setOpen(true);
            }}
            className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img
              src={photo.blobUrl}
              alt={`Wheel photo ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors" />
          </button>
        ))}

        {remainingCount > 0 && (
          <button
            onClick={() => {
              setIndex(maxPreview);
              setOpen(true);
            }}
            className="relative aspect-square rounded-lg overflow-hidden bg-brand-graphite flex items-center justify-center hover:bg-brand-graphite/80 transition-colors"
          >
            <img
              src={photos[maxPreview]?.blobUrl}
              alt="More photos"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="text-white font-bold text-lg">+{remainingCount}</span>
            </div>
          </button>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={photos.map((photo) => ({
          src: photo.blobUrl,
          alt: `Photo`,
        }))}
        index={index}
        on={{
          view: ({ index: idx }) => setIndex(idx),
        }}
      />
    </>
  );
}

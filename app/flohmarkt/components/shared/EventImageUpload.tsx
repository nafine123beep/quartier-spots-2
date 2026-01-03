"use client";

import { useState, useRef, useCallback } from "react";
import { EventImage } from "../../types";
import {
  uploadEventImage,
  deleteEventImage,
  setEventCoverImage,
  getPublicImageUrl,
  validateImageFile,
  MAX_IMAGES_PER_EVENT,
} from "../../lib/imageUpload";

interface EventImageUploadProps {
  eventId: string;
  images: EventImage[];
  onImagesChange: (images: EventImage[]) => void;
  disabled?: boolean;
}

export function EventImageUpload({
  eventId,
  images,
  onImagesChange,
  disabled = false,
}: EventImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < MAX_IMAGES_PER_EVENT;

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || disabled) return;

      setError(null);
      setUploading(true);

      const filesToUpload = Array.from(files).slice(
        0,
        MAX_IMAGES_PER_EVENT - images.length
      );

      const newImages: EventImage[] = [];

      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const validation = validateImageFile(file);

        if (!validation.valid) {
          setError(validation.error || "Ungültige Datei");
          continue;
        }

        const position = images.length + newImages.length;
        const isCover = images.length === 0 && newImages.length === 0;

        const result = await uploadEventImage(eventId, file, position, isCover);

        if (result.success && result.image) {
          newImages.push(result.image);
        } else {
          setError(result.error || "Fehler beim Hochladen");
        }
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }

      setUploading(false);
    },
    [eventId, images, onImagesChange, disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      if (!canAddMore || disabled) return;

      handleFileSelect(e.dataTransfer.files);
    },
    [canAddMore, disabled, handleFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (canAddMore && !disabled) {
        setDragOver(true);
      }
    },
    [canAddMore, disabled]
  );

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleDeleteImage = async (imageId: string) => {
    if (disabled) return;

    const result = await deleteEventImage(imageId);

    if (result.success) {
      const updatedImages = images.filter((img) => img.id !== imageId);

      // If we deleted the cover image, set the first remaining image as cover
      const deletedImage = images.find((img) => img.id === imageId);
      if (deletedImage?.is_cover && updatedImages.length > 0) {
        await setEventCoverImage(eventId, updatedImages[0].id);
        updatedImages[0] = { ...updatedImages[0], is_cover: true };
      }

      onImagesChange(updatedImages);
    } else {
      setError(result.error || "Fehler beim Löschen");
    }
  };

  const handleSetCover = async (imageId: string) => {
    if (disabled) return;

    const result = await setEventCoverImage(eventId, imageId);

    if (result.success) {
      const updatedImages = images.map((img) => ({
        ...img,
        is_cover: img.id === imageId,
      }));
      onImagesChange(updatedImages);
    } else {
      setError(result.error || "Fehler beim Setzen des Titelbildes");
    }
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <label className="block mb-2 font-bold text-gray-700 text-sm">
        Event-Fotos (optional)
      </label>
      <p className="text-xs text-gray-600 mb-3">
        Lade bis zu {MAX_IMAGES_PER_EVENT} Fotos hoch (max. 5MB pro Bild). Das
        erste Bild wird als Titelbild verwendet.
      </p>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Drop Zone */}
      {canAddMore && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            mb-3 p-6 border-2 border-dashed rounded-lg text-center cursor-pointer
            transition-colors
            ${
              dragOver
                ? "border-[#003366] bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }
            ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={disabled || uploading}
            className="hidden"
          />

          {uploading ? (
            <div className="text-gray-600">
              <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-[#003366] rounded-full animate-spin mb-2"></div>
              <p>Wird hochgeladen...</p>
            </div>
          ) : (
            <div className="text-gray-600">
              <svg
                className="w-10 h-10 mx-auto mb-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm">
                Fotos hier ablegen oder klicken zum Hochladen
              </p>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG, WebP (max. 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={getPublicImageUrl(image.storage_path)}
                alt={image.filename}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {image.is_cover && (
                <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-medium">
                  Titel
                </div>
              )}

              {/* Hover overlay with actions */}
              {!disabled && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Set as cover button */}
                  {!image.is_cover && (
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className="p-1.5 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-300 transition-colors"
                      title="Als Titelbild setzen"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Löschen"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image count indicator */}
      <p className="text-xs text-gray-500 mt-2">
        {images.length} von {MAX_IMAGES_PER_EVENT} Fotos
      </p>
    </div>
  );
}

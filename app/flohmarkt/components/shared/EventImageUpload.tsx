"use client";

import { useState, useRef, useCallback } from "react";
import { EventImage } from "../../types";
import {
  uploadEventImage,
  deleteEventImage,
  getPublicImageUrl,
  validateImageFile,
  updateImagePositions,
  MAX_IMAGES_PER_EVENT,
} from "../../lib/imageUpload";
import { ImageCropModal } from "./ImageCropModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Crop, X, GripVertical } from "lucide-react";

interface EventImageUploadProps {
  eventId: string;
  images: EventImage[];
  onImagesChange: (images: EventImage[]) => void;
  disabled?: boolean;
}

interface SortableImageThumbnailProps {
  image: EventImage;
  isFirst: boolean;
  disabled: boolean;
  onCrop: () => void;
  onDelete: () => void;
}

function SortableImageThumbnail({
  image,
  isFirst,
  disabled,
  onCrop,
  onDelete,
}: SortableImageThumbnailProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 ${
        isFirst ? "border-yellow-400" : "border-gray-200"
      } ${isDragging ? "opacity-50 z-50" : ""}`}
    >
      <img
        src={getPublicImageUrl(image.storage_path)}
        alt={image.filename}
        className="w-full h-full object-cover"
      />

      {/* Cover badge */}
      {isFirst && (
        <div className="absolute bottom-1 left-1 bg-yellow-400 text-yellow-900 text-xs px-1.5 py-0.5 rounded font-medium">
          Titel
        </div>
      )}

      {/* Always-visible action buttons */}
      {!disabled && (
        <div className="absolute top-1 right-1 flex gap-1">
          {/* Drag handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors cursor-grab active:cursor-grabbing touch-none"
            title="Verschieben"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Crop button */}
          <button
            type="button"
            onClick={onCrop}
            className="p-1 bg-black/60 text-white rounded hover:bg-black/80 transition-colors"
            title="Zuschneiden"
          >
            <Crop className="w-4 h-4" />
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={onDelete}
            className="p-1 bg-black/60 text-white rounded hover:bg-red-600 transition-colors"
            title="Löschen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
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
  const [cropModalImage, setCropModalImage] = useState<{
    url: string;
    imageId: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < MAX_IMAGES_PER_EVENT;

  // Sort images by position for display
  const sortedImages = [...images].sort((a, b) => a.position - b.position);

  // DnD sensors with pointer and keyboard support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedImages.findIndex((img) => img.id === active.id);
      const newIndex = sortedImages.findIndex((img) => img.id === over.id);

      const reorderedImages = arrayMove(sortedImages, oldIndex, newIndex);

      // Update positions and is_cover flag (first image is always cover)
      const updatedImages = reorderedImages.map((img, index) => ({
        ...img,
        position: index,
        is_cover: index === 0,
      }));

      // Optimistically update UI
      onImagesChange(updatedImages);

      // Persist to database
      const result = await updateImagePositions(
        updatedImages.map((img) => ({ id: img.id, position: img.position }))
      );

      if (!result.success) {
        setError(result.error || "Fehler beim Speichern der Reihenfolge");
        // Revert on error
        onImagesChange(images);
      }
    }
  };

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

    const { deleteEventImage: deleteImage } = await import("../../lib/imageUpload");
    const result = await deleteImage(imageId);

    if (result.success) {
      const updatedImages = images.filter((img) => img.id !== imageId);

      // Re-calculate positions and set first as cover
      const reorderedImages = updatedImages
        .sort((a, b) => a.position - b.position)
        .map((img, index) => ({
          ...img,
          position: index,
          is_cover: index === 0,
        }));

      onImagesChange(reorderedImages);

      // Persist position updates if there are remaining images
      if (reorderedImages.length > 0) {
        await updateImagePositions(
          reorderedImages.map((img) => ({ id: img.id, position: img.position }))
        );
      }
    } else {
      setError(result.error || "Fehler beim Löschen");
    }
  };

  const handleOpenCropModal = (image: EventImage) => {
    if (disabled) return;
    setCropModalImage({
      url: getPublicImageUrl(image.storage_path),
      imageId: image.id,
    });
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    if (!cropModalImage) return;

    setUploading(true);
    setCropModalImage(null);

    try {
      // Delete the old image
      await deleteEventImage(cropModalImage.imageId);

      // Upload the cropped image
      const file = new File([croppedBlob], "cropped-image.jpg", {
        type: "image/jpeg",
      });

      const imageToReplace = images.find((img) => img.id === cropModalImage.imageId);
      const wasCover = imageToReplace?.is_cover || false;
      const position = imageToReplace?.position || images.length;

      const result = await uploadEventImage(eventId, file, position, wasCover);

      if (result.success && result.image) {
        const updatedImages = images.map((img) =>
          img.id === cropModalImage.imageId ? result.image! : img
        );
        onImagesChange(updatedImages);
      } else {
        setError(result.error || "Fehler beim Hochladen des zugeschnittenen Bildes");
      }
    } catch (error) {
      console.error("Error handling cropped image:", error);
      setError("Fehler beim Verarbeiten des Bildes");
    } finally {
      setUploading(false);
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

      {/* Image Thumbnails with Drag-to-Reorder */}
      {sortedImages.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedImages.map((img) => img.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {sortedImages.map((image, index) => (
                <SortableImageThumbnail
                  key={image.id}
                  image={image}
                  isFirst={index === 0}
                  disabled={disabled}
                  onCrop={() => handleOpenCropModal(image)}
                  onDelete={() => handleDeleteImage(image.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Reorder hint */}
      {sortedImages.length > 1 && !disabled && (
        <p className="text-xs text-gray-500 mt-2">
          ↔ Verschieben, um die Reihenfolge zu ändern. Das erste Bild ist das
          Titelbild.
        </p>
      )}

      {/* Image count indicator */}
      <p className="text-xs text-gray-500 mt-2">
        {images.length} von {MAX_IMAGES_PER_EVENT} Fotos
      </p>

      {/* Crop Modal */}
      {cropModalImage && (
        <ImageCropModal
          imageUrl={cropModalImage.url}
          onComplete={handleCropComplete}
          onCancel={() => setCropModalImage(null)}
          aspectRatio={16 / 9}
        />
      )}
    </div>
  );
}

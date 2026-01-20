"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";

interface ImageCropModalProps {
  imageUrl: string;
  onComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export function ImageCropModal({
  imageUrl,
  onComplete,
  onCancel,
  aspectRatio = 16 / 9, // Default to banner aspect ratio
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = async (): Promise<Blob | null> => {
    if (!croppedAreaPixels) return null;

    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageUrl;
      image.crossOrigin = "anonymous";

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Set canvas size to the cropped area
        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        // Draw the cropped image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      };

      image.onerror = () => {
        reject(new Error("Failed to load image"));
      };
    });
  };

  const handleSave = async () => {
    setProcessing(true);
    try {
      const croppedBlob = await createCroppedImage();
      if (croppedBlob) {
        onComplete(croppedBlob);
      }
    } catch (error) {
      console.error("Error cropping image:", error);
      alert("Fehler beim Zuschneiden des Bildes");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between">
        <h3 className="text-white text-lg font-bold m-0">Bild zuschneiden</h3>
        <button
          onClick={onCancel}
          className="text-white hover:text-gray-300 text-2xl"
          disabled={processing}
        >
          &times;
        </button>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Controls */}
      <div className="bg-gray-900 px-4 py-4">
        {/* Zoom Slider */}
        <div className="max-w-md mx-auto mb-4">
          <label className="text-white text-sm block mb-2">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
            disabled={processing}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            disabled={processing}
            className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={processing}
            className="px-6 py-2 bg-[#003366] text-white rounded hover:bg-[#002244] disabled:opacity-50 font-bold"
          >
            {processing ? "Wird verarbeitet..." : "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}

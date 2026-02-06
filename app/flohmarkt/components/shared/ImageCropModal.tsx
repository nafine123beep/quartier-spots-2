"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Area } from "react-easy-crop";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Check,
  X,
} from "lucide-react";

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
  aspectRatio = 16 / 9,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleFlipHorizontal = () => {
    setFlipHorizontal((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipVertical((prev) => !prev);
  };

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

        // Calculate dimensions accounting for rotation
        const isRotated90or270 = rotation === 90 || rotation === 270;
        const outputWidth = isRotated90or270
          ? croppedAreaPixels.height
          : croppedAreaPixels.width;
        const outputHeight = isRotated90or270
          ? croppedAreaPixels.width
          : croppedAreaPixels.height;

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Move to center of canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Apply rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Apply flips
        const scaleX = flipHorizontal ? -1 : 1;
        const scaleY = flipVertical ? -1 : 1;
        ctx.scale(scaleX, scaleY);

        // Calculate draw position (centered)
        const drawWidth = croppedAreaPixels.width;
        const drawHeight = croppedAreaPixels.height;

        // Draw the cropped and transformed image
        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
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

  // Calculate CSS transform for preview
  const getTransform = () => {
    const transforms: string[] = [];
    if (flipHorizontal) transforms.push("scaleX(-1)");
    if (flipVertical) transforms.push("scaleY(-1)");
    return transforms.join(" ");
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header with toolbar */}
      <div className="bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <h3 className="text-white text-lg font-bold m-0">Bild bearbeiten</h3>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Rotate Left */}
          <button
            type="button"
            onClick={handleRotateLeft}
            disabled={processing}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Nach links drehen"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Rotate Right */}
          <button
            type="button"
            onClick={handleRotateRight}
            disabled={processing}
            className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Nach rechts drehen"
          >
            <RotateCw className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Flip Horizontal */}
          <button
            type="button"
            onClick={handleFlipHorizontal}
            disabled={processing}
            className={`p-2 rounded transition-colors disabled:opacity-50 ${
              flipHorizontal
                ? "text-white bg-gray-700"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            title="Horizontal spiegeln"
          >
            <FlipHorizontal className="w-5 h-5" />
          </button>

          {/* Flip Vertical */}
          <button
            type="button"
            onClick={handleFlipVertical}
            disabled={processing}
            className={`p-2 rounded transition-colors disabled:opacity-50 ${
              flipVertical
                ? "text-white bg-gray-700"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`}
            title="Vertikal spiegeln"
          >
            <FlipVertical className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Crop indicator */}
          <div className="p-2 text-[#86efac]" title="Zuschneiden aktiv">
            <Crop className="w-5 h-5" />
          </div>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={processing}
            className="p-2 text-[#86efac] hover:text-white hover:bg-green-600 rounded transition-colors disabled:opacity-50"
            title="Speichern"
          >
            <Check className="w-5 h-5" />
          </button>

          {/* Cancel button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="p-2 text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors disabled:opacity-50"
            title="Abbrechen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Cropper Area */}
      <div className="flex-1 relative">
        <div
          style={{
            transform: getTransform(),
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="bg-gray-900 px-4 py-4 border-t border-gray-700">
        {/* Zoom Slider */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-white text-sm w-12">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#003366]"
              disabled={processing}
            />
            <span className="text-white text-sm w-10 text-right">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Processing indicator */}
        {processing && (
          <div className="flex items-center justify-center gap-2 mt-3 text-white">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
            <span>Wird verarbeitet...</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/client";
import { EventImage } from "../types";

const BUCKET_NAME = "event-images";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES_PER_EVENT = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  success: boolean;
  image?: EventImage;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

/**
 * Validates a file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Nur JPG, PNG und WebP Dateien sind erlaubt.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "Die Datei ist zu groß. Maximal 5MB erlaubt.",
    };
  }

  return { valid: true };
}

/**
 * Uploads an image to Supabase Storage and creates a database record
 */
export async function uploadEventImage(
  eventId: string,
  file: File,
  position: number = 0,
  isCover: boolean = false
): Promise<UploadResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const supabase = createClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${eventId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return {
      success: false,
      error: "Fehler beim Hochladen des Bildes.",
    };
  }

  // Create database record
  const { data: imageRecord, error: dbError } = await supabase
    .from("event_images")
    .insert({
      event_id: eventId,
      storage_path: fileName,
      filename: file.name,
      position,
      is_cover: isCover,
    })
    .select()
    .single();

  if (dbError) {
    console.error("Database error:", dbError);
    // Try to clean up the uploaded file
    await supabase.storage.from(BUCKET_NAME).remove([fileName]);
    return {
      success: false,
      error: "Fehler beim Speichern der Bilddaten.",
    };
  }

  return {
    success: true,
    image: imageRecord as EventImage,
  };
}

/**
 * Deletes an image from storage and database
 */
export async function deleteEventImage(imageId: string): Promise<DeleteResult> {
  const supabase = createClient();

  // First get the image record to know the storage path
  const { data: image, error: fetchError } = await supabase
    .from("event_images")
    .select("storage_path")
    .eq("id", imageId)
    .single();

  if (fetchError || !image) {
    return {
      success: false,
      error: "Bild nicht gefunden.",
    };
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([image.storage_path]);

  if (storageError) {
    console.error("Storage delete error:", storageError);
    // Continue anyway to delete database record
  }

  // Delete database record
  const { error: dbError } = await supabase
    .from("event_images")
    .delete()
    .eq("id", imageId);

  if (dbError) {
    return {
      success: false,
      error: "Fehler beim Löschen des Bildes.",
    };
  }

  return { success: true };
}

/**
 * Sets an image as the cover image for an event
 */
export async function setEventCoverImage(
  eventId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // First, unset all other cover images for this event
  const { error: unsetError } = await supabase
    .from("event_images")
    .update({ is_cover: false })
    .eq("event_id", eventId);

  if (unsetError) {
    return {
      success: false,
      error: "Fehler beim Aktualisieren der Bilder.",
    };
  }

  // Set the new cover image
  const { error: setError } = await supabase
    .from("event_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  if (setError) {
    return {
      success: false,
      error: "Fehler beim Setzen des Titelbildes.",
    };
  }

  return { success: true };
}

/**
 * Gets the public URL for an image
 */
export function getPublicImageUrl(storagePath: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);
  return data.publicUrl;
}

/**
 * Loads all images for an event
 */
export async function loadEventImages(eventId: string): Promise<EventImage[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("event_images")
    .select("*")
    .eq("event_id", eventId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error loading event images:", error);
    return [];
  }

  return data as EventImage[];
}

/**
 * Updates the positions of images (for reordering)
 */
export async function updateImagePositions(
  imagePositions: { id: string; position: number }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // Update each image position
  for (const { id, position } of imagePositions) {
    const { error } = await supabase
      .from("event_images")
      .update({ position })
      .eq("id", id);

    if (error) {
      return {
        success: false,
        error: "Fehler beim Aktualisieren der Reihenfolge.",
      };
    }
  }

  return { success: true };
}

/**
 * Checks if an event can have more images
 */
export async function canAddMoreImages(eventId: string): Promise<boolean> {
  const supabase = createClient();

  const { count, error } = await supabase
    .from("event_images")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) {
    return false;
  }

  return (count ?? 0) < MAX_IMAGES_PER_EVENT;
}

export { MAX_IMAGES_PER_EVENT, MAX_FILE_SIZE, ALLOWED_TYPES };

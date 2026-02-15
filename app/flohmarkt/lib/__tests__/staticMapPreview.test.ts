/**
 * Tests for Static Map Preview utilities
 */

import { describe, it, expect } from "@jest/globals";
import { getStaticMapUrl, getEventPreviewImage } from "../staticMapPreview";
import { TenantEvent } from "../../types";

describe("staticMapPreview", () => {
  describe("getStaticMapUrl", () => {
    it("should generate SVG data URI with default parameters", () => {
      const url = getStaticMapUrl(52.520008, 13.404954);
      expect(url).toMatch(/^data:image\/svg\+xml,/);
      expect(url).toContain("52.5200"); // Formatted latitude
      expect(url).toContain("13.4050"); // Formatted longitude
      expect(url).toContain("600"); // Width
      expect(url).toContain("400"); // Height
      expect(url).toContain("Kartenvorschau"); // German label
    });

    it("should generate SVG data URI with custom dimensions", () => {
      const url = getStaticMapUrl(48.8566, 2.3522, 800, 600, 12);
      expect(url).toMatch(/^data:image\/svg\+xml,/);
      expect(url).toContain("48.8566"); // Formatted latitude
      expect(url).toContain("2.3522"); // Formatted longitude
      expect(url).toContain("800"); // Custom width
      expect(url).toContain("600"); // Custom height
    });

    it("should include location pin and grid pattern in SVG", () => {
      const url = getStaticMapUrl(52.520008, 13.404954);
      const decoded = decodeURIComponent(url.replace('data:image/svg+xml,', ''));
      expect(decoded).toContain("<svg");
      expect(decoded).toContain("path"); // Location pin
      expect(decoded).toContain("pattern"); // Grid pattern
      expect(decoded).toContain("linearGradient"); // Background gradient
    });
  });

  describe("getEventPreviewImage", () => {
    const mockEventBase: TenantEvent = {
      id: "test-event-id",
      tenant_id: "test-tenant-id",
      title: "Test Event",
      slug: "test-event",
      status: "active",
      created_at: "2024-01-01T00:00:00Z",
    };

    it("should return 'uploaded' type when event has images", () => {
      const event: TenantEvent = {
        ...mockEventBase,
        images: [
          {
            id: "img-1",
            event_id: "test-event-id",
            storage_path: "test/path.jpg",
            filename: "image.jpg",
            position: 0,
            is_cover: true,
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      };

      const result = getEventPreviewImage(event);
      expect(result.type).toBe("uploaded");
      expect(result.alt).toBe("Bild für Test Event");
      expect(result.url).toBeNull(); // URL generated in component
    });

    it("should return 'map' type when event has no images but has coordinates", () => {
      const event: TenantEvent = {
        ...mockEventBase,
        map_center_lat: 52.520008,
        map_center_lng: 13.404954,
      };

      const result = getEventPreviewImage(event);
      expect(result.type).toBe("map");
      expect(result.alt).toBe("Karten-Vorschau für Test Event");
      expect(result.url).toMatch(/^data:image\/svg\+xml,/); // SVG data URI
      expect(result.url).toContain("52.5200"); // Contains formatted coordinates
      expect(result.url).toContain("13.4050");
    });

    it("should return 'placeholder' type when event has no images and no coordinates", () => {
      const event: TenantEvent = {
        ...mockEventBase,
      };

      const result = getEventPreviewImage(event);
      expect(result.type).toBe("placeholder");
      expect(result.alt).toBe("Kein Bild verfügbar");
      expect(result.url).toBeNull();
    });

    it("should prioritize uploaded images over map preview", () => {
      const event: TenantEvent = {
        ...mockEventBase,
        map_center_lat: 52.520008,
        map_center_lng: 13.404954,
        images: [
          {
            id: "img-1",
            event_id: "test-event-id",
            storage_path: "test/path.jpg",
            filename: "image.jpg",
            position: 0,
            is_cover: false,
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
      };

      const result = getEventPreviewImage(event);
      expect(result.type).toBe("uploaded");
    });

    it("should use custom dimensions for map preview", () => {
      const event: TenantEvent = {
        ...mockEventBase,
        map_center_lat: 52.520008,
        map_center_lng: 13.404954,
      };

      const result = getEventPreviewImage(event, 800, 600);
      expect(result.url).toContain("width=\"800\""); // SVG width attribute
      expect(result.url).toContain("height=\"600\""); // SVG height attribute
    });

    it("should handle null coordinates gracefully", () => {
      const event: TenantEvent = {
        ...mockEventBase,
        map_center_lat: null as any,
        map_center_lng: undefined,
      };

      const result = getEventPreviewImage(event);
      expect(result.type).toBe("placeholder");
    });

    it("should handle partial coordinates gracefully", () => {
      const eventWithOnlyLat: TenantEvent = {
        ...mockEventBase,
        map_center_lat: 52.520008,
      };

      const resultLat = getEventPreviewImage(eventWithOnlyLat);
      expect(resultLat.type).toBe("placeholder");

      const eventWithOnlyLng: TenantEvent = {
        ...mockEventBase,
        map_center_lng: 13.404954,
      };

      const resultLng = getEventPreviewImage(eventWithOnlyLng);
      expect(resultLng.type).toBe("placeholder");
    });
  });
});

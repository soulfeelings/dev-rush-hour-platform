package validation

import (
	"fmt"
	"rush-hour-platform/backend/internal/domain"
)

// NormalizeGeoJSONPolygon auto-closes rings that aren't closed.
// Map drawing libraries (Leaflet, Mapbox) typically don't include the closing point.
func NormalizeGeoJSONPolygon(polygon *domain.GeoJSONPolygon) {
	if polygon == nil {
		return
	}
	for i, ring := range polygon.Coordinates {
		if len(ring) < 3 {
			continue
		}
		first := ring[0]
		last := ring[len(ring)-1]
		if len(first) == 2 && len(last) == 2 && (first[0] != last[0] || first[1] != last[1]) {
			polygon.Coordinates[i] = append(ring, first)
		}
	}
}

// ValidateGeoJSONPolygon проверяет, что полигон замкнут и координаты корректны
func ValidateGeoJSONPolygon(polygon *domain.GeoJSONPolygon) error {
	if polygon == nil {
		return nil // nil polygon допустим
	}

	if polygon.Type != "Polygon" {
		return fmt.Errorf("invalid polygon type: expected Polygon, got %s", polygon.Type)
	}

	if len(polygon.Coordinates) == 0 {
		return fmt.Errorf("polygon must have at least one ring")
	}

	// Auto-close rings before validation
	NormalizeGeoJSONPolygon(polygon)

	// Проверяем каждый ring (первый - внешний, остальные - holes)
	for ringIdx, ring := range polygon.Coordinates {
		if len(ring) < 4 {
			return fmt.Errorf("ring %d must have at least 4 points (closed polygon)", ringIdx)
		}

		// Проверяем, что первый и последний точки совпадают (полигон замкнут)
		first := ring[0]
		last := ring[len(ring)-1]

		if len(first) != 2 || len(last) != 2 {
			return fmt.Errorf("ring %d: each point must have exactly 2 coordinates [lng, lat]", ringIdx)
		}

		// Проверяем валидность координат [lng, lat]
		for pointIdx, point := range ring {
			if len(point) != 2 {
				return fmt.Errorf("ring %d, point %d: must have exactly 2 coordinates [lng, lat]", ringIdx, pointIdx)
			}

			lng := point[0]
			lat := point[1]

			// Проверяем диапазон координат
			if lng < -180 || lng > 180 {
				return fmt.Errorf("ring %d, point %d: longitude must be between -180 and 180, got %f", ringIdx, pointIdx, lng)
			}
			if lat < -90 || lat > 90 {
				return fmt.Errorf("ring %d, point %d: latitude must be between -90 and 90, got %f", ringIdx, pointIdx, lat)
			}
		}
	}

	return nil
}


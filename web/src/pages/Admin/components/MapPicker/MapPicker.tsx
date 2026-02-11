import { useEffect, useRef } from 'react'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './MapPicker.module.scss'

type MapPickerProps = {
  lat: string
  lng: string
  onCoordinatesChange: (lat: string, lng: string) => void
}

export function MapPicker({ lat, lng, onCoordinatesChange }: MapPickerProps) {
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [25.2048, 55.2708],
        zoom: 11,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
        }
      ).addTo(mapRef.current)

      mapRef.current.on('click', e => {
        const { lat, lng } = e.latlng
        onCoordinatesChange(lat.toFixed(6), lng.toFixed(6))
      })
    }

    const map = mapRef.current
    if (!map) return

    if (lat && lng) {
      const latNum = parseFloat(lat)
      const lngNum = parseFloat(lng)

      if (!isNaN(latNum) && !isNaN(lngNum)) {
        const coordinates: [number, number] = [latNum, lngNum]

        if (!markerRef.current) {
          markerRef.current = L.marker(coordinates, {
            icon: L.icon({
              iconUrl:
                'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl:
                'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            }),
            draggable: true,
          }).addTo(map)

          markerRef.current.on('dragend', e => {
            const pos = e.target.getLatLng()
            onCoordinatesChange(pos.lat.toFixed(6), pos.lng.toFixed(6))
          })
        } else {
          const currentPos = markerRef.current.getLatLng()
          if (
            Math.abs(currentPos.lat - latNum) > 0.0001 ||
            Math.abs(currentPos.lng - lngNum) > 0.0001
          ) {
            markerRef.current.setLatLng(coordinates)
            map.setView(coordinates, Math.max(map.getZoom(), 13))
          }
        }
      }
    } else {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }
  }, [lat, lng, onCoordinatesChange])

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div>
      <label className={styles.mapLabel}>Location (click on map to set coordinates)</label>
      <div ref={mapContainerRef} className={styles.map} />
    </div>
  )
}

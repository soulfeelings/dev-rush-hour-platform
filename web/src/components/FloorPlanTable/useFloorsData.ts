import { useMemo } from 'react'
import type { Lot } from '../../api'

interface FloorData {
  floor: number
  lots: Lot[]
}

export const useFloorsData = (lots: Lot[]): FloorData[] => {
  return useMemo(() => {
    const floorsMap = new Map<number, Lot[]>()

    lots.forEach(lot => {
      const floor = lot.floor ?? 0
      if (!floorsMap.has(floor)) {
        floorsMap.set(floor, [])
      }
      floorsMap.get(floor)!.push(lot)
    })

    const sortedFloors = Array.from(floorsMap.entries()).sort((a, b) => b[0] - a[0])

    return sortedFloors.map(([floor, floorLots]) => ({
      floor,
      lots: floorLots.sort((a, b) => {
        const aBedrooms = a.bedrooms ?? 0
        const bBedrooms = b.bedrooms ?? 0
        if (aBedrooms !== bBedrooms) return aBedrooms - bBedrooms
        const aArea = a.areaSqm ?? 0
        const bArea = b.areaSqm ?? 0
        return aArea - bArea
      }),
    }))
  }, [lots])
}

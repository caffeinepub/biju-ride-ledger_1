import type { DailyOdometer, FuelEntry } from "./useStore";

export interface FuelAllocation {
  date: string;
  fuelCost: number;
  costPerKm: number;
}

export function allocateFuelByDate(
  fuelEntries: FuelEntry[],
  odometers: DailyOdometer[],
  targetDate: string,
): number {
  if (fuelEntries.length === 0) return 0;
  const sorted = [...fuelEntries].sort((a, b) => a.odometerKm - b.odometerKm);
  const targetOdo = odometers.find((o) => o.date === targetDate);
  if (!targetOdo) {
    // Fallback: simple daily fuel cost from entries on that date
    return fuelEntries
      .filter((f) => f.date.startsWith(targetDate))
      .reduce((s, f) => s + f.cost, 0);
  }
  const targetMidOdo = (targetOdo.startKm + targetOdo.endKm) / 2;
  let allocatedCost = 0;
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const batchStart = current.odometerKm;
    const batchEnd = next ? next.odometerKm : current.odometerKm + 1000;
    const batchDistance = batchEnd - batchStart;
    if (batchDistance <= 0) continue;
    const costPerKm = current.cost / batchDistance;
    const dayDist = targetOdo.endKm - targetOdo.startKm;
    if (targetMidOdo >= batchStart && targetMidOdo < batchEnd) {
      allocatedCost += costPerKm * dayDist;
      break;
    }
  }
  if (allocatedCost === 0) {
    return fuelEntries
      .filter((f) => f.date.startsWith(targetDate))
      .reduce((s, f) => s + f.cost, 0);
  }
  return allocatedCost;
}

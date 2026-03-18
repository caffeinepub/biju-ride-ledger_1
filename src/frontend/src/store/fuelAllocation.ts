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

/**
 * Calculate average fuel cost per KM based on consecutive fill-up pairs.
 * Each pair: distance = nextOdometer - currentOdometer, cost = currentFuelCost
 */
export function getFuelEfficiencyPerKm(fuelEntries: FuelEntry[]): number {
  if (fuelEntries.length < 2) return 0;
  const sorted = [...fuelEntries].sort((a, b) => a.odometerKm - b.odometerKm);
  let totalCost = 0;
  let totalKm = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const dist = sorted[i + 1].odometerKm - sorted[i].odometerKm;
    if (dist > 0) {
      totalCost += sorted[i].cost;
      totalKm += dist;
    }
  }
  if (totalKm === 0) return 0;
  return totalCost / totalKm;
}

/**
 * Break down fuel cost between ride KM and dead KM portions.
 */
export function getFuelCostBreakdown(
  fuelEntries: FuelEntry[],
  rideKm: number,
  deadKm: number,
): { rideKmFuelCost: number; deadKmFuelCost: number } {
  const costPerKm = getFuelEfficiencyPerKm(fuelEntries);
  if (costPerKm === 0) {
    return { rideKmFuelCost: 0, deadKmFuelCost: 0 };
  }
  return {
    rideKmFuelCost: rideKm * costPerKm,
    deadKmFuelCost: deadKm * costPerKm,
  };
}

/**
 * Pure KM calculation utilities — used across Dashboard, History, and Reports.
 * Consistent formula everywhere:
 *   Run KM   = End KM − Start KM
 *   Ride KM  = Sum of ride distances
 *   Blank KM = Run KM − Ride KM (min 0)
 */

export function calcRunKm(startKm: number, endKm: number): number {
  return Math.max(0, endKm - startKm);
}

export function calcRideKm(rides: Array<{ distance?: number }>): number {
  return rides.reduce((sum, r) => sum + (r.distance || 0), 0);
}

export function calcBlankKm(runKm: number, rideKm: number): number {
  return Math.max(0, runKm - rideKm);
}

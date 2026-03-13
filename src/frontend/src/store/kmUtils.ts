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

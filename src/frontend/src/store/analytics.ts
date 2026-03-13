import type { Ride } from "./useStore";

export interface AreaStat {
  area: string;
  avgIncome: number;
  rideCount: number;
  totalIncome: number;
}

export interface HourStat {
  hour: number;
  avgIncome: number;
  rideCount: number;
  label: string;
}

export function getGoldmineAreas(rides: Ride[]): AreaStat[] {
  const areaMap = new Map<string, { total: number; count: number }>();
  for (const ride of rides) {
    if (!ride.pickupArea) continue;
    const existing = areaMap.get(ride.pickupArea) || { total: 0, count: 0 };
    areaMap.set(ride.pickupArea, {
      total: existing.total + ride.netIncome,
      count: existing.count + 1,
    });
  }
  const stats: AreaStat[] = Array.from(areaMap.entries()).map(
    ([area, { total, count }]) => ({
      area,
      avgIncome: count > 0 ? total / count : 0,
      rideCount: count,
      totalIncome: total,
    }),
  );
  return stats.sort((a, b) => b.avgIncome - a.avgIncome).slice(0, 3);
}

export function getPeakHours(rides: Ride[]): HourStat[] {
  const hourMap = new Map<number, { total: number; count: number }>();
  for (const ride of rides) {
    const hour = new Date(ride.datetime).getHours();
    const existing = hourMap.get(hour) || { total: 0, count: 0 };
    hourMap.set(hour, {
      total: existing.total + ride.netIncome,
      count: existing.count + 1,
    });
  }
  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:00 ${ampm}`;
  };
  const stats: HourStat[] = Array.from(hourMap.entries()).map(
    ([hour, { total, count }]) => ({
      hour,
      avgIncome: count > 0 ? total / count : 0,
      rideCount: count,
      label: formatHour(hour),
    }),
  );
  return stats.sort((a, b) => b.avgIncome - a.avgIncome).slice(0, 3);
}

export function getSmartRecommendations(rides: Ride[]): string[] {
  if (rides.length < 3) return ["Add more rides to get smart recommendations!"];
  const recs: string[] = [];
  const goldmineAreas = getGoldmineAreas(rides);
  if (goldmineAreas.length > 0) {
    recs.push(
      `🏆 Highest earnings from ${goldmineAreas[0].area} (avg ₹${goldmineAreas[0].avgIncome.toFixed(0)}/ride)`,
    );
  }
  const peakHours = getPeakHours(rides);
  if (peakHours.length > 0) {
    recs.push(
      `⏰ Peak earning time: ${peakHours[0].label} (avg ₹${peakHours[0].avgIncome.toFixed(0)}/ride)`,
    );
  }
  const platformMap = new Map<string, { total: number; count: number }>();
  for (const ride of rides) {
    const ex = platformMap.get(ride.platform) || { total: 0, count: 0 };
    platformMap.set(ride.platform, {
      total: ex.total + ride.netIncome,
      count: ex.count + 1,
    });
  }
  let bestPlatform = "";
  let bestAvg = 0;
  platformMap.forEach((val, key) => {
    const avg = val.count > 0 ? val.total / val.count : 0;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestPlatform = key;
    }
  });
  if (bestPlatform) {
    recs.push(
      `🚀 Best platform: ${bestPlatform} (avg ₹${bestAvg.toFixed(0)}/ride)`,
    );
  }
  return recs;
}

export function getChartData(
  rides: Ride[],
  fuelEntries: { date: string; cost: number }[],
  days: number,
) {
  const result: {
    date: string;
    income: number;
    fuel: number;
    rideCount: number;
  }[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    const dayRides = rides.filter((r) => r.datetime.startsWith(dateStr));
    const dayFuel = fuelEntries
      .filter((f) => f.date.startsWith(dateStr))
      .reduce((s, f) => s + f.cost, 0);
    result.push({
      date: label,
      income: dayRides.reduce((s, r) => s + r.netIncome, 0),
      fuel: dayFuel,
      rideCount: dayRides.length,
    });
  }
  return result;
}

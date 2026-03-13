# Biju Ride Ledger — Phase-2

## Current State
- Dashboard odometer auto-saves on blur with no visible confirmation
- Blank KM formula exists in ReportsPage but not consistently labeled in HistoryPage
- HistoryPage date headers show compressed single-line summary (no labeled Run KM / Blank KM rows)
- ReportsPage has recharts-based charts (Income Trend, Fuel Expense Trend, Ride Count) and Goldmine Areas in AnalyticsSection
- Export produces raw ride rows; missing summary columns (Date, Rides, Income, Fuel, Run KM, Blank KM, Net Profit)
- No true .xlsx export (currently .xls tab-separated)
- PLATFORMS constant in useStore.ts is correct and used consistently

## Requested Changes (Diff)

### Add
- Explicit "Save Odometer" button in HomePage odometer section, with sonner toast "Saved successfully"
- `src/frontend/src/store/kmUtils.ts` — shared utility: `calcRunKm`, `calcRideKm`, `calcBlankKm` functions
- `xlsx` npm package for true .xlsx export
- HistoryPage date header: labeled rows for Total Income, Total Rides, Ride KM, Run KM, Blank KM
- ReportsPage export: summary rows per period (Date, Rides, Income, Fuel, Run KM, Blank KM, Net Profit) in all export formats

### Modify
- HomePage.tsx: add Save button + toast; keep onBlur auto-save as secondary
- HistoryPage.tsx: enhanced date group header with 5 labeled stat rows
- ReportsPage.tsx: import kmUtils for consistent formula; fix export functions to include summary data; add .xlsx export via xlsx library
- package.json: add `xlsx` dependency

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/store/kmUtils.ts` with `calcRunKm(startKm, endKm)`, `calcRideKm(rides)`, `calcBlankKm(runKm, rideKm)` helpers
2. Update `src/frontend/package.json` to add `xlsx` dependency
3. Update `HomePage.tsx`: add "Save Odometer" button below odometer inputs; show sonner toast on save
4. Update `HistoryPage.tsx`: for each date group header show 5 labeled stat badges (Total Income, Total Rides, Ride KM, Run KM, Blank KM) — look up odometer session for the date to get Run KM / Blank KM
5. Update `ReportsPage.tsx`: use kmUtils for consistent calculations; fix exportCSV/exportExcel/exportPDF to include period-summary rows; implement real xlsx export using the xlsx library with all required columns

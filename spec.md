# Biju's RideBook

## Current State
- App is a mobile-first PWA for ride-hailing drivers
- Brand name: "Biju Ride Ledger" throughout
- Ride type: `{ id, platform, fare, commission, tips, distance, pickupArea, dropArea, datetime, netIncome }`
- AddRidePage: Payment Type field does not exist; tip calc = `CustomerPaid − (Fare − Commission)`
- Dashboard (HomePage): shows today stats, blank km from odometer; no Profit Analyzer or Best Platform/Area blocks
- Reports: SummaryGrid shows Income, Rides, Fuel, Run KM, Blank KM, Net Profit; no per-ride or per-km profit
- Settings: Platform Commission uses Accordion, all items expand/collapse independently
- No analytics for Best Platform or Best Area anywhere

## Requested Changes (Diff)

### Add
- `paymentType: 'cash' | 'online'` optional field to Ride type (legacy rides = undefined, treated as old data)
- Payment Type toggle (Cash/Online, default Cash) to AddRidePage before Customer Paid field
- Profit Analyzer block on Dashboard: Today's Profit, Profit per Ride, Profit per KM, Dead KM (= Blank KM value)
- Best Platform card on Dashboard: platform with highest avg income per ride among today's rides
- Best Area card on Dashboard: area with highest avg income per ride among today's rides
- Best Platform and Best Area analytics to Reports SummaryGrid / new analysis rows (per date range: today/week/month/daily tab)
- Profit per Ride, Profit per KM to Reports SummaryGrid in all tabs
- `manifest.json` / `index.html` title updated to "Biju's RideBook"
- About section in Settings footer updated to "Biju's RideBook"

### Modify
- App header title: "Biju Ride Ledger" → "Biju's RideBook" (in Header component or title prop passed from each page)
- SplashScreen app name text: update to "Biju's RideBook"
- Tip calculation logic in AddRidePage:
  - Cash (new rides with paymentType='cash'): `Tip = CustomerPaid − Fare`; `NetIncome = CustomerPaid − Commission`
  - Online (new rides with paymentType='online'): Tip = manually entered; `NetIncome = (Fare − Commission) + Tip`; Customer Paid field hidden for Online
  - Old rides (no paymentType): keep stored tip unchanged, do not recalculate
- Settings Platform Commission section: replace Accordion with select-one-at-a-time panel UI. A dropdown (Select) lets driver choose a platform; the config panel for that platform (commission type + value) appears below. Only one platform visible at a time. All saved commission values must be preserved.
- `document.title` / PWA name updated to "Biju's RideBook"

### Remove
- Nothing removed

## Implementation Plan

1. **useStore.ts**: Add optional `paymentType?: 'cash' | 'online'` to Ride interface. No storage key changes.

2. **AddRidePage.tsx**:
   - Add `paymentType` state (default 'cash')
   - Add Payment Type toggle (Cash/Online buttons) above Customer Paid field
   - Update tip calculation:
     - Cash: `Tip = customerPaid - fare` (not subtracting commission); `NetIncome = customerPaid - commission`
     - Online: Tip = manual input; `NetIncome = (fare - commission) + tips`; hide Customer Paid field
   - Include `paymentType` in saved ride data
   - Reset `paymentType` to 'cash' after save

3. **HomePage.tsx**:
   - Add Profit Analyzer card: Profit per Ride = NetProfit / rideCount, Profit per KM = NetProfit / runKm (or rideKm if no odometer), Dead KM = Blank KM value
   - Add Best Platform: from today's rides, find platform with highest avg netIncome per ride
   - Add Best Area: from today's rides, find pickup/drop area with highest avg netIncome per ride

4. **ReportsPage.tsx**:
   - Add Profit per Ride and Profit per KM to SummaryGrid (and the helper function)
   - Add Best Platform and Best Area analytics rows to each tab using rides in date range
   - For Daily tab, use selected date's rides; for Today/Week/Month tabs use their respective ride sets

5. **SettingsPage.tsx**:
   - Replace Accordion platform commission with a panel UI: Select dropdown to choose platform, config panel below (commission type + value)

6. **Branding** (multiple files):
   - `index.html`: update `<title>` to "Biju's RideBook"
   - `manifest.json` / `vite-env` / PWA config: update app name/short_name
   - `SplashScreen.tsx`: update app name text
   - `Header.tsx` or page title props: update "Biju Ride Ledger" references
   - SettingsPage footer: update About text

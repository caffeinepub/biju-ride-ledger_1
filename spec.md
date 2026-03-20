# Biju's RideBook — Final Polish (Version 29)

## Current State

Version 28 is deployed. The app is a mobile-first PWA for driver earnings tracking with:
- React + TypeScript frontend, Motoko backend
- Full shift management (start/end with odometer), ride entry, history, reports, analytics
- i18n system (English, Bengali, Hindi) in `i18n.ts` with keys used across components
- Hybrid storage: IndexedDB (offline) + Supabase placeholder (dormant)
- Settings page with language/currency/fuel dropdowns and theme/notification toggles
- Fuel entry modal with fuel type dropdown and fuel price field
- Navigation: swipe between tabs, back button with exit prompt on Dashboard
- Logo asset: `/assets/uploads/file_00000000154071faaeaf583d8d2945a9-1.png`

## Requested Changes (Diff)

### Add
- Proper navigation history stack so back button always goes to immediate previous screen
- New i18n keys for: Personal Run, Off Day labels in Shift Control, Fuel popup content, "Today" label, Smart Tips/Insights

### Modify
- **Splash screen**: Remove any circular/rounded clipping on logo, ensure perfect center alignment, balanced padding, subtle glow only
- **Exit button**: Use `window.close()` + history manipulation + `window.location.href = 'about:blank'` fallback to properly close PWA
- **Back navigation**: Maintain a navigation stack in app state; back button pops the stack; only Dashboard shows exit prompt
- **i18n completeness**: Replace ALL remaining hardcoded strings — Personal Run / Off Day in ShiftControl, Fuel modal labels (fuel type heading, price per litre label, add fuel button, history items), "Today" date label in History, all Smart Tips/Insights content, Analytics section labels
- **Dashboard typography**: Section headings (Profit Analyzer, Best Platform, Best Area, This Week, All Time Totals, Driver Comparison) → font-bold text-base/lg with stronger colors matching History page Shift KM brightness
- **Dashboard colors**: Blue, green, orange metric values — increase oklch lightness in dark mode; match the vibrant green used for Shift KM in History
- **Fuel Section in FuelEntryModal**: Restructure so Fuel Type dropdown and Price per Litre input are in one visually grouped card/container, stacked vertically, with no other fields between them; remove any duplicate/old price field
- **Settings language selector**: Remove country flags (🇧🇩 etc.), use text-only labels: "English (EN)", "বাংলা (BN)", "हिन्दी (HI)"
- **Settings toggles**: Theme, Notifications, Sound use Switch toggle components; Language, Currency, Fuel Type keep Select dropdowns — ensure visual consistency
- **Add Ride Net Income**: Increase green brightness, add `drop-shadow` or `text-shadow`-equivalent glow via Tailwind
- **History Shift KM label**: Replace hardcoded "Shift KM" string with i18n key `t('shiftKm')`
- **Smart Tips (Dashboard)**: Short punchy tips from i18n keys — 2-3 max, no hardcoded English
- **Smart Insights (Reports)**: Detailed analytics from i18n keys — no hardcoded English fallback

### Remove
- Duplicate/old fuel price input field that exists outside the unified fuel section
- Country flag emoji/characters from language selector in Settings

## Implementation Plan

1. **Navigation stack** — Add `navHistory` array to App state; every tab change pushes to stack; back button pops stack; Dashboard triggers exit prompt when stack is empty
2. **Exit button fix** — Replace current exit logic with: try `window.close()`, fallback to redirecting to blank or history go(-999)
3. **i18n audit** — Add missing keys to `i18n.ts` for all 3 languages: `shiftKm`, `personalRun`, `offDay`, `today`, `fuelType`, `pricePerLitre`, `addFuelEntry`, all Smart Tips keys, all Fuel modal labels
4. **Fuel modal restructure** — Combine FuelType Select + pricePerLitre Input inside a single `<div>` card, stacked, ensure no commission/other fields appear between them
5. **Settings cleanup** — Remove flags from language options; ensure Theme/Notifications/Sound use `<Switch>` components
6. **Dashboard typography** — Apply `font-bold` + `text-base` to all section headings; boost color values
7. **Splash screen** — Remove `rounded-*` classes from logo img, ensure `object-contain` centered, minimal subtle glow
8. **History Shift KM** — Replace hardcoded string with translation key
9. **Net income glow** — Add Tailwind filter/shadow class to net income display in AddRidePage
10. **Validate** — Run lint + typecheck + build; fix any errors; deploy only on clean pass

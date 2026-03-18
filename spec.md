# Biju's RideBook — Final Polish Phase (Version 27)

## Current State
Version 26 is deployed. The app is approximately 90–92% complete with functional shift management, ride tracking, analytics, export, and a partial i18n system. Known remaining issues: incomplete language translation coverage, old logo placeholder, smart tips showing same content in Dashboard and Reports, no swipe navigation, no back-button interception.

## Requested Changes (Diff)

### Add
- Logo: New PNG logo (`/assets/uploads/file_00000000154071faaeaf583d8d2945a9-1.png`) in SplashScreen, Header, and any branding areas
- Swipe navigation: left/right horizontal swipe gesture on main tab area to switch between tabs; must not interfere with vertical scroll
- Back button interception: on Dashboard show "Are you sure you want to exit?" confirmation; inside any other page navigate to previous screen using browser History API
- Smart Tips differentiation: Dashboard shows 2–3 short punchy tips; Reports shows detailed analytical insights (different content)
- Distance metric on Dashboard: at minimum one clear KM metric (Ride KM or Total KM) must remain visible

### Modify
- Logo: replace all occurrences of old logo with new PNG in SplashScreen (with fade-in/scale animation), Header, PWA manifest icon reference
- i18n: complete remaining untranslated labels — "Shift Active", "Shift KM", "Personal Run", "Off Day", all Smart Tips/suggestions, report insights (Best platform, Peak time), dynamic analytics content
- Greeting format: English="Hello {name}, Good Evening", Bengali="নমস্কার {name}, শুভ সন্ধ্যা", Hindi="नमस्ते {name}, शुभ संध्या" using translation keys for all parts
- Yellow popup consistency: both shift banners ("Shift Active since" and "Shift still active") must have identical visual style — bright yellowish-white text, glow effect, same background
- Dark mode color visibility: increase contrast/brightness for blue, green, orange metrics; ensure text and highlights are clearly visible without changing palette
- Sync animation: during Syncing state use same green tone as Synced state but animated (pulse/spin); not dull blue
- Settings: add dropdown UI for Language, Currency, Fuel Type selections (for future scalability); remove the Save button from Settings (auto-save is sufficient)
- Fuel modal: ensure fuel type dropdown (Petrol/Diesel/CNG/Electric) is functional, stored correctly, and affects calculations appropriately

### Remove
- Duplicate Smart Tips content shared between Dashboard and Reports (differentiate them)
- Save button from Settings page

## Implementation Plan
1. Replace logo asset references in `SplashScreen.tsx` and `Header.tsx` with the new PNG path; add fade-in + scale animation on splash
2. Add swipe gesture hook: track touchstart/touchmove/touchend; only trigger tab switch if horizontal delta > 50px AND horizontal > vertical (prevents scroll conflict)
3. Add back button handler using `window.addEventListener('popstate')` + `history.pushState`; Dashboard shows confirmation dialog, other pages navigate back
4. Update `i18n.ts`: add keys for Shift Active, Shift KM, Personal Run, Off Day, greeting time-of-day parts per language, smart tips (short dashboard versions + long report versions), sync states
5. Update Smart Tips: Dashboard analytics section shows max 3 short tips from a different key set; Reports analytics shows detailed insight paragraphs
6. Fix shift banner styling: unify both banners to identical Tailwind dark-mode classes
7. Fix sync button: use green animated pulse during syncing state
8. Settings: wrap Language, Currency, Fuel Type in Select dropdowns; remove Save button
9. Ensure at least one distance metric (Ride KM) remains visible on Dashboard
10. Validate, fix any TypeScript/lint errors, build

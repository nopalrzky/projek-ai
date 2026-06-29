# Debug Issue: Customer Outlet Nearby CamelCase Crash

## Summary
Create `docs/issue/customer_outlet_nearby_camel_case_debug_issue.md` as the debug reference for the next AI model. The issue should state that the crash is not caused by `weeklyHours` itself, but by a legacy field type mismatch: backend sends `todaySchedule` as a list while Flutter expects `Map<String, dynamic>?`.

## Key Findings
- Endpoint checked: `GET /api/mobile/customer/outlets/nearby`.
- Backend [OutletResource.php](</c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Resources/Outlet/OutletResource.php:72>) sends `todaySchedule => $status['todayHours']`.
- For closed outlets, `todayHours` is `[]`, so the response includes `todaySchedule: []`.
- Flutter [outlet_model.g.dart](</c:/Bimo/Project/wash_wallet/packages/wash_wallet_domain/lib/src/models/outlet_model.g.dart:63>) casts `todaySchedule` as `Map<String, dynamic>?`, causing: `type 'List<dynamic>' is not a subtype of type 'Map<String, dynamic>?'`.
- `OutletModel._normalizeOperationalStatus` already wraps scalar `operationalStatus` plus `todayHours`/`weeklyHours` into an object, so `weeklyHours.timeRanges` parsing is valid.
- CamelCase gap: [OutletController.php](</c:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Controllers/Api/OutletController.php:53>) still emits `meta.corrected_query`; target contract should use `correctedQuery`.

## Recommended Fix Scope
- Backend: keep `todayHours` and `weeklyHours` as canonical camelCase arrays.
- Backend: remove `todaySchedule` from customer outlet list/detail response, or keep it only as `null`/object `{ isOpen, openTime, closeTime }`; never send `[]`.
- Backend: rename `corrected_query` to `correctedQuery` in response meta.
- Flutter: harden `OutletModel._normalizeJson` so `todaySchedule` only becomes a map/null and ignores raw list values.
- Flutter: during transition, parse both `correctedQuery` and `corrected_query`, but prefer `correctedQuery`.

## Test Plan
- Add Dart model test for `OutletModel.fromJson` using the logged nearby response shape plus `todaySchedule: []`; it must not throw.
- Add Dart model test for open outlet with non-empty `todayHours`; `todaySchedule` should normalize to map if still needed by UI.
- Add backend feature/resource test ensuring customer outlet responses contain camelCase keys and no `todaySchedule: []`.
- Manual check: open customer outlet list with location enabled and closed outlet data; screen should load, not show “Gagal Memuat Outlet”.

## Assumptions
- Issue doc should be created under root `docs/issue/`.
- Filename: `customer_outlet_nearby_camel_case_debug_issue.md`.
- Snake_case status values like `closed_today` are enum values, not JSON keys, so they are acceptable unless product wants value casing changed too.

# Outlet Position Permission Update, Soft Delete, and Restore Fix

This document outlines the planned implementation to address the issue described in `docs/issue/outlet_position_permission_update_soft_delete_restore_issue.md`.

## User Review Required

- **Permission Sync via PositionService**: The proposed plan utilizes `PositionService::updatePermissions()` directly within `OutletService`. This ensures a single source of truth for permission syncing. Please confirm this is acceptable.
- **Route Validation Parameter Modification**: We will fix the route parameters fetched within `UpdatePositionRequest` and `StorePositionRequest` to match the actual route definition (`{outletId}` and `{positionId}`).

## Open Questions

- None at the moment. The issue description is highly detailed.

## Proposed Changes

### Form Requests

#### [MODIFY] [StorePositionRequest.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Outlet/Position/StorePositionRequest.php)
- Add unique validation to the `name` field.
- Scope the unique validation to the current `outlet_id` and ensure it ignores soft-deleted rows (`deleted_at` is null).
- Fetch the `$outletId` from `$this->route('outletId')`.

#### [MODIFY] [UpdatePositionRequest.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Http/Requests/Outlet/Position/UpdatePositionRequest.php)
- Correct the way `$positionId` is fetched: `$positionId = (int) $this->route('positionId');`.
- Fetch `$outletId = (int) $this->route('outletId');`.
- Scope the unique validation to the current `outlet_id` and ensure it ignores soft-deleted rows (`whereNull('deleted_at')`), while ignoring the currently edited position ID.

---

### Services

#### [MODIFY] [OutletService.php](file:///C:/Bimo/Project/wash_wallet/webapp/wash_wallet_be/app/Services/OutletService.php)
- Update `storePosition`:
  - Check if a position with the same normalized name exists in the outlet, including soft-deleted ones (`withTrashed()`).
  - If a soft-deleted position is found, `restore()` it instead of creating a new row, and update its details (`description`, `is_active`).
  - After creation or restoration, check if `permissions` are provided. If so, invoke `app(PositionService::class)->updatePermissions($position->id, $data['permissions']);`.
- Update `updatePosition`:
  - Fetch the position ensuring it belongs to the correct outlet: `$position = $this->position->where('id', $positionId)->where('outlet_id', $outletId)->firstOrFail();`.
  - Add authorization check if missing: `$this->authorizePositionAccess($position);`.
  - After saving the position updates, check for `permissions` in the array and invoke `app(PositionService::class)->updatePermissions($position->id, $data['permissions']);` to sync them.
- Update `destroyPosition`:
  - Ensure the position is fetched with the `outlet_id` scope: `$position = $this->position->where('id', $positionId)->where('outlet_id', $outletId)->firstOrFail();`.
  - Retain the current `delete()` call which correctly handles soft-deletion.

## Verification Plan

### Automated Tests
- Feature test for nested web update (same name, changed permissions).
- Feature test for creating a duplicate active position.
- Feature test for creating a position with the same name in a different outlet.
- Feature test for restoring a soft-deleted position upon creation.
- Feature test for nested outlet mismatch (update/delete position belonging to a different outlet).

### Manual Verification
1. Login as an owner.
2. Navigate to an outlet's position list.
3. Edit an existing position. Change only the permissions and save. Verify no "nama sudah digunakan" error appears and permissions are saved.
4. Delete a position. Verify it is removed from the UI (soft-deleted in DB).
5. Create a new position with the exact same name as the deleted one. Verify it restores successfully and permissions are saved.
6. Verify creating a duplicate active position name within the same outlet yields a validation error.

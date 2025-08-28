# Migration Guide: requestedMonths to requestedStartDate/requestedEndDate

## Overview
This migration updates the rental application system to use specific start and end dates instead of month selection. This provides more precise lease period information and better user experience.

## Changes Made

### 1. Database Schema Updates
- **File**: `server/models/Application.js`
- **Changes**: 
  - Removed `requestedMonths` field
  - Added `requestedStartDate` field (YYYY-MM-DD string)
  - Added `requestedEndDate` field (YYYY-MM-DD string)

### 2. Frontend Form Updates
- **File**: `client/src/pages/Application.js`
- **Changes**:
  - Replaced month dropdown with two date input fields
  - Added validation to ensure end date is after start date
  - Added automatic end date reset when start date changes
  - Updated form state and validation logic

### 3. Display Updates
- **Files Updated**:
  - `client/src/pages/Dashboard.js` - User dashboard
  - `client/src/pages/AdminDashboard.js` - Admin dashboard
  - `client/src/pages/ApplicationView.js` - Application detail view
- **Changes**: Updated all displays to show date ranges instead of month strings

### 4. Backend Route Updates
- **File**: `server/routes/application.js`
- **Changes**: Updated API responses and validation to use new date fields

## Migration Process

### Step 1: Run the Migration Script
```bash
cd server/scripts
node migrateRequestedMonths.js
```

The migration script will:
- Find all existing applications with `requestedMonths`
- Convert month strings (e.g., "January 2025") to date ranges
- Set start date to first day of the month
- Set end date to last day of the month
- Remove the old `requestedMonths` field
- Handle applications with empty or invalid month data

### Step 2: Verify Migration
After running the migration:
1. Check that all applications now have `requestedStartDate` and `requestedEndDate`
2. Verify that the old `requestedMonths` field has been removed
3. Test the new date input functionality in the application form

### Step 3: Update Existing Code (if needed)
If you have any custom code that references `requestedMonths`, update it to use the new date fields:

**Before:**
```javascript
const month = application.requestedMonths; // "January 2025"
```

**After:**
```javascript
const startDate = application.requestedStartDate; // "2025-01-01"
const endDate = application.requestedEndDate;     // "2025-01-31"
```

## Benefits of the Change

1. **More Precise**: Users can specify exact start and end dates
2. **Better UX**: Date pickers are more intuitive than month dropdowns
3. **Flexibility**: Supports leases that don't align with calendar months
4. **Consistency**: Aligns with the existing lease generation system
5. **Validation**: Built-in date validation prevents invalid date ranges

## Rollback Plan

If you need to rollback this change:

1. **Database**: Restore from backup taken before migration
2. **Code**: Revert to previous git commit
3. **Data**: Re-run the migration script in reverse (would need to be created)

## Testing Checklist

- [ ] New applications can be created with date inputs
- [ ] Date validation works correctly
- [ ] Existing applications display correctly after migration
- [ ] Admin dashboard shows new date format
- [ ] User dashboard shows new date format
- [ ] Application detail views show new date format
- [ ] Date formatting is consistent across all pages

## Notes

- The migration script handles edge cases and provides detailed logging
- All existing applications will be automatically converted
- The new date format is YYYY-MM-DD for consistency with the lease system
- Date inputs include validation to prevent end dates before start dates

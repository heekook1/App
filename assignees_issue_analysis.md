# Assignees Table Duplicate Key Error Analysis

## Issue Summary
The application is experiencing a duplicate key error when trying to add '김동욱' as an assignee. The error suggests that '김동욱' already exists in the database but is not visible in the UI.

## Root Cause Analysis

### 1. Missing Assignees Table
The main issue is that the `assignees` table doesn't exist in the database schema. The application code expects this table to exist:
- `src/utils/dataSync.ts` tries to load from `assignees` table (line 12)
- `src/App.tsx` tries to insert/update records in `assignees` table (lines 1991, 2021)

### 2. Soft Delete Implementation
The code implements soft delete using an `is_active` field:
- When loading assignees, only active ones are shown: `.filter((assignee: any) => assignee.is_active)` (dataSync.ts:32)
- When deleting, the code sets `is_active = false` instead of actually deleting (App.tsx:2021)

### 3. Why '김동욱' Might Not Show in UI
Even if '김동욱' exists in the database, it won't appear in the UI if:
1. The `is_active` field is set to `false`
2. The assignees table doesn't exist (causing the load to fail)
3. There's a database connection/permission issue

## Solution Steps

### Step 1: Create the Assignees Table
Run the `create_assignees_table.sql` script to:
1. Create the `assignees` table with proper structure
2. Import existing assignees from `work_orders` and `schedules` tables
3. Set up proper indexes and RLS policies

### Step 2: Check for Duplicate/Inactive Assignees
Run the `check_duplicate_assignees.sql` script to:
1. Verify if the assignees table exists
2. Check if '김동욱' exists and their active status
3. List all inactive assignees
4. Find discrepancies between tables

### Step 3: Fix the Duplicate Key Issue
Run the `fix_duplicate_assignee.sql` script to:
1. Reactivate '김동욱' if they exist but are inactive
2. Insert '김동욱' if they don't exist
3. Handle the duplicate key constraint properly

## Code Structure

### Database Schema
- **work_orders.assignee**: TEXT[] (array of assignee names)
- **schedules.assignee**: VARCHAR(255) (single assignee name)
- **assignees table** (needs to be created):
  - id: SERIAL PRIMARY KEY
  - name: VARCHAR(255) UNIQUE
  - is_active: BOOLEAN DEFAULT true
  - created_at: TIMESTAMP
  - updated_at: TIMESTAMP

### Data Flow
1. **Loading**: `loadAssigneesFromSupabase()` → filters by `is_active` → returns name array
2. **Adding**: User input → `handleAddAssignee()` → insert to DB → update local state
3. **Deleting**: Select assignee → `handleDeleteAssignee()` → set `is_active = false` → update local state

### UI Components
- Assignees are shown in a multi-select for work orders
- Fixed assignees list is maintained separately from personnel
- Both personnel names and fixed assignees are combined in the selection dropdown

## Recommendations

1. **Immediate Fix**: Run the SQL scripts in order:
   ```sql
   -- 1. Create the table
   create_assignees_table.sql
   
   -- 2. Check the current state
   check_duplicate_assignees.sql
   
   -- 3. Fix the duplicate issue
   fix_duplicate_assignee.sql
   ```

2. **Long-term Improvements**:
   - Add better error handling for duplicate key violations
   - Show inactive assignees in a separate section with option to reactivate
   - Add unique constraint handling in the UI before attempting insert
   - Consider using upsert (INSERT ... ON CONFLICT) instead of plain insert

3. **Data Integrity**:
   - Regularly sync assignees between tables
   - Add triggers to automatically populate assignees table when new names are added to work_orders or schedules
   - Consider centralizing assignee management in one place
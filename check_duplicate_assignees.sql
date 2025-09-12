-- Check for duplicate assignees issue

-- 1. Check if assignees table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'assignees'
) as assignees_table_exists;

-- 2. If the table exists, check for '김동욱' entry
SELECT * FROM assignees WHERE name = '김동욱';

-- 3. Check all assignees and their active status
SELECT name, is_active, created_at, updated_at 
FROM assignees 
ORDER BY name;

-- 4. Check for any soft-deleted (inactive) assignees
SELECT name, is_active, created_at, updated_at 
FROM assignees 
WHERE is_active = false
ORDER BY name;

-- 5. Check assignees from work_orders
SELECT DISTINCT unnest(assignee) as assignee_name
FROM work_orders
WHERE assignee IS NOT NULL AND array_length(assignee, 1) > 0
ORDER BY assignee_name;

-- 6. Check assignees from schedules
SELECT DISTINCT assignee as assignee_name
FROM schedules
WHERE assignee IS NOT NULL AND assignee != ''
ORDER BY assignee_name;

-- 7. Find assignees in work_orders/schedules but not in assignees table
WITH all_assignees AS (
  SELECT DISTINCT unnest(assignee) as name
  FROM work_orders
  WHERE assignee IS NOT NULL AND array_length(assignee, 1) > 0
  UNION
  SELECT DISTINCT assignee as name
  FROM schedules
  WHERE assignee IS NOT NULL AND assignee != ''
)
SELECT a.name 
FROM all_assignees a
LEFT JOIN assignees ass ON a.name = ass.name
WHERE ass.name IS NULL OR ass.is_active = false
ORDER BY a.name;
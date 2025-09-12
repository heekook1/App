-- Fix duplicate key issue for '김동욱'

-- 1. First check if the assignees table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'assignees'
  ) THEN
    RAISE NOTICE 'Assignees table does not exist. Please run create_assignees_table.sql first.';
    RETURN;
  END IF;
END $$;

-- 2. Check current status of '김동욱' in assignees table
SELECT 'Current status of 김동욱:' as info;
SELECT * FROM assignees WHERE name = '김동욱';

-- 3. If '김동욱' exists but is inactive, reactivate
UPDATE assignees 
SET is_active = true, 
    updated_at = TIMEZONE('utc'::text, NOW())
WHERE name = '김동욱' AND is_active = false;

-- 4. If '김동욱' doesn't exist, insert
INSERT INTO assignees (name, is_active)
VALUES ('김동욱', true)
ON CONFLICT (name) 
DO UPDATE SET 
  is_active = true,
  updated_at = TIMEZONE('utc'::text, NOW());

-- 5. Verify the fix
SELECT 'After fix - 김동욱 status:' as info;
SELECT * FROM assignees WHERE name = '김동욱';

-- 6. Show all active assignees
SELECT 'All active assignees:' as info;
SELECT name FROM assignees WHERE is_active = true ORDER BY name;
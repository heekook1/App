-- Create assignees table
CREATE TABLE IF NOT EXISTS assignees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for active assignees
CREATE INDEX idx_assignees_is_active ON assignees(is_active);
CREATE INDEX idx_assignees_name ON assignees(name);

-- Enable RLS
ALTER TABLE assignees ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Enable all access for authenticated users" ON assignees FOR ALL USING (true);

-- Insert existing assignees if they don't exist
-- This will help migrate existing data from work_orders table
INSERT INTO assignees (name, is_active)
SELECT DISTINCT unnest(assignee) as name, true
FROM work_orders
WHERE assignee IS NOT NULL AND array_length(assignee, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- Also insert assignees from schedules table
INSERT INTO assignees (name, is_active)
SELECT DISTINCT assignee as name, true
FROM schedules
WHERE assignee IS NOT NULL AND assignee != ''
ON CONFLICT (name) DO NOTHING;
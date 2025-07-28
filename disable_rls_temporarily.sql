-- RLS 일시적으로 비활성화 (테스트용)
-- 주의: 프로덕션에서는 반드시 다시 활성화해야 합니다!

ALTER TABLE personnel DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE equipment DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendances DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports DISABLE ROW LEVEL SECURITY;

-- 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('personnel', 'work_orders', 'schedules', 'announcements', 'equipment', 'attendances', 'daily_reports')
ORDER BY tablename;
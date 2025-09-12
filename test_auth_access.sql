-- 인증된 사용자로 테스트

-- 1. 현재 역할 확인
SELECT auth.role(), auth.uid();

-- 2. 각 테이블에서 SELECT 시도
SELECT COUNT(*) as personnel_count FROM personnel;
SELECT COUNT(*) as work_orders_count FROM work_orders;
SELECT COUNT(*) as schedules_count FROM schedules;
SELECT COUNT(*) as announcements_count FROM announcements;
SELECT COUNT(*) as equipment_count FROM equipment;
SELECT COUNT(*) as attendances_count FROM attendances;
SELECT COUNT(*) as daily_reports_count FROM daily_reports;

-- 3. 샘플 데이터가 있는지 확인
SELECT * FROM personnel LIMIT 5;
SELECT * FROM announcements LIMIT 5;
SELECT * FROM equipment LIMIT 5;
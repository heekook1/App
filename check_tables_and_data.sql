-- Supabase 테이블 및 데이터 확인 SQL

-- 1. 테이블 존재 여부 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. 각 테이블의 RLS 상태 확인
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. 현재 사용자 역할 확인
SELECT current_user, auth.role(), auth.uid();

-- 4. 테이블별 데이터 개수 확인 (RLS 무시)
-- RLS를 일시적으로 무시하고 실제 데이터가 있는지 확인
SET LOCAL ROLE postgres;

SELECT 'personnel' as table_name, COUNT(*) as count FROM personnel
UNION ALL
SELECT 'work_orders', COUNT(*) FROM work_orders
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules
UNION ALL
SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL
SELECT 'equipment', COUNT(*) FROM equipment
UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances
UNION ALL
SELECT 'daily_reports', COUNT(*) FROM daily_reports;

-- 5. 샘플 데이터 삽입 (personnel 테이블)
INSERT INTO personnel (name, position, field, phone, hire_date, certifications, access_history)
VALUES 
  ('홍길동', '팀장', '기계', '010-1234-5678', '2020-01-01', ARRAY['안전관리자', '기계정비기능사'], ARRAY['2024-01-01: 정비실 출입']),
  ('김철수', '대리', '전기', '010-2345-6789', '2021-03-15', ARRAY['전기기능사'], ARRAY['2024-01-02: 전기실 출입']),
  ('이영희', '사원', '제어', '010-3456-7890', '2022-06-01', ARRAY['PLC 프로그래밍'], ARRAY['2024-01-03: 제어실 출입'])
ON CONFLICT DO NOTHING;

-- 6. 샘플 데이터 삽입 (announcements 테이블)
INSERT INTO announcements (title, content, date, author, priority)
VALUES 
  ('정기 안전교육 안내', '2월 정기 안전교육이 2월 15일 오후 2시에 진행됩니다. 전 직원 필참 바랍니다.', CURRENT_DATE, '관리팀', 'important'),
  ('설비 점검 일정', '3월 정기 설비 점검이 예정되어 있습니다. 상세 일정은 추후 공지하겠습니다.', CURRENT_DATE, '정비팀', 'normal')
ON CONFLICT DO NOTHING;

-- 7. 샘플 데이터 삽입 (equipment 테이블)
INSERT INTO equipment (name, model, manufacturer, status, location, specifications)
VALUES 
  ('메인 컴프레서', 'XC-2000', '한국중공업', '정상', '기계실 A동', '{"capacity": "2000 CFM", "pressure": "8 bar"}'::jsonb),
  ('냉각탑 #1', 'CT-500', '냉각시스템즈', '정상', '옥상', '{"capacity": "500 RT", "type": "Cross Flow"}'::jsonb),
  ('변압기 #1', 'TR-1500', '전력기기', '정상', '전기실', '{"capacity": "1500 KVA", "voltage": "22.9KV/380V"}'::jsonb)
ON CONFLICT DO NOTHING;

-- 8. 정책이 올바르게 적용되었는지 다시 확인
SELECT pol.polname, pol.polcmd, pol.polroles, pol.polqual, pol.polwithcheck
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname IN ('personnel', 'work_orders', 'schedules', 'announcements', 'equipment', 'attendances', 'daily_reports')
ORDER BY cls.relname, pol.polname;
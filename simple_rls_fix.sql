-- 간단한 RLS 정책 수정 - 인증된 사용자 모두 접근 가능

-- 1. 모든 기존 정책 삭제
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('personnel', 'work_orders', 'schedules', 'announcements', 'equipment', 'attendances', 'daily_reports')
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. 각 테이블에 대해 간단한 정책 생성 (인증된 사용자는 모두 접근 가능)
-- personnel
CREATE POLICY "personnel_authenticated_access" ON personnel
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- work_orders
CREATE POLICY "work_orders_authenticated_access" ON work_orders
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- schedules
CREATE POLICY "schedules_authenticated_access" ON schedules
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- announcements
CREATE POLICY "announcements_authenticated_access" ON announcements
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- equipment
CREATE POLICY "equipment_authenticated_access" ON equipment
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- attendances
CREATE POLICY "attendances_authenticated_access" ON attendances
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- daily_reports
CREATE POLICY "daily_reports_authenticated_access" ON daily_reports
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. 현재 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('personnel', 'work_orders', 'schedules', 'announcements', 'equipment', 'attendances', 'daily_reports')
ORDER BY tablename, policyname;
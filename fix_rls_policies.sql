-- Supabase RLS 정책 수정 SQL
-- 기존 정책을 삭제하고 인증된 사용자만 접근할 수 있도록 다시 생성

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON personnel;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON work_orders;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON schedules;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON announcements;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON equipment;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON attendances;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON daily_reports;

-- 2. 인증된 사용자를 위한 새 정책 생성
-- personnel 테이블
CREATE POLICY "Enable read access for authenticated users" ON personnel 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON personnel 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON personnel 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON personnel 
  FOR DELETE USING (auth.role() = 'authenticated');

-- work_orders 테이블
CREATE POLICY "Enable read access for authenticated users" ON work_orders 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON work_orders 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON work_orders 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON work_orders 
  FOR DELETE USING (auth.role() = 'authenticated');

-- schedules 테이블
CREATE POLICY "Enable read access for authenticated users" ON schedules 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON schedules 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON schedules 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON schedules 
  FOR DELETE USING (auth.role() = 'authenticated');

-- announcements 테이블
CREATE POLICY "Enable read access for authenticated users" ON announcements 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON announcements 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON announcements 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON announcements 
  FOR DELETE USING (auth.role() = 'authenticated');

-- equipment 테이블
CREATE POLICY "Enable read access for authenticated users" ON equipment 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON equipment 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON equipment 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON equipment 
  FOR DELETE USING (auth.role() = 'authenticated');

-- attendances 테이블
CREATE POLICY "Enable read access for authenticated users" ON attendances 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON attendances 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON attendances 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON attendances 
  FOR DELETE USING (auth.role() = 'authenticated');

-- daily_reports 테이블
CREATE POLICY "Enable read access for authenticated users" ON daily_reports 
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert access for authenticated users" ON daily_reports 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update access for authenticated users" ON daily_reports 
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete access for authenticated users" ON daily_reports 
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. 테이블이 존재하는지 확인하고 권한 테스트
-- 인증된 사용자로 각 테이블에서 SELECT 쿼리 실행해보기
SELECT COUNT(*) FROM personnel;
SELECT COUNT(*) FROM work_orders;
SELECT COUNT(*) FROM schedules;
SELECT COUNT(*) FROM announcements;
SELECT COUNT(*) FROM equipment;
SELECT COUNT(*) FROM attendances;
SELECT COUNT(*) FROM daily_reports;
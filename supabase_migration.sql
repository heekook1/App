-- Supabase 데이터베이스 마이그레이션 SQL
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. 인력 관리 테이블
CREATE TABLE IF NOT EXISTS personnel (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  field VARCHAR(255),
  phone VARCHAR(50),
  hire_date DATE,
  certifications TEXT[],
  access_history TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. 작업 지시서 테이블
CREATE TABLE IF NOT EXISTS work_orders (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  equipment VARCHAR(255),
  equipment_name VARCHAR(255),
  description TEXT,
  request_date DATE,
  due_date DATE,
  work_result TEXT,
  status VARCHAR(50),
  assignee TEXT[],
  completion_note TEXT,
  attachments JSONB DEFAULT '[]',
  type TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. 일정 관리 테이블
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  schedule_number VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  date DATE,
  type VARCHAR(50),
  equipment VARCHAR(255),
  equipment_name VARCHAR(255),
  assignee VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. 공지사항 테이블
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  date DATE,
  author VARCHAR(255),
  priority VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. 설비 관리 테이블
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  status VARCHAR(50),
  location VARCHAR(255),
  specifications JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. 근태 관리 테이블
CREATE TABLE IF NOT EXISTS attendances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  personnel_id INTEGER REFERENCES personnel(id),
  personnel_name VARCHAR(255),
  date DATE,
  type VARCHAR(50),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. 업무일지 테이블
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  mechanical_today TEXT,
  mechanical_tomorrow TEXT,
  youngjin_mechanical_today TEXT,
  youngjin_mechanical_tomorrow TEXT,
  electrical_today TEXT,
  electrical_tomorrow TEXT,
  youngjin_electrical_today TEXT,
  youngjin_electrical_tomorrow TEXT,
  control_today TEXT,
  control_tomorrow TEXT,
  youngjin_control_today TEXT,
  youngjin_control_tomorrow TEXT,
  attendance_status TEXT,
  safety_slogan TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 인덱스 생성
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_due_date ON work_orders(due_date);
CREATE INDEX idx_schedules_date ON schedules(date);
CREATE INDEX idx_attendances_date ON attendances(date);
CREATE INDEX idx_attendances_personnel_id ON attendances(personnel_id);
CREATE INDEX idx_daily_reports_date ON daily_reports(date);

-- RLS (Row Level Security) 활성화
ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽고 쓸 수 있도록 정책 설정 (나중에 더 세밀하게 조정 가능)
CREATE POLICY "Enable all access for authenticated users" ON personnel FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON work_orders FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON schedules FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON announcements FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON equipment FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON attendances FOR ALL USING (true);
CREATE POLICY "Enable all access for authenticated users" ON daily_reports FOR ALL USING (true);